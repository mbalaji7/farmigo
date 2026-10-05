import { useEffect, useState } from "react";
import { MapPin, ZoomIn, ZoomOut } from "lucide-react";
import type { Equipment } from "../data";
import { cityCenters } from "../discovery";
import EquipmentCard from "./EquipmentCard";
const mapLabels: Record<string, { x: number; y: number }> = {
  "Des Moines": { x: 20, y: 78 },
  Ankeny: { x: 34, y: 56 },
  Ames: { x: 37, y: 30 },
  Boone: { x: 15, y: 20 },
  Newton: { x: 57, y: 73 },
  "Cedar Rapids": { x: 83, y: 39 },
};
const mapPoint = (c: { lat: number; lng: number }) => ({
  x: 12 + ((c.lng + 94.2) / 2.8) * 76,
  y: 15 + ((42.35 - c.lat) / 1.1) * 70,
});
export default function EquipmentMap({
  equipment,
  mode,
  saved,
  toggleSave,
  open,
}: {
  equipment: Equipment[];
  mode: "rent" | "buy";
  saved: string[];
  toggleSave: (id: string) => void;
  open: (e: Equipment) => void;
}) {
  const [selected, setSelected] = useState(""),
    [zoom, setZoom] = useState(1);
  useEffect(() => {
    if (
      selected &&
      !equipment.some((e) => e.city.toLowerCase() === selected.toLowerCase())
    )
      setSelected("");
  }, [selected, equipment]);
  const cities = Object.values(cityCenters).filter((c) =>
    equipment.some((e) => e.city.toLowerCase() === c.city.toLowerCase()),
  );
  const visible = selected
    ? equipment.filter((e) => e.city.toLowerCase() === selected.toLowerCase())
    : equipment;
  const unknown = equipment.filter(
    (e) =>
      !Object.values(cityCenters).some(
        (c) => c.city.toLowerCase() === e.city.toLowerCase(),
      ),
  );
  return (
    <div className="map-results">
      <section
        className="equipment-map"
        aria-label="Approximate Iowa equipment locations"
      >
        <div className="map-legend">
          <strong>Iowa area map</strong>
          <span>Schematic city centers · Not pickup addresses</span>
        </div>
        <div className="map-canvas">
          <div
            className="map-geography"
            style={{ transform: `scale(${zoom})` }}
          >
            <svg
              viewBox="0 0 600 470"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <rect width="600" height="470" fill="#edf1e2" />
              {cities.map((c) => {
                const dot = mapPoint(c),
                  label = mapLabels[c.city];
                return (
                  <g key={c.city}>
                    <line
                      x1={dot.x * 6}
                      y1={dot.y * 4.7}
                      x2={label.x * 6}
                      y2={label.y * 4.7}
                      stroke="#738f61"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx={dot.x * 6}
                      cy={dot.y * 4.7}
                      r="5"
                      fill="#28533d"
                    />
                  </g>
                );
              })}
              <path
                d="M0 75H600M0 180H600M0 285H600M0 390H600M120 0V470M240 0V470M360 0V470M480 0V470"
                stroke="#d4dfc5"
              />
              <path
                d="M0 310 Q150 290 190 220 T330 280 T600 220"
                fill="none"
                stroke="#a4c3c5"
                strokeWidth="9"
              />
              <path
                d="M75 420L130 210L245 330L545 190"
                fill="none"
                stroke="#d2c9a8"
                strokeWidth="6"
              />
            </svg>
            {cities.map((c) => {
              const count = equipment.filter(
                (e) => e.city.toLowerCase() === c.city.toLowerCase(),
              ).length;
              return (
                <button
                  key={c.city}
                  className={`map-pin ${selected === c.city ? "selected" : ""}`}
                  style={{
                    left: `${mapLabels[c.city].x}%`,
                    top: `${mapLabels[c.city].y}%`,
                  }}
                  aria-label={`${c.city}: ${count} ${count === 1 ? "listing" : "listings"}`}
                  aria-pressed={selected === c.city}
                  onClick={() => setSelected(selected === c.city ? "" : c.city)}
                >
                  <MapPin size={18} />
                  <strong>{count}</strong>
                  <span>{c.city}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="map-controls">
          <button
            className="icon-button"
            aria-label="Zoom in map"
            disabled={zoom >= 1.5}
            onClick={() => setZoom(Math.min(1.5, zoom + 0.25))}
          >
            <ZoomIn />
          </button>
          <button
            className="icon-button"
            aria-label="Zoom out map"
            disabled={zoom <= 1}
            onClick={() => setZoom(Math.max(1, zoom - 0.25))}
          >
            <ZoomOut />
          </button>
          <button
            className="text-link"
            onClick={() => {
              setSelected("");
              setZoom(1);
            }}
          >
            Show all locations
          </button>
        </div>
      </section>
      <div className="map-list">
        <div className="map-list-heading" role="status">
          <h3>{selected || "All matching equipment"}</h3>
          <p>
            {visible.length} {visible.length === 1 ? "listing" : "listings"}
            {selected ? " in this city" : ""}
          </p>
        </div>
        {unknown.length > 0 && (
          <p className="readable-note">
            {unknown.length} listings have locations outside this demo map and
            remain in the list.
          </p>
        )}
        <div className="equipment-grid">
          {visible.map((e) => (
            <EquipmentCard
              key={e.id}
              equipment={e}
              mode={mode}
              saved={saved.includes(e.id)}
              toggleSave={toggleSave}
              open={open}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
