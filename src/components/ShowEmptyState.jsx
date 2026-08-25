import './ShowEmptyState.css'

export default function ShowEmptyState({ copy }) {
  return (
    <section className="show-empty" aria-label="Show announcements">
      <div className="show-empty__status">
        <span className="show-empty__status-label">
          <span className="show-empty__dot" aria-hidden="true" />
          Live transmission
        </span>
        <span className="show-empty__availability">No dates posted — yet</span>
      </div>

      <span className="show-empty__rule" aria-hidden="true" />

      <h3 className="show-empty__headline">
        <span className="show-empty__headline-main">The next show</span>
        <span className="show-empty__headline-accent">is loading.</span>
      </h3>

      <p className="show-empty__copy">{copy}</p>

      <a className="show-empty__cta" href="#mailing-list">
        <span>Get show alerts</span>
        <span className="show-empty__arrow" aria-hidden="true">→</span>
      </a>
    </section>
  )
}
