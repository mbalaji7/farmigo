import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { localDate } from "../utils";
export default function AvailabilityCalendar({
  start,
  end,
  blocked,
  onSelect,
}: {
  start: string;
  end: string;
  blocked: Set<string>;
  onSelect: (date: string) => void;
}) {
  const [month, setMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });
  useEffect(() => {
    if (!start) return;
    const date = new Date(`${start}T00:00:00`);
    if (Number.isFinite(date.getTime())) {
      date.setDate(1);
      setMonth(date);
    }
  }, [start]);
  const first = month.getDay(),
    length = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = localDate();
  const title = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const move = (amount: number) =>
    setMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + amount, 1),
    );
  return (
    <div className="availability-calendar">
      <div className="calendar-heading">
        <button
          type="button"
          aria-label="Previous month"
          disabled={
            month.getFullYear() === new Date().getFullYear() &&
            month.getMonth() === new Date().getMonth()
          }
          onClick={() => move(-1)}
        >
          <ChevronLeft size={17} />
        </button>
        <strong>{title}</strong>
        <button type="button" aria-label="Next month" onClick={() => move(1)}>
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <span
            key={i}
            className="weekday"
            aria-label={
              [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ][i]
            }
          >
            {day}
          </span>
        ))}
        {Array.from({ length: first }, (_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {Array.from({ length }, (_, i) => {
          const date = localDate(
            new Date(month.getFullYear(), month.getMonth(), i + 1),
          );
          const unavailable = date < today || blocked.has(date);
          return (
            <button
              key={date}
              type="button"
              disabled={unavailable}
              className={`${start === date || end === date ? "chosen" : ""} ${start && end && date > start && date < end ? "in-range" : ""}`}
              aria-label={`${date}${unavailable ? ", unavailable" : ""}`}
              aria-pressed={start === date || end === date}
              onClick={() => onSelect(date)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <p>Choose a start and end date. Crossed-out dates are unavailable.</p>
    </div>
  );
}
