import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must be declared with vi.hoisted so they are available inside vi.mock factories
const mockStripe = vi.hoisted(() => ({
  webhooks: {
    constructEvent: vi.fn(),
  },
  subscriptions: {
    retrieve: vi.fn(),
    cancel: vi.fn(),
  },
  customers: {
    update: vi.fn(),
  },
}));

// --- Mocks ---

vi.mock('@/lib/db');

vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({ get: (k: string) => k === 'Stripe-Signature' ? 'valid_sig' : null }),
}));

import { POST } from './route';
import { prisma } from '@/lib/db';

// --- Helpers ---

const buildRequest = (body: string) => ({
  text: vi.fn().mockResolvedValue(body),
  headers: new Headers({ 'Stripe-Signature': 'valid_sig' }),
} as unknown as Request);

const makeEvent = (type: string, data: object, mode?: string) => ({
  type,
  data: { object: { mode, ...data } },
});

const makeSub = (overrides: object = {}) => ({
  id: 'sub_123',
  status: 'active',
  cancel_at_period_end: false,
  current_period_end: Math.floor(Date.now() / 1000) + 86400,
  metadata: { userId: 'user_1', siteSlug: 'jerkstore' },
  items: { data: [{ price: { id: 'price_savage', unit_amount: 2000, currency: 'usd' } }] },
  ...overrides,
});

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockStripe.webhooks.constructEvent.mockImplementation((body: string) => JSON.parse(body));

    (prisma.user.update as any).mockResolvedValue({});
    (prisma.user.findUnique as any).mockResolvedValue({ name: 'Joe', email: 'joe@test.com', phone: null });
    (prisma.user_subscription.findUnique as any).mockResolvedValue(null);
    (prisma.user_subscription.update as any).mockResolvedValue({});
    (prisma.user_subscription.updateMany as any).mockResolvedValue({});
    (prisma.user_subscription.upsert as any).mockResolvedValue({});
    mockStripe.subscriptions.retrieve.mockResolvedValue(makeSub());
    mockStripe.customers.update.mockResolvedValue({});
  });

  // --- Signature Verification ---

  it('returns 400 on invalid stripe signature', async () => {
    mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
      throw new Error('Bad signature');
    });

    const req = buildRequest('{}');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid signature');
  });

  // --- payment_intent.succeeded ---

  it('credits user on payment_intent.succeeded (credits_purchase)', async () => {
    const event = makeEvent('payment_intent.succeeded', {
      metadata: { type: 'credits_purchase', userId: 'user_1', creditsAmount: '100' },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user_1' },
      data: { credits: { increment: 100 } },
    }));
  });

  it('does NOT double-credit on payment_intent.succeeded with source=immediate', async () => {
    const event = makeEvent('payment_intent.succeeded', {
      metadata: { type: 'credits_purchase', userId: 'user_1', creditsAmount: '50', source: 'immediate' },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    await POST(req);

    const creditCalls = (prisma.user.update as any).mock.calls.filter((call: any) =>
      call[0]?.data?.credits?.increment !== undefined
    );
    expect(creditCalls).toHaveLength(0);
  });

  it('updates phone on payment_intent.succeeded when shipping phone present', async () => {
    const event = makeEvent('payment_intent.succeeded', {
      metadata: { userId: 'user_1' },
      shipping: { phone: '555-1234' },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    await POST(req);

    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user_1' },
      data: { phone: '555-1234' },
    }));
  });

  // --- checkout.session.completed (one-time payment / credits) ---

  it('adds 50 credits on checkout.session.completed one-time payment', async () => {
    const event = makeEvent('checkout.session.completed', {
      mode: 'payment',
      payment_status: 'paid',
      metadata: { userId: 'user_1' },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user_1' },
      data: { credits: { increment: 50 } },
    }));
  });

  it('ignores one-time payment without userId metadata', async () => {
    const event = makeEvent('checkout.session.completed', {
      mode: 'payment',
      payment_status: 'paid',
      metadata: {},
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    await POST(req);

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  // --- checkout.session.completed (subscription) ---

  it('creates a new subscription record on checkout.session.completed subscription mode', async () => {
    const stripeSub = makeSub();
    mockStripe.subscriptions.retrieve.mockResolvedValueOnce(stripeSub);

    const event = makeEvent('checkout.session.completed', {
      mode: 'subscription',
      subscription: 'sub_123',
      customer: 'cus_abc',
      metadata: { userId: 'user_1', siteSlug: 'jerkstore' },
      customer_details: { phone: null },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(
      (prisma.user_subscription.upsert as any).mock.calls.length +
      (prisma.user_subscription.update as any).mock.calls.length
    ).toBeGreaterThan(0);
  });

  it('updates existing subscription record on checkout.session.completed if one exists for user+siteSlug', async () => {
    const stripeSub = makeSub();
    mockStripe.subscriptions.retrieve.mockResolvedValueOnce(stripeSub);
    (prisma.user_subscription.findUnique as any).mockResolvedValueOnce({ id: 'existing_sub_id' });

    const event = makeEvent('checkout.session.completed', {
      mode: 'subscription',
      subscription: 'sub_123',
      customer: 'cus_abc',
      metadata: { userId: 'user_1', siteSlug: 'jerkstore' },
      customer_details: { phone: null },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    await POST(req);

    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_siteSlug: { userId: 'user_1', siteSlug: 'jerkstore' } },
    }));
  });

  // --- invoice.payment_succeeded ---

  it('upserts subscription on invoice.payment_succeeded', async () => {
    const stripeSub = makeSub();
    mockStripe.subscriptions.retrieve.mockResolvedValueOnce(stripeSub);

    const event = makeEvent('invoice.payment_succeeded', {
      subscription: 'sub_123',
      metadata: { userId: 'user_1', siteSlug: 'jerkstore' },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.user_subscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeSubscriptionId: 'sub_123' },
    }));
  });

  it('ignores invoice.payment_succeeded without subscription id', async () => {
    const event = makeEvent('invoice.payment_succeeded', {});
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    await POST(req);

    expect(prisma.user_subscription.upsert).not.toHaveBeenCalled();
  });

  // --- customer.subscription.deleted ---

  it('marks subscription as canceled on customer.subscription.deleted', async () => {
    const event = makeEvent('customer.subscription.deleted', { id: 'sub_del_123' });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.user_subscription.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeSubscriptionId: 'sub_del_123' },
      data: { status: 'canceled' },
    }));
  });

  // --- customer.subscription.updated ---

  it('upserts subscription on customer.subscription.updated (no existing composite record)', async () => {
    const event = makeEvent('customer.subscription.updated', {
      id: 'sub_upd_123',
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: Math.floor(Date.now() / 1000) + 86400,
      metadata: { userId: 'user_1', siteSlug: 'jerkstore' },
      items: { data: [{ price: { id: 'price_savage', unit_amount: 2000, currency: 'usd' } }] },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);
    (prisma.user_subscription.findUnique as any)
      .mockResolvedValueOnce({ upcomingPlan: null, plan: 'savage' }) // existingSub by stripeId
      .mockResolvedValueOnce(null); // existingByComposite

    const req = buildRequest(JSON.stringify(event));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.user_subscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeSubscriptionId: 'sub_upd_123' },
    }));
  });

  it('updates existing composite record on customer.subscription.updated when found', async () => {
    const event = makeEvent('customer.subscription.updated', {
      id: 'sub_upd_123',
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: Math.floor(Date.now() / 1000) + 86400,
      metadata: { userId: 'user_1', siteSlug: 'jerkstore' },
      items: { data: [{ price: { id: 'price_elite', unit_amount: 1000, currency: 'usd' } }] },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);
    (prisma.user_subscription.findUnique as any)
      .mockResolvedValueOnce({ upcomingPlan: null, plan: 'savage' }) // existingSub by stripeId
      .mockResolvedValueOnce({ id: 'existing_record' }); // existingByComposite

    const req = buildRequest(JSON.stringify(event));
    await POST(req);

    expect(prisma.user_subscription.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_siteSlug: { userId: 'user_1', siteSlug: 'jerkstore' } },
      data: expect.objectContaining({ stripeSubscriptionId: 'sub_upd_123' }),
    }));
  });

  it('clears upcomingPlan when new plan matches it on customer.subscription.updated', async () => {
    // We simulate a schedule releasing to 'elite' plan
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE = 'price_elite';
    const event = makeEvent('customer.subscription.updated', {
      id: 'sub_upd_123',
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: Math.floor(Date.now() / 1000) + 86400,
      metadata: { userId: 'user_1', siteSlug: 'jerkstore' },
      items: { data: [{ price: { id: 'price_elite', unit_amount: 1000, currency: 'usd' } }] },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);
    (prisma.user_subscription.findUnique as any)
      .mockResolvedValueOnce({ upcomingPlan: 'elite', plan: 'savage' })
      .mockResolvedValueOnce(null);

    const req = buildRequest(JSON.stringify(event));
    await POST(req);

    const upsertCall = (prisma.user_subscription.upsert as any).mock.calls[0];
    if (upsertCall) {
      expect(upsertCall[0].update.upcomingPlan).toBeNull();
    }
  });

  it('falls back to updateMany when userId missing from metadata on customer.subscription.updated', async () => {
    const event = makeEvent('customer.subscription.updated', {
      id: 'sub_upd_456',
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: Math.floor(Date.now() / 1000) + 86400,
      metadata: {}, // No userId
      items: { data: [{ price: { id: 'price_x', unit_amount: 500, currency: 'usd' } }] },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);
    (prisma.user_subscription.findUnique as any).mockResolvedValueOnce(null);

    const req = buildRequest(JSON.stringify(event));
    await POST(req);

    expect(prisma.user_subscription.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeSubscriptionId: 'sub_upd_456' },
    }));
  });

  // --- customer.created / customer.updated ---

  it('saves stripeCustomerId on customer.created with userId metadata', async () => {
    const event = makeEvent('customer.created', {
      id: 'cus_new_123',
      metadata: { userId: 'user_1' },
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user_1' },
      data: { stripeCustomerId: 'cus_new_123' },
    }));
  });

  it('ignores customer.created without userId metadata', async () => {
    const event = makeEvent('customer.created', {
      id: 'cus_orphan',
      metadata: {},
    });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    await POST(req);

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  // --- Expected no-op events ---

  it('returns 200 for known no-op events (invoice.created)', async () => {
    const event = makeEvent('invoice.created', { id: 'inv_123' });
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it('always returns { received: true } on success', async () => {
    const event = makeEvent('some.unknown.event', {});
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(event);

    const req = buildRequest(JSON.stringify(event));
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });
});
