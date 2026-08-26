import './ManagerCard.css'

export default function ManagerCard({ manager }) {
  return (
    <address className="manager-contact">
      <div className="manager-contact__heading">
        <div className="manager-contact__eyebrow">{manager.jobTitle}</div>
        <div className="manager-contact__name">{manager.name}</div>
      </div>

      <span className="manager-contact__rule" aria-hidden="true" />

      <div className="manager-contact__details">
        <div className="manager-contact__detail">
          <div className="manager-contact__label">Email</div>
          <a href={`mailto:${manager.email}`} className="manager-contact__link">
            {manager.email}
          </a>
        </div>

        <div className="manager-contact__detail">
          <div className="manager-contact__label">Phone</div>
          <a href={`tel:${manager.phone.replace(/[^+\d]/g, '')}`} className="manager-contact__link">
            {manager.phone}
          </a>
        </div>
      </div>
    </address>
  )
}
