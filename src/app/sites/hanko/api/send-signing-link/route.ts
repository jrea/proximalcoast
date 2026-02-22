import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Authentication required to send signing links." }, { status: 401 });
    }

    const { documentId, email } = await req.json();

    if (!documentId || !email) {
      return NextResponse.json({ error: "Missing documentId or email" }, { status: 400 });
    }

    const doc = await prisma.bkd_document.findUnique({ where: { id: documentId } });
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    if (doc.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, credits: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if ((user.credits ?? 0) < 1) {
      return NextResponse.json(
        { error: "Insufficient signature credits", credits: user.credits ?? 0, code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    // Decrement 1 credit
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

    const host = req.headers.get("host") || "hanko.proximalcoast.com";
    const protocol = host.includes("lvh.me") || host.includes("localhost") ? "http" : "https";
    const signingUrl = `${protocol}://${host}/sign/${documentId}`;

    await prisma.bkd_document.update({
      where: { id: documentId },
      data: {
        signerEmail: email,
        auditLog: [
          ...(Array.isArray(doc.auditLog) ? doc.auditLog : []),
          {
            event: "SIGNING_LINK_SENT",
            timestamp: new Date().toISOString(),
            recipient: email,
            url: signingUrl,
            sentBy: session.user.id,
          },
        ] as any,
      },
    });

    // TODO: wire up Resend when RESEND_API_KEY is set
    // For now, log the signing link
    if (process.env.RESEND_API_KEY) {
      console.log(`[Hanko] TODO: send Resend email to ${email}: ${signingUrl}`);
    } else {
      console.log(`[Hanko] Signing link for ${email}: ${signingUrl}`);
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    return NextResponse.json({ success: true, credits: updatedUser?.credits ?? 0 });
  } catch (error) {
    console.error("[Hanko] Error sending signing link:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
