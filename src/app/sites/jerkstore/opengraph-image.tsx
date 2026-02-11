import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Jerkstore - AI-Powered Ego Destruction";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FDE047",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "24px solid black",
          padding: "48px",
        }}
      >
        <div
          style={{
            background: "black",
            color: "white",
            padding: "16px 48px",
            fontSize: "120px",
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: "40px",
            boxShadow: "16px 16px 0px 0px rgba(0,0,0,0.5)",
            transform: "rotate(-2deg)",
          }}
        >
          Jerkstore
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.1,
            color: "black",
          }}
        >
          The World's Most Aggressive AI Insult Generator
        </div>
        <div
          style={{
            marginTop: "40px",
            background: "#EF4444",
            color: "white",
            padding: "8px 24px",
            fontSize: "32px",
            fontWeight: 700,
            textTransform: "uppercase",
            transform: "rotate(1deg)",
          }}
        >
          Zero Moral Compass. Infinite Rage.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
