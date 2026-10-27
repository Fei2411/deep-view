// The show_view call in the transcript: a display-only view draws from the
// call's own arguments; an interactive one draws the live card only while the
// host's pending record names this call — a submitted, dismissed, or superseded
// card leaves nothing behind.
import { createElement as h, useEffect, useRef, useState } from 'react'
import { checkShownView } from '../core/views.js'
import { WidgetCard } from '../react/card.js'
import { call } from './api.js'


export function ShowViewCell({ callId, sessionId, block, useConversation }) {
  const args = block?.args ?? block?.call?.args ?? block?.arguments
  // Re-read the pending record whenever the assembled conversation changes: a
  // user message revokes the card on the host, and this session's next fetch
  // comes back empty — the card goes away without a reload.
  const conversation = useConversation?.(value => value)
  const [record, setRecord] = useState(undefined)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (typeof sessionId !== 'string') return undefined
    let alive = true
    call('pending', { sessionId }).then(value => { if (alive) setRecord(value) }).catch(() => { if (alive) setRecord(null) })
    return () => { alive = false }
  }, [sessionId, conversation, revision])
  const shown = checkShownView(args?.text?.('title'), args?.value?.('view'))
  const [flying, setFlying] = useState(false)
  const busyRef = useRef(false)
  const run = (make) => {
    if (busyRef.current) return
    busyRef.current = true
    setFlying(true)
    void Promise.resolve().then(make).catch(() => setFlying(false)).finally(() => { busyRef.current = false; setRevision(value => value + 1) })
  }
  if (shown.error !== undefined) return null
  if (!shown.interactive && args?.value?.('await_reply') !== true) {
    return h('div', { className: 'dui-q-inline' }, h(WidgetCard, { title: shown.title, view: shown.view }))
  }
  // An interactive call renders only while the pending record names it.
  if (record === undefined || record === null || record.callId !== callId || flying === 'gone') {
    return h('span', { className: 'dui-gone', hidden: true })
  }
  const onSubmit = (action, values) => run(() => call('reply', { sessionId, viewId: record.id, action, values }).then(() => setFlying('gone')))
  const onDismiss = () => run(() => call('dismiss', { sessionId }).then(() => setFlying('gone')))
  if (flying === true) return h('span', { className: 'dui-gone', hidden: true })
  return h('div', { className: 'dui-q-inline' }, h(WidgetCard, { title: record.title ?? '', view: record.view, onSubmit, onDismiss, busy: flying === true }))
}
