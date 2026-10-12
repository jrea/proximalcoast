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
    (prisma.$transaction as any).mockImplementation(async (callback: any) => callback(prisma));
    (prisma.jerkstore_credit_purchase.create as any).mockResolvedValue({});

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
    }), expect.objectContaining({ idempotencyKey: expect.any(String) }));
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
    }), expect.objectContaining({ idempotencyKey: expect.any(String) }));
  });

  // --- Auto-Charge Failure → Fallback ---

  it('falls back to PaymentIntent UI flow when auto-charge fails', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({
      id: USER.stripeCustomerId,
      invoice_settings: { default_payment_method: 'pm_saved_card' },
    });
    // First call (auto-charge) fails; second call (fallback) succeeds
    mockStripe.paymentIntents.create
      .mockRejectedValueOnce(Object.assign(new Error('card_declined'), { type: 'StripeCardError' }))
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

  it('rejects unknown packageId without contacting Stripe', async () => {
    const response = await POST(makeRequest({ packageId: 'pkg_nonexistent' }));
    expect(response.status).toBe(400);
    expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
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

  it('does not create a second payment when a saved-card request has an uncertain network failure', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({ invoice_settings: { default_payment_method: 'pm_saved_card' } });
    mockStripe.paymentIntents.create.mockRejectedValueOnce(Object.assign(new Error('Connection lost'), { type: 'StripeConnectionError' }));
    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    expect(res.status).toBe(503);
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(1);
    expect(prisma.jerkstore_credit_purchase.create).not.toHaveBeenCalled();
  });

  it('does not charge again when credit fulfillment fails after a successful payment', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({ invoice_settings: { default_payment_method: 'pm_saved_card' } });
    mockStripe.paymentIntents.create.mockResolvedValueOnce({ id: 'pi_paid', status: 'succeeded' });
    vi.mocked(prisma.jerkstore_credit_purchase.create).mockRejectedValueOnce(new Error('DB unavailable'));
    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    expect(res.status).toBe(503);
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('returns no additional credits when the same paid receipt is already fulfilled', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({ invoice_settings: { default_payment_method: 'pm_saved_card' } });
    mockStripe.paymentIntents.create.mockResolvedValueOnce({ id: 'pi_paid', status: 'succeeded' });
    vi.mocked(prisma.jerkstore_credit_purchase.create).mockRejectedValueOnce({ code: 'P2002' });
    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    expect(await res.json()).toMatchObject({ success: true, creditsAdded: 0 });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('leaves a processing payment alone and tells the browser it is pending', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({ invoice_settings: { default_payment_method: 'pm_saved_card' } });
    mockStripe.paymentIntents.create.mockResolvedValueOnce({ id: 'pi_processing', status: 'processing' });
    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    expect(res.status).toBe(202);
    expect(await res.json()).toMatchObject({ pending: true });
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(1);
    expect(prisma.jerkstore_credit_purchase.create).not.toHaveBeenCalled();
  });

  it('reuses the same intent for additional card authentication', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({ invoice_settings: { default_payment_method: 'pm_saved_card' } });
    mockStripe.paymentIntents.create.mockResolvedValueOnce({ id: 'pi_action', status: 'requires_action', client_secret: 'pi_action_secret' });
    const res = await POST(makeRequest({ packageId: 'pkg_basic' }));
    expect(await res.json()).toMatchObject({ clientSecret: 'pi_action_secret' });
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(1);
  });

  it('keeps the Stripe idempotency key stable across a browser retry', async () => {
    const body = { packageId: 'pkg_basic', requestId: '01959981-96d4-411b-8bc6-1c1e15eb1240' };
    await POST(makeRequest(body));
    await POST(makeRequest(body));
    expect(mockStripe.paymentIntents.create.mock.calls[0][1].idempotencyKey).toBe(mockStripe.paymentIntents.create.mock.calls[1][1].idempotencyKey);
  });

  it('rejects malformed JSON or attempt identifiers without contacting Stripe', async () => {
    const malformed = new Request('http://jerkstore.localhost/api/checkout/credits', { method: 'POST', body: '{' });
    expect((await POST(malformed)).status).toBe(400);
    const res = await POST(makeRequest({ requestId: 'invalid-attempt' }));
    expect(res.status).toBe(400);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    expect(res.headers.get('X-Robots-Tag')).toContain('noindex');
    expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
  });
});
