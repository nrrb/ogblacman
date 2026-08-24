<script setup>
defineProps({
  manager: { type: Object, required: true },
})
</script>

<template>
  <address class="manager-card">
    <span class="manager-card__rail" aria-hidden="true" />

    <div class="manager-card__header">
      <div>
        <div class="manager-card__eyebrow">{{ manager.role }}</div>
        <div class="manager-card__name">{{ manager.name }}</div>
      </div>
      <div class="manager-card__mark" aria-hidden="true">OGB // MGMT</div>
    </div>

    <div class="manager-card__contacts">
      <div class="manager-card__contact">
        <div class="manager-card__label">Email</div>
        <a :href="`mailto:${manager.email}`" class="manager-card__link">
          {{ manager.email }}
        </a>
      </div>

      <div class="manager-card__contact">
        <div class="manager-card__label">Phone</div>
        <a :href="`tel:${manager.phone.replace(/[^+\d]/g, '')}`" class="manager-card__link">
          {{ manager.phone }}
        </a>
      </div>
    </div>
  </address>
</template>

<style scoped>
.manager-card {
  position: relative;
  isolation: isolate;
  width: min(100%, 820px);
  margin: 54px auto 0;
  padding: 28px 28px 30px 34px;
  overflow: hidden;
  color: var(--color-white);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-gold-1) 10%, transparent), transparent 48%),
    color-mix(in srgb, var(--color-black-1) 94%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-white) 24%, transparent);
  box-shadow: 0 22px 60px rgb(0 0 0 / 28%);
  font-family: NeueHaasDisplayLight, Arial, sans-serif;
  font-size: 16px;
  font-style: normal;
  line-height: 1.4;
}

.manager-card::before,
.manager-card::after,
.manager-card__header::before,
.manager-card__header::after,
.manager-card__contacts::before,
.manager-card__contacts::after {
  content: none;
  display: none;
}

.manager-card__rail {
  position: absolute;
  z-index: -1;
  inset: -1px auto -1px -1px;
  width: 7px;
  background: linear-gradient(180deg, var(--color-gold-1), var(--color-gold-2));
  box-shadow: 8px 0 32px color-mix(in srgb, var(--color-gold-1) 20%, transparent);
}

.manager-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid color-mix(in srgb, var(--color-white) 20%, transparent);
}

.manager-card__eyebrow,
.manager-card__label,
.manager-card__mark {
  font-family: Neuehaasdisplaymediu, Arial, sans-serif;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.manager-card__eyebrow {
  margin-bottom: 7px;
  color: var(--color-gold-1);
  font-size: 11px;
}

.manager-card__name {
  color: var(--color-white);
  font-family: Neuehaasdisplayroman, Arial, sans-serif;
  font-size: clamp(25px, 3vw, 38px);
  line-height: 1.05;
}

.manager-card__mark {
  color: color-mix(in srgb, var(--color-white) 38%, transparent);
  font-size: 9px;
  white-space: nowrap;
}

.manager-card__contacts {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.85fr);
  gap: 24px 44px;
  padding-top: 24px;
}

.manager-card__contact {
  min-width: 0;
}

.manager-card__label {
  margin-bottom: 7px;
  color: color-mix(in srgb, var(--color-white) 52%, transparent);
  font-size: 9px;
}

.manager-card__link {
  color: var(--color-white);
  font-size: 17px;
  font-style: normal;
  overflow-wrap: anywhere;
  text-decoration-color: color-mix(in srgb, var(--color-gold-1) 55%, transparent);
  text-decoration-thickness: 1px;
  text-underline-offset: 5px;
  transition: color 160ms ease, text-decoration-color 160ms ease;
}

.manager-card__link:hover,
.manager-card__link:focus-visible {
  color: var(--color-gold-1);
  text-decoration-color: var(--color-gold-1);
}

.manager-card__link:focus-visible {
  outline: 2px solid var(--color-gold-1);
  outline-offset: 4px;
}

@media screen and (max-width: 767px) {
  .manager-card {
    width: 100%;
    margin-top: 16px;
    padding: 18px 16px 18px 22px;
    font-size: 12px;
  }

  .manager-card__header {
    gap: 12px;
    padding-bottom: 15px;
  }

  .manager-card__eyebrow {
    margin-bottom: 4px;
    font-size: 8px;
  }

  .manager-card__name {
    font-size: 21px;
  }

  .manager-card__mark {
    font-size: 7px;
  }

  .manager-card__contacts {
    grid-template-columns: minmax(0, 1fr);
    gap: 13px;
    padding-top: 15px;
  }

  .manager-card__label {
    margin-bottom: 3px;
    font-size: 7px;
  }

  .manager-card__link {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .manager-card__link {
    transition: none;
  }
}
</style>
