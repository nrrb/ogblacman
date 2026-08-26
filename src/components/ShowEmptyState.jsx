import AppLink from './AppLink.jsx'
import './ShowEmptyState.css'

export default function ShowEmptyState({ content }) {
  return (
    <section className="show-empty" aria-label="Show announcements">
      <div className="show-empty__status">
        <span className="show-empty__status-label">
          <span className="show-empty__dot" aria-hidden="true" />
          {content.statusLabel}
        </span>
        <span className="show-empty__availability">{content.availability}</span>
      </div>

      <span className="show-empty__rule" aria-hidden="true" />

      <h3 className="show-empty__headline">
        <span className="show-empty__headline-main">{content.headline}</span>
        <span className="show-empty__headline-accent">{content.accent}</span>
      </h3>

      <p className="show-empty__copy">{content.body}</p>

      <AppLink link={content.cta} className="show-empty__cta">
        <span>{content.cta.label}</span>
        <span className="show-empty__arrow" aria-hidden="true">→</span>
      </AppLink>
    </section>
  )
}
