import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db';
import { s3 } from '@/lib/s3';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    bkd_document: { create: vi.fn() },
  },
}));

vi.mock('@/lib/s3', () => ({
  s3: {
    upload: vi.fn(),
  },
}));

describe('POST /sites/bkd/api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.bkd_document.create as any).mockResolvedValue({ id: 'doc-123', filename: 'test.pdf' });
    (s3.upload as any).mockResolvedValue({ url: 'http://s3/test.pdf' });
  });

  const reqMock = (formDataMock: FormData) => ({
    formData: vi.fn().mockResolvedValue(formDataMock),
  } as unknown as import('next/server').NextRequest);

  it('allows uploading a valid file', async () => {
    const formData = new FormData();
    const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    formData.append('file', mockFile);

    const req = reqMock(formData);
    const res = await POST(req);
    const data = await res.json();

    expect(s3.upload).toHaveBeenCalledWith(
      expect.stringContaining('uploads/'),
      expect.any(Buffer),
      'application/pdf'
    );
    expect(prisma.bkd_document.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        filename: 'test.pdf',
        status: 'PENDING',
      })
    }));

    expect(res.status).toBe(200);
    expect(data.id).toBe('doc-123');
  });

  it('fails if no file is provided', async () => {
    const formData = new FormData(); // Empty form data
    const req = reqMock(formData);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('No file provided');
    expect(s3.upload).not.toHaveBeenCalled();
    expect(prisma.bkd_document.create).not.toHaveBeenCalled();
  });

  it('handles internal server errors', async () => {
    const formData = new FormData();
    const mockFile = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    formData.append('file', mockFile);

    (s3.upload as any).mockRejectedValue(new Error('S3 Down'));
    const req = reqMock(formData);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});
