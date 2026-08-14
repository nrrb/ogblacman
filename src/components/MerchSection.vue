<script setup lang="ts">
import { PackageOpen, Shirt } from '@lucide/vue'

import OutboundLink from '@/components/OutboundLink.vue'
import { getMerchandiseStatusLabel } from '@/features/listings/listingLogic'
import type { MerchandiseItem } from '@/types/content'

defineProps<{
  merchandise: readonly MerchandiseItem[]
}>()
</script>

<template>
  <section id="merch" class="section section--merch" aria-labelledby="merch-title">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Objects from the frequency</p>
          <h2 id="merch-title">Merch</h2>
        </div>
        <span class="section-index section-index--dark">03</span>
      </div>

      <div v-if="merchandise.length" class="merch-grid">
        <article v-for="item in merchandise" :key="item.slug" class="merch-card">
          <div class="merch-card__media">
            <img
              v-if="item.images[0]"
              :src="item.images[0].src"
              :alt="item.images[0].alt"
              width="720"
              height="720"
              loading="lazy"
            />
            <Shirt v-else :size="58" aria-hidden="true" />
          </div>
          <div class="merch-card__body">
            <div>
              <p class="eyebrow">{{ getMerchandiseStatusLabel(item.status) }}</p>
              <h3>{{ item.title }}</h3>
            </div>
            <strong class="merch-card__price">{{ item.displayPrice }}</strong>
            <p>{{ item.description }}</p>
            <OutboundLink
              v-if="item.checkoutLink && item.status === 'available'"
              class="button button--dark"
              :link="item.checkoutLink"
              analytics-event="merch_click"
            />
            <span v-else class="listing-status listing-status--dark">
              {{ getMerchandiseStatusLabel(item.status) }}
            </span>
          </div>
        </article>
      </div>

      <div v-else class="listing-empty listing-empty--merch" data-buddha-avoid>
        <div class="listing-empty__mark listing-empty__mark--dark" aria-hidden="true">
          <PackageOpen :size="42" />
          <span>DROP</span>
        </div>
        <div class="listing-empty__copy">
          <p class="eyebrow">First edition pending</p>
          <h3>The first drop is under wraps.</h3>
          <p>No filler products. The store opens when the right pieces are ready.</p>
        </div>
        <a class="button button--dark" href="#join">Hear about the drop</a>
      </div>
    </div>
  </section>
</template>
