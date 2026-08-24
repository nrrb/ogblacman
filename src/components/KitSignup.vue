<script>
const KIT_EMBED = Object.freeze({
  uid: 'bb5435c1d3',
  scriptSrc: 'https://og-blacman.kit.com/bb5435c1d3/index.js',
  runtimeSrcPrefix: 'https://f.convertkit.com/ckjs/ck.',
})

let cachedFormMarkup = ''
let cachedFormConfig = null
let initialEmbedPromise = null
const enhancedForms = new WeakSet()

function registryEntryFor(form) {
  return window.__sv_forms?.find((entry) => entry.element === form)
}

function cacheGeneratedForm(form) {
  const entry = registryEntryFor(form)
  if (!entry) return

  const { element: _element, initialized: _initialized, ...config } = entry
  cachedFormMarkup = form.outerHTML
  cachedFormConfig = config
}

function removeFromKitRegistry(form) {
  if (!form || !window.__sv_forms) return
  window.__sv_forms = window.__sv_forms.filter((entry) => entry.element !== form)
}

function waitForKitRuntime() {
  if (window.CK?.default) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const runtimeScript = [...document.scripts].find((script) =>
      script.src.startsWith(KIT_EMBED.runtimeSrcPrefix),
    )

    if (!runtimeScript) {
      reject(new Error('Kit runtime script was not added to the page.'))
      return
    }

    const timeout = window.setTimeout(() => {
      reject(new Error('Kit runtime script timed out.'))
    }, 15000)

    runtimeScript.addEventListener(
      'load',
      () => {
        window.clearTimeout(timeout)
        resolve()
      },
      { once: true },
    )
    runtimeScript.addEventListener(
      'error',
      () => {
        window.clearTimeout(timeout)
        reject(new Error('Kit runtime script failed to load.'))
      },
      { once: true },
    )
  })
}
</script>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  idPrefix: { type: String, default: 'kit-signup' },
})

const embedHost = ref(null)
const loadFailed = ref(false)
let activeForm = null
let embedScript = null
let mutationObserver = null
let isUnmounted = false

function createField({ id, label, name, type, autocomplete, placeholder, required = false }) {
  const wrapper = document.createElement('div')
  wrapper.className = 'formkit-field kit-signup__field'

  const fieldLabel = document.createElement('label')
  fieldLabel.className = 'kit-signup__label'
  fieldLabel.htmlFor = id
  fieldLabel.textContent = label

  if (required) {
    const visibleRequired = document.createElement('span')
    visibleRequired.className = 'kit-signup__required'
    visibleRequired.setAttribute('aria-hidden', 'true')
    visibleRequired.textContent = ' *'

    const accessibleRequired = document.createElement('span')
    accessibleRequired.className = 'kit-signup__sr-only'
    accessibleRequired.textContent = ' (required)'
    fieldLabel.append(visibleRequired, accessibleRequired)
  } else {
    const optional = document.createElement('span')
    optional.className = 'kit-signup__optional'
    optional.textContent = ' (optional)'
    fieldLabel.append(optional)
  }

  const input = document.createElement('input')
  input.id = id
  input.className = 'formkit-input kit-signup__input'
  input.name = name
  input.type = type
  input.autocomplete = autocomplete
  input.placeholder = placeholder
  input.required = required
  if (required) input.setAttribute('aria-required', 'true')

  wrapper.append(fieldLabel, input)
  return wrapper
}

function enhanceMessages(form) {
  const errorList = form.querySelector('[data-element="errors"]')
  if (errorList) {
    errorList.setAttribute('role', 'alert')
    errorList.setAttribute('aria-live', 'assertive')
  }

  const successMessage = form.querySelector('[data-element="success"]')
  if (successMessage) {
    successMessage.setAttribute('role', 'status')
    successMessage.setAttribute('aria-live', 'polite')
    successMessage.setAttribute('aria-atomic', 'true')
  }
}

