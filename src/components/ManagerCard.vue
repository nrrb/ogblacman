<script setup>
defineProps({
  manager: { type: Object, required: true },
})
</script>

<template>
  <address class="manager-contact">
    <div class="manager-contact__heading">
      <div class="manager-contact__eyebrow">{{ manager.role }}</div>
      <div class="manager-contact__name">{{ manager.name }}</div>
    </div>

    <span class="manager-contact__rule" aria-hidden="true" />

    <div class="manager-contact__details">
      <div class="manager-contact__detail">
        <div class="manager-contact__label">Email</div>
        <a :href="`mailto:${manager.email}`" class="manager-contact__link">
          {{ manager.email }}
        </a>
      </div>

      <div class="manager-contact__detail">
        <div class="manager-contact__label">Phone</div>
        <a :href="`tel:${manager.phone.replace(/[^+\d]/g, '')}`" class="manager-contact__link">
          {{ manager.phone }}
        </a>
      </div>
    </div>
  </address>
</template>

<style scoped>
.manager-contact {
  width: min(100%, 820px);
  margin: 48px auto 0;
  color: var(--color-white);
  font-family: NeueHaasDisplayLight, Arial, sans-serif;
  font-style: normal;
}

.manager-contact::before,
.manager-contact::after,
.manager-contact__details::before,
.manager-contact__details::after {
  content: none;
  display: none;
}

.manager-contact__heading {
  text-align: center;
}

.manager-contact__eyebrow,
.manager-contact__label {
  font-family: Neuehaasdisplaymediu, Arial, sans-serif;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.manager-contact__eyebrow {
  margin-bottom: 4px;
  color: var(--color-gold-1);
  font-size: 11px;
}

.manager-contact__name {
  color: var(--color-white);
  font-family: "Tajamuka Script", Arial, sans-serif;
  font-size: clamp(54px, 7vw, 92px);
  font-weight: 400;
  line-height: 0.9;
}

.manager-contact__rule {
  display: block;
  width: min(100%, 620px);
  height: 1px;
  margin: 28px auto;
  background: var(--color-gold-1);
}

.manager-contact__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
  width: min(100%, 620px);
  margin: 0 auto;
}

.manager-contact__detail {
  min-width: 0;
}

.manager-contact__label {
  margin-bottom: 6px;
  color: color-mix(in srgb, var(--color-white) 48%, transparent);
  font-size: 9px;
}

.manager-contact__link {
  color: var(--color-white);
  font-family: Neuehaasdisplayroman, Arial, sans-serif;
  font-size: 17px;
  font-style: normal;
  overflow-wrap: anywhere;
  text-decoration: none;
  transition: color 160ms ease;
}

.manager-contact__link:hover,
.manager-contact__link:focus-visible {
  color: var(--color-gold-1);
}

.manager-contact__link:focus-visible {
  outline: 2px solid var(--color-gold-1);
  outline-offset: 4px;
}

@media screen and (max-width: 767px) {
  .manager-contact {
    width: 100%;
    margin-top: 14px;
  }

  .manager-contact__eyebrow {
    font-size: 8px;
  }

  .manager-contact__name {
    font-size: clamp(40px, 16vw, 58px);
  }

  .manager-contact__rule {
    margin: 15px auto;
  }

  .manager-contact__details {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    text-align: center;
  }

  .manager-contact__label {
    margin-bottom: 1px;
    font-size: 7px;
  }

  .manager-contact__link {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .manager-contact__link {
    transition: none;
  }
}
</style>
