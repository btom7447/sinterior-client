import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Sintherior – Verified Artisans & Quality Building Materials in Nigeria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo "S" mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "rgba(255,255,255,0.15)",
            marginBottom: 32,
            fontSize: 56,
            fontWeight: 800,
          }}
        >
          S
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.2,
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Sintherior
        </div>
        <div
          style={{
            fontSize: 24,
            opacity: 0.9,
            marginTop: 16,
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Hire Verified Artisans & Buy Quality Building Materials in Nigeria
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
            fontSize: 16,
            opacity: 0.8,
          }}
        >
          <span>Trusted Artisans</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>Quality Materials</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>Real Estate</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
