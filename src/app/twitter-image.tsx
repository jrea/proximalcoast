import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Proximal Coast — Software & Projects";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 86px",
          overflow: "hidden",
          backgroundColor: "#0D1418",
          backgroundImage: "linear-gradient(rgba(138,164,180,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(138,164,180,0.08) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
          color: "#E6E3DC",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -210,
            right: -90,
            width: 580,
            height: 580,
            border: "1px solid rgba(138,164,180,0.35)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 90,
            bottom: -300,
            width: 670,
            height: 670,
            border: "1px solid rgba(150,147,140,0.24)",
            borderRadius: "50%",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", width: 690 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#8AA4B4", fontSize: 22, fontWeight: 700, letterSpacing: 5 }}>
            <div style={{ width: 54, height: 2, backgroundColor: "#96938C" }} />
            PROXIMAL COAST
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 84, fontWeight: 900, letterSpacing: -4, lineHeight: 0.85 }}>
            PROXIMATIC
          </div>
          <div style={{ display: "flex", marginTop: 5, color: "#8AA4B4", fontSize: 84, fontWeight: 900, letterSpacing: -4, lineHeight: 0.85 }}>
            YOUR EVENT.
          </div>
          <div style={{ display: "flex", marginTop: 38, color: "#9AA8AE", fontSize: 22, lineHeight: 1.4 }}>
            ACTIVE PROJECT / AI EVENT ROSTERING
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", width: 270, height: 270, alignItems: "center", justifyContent: "center", border: "1px solid rgba(138,164,180,0.55)", transform: "rotate(-7deg)" }}>
          <div style={{ position: "absolute", width: 190, height: 190, border: "1px solid rgba(150,147,140,0.7)", transform: "rotate(45deg)" }} />
          <div style={{ position: "absolute", width: 220, height: 220, border: "1px solid rgba(138,164,180,0.25)", borderRadius: "50%" }} />
          <div style={{ display: "flex", color: "#E6E3DC", fontSize: 76, fontWeight: 900, letterSpacing: -6, transform: "rotate(7deg)" }}>PC</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
