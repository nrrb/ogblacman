import AppLink from './AppLink.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'

export default function FamilyPackRelease({ section }) {
  return (
    <div className="family-pack-release">
      <ResponsiveImage
        image={section.coverArt}
        className="family-pack-release__cover"
        width="800"
        height="800"
        loading="lazy"
      />
      <div className="family-pack-release__links">
        <div>
          <AppLink link={section.purchaseLink} className="release-spotlight__cta" />
          <p className="release-spotlight__copy">{section.purchaseExplanation}</p>
        </div>
        <AppLink link={section.presaveLink} className="release-spotlight__cta" />
      </div>
    </div>
  )
}
