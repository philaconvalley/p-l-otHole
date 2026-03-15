"use client";

import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface Props {
  latitude: number;
  longitude: number;
  name: string;
}

export function HazardMiniMap({ latitude, longitude, name }: Props) {
  return (
    <Map
      initialViewState={{ latitude, longitude, zoom: 16 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={TOKEN}
      interactive={false}
      attributionControl={false}
    >
      <Marker latitude={latitude} longitude={longitude} anchor="bottom">
        <div
          title={name}
          style={{
            width: 14, height: 14, borderRadius: "50%",
            background: "#F99300",
            boxShadow: "0 0 0 4px rgba(249,147,0,0.3)",
          }}
        />
      </Marker>
    </Map>
  );
}
