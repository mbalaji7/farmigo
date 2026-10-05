import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Heart,
  LogOut,
  Sprout,
  UserRound,
  Tractor,
} from "lucide-react";
import { type DemoProfile, type ProfileInput } from "../accountTypes";
import { type EquipmentRequest } from "../marketplaceTypes";
import { type Equipment } from "../data";
import { PageLink, useRouter } from "../router";
import EquipmentCard from "../components/EquipmentCard";
import { currency } from "../utils";
export default function Account({
  profile,
  requests,
  savedEquipment,
  onAuth,
  onUpdate,
  onSignOut,
  onCancel,
  toggleSave,
}: {
  profile: DemoProfile | null;
  requests: EquipmentRequest[];
  savedEquipment: Equipment[];
  onAuth: (input: ProfileInput, kind: "signup" | "signin") => string;
  onUpdate: (input: ProfileInput) => string;
  onSignOut: () => void;
  onCancel: (id: string) => void;
  toggleSave: (id: string) => void;
}) {
  const [screen, setScreen] = useState("profile"),
    [kind, setKind] = useState<"signup" | "signin">("signup"),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const { navigate } = useRouter();
  function values(event: FormEvent<HTMLFormElement>): ProfileInput {
    const f = new FormData(event.currentTarget);
    return {
      name: String(f.get("name") || "").trim(),
      email: String(f.get("email") || "").trim(),
      farm: String(f.get("farm") || "").trim(),
      city: String(f.get("city") || "").trim(),
      state: String(f.get("state") || "")
        .trim()
        .toUpperCase(),
      role: (f.get("role") || "both") as DemoProfile["role"],
      bio: String(f.get("bio") || "").trim(),
    };
  }
  const history = requests.filter(
    (r) =>
      !r.sample && (profile ? r.requesterId === profile.id : !r.requesterId),
  );
  if (!profile)
    return (
      <section className="auth-page page-width">
        <div className="auth-story">
          <span className="eyebrow">A LITTLE HELP FOR YOUR NEXT SEASON</span>
          <h1>
            Your farm.
            <br />
            Your neighbors.
            <br />
            <span className="heading-accent">Your Farmigo.</span>
          </h1>
          <p>
            Save the right equipment, keep track of your requests, and put your
            tools to work.
          </p>
          <span className="auth-leaf">
            <Sprout size={40} />
          </span>
        </div>
        <div className="auth-card">
          <div className="workspace-tabs">
            <button
              className={kind === "signup" ? "selected" : ""}
              onClick={() => {
                setKind("signup");
                setError("");
              }}
            >
              Create account
            </button>
            <button
              className={kind === "signin" ? "selected" : ""}
              onClick={() => {
                setKind("signin");
                setError("");
              }}
            >
              Sign in
            </button>
          </div>
          <h2>
            {kind === "signup"
              ? "Welcome, good neighbor."
              : "Good to see you again."}
          </h2>
          <p className="modal-intro">
            Local demo account only. Passwords are never stored or checked; use
            made-up details for this preview.
          </p>
          <form
            className="modal-form"
            onSubmit={(ev) => {
              ev.preventDefault();
              setError(onAuth(values(ev), kind));
            }}
          >
            {kind === "signup" && (
              <>
                <label>
                  Your name
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    pattern=".*\S.*"
                    maxLength={80}
                  />
                </label>
                <label>
                  Farm name
                  <input
                    name="farm"
                    maxLength={80}
                    placeholder="Your farm or business"
                  />
                </label>
                <label>
                  I’m here to
                  <select name="role">
                    <option value="both">Rent, buy, and list equipment</option>
                    <option value="renter">Rent or buy equipment</option>
                    <option value="owner">List my equipment</option>
                  </select>
                </label>
              </>
            )}
            <label>
              Email address
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Demo password (not stored)
              <input
                type="password"
                name="demoPassword"
                required
                minLength={8}
                autoComplete="off"
                placeholder="Any 8+ characters for this demo"
              />
            </label>
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary full" type="submit">
              {kind === "signup"
                ? "Create demo account"
                : "Sign in to demo account"}
              <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </section>
    );
  return (
    <section className="workspace-page page-width">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">YOUR LITTLE CORNER OF FARMIGO</span>
          <h1>Welcome, {profile.name.split(" ")[0]}.</h1>
          <p>Manage your farm profile and keep your season organized.</p>
        </div>
        <button className="button outline" onClick={onSignOut}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
      <div className="account-shortcuts">
        <PageLink className="button outline" page="/saved-searches">Saved searches</PageLink>
        <PageLink className="button outline" page="/dashboard">
          <Tractor size={17} />
          Owner dashboard
        </PageLink>
      </div>
      <div className="workspace-tabs">
        <button
          className={screen === "profile" ? "selected" : ""}
          onClick={() => setScreen("profile")}
        >
          <UserRound size={15} />
          My profile
        </button>
        <button
          className={screen === "history" ? "selected" : ""}
          onClick={() => setScreen("history")}
        >
          Requests & history
        </button>
        <button
          className={screen === "saved" ? "selected" : ""}
          onClick={() => setScreen("saved")}
        >
          <Heart size={15} />
          Saved ({savedEquipment.length})
        </button>
      </div>
      {screen === "profile" ? (
        <div className="profile-layout">
          <aside className="profile-summary">
            <span className="profile-initials">
              {profile.name
                .split(/\s+/)
                .slice(0, 2)
                .map((s) => s[0])
                .join("")}
            </span>
            <h2>{profile.farm || profile.name}</h2>
            <p>
              {profile.city
                ? `${profile.city}, ${profile.state}`
                : "Your farm location"}
            </p>
            <span className="status-chip">Demo member</span>
            <p>
              {profile.bio || "Tell your neighbors a little about your farm."}
            </p>
          </aside>
          <form
            className="modal-form profile-form"
            key={profile.id}
            onSubmit={(ev) => {
              ev.preventDefault();
              const issue = onUpdate(values(ev));
              setError(issue);
              setSuccess(issue ? "" : "Your profile is saved.");
            }}
          >
            <div className="listing-form-grid">
              <label>
                Your name
                <input
                  name="name"
                  required
                  defaultValue={profile.name}
                  maxLength={80}
                  pattern=".*\S.*"
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={profile.email}
                />
              </label>
              <label>
                Farm name
                <input name="farm" defaultValue={profile.farm} maxLength={80} />
              </label>
              <label>
                My role
                <select name="role" defaultValue={profile.role}>
                  <option value="both">Renter and owner</option>
                  <option value="renter">Renter / buyer</option>
                  <option value="owner">Equipment owner</option>
                </select>
              </label>
              <label>
                City
                <input name="city" defaultValue={profile.city} maxLength={60} />
              </label>
              <label>
                State abbreviation
                <input
                  name="state"
                  defaultValue={profile.state}
                  maxLength={2}
                  pattern="[A-Za-z]{2}"
                />
              </label>
              <label className="span-two">
                About your farm
                <textarea
                  name="bio"
                  rows={4}
                  maxLength={1000}
                  defaultValue={profile.bio}
                />
              </label>
            </div>
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="inline-success" role="status">
                {success}
              </p>
            )}
            <button className="button primary" type="submit">
              Save profile
              <ArrowRight size={16} />
            </button>
            <p className="form-note">
              This profile stays in your browser. Demo sessions are not secure
              authentication.
            </p>
          </form>
        </div>
      ) : screen === "saved" ? (
        savedEquipment.length ? (
          <div className="equipment-grid">
            {savedEquipment.map((e) => (
              <EquipmentCard
                key={e.id}
                equipment={e}
                mode="rent"
                saved
                toggleSave={toggleSave}
                open={(e) => navigate(`/equipment/${e.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Heart size={35} />
            <h2>Your next favorite is waiting.</h2>
            <p>Save equipment from the marketplace to find it here.</p>
            <PageLink className="button primary" page="marketplace">
              Explore equipment
            </PageLink>
          </div>
        )
      ) : history.length ? (
        <div className="request-list">
          {history.map((r) => (
            <article className="request-card" key={r.id}>
              <div>
                <span className="eyebrow">
                  {r.kind === "rent" ? "RENTAL REQUEST" : "PURCHASE INQUIRY"}
                </span>
                <h3>
                  <PageLink page={`/equipment/${r.equipmentId}`}>
                    {r.equipmentTitle}
                  </PageLink>
                </h3>
                <p>{r.owner}</p>
                <p>
                  {r.start ? `${r.start} → ${r.end} · ` : ""}
                  {currency(r.total)} · FG-{r.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div>
                {r.kind === "rent" && <PageLink className="button outline" page={`/rentals/${r.id}`}>View rental progress</PageLink>}
                <span className={`status-chip ${r.status}`}>{r.status}</span>
                {["pending", "accepted"].includes(r.status) && !["in-use","returned"].includes(r.stage || "") && (
                  <button
                    className="button outline"
                    onClick={() => onCancel(r.id)}
                  >
                    Cancel demo request
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Tractor size={35} />
          <h2>A new season starts here.</h2>
          <p>Your rental requests and purchase inquiries will appear here.</p>
          <PageLink className="button primary" page="marketplace">
            Find equipment
          </PageLink>
          <PageLink className="button outline" page="/messages">
            Your inbox
          </PageLink>
        </div>
      )}
    </section>
  );
}
