import { ArrowUpRight, BadgeCheck, Heart, MapPin, Star, UserRound } from "lucide-react";
import { type Equipment } from "../data";
import { currency } from "../utils";
import { PageLink } from "../router";
import { ownerPath } from "../ownerData";
import { Photo } from "./PhotoGallery";
export default function EquipmentCard({
  equipment: e,
  mode,
  distance,
  saved,
  toggleSave,
  open,
}: {
  equipment: Equipment;
  mode: "rent" | "buy";
  distance?: number;
  saved: boolean;
  toggleSave: (id: string) => void;
  open: (e: Equipment) => void;
}) {
  const displayMode =
    mode === "rent"
      ? e.rent > 0
        ? "rent"
        : "buy"
      : e.price > 0
        ? "buy"
        : "rent";
  return (
    <article className="equipment-card">
      <div className="card-photo">
        <button
          className="photo-button"
          onClick={() => open(e)}
          aria-label={`View ${e.title}`}
        >
          <Photo src={e.image} alt={`${e.title} on a farm`} loading="lazy" />
        </button>
        <span
          className={`listing-badge ${displayMode === "buy" ? "sale" : ""}`}
        >
          {displayMode === "rent" ? "For rent" : "For sale"}
        </span>
        <button
          className={`save-button ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${e.title}`}
          aria-pressed={saved}
          onClick={() => toggleSave(e.id)}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
        {e.tag && (
          <span className="photo-tag">
            {e.tag === "Popular pick" && <span>✦</span>}
            {e.tag}
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="card-category">
          {e.category}
          <span>
            <Star size={12} fill="currentColor" /> {e.rating}
          </span>
        </div>
        <button className="card-title" onClick={() => open(e)}>
          {e.title}
        </button>
        <p className="card-location">
          <MapPin size={13} />
          {e.city}, {e.state}
          {distance !== undefined && (
            <span title="Demo city-center distance">
              {" "}
              · {Math.round(distance)} mi
            </span>
          )}
        </p>
        <div className="card-specs">
          <span>{e.year}</span>
          <span>{e.hours.toLocaleString()} hrs</span>
          {e.horsepower > 0 && <span>{e.horsepower} HP</span>}
        </div>
        <div className="card-bottom">
          <div className="card-price">
            {currency(displayMode === "rent" ? e.rent : e.price)}
            {displayMode === "rent" && <span> / day</span>}
          </div>
          <button
            className="card-arrow"
            aria-label={`View details for ${e.title}`}
            onClick={() => open(e)}
          >
            <ArrowUpRight size={18} />
          </button>
        </div>
        <PageLink
          className="card-owner"
          page={ownerPath(e)}
          title={
            e.ownerId
              ? "Local demo owner; verification is not implemented"
              : "Sample owner profile; badge is illustrative"
          }
        >
          {e.ownerId ? <UserRound size={14} /> : <BadgeCheck size={14} />}
          {e.owner}
        </PageLink>
      </div>
    </article>
  );
}
