<script setup>
import AppLink from './AppLink.vue'
import BackgroundVideo from './BackgroundVideo.vue'
import ClientList from './ClientList.vue'
import KitSignup from './KitSignup.vue'
import LogoCarousel from './LogoCarousel.vue'
import MobileSlider from './MobileSlider.vue'
import ResponsiveImage from './ResponsiveImage.vue'
import SectionHeading from './SectionHeading.vue'
import SocialLinks from './SocialLinks.vue'
import TextCta from './TextCta.vue'
import TopPickRelease from './TopPickRelease.vue'

defineProps({ content: { type: Object, required: true } })
</script>

<template>
  <MobileSlider
    v-slot="{ slideAttributes }"
    :slide-count="6"
    :continuous="content.mobile.continuous_scroll"
    :dot-label="content.accessibility.slider_dot_label"
    :previous-label="content.accessibility.previous_slide_label"
    :next-label="content.accessibility.next_slide_label"
  >
    <div class="mobile-slide mobile-slide--hero" v-bind="slideAttributes(0)">
      <BackgroundVideo
        :media="content.sections.hero.media.mobile"
        video-id="mobile-hero-video"
        class="background-media background-media--mobile-hero"
      >
        <div class="mobile-slide__overlay">
          <div class="mobile-slide__inner">
            <SectionHeading
              :heading="content.sections.hero.heading"
              wrapper-class="display-heading--mobile-hero"
              title-class="heading-title--mobile-hero"
            />
            <div class="text-cta text-cta--mobile-hero">
              <ResponsiveImage :image="content.shared.arrow" class="text-cta__arrow" loading="lazy" />
              <AppLink :link="content.sections.hero.cta" class="text-cta__label" />
              <ResponsiveImage :image="content.shared.texture" class="text-cta__texture" loading="lazy" />
            </div>
          </div>
        </div>
      </BackgroundVideo>
      <SocialLinks :links="content.social_links" />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(1)">
      <div class="mobile-slide__content mobile-slide__content--middle mobile-slide__content--top-pick">
        <SectionHeading
          :heading="content.sections.top_pick.heading"
          wrapper-class="display-heading--stacked"
          title-class="heading-title--mobile-about"
        />
        <TopPickRelease :release="content.sections.top_pick" variant="mobile" />
      </div>
      <BackgroundVideo
        :media="content.sections.top_pick.mobile_media"
        video-id="mobile-about-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(2)">
      <div class="mobile-slide__content mobile-slide__content--why">
        <SectionHeading
          :heading="content.sections.upcoming_shows.heading"
          wrapper-class="display-heading--mobile-why"
          title-class="heading-title--mobile-why"
        />
        <p class="body-copy body-copy--mobile-why">{{ content.sections.upcoming_shows.copy }}</p>
        <div class="scroll-panel">
          <ClientList :items="content.sections.upcoming_shows.items" variant="mobile" />
        </div>
      </div>
      <BackgroundVideo
        :media="content.sections.upcoming_shows.mobile_media"
        video-id="mobile-why-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(3)">
      <div class="mobile-slide__content mobile-slide__content--how">
        <SectionHeading
          :heading="content.sections.booking.heading"
          wrapper-class="display-heading--mobile-how"
          title-class="heading-title--mobile-how"
        />
        <div class="booking-manager booking-manager--mobile">
          <div class="booking-manager__role">{{ content.sections.booking.manager.role }}</div>
          <div class="booking-manager__name">{{ content.sections.booking.manager.name }}</div>
          <div>{{ content.sections.booking.manager.email }}</div>
          <div>{{ content.sections.booking.manager.phone }}</div>
        </div>
      </div>
      <BackgroundVideo
        :media="content.sections.booking.mobile_media"
        video-id="mobile-how-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(4)">
      <div class="mobile-slide__content mobile-slide__content--middle mobile-slide__content--merch">
        <SectionHeading
          :heading="content.sections.merch.heading"
          wrapper-class="display-heading--mobile-studios"
          title-class="heading-title--mobile-studios"
        />
        <p class="body-copy body-copy--mobile-studios">{{ content.sections.merch.copy }}</p>
        <LogoCarousel :items="content.sections.merch.items" />
        <TextCta
          :cta="content.sections.merch.cta"
          :arrow="content.shared.arrow"
          wrapper-class="text-cta--mobile"
        />
      </div>
      <BackgroundVideo
        :media="content.sections.merch.mobile_media"
        video-id="mobile-studios-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(5)">
      <div class="mobile-slide__content mobile-slide__content--newsletter">
        <div>
          <SectionHeading
            :heading="content.sections.newsletter.heading"
            wrapper-class="display-heading--mobile-clients"
            title-class="heading-title--mobile-clients"
          />
          <KitSignup id-prefix="mobile-newsletter" />
        </div>
        <div class="newsletter-footer">{{ content.footer.copyright }}</div>
      </div>
      <BackgroundVideo
        :media="content.sections.newsletter.mobile_media"
        video-id="mobile-newsletter-video"
        class="background-media background-media--slide"
      />
    </div>
  </MobileSlider>
</template>
