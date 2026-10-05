import { useEffect, useRef, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Handshake,
  Heart,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Sprout,
  Tractor,
  Truck,
  UserRound,
  Waves,
  Wheat,
  Wrench,
  X,
} from "lucide-react";
import { initialEquipment, type Equipment } from "./data";
import { PageLink, useRouter } from "./router";
import { ComparePage, CompareTray } from "./components/Comparison";
import HowItWorks from "./pages/HowItWorks";
import Community from "./pages/Community";
import Modal from "./components/Modal";
import EquipmentPage from "./pages/EquipmentPage";
import Dashboard from "./pages/Dashboard";
import { usePersistentState } from "./usePersistentState";
import {
  readFilters,
  availableForSearch,
  filterQuery,
  matchesEquipment,
  emptyAdvanced,
  brandOf,
  distanceFrom,
  type AdvancedFilters,
} from "./discovery";
import { localDate } from "./utils";
import { blockedFor, isRangeAvailable } from "./booking";
import { type EquipmentRequest } from "./marketplaceTypes";
import ListingForm from "./components/ListingForm";
import EquipmentCard from "./components/EquipmentCard";
import OwnerProfile from "./pages/OwnerProfile";
import {
  type OwnerReview,
  ownerKey,
  sampleReviews,
  reviewSummary,
} from "./ownerData";
import Messages from "./pages/Messages";
import { type Conversation } from "./messageTypes";
import Account from "./pages/Account";
import { type DemoProfile, type ProfileInput } from "./accountTypes";

