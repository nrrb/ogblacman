<script setup>
import AppLink from './AppLink.vue'

defineProps({
  items: { type: Array, required: true },
  variant: { type: String, required: true, validator: value => ['desktop', 'mobile'].includes(value) },
})
</script>

<template>
  <div :class="['client-list', { 'client-list--mobile': variant === 'mobile' }]">
    <div :class="['client-grid', { 'client-grid--desktop': variant === 'desktop' }]" role="list">
      <div
        v-for="item in items"
        :key="item.id"
        role="listitem"
        :class="['client-grid__item', variant === 'mobile' ? 'client-grid__item--half' : 'client-grid__item--quarter']"
      >
        <AppLink
          :link="{ url: item.url, title: item.link_title, label: item.label }"
          class="client-link show-link"
        >
          <span v-if="item.meta" class="show-link__date">{{ item.meta }}</span>
          <span class="show-link__location">{{ item.label }}</span>
          <span v-if="item.action_label" class="show-link__action">{{ item.action_label }}</span>
        </AppLink>
      </div>
    </div>
  </div>
</template>
