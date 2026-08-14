/**
 * Kit (formerly ConvertKit) mailing-list boundary.
 *
 * The full public form endpoint is supplied as VITE_KIT_FORM_ACTION so no
 * provider-specific URL shape is baked into the app and no private API
 * credential is ever needed in the browser bundle. Swapping providers means
 * changing this file and the env var, nothing else.
 */

export interface SignupInput {
  email: string
  firstName?: string
}

export type SignupResult = { status: 'success' } | { status: 'error'; message: string }

export const SIGNUP_MESSAGES = {
  emailRequired: 'Drop your email first',
  emailInvalid: "That email ain't right",
  failed: 'Something broke on my end, try that again in a minute',
  success: "You're in. I'll holler when something drops",
} as const

// Deliberately permissive: catches obvious typos without rejecting valid but
// unusual addresses. Kit performs the authoritative check.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

/** Returns an error message, or null when the address is acceptable. */
export function validateEmail(value: string): string | null {
  const email = value.trim()
  if (!email) return SIGNUP_MESSAGES.emailRequired
  if (!EMAIL_PATTERN.test(email)) return SIGNUP_MESSAGES.emailInvalid
  return null
}

export function buildKitPayload(input: SignupInput): URLSearchParams {
  const payload = new URLSearchParams()
  payload.set('email_address', input.email.trim())
  const firstName = input.firstName?.trim()
  if (firstName) payload.set('fields[first_name]', firstName)
  return payload
}

/**
 * Submit to Kit's public form endpoint. Any failure is reported as a single
 * user-facing message; provider error shapes are not surfaced to the visitor.
 */
export async function submitSignup(
  action: string,
  input: SignupInput,
  fetchImpl: typeof fetch = fetch,
): Promise<SignupResult> {
  const validationError = validateEmail(input.email)
  if (validationError) return { status: 'error', message: validationError }

  try {
    const response = await fetchImpl(action, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: buildKitPayload(input).toString(),
    })
    if (!response.ok) return { status: 'error', message: SIGNUP_MESSAGES.failed }
    return { status: 'success' }
  } catch {
    return { status: 'error', message: SIGNUP_MESSAGES.failed }
  }
}
