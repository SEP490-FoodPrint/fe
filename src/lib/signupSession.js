const KEY = "foodprint_signup_pending"

export function readSignupSession() {
  try {
    const data = JSON.parse(sessionStorage.getItem(KEY) || "null")
    return data && typeof data.email === "string" ? data : null
  } catch { return null }
}

export function saveSignupSession({ email, username, requestType, codeSent = false, resendAt = 0, emailVerified = false }) {
  const pending = { email, username, requestType, codeSent, resendAt, emailVerified }
  try { sessionStorage.setItem(KEY, JSON.stringify(pending)) } catch { /* Router state still carries the current verification flow. */ }
  return pending
}

export function clearSignupSession() {
  try { sessionStorage.removeItem(KEY) } catch { /* No persistent session is required for account verification. */ }
}
