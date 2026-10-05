import { useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  Edit3,
  Plus,
  Tractor,
  X,
  Pause,
  Play,
  BadgeCheck,
} from "lucide-react";
import { type Equipment, initialEquipment } from "../data";
import { type EquipmentRequest } from "../marketplaceTypes";
import { PageLink } from "../router";
import { Photo } from "../components/PhotoGallery";
import { currency, localDate } from "../utils";
export default function Dashboard({
  equipment,
  requests,
  onEdit,
  onList,
  onUpdate,
  onRequestStatus,
  onSample,
}: {
  equipment: Equipment[];
  requests: EquipmentRequest[];
  onEdit: (e: Equipment) => void;
  onList: () => void;
  onUpdate: (e: Equipment) => void;
  onRequestStatus: (id: string, status: EquipmentRequest["status"]) => void;
  onSample: (request: EquipmentRequest) => void;
}) {
  const [tab, setTab] = useState("listings"),
    [date, setDate] = useState(""),
    [availability, setAvailability] = useState("");
  const own = equipment.filter(
    (e) => !initialEquipment.some((seed) => seed.id === e.id),
  );
  const ownedRequests = requests.filter(
    (r) => own.some((e) => e.id === r.equipmentId) || r.sample,
  );
  function sample() {
    const e = own[0] || initialEquipment[0];
    onSample({
      id: crypto.randomUUID(),
      equipmentId: e.id,
      equipmentTitle: e.title,
      owner: e.owner,
      customerName: "Sample neighbor",
      customerEmail: "neighbor@example.com",
      kind: "rent",
      status: "pending",
      start: localDate(),
      end: localDate(),
      days: 1,
      total: e.rent || 125,
      message: "Sample request: Is pickup available in the morning?",
      createdAt: new Date().toISOString(),
      sample: true,
    });
    setTab("requests");
  }
  return (
    <section className="workspace-page page-width">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">YOUR EQUIPMENT. YOUR SEASON.</span>
          <h1>Owner dashboard.</h1>
          <p>
            Your local demo workspace for listings, availability, and inquiries.
          </p>
        </div>
        <button className="button primary" onClick={onList}>
          <Plus size={17} />
          New listing
        </button>
      </div>
      <div className="dashboard-stats">
        <div>
          <Tractor size={21} />
          <strong>{own.length}</strong>
          <span>Your listings</span>
        </div>
        <div>
          <BadgeCheck size={21} />
          <strong>
            {own.filter((e) => !e.status || e.status === "active").length}
          </strong>
          <span>Active listings</span>
        </div>
        <div>
          <Clock3 size={21} />
          <strong>
            {ownedRequests.filter((r) => r.status === "pending").length}
          </strong>
          <span>Pending requests</span>
        </div>
      </div>
      <div className="workspace-tabs">
        <button
          className={tab === "listings" ? "selected" : ""}
          onClick={() => setTab("listings")}
        >
          My listings
        </button>
        <button
          className={tab === "requests" ? "selected" : ""}
          onClick={() => setTab("requests")}
        >
          Requests & inquiries
        </button>
      </div>
      {tab === "listings" ? (
        own.length ? (
          <div className="dashboard-listings">
            {own.map((e) => (
              <article className="dashboard-listing" key={e.id}>
                <Photo src={e.image} alt={e.title} />
                <div className="dashboard-listing-body">
                  <div className="dashboard-listing-title">
                    <PageLink page={`/equipment/${e.id}`}>{e.title}</PageLink>
                    <span className={`status-chip ${e.status || "active"}`}>
                      {e.status || "active"}
                    </span>
                  </div>
                  <p>
                    {e.city}, {e.state} ·{" "}
                    {e.rent > 0 ? `${currency(e.rent)} / day` : ""}
                    {e.rent > 0 && e.price > 0 ? " · " : ""}
                    {e.price > 0 ? `${currency(e.price)} to buy` : ""}
                  </p>
                  <div className="dashboard-controls">
                    <button
                      className="button outline"
                      onClick={() => onEdit(e)}
                    >
                      <Edit3 size={14} />
                      Edit listing & prices
                    </button>
                    <button
                      className="button outline"
                      onClick={() =>
                        onUpdate({
                          ...e,
                          status: e.status === "paused" ? "active" : "paused",
                        })
                      }
                    >
                      {e.status === "paused" ? (
                        <Play size={14} />
                      ) : (
                        <Pause size={14} />
                      )}{" "}
                      {e.status === "paused" ? "Activate" : "Pause"}
                    </button>
                    {e.price > 0 && (
                      <button
                        className="button outline"
                        onClick={() =>
                          onUpdate({
                            ...e,
                            status: e.status === "sold" ? "active" : "sold",
                          })
                        }
                      >
                        <Check size={14} />
                        {e.status === "sold" ? "Relist" : "Mark sold"}
                      </button>
                    )}
                    <button
                      className="button outline"
                      onClick={() =>
                        setAvailability(availability === e.id ? "" : e.id)
                      }
                    >
                      <CalendarDays size={14} />
                      Availability
                    </button>
                  </div>
                  {availability === e.id && (
                    <div className="availability-editor">
                      <p>
                        Blocked dates cannot be requested. Add dates when this
                        equipment is working elsewhere.
                      </p>
                      <form
                        onSubmit={(ev) => {
                          ev.preventDefault();
                          if (date) {
                            onUpdate({
                              ...e,
                              blockedDates: Array.from(
                                new Set([...(e.blockedDates || []), date]),
                              ).sort(),
                            });
                            setDate("");
                          }
                        }}
                      >
                        <label>
                          Block a date
                          <input
                            type="date"
                            min={localDate()}
                            required
                            value={date}
                            onInput={(ev) => setDate(ev.currentTarget.value)}
                          />
                        </label>
                        <button className="button primary" type="submit">
                          Block date
                        </button>
                      </form>
                      <div className="blocked-dates">
                        {e.blockedDates?.map((day) => (
                          <button
                            key={day}
                            aria-label={`Unblock ${day}`}
                            onClick={() =>
                              onUpdate({
                                ...e,
                                blockedDates: e.blockedDates?.filter(
                                  (d) => d !== day,
                                ),
                              })
                            }
                          >
                            {day}
                            <X size={13} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Tractor size={36} />
            <h2>Your equipment has room to grow.</h2>
            <p>
              Create your first listing to manage prices and availability here.
            </p>
            <button className="button primary" onClick={onList}>
              Create a listing
              <Plus size={16} />
            </button>
          </div>
        )
      ) : (
        <div className="request-list">
          {ownedRequests.length ? (
            ownedRequests.map((r) => (
              <article key={r.id} className="request-card">
                <div>
                  <span className="eyebrow">
                    {r.sample
                      ? "SAMPLE REQUEST"
                      : r.kind === "rent"
                        ? "RENTAL REQUEST"
                        : "PURCHASE INQUIRY"}
                  </span>
                  <h3>{r.equipmentTitle}</h3>
                  <p>
                    {r.customerName} · {r.customerEmail}
                  </p>
                  <p>
                    {r.start ? `${r.start} → ${r.end}` : "Purchase inquiry"} ·{" "}
                    {currency(r.total)}
                  </p>
                  {r.message && <blockquote>{r.message}</blockquote>}
                </div>
                <div>
                  <span className={`status-chip ${r.status}`}>{r.status}</span>
                  {r.status === "pending" && (
                    <div className="request-actions">
                      <button
                        className="button primary"
                        onClick={() => onRequestStatus(r.id, "accepted")}
                      >
                        <Check size={15} />
                        Accept
                      </button>
                      <button
                        className="button outline"
                        onClick={() => onRequestStatus(r.id, "declined")}
                      >
                        <X size={15} />
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <Clock3 size={35} />
              <h2>A quiet moment before the season.</h2>
              <p>Your rental requests and sale inquiries will appear here.</p>
            </div>
          )}
          <button className="button outline" onClick={sample}>
            Add a sample request
          </button>
          <p className="form-note">
            Accepting a request changes its demo status only. No messages,
            payments, or agreements are sent.
          </p>
        </div>
      )}
    </section>
  );
}
