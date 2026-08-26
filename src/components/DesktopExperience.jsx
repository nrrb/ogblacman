import AppLink from './AppLink.jsx'
import BackgroundVideo from './BackgroundVideo.jsx'
import ClientList from './ClientList.jsx'
import KitSignup from './KitSignup.jsx'
import LogoCarousel from './LogoCarousel.jsx'
import ManagerCard from './ManagerCard.jsx'
import MerchEmptyState from './MerchEmptyState.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'
import SectionHeading from './SectionHeading.jsx'
import ShowEmptyState from './ShowEmptyState.jsx'
import SocialLinks from './SocialLinks.jsx'
import TextCta from './TextCta.jsx'
import TopPickRelease from './TopPickRelease.jsx'

export default function DesktopExperience({ content }) {
  const shows = content.sections.upcoming_shows
  const merch = content.sections.merch

  return (
    <div className="site site--desktop">
      <div className="desktop-flow">
        <BackgroundVideo
          media={content.sections.hero.media.desktop}
          videoId="desktop-hero-video"
          className="background-media background-media--desktop-hero"
        >
          <SectionHeading
            heading={content.sections.hero.heading}
            wrapperClass="display-heading--desktop-hero"
            titleClass="heading-title--desktop-hero"
          />
          <div className="text-cta text-cta--desktop-hero">
            <AppLink link={content.sections.hero.cta} className="text-cta__label" />
          </div>
          <ResponsiveImage image={content.shared.arrow} className="text-cta__arrow" loading="lazy" />
          <SocialLinks links={content.social_links} />
        </BackgroundVideo>

        <div className="section section--content">
          <SectionHeading
            heading={content.sections.top_pick.heading}
            wrapperClass="display-heading--about"
            titleClass="heading-title--about"
          />
          <TopPickRelease release={content.sections.top_pick} variant="desktop" />

          <div id="w-node-_979f9f33-1dd2-e54e-b449-3b056707e4bf-0e0f149c" className="feature-block feature-block--why">
            <div className="content-block">
              <SectionHeading
                heading={shows.heading}
                wrapperClass="display-heading--feature"
                titleClass="heading-title--why"
              />
              {shows.items.length === 0 ? (
                <ShowEmptyState copy={shows.copy} />
              ) : (
                <>
                  <p className="body-copy body-copy--why">{shows.copy}</p>
                  <ClientList items={shows.items} variant="desktop" />
                </>
              )}
            </div>
          </div>

          {content.sections.booking.visible && (
            <>
              <SectionHeading
                heading={content.sections.booking.heading}
                wrapperClass="display-heading--feature"
                titleClass="heading-title--feature"
              />
              <ManagerCard manager={content.sections.booking.manager} />
            </>
          )}
        </div>

        <div className="section section--content">
          <div className="split-layout split-layout--studios">
            <div id="w-node-cd26b41e-3f3f-3433-26a8-674c93219bcc-0e0f149c" className="split-layout__content">
              <div className="content-block">
                <SectionHeading
                  heading={merch.heading}
                  wrapperClass="display-heading--feature"
                  titleClass="heading-title--feature"
                />
                {merch.items.length === 0 ? (
                  <MerchEmptyState copy={merch.copy} cta={merch.cta} />
                ) : (
                  <>
                    <p className="body-copy body-copy--studios">{merch.copy}</p>
                    <TextCta
                      cta={merch.cta}
                      arrow={content.shared.arrow}
                      wrapperClass="text-cta--inline"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          {merch.items.length > 0 && <LogoCarousel items={merch.items} />}
        </div>

        <div id="mailing-list" className="section section--clients">
          <div className="section__inner">
            <SectionHeading
              heading={content.sections.newsletter.heading}
              wrapperClass="display-heading--section"
              titleClass="heading-title--clients"
            />
            <KitSignup idPrefix="desktop-newsletter" />
            <div className="newsletter-footer">{content.footer.copyright}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
