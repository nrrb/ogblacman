<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpRight, Check } from '@lucide/vue'

import { trackEvent } from '@/analytics'
import { SIGNUP_MESSAGES, submitSignup, validateEmail } from '@/features/mailing-list/kitLogic'

const props = withDefaults(
  defineProps<{
    /** Reported to analytics so multiple placements stay distinguishable. */
    source?: string
  }>(),
  { source: 'homepage' },
)

// Read lazily rather than at module scope so the configured and unconfigured
// states are both reachable in tests.
const formAction = computed(() => import.meta.env.VITE_KIT_FORM_ACTION ?? '')
const isConfigured = computed(() => Boolean(formAction.value))

const email = ref('')
const firstName = ref('')
const emailError = ref<string | null>(null)
const formError = ref<string | null>(null)
const isSubmitting = ref(false)
const isSubscribed = ref(false)

function clearEmailError() {
  if (emailError.value) emailError.value = null
}

async function handleSubmit() {
  if (!isConfigured.value || isSubmitting.value) return

  formError.value = null
  emailError.value = validateEmail(email.value)
  if (emailError.value) return

  isSubmitting.value = true
  const result = await submitSignup(formAction.value, {
    email: email.value,
    firstName: firstName.value,
  })
  isSubmitting.value = false

  if (result.status === 'error') {
    formError.value = result.message
    return
  }

  isSubscribed.value = true
  email.value = ''
  firstName.value = ''
  // Records only that a signup succeeded. Submitted values stay in Kit.
  trackEvent('signup_success', { source: props.source })
}
</script>

<template>
  <!-- Marked so Black Buddha repositions instead of covering the form. -->
  <div class="signup" data-buddha-avoid>
    <p v-if="isSubscribed" class="signup__success" role="status">
      <Check :size="20" aria-hidden="true" />
      {{ SIGNUP_MESSAGES.success }}
    </p>

    <form v-else class="signup__form" novalidate @submit.prevent="handleSubmit">
      <div class="signup__field">
        <label for="signup-first-name">First name <span>(optional)</span></label>
        <input
          id="signup-first-name"
          v-model="firstName"
          type="text"
          name="first_name"
          autocomplete="given-name"
          :disabled="!isConfigured || isSubmitting"
        />
      </div>

      <div class="signup__field">
        <label for="signup-email">Email</label>
        <input
          id="signup-email"
          v-model="email"
          type="email"
          name="email"
          required
          autocomplete="email"
          inputmode="email"
          :aria-invalid="Boolean(emailError)"
          :aria-describedby="emailError ? 'signup-email-error' : undefined"
          :disabled="!isConfigured || isSubmitting"
          @input="clearEmailError"
        />
        <p v-if="emailError" id="signup-email-error" class="signup__error" role="alert">
          {{ emailError }}
        </p>
      </div>

      <button class="button button--dark" type="submit" :disabled="!isConfigured || isSubmitting">
        <template v-if="!isConfigured">List Opens Soon</template>
        <template v-else-if="isSubmitting">Hold On</template>
        <template v-else>Put Me On</template>
        <ArrowUpRight v-if="isConfigured && !isSubmitting" :size="18" aria-hidden="true" />
      </button>

      <p v-if="formError" class="signup__error signup__error--form" role="alert">{{ formError }}</p>
    </form>
  </div>
</template>
