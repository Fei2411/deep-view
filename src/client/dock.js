// The pending view while it waits: the tool call's card lives inside the call's
// step in the transcript, which the shell may collapse; the same card docks
// above the composer, where the user always sees what the agent is asking.
import { createElement as h, useEffect, useState } from 'react'
import { WidgetCard } from '../react/card.js'
import { call } from './api.js'

export function PendingDock({ sessionId, useConversation }) {
  const conversation = useConversation?.(value => value)
  const [record, setRecord] = useState(undefined)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (typeof sessionId !== 'string') return undefined
    let alive = true
    call('pending', { sessionId }).then(value => { if (alive) setRecord(value) }).catch(() => { if (alive) setRecord(null) })
    return () => { alive = false }
  }, [sessionId, conversation])
  if (!record) return null
  const gone = () => setRecord(null)
  const onSubmit = (action, values) => {
    if (busy) return
    setBusy(true)
    call('reply', { sessionId, viewId: record.id, action, values }).then(gone).catch(() => setBusy(false))
  }
  const onDismiss = () => {
    if (busy) return
    setBusy(true)
    call('dismiss', { sessionId }).then(gone).catch(() => setBusy(false))
  }
  return h('div', { className: 'dui-q-inline' }, h(WidgetCard, {
    title: record.title ?? '', view: record.view, onSubmit, onDismiss, busy, raised: true,
  }))
}
