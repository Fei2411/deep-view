// The view answer's own user bubble: the reply message is a plain user message
// whose text is the answer_to_pending_view JSON. The rule claims that text so
// the raw JSON never reaches the bubble, and the node draws one compact line —
// the picked labels, the confirm or cancel label, or the submitted values.
import { createElement as h } from 'react'
import { readViewReply, viewAnswerText } from '../core/reply.js'

export const viewReplyRule = {
  id: 'deep-ui-view-reply',
  order: 10,
  match: (text, from) => {
    const rest = text.slice(from).trimStart()
    const start = from + (text.slice(from).length - rest.length)
    const data = readViewReply(rest)
    if (data === undefined) return undefined
    return { id: 'deep-ui-view-reply', start, end: text.length, data: { text: rest } }
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
  return h('div', { className: 'dui-urow' }, h('div', { className: 'dui-ububble' }, lines.join(' · ')))
}
