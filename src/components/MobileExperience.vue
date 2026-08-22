<script setup>
import AppLink from './AppLink.vue'
import BackgroundVideo from './BackgroundVideo.vue'
import CaseStudyList from './CaseStudyList.vue'
import ClientList from './ClientList.vue'
import ContactForm from './ContactForm.vue'
import MobileSlider from './MobileSlider.vue'
import ResponsiveImage from './ResponsiveImage.vue'
import SectionHeading from './SectionHeading.vue'
import SocialLinks from './SocialLinks.vue'
import TextCta from './TextCta.vue'

defineProps({ content: { type: Object, required: true } })
</script>

<template>
  <MobileSlider
    v-slot="{ slideAttributes }"
    :slide-count="8"
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
              accent-class="heading-accent--mobile-hero"
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
      <div class="mobile-slide__content mobile-slide__content--middle">
        <SectionHeading
          :heading="content.sections.about.heading"
          wrapper-class="display-heading--stacked"
          title-class="heading-title--mobile-about"
          accent-class="heading-accent--mobile"
          accent-first
        />
        <div class="body-copy__frame">
          <p class="body-copy body-copy--mobile-about">{{ content.sections.about.copy }}</p>
        </div>
        <TextCta
          :cta="content.sections.about.cta"
          :arrow="content.shared.arrow"
          wrapper-class="text-cta--mobile"
        />
      </div>
      <BackgroundVideo
        :media="content.sections.about.mobile_media"
        video-id="mobile-about-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(2)">
      <div class="mobile-slide__content mobile-slide__content--why">
        <SectionHeading
          :heading="content.sections.why.heading"
          wrapper-class="display-heading--mobile-why"
          title-class="heading-title--mobile-why"
          accent-class="heading-accent--mobile"
        />
        <p class="body-copy body-copy--mobile-why">{{ content.sections.why.copy }}</p>
      </div>
      <BackgroundVideo
        :media="content.sections.why.mobile_media"
        video-id="mobile-why-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(3)">
      <div class="mobile-slide__content mobile-slide__content--how">
        <SectionHeading
          :heading="content.sections.how.heading"
          wrapper-class="display-heading--mobile-how"
          title-class="heading-title--mobile-how"
          accent-class="heading-accent--mobile-how"
        />
        <div class="body-copy__frame">
          <p class="body-copy body-copy--mobile-how">
            <template v-for="(column, index) in content.sections.how.copy_columns" :key="column">
              <br v-if="index"><br v-if="index">{{ column }}
            </template>
          </p>
        </div>
      </div>
      <BackgroundVideo
        :media="content.sections.how.mobile_media"
        video-id="mobile-how-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(4)">
      <div class="mobile-slide__content mobile-slide__content--top">
        <div>
          <SectionHeading
            :heading="content.case_studies.heading"
            wrapper-class="display-heading--mobile-cases"
            title-class="heading-title--mobile-cases"
            accent-class="heading-accent--mobile-cases"
            accent-first
          />
          <CaseStudyList :items="content.case_studies.items" variant="mobile" />
        </div>
      </div>
      <BackgroundVideo
        :media="content.case_studies.mobile_media"
        video-id="mobile-cases-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(5)">
      <div class="mobile-slide__content mobile-slide__content--top">
        <div>
          <SectionHeading
            :heading="content.sections.clients.heading"
            wrapper-class="display-heading--mobile-clients"
            title-class="heading-title--mobile-clients"
            accent-class="heading-accent--contact"
          />
          <div class="scroll-panel">
            <ClientList :items="content.clients.items" variant="mobile" />
          </div>
        </div>
      </div>
      <BackgroundVideo
        :media="content.sections.clients.mobile_media"
        video-id="mobile-clients-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(6)">
      <div class="mobile-slide__content mobile-slide__content--middle">
        <SectionHeading
          :heading="content.sections.studios.heading"
          wrapper-class="display-heading--mobile-studios"
          title-class="heading-title--mobile-studios"
          accent-class="heading-accent--mobile-studios"
        />
        <p class="body-copy body-copy--mobile-studios">{{ content.sections.studios.copy }}</p>
        <TextCta
          :cta="content.sections.studios.cta"
          :arrow="content.shared.arrow"
          wrapper-class="text-cta--mobile"
        />
      </div>
      <BackgroundVideo
        :media="content.sections.studios.mobile_media"
        video-id="mobile-studios-video"
        class="background-media background-media--slide"
      />
    </div>

    <div class="mobile-slide" v-bind="slideAttributes(7)">
      <div class="mobile-slide__content mobile-slide__content--contact">
        <div>
          <SectionHeading
            :heading="content.sections.contact.heading"
            wrapper-class="display-heading--mobile-contact"
            title-class="heading-title--contact"
            accent-class="heading-accent--mobile-contact"
          />
          <ContactForm :content="content.form" id-prefix="mobile" />
        </div>
        <SocialLinks :links="content.social_links" />
      </div>
      <BackgroundVideo
        :media="content.sections.contact.mobile_media"
        video-id="mobile-contact-video"
        class="background-media background-media--slide"
      />
    </div>
  </MobileSlider>
</template>
