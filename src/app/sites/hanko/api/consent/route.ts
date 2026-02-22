import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { s3 } from "@/lib/s3";
import crypto from "crypto";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * POST /api/hanko/consent
 * Records the signer's Electronic Business Consent event.
 * Called by ConsentGate before the signing interface is shown.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      documentId,
      signerEmail,
      viewportWidth,
      viewportHeight,
      browserVersion,
    } = await req.json();

    if (!documentId || !signerEmail) {
      return NextResponse.json(
        { error: "documentId and signerEmail are required." },
        { status: 400 }
      );
    }

    const doc = await prisma.hanko_document.findUnique({ where: { id: documentId } });
    if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    const viewportSize = `${viewportWidth}x${viewportHeight}`;

    // Current sequence number = existing sign events count + 1
    const existingCount = await prisma.hanko_sign_event.count({ where: { documentId } });
    const sequenceNum = existingCount + 1;

    // Hash of document at this moment (use the original documentHash)
    const documentHash = doc.documentHash || "unknown";

    // Create consent record
    await prisma.hanko_consent_record.upsert({
      where: { documentId },
      create: {
        documentId,
        signerEmail,
        ipAddress,
        userAgent,
        viewportSize,
        browserName: browserVersion,
      },
      update: {
        signerEmail,
        ipAddress,
        userAgent,
        viewportSize,
        browserName: browserVersion,
        timestamp: new Date(),
      },
    });

    // Create the consent sign event
    const event = await prisma.hanko_sign_event.create({
      data: {
        documentId,
        eventType: "CONSENT",
        signerEmail,
        ipAddress,
        userAgent,
        documentHash,
        sequenceNum,
        metadata: {
          viewportSize,
          browserVersion,
          consentText:
            "I have reviewed and agree to conduct this transaction electronically under the ESIGN Act and UETA.",
        },
      },
    });

    // Update document status
    await prisma.hanko_document.update({
      where: { id: documentId },
      data: {
        status: "CONSENT_GIVEN",
        signerEmail,
      },
    });

    return NextResponse.json({ success: true, consentEventId: event.id, sequenceNum });
  } catch (error) {
    console.error("[Hanko] Consent error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
