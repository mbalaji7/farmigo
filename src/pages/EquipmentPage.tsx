import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MapPin,
  Share2,
  MessageCircle,
  Star,
  Check,
  Truck,
  Tractor,
} from "lucide-react";
import { type Equipment, images } from "../data";
import { PageLink, useRouter } from "../router";
import { type DemoProfile } from "../accountTypes";
import { type EquipmentRequest } from "../marketplaceTypes";
import PhotoGallery from "../components/PhotoGallery";
import BookingPanel from "../components/BookingPanel";
export default function EquipmentPage({
  equipment: e,
  saved,
  toggleSave,
  notify,
  onMessage,
  profile,
  requests,
  onRequest,
}: {
  equipment: Equipment;
  saved: boolean;
  toggleSave: (id: string) => void;
  notify: (text: string) => void;
  onMessage: () => void;
  profile: DemoProfile | null;
  requests: EquipmentRequest[];
  onRequest: (request: EquipmentRequest) => void;
}) {
  const { path, navigate } = useRouter();
  const preferred = new URLSearchParams(path.split("?")[1]).get("mode");
  const [mode, setMode] = useState<"rent" | "buy">(
    preferred === "buy" && e.price > 0 ? "buy" : e.rent > 0 ? "rent" : "buy",
  );
  useEffect(() => {
    document.title = `${e.title} — Farmigo`;
  }, [e.title]);
  async function share() {
    try {
      await navigator.clipboard.writeText(location.href);
      notify("Equipment link copied.");
    } catch {
      notify(
        "Copy the page address from your browser to share this equipment.",
      );
    }
  }
  return (
    <div className="equipment-detail-page page-width">
      <div className="breadcrumb">
        <PageLink page="marketplace">
          <ArrowLeft size={15} />
          All equipment
        </PageLink>
        <span>/</span>
        <span>{e.category}</span>
      </div>
      <div className="detail-page-heading">
        <div>
          <span className="eyebrow">
            {e.category.toUpperCase()} · {e.condition.toUpperCase()} CONDITION
          </span>
          <h1>{e.title}</h1>
          <p>
            <MapPin size={15} />
            {e.city}, {e.state} {e.zip}
            <span>·</span>
            <Star size={14} />
            {e.rating} ({e.reviews} sample reviews)
          </p>
        </div>
        <div className="detail-page-actions">
          <button className="button outline" onClick={share}>
            <Share2 size={16} />
            Share
          </button>
          <button
            className="button outline"
            aria-pressed={saved}
            onClick={() => toggleSave(e.id)}
          >
            <Heart size={16} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      <div className="detail-page-layout">
        <div>
          <PhotoGallery
            photos={e.photos?.length ? e.photos : [e.image, images.field]}
            title={e.title}
          />
          <p className="photo-disclaimer">
            Sample listing photos are illustrations. The field photo shows
            example farm surroundings.
          </p>
          <div className="detail-content">
            <h2>Ready for a good day’s work.</h2>
            <p>{e.description}</p>
            <h2>The details that matter.</h2>
            <dl className="specification-grid">
              <div>
                <dt>Year</dt>
                <dd>{e.year}</dd>
              </div>
              <div>
                <dt>Operating hours</dt>
                <dd>{e.hours.toLocaleString()} hrs</dd>
              </div>
              <div>
                <dt>Condition</dt>
                <dd>{e.condition}</dd>
              </div>
              <div>
                <dt>Power requirement / rating</dt>
                <dd>{e.horsepower ? `${e.horsepower} HP` : "Ask the owner"}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{e.category}</dd>
              </div>
              <div>
                <dt>Included attachments</dt>
                <dd>{e.attachments || "Confirm with the owner"}</dd>
              </div>
            </dl>
            <h2>Pickup & transport.</h2>
            <div className="transport-card">
              <Truck size={23} />
              <div>
                <strong>
                  {e.city}, {e.state} · ZIP {e.zip}
                </strong>
                <p>
                  {e.pickupNotes ||
                    "The owner will provide an exact pickup address after confirming your request. Discuss loading, towing, and delivery before making arrangements."}
                </p>
              </div>
            </div>
            <h2>Your equipment owner.</h2>
            <div className="owner-profile">
              <span className="owner-avatar">{e.initials}</span>
              <div>
                <strong>{e.owner}</strong>
                <span>
                  <BadgeCheck size={14} />
                  Sample owner profile
                </span>
              </div>
            </div>
            <button className="button outline" onClick={onMessage}>
              <MessageCircle size={16} />
              Message owner
            </button>
            <div className="equipment-care">
              <Tractor size={20} />
              <p>
                Confirm compatibility, operating requirements, and the condition
                of the equipment with the owner.
              </p>
              <Check size={18} />
            </div>
          </div>
        </div>
        <aside className="detail-page-booking">
          {e.rent > 0 && e.price > 0 && (
            <div className="detail-mode-tabs">
              <button
                className={mode === "rent" ? "selected" : ""}
                aria-pressed={mode === "rent"}
                onClick={() => {
                  setMode("rent");
                  navigate(`/equipment/${e.id}?mode=rent`);
                }}
              >
                Rent
              </button>
              <button
                className={mode === "buy" ? "selected" : ""}
                aria-pressed={mode === "buy"}
                onClick={() => {
                  setMode("buy");
                  navigate(`/equipment/${e.id}?mode=buy`);
                }}
              >
                Buy
              </button>
            </div>
          )}
          <BookingPanel
            key={mode}
            equipment={e}
            mode={mode}
            profile={profile}
            requests={requests}
            onRequest={onRequest}
            close={() => navigate("marketplace")}
          />
        </aside>
      </div>
    </div>
  );
}