function enhanceForm(form) {
  activeForm = form

  const kitEntry = registryEntryFor(form)
  if (kitEntry?.settings?.after_subscribe) {
    kitEntry.settings.after_subscribe.action = 'message'
    kitEntry.settings.after_subscribe.redirect_url = ''
  }

  if (!enhancedForms.has(form)) {
    enhancedForms.add(form)
    form.setAttribute('aria-label', 'Join the OG Blacman mailing list')
    form.removeAttribute('target')

    const fields = form.querySelector('[data-element="fields"]')
    const submit = form.querySelector('[data-element="submit"]')

    if (fields && submit && !form.querySelector('input[name="email_address"]')) {
      fields.insertBefore(
        createField({
          id: `${props.idPrefix}-first-name`,
          label: 'First name',
          name: 'fields[first_name]',
          type: 'text',
          autocomplete: 'given-name',
          placeholder: 'Your first name',
        }),
        submit,
      )
      fields.insertBefore(
        createField({
          id: `${props.idPrefix}-email`,
          label: 'Email address',
          name: 'email_address',
          type: 'email',
          autocomplete: 'email',
          placeholder: 'you@example.com',
          required: true,
        }),
        submit,
      )
    }

    const firstName = form.querySelector('input[name="fields[first_name]"]')
    const email = form.querySelector('input[name="email_address"]')
    const firstNameLabel = firstName?.closest('.formkit-field')?.querySelector('label')
    const emailLabel = email?.closest('.formkit-field')?.querySelector('label')

    if (firstName && firstNameLabel) {
      firstName.id = `${props.idPrefix}-first-name`
      firstNameLabel.htmlFor = firstName.id
    }
    if (email && emailLabel) {
      email.id = `${props.idPrefix}-email`
      emailLabel.htmlFor = email.id
      email.required = true
      email.setAttribute('aria-required', 'true')
    }

    if (submit) {
      submit.type = 'submit'
      submit.disabled = true
      submit.setAttribute('aria-disabled', 'true')
      const label = submit.querySelector('span')
      if (label && label.textContent !== 'STAY IN THE LOOP') {
        label.textContent = 'STAY IN THE LOOP'
      }
    }
  }

  enhanceMessages(form)
}

function enableForm(form) {
  const submit = form?.querySelector('[data-element="submit"]')
  if (!submit) return
  form.dataset.ogKitReady = 'true'
  submit.disabled = false
  submit.removeAttribute('aria-disabled')
}

function restoreCachedForm(host) {
  host.innerHTML = cachedFormMarkup
  const form = host.querySelector(`form[data-uid="${KIT_EMBED.uid}"]`)
  if (!form) throw new Error('The cached Kit form could not be restored.')

  window.__sv_forms = [
    ...(window.__sv_forms || []),
    { element: form, ...cachedFormConfig, initialized: false },
  ]
  enhanceForm(form)
  window.CK.default()
  enableForm(form)
  return form
}

function watchEmbedHost(host) {
  mutationObserver = new MutationObserver(() => {
    const form = host.querySelector(`form[data-uid="${KIT_EMBED.uid}"]`)
    if (form) enhanceForm(form)
  })
  mutationObserver.observe(host, { childList: true, subtree: true })
}

async function loadOfficialEmbed(host) {
  embedScript = document.createElement('script')
  embedScript.async = true
  embedScript.dataset.uid = KIT_EMBED.uid
  embedScript.src = KIT_EMBED.scriptSrc

  const embedLoaded = new Promise((resolve, reject) => {
    embedScript.addEventListener('load', resolve, { once: true })
    embedScript.addEventListener('error', () => reject(new Error('Kit embed failed to load.')), {
      once: true,
    })
  })

  host.appendChild(embedScript)
  await embedLoaded

  const form = host.querySelector(`form[data-uid="${KIT_EMBED.uid}"]`)
  if (!form) throw new Error('Kit did not render the signup form.')
  enhanceForm(form)
  cacheGeneratedForm(form)
  await waitForKitRuntime()
  enableForm(form)
  return form
}

onMounted(async () => {
  const host = embedHost.value
  if (!host) return
  watchEmbedHost(host)

  try {
    if (cachedFormMarkup && cachedFormConfig && window.CK?.default) {
      activeForm = restoreCachedForm(host)
      return
    }

    if (initialEmbedPromise) {
      await initialEmbedPromise
      if (!isUnmounted) activeForm = restoreCachedForm(host)
      return
    }

    initialEmbedPromise = loadOfficialEmbed(host).catch((error) => {
      initialEmbedPromise = null
      throw error
    })
    const form = await initialEmbedPromise
    if (isUnmounted) {
      removeFromKitRegistry(form)
      return
    }
    activeForm = form
  } catch (error) {
    if (!isUnmounted) loadFailed.value = true
    console.error('Unable to initialize the Kit signup form.', error)
  }
})

onBeforeUnmount(() => {
  isUnmounted = true
  mutationObserver?.disconnect()
  removeFromKitRegistry(activeForm)
  if (embedScript?.isConnected) embedScript.remove()
})
</script>

<template>
  <div class="kit-signup">
    <div ref="embedHost" class="kit-signup__embed" />
    <p v-if="loadFailed" class="kit-signup__load-error" role="alert">
      The signup form could not load. Please check your connection and try again.
    </p>
  </div>
</template>

<style scoped>
.kit-signup {
  width: min(100%, 760px);
  margin-inline: auto;
  color: var(--color-white);
  font-family: Neuehaasdisplayroman, Arial, sans-serif;
}

.kit-signup__embed {
  min-height: 222px;
}

.kit-signup :deep(.formkit-form[data-uid]) {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  color: var(--color-white) !important;
  background: transparent !important;
  font-family: inherit !important;
}

.kit-signup :deep(.formkit-form[data-uid] [data-style="clean"]) {
  width: 100% !important;
  padding: 0 !important;
  background: transparent !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-fields) {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 20px !important;
  margin: 0 !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-field),
