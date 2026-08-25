import AppLink from './AppLink.jsx'
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
import SocialLinks from './SocialLinks.jsx'
import TextCta from './TextCta.jsx'
import TopPickRelease from './TopPickRelease.jsx'

export default function MobileExperience({ content }) {
  const shows = content.sections.upcoming_shows
  const merch = content.sections.merch

  return (
    <MobileSlider
      slideCount={6}
      continuous={content.mobile.continuous_scroll}
      dotLabel={content.accessibility.slider_dot_label}
      previousLabel={content.accessibility.previous_slide_label}
      nextLabel={content.accessibility.next_slide_label}
    >
      {(slideAttributes) => (
        <>
          <div className="mobile-slide mobile-slide--hero" {...slideAttributes(0)}>
            <BackgroundVideo
              media={content.sections.hero.media.mobile}
              videoId="mobile-hero-video"
              className="background-media background-media--mobile-hero"
            >
              <div className="mobile-slide__overlay">
                <div className="mobile-slide__inner">
                  <SectionHeading
                    heading={content.sections.hero.heading}
                    wrapperClass="display-heading--mobile-hero"
                    titleClass="heading-title--mobile-hero"
                  />
                  <div className="text-cta text-cta--mobile-hero">
                    <ResponsiveImage image={content.shared.arrow} className="text-cta__arrow" loading="lazy" />
                    <AppLink link={content.sections.hero.cta} className="text-cta__label" />
                  </div>
                </div>
              </div>
            </BackgroundVideo>
            <SocialLinks links={content.social_links} />
          </div>

          <div className="mobile-slide" {...slideAttributes(1)}>
            <div className="mobile-slide__content mobile-slide__content--middle mobile-slide__content--top-pick">
              <SectionHeading
                heading={content.sections.top_pick.heading}
                wrapperClass="display-heading--stacked"
                titleClass="heading-title--mobile-about"
              />
              <TopPickRelease release={content.sections.top_pick} variant="mobile" />
            </div>
            <BackgroundVideo
              media={content.sections.top_pick.mobile_media}
              videoId="mobile-about-video"
              className="background-media background-media--slide"
            />
          </div>

          <div className="mobile-slide" {...slideAttributes(2)}>
            <div className="mobile-slide__content mobile-slide__content--why">
              <SectionHeading
                heading={shows.heading}
                wrapperClass="display-heading--mobile-why"
                titleClass="heading-title--mobile-why"
              />
              {shows.items.length === 0 ? (
                <ShowEmptyState copy={shows.copy} />
              ) : (
                <>
                  <p className="body-copy body-copy--mobile-why">{shows.copy}</p>
                  <div className="scroll-panel">
                    <ClientList items={shows.items} variant="mobile" />
                  </div>
                </>
              )}
            </div>
            <BackgroundVideo
              media={shows.mobile_media}
              videoId="mobile-why-video"
              className="background-media background-media--slide"
            />
          </div>

          <div className="mobile-slide" {...slideAttributes(3)}>
            <div className="mobile-slide__content mobile-slide__content--how">
              <SectionHeading
                heading={content.sections.booking.heading}
                wrapperClass="display-heading--mobile-how"
                titleClass="heading-title--mobile-how"
              />
              <ManagerCard manager={content.sections.booking.manager} />
            </div>
            <BackgroundVideo
              media={content.sections.booking.mobile_media}
              videoId="mobile-how-video"
              className="background-media background-media--slide"
            />
          </div>

          <div className="mobile-slide" {...slideAttributes(4)}>
            <div className="mobile-slide__content mobile-slide__content--middle mobile-slide__content--merch">
              <SectionHeading
                heading={merch.heading}
                wrapperClass="display-heading--mobile-studios"
                titleClass="heading-title--mobile-studios"
              />
              {merch.items.length === 0 ? (
                <MerchEmptyState copy={merch.copy} cta={merch.cta} />
              ) : (
                <>
                  <p className="body-copy body-copy--mobile-studios">{merch.copy}</p>
                  <LogoCarousel items={merch.items} />
                  <TextCta
                    cta={merch.cta}
                    arrow={content.shared.arrow}
                    wrapperClass="text-cta--mobile"
                  />
                </>
              )}
            </div>
            <BackgroundVideo
              media={merch.mobile_media}
              videoId="mobile-studios-video"
              className="background-media background-media--slide"
            />
          </div>

          <div id="mailing-list" className="mobile-slide" {...slideAttributes(5)}>
            <div className="mobile-slide__content mobile-slide__content--newsletter">
              <div>
                <SectionHeading
                  heading={content.sections.newsletter.heading}
                  wrapperClass="display-heading--mobile-clients"
                  titleClass="heading-title--mobile-clients"
                />
                <KitSignup idPrefix="mobile-newsletter" />
              </div>
              <div className="newsletter-footer">{content.footer.copyright}</div>
            </div>
            <BackgroundVideo
              media={content.sections.newsletter.mobile_media}
              videoId="mobile-newsletter-video"
              className="background-media background-media--slide"
            />
          </div>
        </>
      )}
    </MobileSlider>
  )
}
