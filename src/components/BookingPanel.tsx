import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Truck,
  CalendarDays,
} from "lucide-react";
import { type Equipment } from "../data";
import { type DemoProfile } from "../accountTypes";
import { type EquipmentRequest } from "../marketplaceTypes";
import { PageLink, useRouter } from "../router";
import { currency, localDate } from "../utils";
import {
  blockedFor,
  daysBetween,
  isRangeAvailable,
  rentalQuote,
} from "../booking";
import AvailabilityCalendar from "./AvailabilityCalendar";
export default function BookingPanel({
  equipment: e,
  mode,
  close,
  profile,
  requests,
  onRequest,
}: {
  equipment: Equipment;
  mode: "rent" | "buy";
  close: () => void;
  profile: DemoProfile | null;
  requests: EquipmentRequest[];
  onRequest: (request: EquipmentRequest) => void;
}) {
  const { path } = useRouter();
  const params = new URLSearchParams(path.split("?")[1]);
  const initialStart = params.get("start") || "",
    initialEnd = params.get("end") || "";
  const validInitial =
    initialStart >= localDate() &&
    isRangeAvailable(
      initialStart,
      initialEnd,
      blockedFor(e.id, e.blockedDates || [], requests),
    );
  const [start, setStart] = useState(validInitial ? initialStart : ""),
    [end, setEnd] = useState(validInitial ? initialEnd : ""),
    [name, setName] = useState(profile?.name || ""),
    [email, setEmail] = useState(profile?.email || ""),
    [message, setMessage] = useState(""),
    [transport, setTransport] = useState<"pickup" | "delivery">("pickup"),
    [address, setAddress] = useState(""),
    [review, setReview] = useState(false),
    [submitted, setSubmitted] = useState<EquipmentRequest | null>(null),
    [error, setError] = useState("");
  const days = daysBetween(start, end),
    blocked = blockedFor(e.id, e.blockedDates || [], requests);
  const available =
    (!e.status || e.status === "active") &&
    (mode === "buy" ||
      (start >= localDate() && isRangeAvailable(start, end, blocked)));
  const deliveryAllowed = e.deliveryAvailable ?? true;
  const quote =
    mode === "rent" && days > 0 && days <= 90
      ? rentalQuote(
          days,
          e.rent,
          e.weeklyRent || e.rent * 6,
          e.monthlyRent || e.rent * 22,
          e.deposit || 0,
          transport === "delivery" ? (e.deliveryFee ?? 75) : 0,
        )
      : {
          rental: e.price,
          deposit: 0,
          delivery: 0,
          total: e.price,
          savings: 0,
        };
  function selectDate(date: string) {
    if (!start || end || date < start) {
      setStart(date);
      setEnd("");
    } else setEnd(date);
    setError("");
  }
  function validate() {
    if (e.status && e.status !== "active") {
      setError("This listing is currently unavailable.");
      return false;
    }
    if (mode === "rent" && !available) {
      setError(
        days > 90
          ? "Please request no more than 90 days."
          : "Choose an available date range, with no blocked dates between start and end.",
      );
      return false;
    }
    return true;
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (validate()) setReview(true);
  }
  function confirm() {
    if (!validate()) {
      setReview(false);
      return;
    }
    const request: EquipmentRequest = {
      id: crypto.randomUUID(),
      equipmentId: e.id,
      equipmentTitle: e.title,
      owner: e.owner,
      customerName: name.trim(),
      customerEmail: email.trim(),
      kind: mode,
      status: "pending",
      start: mode === "rent" ? start : undefined,
      end: mode === "rent" ? end : undefined,
      days: mode === "rent" ? days : undefined,
      delivery: transport,
      deliveryAddress: transport === "delivery" ? address.trim() : undefined,
      total: quote.total,
      deposit: quote.deposit,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };
    onRequest(request);
    setSubmitted(request);
  }
  const breakdown = (
    <div className="quote-breakdown">
      <div>
        <span>
          {mode === "rent"
            ? `Equipment rental · ${days} ${days === 1 ? "day" : "days"}`
            : "Asking price"}
        </span>
        <strong>{currency(quote.rental)}</strong>
      </div>
      {mode === "rent" && quote.savings > 0 && (
        <div className="quote-saving">
          <span>Longer rental savings</span>
          <span>{currency(quote.savings)} saved</span>
        </div>
      )}
      {mode === "rent" && (
        <>
          <div>
            <span>Refundable deposit</span>
            <strong>{currency(quote.deposit)}</strong>
          </div>
          <div>
            <span>{transport === "delivery" ? "Delivery" : "Pickup"}</span>
            <strong>{currency(quote.delivery)}</strong>
          </div>
          <div className="quote-total">
            <span>Total if accepted</span>
            <strong>{currency(quote.total)}</strong>
          </div>
        </>
      )}
    </div>
  );
  if (submitted)
    return (
      <div className="booking-panel success-panel">
        <CheckCircle2 size={42} />
        <h3>{mode === "rent" ? "Request saved!" : "Inquiry saved!"}</h3>
        <p>Reference: FG-{submitted.id.slice(0, 8).toUpperCase()}</p>
        <p>
          Your local demo request is pending. The owner dashboard can accept or
          decline it. No payment or message has been sent.
        </p>
        {submitted.kind === "rent" && (
          <PageLink
            className="button outline full"
            page={`/rentals/${submitted.id}`}
          >
            View rental progress
          </PageLink>
        )}
        <button className="button primary full" onClick={close}>
          Keep exploring
          <ArrowRight size={17} />
        </button>
      </div>
    );
  if (e.status && e.status !== "active")
    return (
      <div className="booking-panel">
        <h3>
          {e.status === "sold"
            ? "This equipment is sold."
            : "This listing is paused."}
        </h3>
        <p className="form-note">
          Explore another listing to find the right tool for your season.
        </p>
        <button className="button primary full" onClick={close}>
          Explore equipment
        </button>
      </div>
    );
  return (
    <div className="booking-panel">
      <span className="eyebrow">
        {review ? "CHECK THE DETAILS" : "YOUR NEXT GOOD SEASON"}
      </span>
      <div className="detail-price">
        {currency(mode === "rent" ? e.rent : e.price)}
        {mode === "rent" && <span> / day</span>}
      </div>
      {mode === "rent" && (
        <p className="rate-options">
          {currency(e.weeklyRent || e.rent * 6)} / week ·{" "}
          {currency(e.monthlyRent || e.rent * 22)} / 30 days
        </p>
      )}
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {review ? (
        <>
          <h3 className="review-heading">
            Review your {mode === "rent" ? "rental request" : "inquiry"}.
          </h3>
          <dl className="review-details">
            <dt>Equipment</dt>
            <dd>{e.title}</dd>
            <dt>Neighbor</dt>
            <dd>
              {name} · {email}
            </dd>
            {mode === "rent" && (
              <>
                <dt>Dates</dt>
                <dd>
                  {start} → {end}
                </dd>
                <dt>Transport</dt>
                <dd>
                  {transport === "pickup" ? `Pickup in ${e.city}` : address}
                </dd>
              </>
            )}
            {message && (
              <>
                <dt>Message</dt>
                <dd>{message}</dd>
              </>
            )}
          </dl>
          {breakdown}
          <button className="button primary full" onClick={confirm}>
            Confirm demo {mode === "rent" ? "request" : "inquiry"}
            <ArrowRight size={17} />
          </button>
          <button className="review-back" onClick={() => setReview(false)}>
            <ChevronLeft size={14} />
            Edit details
          </button>
          <p className="form-note">
            No payment is collected. Availability and transport still require
            owner confirmation.
          </p>
        </>
      ) : (
        <form onSubmit={submit}>
          {mode === "rent" && (
            <>
              <AvailabilityCalendar
                start={start}
                end={end}
                blocked={blocked}
                onSelect={selectDate}
              />
              <div className="date-inputs">
                <label>
                  Start date
                  <input
                    type="date"
                    min={localDate()}
                    required
                    value={start}
                    onInput={(ev) => {
                      setStart(ev.currentTarget.value);
                      if (end < ev.currentTarget.value) setEnd("");
                    }}
                  />
                </label>
                <label>
                  End date
                  <input
                    type="date"
                    min={start || localDate()}
                    required
                    value={end}
                    onInput={(ev) => setEnd(ev.currentTarget.value)}
                  />
                </label>
              </div>
              <fieldset className="transport-options">
                <legend>Pickup or delivery</legend>
                <label>
                  <input
                    type="radio"
                    name="transport"
                    checked={transport === "pickup"}
                    onChange={() => setTransport("pickup")}
                  />
                  <CalendarDays size={16} />
                  Pickup · Free
                </label>
                <label>
                  <input
                    type="radio"
                    name="transport"
                    checked={transport === "delivery"}
                    disabled={!deliveryAllowed}
                    onChange={() => setTransport("delivery")}
                  />
                  <Truck size={16} />
                  {deliveryAllowed
                    ? `Delivery · ${currency(e.deliveryFee ?? 75)}`
                    : "Delivery unavailable"}
                </label>
              </fieldset>
              {transport === "delivery" && (
                <label>
                  Delivery address
                  <textarea
                    required
                    rows={2}
                    maxLength={500}
                    value={address}
                    onChange={(ev) => setAddress(ev.target.value)}
                    placeholder="Address and access instructions"
                  />
                </label>
              )}
            </>
          )}
          <label>
            Your name
            <input
              required
              name="name"
              autoComplete="name"
              maxLength={80}
              pattern=".*\S.*"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
          </label>
          <label>
            Email address
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </label>
          <label>
            Message to the owner{mode === "rent" ? " (optional)" : ""}
            <textarea
              rows={2}
              required={mode === "buy"}
              maxLength={1500}
              value={message}
              onChange={(ev) => setMessage(ev.target.value)}
              placeholder="Tell the owner what you need…"
            />
          </label>
          {(mode === "buy" || days > 0) && breakdown}
          <button className="button primary full" type="submit">
            Review {mode === "rent" ? "rental request" : "inquiry"}
            <ArrowRight size={17} />
          </button>
          <p className="form-note">
            Demo rates and availability. Requests stay on this browser.
          </p>
        </form>
      )}
    </div>
  );
}
