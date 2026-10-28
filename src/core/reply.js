// The reply a view answer rides back on, and its text for history. Kept in the
// exact ds-bot wire shape so either plugin reads the other's transcript.
import { checkShownView, validateViewAnswer, viewSummary, inputsSummary } from './views.js'

export { viewSummary }

const REPLY_KIND = 'user-question-reply'

// The source kind Deep View puts on its own answer messages: the client's
// conversation Definition claims them into 'deep-view-reply' nodes, so the raw
// reply JSON never renders as a plain user bubble.
export const REPLY_SOURCE_KIND = 'deep-view-reply'

// A show_view card as the user saw it, one line for a handoff or a checkpoint.
// A call the tool would refuse showed no card, so it gives no text.
export function viewCardText(args) {
  let card = args
  if (typeof card === 'string') {
    try { card = JSON.parse(card) } catch { return '' }
  }
  const shown = checkShownView(card?.title, card?.view)
  if (shown.error !== undefined) return ''
  if (!shown.interactive && card?.await_reply === true) return ''
  if (shown.interactive && card?.await_reply === false) return ''
  const summary = viewSummary(shown.view)
  const head = shown.title === '' ? '[View card]' : `[View card] ${shown.title}`
  return summary === '' ? head : `${head}\n${summary}`
}

// The user's answer to a show_view card. The message carries the blueprint with
// the answer, so the answer still makes sense after a checkpoint drops the card.
// `sourceKind` is the admitted source kind on the reply: ds-bot rides its
// question pipeline ('user-question-reply'); a host without one sends a plain
// user message ('user').
export function viewReply(record, action, values, sourceKind = REPLY_KIND) {
  const checked = validateViewAnswer(record?.view, action, values)
  if (checked.error !== undefined) return undefined
  const callId = record.callId ?? record.id
  const shown = { id: record.id, title: record.title, view: record.view }
  const given = { id: record.id, action, values: checked }
  return {
    text: JSON.stringify({ kind: 'answer_to_pending_view', tool: 'show_view', callId, views: [shown], answers: [given] }),
    source: { kind: sourceKind, callId, outcome: 'answered' },
  }
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)

// Every component of the view, flattened, so option values and input ids
// resolve back to the labels the user saw.
function eachNode(view, visit) {
  if (!isRecord(view)) return
  visit(view)
  for (const child of Array.isArray(view.children) ? view.children : []) eachNode(child, visit)
}

// The answer as one short line for the user's own bubble: the picked option
// labels, the confirm or cancel label, `label: value` for a form, `label=value`
// for submitted inputs.
export function viewAnswerText(view, answer) {
  const values = answer?.values
  if (!isRecord(values)) return ''
  const parts = []
  if (Array.isArray(values.selected)) {
    const labels = new Map()
    eachNode(view, node => { for (const option of Array.isArray(node.options) ? node.options : []) for (const key of [option?.label, option?.value]) if (key !== undefined) labels.set(key, option?.label) })
    parts.push(...values.selected.map(value => labels.get(value) ?? String(value)))
  } else if (typeof values.confirmed === 'boolean') {
    let confirmLabel, cancelLabel
    eachNode(view, node => { if (node.id === answer.action) { confirmLabel = node.confirmLabel; cancelLabel = node.cancelLabel } })
    parts.push(values.confirmed ? (confirmLabel ?? 'Confirmed') : (cancelLabel ?? 'Cancelled'))
  } else if (isRecord(values.fields)) {
    const labels = new Map()
    eachNode(view, node => { for (const field of Array.isArray(node.fields) ? node.fields : []) labels.set(field?.id, field?.label ?? field?.id) })
    parts.push(...Object.entries(values.fields).map(([key, value]) => `${labels.get(key) ?? key}: ${value}`))
  }
  if (isRecord(values.inputs)) {
    const labels = new Map()
    eachNode(view, node => { if (typeof node.id === 'string' && node.label !== undefined) labels.set(node.id, node.label) })
    parts.push(...Object.entries(values.inputs).map(([key, value]) => `${labels.get(key) ?? key}=${value}`))
  }
  const text = parts.join('; ')
  return text.length > 200 ? `${text.slice(0, 200)}…` : text
}
export function readViewReply(text) {
  let value
  try { value = JSON.parse(text) } catch { return undefined }
  if (value?.kind === 'answer_to_pending_view' || (Array.isArray(value?.views) && value.views.length > 0 && value?.kind !== 'answer_to_pending_question')) {
    const views = (Array.isArray(value.views) ? value.views : []).filter(item => typeof item?.id === 'string' && typeof item.title === 'string' && isRecord(item.view))
    if (views.length === 0) return undefined
    const answers = (Array.isArray(value.answers) ? value.answers : []).filter(item => typeof item?.id === 'string' && typeof item.action === 'string' && isRecord(item.values))
    return { views, answers }
  }
  return undefined
}

// The submitted component, and the view's inputs as the user left them.
function actionSummary(answer, view) {
  const values = answer?.values
  if (!isRecord(values)) return '(skipped)'
  const inputs = inputsSummary(view, values.inputs)
  let text
  if (Array.isArray(values.selected)) text = `selected: ${values.selected.join(', ')}`
  else if (typeof values.confirmed === 'boolean') text = values.confirmed ? 'confirmed' : 'cancelled'
  else if (isRecord(values.fields)) text = Object.entries(values.fields).map(([key, value]) => `${key}: ${value}`).join('; ')
  else if (inputs !== '') text = ''
  else text = typeof answer.action === 'string' && answer.action !== '' ? answer.action : '(skipped)'
  if (inputs !== '') text = text === '' ? inputs : `${text}; ${inputs}`
  if (text === '') text = '(empty)'
  return text.length > 500 ? text.slice(0, 500) : text
}

// A view reply as model-facing history text; returns the text unchanged when it
// is not a view reply.
export function viewReplyText(text) {
  const reply = readViewReply(text)
  if (reply === undefined) return text
  return reply.views.map((view) => {
    const answer = reply.answers.find(item => item.id === view.id)
    return `${view.title === '' ? '[Answer to view card]' : `[Answer to view card] ${view.title}`}\nAnswer: ${actionSummary(answer, view.view)}`
  }).join('\n\n')
}
