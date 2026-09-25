// Today's plans shown as gilt stars filling up, never as a number to hit.
import Icon from "../../icons.jsx";

export default function Stars({ count, of }) {
  return (
    <section className="sheet story-stars-sheet">
      <div className="story-stars" role="img" aria-label={`${Math.min(count, of)} of today's stars filled`}>
        {Array.from({ length: of }, (_, i) => (
          <span key={i} className={`story-star ${i < count ? "lit pop" : ""}`}>
            <Icon name="star" size={52} strokeWidth={1.1} />
          </span>
        ))}
      </div>
      <p className="story-stars-note">
        {count >= of ? "Today's stars are all lit. You're a master builder." : "Each plan you build lights a star."}
      </p>
    </section>
  );
}
