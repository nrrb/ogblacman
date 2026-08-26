import AppLink from './AppLink.jsx'

function copyrightText(footer) {
  const currentYear = new Date().getFullYear()
  const years = currentYear > footer.copyrightStartYear
    ? `${footer.copyrightStartYear}–${currentYear}`
    : String(footer.copyrightStartYear)
  return `© COPYRIGHT ${years} ${footer.copyrightOwner}. ALL RIGHTS RESERVED.`
}

export default function SiteFooter({ footer, className = '' }) {
  if (footer.status !== 'visible') return null

  return (
    <footer className={`newsletter-footer${className ? ` ${className}` : ''}`}>
      <span>{copyrightText(footer)}</span>
      {footer.links.length > 0 && (
        <nav className="footer-links" aria-label="Legal">
          {footer.links.map((link) => (
            <AppLink key={link._key} link={link} className="footer-link" />
          ))}
        </nav>
      )}
    </footer>
  )
}
