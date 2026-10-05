import { useState } from "react";
import { Eye, Heart, CalendarDays, MessageCircle } from "lucide-react";
import type { Equipment } from "../data";
import type { EquipmentRequest } from "../marketplaceTypes";
import { type ActivityEvent, summarizeRequests } from "../insights";
import { PageLink } from "../router";
import { currency, localDate } from "../utils";
export default function Insights({
  equipment,
  requests,
  events,
  saved,
}: {
  equipment: Equipment[];
  requests: EquipmentRequest[];
  events: ActivityEvent[];
  saved: string[];
}) {
  const [range, setRange] = useState(30);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - range + 1);
  cutoffDate.setHours(0, 0, 0, 0);
  const cutoff = cutoffDate.toISOString();
  const ownRequests = requests.filter((r) =>
    equipment.some((e) => e.id === r.equipmentId),
  );
  const selected = ownRequests.filter((r) => r.createdAt >= cutoff);
  const activity = events.filter(
    (ev) =>
      ev.createdAt >= cutoff && equipment.some((e) => e.id === ev.equipmentId),
  );
  const stats = summarizeRequests(selected);
  const upcoming = ownRequests
    .filter(
      (r) =>
        !r.sample &&
        r.kind === "rent" &&
        r.status === "accepted" &&
        r.stage !== "returned" &&
        (r.end || "") >= localDate(),
    )
    .sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const trend = Array.from({ length: Math.min(range, 14) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - Math.min(range, 14) + 1 + i);
    return {
      date: localDate(d),
      count: activity.filter(
        (ev) =>
          ev.kind === "view" &&
          localDate(new Date(ev.createdAt)) === localDate(d),
      ).length,
    };
  });
  const peak = Math.max(1, ...trend.map((t) => t.count));
  return (
    <section className="workspace-page page-width">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">PLAN YOUR EQUIPMENT’S NEXT SEASON</span>
          <h1>Owner insights.</h1>
          <p>A clear picture of your listings and rental requests.</p>
        </div>
        <PageLink className="button outline" page="/dashboard">
          Manage listings
        </PageLink>
      </div>
      <p className="readable-note">
        These metrics reflect this browser only. Views and save actions start
        from this update; up to 2,000 recent activity events are retained.
        Quoted values are not earnings. No payment is processed.
      </p>
      <label className="insights-range">
        Reporting period
        <select
          value={range}
          onChange={(ev) => setRange(Number(ev.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </label>
      {equipment.length ? (
        <>
          <div className="insights-stats">
            <article>
              <Eye />
              <strong>
                {activity.filter((ev) => ev.kind === "view").length}
              </strong>
              <span>Listing views</span>
            </article>
            <article>
              <Heart />
              <strong>
                {activity.filter((ev) => ev.kind === "save").length}
              </strong>
              <span>Save actions</span>
            </article>
            <article>
              <MessageCircle />
              <strong>{stats.inquiries}</strong>
              <span>Rental requests & purchase inquiries</span>
            </article>
            <article>
              <CalendarDays />
              <strong>{stats.accepted}</strong>
              <span>Accepted rental requests</span>
            </article>
          </div>
          <div className="rental-summary-grid">
            <article className="workflow-card">
              <h2>Quoted rental value</h2>
              <strong className="insight-value">
                {currency(stats.quoted)}
              </strong>
              <p>
                Accepted rental quotes in this period, excluding refundable
                deposits. This can include delivery charges.
              </p>
              <p className="readable-note">
                {stats.pending} pending requests · {stats.returned} recorded
                returns · $0 payments processed
              </p>
            </article>
            <article className="workflow-card">
              <h2>Recent listing views</h2>
              <div
                className="insights-chart"
                role="img"
                aria-label={`Daily views: ${trend.map((t) => `${t.date}: ${t.count}`).join(", ")}`}
              >
                {trend.map((t) => (
                  <div key={t.date} title={`${t.date}: ${t.count} views`}>
                    <span>{t.count}</span>
                    <i
                      style={{
                        height: `${Math.max(3, (t.count / peak) * 100)}px`,
                      }}
                    />
                    <small>{t.date.slice(8)}</small>
                  </div>
                ))}
              </div>
              <p className="readable-note">
                Most recent {trend.length} days · Local activity only
              </p>
            </article>
          </div>
          <h2 className="insights-section-heading">Listing performance</h2>
          <div className="comparison-scroll">
            <table className="performance-table">
              <caption className="visually-hidden">
                Local listing performance for the selected reporting period
              </caption>
              <thead>
                <tr>
                  <th scope="col">Equipment</th>
                  <th scope="col">Status</th>
                  <th scope="col">Views</th>
                  <th scope="col">Saved here now</th>
                  <th scope="col">Inquiries</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((e) => (
                  <tr key={e.id}>
                    <th scope="row">
                      <PageLink page={`/equipment/${e.id}`}>{e.title}</PageLink>
                    </th>
                    <td>{e.status || "active"}</td>
                    <td>
                      {
                        activity.filter(
                          (ev) => ev.kind === "view" && ev.equipmentId === e.id,
                        ).length
                      }
                    </td>
                    <td>{saved.includes(e.id) ? "Yes" : "No"}</td>
                    <td>
                      {
                        selected.filter(
                          (r) => !r.sample && r.equipmentId === e.id,
                        ).length
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className="insights-section-heading">Upcoming rentals</h2>
          {upcoming.length ? (
            <div className="request-list">
              {upcoming.map((r) => (
                <article className="request-card" key={r.id}>
                  <div>
                    <h3>{r.equipmentTitle}</h3>
                    <p>
                      {r.start} through {r.end} · {r.customerName}
                    </p>
                  </div>
                  <PageLink
                    className="button outline"
                    page={`/rentals/${r.id}`}
                  >
                    View rental progress
                  </PageLink>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No upcoming accepted rentals.</h3>
              <p>
                Accept available rental requests from your dashboard to organize
                pickup.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Eye size={35} />
          <h2>Your first listing starts the story.</h2>
          <p>
            Create equipment listings to see local views, requests, and upcoming
            rentals here.
          </p>
          <PageLink className="button primary" page="/dashboard">
            Open owner dashboard
          </PageLink>
        </div>
      )}
    </section>
  );
}
