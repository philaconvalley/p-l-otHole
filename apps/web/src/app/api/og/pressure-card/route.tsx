import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const open     = searchParams.get("open")     ?? "0";
  const critical = searchParams.get("critical") ?? "0";
  const avgDays  = searchParams.get("avgDays")  ?? "0";
  const date = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#171717",
          display: "flex",
          flexDirection: "column",
          padding: "64px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle grid background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          display: "flex",
        }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: "#f5f5f5", display: "flex" }}>
              P<span style={{ color: "#F99300" }}>(l)ot</span>Hole
            </div>
            <div style={{ fontSize: 17, color: "#9ca3af", marginTop: 6, letterSpacing: 1 }}>
              Philadelphia Civic Pressure Report
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>{date}</div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 28, marginTop: 56, zIndex: 1 }}>
          <div style={{
            flex: 1, background: "#1e1e1e", borderRadius: 20, padding: "36px 32px",
            border: "1px solid #333", display: "flex", flexDirection: "column",
          }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: "#f5f5f5", lineHeight: 1 }}>{open}</div>
            <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 12, textTransform: "uppercase", letterSpacing: 2 }}>Open Hazards</div>
          </div>

          <div style={{
            flex: 1, background: "#1e1e1e", borderRadius: 20, padding: "36px 32px",
            border: "1px solid rgba(239,68,68,0.4)", display: "flex", flexDirection: "column",
          }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: "#ef4444", lineHeight: 1 }}>{critical}</div>
            <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 12, textTransform: "uppercase", letterSpacing: 2 }}>Critical</div>
          </div>

          <div style={{
            flex: 1, background: "#1e1e1e", borderRadius: 20, padding: "36px 32px",
            border: "1px solid rgba(249,147,0,0.4)", display: "flex", flexDirection: "column",
          }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: "#F99300", lineHeight: 1 }}>{avgDays}</div>
            <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 12, textTransform: "uppercase", letterSpacing: 2 }}>Avg Days Open</div>
          </div>
        </div>

        {/* CTA bar */}
        <div style={{
          marginTop: 40, background: "rgba(249,147,0,0.08)", border: "1px solid rgba(249,147,0,0.25)",
          borderRadius: 16, padding: "24px 32px", display: "flex", alignItems: "center",
          justifyContent: "space-between", zIndex: 1,
        }}>
          <div style={{ fontSize: 20, color: "#f5f5f5", fontWeight: 600 }}>
            These roads need fixing. Add your voice.
          </div>
          <div style={{
            background: "#F99300", color: "#fff", fontSize: 16, fontWeight: 700,
            padding: "12px 28px", borderRadius: 999,
          }}>
            vabch.org
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "auto", display: "flex", justifyContent: "space-between",
          alignItems: "center", zIndex: 1, paddingTop: 24,
        }}>
          <div style={{ fontSize: 13, color: "#4b5563", fontStyle: "italic" }}>
            "Map it. Name it. Shame it. Fix it."
          </div>
          <div style={{ fontSize: 13, color: "#4b5563" }}>#PlotHole · #PhillyRoads</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
