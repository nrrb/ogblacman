import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

import { setAnalyticsTransport, type AnalyticsTransport } from '@/analytics'
import SignupForm from '@/components/SignupForm.vue'
import { SIGNUP_MESSAGES } from '@/features/mailing-list/kitLogic'

const ACTION = 'https://app.kit.com/forms/123456/subscriptions'

function trackedEvents() {
  const calls: Array<{ name: string; params: Record<string, unknown> }> = []
  const transport: AnalyticsTransport = (name, params) => calls.push({ name, params })
  setAnalyticsTransport(transport)
  return calls
}

function emailField() {
  return screen.getByLabelText('Email') as HTMLInputElement
}

function submitButton() {
  return screen.getByRole('button')
}

beforeEach(() => {
  vi.stubEnv('VITE_KIT_FORM_ACTION', ACTION)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  setAnalyticsTransport(null)
})

describe('SignupForm', () => {
  it('requires an email before contacting the provider', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(SignupForm)
    await fireEvent.click(submitButton())

    expect((await screen.findByRole('alert')).textContent).toContain(SIGNUP_MESSAGES.emailRequired)
    expect(fetchMock).not.toHaveBeenCalled()
    // The invalid field is announced, not signalled by color alone.
    expect(emailField().getAttribute('aria-invalid')).toBe('true')
    expect(emailField().getAttribute('aria-describedby')).toBe('signup-email-error')
  })

  it('rejects a malformed address and clears the error on new input', async () => {
    vi.stubGlobal('fetch', vi.fn())

    render(SignupForm)
    await fireEvent.update(emailField(), 'not-an-email')
    await fireEvent.click(submitButton())

    expect((await screen.findByRole('alert')).textContent).toContain(SIGNUP_MESSAGES.emailInvalid)

    await fireEvent.update(emailField(), 'og@blacman.com')
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    expect(emailField().getAttribute('aria-invalid')).toBe('false')
  })

  it('shows an inline success state and reports the signup', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response)
    vi.stubGlobal('fetch', fetchMock)
    const events = trackedEvents()

    render(SignupForm, { props: { source: 'homepage' } })
    await fireEvent.update(screen.getByLabelText(/first name/i), 'OG')
    await fireEvent.update(emailField(), 'og@blacman.com')
    await fireEvent.click(submitButton())

    const confirmation = await screen.findByRole('status')
    expect(confirmation.textContent).toContain(SIGNUP_MESSAGES.success)
    // Inline confirmation replaces the form; no redirect to a provider page.
    expect(screen.queryByLabelText('Email')).toBeNull()
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(events).toEqual([{ name: 'signup_success', params: { source: 'homepage' } }])
  })

  it('shows an inline error and keeps the form when the provider fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response))
    const events = trackedEvents()

    render(SignupForm)
    await fireEvent.update(emailField(), 'og@blacman.com')
    await fireEvent.click(submitButton())

    expect((await screen.findByRole('alert')).textContent).toContain(SIGNUP_MESSAGES.failed)
    // The address is preserved so the visitor can retry without retyping.
    expect(emailField().value).toBe('og@blacman.com')
    expect(events).toHaveLength(0)
  })

  it('disables signup until a Kit form action is configured', async () => {
    vi.stubEnv('VITE_KIT_FORM_ACTION', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(SignupForm)

    const button = submitButton() as HTMLButtonElement
    expect(button.textContent).toContain('List Opens Soon')
    expect(button.disabled).toBe(true)
    expect(emailField().disabled).toBe(true)

    await fireEvent.click(button)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
