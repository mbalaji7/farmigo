import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, MessageCircle, Plus, Send, Search } from "lucide-react";
import { type Conversation } from "../messageTypes";
import { PageLink, useRouter } from "../router";
export default function Messages({
  conversations,
  onSend,
  onRead,
  onSample,
  onReply,
}: {
  conversations: Conversation[];
  onSend: (id: string, body: string) => void;
  onRead: (id: string) => void;
  onSample: () => void;
  onReply: (id: string) => void;
}) {
  const { path, navigate } = useRouter();
  const id = new URLSearchParams(path.split("?")[1]).get("thread");
  const selected = conversations.find((c) => c.id === id);
  const [query, setQuery] = useState(""),
    [body, setBody] = useState("");
  const read = useRef(onRead); read.current = onRead;
  useEffect(() => { setBody(""); }, [selected?.id]);
  useEffect(() => { if(selected?.unread)read.current(selected.id); }, [selected?.id,selected?.unread]);
  function send(event: FormEvent) {
    event.preventDefault();
    if (selected && body.trim()) {
      onSend(selected.id, body.trim());
      setBody("");
    }
  }
  const visible = conversations
    .filter((c) =>
      `${c.owner} ${c.equipmentTitle}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      (b.messages.at(-1)?.createdAt || b.createdAt).localeCompare(
        a.messages.at(-1)?.createdAt || a.createdAt,
      ),
    );
  return (
    <section className="workspace-page messages-page page-width">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">GOOD CONVERSATIONS. BETTER SEASONS.</span>
          <h1>Your inbox.</h1>
          <p>
            Equipment conversations in one place. Messages in this preview stay
            on this browser.
          </p>
        </div>
        <button className="button outline" onClick={onSample}>
          <Plus size={16} />
          Sample conversation
        </button>
      </div>
      <div className={`inbox-container ${selected ? "has-thread" : ""}`}>
        <aside className="inbox-sidebar">
          <label className="inbox-search">
            <Search size={16} />
            <input
              aria-label="Search conversations"
              value={query}
              onChange={(ev) => setQuery(ev.target.value)}
              placeholder="Find a conversation"
            />
          </label>
          {visible.length ? (
            visible.map((c) => (
              <button
                key={c.id}
                className={`conversation-link ${selected?.id === c.id ? "selected" : ""}`}
                onClick={() => navigate(`/messages?thread=${c.id}`)}
              >
                <span className="owner-avatar">
                  {c.owner
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span>
                  <strong>{c.owner}</strong>
                  <span>{c.equipmentTitle}</span>
                  <small>
                    {c.messages.at(-1)?.body || "Start a conversation"}
                  </small>
                </span>
                {c.unread > 0 && <b>{c.unread}</b>}
              </button>
            ))
          ) : (
            <div className="inbox-empty">
              <MessageCircle size={28} />
              <h3>
                {query
                  ? "No matching conversations."
                  : "Say hello to a good neighbor."}
              </h3>
              <p>Open an equipment page and choose Message owner to begin.</p>
              <PageLink page="marketplace" className="text-link">
                Explore equipment
              </PageLink>
            </div>
          )}
        </aside>
        <div className="message-pane">
          {selected ? (
            <>
              <header className="conversation-header">
                <button
                  className="icon-button inbox-back"
                  aria-label="Back to conversations"
                  onClick={() => navigate("/messages")}
                >
                  <ArrowLeft size={19} />
                </button>
                <div>
                  <h2>{selected.owner}</h2>
                  <PageLink page={`/equipment/${selected.equipmentId}`}>
                    {selected.equipmentTitle}
                  </PageLink>
                </div>
                <span className="status-chip">Local demo</span>
              </header>
              <div
                className="message-stream"
                role="log"
                aria-label="Conversation messages"
                aria-live="polite"
              >
                {selected.messages.length ? (
                  selected.messages.map((m) => (
                    <div
                      className={`message-bubble ${m.sender === "you" ? "outgoing" : "incoming"}`}
                      key={m.id}
                    >
                      <p>{m.body}</p>
                      <span>
                        {m.sender === "you" ? "You" : selected.owner} ·{" "}
                        {new Date(m.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="inbox-empty">
                    <MessageCircle size={30} />
                    <h3>Every good season starts with a hello.</h3>
                    <p>
                      Ask about compatibility, pickup, or equipment condition.
                    </p>
                  </div>
                )}
              </div>
              <form className="message-composer" onSubmit={send}>
                <label className="visually-hidden" htmlFor="message-body">
                  Your message
                </label>
                <textarea
                  id="message-body"
                  required
                  maxLength={2000}
                  rows={2}
                  value={body}
                  onChange={(ev) => setBody(ev.target.value)}
                  placeholder="Write a message to the owner…"
                />
                <button
                  className="button primary"
                  disabled={!body.trim()}
                  type="submit"
                >
                  <Send size={16} />
                  Send demo message
                </button>
              </form>
              <div className="message-demo-note">
                <span>No message is sent to a real owner.</span>
                <button onClick={() => onReply(selected.id)}>
                  Add demo owner reply
                </button>
              </div>
            </>
          ) : (
            <div className="inbox-empty">
              <MessageCircle size={38} />
              <h2>A little closer to your next workhorse.</h2>
              <p>Select a conversation to pick up where you left off.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
