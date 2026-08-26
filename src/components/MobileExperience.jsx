import BackgroundVideo from './BackgroundVideo.jsx'
import ClientList from './ClientList.jsx'
import KitSignup from './KitSignup.jsx'
import LogoCarousel from './LogoCarousel.jsx'
import ManagerCard from './ManagerCard.jsx'
import MerchEmptyState from './MerchEmptyState.jsx'
import MobileSlider from './MobileSlider.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'
import SectionHeading from './SectionHeading.jsx'
import ShowEmptyState from './ShowEmptyState.jsx'
import SiteFooter from './SiteFooter.jsx'
import SocialLinks from './SocialLinks.jsx'
import TextCta from './TextCta.jsx'
import TopPickRelease from './TopPickRelease.jsx'
import { HOME_SECTION_IDS, visibleSectionNames } from '../content/sectionVisibility.js'

export default function MobileExperience({ content }) {
  const { siteSettings, presentation } = content
  const sections = content.homePage.sections
  const visibleSections = visibleSectionNames(sections)
  const socialHost = visibleSections.includes('hero') ? 'hero' : visibleSections[0]
  const footerHost = visibleSections.includes('newsletter')
    ? 'newsletter'
    : visibleSections.at(-1)

  function extrasFor(name) {
    return (
      <>
        {name === socialHost && name !== 'hero' && (
          <SocialLinks links={siteSettings.socialLinks} />
        )}
        {name === footerHost && name !== 'newsletter' && (
          <SiteFooter footer={siteSettings.footer} className="newsletter-footer--fallback" />
        )}
      </>
    )
  }

  function renderSection(name, index, slideAttributes) {
    const attributes = slideAttributes(index)

    if (name === 'hero') {
      const hero = sections.hero
      return (
        <div id={HOME_SECTION_IDS.hero} key={name} className="mobile-slide mobile-slide--hero" {...attributes}>
          <BackgroundVideo
            media={hero.backgroundVideo.mobileOverride || hero.backgroundVideo.primary}
            videoId="mobile-hero-video"
            className="background-media background-media--mobile-hero"
          >
            <div className="mobile-slide__overlay">
              <div className="mobile-slide__inner">
                <SectionHeading
                  heading={hero.heading}
                  wrapperClass="display-heading--mobile-hero"
                  titleClass="heading-title--mobile-hero"
                />
                {hero.supportingText && <p className="body-copy">{hero.supportingText}</p>}
                <div className="text-cta text-cta--mobile-hero">
                  <ResponsiveImage image={presentation.sharedImages.ctaArrow} className="text-cta__arrow" loading="lazy" />
                  <span className="text-cta__label">{hero.scrollPrompt}</span>
                </div>
              </div>
            </div>
          </BackgroundVideo>
          <SocialLinks links={siteSettings.socialLinks} />
          {extrasFor(name)}
        </div>
      )
    }

    if (name === 'featuredRelease') {
      const featuredRelease = sections.featuredRelease
      return (
        <div id={HOME_SECTION_IDS.featuredRelease} key={name} className="mobile-slide" {...attributes}>
          <div className="mobile-slide__content mobile-slide__content--middle mobile-slide__content--top-pick">
            <SectionHeading
              heading={featuredRelease.heading}
              wrapperClass="display-heading--stacked"
              titleClass="heading-title--mobile-about"
            />
            <TopPickRelease section={featuredRelease} variant="mobile" />
          </div>
          <BackgroundVideo
            media={featuredRelease.mobileBackground}
            videoId="mobile-about-video"
            className="background-media background-media--slide"
          />
          {extrasFor(name)}
        </div>
      )
    }

    if (name === 'shows') {
      const shows = sections.shows
      return (
        <div id={HOME_SECTION_IDS.shows} key={name} className="mobile-slide" {...attributes}>
          <div className="mobile-slide__content mobile-slide__content--why">
            <SectionHeading
              heading={shows.heading}
              wrapperClass="display-heading--mobile-why"
              titleClass="heading-title--mobile-why"
            />
            {shows.items.length === 0 ? (
              <ShowEmptyState content={shows.emptyState} />
            ) : (
              <div className="scroll-panel">
                <ClientList items={shows.items} variant="mobile" />
              </div>
            )}
          </div>
          <BackgroundVideo
            media={shows.mobileBackground}
            videoId="mobile-why-video"
            className="background-media background-media--slide"
          />
          {extrasFor(name)}
        </div>
      )
    }

    if (name === 'booking') {
      const booking = sections.booking
      return (
        <div id={HOME_SECTION_IDS.booking} key={name} className="mobile-slide" {...attributes}>
          <div className="mobile-slide__content mobile-slide__content--how">
            <SectionHeading
              heading={booking.heading}
              wrapperClass="display-heading--mobile-how"
              titleClass="heading-title--mobile-how"
            />
            {booking.intro && <p className="body-copy body-copy--mobile-how">{booking.intro}</p>}
            <ManagerCard manager={booking.contact} />
          </div>
          <BackgroundVideo
            media={booking.mobileBackground}
            videoId="mobile-how-video"
            className="background-media background-media--slide"
          />
          {extrasFor(name)}
        </div>
      )
    }

    if (name === 'merch') {
      const merch = sections.merch
      return (
        <div id={HOME_SECTION_IDS.merch} key={name} className="mobile-slide" {...attributes}>
          <div className="mobile-slide__content mobile-slide__content--middle mobile-slide__content--merch">
            <SectionHeading
              heading={merch.heading}
              wrapperClass="display-heading--mobile-studios"
              titleClass="heading-title--mobile-studios"
            />
            {merch.items.length === 0 ? (
              <MerchEmptyState content={merch.emptyState} />
            ) : (
              <>
                <p className="body-copy body-copy--mobile-studios">{merch.intro}</p>
                <LogoCarousel items={merch.items} />
                <TextCta
                  cta={merch.emptyState.cta}
                  arrow={presentation.sharedImages.ctaArrow}
                  wrapperClass="text-cta--mobile"
                />
              </>
            )}
          </div>
          <BackgroundVideo
            media={merch.mobileBackground}
            videoId="mobile-studios-video"
            className="background-media background-media--slide"
          />
          {extrasFor(name)}
        </div>
      )
    }

    const newsletter = sections.newsletter
    return (
      <div id={HOME_SECTION_IDS.newsletter} key={name} className="mobile-slide" {...attributes}>
        <div className="mobile-slide__content mobile-slide__content--newsletter">
          <div>
            <SectionHeading
              heading={newsletter.heading}
              wrapperClass="display-heading--mobile-clients"
              titleClass="heading-title--mobile-clients"
            />
            {newsletter.intro && <p className="body-copy">{newsletter.intro}</p>}
            <KitSignup
              idPrefix="mobile-newsletter"
              integration={siteSettings.integrations.kit}
              copy={newsletter.formCopy}
            />
            {newsletter.privacyNotice && <p className="newsletter-privacy">{newsletter.privacyNotice}</p>}
          </div>
          <SiteFooter footer={siteSettings.footer} />
        </div>
        <BackgroundVideo
          media={newsletter.mobileBackground}
          videoId="mobile-newsletter-video"
          className="background-media background-media--slide"
        />
        {extrasFor(name)}
      </div>
    )
  }

  return (
    <MobileSlider
      slideCount={visibleSections.length}
      continuous={presentation.mobile.continuousScroll}
      dotLabel={presentation.accessibility.sliderDotLabel}
      previousLabel={presentation.accessibility.previousSlideLabel}
      nextLabel={presentation.accessibility.nextSlideLabel}
    >
      {(slideAttributes) => visibleSections.map((name, index) => renderSection(name, index, slideAttributes))}
    </MobileSlider>
  )
}
