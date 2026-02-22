import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { s3 } from "@/lib/s3";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be 10MB or less." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const documentHash = crypto.createHash("sha256").update(buffer).digest("hex");

    const key = `hanko/${crypto.randomUUID()}-${file.name}`;
    await s3.upload(key, buffer, "application/pdf");

    const doc = await prisma.hanko_document.create({
      data: {
        filename: file.name,
        s3Key: key,
        status: "PENDING",
        config: {},
        documentHash,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ id: doc.id, documentHash });
  } catch (error) {
    console.error("[Hanko] Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
