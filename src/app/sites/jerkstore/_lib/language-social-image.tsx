import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getLanguagePage } from "./language-pages";

export const size = { width: 1200, height: 630 };

export default async function Image({ params }: { params: Promise<{ language: string }> }) {
  const page = getLanguagePage((await params).language);
  if (!page) notFound();
  const name = page.name;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fde047", color: "#111", padding: "56px 64px", border: "16px solid #111", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 800 }}><span>JERKSTORE</span><span>{page.category}</span></div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: name.length > 20 ? 70 : 88, fontWeight: 900, lineHeight: 1.05 }}><span>AI INSULTS IN</span><span style={{ color: "#dc2626" }}>{name.toUpperCase()}.</span></div>
      <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>Your language. Your topic. Fresh AI roasts.</div>
    </div>,
    size,
  );
}
