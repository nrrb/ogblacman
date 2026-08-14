import { describe, expect, it, vi } from 'vitest'

import {
  SIGNUP_MESSAGES,
  buildKitPayload,
  submitSignup,
  validateEmail,
} from '@/features/mailing-list/kitLogic'

const ACTION = 'https://app.kit.com/forms/123456/subscriptions'

function okResponse() {
  return vi.fn().mockResolvedValue({ ok: true } as Response)
}

describe('validateEmail', () => {
  it('requires an address', () => {
    expect(validateEmail('')).toBe(SIGNUP_MESSAGES.emailRequired)
    expect(validateEmail('   ')).toBe(SIGNUP_MESSAGES.emailRequired)
  })

  it('rejects malformed addresses', () => {
    for (const value of ['og', 'og@', '@blacman.com', 'og@blacman', 'og blacman@mail.com']) {
      expect(validateEmail(value)).toBe(SIGNUP_MESSAGES.emailInvalid)
    }
  })

  it('accepts valid addresses regardless of surrounding whitespace', () => {
    expect(validateEmail('og@blacman.com')).toBeNull()
    expect(validateEmail('  og.blacman+list@mail.co.uk  ')).toBeNull()
  })
})

describe('buildKitPayload', () => {
  it('sends the trimmed email address', () => {
    expect(buildKitPayload({ email: '  og@blacman.com ' }).get('email_address')).toBe('og@blacman.com')
  })

  it('includes first name only when one was given', () => {
    expect(buildKitPayload({ email: 'og@blacman.com' }).has('fields[first_name]')).toBe(false)
    expect(buildKitPayload({ email: 'og@blacman.com', firstName: '  ' }).has('fields[first_name]')).toBe(false)
    expect(buildKitPayload({ email: 'og@blacman.com', firstName: ' OG ' }).get('fields[first_name]')).toBe('OG')
  })
})

describe('submitSignup', () => {
  it('validates before touching the network', async () => {
    const fetchImpl = okResponse()

    const result = await submitSignup(ACTION, { email: 'nope' }, fetchImpl)

    expect(result).toEqual({ status: 'error', message: SIGNUP_MESSAGES.emailInvalid })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('posts a form-encoded body to the configured action', async () => {
    const fetchImpl = okResponse()

    const result = await submitSignup(ACTION, { email: 'og@blacman.com', firstName: 'OG' }, fetchImpl)

    expect(result).toEqual({ status: 'success' })
    expect(fetchImpl).toHaveBeenCalledWith(ACTION, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'email_address=og%40blacman.com&fields%5Bfirst_name%5D=OG',
    })
  })

  it('reports a failure when the provider rejects the request', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 422 } as Response)

    await expect(submitSignup(ACTION, { email: 'og@blacman.com' }, fetchImpl)).resolves.toEqual({
      status: 'error',
      message: SIGNUP_MESSAGES.failed,
    })
  })

  it('reports a failure when the network throws', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('offline'))

    await expect(submitSignup(ACTION, { email: 'og@blacman.com' }, fetchImpl)).resolves.toEqual({
      status: 'error',
      message: SIGNUP_MESSAGES.failed,
    })
  })
})