.kit-signup :deep(.formkit-form[data-uid] .formkit-submit) {
  min-width: 0 !important;
  margin: 0 !important;
}

.kit-signup :deep(.kit-signup__label) {
  display: block;
  margin: 0 0 8px;
  color: var(--color-white);
  font-family: Neuehaasdisplaymediu, Arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.12em;
  line-height: 1.3;
  text-transform: uppercase;
}

.kit-signup :deep(.kit-signup__optional) {
  color: color-mix(in srgb, var(--color-white) 55%, transparent);
  letter-spacing: 0.04em;
  text-transform: none;
}

.kit-signup :deep(.kit-signup__required) {
  color: var(--color-gold-1);
}

.kit-signup :deep(.kit-signup__sr-only) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-input) {
  width: 100% !important;
  height: 48px !important;
  margin: 0 !important;
  padding: 10px 0 !important;
  color: var(--color-white) !important;
  background: transparent !important;
  border: 0 !important;
  border-bottom: 1px solid color-mix(in srgb, var(--color-white) 72%, transparent) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font: inherit !important;
  font-size: 17px !important;
  line-height: 1.4 !important;
  transition: border-color 160ms ease, box-shadow 160ms ease !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-input::placeholder) {
  color: color-mix(in srgb, var(--color-white) 48%, transparent) !important;
  opacity: 1 !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-input:hover) {
  border-bottom-color: var(--color-white) !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-input:focus-visible) {
  border-bottom-color: var(--color-gold-1) !important;
  outline: 2px solid var(--color-gold-1) !important;
  outline-offset: 4px !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-submit) {
  width: 100% !important;
  min-height: 50px !important;
  padding: 0 !important;
  overflow: visible !important;
  color: var(--color-black-2) !important;
  background: var(--color-gold-1) !important;
  border: 1px solid var(--color-gold-1) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-family: Neuehaasdisplaymediu, Arial, sans-serif !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  letter-spacing: 0.13em !important;
  line-height: 1.2 !important;
  text-transform: uppercase !important;
  transition: color 160ms ease, background-color 160ms ease, border-color 160ms ease !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-submit > span) {
  padding: 16px 20px !important;
  background: transparent !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-submit:hover:not(:disabled)) {
  color: var(--color-gold-1) !important;
  background: var(--color-black-2) !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-submit:focus-visible) {
  outline: 2px solid var(--color-white) !important;
  outline-offset: 4px !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-submit:disabled) {
  cursor: wait !important;
  opacity: 0.65 !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-alert) {
  width: 100% !important;
  margin: 0 0 20px !important;
  padding: 14px 16px !important;
  color: var(--color-white) !important;
  background: var(--color-black-1) !important;
  border: 1px solid var(--color-gold-1) !important;
  border-radius: 0 !important;
  font: inherit !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  text-align: left !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-alert-error) {
  border-color: #ef7d63 !important;
}

.kit-signup :deep(.formkit-form[data-uid] .formkit-alert-success) {
  min-height: 82px;
  display: flex !important;
  align-items: center;
  margin: 0 !important;
  color: var(--color-black-2) !important;
  background: var(--color-gold-1) !important;
  border-color: var(--color-gold-1) !important;
  font-size: 16px !important;
}

.kit-signup :deep(.formkit-powered-by-convertkit-container) {
  margin: 12px 0 0 !important;
}

.kit-signup :deep(.formkit-powered-by-convertkit) {
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  padding: 2px 0 !important;
  color: color-mix(in srgb, var(--color-white) 45%, transparent) !important;
  background: none !important;
  border-radius: 0 !important;
  font-family: Neuehaasdisplayroman, Arial, sans-serif !important;
  font-size: 10px !important;
  letter-spacing: 0.08em !important;
  line-height: 1.4 !important;
  text-indent: 0 !important;
  text-transform: uppercase !important;
}

.kit-signup :deep(.formkit-powered-by-convertkit:hover),
.kit-signup :deep(.formkit-powered-by-convertkit:focus-visible) {
  color: var(--color-gold-1) !important;
  opacity: 1 !important;
  transform: none !important;
}

.kit-signup :deep(.formkit-powered-by-convertkit:focus-visible) {
  outline: 2px solid var(--color-gold-1) !important;
  outline-offset: 3px !important;
}

.kit-signup__load-error {
  margin: 0;
  padding: 14px 16px;
  color: var(--color-white);
  background: var(--color-black-1);
  border: 1px solid #ef7d63;
  font-size: 14px;
  line-height: 1.5;
}

@media screen and (min-width: 768px) {
  .kit-signup__embed {
    min-height: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .kit-signup :deep(.formkit-form[data-uid] .formkit-input),
  .kit-signup :deep(.formkit-form[data-uid] .formkit-submit) {
    transition: none !important;
  }
}
</style>
