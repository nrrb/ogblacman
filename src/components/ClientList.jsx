import AppLink from './AppLink.jsx'

export default function ClientList({ items, variant }) {
  return (
    <div className={`client-list${variant === 'mobile' ? ' client-list--mobile' : ''}`}>
      <div className={`client-grid${variant === 'desktop' ? ' client-grid--desktop' : ''}`} role="list">
        {items.map((item) => (
          <div
            key={item.id}
            role="listitem"
            className={`client-grid__item ${variant === 'mobile' ? 'client-grid__item--half' : 'client-grid__item--quarter'}`}
          >
            <AppLink
              link={{ url: item.url, title: item.link_title, label: item.label }}
              className="client-link show-link"
            >
              {item.meta && <span className="show-link__date">{item.meta}</span>}
              <span className="show-link__location">{item.label}</span>
              {item.action_label && <span className="show-link__action">{item.action_label}</span>}
            </AppLink>
          </div>
        ))}
      </div>
    </div>
  )
}
