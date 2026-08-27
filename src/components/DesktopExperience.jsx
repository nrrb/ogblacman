import BackgroundVideo from './BackgroundVideo.jsx'
import ClientList from './ClientList.jsx'
import KitSignup from './KitSignup.jsx'
import LogoCarousel from './LogoCarousel.jsx'
import ManagerCard from './ManagerCard.jsx'
import MerchEmptyState from './MerchEmptyState.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'
import SectionHeading from './SectionHeading.jsx'
import ShowEmptyState from './ShowEmptyState.jsx'
import SiteFooter from './SiteFooter.jsx'
import SocialLinks from './SocialLinks.jsx'
import TextCta from './TextCta.jsx'
import TopPickRelease from './TopPickRelease.jsx'
import { HOME_SECTION_IDS, isSectionVisible } from '../content/sectionVisibility.js'

export default function DesktopExperience({ content }) {
  const { siteSettings, presentation } = content
  const sections = content.homePage.sections
  const { hero, featuredRelease, shows, booking, merch, newsletter } = sections
  const hasPrimaryContent = [featuredRelease, shows, booking].some(isSectionVisible)

  return (
    <div className="site site--desktop">
      <div className="desktop-flow">
        {isSectionVisible(hero) ? (
          <BackgroundVideo
            id={HOME_SECTION_IDS.hero}
            media={hero.backgroundVideo.primary}
            videoId="desktop-hero-video"
            className="background-media background-media--desktop-hero"
          >
            <SectionHeading
              heading={hero.heading}
              wrapperClass="display-heading--desktop-hero"
              titleClass="heading-title--desktop-hero"
            />
            {hero.supportingText && <p className="body-copy">{hero.supportingText}</p>}
            <div className="text-cta text-cta--desktop-hero">
              <span className="text-cta__label">{hero.scrollPrompt}</span>
            </div>
            <ResponsiveImage image={presentation.sharedImages.ctaArrow} className="text-cta__arrow" loading="lazy" />
            <SocialLinks links={siteSettings.socialLinks} />
          </BackgroundVideo>
        ) : (
          <SocialLinks links={siteSettings.socialLinks} className="social-links--fallback" />
        )}

        {hasPrimaryContent && (
          <div className="section section--content">
            {isSectionVisible(featuredRelease) && (
              <div id={HOME_SECTION_IDS.featuredRelease}>
                {featuredRelease.showHeading !== false && (
                  <SectionHeading
                    heading={featuredRelease.heading}
                    wrapperClass="display-heading--about"
                    titleClass="heading-title--about"
                  />
                )}
                <TopPickRelease section={featuredRelease} variant="desktop" />
              </div>
            )}

            {isSectionVisible(shows) && (
              <div id={HOME_SECTION_IDS.shows} className="feature-block feature-block--why">
                <div className="content-block">
                  <SectionHeading
                    heading={shows.heading}
                    wrapperClass="display-heading--feature"
                    titleClass="heading-title--why"
                  />
                  {shows.items.length === 0 ? (
                    <ShowEmptyState content={shows.emptyState} />
                  ) : (
                    <ClientList items={shows.items} variant="desktop" />
                  )}
                </div>
              </div>
            )}

            {isSectionVisible(booking) && (
              <div id={HOME_SECTION_IDS.booking}>
                <SectionHeading
                  heading={booking.heading}
                  wrapperClass="display-heading--feature"
                  titleClass="heading-title--feature"
                />
                {booking.intro && <p className="body-copy">{booking.intro}</p>}
                <ManagerCard manager={booking.contact} />
              </div>
            )}
          </div>
        )}

        {isSectionVisible(merch) && (
          <div id={HOME_SECTION_IDS.merch} className="section section--content">
            <div className="split-layout split-layout--studios">
              <div className="split-layout__content">
                <div className="content-block">
                  <SectionHeading
                    heading={merch.heading}
                    wrapperClass="display-heading--feature"
                    titleClass="heading-title--feature"
                  />
                  {merch.items.length === 0 ? (
                    <MerchEmptyState content={merch.emptyState} />
                  ) : (
                    <>
                      <p className="body-copy body-copy--studios">{merch.intro}</p>
                      <TextCta
                        cta={merch.emptyState.cta}
                        arrow={presentation.sharedImages.ctaArrow}
                        wrapperClass="text-cta--inline"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
            {merch.items.length > 0 && <LogoCarousel items={merch.items} />}
          </div>
        )}

        {isSectionVisible(newsletter) ? (
          <div id={HOME_SECTION_IDS.newsletter} className="section section--clients">
            <div className="section__inner">
              <SectionHeading
                heading={newsletter.heading}
                wrapperClass="display-heading--section"
                titleClass="heading-title--clients"
              />
              {newsletter.intro && <p className="body-copy">{newsletter.intro}</p>}
              <KitSignup
                idPrefix="desktop-newsletter"
                integration={siteSettings.integrations.kit}
                copy={newsletter.formCopy}
              />
              {newsletter.privacyNotice && <p className="newsletter-privacy">{newsletter.privacyNotice}</p>}
              <SiteFooter footer={siteSettings.footer} />
            </div>
          </div>
        ) : (
          <div className="section section--clients section--footer-only">
            <SiteFooter footer={siteSettings.footer} />
          </div>
        )}
      </div>
    </div>
  )
}
