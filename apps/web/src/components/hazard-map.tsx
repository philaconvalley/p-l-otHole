"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { severityLabel } from "@/lib/format";

export interface MapHazard {
  id: string;
  slug: string;
  name: string;
  severityScore: number;
  votes: { up: number; down: number };
  location: { latitude: number; longitude: number };
  repairStatus: string;
  type: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  moderate: "#d97706",
  low:      "#10b981",
};

export function HazardMap({ hazards }: { hazards: MapHazard[] }) {
  const [popup, setPopup] = useState<MapHazard | null>(null);

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: -75.1652, latitude: 39.9526, zoom: 13 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onClick={() => setPopup(null)}
    >
      <NavigationControl position="top-left" showCompass={false} />

      {hazards.map(h => {
        const { latitude, longitude } = h.location;
        if (!latitude || !longitude) return null;
        const sev   = severityLabel(h.severityScore, h.votes.up);
        const color = SEVERITY_COLORS[sev] ?? "#9ca3af";
        return (
          <Marker
            key={h.id}
            longitude={longitude}
            latitude={latitude}
            anchor="center"
            onClick={e => { e.originalEvent.stopPropagation(); setPopup(h); }}
          >
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              background: color,
              border: "2px solid rgba(255,255,255,0.25)",
              cursor: "pointer",
              boxShadow: `0 0 10px ${color}99`,
              transition: "transform 0.1s",
            }} />
          </Marker>
        );
      })}

      {popup && (
        <Popup
          longitude={popup.location.longitude}
          latitude={popup.location.latitude}
          onClose={() => setPopup(null)}
          closeButton={false}
          offset={14}
          className="plothole-popup"
        >
          <div style={{
            background: "#1e1e1e",
            border: "1px solid #333",
            borderRadius: 10,
            padding: "10px 14px 12px",
            minWidth: 170,
          }}>
            <p style={{ color: "#f5f5f5", fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
              {popup.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{
                display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                background: SEVERITY_COLORS[severityLabel(popup.severityScore, popup.votes.up)] ?? "#9ca3af",
                flexShrink: 0,
              }} />
              <span style={{ color: "#9ca3af", fontSize: 11, textTransform: "capitalize" }}>
                {severityLabel(popup.severityScore, popup.votes.up)}
              </span>
              <span style={{ color: "#4b5563", fontSize: 11, marginLeft: "auto" }}>
                ↑ {popup.votes.up}
              </span>
            </div>
            <a
              href={`/hazard/${popup.slug}`}
              style={{ color: "#F99300", fontSize: 12, fontWeight: 500, textDecoration: "none" }}
            >
              View details →
            </a>
          </div>
        </Popup>
      )}
    </Map>
  );
}
