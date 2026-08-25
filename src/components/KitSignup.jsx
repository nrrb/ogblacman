import { useEffect, useRef, useState } from 'react'
import './KitSignup.css'

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

export default function KitSignup({ idPrefix = 'kit-signup' }) {
  const embedHost = useRef(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    const host = embedHost.current
    if (!host) return undefined

    let activeForm = null
    let embedScript = null
    let mutationObserver = null
    let isUnmounted = false

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
              id: `${idPrefix}-first-name`,
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
              id: `${idPrefix}-email`,
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
          firstName.id = `${idPrefix}-first-name`
          firstNameLabel.htmlFor = firstName.id
        }
        if (email && emailLabel) {
          email.id = `${idPrefix}-email`
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

    function restoreCachedForm() {
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

    function watchEmbedHost() {
      mutationObserver = new MutationObserver(() => {
        const form = host.querySelector(`form[data-uid="${KIT_EMBED.uid}"]`)
        if (form) enhanceForm(form)
      })
      mutationObserver.observe(host, { childList: true, subtree: true })
    }

    async function loadOfficialEmbed() {
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

    watchEmbedHost()

    async function initialize() {
      try {
        if (cachedFormMarkup && cachedFormConfig && window.CK?.default) {
          activeForm = restoreCachedForm()
          return
        }

        if (initialEmbedPromise) {
          await initialEmbedPromise
          if (!isUnmounted) activeForm = restoreCachedForm()
          return
        }

        initialEmbedPromise = loadOfficialEmbed().catch((error) => {
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
        if (!isUnmounted) setLoadFailed(true)
        console.error('Unable to initialize the Kit signup form.', error)
      }
    }

    initialize()

    return () => {
      isUnmounted = true
      mutationObserver?.disconnect()
      removeFromKitRegistry(activeForm)
      if (embedScript?.isConnected) embedScript.remove()
    }
  }, [idPrefix])

  return (
    <div className="kit-signup">
      <div ref={embedHost} className="kit-signup__embed" />
      {loadFailed && (
        <p className="kit-signup__load-error" role="alert">
          The signup form could not load. Please check your connection and try again.
        </p>
      )}
    </div>
  )
}
