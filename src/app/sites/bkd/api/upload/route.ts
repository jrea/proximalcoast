
import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const key = `uploads/${crypto.randomUUID()}-${filename}`;

    await s3.upload(key, buffer, file.type);

    const doc = await prisma.bkd_document.create({
      data: {
        filename,
        s3Key: key,
        status: "PENDING",
        config: {}, // Initial empty config
      },
    });

    return NextResponse.json(doc);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
