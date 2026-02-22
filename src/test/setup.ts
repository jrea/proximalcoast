/**
 * Global Vitest setup — runs before every test file.
 *
 * Key jobs:
 * 1. Mock 'server-only' so route files can be imported in jsdom without throwing.
 * 2. Mock Prisma client + pg as no-ops (the @/lib/db alias already points to the
 *    central mock, but transitive deps of route files may still try to load db.ts).
 */
import { vi } from 'vitest';

// 'server-only' throws when not in a Next.js Server Component environment.
// In tests we just want it to be a no-op.
vi.mock('server-only', () => ({}));

// Prevent real Prisma/PG connections. The @/lib/db alias already redirects
// all db imports to __mocks__/db.ts, but belt-and-suspenders here.
vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    end: vi.fn(),
    query: vi.fn(),
  })),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({})),
}));

