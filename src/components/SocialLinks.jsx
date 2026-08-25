import AppLink from './AppLink.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'

export default function SocialLinks({ links }) {
  return (
    <div className="social-links">
      {links.map((item) => (
        <AppLink key={item.id} link={item} className="social-link">
          <ResponsiveImage image={item.icon} className="social-icon" loading="lazy" />
        </AppLink>
      ))}
    </div>
  )
}
