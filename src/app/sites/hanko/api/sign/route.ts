import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { s3 } from "@/lib/s3";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * POST /api/hanko/sign
 * Records a signing mark event (INITIAL or SIGNATURE) and on SIGNATURE,
 * embeds the signature image into the PDF and seals the document.
 *
 * Deducts 1 credit from the document owner per mark event.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      documentId,
      eventType, // "INITIAL" | "SIGNATURE"
      signerEmail,
      signatureData,  // base64 PNG (for drawn signature)
      signerName,     // string (for typed signature)
      signatureFont,  // string (for typed signature)
    } = await req.json();

    if (!documentId || !eventType || !signerEmail) {
      return NextResponse.json(
        { error: "documentId, eventType, and signerEmail are required." },
        { status: 400 }
      );
    }

    const doc = await prisma.hanko_document.findUnique({ where: { id: documentId } });
    if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });

    // Enforce consent before signing
    const consent = await prisma.hanko_consent_record.findUnique({ where: { documentId } });
    if (!consent) {
      return NextResponse.json(
        { error: "Electronic consent must be provided before signing." },
        { status: 403 }
      );
    }

    // Deduct 1 credit from the document owner
    const owner = await prisma.user.findUnique({
      where: { id: doc.userId },
      select: { credits: true },
    });
    if (!owner || owner.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient signature credits.", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    await prisma.user.update({
      where: { id: doc.userId },
      data: { credits: { decrement: 1 } },
    });

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Get current document bytes from S3 to compute hash
    const pdfBytes = await s3.getFile(doc.s3Key);
    if (!pdfBytes) return NextResponse.json({ error: "PDF not found in S3." }, { status: 404 });

    const documentHash = crypto
      .createHash("sha256")
      .update(pdfBytes)
      .digest("hex");

    const existingCount = await prisma.hanko_sign_event.count({ where: { documentId } });
    const sequenceNum = existingCount + 1;

    // Record the forensic sign event
    const event = await prisma.hanko_sign_event.create({
      data: {
        documentId,
        eventType,
        signerEmail,
        ipAddress,
        userAgent,
        documentHash,
        sequenceNum,
        metadata: {
          signMode: signatureData ? "DRAW" : "TYPE",
          signerName: signerName || null,
          signatureFont: signatureFont || null,
        },
      },
    });

    // On final SIGNATURE event: embed into PDF and seal
    if (eventType === "SIGNATURE") {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const config = doc.config as {
        x: number;
        y: number;
        width: number;
        height: number;
        page: number;
      };

      if (!config?.page) {
        return NextResponse.json({ error: "Document configuration missing." }, { status: 400 });
      }

      const pageIndex = config.page - 1;
      const page = pages[pageIndex];
      const { width: pageWidth, height: pageHeight } = page.getSize();
      const x = (config.x / 100) * pageWidth;
      const w = (config.width / 100) * pageWidth;
      const h = (config.height / 100) * pageHeight;
      const y = pageHeight - (config.y / 100) * pageHeight - h;

      if (signatureData) {
        const img = await pdfDoc.embedPng(signatureData);
        page.drawImage(img, { x, y, width: w, height: h });
      } else if (signerName) {
        const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
        page.drawText(signerName, {
          x: x + 5,
          y: y + 5,
          size: Math.min(w / signerName.length, h * 0.8),
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
      }

      const signedPdfBytes = await pdfDoc.save();
      const sealedHash = crypto.createHash("sha256").update(signedPdfBytes).digest("hex");

      const signedKey = `hanko/signed/${doc.id}.pdf`;
      await s3.upload(signedKey, Buffer.from(signedPdfBytes), "application/pdf");

      await prisma.hanko_document.update({
        where: { id: documentId },
        data: {
          status: "SEALED",
          signedAt: new Date(),
          sealedHash,
          signerName: signerName || null,
          signatureFont: signatureFont || null,
        },
      });

      return NextResponse.json({
        success: true,
        eventId: event.id,
        sequenceNum,
        sealedHash,
        status: "SEALED",
      });
    }

    await prisma.hanko_document.update({
      where: { id: documentId },
      data: { status: "SIGNING" },
    });

    return NextResponse.json({
      success: true,
      eventId: event.id,
      sequenceNum,
      documentHash,
    });
  } catch (error) {
    console.error("[Hanko] Sign error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
