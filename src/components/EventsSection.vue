<script setup lang="ts">
import { CalendarDays, MapPin } from '@lucide/vue'

import OutboundLink from '@/components/OutboundLink.vue'
import { formatEventDateTime, getEventStatusLabel } from '@/features/listings/listingLogic'
import type { EventListing } from '@/types/content'

defineProps<{
  events: readonly EventListing[]
}>()
</script>

<template>
  <section id="shows" class="section section--events" aria-labelledby="shows-title">
    <div class="container">
      <div class="section-heading section-heading--light">
        <div>
          <p class="eyebrow eyebrow--light">On the ground</p>
          <h2 id="shows-title">Upcoming shows</h2>
        </div>
        <span class="section-index">02</span>
      </div>

      <div v-if="events.length" class="event-grid">
        <article v-for="event in events" :key="event.slug" class="event-card">
          <img
            v-if="event.artwork"
            class="event-card__art"
            :src="event.artwork.src"
            :alt="event.artwork.alt"
            width="720"
            height="720"
            loading="lazy"
          />
          <div v-else class="event-card__art event-card__art--placeholder" aria-hidden="true">
            <span>OG</span>
          </div>
          <div class="event-card__body">
            <div class="event-card__date">
              <time :datetime="event.startsAt">
                <strong>{{ formatEventDateTime(event.startsAt, event.timeZone).date }}</strong>
                <span>{{ formatEventDateTime(event.startsAt, event.timeZone).time }}</span>
              </time>
              <span>{{ getEventStatusLabel(event.status) }}</span>
            </div>
            <h3>{{ event.title }}</h3>
            <p class="event-card__place">
              <MapPin :size="16" aria-hidden="true" />
              {{ event.venue }} / {{ event.location }}
            </p>
            <p>{{ event.description }}</p>
            <OutboundLink
              v-if="event.ticketLink && event.status === 'on-sale'"
              class="button button--light"
              :link="event.ticketLink"
              analytics-event="ticket_click"
            />
            <span v-else class="listing-status">{{ getEventStatusLabel(event.status) }}</span>
          </div>
        </article>
      </div>

      <div v-else class="listing-empty listing-empty--events" data-buddha-avoid>
        <div class="listing-empty__mark" aria-hidden="true">
          <CalendarDays :size="38" />
          <span>00</span>
        </div>
        <div class="listing-empty__copy">
          <p class="eyebrow eyebrow--light">The board is clear</p>
          <h3>No dates announced yet.</h3>
          <p>When OG Blacman steps out, the details will land here first.</p>
        </div>
        <a class="button button--light" href="#join">Get show updates</a>
      </div>
    </div>
  </section>
</template>
