import { useEffect, useRef, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Handshake,
  Heart,
  Leaf,
  MapPin,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  Sprout,
  Star,
  Tractor,
  Trash2,
  Truck,
  UserRound,
  Waves,
  Wheat,
  Wrench,
  X,
} from "lucide-react";
import { initialEquipment, type Equipment } from "./data";
import { PageLink, useRouter } from "./router";
import HowItWorks from "./pages/HowItWorks";
import Community from "./pages/Community";
import Modal from "./components/Modal";
import EquipmentPage from "./pages/EquipmentPage";
import { currency } from "./utils";
import ListingForm from "./components/ListingForm";
import { Photo } from "./components/PhotoGallery";

type Mode = "rent" | "buy";
type Dialog = "listing" | "saved" | "account" | "filters" | null;
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

function EquipmentCard({
  equipment: e,
  mode,
  saved,
  toggleSave,
  open,
}: {
  equipment: Equipment;
  mode: Mode;
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
        <div className="card-owner">
          <BadgeCheck size={14} />
          {e.owner}
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const { page, path, navigate } = useRouter();
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
  const [mode, setMode] = useState<Mode>("rent");
  const [category, setCategory] = useState("All equipment");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState({ query: "", location: "" });
  const [sort, setSort] = useState("recommended");
  const [condition, setCondition] = useState("Any condition");
  const [maxPrice, setMaxPrice] = useState("");
  const [draftCondition, setDraftCondition] = useState(condition);
  const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);
  const [dialog, setDialog] = useState<Dialog>(null);
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
  const toggleSave = (id: string) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const detailEquipment = equipment.find(
    (e) => `/equipment/${encodeURIComponent(e.id)}` === path.split("?")[0],
  );
  const openEquipment = (e: Equipment) => {
    setDialog(null);
    navigate(`/equipment/${encodeURIComponent(e.id)}?mode=${mode}`);
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
    setCategory("All equipment");
    setQuery("");
    setLocation("");
    setSearch({ query: "", location: "" });
    setCondition("Any condition");
    setMaxPrice("");
    setShowAll(false);
  };
  const activeFilters =
    (condition !== "Any condition" ? 1 : 0) + (maxPrice ? 1 : 0);
  const filtered = equipment
    .filter(
      (e) =>
        (mode === "rent" ? e.rent > 0 : e.price > 0) &&
        (category === "All equipment" || e.category === category) &&
        `${e.title} ${e.category} ${e.owner}`
          .toLowerCase()
          .includes(search.query.toLowerCase()) &&
        `${e.city} ${e.state} ${e.zip}`
          .toLowerCase()
          .includes(search.location.toLowerCase()) &&
        (condition === "Any condition" || e.condition === condition) &&
        (!maxPrice || (mode === "rent" ? e.rent : e.price) <= Number(maxPrice)),
    )
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
            <button
              className="account-button"
              aria-label="Open your Farmigo account"
              onClick={() => setDialog("account")}
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
                <button className="button primary search-button" type="submit">
                  <Search size={17} />
                  Search equipment
                </button>
              </form>
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
        {page === "equipment" &&
          (detailEquipment ? (
            <EquipmentPage
              equipment={detailEquipment}
              saved={saved.includes(detailEquipment.id)}
              toggleSave={toggleSave}
              notify={setToast}
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
            <div className="form-actions">
              <button
                className="button outline"
                type="button"
                onClick={() => {
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
                {equipment
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
      {dialog === "account" && (
        <Modal
          title="Your little corner of Farmigo"
          close={() => setDialog(null)}
        >
          <div className="account-content">
            <span className="account-big-avatar">
              <UserRound size={32} />
            </span>
            <h3>Welcome, good neighbor.</h3>
            <p>
              This is your frontend preview. Your saved equipment and listings
              stay on this browser, so you can pick up where you left off.
            </p>
            <button className="account-row" onClick={() => setDialog("saved")}>
              <Heart size={19} />
              <span>Saved equipment</span>
              <b>{saved.length}</b>
              <ChevronRight size={17} />
            </button>
            <button
              className="account-row"
              onClick={() => {
                setDialog(null);
                clearFilters();
                setShowAll(true);
                browse();
              }}
            >
              <Tractor size={19} />
              <span>Explore the marketplace</span>
              <ChevronRight size={17} />
            </button>
            <button
              className="button primary full"
              onClick={() => setDialog("listing")}
            >
              <Plus size={17} />
              Create a listing
            </button>
            {equipment.filter(
              (e) => !initialEquipment.some((item) => item.id === e.id),
            ).length > 0 && (
              <div className="your-listings">
                <h4>Your demo listings</h4>
                {equipment
                  .filter(
                    (e) => !initialEquipment.some((item) => item.id === e.id),
                  )
                  .map((e) => (
                    <div className="your-listing" key={e.id}>
                      <span>{e.title}</span>
                      <button
                        className="button outline"
                        onClick={() => {
                          setEditing(e);
                          setDialog("listing");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Remove demo listing ${e.title}`}
                        onClick={() => {
                          setEquipment((prev) =>
                            prev.filter((item) => item.id !== e.id),
                          );
                          setSaved((prev) => prev.filter((id) => id !== e.id));
                          setToast("Demo listing removed from this browser.");
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
            <span className="form-note">
              Accounts and messaging will arrive with the backend.
            </span>
          </div>
        </Modal>
      )}
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
