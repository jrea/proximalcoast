/**
 * Central Prisma Mock — single source of truth for all tests.
 *
 * Grounded in the actual bkd@bkd.com test user snapshot taken 2026-02-22.
 * If the Prisma schema changes, update this file and all tests adapt automatically.
 *
 * Usage in tests:
 *   vi.mock('@/lib/db')  // no factory — Vitest picks up this __mocks__ file automatically
 *   import { prisma } from '@/lib/db'
 *   (prisma.user.findUnique as Mock).mockResolvedValue(FIXTURES.user)
 */

import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Canonical fixtures from real DB snapshot (bkd@bkd.com, 2026-02-22)
// ---------------------------------------------------------------------------

export const FIXTURES = {
  /** bkd@bkd.com — real user record */
  user: {
    id: '0dSZw0Np8S3jiEStAVJhO6A1VktCJLNw',
    name: 'bkd',
    email: 'bkd@bkd.com',
    username: null as string | null,
    isGuest: false,
    credits: 3,
    stripeCustomerId: 'cus_U1nm8oh3abojJz',
    phone: null as string | null,
    emailVerified: false,
    createdAt: new Date('2026-02-22T21:26:22.692Z'),
    updatedAt: new Date('2026-02-22T21:26:22.692Z'),
  },

  /** bkd site active subscription — real sub record */
  subscription: {
    id: '1d9665ef-2a28-4e76-9eaf-f9e459cab448',
    userId: '0dSZw0Np8S3jiEStAVJhO6A1VktCJLNw',
    siteSlug: 'bkd',
    stripeSubscriptionId: 'sub_1T3kG8Bg5Il1ijvQ8omul5uG',
    status: 'active',
    plan: 'standard',
    upcomingPlan: null as string | null,
    cancelAtPeriodEnd: false,
    priceAmount: 7000,
    priceCurrency: 'usd',
    expiresAt: new Date('2026-03-24T22:26:39.751Z'),
    createdAt: new Date('2026-02-22T21:26:32.057Z'),
    updatedAt: new Date('2026-02-22T22:26:39.864Z'),
    user: {
      id: '0dSZw0Np8S3jiEStAVJhO6A1VktCJLNw',
      name: 'bkd',
      email: 'bkd@bkd.com',
    },
  },

  /** A typical guest user */
  guestUser: {
    id: 'guest_abc123',
    name: 'NastyWombat',
    email: null as string | null,
    username: 'NastyWombat',
    isGuest: true,
    credits: 3,
    stripeCustomerId: null as string | null,
    phone: null as string | null,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  /** A typical insult record */
  insult: {
    id: 'insult_001',
    content: 'Your LinkedIn bio is a war crime.',
    topic: 'LinkedIn influencers',
    language: 'English',
    promptTokens: 100,
    completionTokens: 50,
    userId: '0dSZw0Np8S3jiEStAVJhO6A1VktCJLNw',
    isEmail: false,
    heatLevel: 'spicy',
    weight: 0,
    createdAt: new Date(),
  },

  /** A typical API key record */
  apiKey: {
    id: 'key_001',
    key: 'hashed_key_value',
    name: 'Test Bot',
    userId: '0dSZw0Np8S3jiEStAVJhO6A1VktCJLNw',
    lastUsedAt: null as Date | null,
    createdAt: new Date(),
    user: {
      id: '0dSZw0Np8S3jiEStAVJhO6A1VktCJLNw',
      name: 'bkd',
      email: 'bkd@bkd.com',
      image: null,
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Central mock — all models and methods used across the test suite
// ---------------------------------------------------------------------------

export const prisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  user_subscription: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
  },

  jerkstore_insult: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  jerkstore_insult_safe: {
    count: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },

  jerkstore_ip_tracking: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },

  apiKey: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  bkd_document: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },

  hanko_document: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },

  $queryRaw: vi.fn(),
  $transaction: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};
