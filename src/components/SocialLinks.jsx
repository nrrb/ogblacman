import AppLink from './AppLink.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'

export default function SocialLinks({ links, className = '' }) {
  return (
    <div className={`social-links${className ? ` ${className}` : ''}`}>
      {links.map((item) => (
        <AppLink
          key={item._key}
          link={{ type: 'external', url: item.url, ariaLabel: item.label }}
          className="social-link"
        >
          <ResponsiveImage image={item.icon} className="social-icon" loading="lazy" />
        </AppLink>
      ))}
    </div>
  )
}
