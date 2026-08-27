import AppLink from './AppLink.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'
import TelephonePlayer from './TelephonePlayer.jsx'

function formatReleaseDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`)).toUpperCase()
}

export default function TopPickRelease({ section, variant = 'desktop' }) {
  const { release, playerCopy } = section

  return (
    <div className="top-pick-release">
      <div className="release-spotlight__content">
        <div className="release-spotlight__details">
          <div className="release-spotlight__meta">
            <span>{release.typeLabel}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={release.releaseDate}>{formatReleaseDate(release.releaseDate)}</time>
          </div>
          <div className="release-spotlight__intro">
            <div className="release-spotlight__text">
              <h3 className="release-spotlight__title">{release.title}</h3>
              <p className="release-spotlight__copy">{release.description}</p>
              <ResponsiveImage
                image={release.coverArt}
                className="release-spotlight__initial"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <AppLink link={release.primaryLink} className="release-spotlight__cta">
                <span>{release.primaryLink.label}</span>
                <span className="release-spotlight__arrow" aria-hidden="true">→</span>
              </AppLink>
            </div>
          </div>
        </div>

        <TelephonePlayer
          video={release.video}
          audio={release.audio}
          copy={playerCopy}
          title={release.title}
          variant={variant}
        />
      </div>
    </div>
  )
}
