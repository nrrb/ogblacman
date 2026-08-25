import AppLink from './AppLink.jsx'
import './MerchEmptyState.css'

export default function MerchEmptyState({ copy, cta }) {
  return (
    <section className="merch-empty" aria-label="Merchandise announcements">
      <div className="merch-empty__status">
        <span className="merch-empty__label">
          <span className="merch-empty__mark" aria-hidden="true">✦</span>
          OG Blacman goods
        </span>
        <span className="merch-empty__availability">Drop 001 — in development</span>
      </div>

      <span className="merch-empty__rule" aria-hidden="true" />

      <h3 className="merch-empty__headline">
        <span className="merch-empty__headline-main">The first drop</span>
        <span className="merch-empty__headline-accent">is taking shape.</span>
      </h3>

      <p className="merch-empty__copy">{copy}</p>

      <AppLink link={cta} className="merch-empty__cta">
        <span>{cta.label}</span>
        <span className="merch-empty__arrow" aria-hidden="true">→</span>
      </AppLink>
    </section>
  )
}