type Mode = "rent" | "buy";
type Dialog = "listing" | "saved" | "filters" | null;
const categories = [
  { name: "All equipment", icon: Sprout },
  { name: "Tractors", icon: Tractor },
  { name: "Harvesters", icon: Wheat },
  { name: "Planting", icon: Sprout },
  { name: "Hay & forage", icon: Leaf },
  { name: "Attachments", icon: Wrench },
  { name: "Irrigation", icon: Waves },
];
function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const { page, path, navigate, updateQuery } = useRouter();
  const initialFilters = readFilters(window.location.search);
  const [reviews, setReviews, reviewStorageError] = usePersistentState<
    OwnerReview[]
  >("farmigo-reviews", []);
  const [conversations, setConversations, messageStorageError] =
    usePersistentState<Conversation[]>("farmigo-conversations", []);
  const [profiles, setProfiles] = usePersistentState<DemoProfile[]>(
    "farmigo-profiles",
    [],
  );
  const [session, setSession] = usePersistentState<string | null>(
    "farmigo-session",
    null,
  );
  const profile = profiles.find((p) => p.id === session) || null;
  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const stored = readStorage<Equipment[]>("farmigo-listings", []);
    return [
      ...initialEquipment,
      ...(Array.isArray(stored)
        ? stored.filter(
            (e) =>
              e &&
              typeof e.id === "string" &&
              typeof e.title === "string" &&
              typeof e.rent === "number" &&
              typeof e.price === "number" &&
              typeof e.city === "string" &&
              typeof e.state === "string" &&
              typeof e.zip === "string",
          )
        : []),
    ];
  });
  const [saved, setSaved] = useState<string[]>(() => {
    const stored = readStorage<string[]>("farmigo-saved", []);
    return Array.isArray(stored)
      ? stored.filter((id) => typeof id === "string")
      : [];
  });
  const [mode, setMode] = useState<Mode>(initialFilters.mode);
  const [category, setCategory] = useState(initialFilters.category);
  const [query, setQuery] = useState(initialFilters.query);
  const [location, setLocation] = useState(initialFilters.location);
  const [search, setSearch] = useState({
    query: initialFilters.query,
    location: initialFilters.location,
  });
  const [dates, setDates] = useState({start: initialFilters.start || "", end: initialFilters.end || ""});
  const [draftDates, setDraftDates] = useState(dates);
  const [dateError, setDateError] = useState("");
  const [sort, setSort] = useState(initialFilters.sort);
  const [condition, setCondition] = useState(initialFilters.condition);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [advanced, setAdvanced] = useState<AdvancedFilters>({
    ...emptyAdvanced,
    ...initialFilters,
  });
  const [draftAdvanced, setDraftAdvanced] = useState(advanced);
  const [filterError, setFilterError] = useState("");
  const [draftCondition, setDraftCondition] = useState(condition);
  const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [requests, setRequests, requestStorageError] = usePersistentState<
    EquipmentRequest[]
  >("farmigo-requests", []);
  const [editing, setEditing] = useState<Equipment | undefined>();
  const [showAll, setShowAll] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const equipmentSection = useRef<HTMLElement>(null);
  useEffect(() => {
    setDialog(null);
    setMobileMenu(false);
  }, [page]);
  useEffect(() => {
    try {
      localStorage.setItem("farmigo-saved", JSON.stringify(saved));
    } catch {
      /* Saving remains available for this session. */
    }
  }, [saved]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "farmigo-listings",
        JSON.stringify(
          equipment.filter(
            (e) => !initialEquipment.some((item) => item.id === e.id),
          ),
        ),
      );
    } catch {
      /* New listings remain available for this session. */
    }
  }, [equipment]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (page === "marketplace")
      updateQuery(
        filterQuery({
          ...advanced,
          ...dates,
          mode,
          category,
          condition,
          maxPrice,
          sort,
          query: search.query,
          location: search.location,
        }),
      );
  }, [
    page,
    dates,
    mode,
    category,
    condition,
    maxPrice,
    sort,
    search.query,
    search.location,
    advanced,
  ]);
  useEffect(() => {
    const restore = () => {
      if (window.location.pathname !== "/") return;
      const f = readFilters(window.location.search);
      setDates({start:f.start || "",end:f.end || ""});
      setDraftDates({start:f.start || "",end:f.end || ""});
      setMode(f.mode);
      setCategory(f.category);
      setCondition(f.condition);
      setMaxPrice(f.maxPrice);
      setSort(f.sort);
      setQuery(f.query);
      setLocation(f.location);
      setSearch({ query: f.query, location: f.location });
      setAdvanced({ ...emptyAdvanced, ...f });
      setShowAll(true);
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const toggleSave = (id: string) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const equipmentWithReviews = equipment.map((e) => {
    const all = [
      ...sampleReviews(ownerKey(e)),
      ...reviews.filter((r) => r.ownerKey === ownerKey(e)),
    ];
    const summary = reviewSummary(all);
    return { ...e, rating: summary.rating, reviews: summary.count };
  });
  const ownerId = path.split("?")[0].slice("/owners/".length);
  const publicProfile = profiles.find((p) => p.id === ownerId);
  const ownerListings = equipmentWithReviews.filter(
    (e) => ownerKey(e) === ownerId,
  );
  const detailEquipment = equipmentWithReviews.find(
    (e) => `/equipment/${encodeURIComponent(e.id)}` === path.split("?")[0],
  );
  const openEquipment = (e: Equipment) => {
    setDialog(null);
    const params = new URLSearchParams({mode});
    if(mode === "rent" && dates.start && dates.end) { params.set("start",dates.start);params.set("end",dates.end); }
    navigate(`/equipment/${encodeURIComponent(e.id)}?${params}`);
  };
  const browse = () => {
    if (page !== "marketplace") {
      navigate("marketplace");
      setMobileMenu(false);
      return;
    }
    equipmentSection.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setMobileMenu(false);
  };
  const clearFilters = () => {
    setDates({start:"",end:""});setDraftDates({start:"",end:""});setDateError("");
    setCategory("All equipment");
    setQuery("");
    setLocation("");
    setSearch({ query: "", location: "" });
    setCondition("Any condition");
    setMaxPrice("");
    setShowAll(false);
    setAdvanced(emptyAdvanced);
  };
  const activeFilters =
    (condition !== "Any condition" ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    Object.keys(emptyAdvanced).filter(
      (key) => advanced[key as keyof AdvancedFilters],
    ).length;
  const appliedFilters = {
    ...advanced,
    ...dates,
    mode,
    category,
    condition,
    maxPrice,
    sort,
    query: search.query,
    location: search.location,
  };
  const filtered = equipmentWithReviews
    .filter((e) => matchesEquipment(e, appliedFilters) && availableForSearch(e,appliedFilters,requests,localDate()))
    .sort((a, b) =>
      sort === "price-low"
        ? mode === "rent"
          ? a.rent - b.rent
          : a.price - b.price
        : sort === "price-high"
          ? mode === "rent"
            ? b.rent - a.rent
            : b.price - a.price
          : 0,
    );
  const visible = showAll ? filtered : filtered.slice(0, 4);
  function saveListing(entry: Equipment) {
    entry.ownerId = entry.ownerId || profile?.id;
    setEquipment((prev) =>
      prev.some((e) => e.id === entry.id)
        ? prev.map((e) => (e.id === entry.id ? entry : e))
        : [...prev, entry],
    );
    setMode(entry.rent > 0 ? "rent" : "buy");
    setEditing(undefined);
    setDialog(null);
    clearFilters();
    setShowAll(true);
    setToast("Listing saved on this browser.");
    navigate(`/equipment/${entry.id}?mode=${entry.rent > 0 ? "rent" : "buy"}`);
  }
  function startConversation(e: Equipment, sample = false) {
    const found = conversations.find(
      (c) => c.equipmentId === e.id && c.participantId === profile?.id,
    );
    if (found) {
      navigate(`/messages?thread=${found.id}`);
      return;
    }
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      equipmentId: e.id,
      equipmentTitle: e.title,
      owner: e.owner,
      participantId: profile?.id,
      unread: sample ? 1 : 0,
      createdAt: new Date().toISOString(),
      messages: sample
        ? [
            {
              id: crypto.randomUUID(),
              sender: "owner",
              body: "Sample reply: Happy to help. What kind of job are you planning?",
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    };
    setConversations((prev) => [conversation, ...prev]);
    navigate(`/messages?thread=${conversation.id}`);
  }
  function authenticate(input: ProfileInput, kind: "signup" | "signin") {
    const found = profiles.find(
      (p) => p.email.toLowerCase() === input.email.toLowerCase(),
    );
    if (kind === "signin") {
      if (!found)
        return "No local demo account uses that email. Create one first.";
      setSession(found.id);
      return "";
    }
    if (found) return "That email already has a demo account. Use Sign in.";
    const newProfile: DemoProfile = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProfiles((prev) => [...prev, newProfile]);
    setSession(newProfile.id);
    setEquipment((prev) =>
      prev.map((e) =>
        !initialEquipment.some((seed) => seed.id === e.id) && !e.ownerId
          ? { ...e, ownerId: newProfile.id }
          : e,
      ),
    );
    return "";
  }
  return (
    <>
      <div className="announcement">
        <span>A little more access. A lot more possibility.</span>
        <span className="announcement-right">
          Built for the people who grow.
          <Sprout size={14} />
        </span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <PageLink
            className="logo"
            page="marketplace"
            aria-label="Farmigo home"
            onNavigate={() => setMobileMenu(false)}
          >
            <span className="logo-mark">
              <Sprout size={27} strokeWidth={2} />
            </span>
            farmigo<span className="logo-dot">.</span>
          </PageLink>
          <nav
            className={mobileMenu ? "main-nav nav-open" : "main-nav"}
            aria-label="Main navigation"
          >
            <PageLink
              page="marketplace"
              className={page === "marketplace" ? "active" : ""}
              aria-current={page === "marketplace" ? "page" : undefined}
              onNavigate={() => setMobileMenu(false)}
            >
              Explore equipment
            </PageLink>
            <PageLink
              page="how-it-works"
              className={page === "how-it-works" ? "active" : ""}
              aria-current={page === "how-it-works" ? "page" : undefined}
              onNavigate={() => setMobileMenu(false)}
            >
              How it works
            </PageLink>
            <PageLink
              page="community"
              className={page === "community" ? "active" : ""}
              aria-current={page === "community" ? "page" : undefined}
              onNavigate={() => setMobileMenu(false)}
            >
              Our community
            </PageLink>
            <PageLink
              className="mobile-nav-extra"
              page="/account"
              onNavigate={() => setMobileMenu(false)}
            >
              My account
            </PageLink>
            <PageLink
              className="mobile-nav-extra"
              page="/dashboard"
              onNavigate={() => setMobileMenu(false)}
            >
              Owner dashboard
            </PageLink>
            <PageLink
              className="mobile-nav-extra"
              page="/messages"
              onNavigate={() => setMobileMenu(false)}
            >
              Messages
            </PageLink>
          </nav>
          <div className="header-actions">
            <button
              className="saved-nav"
              onClick={() => setDialog("saved")}
              aria-label={`Saved equipment, ${saved.length} items`}
            >
              <Heart size={20} />
              <span>Saved</span>
              {saved.length > 0 && <b>{saved.length}</b>}
            </button>
            <span className="nav-divider" />
            <button
              className="button primary list-button"
              onClick={() => setDialog("listing")}
            >
              <Plus size={17} />
              List equipment
            </button>
            <PageLink
              className="account-button"
              page="/messages"
              aria-label="Open messages"
            >
              <MessageCircle size={18} />
            </PageLink>
            <button
              className="account-button"
              aria-label="Open your Farmigo account"
              onClick={() => navigate("/account")}
            >
              <UserRound size={18} />
            </button>
            <button
              className="mobile-menu-button icon-button"
              aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenu}
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>
      <main
        key={path.split("?")[0]}
        className={`page-content ${page}-page`}
        tabIndex={-1}
      >
        {page === "marketplace" && (
          <>
            <div className="marketplace-intro page-width">
              <div>
                <span className="eyebrow">THE FARMIGO MARKETPLACE</span>
                <h1>Good equipment. Close to home.</h1>
              </div>
              <p>Find your next workhorse, and get growing.</p>
            </div>
            <section
              className="search-section page-width"
              aria-label="Find farm equipment"
            >
              <div className="search-topline">
                <div className="mode-tabs" aria-label="Listing type">
                  <button
                    className={mode === "rent" ? "selected" : ""}
                    aria-pressed={mode === "rent"}
                    onClick={() => {
                      setMode("rent");
                      setMaxPrice("");
                    }}
                  >
                    Rent equipment
                  </button>
                  <button
                    className={mode === "buy" ? "selected" : ""}
                    aria-pressed={mode === "buy"}
                    onClick={() => {
                      setMode("buy");
                      setMaxPrice("");
                    }}
                  >
                    Buy equipment
                  </button>
                </div>
                <span className="search-hint">
                  <MapPin size={14} />
                  Your next workhorse could be just down the road.
                </span>
              </div>
              <form
                className="search-bar"
                onSubmit={(ev) => {
                  ev.preventDefault();
                  if(mode === "rent" && (draftDates.start || draftDates.end) && (!draftDates.start || !draftDates.end || draftDates.start < localDate() || !isRangeAvailable(draftDates.start,draftDates.end,new Set()))) { setDateError("Choose both dates, today or later, for a rental of 1–90 days."); return; }
                  setDateError("");setDates(draftDates);
                  setSearch({ query: query.trim(), location: location.trim() });
                  setShowAll(true);
                  browse();
                }}
              >
                <label className="search-field">
                  <Search size={21} />
                  <span>
                    <span className="field-label">
                      What are you looking for?
                    </span>
                    <input
                      placeholder="Tractors, harvesters, and more"
                      aria-label="Search equipment"
                      value={query}
                      onChange={(ev) => setQuery(ev.target.value)}
                    />
                  </span>
                </label>
                <label className="search-field location-field">
                  <MapPin size={21} />
                  <span>
                    <span className="field-label">Where do you need it?</span>
                    <input
                      placeholder="City, state, or ZIP code"
                      aria-label="Search location"
                      value={location}
                      onChange={(ev) => setLocation(ev.target.value)}
                    />
                  </span>
                </label>
                {mode === "rent" && <div className="search-dates"><label>Rental start<input aria-label="Rental start" type="date" min={localDate()} value={draftDates.start} onInput={ev=>{const value=ev.currentTarget.value;setDraftDates(prev=>({...prev,start:value}));}}/></label><label>Rental end<input aria-label="Rental end" type="date" min={draftDates.start || localDate()} value={draftDates.end} onInput={ev=>{const value=ev.currentTarget.value;setDraftDates(prev=>({...prev,end:value}));}}/></label></div>}
                <button className="button primary search-button" type="submit">
                  <Search size={17} />
                  Search equipment
                </button>
              </form>
              {dateError && <p role="alert" className="inline-error">{dateError}</p>}
              {mode === "rent" && dates.start && <p className="date-summary" role="status">Available {dates.start} through {dates.end} · Browser-local availability</p>}
              <div className="search-foot">
                <span>
                  <BadgeCheck size={16} />
                  People you can trust
                </span>
                <span>
                  <Handshake size={16} />
                  Straightforward, fair prices
                </span>
                <span>
                  <Truck size={16} />
                  Local equipment. Less hassle.
                </span>
                <span className="search-foot-end">
                  A good season starts here.
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </section>
            <section
              className="equipment-section page-width"
              id="equipment"
              ref={equipmentSection}
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    THE RIGHT TOOL. RIGHT AROUND THE CORNER.
                  </span>
                  <h2>
                    {search.query ||
                    search.location ||
                    category !== "All equipment" ||
                    activeFilters
                      ? "Find your next workhorse."
                      : "Ready for your next big thing."}
                  </h2>
                  <p>
                    From first light to the last row, find equipment that works
                    as hard as you do.
                  </p>
                </div>
                <button
                  className="text-link section-view"
                  onClick={() => {
                    clearFilters();
                    setShowAll(true);
                  }}
                >
                  Explore all equipment
                  <ArrowRight size={17} />
                </button>
              </div>
              <button
                className="text-link share-search"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setToast("Search link copied, including your filters.");
                  } catch {
                    setToast(
                      "Copy the current browser address to share this search.",
                    );
                  }
                }}
              >
                <Share2 size={14} />
                Copy search link
              </button>
              <div className="browse-toolbar">
                <div
                  className="category-tabs"
                  aria-label="Equipment categories"
                >
                  {categories.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      className={
                        category === name
                          ? "category-tab selected"
                          : "category-tab"
                      }
                      aria-pressed={category === name}
                      onClick={() => {
                        setCategory(name);
                        setShowAll(true);
                      }}
                    >
                      <Icon size={17} />
                      {name}
                    </button>
                  ))}
                </div>
                <button
                  className={`filter-button ${activeFilters ? "filter-active" : ""}`}
                  onClick={() => {
                    setDraftAdvanced(advanced);
                    setFilterError("");
                    setDraftCondition(condition);
                    setDraftMaxPrice(maxPrice);
                    setDialog("filters");
                  }}
                >
                  <SlidersHorizontal size={17} />
                  Filters{activeFilters > 0 && <b>{activeFilters}</b>}
                </button>
              </div>
              <div className="results-toolbar">
                <span>
                  {search.query ||
                  search.location ||
                  category !== "All equipment" ||
                  activeFilters
                    ? `${filtered.length} matching ${filtered.length === 1 ? "listing" : "listings"}${search.location ? ` near ${search.location}` : ""}`
                    : "A few favorites from the farm"}
                  {(search.query ||
                    search.location ||
                    category !== "All equipment" ||
                    activeFilters > 0) && (
                    <button className="clear-filters" onClick={clearFilters}>
                      Clear filters
                      <X size={12} />
                    </button>
                  )}
                </span>
                <label className="sort-control">
                  <ArrowDownUp size={13} />
                  <span>Sort by:</span>
                  <select
                    aria-label="Sort equipment"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                  </select>
                  <ChevronDown size={13} />
                </label>
              </div>
              {visible.length ? (
                <div
                  className="equipment-grid"
                  key={`${mode}-${category}-${search.query}-${search.location}-${condition}-${maxPrice}-${sort}`}
                >
                  {visible.map((e) => (
                    <EquipmentCard
                      key={e.id}
                      equipment={e}
                      distance={
                        advanced.radius
                          ? (distanceFrom(e, search.location) ?? undefined)
                          : undefined
                      }
                      mode={mode}
                      saved={saved.includes(e.id)}
                      toggleSave={toggleSave}
                      open={openEquipment}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Search size={32} />
                  <h3>No equipment in this field yet.</h3>
                  <p>
                    Try another category, a broader search, or an Iowa city like
                    Des Moines or Ames.
                  </p>
                  <button className="button primary" onClick={clearFilters}>
                    Clear filters
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
              {!showAll && filtered.length > 4 && (
                <div className="more-equipment">
                  <button
                    className="button outline"
                    onClick={() => setShowAll(true)}
                  >
                    Discover more equipment
                    <ArrowRight size={17} />
                  </button>
                  <span>Something for every acre.</span>
                </div>
              )}
            </section>
          </>
        )}
        {page === "compare" && <ComparePage equipment={equipmentWithReviews} />}
        {page === "owner" &&
          (ownerListings.length || publicProfile ? (
            <OwnerProfile
              name={
                publicProfile?.farm ||
                publicProfile?.name ||
                ownerListings[0]?.owner ||
                "Equipment owner"
              }
              ownerId={ownerId}
              equipment={ownerListings}
              profile={publicProfile}
              currentProfile={profile}
              reviews={[
                ...sampleReviews(ownerId),
                ...reviews.filter((r) => r.ownerKey === ownerId),
              ]}
              onReview={(review) => setReviews((prev) => [review, ...prev])}
              toggleSave={toggleSave}
              saved={saved}
              onMessage={startConversation}
              isSample={sampleReviews(ownerId).length > 0}
            />
          ) : (
            <section className="empty-state page-width">
              <h1>Owner profile not found.</h1>
              <PageLink page="marketplace" className="button primary">
                Explore equipment
              </PageLink>
            </section>
          ))}
        {page === "messages" && (
          <Messages
            conversations={conversations.filter(
              (c) => c.participantId === profile?.id,
            )}
            onSample={() => startConversation(initialEquipment[0], true)}
            onRead={(id) =>
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === id && c.unread ? { ...c, unread: 0 } : c,
                ),
              )
            }
            onSend={(id, body) =>
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === id
                    ? {
                        ...c,
                        messages: [
                          ...c.messages,
                          {
                            id: crypto.randomUUID(),
                            sender: "you",
                            body,
                            createdAt: new Date().toISOString(),
                          },
                        ],
                      }
                    : c,
                ),
              )
            }
            onReply={(id) =>
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === id
                    ? {
                        ...c,
                        messages: [
                          ...c.messages,
                          {
                            id: crypto.randomUUID(),
                            sender: "owner",
                            body: "Demo owner reply: Thanks for reaching out. Please confirm your dates and pickup requirements so we can work out the details.",
                            createdAt: new Date().toISOString(),
                          },
                        ],
                      }
                    : c,
                ),
              )
            }
          />
        )}
        {page === "account" && (
          <Account
            profile={profile}
            requests={requests}
            savedEquipment={equipmentWithReviews.filter((e) =>
              saved.includes(e.id),
            )}
            toggleSave={toggleSave}
            onAuth={authenticate}
            onSignOut={() => setSession(null)}
            onCancel={(id) =>
              setRequests((prev) =>
                prev.map((r) =>
                  r.id === id ? { ...r, status: "cancelled" } : r,
                ),
              )
            }
            onUpdate={(input) => {
              if (
                profiles.some(
                  (p) =>
                    p.id !== profile?.id &&
                    p.email.toLowerCase() === input.email.toLowerCase(),
                )
              )
                return "That email is already used by another local account.";
              setProfiles((prev) =>
                prev.map((p) =>
                  p.id === profile?.id ? { ...p, ...input } : p,
                ),
              );
              return "";
            }}
          />
        )}
        {page === "dashboard" && (
          <Dashboard
            equipment={equipment.filter(
              (e) =>
                initialEquipment.some((seed) => seed.id === e.id) ||
                !e.ownerId ||
                e.ownerId === profile?.id,
            )}
            requests={requests}
            onEdit={(e) => {
              setEditing(e);
              setDialog("listing");
            }}
            onList={() => {
              setEditing(undefined);
              setDialog("listing");
            }}
            onUpdate={(entry) => {
              setEquipment((prev) =>
                prev.map((e) => (e.id === entry.id ? entry : e)),
              );
              setToast("Listing updated.");
            }}
            onRequestStatus={(id, status) => {
              const request = requests.find((r) => r.id === id);
              const e = equipment.find((e) => e.id === request?.equipmentId);
              if (
                status === "accepted" &&
                request?.kind === "rent" &&
                !request.sample &&
                request.start &&
                request.end &&
                e &&
                !isRangeAvailable(
                  request.start,
                  request.end,
                  blockedFor(
                    e.id,
                    e.blockedDates || [],
                    requests.filter((r) => r.id !== id),
                  ),
                )
              ) {
                setToast(
                  "These dates are no longer available. Resolve the conflict before accepting.",
                );
                return;
              }
              setRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status } : r)),
              );
            }}
            onSample={(request) => setRequests((prev) => [request, ...prev])}
          />
        )}
        {page === "equipment" &&
          (detailEquipment ? (
            <EquipmentPage
              equipment={detailEquipment}
              saved={saved.includes(detailEquipment.id)}
              toggleSave={toggleSave}
              notify={setToast}
              onMessage={() => startConversation(detailEquipment)}
              profile={profile}
              requests={requests}
              onRequest={(request) =>
                setRequests((prev) => [
                  { ...request, requesterId: profile?.id },
                  ...prev,
                ])
              }
            />
          ) : (
            <section className="empty-state page-width">
              <h1>Equipment not found.</h1>
              <p>This listing may have been removed.</p>
              <PageLink page="marketplace" className="button primary">
                Explore equipment
              </PageLink>
            </section>
          ))}
        {page === "how-it-works" && (
          <HowItWorks onList={() => setDialog("listing")} />
        )}
        {page === "community" && (
          <Community onList={() => setDialog("listing")} />
        )}
        {page === "not-found" && (
          <section className="empty-state not-found page-width">
            <Sprout size={40} />
            <h1>This field is still unplanted.</h1>
            <p>
              We couldn’t find that page. Let’s get you back to the equipment.
            </p>
            <PageLink page="marketplace" className="button primary">
              Back to the marketplace
              <ArrowRight size={17} />
            </PageLink>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <div className="page-width footer-main">
          <div>
            <PageLink className="logo" page="marketplace">
              <span className="logo-mark">
                <Sprout size={26} />
              </span>
              farmigo<span className="logo-dot">.</span>
            </PageLink>
            <p>Grow more, together.</p>
          </div>
          <div className="footer-links">
            <PageLink page="marketplace">Explore equipment</PageLink>
            <PageLink page="how-it-works">How it works</PageLink>
            <PageLink page="community">Our community</PageLink>
            <button onClick={() => setDialog("listing")}>List equipment</button>
          </div>
          <div className="footer-community">
            <Leaf size={16} />
            Rooted in a better way to farm.
          </div>
        </div>
        <div className="page-width footer-bottom">
          <span>
            © {new Date().getFullYear()} Farmigo. Made for the way you farm.
          </span>
          <span>
            Frontend preview · Sample listings · Images for illustration
          </span>
        </div>
      </footer>
      {reviewStorageError && (
        <p className="storage-warning" role="alert">
          {reviewStorageError}
        </p>
      )}
      {messageStorageError && (
        <p className="storage-warning" role="alert">
          {messageStorageError}
        </p>
      )}
      {requestStorageError && (
        <p className="storage-warning" role="alert">
          {requestStorageError}
        </p>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {dialog === "filters" && (
        <Modal title="Find your perfect fit" close={() => setDialog(null)}>
          <form
            className="modal-form"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (
                (draftAdvanced.minPower &&
                  draftAdvanced.maxPower &&
                  Number(draftAdvanced.minPower) >
                    Number(draftAdvanced.maxPower)) ||
                (draftAdvanced.minYear &&
                  draftAdvanced.maxYear &&
                  Number(draftAdvanced.minYear) > Number(draftAdvanced.maxYear))
              ) {
                setFilterError(
                  "Minimum values must be smaller than maximum values.",
                );
                return;
              }
              setAdvanced(draftAdvanced);
              setCondition(draftCondition);
              setMaxPrice(draftMaxPrice);
              setShowAll(true);
              setDialog(null);
            }}
          >
            <p className="modal-intro">
              A few details to narrow down your next workhorse.
            </p>
            <label>
              Equipment condition
              <select
                value={draftCondition}
                onChange={(ev) => setDraftCondition(ev.target.value)}
              >
                <option>Any condition</option>
                <option>Excellent</option>
                <option>Good</option>
              </select>
            </label>
            <label>
              Maximum {mode === "rent" ? "daily rental rate" : "purchase price"}{" "}
              (USD)
              <input
                type="number"
                min="0"
                step="1"
                placeholder={mode === "rent" ? "e.g. 250" : "e.g. 100000"}
                value={draftMaxPrice}
                onChange={(ev) => setDraftMaxPrice(ev.target.value)}
              />
            </label>
            <label>
              Equipment brand
              <select
                value={draftAdvanced.brand}
                onChange={(ev) =>
                  setDraftAdvanced((prev) => ({
                    ...prev,
                    brand: ev.target.value,
                  }))
                }
              >
                <option value="">Any brand</option>
                {Array.from(new Set(equipment.map(brandOf)))
                  .sort()
                  .map((brand) => (
                    <option key={brand}>{brand}</option>
                  ))}
              </select>
            </label>
            <div className="advanced-filter-grid">
              {(
                [
                  ["minPower", "Minimum horsepower"],
                  ["maxPower", "Maximum horsepower"],
                  ["minYear", "Earliest year"],
                  ["maxYear", "Latest year"],
                  ["maxHours", "Maximum operating hours"],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="number"
                    min={key.includes("Year") ? 1950 : 0}
                    max={
                      key.includes("Year")
                        ? new Date().getFullYear() + 1
                        : undefined
                    }
                    value={draftAdvanced[key]}
                    onChange={(ev) =>
                      setDraftAdvanced((prev) => ({
                        ...prev,
                        [key]: ev.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <label>
              Distance from search location
              <select
                value={draftAdvanced.radius}
                onChange={(ev) =>
                  setDraftAdvanced((prev) => ({
                    ...prev,
                    radius: ev.target.value,
                  }))
                }
              >
                <option value="">Any distance</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
                <option value="250">Within 250 miles</option>
              </select>
            </label>
            <p className="filter-hint">
              Distances are demo estimates between Iowa city centers. Enter Des
              Moines, Ames, Ankeny, Boone, Newton, Cedar Rapids, or a listed ZIP
              code in the location search.
            </p>
            {filterError && (
              <p className="inline-error" role="alert">
                {filterError}
              </p>
            )}
            <div className="form-actions">
              <button
                className="button outline"
                type="button"
                onClick={() => {
                  setDraftAdvanced(emptyAdvanced);
                  setFilterError("");
                  setDraftCondition("Any condition");
                  setDraftMaxPrice("");
                }}
              >
                Reset
              </button>
              <button className="button primary" type="submit">
                Show equipment
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {dialog === "saved" && (
        <Modal title="Your saved equipment" close={() => setDialog(null)} wide>
          {equipment.some((e) => saved.includes(e.id)) ? (
            <div className="saved-content">
              <p className="modal-intro">
                Keep your favorites close for when the season calls.
              </p>
              <div className="saved-grid">
                {equipmentWithReviews
                  .filter((e) => saved.includes(e.id))
                  .map((e) => (
                    <EquipmentCard
                      key={e.id}
                      equipment={e}
                      mode={mode}
                      saved
                      toggleSave={toggleSave}
                      open={(item) => {
                        setDialog(null);
                        openEquipment(item);
                      }}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Heart size={35} />
              <h3>A little room for your favorites.</h3>
              <p>Tap the heart on any equipment listing to save it here.</p>
              <button
                className="button primary"
                onClick={() => {
                  setDialog(null);
                  browse();
                }}
              >
                Explore equipment
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </Modal>
      )}
      <CompareTray equipment={equipmentWithReviews} />
      {dialog === "listing" && (
        <Modal
          title={
            editing ? "Edit your equipment." : "Put your equipment to work."
          }
          close={() => {
            setDialog(null);
            setEditing(undefined);
          }}
          wide
        >
          <ListingForm
            key={editing?.id || "new"}
            equipment={editing}
            onSave={saveListing}
            notify={setToast}
          />
        </Modal>
      )}
    </>
  );
}
