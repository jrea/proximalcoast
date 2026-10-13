import { describe, it, expect, vi, beforeEach } from 'vitest';

// All mock objects must be declared with vi.hoisted to avoid TDZ errors
const mockStripe = vi.hoisted(() => ({
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
}));

vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }));
vi.mock('@/lib/db');

import { resolveStripeCustomerId } from './customer';
import { prisma } from '@/lib/db';
import { FIXTURES } from '@/lib/__mocks__/db';

const USER = FIXTURES.user;

describe('resolveStripeCustomerId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.user.update as any).mockResolvedValue({});
    mockStripe.customers.create.mockResolvedValue({ id: 'cus_new' });
  });

  it('returns the stored customer ID when the customer exists', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({ id: USER.stripeCustomerId });

    const id = await resolveStripeCustomerId(USER);

    expect(id).toBe(USER.stripeCustomerId);
    expect(mockStripe.customers.retrieve).toHaveBeenCalledWith(USER.stripeCustomerId);
    expect(mockStripe.customers.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('creates and persists a new customer when the stored ID is resource_missing', async () => {
    mockStripe.customers.retrieve.mockRejectedValue(
      Object.assign(new Error('No such customer'), { code: 'resource_missing' })
    );

    const id = await resolveStripeCustomerId(USER);

    expect(id).toBe('cus_new');
    expect(mockStripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: USER.email,
        name: USER.name,
        metadata: { userId: USER.id },
      }),
      { idempotencyKey: `jerkstore-customer:${USER.id}` }
    );
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: USER.id },
      data: { stripeCustomerId: 'cus_new' },
    });
  });

  it('creates and persists a new customer when the stored customer is deleted', async () => {
    mockStripe.customers.retrieve.mockResolvedValue({ id: USER.stripeCustomerId, deleted: true });

    const id = await resolveStripeCustomerId(USER);

    expect(id).toBe('cus_new');
    expect(mockStripe.customers.create).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: USER.id },
      data: { stripeCustomerId: 'cus_new' },
    });
  });

  it('creates a customer without retrieving when no ID is stored', async () => {
    const id = await resolveStripeCustomerId({ ...USER, stripeCustomerId: null });

    expect(id).toBe('cus_new');
    expect(mockStripe.customers.retrieve).not.toHaveBeenCalled();
    expect(mockStripe.customers.create).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: USER.id },
      data: { stripeCustomerId: 'cus_new' },
    });
  });

  it('propagates non-resource_missing Stripe errors without creating a customer', async () => {
    const failure = Object.assign(new Error('Stripe is down'), { code: 'api_error' });
    mockStripe.customers.retrieve.mockRejectedValue(failure);

    await expect(resolveStripeCustomerId(USER)).rejects.toBe(failure);
    expect(mockStripe.customers.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
