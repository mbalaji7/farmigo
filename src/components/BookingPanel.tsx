import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Handshake, CircleHelp } from "lucide-react";
import { type Equipment } from "../data";
import { currency, localDate } from "../utils";
export default function BookingPanel({
  equipment: e,
  mode,
  close,
}: {
  equipment: Equipment;
  mode: "rent" | "buy";
  close: () => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [sent, setSent] = useState(false);
  const days =
    start && end
      ? Math.max(
          1,
          Math.round(
            (new Date(`${end}T12:00:00`).getTime() -
              new Date(`${start}T12:00:00`).getTime()) /
              86400000,
          ) + 1,
        )
      : 0;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };
  return (
    <div className="booking-panel">
      {sent ? (
        <div className="success-panel">
          <CheckCircle2 size={43} />
          <h3>
            {mode === "rent"
              ? "Your request is ready!"
              : "Your inquiry is ready!"}
          </h3>
          <p>
            This is a frontend preview. Your request has not been sent to the
            owner and no payment has been taken.
          </p>
          <button className="button primary full" onClick={close}>
            Back to exploring
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
          <span className="eyebrow">
            {mode === "rent"
              ? "MAKE IT YOURS FOR THE DAY"
              : "YOUR NEXT FARM INVESTMENT"}
          </span>
          <div className="detail-price">
            {currency(mode === "rent" ? e.rent : e.price)}
            {mode === "rent" && <span> / day</span>}
          </div>
          <p className="available">
            <span />
            Available to {mode === "rent" ? "rent" : "buy"}
          </p>
          <form onSubmit={submit}>
            {mode === "rent" && (
              <div className="date-inputs">
                <label>
                  Start date
                  <input
                    type="date"
                    required
                    min={localDate()}
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
                    required
                    min={start || localDate()}
                    value={end}
                    onInput={(ev) => setEnd(ev.currentTarget.value)}
                  />
                </label>
              </div>
            )}
            <label>
              Your name
              <input
                required
                name="name"
                autoComplete="name"
                placeholder="First and last name"
                maxLength={80}
              />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                name="email"
                placeholder="you@yourfarm.com"
              />
            </label>
            {mode === "buy" && (
              <label>
                Message to the owner
                <textarea
                  required
                  placeholder="Tell the owner a little about what you’re looking for…"
                  rows={3}
                  maxLength={1500}
                />
              </label>
            )}
            {days > 0 && mode === "rent" && (
              <div className="booking-total">
                <span>
                  {currency(e.rent)} × {days} {days === 1 ? "day" : "days"}
                </span>
                <strong>{currency(days * e.rent)}</strong>
              </div>
            )}
            <button className="button primary full" type="submit">
              {mode === "rent" ? "Request to rent" : "Contact the owner"}
              <ArrowRight size={17} />
            </button>
            <p className="form-note">Frontend demo · No payment required</p>
          </form>
          <div className="booking-perks">
            <span>
              <Handshake size={17} />
              Connect directly with the owner
            </span>
            <span>
              <CircleHelp size={17} />
              Confirm transport and availability
            </span>
          </div>
        </>
      )}
    </div>
  );
}
