// Today's plans shown as stars filling up, never as a number to hit.
export default function Stars({ count, of }) {
  return (
    <div className="card center">
      <div className="story-stars">
        {Array.from({ length: of }, (_, i) => (
          <span key={i} className={i < count ? "lit pop" : ""}>{i < count ? "⭐" : "☆"}</span>
        ))}
      </div>
      <div className="soft story-stars-note">
        {count >= of ? "Today's plans are done. You're a master builder!" : "Fill up today's stars with story plans."}
      </div>
    </div>
  );
}
