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
  description: 'OG Blacman out of Chicago. New music, new videos, and a tree that needs a hug.',
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
      <p class="hero__statement">Turn it up before you start scrolling</p>
      <div class="hero__actions" data-buddha-avoid>
        <a class="button button--light" href="#music">
          <Radio :size="18" aria-hidden="true" />
          Play Something
        </a>
        <a class="button button--glass" href="#story">
          Who Is This Man?
          <ArrowDown :size="18" aria-hidden="true" />
        </a>
      </div>
    </div>
    <div class="hero__stamp" aria-hidden="true">OG / CHI / 001</div>
  </section>

  <div class="signal-strip" aria-hidden="true">
    <span>OG BLACMAN</span><span>CHICAGO</span><span>TIME IS EXPENSIVE</span><span>OG BLACMAN</span>
  </div>

  <section id="music" class="section section--paper">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Press play</p>
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
        <p class="eyebrow">How we got here</p>
        <h2>Nobody gave me permission I just started</h2>
      </div>
      <div class="story-copy">
        <p>{{ artist.biography }}</p>
        <p>Time is expensive so I spend mine making the stuff I wanted to hear</p>
      </div>
    </div>
  </section>

  <EventsSection :events="events" />

  <MerchSection :merchandise="merchandise" />

  <section id="join" class="section section--join">
    <div class="container join-layout">
      <div>
        <p class="eyebrow">Don't miss it</p>
        <h2>Do You Want To Know First?</h2>
      </div>
      <div class="join-action">
        <p>New music videos shows drops all of it &amp; I promise I'm not in your inbox every day</p>
        <button class="button button--dark" type="button" disabled>
          List Opens Soon
          <ArrowUpRight :size="18" aria-hidden="true" />
        </button>
      </div>
    </div>
  </section>
</template>
