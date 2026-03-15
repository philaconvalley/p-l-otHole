"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from "react-map-gl";
import type { HeatmapLayer, CircleLayer, SymbolLayer } from "react-map-gl";
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

const heatmapLayer: HeatmapLayer = {
  id: "hazard-heat",
  type: "heatmap",
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "severityScore"], 0, 0, 100, 1],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 14, 3],
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0,   "rgba(16,185,129,0)",
      0.2, "rgba(217,119,6,0.6)",
      0.5, "rgba(249,115,22,0.85)",
      0.8, "rgba(239,68,68,0.95)",
      1,   "rgba(239,68,68,1)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 20, 14, 40],
    "heatmap-opacity": 0.85,
  },
};

const clusterCircleLayer: CircleLayer = {
  id: "clusters",
  type: "circle",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": ["step", ["get", "point_count"], "#F99300", 5, "#f97316", 20, "#ef4444"],
    "circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 20, 40],
    "circle-opacity": 0.9,
    "circle-stroke-width": 2,
    "circle-stroke-color": "rgba(255,255,255,0.2)",
  },
};

const clusterCountLayer: SymbolLayer = {
  id: "cluster-count",
  type: "symbol",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-size": 13,
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
  },
  paint: { "text-color": "#fff" },
};

const unclusteredLayer: CircleLayer = {
  id: "unclustered-point",
  type: "circle",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#F99300",
    "circle-radius": 6,
    "circle-opacity": 0.9,
    "circle-stroke-width": 1,
    "circle-stroke-color": "rgba(255,255,255,0.3)",
  },
};

export function HazardMap({ hazards, viewMode = "Map view" }: { hazards: MapHazard[]; viewMode?: string }) {
  const [popup, setPopup] = useState<MapHazard | null>(null);

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: hazards
      .filter(h => h.location?.latitude && h.location?.longitude)
      .map(h => ({
        type: "Feature" as const,
        properties: { id: h.id, slug: h.slug, name: h.name, severityScore: h.severityScore },
        geometry: { type: "Point" as const, coordinates: [h.location.longitude, h.location.latitude] },
      })),
  };

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: -75.1652, latitude: 39.9526, zoom: 13 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onClick={() => setPopup(null)}
    >
      <NavigationControl position="top-left" showCompass={false} />

      {viewMode === "Map view" && (
        <>
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
                background: "#1e1e1e", border: "1px solid #333",
                borderRadius: 10, padding: "10px 14px 12px", minWidth: 170,
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
                  <span style={{ color: "#4b5563", fontSize: 11, marginLeft: "auto" }}>↑ {popup.votes.up}</span>
                </div>
                <a href={`/hazard/${popup.slug}`} style={{ color: "#F99300", fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
                  View details →
                </a>
              </div>
            </Popup>
          )}
        </>
      )}

      {viewMode === "Heatmap" && (
        <Source type="geojson" data={geojson}>
          <Layer {...heatmapLayer} />
        </Source>
      )}

      {viewMode === "Clusters" && (
        <Source type="geojson" data={geojson} cluster clusterMaxZoom={14} clusterRadius={50}>
          <Layer {...clusterCircleLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredLayer} />
        </Source>
      )}
    </Map>
  );
}
