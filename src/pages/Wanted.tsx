import { useState, type FormEvent } from "react";
import { Plus, Search, Sprout } from "lucide-react";
import type { WantedPost, WantedOffer } from "../wantedTypes";
import { wantedStatus } from "../wantedTypes";
import type { Equipment } from "../data";
import type { DemoProfile } from "../accountTypes";
import { PageLink } from "../router";
import { currency, localDate } from "../utils";
import Modal from "../components/Modal";
const categories = [
  "Tractors",
  "Harvesters",
  "Planting",
  "Hay & forage",
  "Attachments",
  "Irrigation",
];
export function sampleWanted(): WantedPost[] {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return [
    {
      id: "sample-wanted-planter",
      authorId: "sample-neighbor",
      author: "Riverbend Farm (sample)",
      title: "Six-row planter for next season",
      category: "Planting",
      kind: "rent",
      city: "Des Moines, IA",
      neededBy: "",
      budget: 200,
      description:
        "Sample post: Looking for a six-row planter with pickup or delivery options. Please confirm tractor power and row configuration.",
      createdAt: new Date().toISOString(),
      expiresAt: localDate(d),
      status: "open",
      sample: true,
      offers: [],
    },
  ];
}
export default function Wanted({
  posts,
  equipment,
  profile,
  onSave,
  onOffer,
  onStatus,
  onList,
}: {
  posts: WantedPost[];
  equipment: Equipment[];
  profile: DemoProfile | null;
  onSave: (p: WantedPost) => void;
  onOffer: (id: string, o: WantedOffer) => void;
  onStatus: (id: string, status: WantedPost["status"]) => void;
  onList: () => void;
}) {
  const [creating, setCreating] = useState(false),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All categories"),
    [showClosed, setShowClosed] = useState(false),
    [responding, setResponding] = useState<WantedPost | null>(null),
    [notice, setNotice] = useState("");
  const owned = equipment.filter(
    (e) =>
      e.ownerId === profile?.id &&
      !!profile &&
      (!e.status || e.status === "active"),
  );
  const visible = posts.filter(
    (p) =>
      (wantedStatus(p, localDate()) === "open" ||
        (showClosed && p.authorId === profile?.id)) &&
      (category === "All categories" || p.category === category) &&
      `${p.title} ${p.city} ${p.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!profile) return;
    const f = new FormData(ev.currentTarget),
      expires = new Date();
    expires.setDate(expires.getDate() + 30);
    onSave({
      id: crypto.randomUUID(),
      authorId: profile.id,
      author: profile.farm || profile.name,
      title: String(f.get("title")).trim(),
      category: String(f.get("category")),
      kind: f.get("kind") === "buy" ? "buy" : "rent",
      city: String(f.get("city")).trim(),
      neededBy: String(f.get("neededBy")),
      budget: Number(f.get("budget")) || 0,
      description: String(f.get("description")).trim(),
      createdAt: new Date().toISOString(),
      expiresAt: localDate(expires),
      status: "open",
      offers: [],
    });
    setCreating(false);
    setNotice("Wanted post saved on this browser. It expires after 30 days.");
  }
  const eligible = responding
    ? owned.filter(
        (e) =>
          e.category === responding.category &&
          (responding.kind === "rent" ? e.rent > 0 : e.price > 0) &&
          !responding.offers.some(
            (o) => o.authorId === profile?.id && o.equipmentId === e.id,
          ),
      )
    : [];
  return (
    <section className="workspace-page page-width">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">LET THE RIGHT TOOL FIND YOU</span>
          <h1>Equipment wanted.</h1>
          <p>Tell your neighbors what you need, where, and when.</p>
        </div>
        {profile ? (
          <button className="button primary" onClick={() => setCreating(true)}>
            <Plus size={17} />
            Post equipment wanted
          </button>
        ) : (
          <PageLink className="button primary" page="/account">
            Sign in to post
          </PageLink>
        )}
      </div>
      <p className="readable-note">
        This board contains sample posts and browser-local requests. Responses
        stay on this device.
      </p>
      <div className="wanted-filters">
        <label>
          <Search size={18} />
          <input
            aria-label="Search wanted posts"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Search equipment or city"
          />
        </label>
        <select
          aria-label="Wanted equipment category"
          value={category}
          onChange={(ev) => setCategory(ev.target.value)}
        >
          <option>All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {profile && (
          <label className="check-label">
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(ev) => setShowClosed(ev.target.checked)}
            />
            Include my closed posts
          </label>
        )}
      </div>
      {notice && <p role="status">{notice}</p>}
      <div className="wanted-posts">
        {visible.map((p) => (
          <article className="workflow-card wanted-post" key={p.id}>
            <div className="action-row">
              <span className="status-chip">
                {p.sample ? "Sample post" : wantedStatus(p, localDate())}
              </span>
              <span>
                {p.kind === "rent" ? "Looking to rent" : "Looking to buy"} ·{" "}
                {p.category}
              </span>
            </div>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            <dl>
              <dt>Farm</dt>
              <dd>{p.author}</dd>
              <dt>Location</dt>
              <dd>{p.city}</dd>
              <dt>Needed by</dt>
              <dd>{p.neededBy || "Discuss with requester"}</dd>
              <dt>Budget</dt>
              <dd>
                {p.budget
                  ? `${currency(p.budget)}${p.kind === "rent" ? " / day" : ""}`
                  : "Open to offers"}
              </dd>
              <dt>Expires</dt>
              <dd>{p.expiresAt}</dd>
            </dl>
            {p.offers.length > 0 && (
              <div className="wanted-offers">
                <h3>
                  {p.offers.length} local{" "}
                  {p.offers.length === 1 ? "response" : "responses"}
                </h3>
                {p.offers.map((o) => (
                  <div key={o.id}>
                    <strong>{o.author}</strong>
                    <p>{o.message}</p>
                    <PageLink
                      className="text-link"
                      page={`/equipment/${o.equipmentId}`}
                    >
                      View offered equipment
                    </PageLink>
                  </div>
                ))}
              </div>
            )}
            <div className="action-row">
              {p.authorId === profile?.id ? (
                <button
                  className="button outline"
                  onClick={() =>
                    onStatus(p.id, p.status === "open" ? "fulfilled" : "open")
                  }
                >
                  {p.status === "open" ? "Mark fulfilled" : "Reopen post"}
                </button>
              ) : wantedStatus(p, localDate()) === "open" ? (
                profile ? (
                  <button
                    className="button outline"
                    onClick={() => setResponding(p)}
                  >
                    Respond with my equipment
                  </button>
                ) : (
                  <PageLink className="text-link" page="/account">
                    Sign in to respond
                  </PageLink>
                )
              ) : null}
            </div>
          </article>
        ))}
        {!visible.length && (
          <div className="empty-state">
            <Sprout size={32} />
            <h2>No wanted posts match.</h2>
            <p>Broaden your search or post the equipment you need.</p>
            <button
              className="button outline"
              onClick={() => {
                setQuery("");
                setCategory("All categories");
              }}
            >
              Clear wanted filters
            </button>
          </div>
        )}
      </div>
      {creating && (
        <Modal
          title="What equipment do you need?"
          close={() => setCreating(false)}
        >
          <form className="modal-form" onSubmit={submit}>
            <label>
              Request title
              <input
                name="title"
                required
                minLength={5}
                maxLength={100}
                pattern=".*\S.*"
                placeholder="e.g. Disc harrow for fall fieldwork"
              />
            </label>
            <div className="listing-form-grid">
              <label>
                Category
                <select name="category">
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                I want to
                <select name="kind">
                  <option value="rent">Rent equipment</option>
                  <option value="buy">Buy equipment</option>
                </select>
              </label>
              <label>
                City and state
                <input
                  name="city"
                  required
                  maxLength={100}
                  pattern=".*\S.*"
                  defaultValue={
                    profile?.city ? `${profile.city}, ${profile.state}` : ""
                  }
                />
              </label>
              <label>
                Needed by (optional)
                <input name="neededBy" type="date" min={localDate()} />
              </label>
              <label>
                Budget ($, per day for rentals)
                <input
                  name="budget"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Optional"
                />
              </label>
            </div>
            <label>
              What should an owner know?
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={1500}
                rows={4}
                placeholder="Tasks, attachments, transport, and operating requirements."
              />
            </label>
            <button className="button primary" type="submit">
              Create demo wanted post
            </button>
            <p className="form-note">
              Visible in this browser for 30 days. No external publication.
            </p>
          </form>
        </Modal>
      )}
      {responding && (
        <Modal
          title="Offer matching equipment"
          close={() => setResponding(null)}
        >
          {eligible.length ? (
            <form
              className="modal-form"
              onSubmit={(ev) => {
                ev.preventDefault();
                if (!profile) return;
                const f = new FormData(ev.currentTarget);
                onOffer(responding.id, {
                  id: crypto.randomUUID(),
                  authorId: profile.id,
                  author: profile.farm || profile.name,
                  equipmentId: String(f.get("equipment")),
                  message: String(f.get("message")).trim(),
                  createdAt: new Date().toISOString(),
                });
                setResponding(null);
                setNotice("Demo response saved. Nothing was sent externally.");
              }}
            >
              <label>
                Your matching listing
                <select name="equipment">
                  {eligible.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Response
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  placeholder="Confirm availability, pickup, and included attachments."
                />
              </label>
              <button className="button primary" type="submit">
                Save demo response
              </button>
            </form>
          ) : (
            <div className="empty-state">
              <h3>No eligible listing yet.</h3>
              <p>
                Create an active listing in {responding.category} offered for{" "}
                {responding.kind === "rent" ? "rent" : "sale"}. Previously
                offered listings cannot be sent twice.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  setResponding(null);
                  onList();
                }}
              >
                List equipment
              </button>
            </div>
          )}
        </Modal>
      )}
    </section>
  );
}
