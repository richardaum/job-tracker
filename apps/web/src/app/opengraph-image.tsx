import { ImageResponse } from "next/og";

import { APP_DESCRIPTION, APP_TITLE } from "@/app/metadata";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#254e70",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.02em" }}>{APP_TITLE}</div>
      <div style={{ marginTop: 24, fontSize: 32, maxWidth: 900, color: "rgba(255,255,255,0.8)" }}>
        {APP_DESCRIPTION}
      </div>
    </div>,
    { ...size },
  );
}
