import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";
import { s3 } from "@/lib/s3";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDate(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

/**
 * GET /api/hanko/certificate/[id]
 * Generates and streams a "Certificate of Completion" PDF that maps every
 * signing event to its forensic data. Satisfies the ESIGN/UETA audit trail
 * requirement for non-repudiation.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doc = await prisma.hanko_document.findUnique({
      where: { id },
      include: {
        signEvents: { orderBy: { sequenceNum: "asc" } },
        consentRecord: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const totalEvents = doc.signEvents.length;

    // ── Build the certificate PDF ────────────────────────────────────────
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const PAGE_W = 612;
    const PAGE_H = 792;
    const MARGIN = 56;
    const LINE_H = 16;
    const COL_W = PAGE_W - MARGIN * 2;

    // Header page
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const draw = (
      text: string,
      opts: {
        bold?: boolean;
        oblique?: boolean;
        size?: number;
        x?: number;
        color?: [number, number, number];
        yOffset?: number;
      } = {}
    ) => {
      const {
        bold,
        oblique,
        size = 10,
        x = MARGIN,
        color = [0.08, 0.08, 0.08],
        yOffset = 0,
      } = opts;
      const f = bold ? fontBold : oblique ? fontOblique : font;
      page.drawText(text, {
        x,
        y: y + yOffset,
        size,
        font: f,
        color: rgb(...color),
        maxWidth: COL_W,
      });
    };

    const newLine = (height = LINE_H) => {
      y -= height;
      if (y < MARGIN + 80) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }
    };

    const hr = (yPos = y, color: [number, number, number] = [0.85, 0.85, 0.85]) => {
      page.drawLine({
        start: { x: MARGIN, y: yPos },
        end: { x: PAGE_W - MARGIN, y: yPos },
        thickness: 0.5,
        color: rgb(...color),
      });
    };

    // ── Title block ──────────────────────────────────────────────────────
    draw("CERTIFICATE OF COMPLETION", { bold: true, size: 18, color: [0.07, 0.07, 0.5] });
    newLine(24);
    draw("Electronic Signature Audit Trail", { size: 11, color: [0.4, 0.4, 0.4] });
    newLine(6);
    draw("Issued under the ESIGN Act, UETA, and eIDAS 2.0 (2026)", {
      size: 8,
      color: [0.5, 0.5, 0.5],
      oblique: true,
    });
    newLine(4);
    hr(y, [0.07, 0.07, 0.5]);
    newLine(20);

    // ── Document meta ────────────────────────────────────────────────────
    const metaRows: [string, string][] = [
      ["Document ID", doc.id],
      ["Filename", doc.filename],
      ["Status", doc.status],
      ["Signer Email", doc.signerEmail || "—"],
      ["Original SHA-256", doc.documentHash || "—"],
      ["Sealed SHA-256", doc.sealedHash || "—"],
      ["Created", formatDate(doc.createdAt)],
      ["Sealed", doc.signedAt ? formatDate(doc.signedAt) : "—"],
    ];

    draw("DOCUMENT DETAILS", { bold: true, size: 9, color: [0.3, 0.3, 0.3] });
    newLine(14);

    for (const [label, value] of metaRows) {
      draw(`${label}:`, { bold: true, size: 8.5, x: MARGIN });
      draw(value, { size: 8.5, x: MARGIN + 120 });
      newLine(13);
    }
    newLine(14);
    hr();
    newLine(18);

    // ── Event log ───────────────────────────────────────────────────────
    draw(`FORENSIC EVENT LOG  (${totalEvents} events)`, {
      bold: true,
      size: 9,
      color: [0.3, 0.3, 0.3],
    });
    newLine(18);

    for (const ev of doc.signEvents) {
      const meta = ev.metadata as Record<string, string> | null;

      // Event header
      draw(`Event #${ev.sequenceNum} of ${totalEvents}  ·  ${ev.eventType}`, {
        bold: true,
        size: 9.5,
        color: [0.07, 0.07, 0.5],
      });
      newLine(14);

      const rows: [string, string][] = [
        ["Timestamp (UTC)", formatDate(new Date(ev.timestamp))],
        ["IP Address", ev.ipAddress],
        ["User Agent", ev.userAgent.substring(0, 80)],
        ["Signer Email", ev.signerEmail],
        ["Document SHA-256", ev.documentHash],
        ["Geo Country", ev.geoCountry || "—"],
        ["Geo City", ev.geoCity || "—"],
      ];

      if (meta?.viewportSize) rows.push(["Viewport", meta.viewportSize]);
      if (meta?.browserVersion) rows.push(["Browser", meta.browserVersion]);
      if (meta?.signMode) rows.push(["Sign Mode", meta.signMode]);
      if (meta?.signerName) rows.push(["Typed Name", meta.signerName]);
      if (meta?.consentText) rows.push(["Consent Text", meta.consentText.substring(0, 80)]);

      for (const [label, value] of rows) {
        draw(`${label}:`, { bold: false, size: 8, x: MARGIN + 16, color: [0.4, 0.4, 0.4] });
        draw(value, { size: 8, x: MARGIN + 130 });
        newLine(12);
      }

      newLine(8);
      hr(y, [0.9, 0.9, 0.9]);
      newLine(14);
    }

    // ── Footer seal ──────────────────────────────────────────────────────
    newLine(10);
    draw(
      "This certificate constitutes the contemporaneous record of the electronic signing transaction.",
      { oblique: true, size: 7.5, color: [0.55, 0.55, 0.55] }
    );
    newLine(11);
    draw(
      `Generated at ${formatDate(new Date())} by Hanko / Proximal Coast, LLC.`,
      { size: 7.5, color: [0.55, 0.55, 0.55] }
    );

    const certBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(certBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="hanko-certificate-${doc.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[Hanko] Certificate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
