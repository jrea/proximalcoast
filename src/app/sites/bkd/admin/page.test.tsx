import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from './page';

// Mock react-pdf to avoid heavy JSDOM canvas dependencies and rendering issues
vi.mock('react-pdf', () => ({
  pdfjs: {
    GlobalWorkerOptions: { workerSrc: '' }
  },
  Document: ({ children, onLoadSuccess }: any) => {
    // Simulate immediate load success
    setTimeout(() => onLoadSuccess?.({ numPages: 1 }), 0);
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ onLoadSuccess }: any) => {
    setTimeout(() => onLoadSuccess?.({ width: 600, height: 800 }), 0);
    return <div data-testid="pdf-page" >Mocked Page</div>;
  }
}));

// Polyfill DOMMatrix for pdfjs-dist in JSDOM
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix { } as any;
}

describe('AdminPage Component', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders upload interface initially', () => {
    render(<AdminPage />);
    expect(screen.getByText('Bushin Kan Dojo')).toBeDefined();

    const uploadBtn = screen.getByRole('button', { name: /upload & configure/i });
    expect(uploadBtn).toBeDefined();
    // initially disabled
    expect((uploadBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables the upload button when a file is selected', async () => {
    const { container } = render(<AdminPage />);
    const uploadBtn = screen.getByRole('button', { name: /upload & configure/i });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);

    expect((uploadBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('handles the upload flow and shows configuration panel', async () => {
    // Mock the chain of fetch calls
    // 1: Upload mock
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ id: 'doc-123' })
    });
    // 2: Presigned URL mock
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ url: 'https://mock.s3/test.pdf' })
    });

    const { container } = render(<AdminPage />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);

    const uploadBtn = screen.getByRole('button', { name: /upload & configure/i });
    await userEvent.click(uploadBtn);

    // Wait for the UI state to update after fetch
    await waitFor(() => {
      // Configuration panel should appear once documentId and pdfUrl are set
      expect(screen.getByText('Coordinates')).toBeDefined();
    });

    // Check configuration inputs
    // Both X and Y default to 10, so expect 2 inputs with value '10'
    expect(screen.getAllByDisplayValue('10')).toHaveLength(2);
    expect(screen.getByDisplayValue('20')).toBeDefined(); // Width definition default

    // Check saving the configuration
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: true })
    });

    // Mock window.alert
    const spyAlert = vi.spyOn(window, 'alert').mockImplementation(() => { });

    const saveBtn = screen.getByRole('button', { name: /save layout/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/document/doc-123/config',
        expect.objectContaining({ method: 'POST' })
      );
    });

    expect(spyAlert).toHaveBeenCalledWith('Configuration saved! You can now use the signing link.');
  });
});
