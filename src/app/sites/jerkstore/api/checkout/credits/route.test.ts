import { describe, it, expect, vi, beforeEach } from 'vitest';

// All mock objects must be declared with vi.hoisted to avoid TDZ errors
const mockStripe = vi.hoisted(() => ({
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  paymentIntents: {
    create: vi.fn(),
  },
}));

vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/db');

import { POST } from './route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { FIXTURES } from '@/lib/__mocks__/db';
import { CREDIT_PACKAGES } from '../../../constants';

// --- Helpers ---

const makeRequest = (body: object = {}) => ({
  json: vi.fn().mockResolvedValue(body),
} as unknown as Request);

// Real shape from bkd@bkd.com DB snapshot
const USER = FIXTURES.user;

describe('POST /api/checkout/credits (Jerkstore Credits Purchase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (auth.api.getSession as any).mockResolvedValue({ user: { id: USER.id } });
    (prisma.user.findUnique as any).mockResolvedValue(USER);
    (prisma.user.update as any).mockResolvedValue({ ...USER, credits: USER.credits + 50 });

    // Default: customer has NO default PM → triggers fallback
    mockStripe.customers.retrieve.mockResolvedValue({
      id: USER.stripeCustomerId,
      invoice_settings: { default_payment_method: null },
    });

    mockStripe.paymentIntents.create.mockResolvedValue({
      id: 'pi_fallback',
      client_secret: 'pi_fallback_secret',
      status: 'requires_payment_method',
    });
  });

  // --- Auth ---

  it('returns 401 when not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    expect(res.status).toBe(401);
  });

  it('returns 404 when user not found in DB', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    expect(res.status).toBe(404);
  });

  // --- Stripe Customer Creation ---

  it('creates a Stripe customer when user has no stripeCustomerId', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ ...USER, stripeCustomerId: null });
    mockStripe.customers.create.mockResolvedValue({ id: 'cus_new' });
    // After creating customer, the retrieve for default PM
    mockStripe.customers.retrieve.mockResolvedValue({
      id: 'cus_new',
      invoice_settings: { default_payment_method: null },
    });

    await POST(makeRequest({ packageId: 'pkg_basic' }));

    expect(mockStripe.customers.create).toHaveBeenCalledWith(expect.objectContaining({
      email: USER.email,
      name: USER.name,
      metadata: { userId: USER.id },
    }));
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: USER.id },
      data: { stripeCustomerId: 'cus_new' },
    }));
  });

  it('reuses existing Stripe customer when stripeCustomerId is set', async () => {
    await POST(makeRequest({ packageId: 'pkg_basic' }));
    expect(mockStripe.customers.create).not.toHaveBeenCalled();
  });

  // --- Auto-Charge (Happy Path) ---

  it('auto-charges and credits user immediately when default PM exists', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({
      id: USER.stripeCustomerId,
      invoice_settings: { default_payment_method: 'pm_saved_card' },
    });
    mockStripe.paymentIntents.create.mockResolvedValue({
      id: 'pi_auto',
      status: 'succeeded',
    });

    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    // Should credit the pkg_basic amount (50 credits)
    expect(json.creditsAdded).toBe(CREDIT_PACKAGES[0].credits);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: USER.id },
      data: { credits: { increment: CREDIT_PACKAGES[0].credits } },
    }));
  });

  it('auto-charge PI has correct metadata (source=immediate, type=credits_purchase)', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({
      id: USER.stripeCustomerId,
      invoice_settings: { default_payment_method: 'pm_saved_card' },
    });
    mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_auto', status: 'succeeded' });

    await POST(makeRequest({ packageId: 'pkg_basic' }));

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(expect.objectContaining({
      metadata: expect.objectContaining({
        type: 'credits_purchase',
        source: 'immediate',
        userId: USER.id,
        siteSlug: 'jerkstore',
      }),
    }));
  });

  // --- Auto-Charge Failure → Fallback ---

  it('falls back to PaymentIntent UI flow when auto-charge fails', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({
      id: USER.stripeCustomerId,
      invoice_settings: { default_payment_method: 'pm_saved_card' },
    });
    // First call (auto-charge) fails; second call (fallback) succeeds
    mockStripe.paymentIntents.create
      .mockRejectedValueOnce(new Error('card_declined'))
      .mockResolvedValueOnce({ client_secret: 'pi_fallback_secret', id: 'pi_fallback' });

    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.clientSecret).toBe('pi_fallback_secret');
    // Should NOT have credited the user
    const creditCalls = (prisma.user.update as any).mock.calls.filter((c: any) =>
      c[0]?.data?.credits?.increment !== undefined
    );
    expect(creditCalls).toHaveLength(0);
  });

  // --- Fallback (No default PM) ---

  it('returns clientSecret/amount/credits in fallback flow', async () => {
    // Default mock: no default PM → fallback
    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.clientSecret).toBe('pi_fallback_secret');
    expect(json.amount).toBe(CREDIT_PACKAGES[0].amount);
    expect(json.credits).toBe(CREDIT_PACKAGES[0].credits);
  });

  it('fallback PI has correct metadata (NO source=immediate, setup_future_usage=off_session)', async () => {
    await POST(makeRequest({ packageId: 'pkg_basic' }));

    // The last (fallback) paymentIntents.create call
    const callArgs = mockStripe.paymentIntents.create.mock.calls[0][0];
    expect(callArgs.setup_future_usage).toBe('off_session');
    expect(callArgs.metadata?.source).toBeUndefined();
    expect(callArgs.metadata?.type).toBe('credits_purchase');
  });

  // --- Package Selection ---

  it('uses pkg_basic by default when no packageId provided', async () => {
    await POST(makeRequest({}));
    const callArgs = mockStripe.paymentIntents.create.mock.calls[0][0];
    expect(callArgs.amount).toBe(CREDIT_PACKAGES[0].amount); // pkg_basic amount
  });

  it('uses pkg_pro when packageId=pkg_pro', async () => {
    const pro = CREDIT_PACKAGES.find(p => p.id === 'pkg_pro')!;
    await POST(makeRequest({ packageId: 'pkg_pro' }));
    const callArgs = mockStripe.paymentIntents.create.mock.calls[0][0];
    expect(callArgs.amount).toBe(pro.amount);
    expect(callArgs.metadata?.creditsAmount).toBe(pro.credits.toString());
  });

  it('uses pkg_elite when packageId=pkg_elite', async () => {
    const elite = CREDIT_PACKAGES.find(p => p.id === 'pkg_elite')!;
    await POST(makeRequest({ packageId: 'pkg_elite' }));
    const callArgs = mockStripe.paymentIntents.create.mock.calls[0][0];
    expect(callArgs.amount).toBe(elite.amount);
    expect(callArgs.metadata?.creditsAmount).toBe(elite.credits.toString());
  });

  it('falls back to pkg_basic for unknown packageId', async () => {
    await POST(makeRequest({ packageId: 'pkg_nonexistent' }));
    const callArgs = mockStripe.paymentIntents.create.mock.calls[0][0];
    expect(callArgs.amount).toBe(CREDIT_PACKAGES[0].amount);
  });

  // --- Critical: Webhook safety — the fallback PI must NOT have source=immediate ---
  // (prevents double-crediting when webhook fires for the eventual payment)

  it('CRITICAL: fallback PI creditsAmount metadata matches selected package', async () => {
    const pro = CREDIT_PACKAGES.find(p => p.id === 'pkg_pro')!;
    await POST(makeRequest({ packageId: 'pkg_pro' }));
    const callArgs = mockStripe.paymentIntents.create.mock.calls[0][0];
    // Webhook will use this to know how many credits to add
    expect(callArgs.metadata.creditsAmount).toBe(pro.credits.toString());
  });
});
