const ROUTE = 'api/deep-view'

// The route answers { ok, value } or { ok: false, error: { code, message } }.
// A refusal (the view went stale, a bad answer) carries a message for the user.
export const call = async (op, payload, signal) => {
  const response = await fetch(ROUTE, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ op, ...payload }),
    signal,
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const result = await response.json()
  if (!result.ok) {
    throw Object.assign(new Error(result.error?.message ?? 'Request failed'), { code: result.error?.code ?? 'deep-view/error' })
  }
  return result.value
}
