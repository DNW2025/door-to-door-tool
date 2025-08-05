import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Farben für Marker je Status
const statusColors = {
  "Nicht angetroffen": "#e5e7eb",
  "Kein Interesse": "#fbbf24",
  "Abgeschlossen": "#22c55e",
  "Bestandskunde": "#3b82f6",
  "Termin": "#0ea5e9",
};

function getMarkerIcon(status) {
  return L.divIcon({
    className: "custom-marker",
    html: `<span style="display:inline-block;width:20px;height:20px;background:${statusColors[status]};border-radius:50%;border:2px solid #374151;"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
}

export default function MapView({ addresses }) {
  // Nur Adressen mit Koordinaten anzeigen
  const locs = addresses.filter((a) => a.lat && a.lng);

  // Karte auf Deutschland mittig, falls keine Adressen
  const center = locs.length
    ? [locs[0].lat, locs[0].lng]
    : [51.1657, 10.4515];

  return (
    <div className="rounded-2xl shadow mt-8 mb-4" style={{ height: "450px", overflow: "hidden" }}>
      <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locs.map((a, i) => (
          <Marker
            key={i}
            position={[a.lat, a.lng]}
            icon={getMarkerIcon(a.status)}
          >
            <Popup>
              <b>
                {a.Straße} {a.Hausnummer}, {a.PLZ} {a.Ort}
              </b>
              <br />
              Status: <b>{a.status}</b>
              <br />
              Notiz: {a.note || "—"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
