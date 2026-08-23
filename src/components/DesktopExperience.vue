<script setup>
import AppLink from './AppLink.vue'
import BackgroundVideo from './BackgroundVideo.vue'
import CaseStudyList from './CaseStudyList.vue'
import ClientList from './ClientList.vue'
import LogoCarousel from './LogoCarousel.vue'
import NewsletterForm from './NewsletterForm.vue'
import ResponsiveImage from './ResponsiveImage.vue'
import SectionHeading from './SectionHeading.vue'
import SocialLinks from './SocialLinks.vue'
import TextCta from './TextCta.vue'
import TopPickRelease from './TopPickRelease.vue'

defineProps({ content: { type: Object, required: true } })
</script>

<template>
  <div class="site site--desktop">
    <div class="desktop-flow">
      <BackgroundVideo
        :media="content.sections.hero.media.desktop"
        video-id="desktop-hero-video"
        class="background-media background-media--desktop-hero"
      >
        <SectionHeading
          :heading="content.sections.hero.heading"
          wrapper-class="display-heading--desktop-hero"
          title-class="heading-title--desktop-hero"
          accent-class="heading-accent--desktop-hero"
        />
        <div class="text-cta text-cta--desktop-hero">
          <ResponsiveImage :image="content.shared.texture" class="text-cta__texture" loading="lazy" />
          <AppLink :link="content.sections.hero.cta" class="text-cta__label" />
        </div>
        <ResponsiveImage :image="content.shared.arrow" class="text-cta__arrow" loading="lazy" />
        <SocialLinks :links="content.social_links" />
      </BackgroundVideo>

      <div class="section section--content">
        <SectionHeading
          :heading="content.sections.top_pick.heading"
          wrapper-class="display-heading--about"
          title-class="heading-title--about"
          accent-class="heading-accent--desktop"
          accent-first
        />
        <TopPickRelease :release="content.sections.top_pick" variant="desktop" />

        <div id="w-node-_979f9f33-1dd2-e54e-b449-3b056707e4bf-0e0f149c" class="feature-block feature-block--why">
          <div class="content-block">
            <SectionHeading
              :heading="content.sections.upcoming_shows.heading"
              wrapper-class="display-heading--feature"
              title-class="heading-title--why"
              accent-class="heading-accent--desktop"
            />
            <p class="body-copy body-copy--why">{{ content.sections.upcoming_shows.copy }}</p>
            <ClientList :items="content.sections.upcoming_shows.items" variant="desktop" />
          </div>
        </div>

        <SectionHeading
          :heading="content.sections.booking.heading"
          wrapper-class="display-heading--feature"
          title-class="heading-title--feature"
          accent-class="heading-accent--desktop"
        />
        <div class="booking-manager">
          <div class="booking-manager__role">{{ content.sections.booking.manager.role }}</div>
          <div class="booking-manager__name">{{ content.sections.booking.manager.name }}</div>
          <div>{{ content.sections.booking.manager.email }}</div>
          <div>{{ content.sections.booking.manager.phone }}</div>
        </div>
      </div>

      <div class="section section--cases">
        <SectionHeading
          :heading="content.case_studies.heading"
          wrapper-class="display-heading--section"
          title-class="heading-title--cases"
          accent-class="heading-accent--cases"
          title-id="case"
          accent-first
        />
        <CaseStudyList :items="content.case_studies.items" variant="desktop" />
      </div>

      <div class="section section--content">
        <div class="split-layout split-layout--studios">
          <div id="w-node-cd26b41e-3f3f-3433-26a8-674c93219bcc-0e0f149c" class="split-layout__content">
            <div class="content-block">
              <SectionHeading
                :heading="content.sections.merch.heading"
                wrapper-class="display-heading--feature"
                title-class="heading-title--feature"
                accent-class="heading-accent--studios"
              />
            </div>
            <p class="body-copy body-copy--studios">{{ content.sections.merch.copy }}</p>
            <TextCta
              :cta="content.sections.merch.cta"
              :arrow="content.shared.arrow"
              wrapper-class="text-cta--inline"
            />
          </div>
        </div>
        <LogoCarousel :items="content.sections.merch.items" />
      </div>

      <div class="section section--clients">
        <div class="section__inner">
          <SectionHeading
            :heading="content.sections.newsletter.heading"
            wrapper-class="display-heading--section"
            title-class="heading-title--clients"
            accent-class="heading-accent--clients"
          />
          <NewsletterForm :content="content.sections.newsletter.form" id-prefix="desktop-newsletter" />
          <div class="newsletter-footer">{{ content.footer.copyright }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
