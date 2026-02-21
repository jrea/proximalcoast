import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    bkd_document: { update: vi.fn() },
  },
}));

describe('POST /sites/bkd/api/document/[id]/config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.bkd_document.update as any).mockResolvedValue({ id: 'doc-123', config: { x: 10, y: 10, width: 20, height: 5, page: 1 } });
  });

  const reqMock = (body: any) => ({
    json: vi.fn().mockResolvedValue(body),
  } as unknown as import('next/server').NextRequest);

  it('updates document config successfully', async () => {
    const configData = { x: 15, y: 20, width: 25, height: 10, page: 2 };
    const req = reqMock(configData);

    // Pass the typed params expected by Next.js app router API (params must be a Promise)
    const res = await POST(req, { params: Promise.resolve({ id: 'doc-123' }) });
    const data = await res.json();

    expect(prisma.bkd_document.update).toHaveBeenCalledWith({
      where: { id: 'doc-123' },
      data: { config: configData },
    });

    expect(res.status).toBe(200);
    expect(data.id).toBe('doc-123');
  });

  it('handles internal server errors', async () => {
    (prisma.bkd_document.update as any).mockRejectedValue(new Error('DB error'));
    const configData = { x: 15, y: 20, width: 25, height: 10, page: 2 };
    const req = reqMock(configData);

    const res = await POST(req, { params: Promise.resolve({ id: 'doc-123' }) });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});
