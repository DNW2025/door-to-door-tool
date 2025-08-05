import React, { useState } from "react";
import MapView from "./MapView";

// Grünton: #22c55e, Grundgrau: #f3f4f6 (hell), #e5e7eb (Tabellenzeilen), #111827 (Schrift)
const STATUS_OPTIONS = [
  "Nicht angetroffen",
  "Kein Interesse",
  "Abgeschlossen",
  "Bestandskunde",
  "Termin",
];

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const [header, ...rows] = lines;
  return rows.map((row) => {
    const [PLZ, Ort, Straße, Hausnummer] = row.split(",");
    return {
      PLZ: PLZ?.trim(),
      Ort: Ort?.trim(),
      Straße: Straße?.trim(),
      Hausnummer: Hausnummer?.trim(),
      status: "Nicht angetroffen",
      note: "",
    };
  });
}

// Geokodierung für Adressen (OpenStreetMap Nominatim)
async function geocodeAddress(address) {
  const query = encodeURIComponent(
    `${address.Straße} ${address.Hausnummer}, ${address.PLZ} ${address.Ort}, Deutschland`
  );
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": "door-to-door-tool (learning project)" },
  });
  const data = await response.json();
  if (data && data[0]) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }
  return null;
}

// Alle Adressen auf einmal geokodieren
async function geocodeAddresses(addresses, setAddresses, setLoading) {
  setLoading(true);
  const results = [];
  for (const addr of addresses) {
    const coords = await geocodeAddress(addr);
    results.push({ ...addr, ...(coords || {}) });
  }
  setAddresses(results);
  setLoading(false);
}

export default function App() {
  const [addresses, setAddresses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Statistik berechnen
  const stats = STATUS_OPTIONS.map((option) => ({
    status: option,
    count: addresses.filter((a) => a.status === option).length,
  }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const parsed = parseCSV(event.target.result);
      // Koordinaten laden
      await geocodeAddresses(parsed, setAddresses, setLoading);
    };
    reader.readAsText(file);
  };

  const handleStatusChange = (idx, newStatus) => {
    setAddresses((prev) =>
      prev.map((addr, i) => (i === idx ? { ...addr, status: newStatus } : addr))
    );
  };

  const handleNoteChange = (idx, newNote) => {
    setAddresses((prev) =>
      prev.map((addr, i) => (i === idx ? { ...addr, note: newNote } : addr))
    );
  };

  return (
    <div
      className="min-h-screen bg-gray-100 px-4 py-8 font-sans"
      style={{ background: "#f3f4f6" }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Door-to-Door Status Tool
        </h1>
        {/* Import */}
        <div className="mb-8 bg-white rounded-2xl shadow p-6 flex items-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mr-4"
          />
          <span className="text-gray-700">
            Lade deine Adressen als <b>CSV</b> hoch (Spalten: PLZ, Ort, Straße, Hausnummer)
          </span>
        </div>

        {/* Statistik */}
        <div className="mb-8 flex gap-6">
          {stats.map((s) => (
            <div
              key={s.status}
              className="flex-1 bg-white rounded-xl shadow p-4 text-center"
              style={{
                borderLeft:
                  s.count > 0 && s.status === "Abgeschlossen"
                    ? "6px solid #22c55e"
                    : "6px solid #e5e7eb",
              }}
            >
              <div className="text-xl font-bold">{s.count}</div>
              <div
                className="text-sm"
                style={{
                  color: s.status === "Abgeschlossen" ? "#22c55e" : "#374151",
                }}
              >
                {s.status}
              </div>
            </div>
          ))}
        </div>

        {/* Tabelle */}
        {addresses.length > 0 && (
          <div className="bg-white rounded-2xl shadow overflow-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-3">PLZ</th>
                  <th className="py-2 px-3">Ort</th>
                  <th className="py-2 px-3">Straße</th>
                  <th className="py-2 px-3">Hausnummer</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Notiz</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((a, i) => (
                  <tr
                    key={i}
                    className={i % 2 ? "bg-gray-100" : ""}
                  >
                    <td className="py-2 px-3">{a.PLZ}</td>
                    <td className="py-2 px-3">{a.Ort}</td>
                    <td className="py-2 px-3">{a.Straße}</td>
                    <td className="py-2 px-3">{a.Hausnummer}</td>
                    <td className="py-2 px-3">
                      <select
                        value={a.status}
                        onChange={(e) =>
                          handleStatusChange(i, e.target.value)
                        }
                        className="rounded-xl border border-gray-300 px-2 py-1"
                        style={{
                          background:
                            a.status === "Abgeschlossen"
                              ? "#22c55e33"
                              : "#fff",
                          color:
                            a.status === "Abgeschlossen"
                              ? "#15803d"
                              : "#111827",
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={a.note}
                        onChange={(e) =>
                          handleNoteChange(i, e.target.value)
                        }
                        placeholder="Notiz..."
                        className="w-full px-2 py-1 rounded-xl border border-gray-300"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Kartenansicht */}
        <MapView addresses={addresses} />
      </div>
    </div>
  );
}
