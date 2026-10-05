import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { type Equipment } from "../data";
import { type DemoProfile } from "../accountTypes";
import { type OwnerReview, reviewSummary } from "../ownerData";
import { PageLink, useRouter } from "../router";
import EquipmentCard from "../components/EquipmentCard";
export default function OwnerProfile({
  name,
  ownerId,
  equipment,
  profile,
  currentProfile,
  reviews,
  onReview,
  toggleSave,
  saved,
  onMessage,
  isSample,
}: {
  name: string;
  ownerId: string;
  equipment: Equipment[];
  profile?: DemoProfile;
  currentProfile: DemoProfile | null;
  reviews: OwnerReview[];
  onReview: (review: OwnerReview) => void;
  toggleSave: (id: string) => void;
  saved: string[];
  onMessage: (e: Equipment) => void;
  isSample: boolean;
}) {
  const [sort, setSort] = useState("newest"),
    [rating, setRating] = useState(5),
    [body, setBody] = useState(""),
    [error, setError] = useState("");
  const { navigate } = useRouter();
  const summary = reviewSummary(reviews);
  const publicListings = equipment.filter(
    (e) => !e.status || e.status === "active",
  );
  const existing = reviews.find(
    (r) => r.authorId === currentProfile?.id && !!r.authorId,
  );
  const owns = currentProfile?.id === ownerId;
  const location = profile?.city
    ? `${profile.city}, ${profile.state}`
    : equipment[0]
      ? `${equipment[0].city}, ${equipment[0].state}`
      : "Location not provided";
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!currentProfile || owns || existing) return;
    if (body.trim().length < 10) {
      setError("Write at least 10 characters about your demo experience.");
      return;
    }
    onReview({
      id: crypto.randomUUID(),
      ownerKey: ownerId,
      authorId: currentProfile.id,
      author: currentProfile.name,
      rating,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    });
    setBody("");
    setError("");
  }
  const sorted = [...reviews].sort((a, b) =>
    sort === "highest"
      ? b.rating - a.rating
      : sort === "lowest"
        ? a.rating - b.rating
        : b.createdAt.localeCompare(a.createdAt),
  );
  return (
    <section className="owner-public-page page-width">
      <div className="breadcrumb">
        <PageLink page="marketplace">
          <ArrowLeft size={15} />
          All equipment
        </PageLink>
        <span>/</span>
        <span>Equipment owner</span>
      </div>
      <div className="owner-public-heading">
        <span className="owner-public-avatar">
          {name
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0])
            .join("")}
        </span>
        <div>
          <span className="eyebrow">A GOOD NEIGHBOR FOR YOUR NEXT SEASON</span>
          <h1>{name}</h1>
          <p>
            <MapPin size={15} />
            {location}
            <span>·</span>
            <Star size={14} />
            {summary.rating}
            {summary.count > 0 && ` (${summary.count} demo reviews)`}
          </p>
        </div>
        {equipment[0] && (
          <button
            className="button primary"
            onClick={() => onMessage(equipment[0])}
          >
            <MessageCircle size={17} />
            Message owner
          </button>
        )}
      </div>
      <div className="owner-info-grid">
        <article>
          <h2>
            <UserRound size={18} />
            About the farm
          </h2>
          <p>
            {profile?.bio ||
              "A local equipment owner helping neighbors put the right tools to work. Explore the listings below and discuss your equipment needs directly."}
          </p>
          <span>
            {profile
              ? `Demo member since ${new Date(profile.createdAt).getFullYear()}`
              : "Sample farm profile"}
          </span>
        </article>
        <article>
          <h2>
            <Clock3 size={18} />
            Response information
          </h2>
          <p>
            {isSample
              ? "Sample response time: usually within one day. This is illustrative information, not a measured guarantee."
              : "Response time is not available yet. Start a conversation to discuss availability and transport."}
          </p>
        </article>
        <article>
          <h2>
            <ShieldCheck size={18} />
            {isSample ? "Sample verification" : "Verification status"}
          </h2>
          <details className="verification-details">
            <summary>
              <BadgeCheck size={17} />
              {isSample
                ? "Illustrative badge — what it means"
                : "Unverified demo owner — learn more"}
            </summary>
            <p>
              Farmigo has not verified identity, equipment ownership, insurance,
              or documents in this frontend preview. A production verification
              process requires a backend and review. Confirm equipment details
              directly with the owner.
            </p>
          </details>
        </article>
      </div>
      <section className="owner-equipment">
        <div className="section-heading">
          <div>
            <span className="eyebrow">GOOD TOOLS, READY FOR GOOD WORK</span>
            <h2>Equipment from {name}.</h2>
            <p>
              {publicListings.length} active{" "}
              {publicListings.length === 1 ? "listing" : "listings"}
            </p>
          </div>
        </div>
        {publicListings.length ? (
          <div className="equipment-grid">
            {publicListings.map((e) => (
              <EquipmentCard
                key={e.id}
                equipment={e}
                mode="rent"
                saved={saved.includes(e.id)}
                toggleSave={toggleSave}
                open={(e) => navigate(`/equipment/${e.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No active equipment right now.</h3>
            <p>
              Check back when the owner has tools available for the next season.
            </p>
          </div>
        )}
      </section>
      <section className="owner-reviews">
        <div className="review-overview">
          <span className="eyebrow">FROM ONE NEIGHBOR TO ANOTHER</span>
          <h2>Reviews & experiences.</h2>
          <div className="owner-rating">
            <strong>{summary.rating}</strong>
            <span>
              <span className="mini-stars">★★★★★</span>
              <span>{summary.count} demo reviews</span>
            </span>
          </div>
          <p>
            All reviews here are sample content or browser-local demo
            submissions. They are not verified transactions.
          </p>
          {owns ? (
            <p>
              You manage this demo profile. Reviews are for other neighbors.
            </p>
          ) : !currentProfile ? (
            <PageLink className="button outline" page="/account">
              Sign in to leave a demo review
            </PageLink>
          ) : existing ? (
            <div className="inline-success" role="status">
              Your demo review is saved. Thank you for sharing your experience.
            </div>
          ) : (
            <form className="review-form" onSubmit={submit}>
              <h3>Share a demo experience.</h3>
              <div
                className="star-picker"
                role="group"
                aria-label="Review rating"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-label={`Rate ${value} ${value === 1 ? "star" : "stars"}`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                  >
                    <Star
                      size={23}
                      fill={value <= rating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              <label>
                Your demo review
                <textarea
                  required
                  minLength={10}
                  maxLength={1200}
                  rows={4}
                  value={body}
                  onChange={(ev) => setBody(ev.target.value)}
                  placeholder="What would help another neighbor?"
                />
              </label>
              {error && (
                <p className="inline-error" role="alert">
                  {error}
                </p>
              )}
              <button className="button primary" type="submit">
                Save demo review
              </button>
            </form>
          )}
        </div>
        <div className="review-entries">
          <label className="review-sort">
            Sort reviews
            <select
              aria-label="Sort reviews"
              value={sort}
              onChange={(ev) => setSort(ev.target.value)}
            >
              <option value="newest">Most recent</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </label>
          {sorted.length ? (
            sorted.map((r) => (
              <article className="owner-review" key={r.id}>
                <div>
                  <span className="owner-avatar">{r.author[0]}</span>
                  <div>
                    <strong>{r.author}</strong>
                    <span>
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {r.sample ? "Sample review" : "Local demo review"}
                    </span>
                  </div>
                  <span className="review-score">
                    <Star size={13} fill="currentColor" />
                    {r.rating}
                  </span>
                </div>
                <p>{r.body}</p>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <Star size={28} />
              <h3>The first story is still to come.</h3>
              <p>No demo reviews have been added yet.</p>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
