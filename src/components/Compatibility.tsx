import { useState } from "react";
import type { Equipment } from "../data";
import { checkCompatibility } from "../compatibility";
export default function Compatibility({
  equipment: e,
}: {
  equipment: Equipment;
}) {
  const [power, setPower] = useState(""),
    [pto, setPto] = useState(""),
    [hitch, setHitch] = useState(""),
    [checked, setChecked] = useState(false);
  const result = checkCompatibility(e, Number(power), pto, hitch);
  const rows = [
    [
      "Minimum tractor power",
      e.minimumTractorHp ? `${e.minimumTractorHp} HP` : "Confirm with owner",
    ],
    ["PTO connection", e.pto || "Confirm with owner"],
    ["Hitch connection", e.hitch || "Confirm with owner"],
    ["Hydraulics", e.hydraulics || "Confirm with owner"],
    ["Transport dimensions", e.transportDimensions || "Confirm with owner"],
    ["Transport weight", e.transportWeight || "Confirm with owner"],
  ];
  return (
    <section className="compatibility-section">
      <h2>Connections & transport.</h2>
      <dl className="specification-grid">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="readable-note">
        Owner-provided details need confirmation before use. The photos may not
        show every included attachment.
      </p>
      <details className="compatibility-checker">
        <summary>Check your tractor’s fit</summary>
        <form
          className="modal-form"
          onSubmit={(ev) => {
            ev.preventDefault();
            setChecked(true);
          }}
        >
          <div className="listing-form-grid">
            <label>
              Your tractor horsepower
              <input
                type="number"
                min="1"
                max="2000"
                value={power}
                onChange={(ev) => {
                  setPower(ev.target.value);
                  setChecked(false);
                }}
                placeholder="e.g. 120"
              />
            </label>
            <label>
              Your PTO connection
              <input
                value={pto}
                maxLength={80}
                onChange={(ev) => {
                  setPto(ev.target.value);
                  setChecked(false);
                }}
                placeholder="e.g. 540 rpm, 6 spline"
              />
            </label>
            <label>
              Your hitch connection
              <input
                value={hitch}
                maxLength={80}
                onChange={(ev) => {
                  setHitch(ev.target.value);
                  setChecked(false);
                }}
                placeholder="e.g. Category II"
              />
            </label>
          </div>
          <button className="button outline" type="submit">
            Check listed requirements
          </button>
        </form>
        {checked && (
          <div
            className={`compatibility-result ${result.issues.length ? "has-issues" : ""}`}
            role="status"
          >
            <h3>
              {result.issues.length
                ? "Requirements differ"
                : result.missing.length
                  ? "More details needed"
                  : "Listed power and connections match"}
            </h3>
            {[...result.issues, ...result.missing].map((t) => (
              <p key={t}>{t}</p>
            ))}
            <p>
              Confirm hydraulics, capacity, loading and full operating
              requirements with the owner. This check cannot certify
              compatibility.
            </p>
          </div>
        )}
      </details>
    </section>
  );
}
