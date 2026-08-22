<script setup>
import AppLink from './AppLink.vue'

defineProps({
  items: { type: Array, required: true },
  variant: { type: String, required: true, validator: value => ['desktop', 'mobile'].includes(value) },
})
</script>

<template>
  <div :class="['case-list', `case-list--${variant}`]">
    <div role="list">
      <div v-for="item in items" :key="item.id" role="listitem" :class="variant === 'mobile' ? 'case-list__item' : undefined">
        <AppLink :link="{ url: item.url, title: item.link_title }" class="case-item">
          <div v-if="variant === 'desktop'" class="case-item__row">
            <div class="case-item__title">{{ item.title }}</div>
            <div class="case-item__meta">{{ item.year }}</div>
          </div>
          <template v-else>
            <div :id="item.id" class="case-item__title">{{ item.title }}</div>
            <div class="case-item__meta">{{ item.year }}</div>
          </template>
        </AppLink>
      </div>
    </div>
  </div>
</template>
