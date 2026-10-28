// The view answer's own chat row: the reply is a user/message event carrying
// source kind 'deep-view-reply'. The Definition claims it into a
// 'deep-view-reply' node so the raw JSON never reaches a bubble, and the node
// draws one compact line — the picked labels, the confirm or cancel label, or
// the submitted values.
import { createElement as h } from 'react'
import { REPLY_SOURCE_KIND, readViewReply, viewAnswerText } from '../core/reply.js'

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)

const isReplySource = (source) => isRecord(source) && source.kind === REPLY_SOURCE_KIND
  && typeof source.callId === 'string' && source.outcome === 'answered'

export const viewReplyDefinition = {
  kind: 'deep-view-reply',
  target: 'chat',
  match: (event) => {
    // surfaceOp 'append' mirrors isAppendSurfaceEvent without importing
    // dsh-session/surface into the browser bundle.
    if (event?.type !== 'user/message' || event.surfaceOp !== 'append'
      || !isReplySource(event.data?.source)) return null
    return { id: String(event.data?.id), role: 'start' }
  },
  start: (_context, match) => {
    const event = match.event
    const block = Array.isArray(event.data?.content) ? event.data.content.find(item => item?.type === 'text') : undefined
    return { seq: event.seq, time: event.time, text: block?.text ?? '' }
  },
  update: context => context.state,
  buildViewNode: (context) => {
    if (context.state === undefined) return null
    const { seq, ...data } = context.state
    return {
      key: context.key,
      kind: 'deep-view-reply',
      id: context.id,
      target: 'chat',
      anchorSeq: seq,
      location: context.start?.location ?? { kind: 'unresolved' },
      visibility: 'visible',
      data,
    }
  },
}

export function ViewReplyNode({ node }) {
  const reply = readViewReply(node.data?.text ?? '')
  if (reply === undefined) return null
  const lines = reply.views.map((view) => {
    const answer = reply.answers.find(item => item.id === view.id) ?? reply.answers[0]
    return viewAnswerText(view.view, answer)
  }).filter(text => text !== '')
  if (lines.length === 0) return null
  return lines.join(' · ')
}
