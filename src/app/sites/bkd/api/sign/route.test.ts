import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db';
import { s3 } from '@/lib/s3';
import { PDFDocument } from 'pdf-lib';

vi.mock('@/lib/db', () => ({
  prisma: {
    bkd_document: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock('@/lib/s3', () => ({
  s3: {
    getFile: vi.fn(),
    upload: vi.fn(),
  },
}));

vi.mock('pdf-lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdf-lib')>();
  return {
    ...actual,
    PDFDocument: {
      ...actual.PDFDocument,
      load: vi.fn(),
    }
  };
});

describe('POST /sites/bkd/api/sign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const reqMock = (body: any) => ({
    json: vi.fn().mockResolvedValue(body),
  } as unknown as import('next/server').NextRequest);

  it('fails if document not found in DB', async () => {
    (prisma.bkd_document.findUnique as any).mockResolvedValue(null);
    const req = reqMock({ documentId: 'invalid-id', signatureData: 'data:image/png;base64,mock' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Document not found');
  });

  it('fails if document not found in S3', async () => {
    (prisma.bkd_document.findUnique as any).mockResolvedValue({ id: 'doc-1', s3Key: 'test.pdf' });
    (s3.getFile as any).mockResolvedValue(null);
    const req = reqMock({ documentId: 'doc-1', signatureData: 'data:image/png;base64,mock' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('File not found in S3');
  });

  it('fails if document config is missing', async () => {
    (prisma.bkd_document.findUnique as any).mockResolvedValue({ id: 'doc-1', s3Key: 'test.pdf', config: {} });
    (s3.getFile as any).mockResolvedValue(new Uint8Array([1, 2, 3])); // Some mock bytes

    const mockPdfDoc = {
      getPages: vi.fn().mockReturnValue([]),
    };
    (PDFDocument.load as any).mockResolvedValue(mockPdfDoc);

    const req = reqMock({ documentId: 'doc-1', signatureData: 'data:image/png;base64,mock' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Document configuration missing');
  });

  it('successfully signs and saves the document', async () => {
    const mockDbDoc = {
      id: 'doc-1',
      s3Key: 'test.pdf',
      config: { x: 10, y: 10, width: 20, height: 5, page: 1 }
    };

    (prisma.bkd_document.findUnique as any).mockResolvedValue(mockDbDoc);
    (s3.getFile as any).mockResolvedValue(new Uint8Array([1, 2, 3])); // Some mock bytes
    (s3.upload as any).mockResolvedValue({});

    const mockPage = {
      getSize: vi.fn().mockReturnValue({ width: 600, height: 800 }),
      drawImage: vi.fn()
    };

    const mockPdfDoc = {
      getPages: vi.fn().mockReturnValue([mockPage]),
      embedPng: vi.fn().mockResolvedValue('mock-image-ref'),
      save: vi.fn().mockResolvedValue(new Uint8Array([4, 5, 6]))
    };

    (PDFDocument.load as any).mockResolvedValue(mockPdfDoc);

    const req = reqMock({ documentId: 'doc-1', signatureData: 'data:image/png;base64,mock' });
    const res = await POST(req);
    const data = await res.json();

    expect(PDFDocument.load).toHaveBeenCalled();
    expect(mockPdfDoc.embedPng).toHaveBeenCalledWith('data:image/png;base64,mock');
    expect(mockPage.drawImage).toHaveBeenCalledWith(
      'mock-image-ref',
      expect.objectContaining({
        x: 60, // (10 / 100) * 600 = 60
        y: 680, // 800 - ((10/100)*800) - (5/100)*800 = 800 - 80 - 40 = 680
        width: 120, // (20 / 100) * 600 = 120
        height: 40 // (5 / 100) * 800 = 40
      })
    );

    expect(mockPdfDoc.save).toHaveBeenCalled();
    expect(s3.upload).toHaveBeenCalledWith('signed/doc-1.pdf', expect.any(Uint8Array), 'application/pdf');
    expect(prisma.bkd_document.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'doc-1' },
      data: expect.objectContaining({ status: 'SIGNED' })
    }));

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
