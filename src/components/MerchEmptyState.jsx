import AppLink from './AppLink.jsx'
import './MerchEmptyState.css'

export default function MerchEmptyState({ content }) {
  return (
    <section className="merch-empty" aria-label="Merchandise announcements">
      <div className="merch-empty__status">
        <span className="merch-empty__label">
          <span className="merch-empty__mark" aria-hidden="true">✦</span>
          {content.statusLabel}
        </span>
        <span className="merch-empty__availability">{content.availability}</span>
      </div>

      <span className="merch-empty__rule" aria-hidden="true" />

      <h3 className="merch-empty__headline">
        <span className="merch-empty__headline-main">{content.headline}</span>
        <span className="merch-empty__headline-accent">{content.accent}</span>
      </h3>

      <p className="merch-empty__copy">{content.body}</p>

      <AppLink link={content.cta} className="merch-empty__cta">
        <span>{content.cta.label}</span>
        <span className="merch-empty__arrow" aria-hidden="true">→</span>
      </AppLink>
    </section>
  )
}
