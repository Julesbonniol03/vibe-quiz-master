import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          position: "relative",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Background orbs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,240,255,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,45,123,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Border */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            bottom: 16,
            borderRadius: 28,
            border: "2px solid rgba(0,240,255,0.2)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 36,
            background: "linear-gradient(135deg, #00f0ff, #ff2d7b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 0 40px rgba(0,240,255,0.3), 0 0 80px rgba(0,240,255,0.1)",
          }}
        >
          <span style={{ fontSize: 80, fontWeight: 900, color: "white" }}>T</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            background: "linear-gradient(90deg, #00f0ff, #ff2d7b)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 16,
            display: "flex",
          }}
        >
          Teubé
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#94a3b8",
            fontWeight: 500,
            marginBottom: 24,
            display: "flex",
          }}
        >
          L&apos;élite de la Culture G en mode Cyber-Luxe
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginBottom: 36,
          }}
        >
          {[
            { icon: "🧠", text: "1000+ Questions" },
            { icon: "⚡", text: "17 Catégories" },
            { icon: "🔥", text: "3 Modes de Jeu" },
          ].map((s) => (
            <div
              key={s.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "8px 16px",
              }}
            >
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 16, color: "#cbd5e1", fontWeight: 600 }}>{s.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 48px",
            borderRadius: 16,
            background: "linear-gradient(90deg, rgba(0,240,255,0.15), rgba(255,45,123,0.15))",
            border: "1.5px solid rgba(0,240,255,0.3)",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: "#00f0ff" }}>
            Jouer maintenant →
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
