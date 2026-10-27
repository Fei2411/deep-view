// The answered view: DSH's question pipeline claims a user-question-reply into
// a 'question-reply' chat node; ours renders the settled card when the reply
// carries a view, and a compact transcript for the question replies it shadows.
import { createElement as h } from 'react'
import { readViewReply } from '../core/reply.js'
import { AnsweredView } from '../react/card.js'

const isViewReply = (data) => {
  if (Array.isArray(data?.views) && data.views.length > 0) return true
  return readViewReply(typeof data?.text === 'string' ? data.text : '') !== undefined
}

// A real ask_user_question reply, as a simple read-only transcript: Deep UI has
// no access to the shipped renderer (the questions UI bundle exports only its
// plugin), so it draws the pairs itself rather than leaving a dead row.
function QuestionReply({ node, t }) {
  const data = node.data ?? {}
  const questions = Array.isArray(data.questions) ? data.questions : []
  const answers = Array.isArray(data.answers) ? data.answers : []
  if (questions.length === 0) {
    return data.text ? h('div', { className: 'dui-urow' }, h('div', { className: 'dui-ububble' }, data.text)) : null
  }
  return h('div', { className: 'dui-q-inline' }, questions.map((question) => {
    const answer = answers.find(item => item.id === question.id)
    const values = [...(answer?.selected ?? []), ...(answer?.custom ? [answer.custom] : [])]
    return h('div', { key: question.id, className: 'dui-q dui-q-settled', role: 'group' },
      h('p', { className: 'dui-q-title' }, question.header ?? question.question),
      h('div', { className: 'dui-q-body' },
        h('span', { className: 'dui-q-label' }, values.length > 0 ? values.join(', ') : t('(skipped)'))))
  }))
}

export function ReplyNode({ node, t }) {
  if (isViewReply(node?.data)) return h(AnsweredView, { node })
  return h(QuestionReply, { node, t })
}

// The same reply in a deployment without the questions UI: the message is a
// plain user text, and this rule turns the JSON body into a node.
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
  return h(AnsweredView, { node: { data: { text: node.data?.text } } })
}
