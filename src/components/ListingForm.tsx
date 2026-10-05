import { useRef, useState, type FormEvent } from "react";
import { Camera, Check, ImagePlus, Save, X, ArrowRight } from "lucide-react";
import { images, type Equipment, type Category } from "../data";
import { Photo } from "./PhotoGallery";
import { savePhoto } from "../photoStorage";
const categories: Category[] = [
  "Tractors",
  "Harvesters",
  "Planting",
  "Hay & forage",
  "Attachments",
  "Irrigation",
];
type Draft = {
  minimumTractorHp: string;
  pto: string;
  hitch: string;
  hydraulics: string;
  transportDimensions: string;
  transportWeight: string;
  title: string;
  category: Category;
  condition: Equipment["condition"];
  kind: string;
  year: number;
  hours: number;
  horsepower: number;
  owner: string;
  city: string;
  state: string;
  zip: string;
  rent: string;
  price: string;
  description: string;
  attachments: string;
  pickupNotes: string;
  photos: string[];
  workingWidth: string;
  capacity: string;
  brand: string;
  weeklyRent: string;
  monthlyRent: string;
  deposit: string;
  deliveryFee: string;
  deliveryAvailable: boolean;
};
const blank: Draft = {
  minimumTractorHp: "",
  pto: "",
  hitch: "",
  hydraulics: "",
  transportDimensions: "",
  transportWeight: "",
  title: "",
  category: "Tractors",
  condition: "Excellent",
  kind: "both",
  year: new Date().getFullYear(),
  hours: 0,
  horsepower: 0,
  owner: "",
  city: "",
  state: "",
  zip: "",
  rent: "",
  price: "",
  description: "",
  attachments: "",
  pickupNotes: "",
  photos: [],
  workingWidth: "",
  capacity: "",
  brand: "",
  weeklyRent: "",
  monthlyRent: "",
  deposit: "",
  deliveryFee: "75",
  deliveryAvailable: true,
};
function starting(e?: Equipment): Draft {
  if (e)
    return {
      ...blank,
      ...e,
      kind: e.rent && e.price ? "both" : e.rent ? "rent" : "buy",
      rent: String(e.rent || ""),
      price: String(e.price || ""),
      attachments: e.attachments || "",
      pickupNotes: e.pickupNotes || "",
      photos: e.photos?.length ? e.photos : [e.image],
      workingWidth: e.workingWidth || "",
      capacity: e.capacity || "",
      brand: e.brand || "",
      minimumTractorHp: String(e.minimumTractorHp || ""),
      pto: e.pto || "",
      hitch: e.hitch || "",
      hydraulics: e.hydraulics || "",
      transportDimensions: e.transportDimensions || "",
      transportWeight: e.transportWeight || "",
      weeklyRent: String(e.weeklyRent || ""),
      monthlyRent: String(e.monthlyRent || ""),
      deposit: String(e.deposit || ""),
      deliveryFee: String(e.deliveryFee ?? 75),
      deliveryAvailable: e.deliveryAvailable ?? true,
    };
  try {
    return {
      ...blank,
      ...JSON.parse(localStorage.getItem("farmigo-listing-draft") || "{}"),
    };
  } catch {
    return blank;
  }
}
export default function ListingForm({
  equipment,
  onSave,
  notify,
}: {
  equipment?: Equipment;
  onSave: (equipment: Equipment) => void;
  notify: (message: string) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => starting(equipment)),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const change = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));
  async function upload(files: FileList | null) {
    if (!files) return;
    setError("");
    if (draft.photos.length + files.length > 6) {
      setError("Choose up to six photos in total.");
      return;
    }
    setUploading(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) added.push(await savePhoto(file));
      setDraft((prev) => ({ ...prev, photos: [...prev.photos, ...added] }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Photos could not be saved.",
      );
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  function saveDraft() {
    try {
      localStorage.setItem("farmigo-listing-draft", JSON.stringify(draft));
      notify("Draft saved. Reopen List equipment to continue.");
    } catch {
      setError(
        "Your browser could not save the draft. Free some storage and try again.",
      );
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (uploading) return;
    const fallback =
      draft.category === "Harvesters"
        ? images.harvester
        : draft.category === "Hay & forage"
          ? images.baler
          : draft.category === "Planting"
            ? images.planter
            : draft.category === "Irrigation"
              ? images.field
              : images.tractor;
    const entry: Equipment = {
      ...equipment,
      ...draft,
      id: equipment?.id || crypto.randomUUID(),
      title: draft.title.trim(),
      owner: draft.owner.trim(),
      city: draft.city.trim(),
      state: draft.state.toUpperCase(),
      minimumTractorHp: Number(draft.minimumTractorHp) || undefined,
      rent: draft.kind === "buy" ? 0 : Number(draft.rent),
      price: draft.kind === "rent" ? 0 : Number(draft.price),
      photos: draft.photos,
      image: draft.photos[0] || fallback,
      initials: draft.owner
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
      weeklyRent: Number(draft.weeklyRent) || undefined,
      monthlyRent: Number(draft.monthlyRent) || undefined,
      deposit: Number(draft.deposit) || 0,
      deliveryFee: Number(draft.deliveryFee) || 0,
      rating: equipment?.rating || "New",
      reviews: equipment?.reviews || 0,
      tag: equipment?.tag || "Just listed",
    };
    onSave(entry);
    try {
      localStorage.removeItem("farmigo-listing-draft");
    } catch {
      /* Session listing remains available. */
    }
  }
  const text = (
    key:
      | "title"
      | "owner"
      | "city"
      | "state"
      | "zip"
      | "rent"
      | "price"
      | "attachments"
      | "pickupNotes"
      | "workingWidth"
      | "capacity"
      | "brand"
      | "pto" | "hitch" | "hydraulics" | "transportDimensions" | "transportWeight" | "minimumTractorHp",
    label: string,
    options: {
      required?: boolean;
      type?: string;
      maxLength?: number;
      pattern?: string;
      placeholder?: string;
    } = {},
  ) => (
    <label>
      {label}
      <input
        name={key}
        value={draft[key]}
        onChange={(ev) => change(key, ev.target.value)}
        {...options}
        min={options.type === "number" ? 1 : undefined}
      />
    </label>
  );
  return (
    <form className="modal-form listing-form" onSubmit={submit}>
      <p className="modal-intro">
        {equipment
          ? "Keep your equipment details up to date."
          : "Give your equipment another good season. Save a draft whenever you need a break."}{" "}
        This is a local demo listing.
      </p>
      <section className="upload-section" aria-label="Equipment photos">
        <div className="upload-heading">
          <h3>
            <Camera size={18} />
            Equipment photos
          </h3>
          <span>{draft.photos.length} / 6</span>
        </div>
        <div
          className="upload-zone"
          onDragOver={(ev) => ev.preventDefault()}
          onDrop={(ev) => {
            ev.preventDefault();
            if (!uploading) void upload(ev.dataTransfer.files);
          }}
        >
          <ImagePlus size={28} />
          <p>Drag photos here, or choose from your device.</p>
          <button
            className="button outline"
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
          >
            {uploading ? "Saving photos…" : "Choose photos"}
          </button>
          <span>
            JPG, PNG, or WebP · Up to 10 MB each · Stored in this browser
          </span>
          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            aria-label="Upload equipment photos"
            onChange={(ev) => void upload(ev.target.files)}
          />
        </div>
        <div className="upload-previews">
          {draft.photos.map((photo, index) => (
            <div key={photo}>
              <Photo
                src={photo}
                alt={`Uploaded equipment photo ${index + 1}`}
              />
              <button
                className="upload-remove"
                type="button"
                aria-label={`Remove photo ${index + 1}`}
                onClick={() =>
                  change(
                    "photos",
                    draft.photos.filter((_, i) => i !== index),
                  )
                }
              >
                <X size={14} />
              </button>
              <button
                className="cover-choice"
                type="button"
                aria-pressed={index === 0}
                onClick={() =>
                  change("photos", [
                    photo,
                    ...draft.photos.filter((_, i) => i !== index),
                  ])
                }
              >
                {index === 0 ? (
                  <>
                    <Check size={12} />
                    Cover
                  </>
                ) : (
                  "Make cover"
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      <div className="listing-form-grid">
        <label className="span-two">
          Listing type
          <select
            name="listingKind"
            value={draft.kind}
            onChange={(ev) => change("kind", ev.target.value)}
          >
            <option value="both">Available to rent and buy</option>
            <option value="rent">For rent only</option>
            <option value="buy">For sale only</option>
          </select>
        </label>
        {text("title", "Equipment name", {
          required: true,
          maxLength: 80,
          pattern: ".*\\S.*",
          placeholder: "e.g. John Deere 6M 220",
        })}
        {text("brand", "Brand", {
          maxLength: 40,
          placeholder: "e.g. John Deere",
        })}
        <label>
          Category
          <select
            name="category"
            value={draft.category}
            onChange={(ev) => change("category", ev.target.value as Category)}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Condition
          <select
            name="condition"
            value={draft.condition}
            onChange={(ev) =>
              change("condition", ev.target.value as Equipment["condition"])
            }
          >
            <option>Excellent</option>
            <option>Good</option>
          </select>
        </label>
        {(["year", "hours", "horsepower"] as const).map((key) => (
          <label key={key}>
            {key === "year"
              ? "Year"
              : key === "hours"
                ? "Operating hours"
                : "Horsepower"}
            <input
              type="number"
              name={key}
              value={draft[key]}
              required
              min={key === "year" ? 1950 : 0}
              max={key === "year" ? new Date().getFullYear() + 1 : undefined}
              step="1"
              onChange={(ev) => change(key, Number(ev.target.value))}
            />
          </label>
        ))}
        {text("owner", "Farm or owner name", {
          required: true,
          maxLength: 60,
          pattern: ".*\\S.*",
        })}
        {text("city", "City", {
          required: true,
          maxLength: 60,
          pattern: ".*\\S.*",
        })}
        {text("state", "State abbreviation", {
          required: true,
          maxLength: 2,
          pattern: "[A-Za-z]{2}",
          placeholder: "IA",
        })}
        {text("zip", "ZIP code", {
          required: true,
          maxLength: 5,
          pattern: "[0-9]{5}",
          placeholder: "50309",
        })}
        {draft.kind !== "buy" &&
          text("rent", "Rental price / day ($)", {
            required: true,
            type: "number",
          })}
        {draft.kind !== "rent" &&
          text("price", "Sale price ($)", { required: true, type: "number" })}
        {["Planting", "Attachments", "Harvesters"].includes(draft.category) &&
          text("workingWidth", "Working width / row configuration", {
            maxLength: 80,
            placeholder: "e.g. 20 ft or 6 rows",
          })}
        {["Harvesters", "Hay & forage", "Irrigation"].includes(
          draft.category,
        ) &&
          text("capacity", "Capacity / output", {
            maxLength: 80,
            placeholder: "e.g. 300 gallons per minute",
          })}
        {draft.kind !== "buy" && (
          <>
            {(
              ["weeklyRent", "monthlyRent", "deposit", "deliveryFee"] as const
            ).map((key) => (
              <label key={key}>
                {key === "weeklyRent"
                  ? "Weekly rental price ($, optional)"
                  : key === "monthlyRent"
                    ? "30-day rental price ($, optional)"
                    : key === "deposit"
                      ? "Refundable deposit ($)"
                      : "Delivery fee ($)"}
                <input
                  type="number"
                  min={key === "deposit" || key === "deliveryFee" ? 0 : 1}
                  value={draft[key]}
                  onChange={(ev) => change(key, ev.target.value)}
                />
              </label>
            ))}
            <label>
              Delivery available
              <select
                value={draft.deliveryAvailable ? "yes" : "no"}
                onChange={(ev) =>
                  change("deliveryAvailable", ev.target.value === "yes")
                }
              >
                <option value="yes">Yes</option>
                <option value="no">Pickup only</option>
              </select>
            </label>
          </>
        )}
        <div className="span-two form-section-heading"><h3>Connections & transport</h3><p>Optional details. Leave unknown requirements blank so neighbors know to ask.</p></div>
        {text("minimumTractorHp", "Minimum tractor horsepower (optional)", {type:"number"})}
        {text("pto", "PTO connection", {maxLength:80,placeholder:"e.g. 540 rpm, 6 spline"})}
        {text("hitch", "Hitch connection", {maxLength:80,placeholder:"e.g. Category II"})}
        {text("hydraulics", "Hydraulic requirements", {maxLength:200})}
        {text("transportDimensions", "Transport dimensions (include units)", {maxLength:120})}
        {text("transportWeight", "Transport weight (include units)", {maxLength:80})}
        {text("attachments", "Included attachments", {
          maxLength: 200,
          placeholder: "List what is included",
        })}
        {text("pickupNotes", "Pickup and transport notes", {
          maxLength: 500,
          placeholder: "Loading access, delivery options…",
        })}
        <label className="span-two">
          About your equipment
          <textarea
            required
            rows={4}
            maxLength={2000}
            name="description"
            value={draft.description}
            onChange={(ev) => change("description", ev.target.value)}
            placeholder="What is it great for? What should a neighbor know?"
          />
        </label>
      </div>
      <div className="listing-form-footer">
        <button className="button outline" type="button" onClick={saveDraft}>
          <Save size={16} />
          Save draft
        </button>
        <button className="button primary" type="submit" disabled={uploading}>
          {equipment ? "Save changes" : "Create demo listing"}
          <ArrowRight size={16} />
        </button>
      </div>
      <p className="form-note">
        No photos? We’ll add a category illustration. Uploaded photos remain on
        this device.
      </p>
    </form>
  );
}
