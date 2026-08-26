import AppLink from './AppLink.jsx'

const ticketLabels = {
  available: 'TICKETS',
  soldOut: 'SOLD OUT',
  cancelled: 'CANCELLED',
  unavailable: 'INFO SOON',
}

function formatShowDate(show) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: show.timezone,
  }).format(new Date(show.startAt)).toUpperCase()
}

export default function ClientList({ items, variant }) {
  return (
    <div className={`client-list${variant === 'mobile' ? ' client-list--mobile' : ''}`}>
      <div className={`client-grid${variant === 'desktop' ? ' client-grid--desktop' : ''}`} role="list">
        {items.map((item) => (
          <div
            key={item._key}
            role="listitem"
            className={`client-grid__item ${variant === 'mobile' ? 'client-grid__item--half' : 'client-grid__item--quarter'}`}
          >
            <AppLink
              link={item.ticketLink}
              className="client-link show-link"
            >
              <span className="show-link__date">{formatShowDate(item)}</span>
              <span className="show-link__location">{item.venue} · {item.city}</span>
              <span className="show-link__action">{ticketLabels[item.ticketStatus]}</span>
            </AppLink>
          </div>
        ))}
      </div>
    </div>
  )
}
