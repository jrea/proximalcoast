import { getArchivePostData } from "@/lib/posts";
import { ImageResponse } from "next/og";

export const alt = "Proximal Coast archived post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = Promise<{ slug: string }>;

export default async function Image({ params }: { params: Params }) {
  const { slug } = await params;
  const postData = await getArchivePostData(slug);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          padding: "76px 86px",
          backgroundColor: "#0D1418",
          backgroundImage: "linear-gradient(rgba(138,164,180,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(138,164,180,0.08) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
          color: "#E6E3DC",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#8AA4B4", fontSize: 22, fontWeight: 700, letterSpacing: 5 }}>
          <div style={{ width: 54, height: 2, backgroundColor: "#96938C" }} />
          PROXIMAL COAST / ARCHIVE
        </div>
        <div style={{ display: "flex", maxWidth: 1030, marginTop: 38, fontSize: 72, fontWeight: 900, letterSpacing: -2, lineHeight: 0.98 }}>
          {postData.title}
        </div>
        <div style={{ display: "flex", marginTop: 34, color: "#9AA8AE", fontSize: 26, fontWeight: 700, letterSpacing: 3 }}>
          {postData.date} / ARCHIVED
        </div>
      </div>
    ),
    { ...size },
  );
}
