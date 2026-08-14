<script setup lang="ts">
import { ArrowDown, Radio } from '@lucide/vue'
import { useHead } from '@unhead/vue'

import EventsSection from '@/components/EventsSection.vue'
import MerchSection from '@/components/MerchSection.vue'
import ReleaseCard from '@/components/ReleaseCard.vue'
import SignupForm from '@/components/SignupForm.vue'
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
      <p class="eyebrow eyebrow--chip">{{ artist.location }} // {{ artist.descriptor }}</p>
      <h1 id="hero-title">
        <span class="hero__name-og">OG</span><br />
        <span class="hero__name-blac">Blac</span><span class="hero__name-man">man</span>
      </h1>
      <p class="hero__statement">Turn it up before you start scrolling</p>
      <dl class="hero__stats">
        <div class="hero__stat">
          <dt>Height</dt>
          <dd>6&prime;2&Prime;</dd>
        </div>
        <div class="hero__stat">
          <dt>Volume</dt>
          <dd>Max</dd>
        </div>
        <div class="hero__stat">
          <dt>Cake</dt>
          <dd>#1</dd>
        </div>
      </dl>
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

  <!-- Each track holds the run twice so the -50% loop is seamless. -->
  <div class="ticker ticker--magenta" aria-hidden="true">
    <div class="ticker__track">
      <span>▓ BEST CAKE IN THE WORLD ▓ MEGAPHONE ON ▓ TIME IS EXPENSIVE ▓ CHICAGO IL ▓</span>
      <span>▓ BEST CAKE IN THE WORLD ▓ MEGAPHONE ON ▓ TIME IS EXPENSIVE ▓ CHICAGO IL ▓</span>
    </div>
  </div>
  <div class="ticker ticker--cyan" aria-hidden="true">
    <div class="ticker__track">
      <span>★ OG BLACMAN ★ SIX FOOT TWO ★ POSITIVITY AT FULL VOLUME ★ DREADS PAST THE SHOULDERS ★</span>
      <span>★ OG BLACMAN ★ SIX FOOT TWO ★ POSITIVITY AT FULL VOLUME ★ DREADS PAST THE SHOULDERS ★</span>
    </div>
  </div>

  <section id="music" class="section section--music">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Press play</p>
          <h2>Music</h2>
        </div>
        <span class="section-index section-index--dark">01</span>
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
        <p>I been doing this since before anybody was watching so don't ask me who put me on</p>
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
        <SignupForm source="homepage" />
      </div>
    </div>
  </section>
</template>
