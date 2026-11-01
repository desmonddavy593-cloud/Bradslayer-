"use client";
import { useState } from "react";
export function CommunityActions({
  appId,
  initialLikes = 0,
}: {
  appId: string;
  initialLikes: number;
}) {
  const [likes, setLikes] = useState(initialLikes),
    [liked, setLiked] = useState(false),
    [open, setOpen] = useState(false),
    [reason, setReason] = useState("App cassée"),
    [message, setMessage] = useState("");
  const like = async () => {
    const r = await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId }),
    });
    if (r.ok) {
      const d = await r.json();
      setLikes(d.count);
      setLiked(d.liked);
    }
  };
  const report = async (e: any) => {
    e.preventDefault();
    const r = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, reason, message }),
    });
    setMessage(r.ok ? "Signalement envoyé." : (await r.json()).error);
    if (r.ok) setOpen(false);
  };
  return (
    <div className="community-actions">
      <button className={`like-button ${liked ? "liked" : ""}`} onClick={like}>
        ♥ {likes} J’aime
      </button>
      <button className="report-button" onClick={() => setOpen(!open)}>
        Signaler
      </button>
      {open && (
        <form className="report-form" onSubmit={report}>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>App cassée</option>
            <option>Contenu dangereux</option>
            <option>Arnaque ou fausse app</option>
            <option>Autre</option>
          </select>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            placeholder="Message facultatif"
          />
          <button className="button">Envoyer</button>
          {message && <small>{message}</small>}
        </form>
      )}
    </div>
  );
}
