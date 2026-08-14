<script setup lang="ts">
import { ArrowDown, ArrowUpRight, Radio } from '@lucide/vue'
import { useHead } from '@unhead/vue'

import EventsSection from '@/components/EventsSection.vue'
import MerchSection from '@/components/MerchSection.vue'
import ReleaseCard from '@/components/ReleaseCard.vue'
import TreeHuggingGame from '@/components/TreeHuggingGame.vue'
import { events, merchandise } from '@/content/marketplace'
import { releases } from '@/content/releases'
import { artist, placeholderImages, siteUrl } from '@/content/site'
import { usePageMeta } from '@/composables/usePageMeta'
import { useBlackBuddhaStore } from '@/stores/blackBuddha'

const blackBuddha = useBlackBuddhaStore()

usePageMeta({
  title: 'OG Blacman | Independent Chicago Artist',
  description: 'The official website of independent Chicago artist OG Blacman. Music, videos, and interactive experiences.',
  path: '/',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MusicGroup',
        name: artist.name,
        url: siteUrl,
        genre: 'Hip-Hop',
        foundingLocation: {
          '@type': 'City',
          name: 'Chicago',
        },
      }),
    },
  ],
})
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <img
      class="hero__media"
      :src="placeholderImages.artistPortrait"
      alt="Placeholder portrait of a cat"
      width="1600"
      height="1200"
      fetchpriority="high"
    />
    <div class="hero__shade" aria-hidden="true"></div>
    <div class="container hero__content">
      <p class="eyebrow eyebrow--light">{{ artist.location }} / {{ artist.descriptor }}</p>
      <h1 id="hero-title">OG<br />Blacman</h1>
      <p class="hero__statement">Music and interactive work on an independent frequency.</p>
      <div class="hero__actions" data-buddha-avoid>
        <a class="button button--light" href="#music">
          <Radio :size="18" aria-hidden="true" />
          Hear what's next
        </a>
        <a class="button button--glass" href="#story">
          Enter the story
          <ArrowDown :size="18" aria-hidden="true" />
        </a>
      </div>
    </div>
    <div class="hero__stamp" aria-hidden="true">OG / CHI / 001</div>
  </section>

  <div class="signal-strip" aria-hidden="true">
    <span>OG BLACMAN</span><span>CHICAGO</span><span>NEW FREQUENCY</span><span>OG BLACMAN</span>
  </div>

  <section id="music" class="section section--paper">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">The signal</p>
          <h2>Music</h2>
        </div>
        <span class="section-index">01</span>
      </div>
      <div class="release-grid">
        <ReleaseCard v-for="release in releases" :key="release.slug" :release="release" />
      </div>
    </div>
  </section>

  <section id="game" class="section section--game">
    <div class="container">
      <TreeHuggingGame
        @started="blackBuddha.trigger('game-start')"
        @completed="blackBuddha.trigger('game-complete')"
      />
    </div>
  </section>

  <section id="story" class="section section--story">
    <div class="container story-layout">
      <div class="section-heading section-heading--vertical">
        <p class="eyebrow">From Chicago</p>
        <h2>Built on his own frequency.</h2>
      </div>
      <div class="story-copy">
        <p>{{ artist.biography }}</p>
        <p>Music first. No borrowed identity. The rest unfolds from there.</p>
      </div>
    </div>
  </section>

  <EventsSection :events="events" />

  <MerchSection :merchandise="merchandise" />

  <section id="join" class="section section--join">
    <div class="container join-layout">
      <div>
        <p class="eyebrow">Stay close</p>
        <h2>Get the next transmission.</h2>
      </div>
      <div class="join-action">
        <p>New music, events, and releases from OG Blacman.</p>
        <button class="button button--dark" type="button" disabled>
          Join list soon
          <ArrowUpRight :size="18" aria-hidden="true" />
        </button>
      </div>
    </div>
  </section>
</template>
