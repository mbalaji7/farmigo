import { useState } from "react";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import type { EquipmentRequest } from "../marketplaceTypes";
import type { Equipment } from "../data";
import { rentalStages, rentalStage, nextRentalStage } from "../rentalProgress";
import { PageLink } from "../router";
import { currency } from "../utils";
import { savePhoto } from "../photoStorage";
import { Photo } from "../components/PhotoGallery";
export default function RentalProgress({
  request: r,
  equipment: e,
  onUpdate,
}: {
  request: EquipmentRequest;
  equipment?: Equipment;
  onUpdate: (r: EquipmentRequest) => void;
}) {
  const [notes, setNotes] = useState(r.conditionNotes || ""),
    [error, setError] = useState(""),
    [uploading, setUploading] = useState(false),
    [notice, setNotice] = useState("");
  const stage = rentalStage(r),
    index = rentalStages.findIndex((s) => s === stage),
    next = nextRentalStage(r),
    photos = r.conditionPhotos || [];
  async function upload(files: FileList | null) {
    if (!files) return;
    setError("");
    if (photos.length + files.length > 6) {
      setError("Choose up to six condition photos per rental.");
      return;
    }
    setUploading(true);
    try {
      const added = [];
      for (const file of Array.from(files))
        added.push({
          src: await savePhoto(file),
          phase:
            stage === "returned" ? ("return" as const) : ("pickup" as const),
        });
      onUpdate({ ...r, conditionPhotos: [...photos, ...added] });
      setNotice("Condition photos saved on this device.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Photos could not be saved.",
      );
    } finally {
      setUploading(false);
    }
  }
  return (
    <section className="workspace-page page-width rental-progress-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">YOUR RENTAL, FROM START TO FINISH</span>
          <h1>{r.equipmentTitle}</h1>
          <p>
            FG-{r.id.slice(0, 8).toUpperCase()} ·{" "}
            {r.sample ? "Sample rental" : "Local demo rental"}
          </p>
        </div>
        <PageLink className="button outline" page="/account">
          My requests
        </PageLink>
      </div>
      <ol className="rental-timeline" aria-label="Rental progress">
        {rentalStages.map((s, i) => (
          <li
            key={s}
            className={i <= index ? "complete" : ""}
            aria-current={i === index ? "step" : undefined}
          >
            <span>{i < index ? <CheckCircle2 size={19} /> : i + 1}</span>
            <strong>
              {
                {
                  requested: "Requested",
                  accepted: "Accepted",
                  pickup: "Ready for pickup",
                  "in-use": "In use",
                  returned: "Returned",
                }[s]
              }
            </strong>
          </li>
        ))}
      </ol>
      <p className="readable-note" role="status">
        Current status: {stage.replace("-", " ")}.{" "}
        {r.status === "pending"
          ? "The owner dashboard must accept this request before pickup can be recorded."
          : ""}{" "}
        Progress actions update this browser only.
      </p>
      <div className="rental-summary-grid">
        <article className="workflow-card">
          <h2>
            <CalendarDays size={20} />
            Rental details
          </h2>
          <dl>
            <dt>Dates</dt>
            <dd>
              {r.start} through {r.end}
            </dd>
            <dt>Owner</dt>
            <dd>{r.owner}</dd>
            <dt>Neighbor</dt>
            <dd>{r.customerName}</dd>
            <dt>Transport</dt>
            <dd>
              {r.delivery === "delivery"
                ? `Delivery${r.deliveryAddress ? ` · ${r.deliveryAddress}` : ""}`
                : "Pickup"}
            </dd>
            <dt>Quoted total</dt>
            <dd>{currency(r.total)} · No payment processed</dd>
          </dl>
          <PageLink className="text-link" page={`/equipment/${r.equipmentId}`}>
            View equipment
          </PageLink>
        </article>
        <article className="workflow-card">
          <h2>Pickup instructions</h2>
          <p>
            {e?.pickupNotes ||
              "Contact the owner to confirm the exact address, loading access, collection time, and transport arrangements."}
          </p>
          <p className="readable-note">
            Keep copies of condition photos before pickup and after return.
          </p>
          {next && (
            <button
              className="button primary"
              disabled={uploading}
              onClick={() => {
                onUpdate({
                  ...r,
                  stage: next,
                  stageUpdatedAt: new Date().toISOString(),
                });
                setNotice("Demo rental progress updated.");
              }}
            >
              {next === "pickup"
                ? "Mark ready for pickup"
                : next === "in-use"
                  ? "Record pickup — in use"
                  : "Record equipment returned"}
            </button>
          )}
          {stage === "returned" && (
            <p className="inline-success">
              Return recorded. Confirm the final condition and any deposit
              arrangements with the owner.
            </p>
          )}
        </article>
      </div>
      <article className="workflow-card condition-record">
        <h2>Condition record</h2>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            onUpdate({ ...r, conditionNotes: notes.trim() });
            setNotice("Condition notes saved.");
          }}
        >
          <label>
            Pickup and return notes
            <textarea
              rows={4}
              maxLength={2000}
              value={notes}
              onChange={(ev) => setNotes(ev.target.value)}
              placeholder="Record existing marks, attachments, operating hours, and return condition."
            />
          </label>
          <button className="button outline" type="submit">
            Save condition notes
          </button>
        </form>
        <label className="condition-upload">
          Add {stage === "returned" ? "return" : "pickup"} photos (up to six
          total)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={(ev) => void upload(ev.target.files)}
          />
        </label>
        <p className="readable-note">
          JPG, PNG, WebP · Up to 10 MB each · Stored on this device
        </p>
        <div className="condition-photos">
          {photos.map((p, i) => (
            <figure key={`${p.src}-${i}`}>
              <Photo src={p.src} alt={`${p.phase} condition photo ${i + 1}`} />
              <figcaption>
                {p.phase === "return" ? "Return" : "Pickup"} · Photo {i + 1}
              </figcaption>
            </figure>
          ))}
        </div>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        {notice && <p role="status">{notice}</p>}
      </article>
    </section>
  );
}
