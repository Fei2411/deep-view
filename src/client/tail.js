// The turn tail: under the turn's closing message, each successful show_view
// call draws its card — display-only from the call arguments, the live card
// while the host's pending record names the call, the settled card once the
// user's answer message is in the chat. A dismissed or superseded card and a
// refused call draw nothing.
import { createElement as h, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { checkShownView } from '../core/views.js'
import { WidgetCard } from '../react/card.js'
import { call } from './api.js'

const REPLY_HEAD = '{"kind":"answer_to_pending_view"'

// Another plugin may register show_view in a session's agent scope — then its
// cards are that plugin's to draw. Asked once per session, cached.
const servesCache = new Map()
const serves = (sessionId) => {
  if (typeof sessionId !== 'string') return Promise.resolve(true)
  if (!servesCache.has(sessionId)) {
    servesCache.set(sessionId, call('serves', { sessionId }).then(value => value !== false).catch(() => true))
  }
  return servesCache.get(sessionId)
}
const useServes = (sessionId) => {
  const [mine, setMine] = useState(true)
  useEffect(() => {
    let alive = true
    serves(sessionId).then(value => { if (alive) setMine(value) })
    return () => { alive = false }
  }, [sessionId])
  return mine
}

// The text of the user message that answered `callId`, or undefined. The reply
// names the call at its top level, so the scan stays a cheap string check until
// a candidate parses.
const findReplyText = (snapshot, callId) => {
  const chat = snapshot?.views?.get?.('chat')
  if (chat === undefined) return undefined
  const needle = `"callId":"${callId}"`
  for (const node of chat.nodes?.values?.() ?? []) {
    const data = node?.data
    const text = typeof data?.text === 'string' ? data.text
      : Array.isArray(data?.content) ? data.content.filter(block => block?.type === 'text').map(block => block.text).join('\n')
      : undefined
    if (typeof text === 'string' && text.startsWith(REPLY_HEAD) && text.includes(needle)) return text
  }
  return undefined
}

// The settled card for a view the user already answered: the reply message
// carries the blueprint and the answer, so it draws without the pending store.
const SettledView = ({ replyText }) => {
  let payload = null
  try { payload = JSON.parse(replyText) } catch { payload = null }
  const view = payload?.views?.[0]
  if (view === undefined || view?.view === undefined) return null
  const answers = Array.isArray(payload.answers) ? payload.answers : []
  const answer = answers.find(entry => entry?.id === view.id) ?? answers[0] ?? null
  return h('div', { className: 'dui-q-inline' }, h(WidgetCard, { title: view.title ?? '', view: view.view, settled: true, answer }))
}

// The live card while the host waits for the answer. It re-reads the pending
// record when the chat gains nodes — a user message admitted into the session
// revokes the card on the host — and after its own submit or dismiss, never on
// a streamed chunk: the gate is the chat node count, a coarse value.
const InteractiveView = ({ callId, sessionId, useConversation }) => {
  const mine = useServes(sessionId)
  const order = useConversation?.(snapshot => snapshot?.views?.get?.('chat')?.order?.length ?? 0) ?? 0
  const replyText = useConversation?.(snapshot => findReplyText(snapshot, callId))
  const [record, setRecord] = useState(undefined)
  const [revision, setRevision] = useState(0)
  const [flying, setFlying] = useState(false)
  useEffect(() => {
    if (typeof sessionId !== 'string' || replyText !== undefined || !mine) return undefined
    let alive = true
    call('pending', { sessionId }).then(value => { if (alive) setRecord(value) }).catch(() => { if (alive) setRecord(null) })
    return () => { alive = false }
  }, [sessionId, order, replyText, revision, mine])
  if (!mine) return null
  if (replyText !== undefined) return h(SettledView, { replyText })
  if (flying === 'gone' || record === undefined || record === null || record.callId !== callId) return null
  const run = (make) => {
    if (flying) return
    setFlying(true)
    void Promise.resolve().then(make).then(() => setFlying('gone')).catch(() => { setFlying(false); setRevision(value => value + 1) })
  }
  const onSubmit = (action, values) => run(() => call('reply', { sessionId, viewId: record.id, action, values }))
  const onDismiss = () => run(() => call('dismiss', { sessionId }))
  return h('div', { className: 'dui-q-inline' }, h(WidgetCard, { title: record.title ?? '', view: record.view, onSubmit, onDismiss, busy: flying === true }))
}

const TailView = ({ call, sessionId, useConversation }) => {
  const mine = useServes(sessionId)
  const shown = checkShownView(call.args?.title, call.args?.view)
  if (!mine) return null
  if (shown.error !== undefined) return null
  // The same refusal rules the tool applied: a call that showed no card draws none.
  if (!shown.interactive && call.args?.await_reply === true) return null
  if (shown.interactive && call.args?.await_reply === false) return null
  if (shown.interactive || call.args?.await_reply === true) {
    return h(InteractiveView, { callId: call.callId, sessionId, useConversation })
  }
  return h('div', { className: 'dui-q-inline' }, h(WidgetCard, { title: shown.title, view: shown.view }))
}

export function ViewsTail({ turn, sessionId, useConversation }) {
  const source = useMemo(() => turn?.data?.source?.('deep-ui-views'), [turn])
  const data = useSyncExternalStore(source?.subscribe ?? (() => () => {}), () => source?.getSnapshot())
  const views = data?.views ?? []
  if (views.length === 0) return null
  return views.map(item => h(TailView, { key: item.callId, call: item, sessionId, useConversation }))
}
