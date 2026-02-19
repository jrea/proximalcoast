
import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { prisma } from "@/lib/db";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const { documentId, signatureData } = await req.json(); // signatureData is base64 png

    const doc = await prisma.bkd_document.findUnique({
      where: { id: documentId },
    });

    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    // Load PDF
    const pdfBytes = await s3.getFile(doc.s3Key);
    if (!pdfBytes) return NextResponse.json({ error: "File not found in S3" }, { status: 404 });

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const config = doc.config as any; // { x, y, width, height, page } (in percentages 0-100)
    
    if (!config || !config.page) {
        return NextResponse.json({ error: "Document configuration missing" }, { status: 400 });
    }

    // Embed signature
    const signatureImage = await pdfDoc.embedPng(signatureData);
    const pageIndex = config.page - 1; // 1-based index from UI usually
    
    if (pageIndex < 0 || pageIndex >= pages.length) {
         return NextResponse.json({ error: "Invalid page number in config" }, { status: 400 });
    }

    const page = pages[pageIndex];
    const { width: pageWidth, height: pageHeight } = page.getSize();
    
    // Calculate coordinates from percentages
    // X is simple: (x% / 100) * width
    const x = (config.x / 100) * pageWidth;
    const w = (config.width / 100) * pageWidth;
    const h = (config.height / 100) * pageHeight;
    
    // Y in PDF is from bottom. 
    // config.y is from top (percentage).
    // y = pageHeight - (yFromTop + height)
    // yFromTop = (config.y / 100) * pageHeight
    const y = pageHeight - ((config.y / 100) * pageHeight) - h;

    page.drawImage(signatureImage, {
      x: x,
      y: y, 
      width: w,
      height: h,
    });

    const signedPdfBytes = await pdfDoc.save();
    const signedKey = `signed/${doc.id}.pdf`;

    await s3.upload(signedKey, signedPdfBytes, "application/pdf");

    await prisma.bkd_document.update({
      where: { id: documentId },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error signing document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
