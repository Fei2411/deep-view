import { createElement as h, Fragment, useEffect, useId, useRef, useState } from 'react'
import { CheckIcon, CloseIcon, CopyIcon, DotsIcon, DownloadIcon, InfoIcon, Segmented, keyLetter, useOptionKeys, useViewUi } from './ui.js'
import { CHART_CSS, TableIcon, WidgetChart } from './chart.js'
import { HTML_CSS, HtmlFrame } from './frame.js'
import { asText, choiceValue, inputDefault, resolve, viewInputs, viewScope } from '../core/views.js'

// -------------------------------------------------------------------------
// Views (show_view): a declarative blueprint — text, numbers, tables,
// charts, inputs, and answers to wait for — drawn as part of a reply. Nothing
// model-written executes in the page: every node maps to one of the components
// below, formulas go through the shared evaluator, and html runs in a sandboxed
// frame. Inputs keep their values in the page only.

const mdLabels = ui => ({ code: { copyLabel: ui.t('Copy'), copiedLabel: ui.t('Copied') }, footnotes: ui.t('Footnotes') })
const TONES = ['good', 'warn', 'bad']
const CALLOUT_TONES = ['info', 'good', 'warn', 'bad']

const optionsOf = node => (Array.isArray(node?.options) ? node.options : [])
  .map(option => (typeof option === 'string' ? { label: option } : option))
  .filter(option => option !== null && typeof option === 'object' && option.label !== undefined)
const fieldsOf = node => (Array.isArray(node?.fields) ? node.fields : [])
  .filter(field => field !== null && typeof field === 'object' && field.id !== undefined)
const cellText = value => (value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : asText(value))
const NUMERIC_CELL = /^[-+]?[\d.,]+\s?(%|[a-zA-Z]{1,4})?$/

const countType = (node, type) => {
  if (node === null || typeof node !== 'object') return 0
  const children = Array.isArray(node.children) ? node.children : []
  return (node.type === type ? 1 : 0) + children.reduce((sum, child) => sum + countType(child, type), 0)
}
const ANSWER_TYPES = new Set(['options', 'confirm', 'form', 'submit', 'slider', 'choice', 'toggle', 'number'])
const hasControls = (node) => {
  if (node === null || typeof node !== 'object') return false
  if (ANSWER_TYPES.has(node.type)) return true
  return Array.isArray(node.children) && node.children.some(hasControls)
}

// The values an answer carries belong to the component whose id is its action.
const answerValues = (answer, node) => (answer?.action === node.id ? answer.values : undefined)

function OptionsInput({ node, onSubmit, keys, busy = false }) {
  const ui = useViewUi()
  const [picked, setPicked] = useState([])
  const options = optionsOf(node)
  const multi = node.multi === true
  const choose = (label) => {
    if (busy) return
    if (multi) {
      setPicked(current => (current.includes(label) ? current.filter(item => item !== label) : [...current, label]))
      return
    }
    onSubmit?.(node.id, { selected: [label] })
  }
  const submit = () => { if (!busy && picked.length > 0) onSubmit?.(node.id, { selected: picked }) }
  const ownRef = useRef(null)
  const hints = useOptionKeys(busy || !keys ? 0 : options.length, index => choose(options[index].label), ownRef)
  return h(Fragment, null,
    h('div', { className: 'dui-q-list', role: 'group' }, options.map((option, index) => {
      const selected = multi && picked.includes(option.label)
      return h('button', {
        key: option.label, type: 'button', className: 'dui-q-opt', disabled: busy,
        'aria-pressed': multi ? selected : undefined,
        'aria-keyshortcuts': hints ? keyLetter(index).toLowerCase() : undefined,
        onClick: () => choose(option.label),
      },
      hints ? h('span', { className: 'dui-key', 'aria-hidden': true }, keyLetter(index)) : null,
      h('span', { className: 'dui-q-body' },
        h('span', { className: 'dui-q-label' }, option.label),
        option.description ? h('span', { className: 'dui-q-desc' }, option.description) : null),
      selected ? h('span', { className: 'dui-q-check', title: ui.t('Selected') }, h(CheckIcon)) : null)
    })),
    multi ? h('div', { className: 'dui-q-foot' },
      h('button', { type: 'button', className: 'dui-q-submit', disabled: busy || picked.length === 0, onClick: submit }, ui.t('Submit'))) : null)
}

function SettledOptions({ node, answer }) {
  const ui = useViewUi()
  const selected = answerValues(answer, node)?.selected
  const chosen = Array.isArray(selected) ? selected : []
  return h('div', { className: 'dui-q-list', role: 'group', 'aria-label': ui.t('Your answer') },
    optionsOf(node).map(option => h('div', { key: option.label, className: 'dui-q-opt' },
      h('span', { className: 'dui-q-body' },
        h('span', { className: 'dui-q-label' }, option.label),
        option.description ? h('span', { className: 'dui-q-desc' }, option.description) : null),
      chosen.includes(option.label) ? h('span', { className: 'dui-q-check', title: ui.t('Selected') }, h(CheckIcon)) : null)))
}

function ConfirmInput({ node, onSubmit, busy = false }) {
  const ui = useViewUi()
  return h('div', { className: 'dui-q-foot' },
    h('button', { type: 'button', className: 'dui-q-btn', disabled: busy, onClick: () => onSubmit?.(node.id, { confirmed: false }) }, node.cancelLabel ?? ui.t('Cancel')),
    h('button', { type: 'button', className: 'dui-q-submit', disabled: busy, onClick: () => onSubmit?.(node.id, { confirmed: true }) }, node.confirmLabel ?? ui.t('Confirm')))
}

function SettledConfirm({ node, answer }) {
  const ui = useViewUi()
  const confirmed = answerValues(answer, node)?.confirmed
  if (confirmed !== true && confirmed !== false) {
    return h('div', { className: 'dui-q-foot' },
      h('button', { type: 'button', className: 'dui-q-btn', disabled: true }, node.cancelLabel ?? ui.t('Cancel')),
      h('button', { type: 'button', className: 'dui-q-submit', disabled: true }, node.confirmLabel ?? ui.t('Confirm')))
  }
  const label = confirmed ? (node.confirmLabel ?? ui.t('Confirm')) : (node.cancelLabel ?? ui.t('Cancel'))
  return h('span', { className: 'dui-q-badge' }, label)
}

function FormInput({ node, onSubmit, busy = false }) {
  const ui = useViewUi()
  const fields = fieldsOf(node)
  const [draft, setDraft] = useState({})
  const submit = () => { if (!busy) onSubmit?.(node.id, { fields: Object.fromEntries(fields.map(field => [field.id, draft[field.id] ?? ''])) }) }
  return h('form', {
    className: 'dui-widget-form',
    onSubmit: (event) => { event.preventDefault(); submit() },
  },
  fields.map(field => h('label', { key: field.id, className: 'dui-widget-field' },
    h('span', { className: 'dui-widget-field-label' }, field.label),
    h('span', { className: 'dui-q-field' },
      h('input', {
        className: 'dui-q-input', type: 'text', value: draft[field.id] ?? '',
        autoComplete: 'off', spellCheck: false, readOnly: busy,
        'aria-label': field.label, placeholder: field.placeholder ?? undefined,
        onChange: (event) => { if (!busy) setDraft(current => ({ ...current, [field.id]: event.target.value })) },
        onKeyDown: (event) => {
          if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
          event.preventDefault()
          submit()
        },
      })))),
  h('div', { className: 'dui-q-foot' }, h('button', { type: 'submit', className: 'dui-q-submit', disabled: busy }, node.submitLabel ?? ui.t('Submit'))))
}

function SettledForm({ node, answer }) {
  const fields = answerValues(answer, node)?.fields
  const values = fields !== null && typeof fields === 'object' ? fields : {}
  return h('div', { className: 'dui-widget-form' },
    fieldsOf(node).map(field => h('label', { key: field.id, className: 'dui-widget-field' },
      h('span', { className: 'dui-widget-field-label' }, field.label),
      h('span', { className: 'dui-q-field' },
        h('input', { className: 'dui-q-input', type: 'text', value: values[field.id] ?? '', disabled: true, readOnly: true, 'aria-label': field.label })))))
}

function SubmitInput({ node, ctx }) {
  const ui = useViewUi()
  if (ctx.settled) return null
  return h('div', { className: 'dui-q-foot' },
    h('button', { type: 'button', className: 'dui-q-submit', disabled: ctx.busy, onClick: () => ctx.onSubmit?.(node.id, {}) }, node.label || ui.t('Send')))
}

function WidgetTable({ node, lookup }) {
  const columns = (Array.isArray(node.columns) ? node.columns : []).filter(column => column !== null && typeof column === 'object')
  const rows = (Array.isArray(node.rows) ? node.rows : []).map(row => (Array.isArray(row) ? row : []).map(cell => resolve(cell, lookup, '')))
  // A column of numbers lines up on the right.
  const numeric = columns.map((_, index) => {
    const cells = rows.map(row => row[index]).filter(cell => cell !== undefined && cell !== '')
    return cells.length > 0 && cells.every(cell => typeof cell === 'number' || (typeof cell === 'string' && NUMERIC_CELL.test(cell.trim())))
  })
  return h('div', { className: 'dui-widget-table' },
    h('table', null,
      h('thead', null, h('tr', null, columns.map((column, index) => h('th', { key: column.key ?? index, scope: 'col', className: numeric[index] ? 'dui-num' : undefined }, column.label)))),
      h('tbody', null, rows.map((row, rowIndex) => h('tr', { key: rowIndex },
        columns.map((column, columnIndex) => h('td', { key: column.key ?? columnIndex, className: numeric[columnIndex] ? 'dui-num' : undefined }, cellText(row[columnIndex]))))))))
}

function WidgetProgress({ node, lookup }) {
  const ui = useViewUi()
  let percent
  if (node.percent !== undefined) percent = Number(resolve(node.percent, lookup, 0))
  else {
    const max = Number(resolve(node.max, lookup, 0))
    percent = max > 0 ? (Number(resolve(node.value, lookup, 0)) / max) * 100 : 0
  }
  percent = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0))
  const tone = resolve(node.tone, lookup)
  const right = node.valueLabel !== undefined ? asText(resolve(node.valueLabel, lookup, '')) : `${Math.round(percent)}%`
  return h('div', { className: 'dui-widget-progress', 'data-tone': TONES.includes(tone) ? tone : undefined },
    h('span', { className: 'dui-widget-progress-label' }, h('span', { className: 'dui-widget-progress-name' }, node.label), h('span', null, right)),
    h('div', {
      className: 'dui-widget-progress-track', role: 'progressbar',
      'aria-valuenow': Math.round(percent), 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': node.label ?? ui.t('Progress'), 'aria-valuetext': right,
    }, h('div', { className: 'dui-widget-progress-fill', style: { width: `${percent}%` } })))
}

function WidgetMetric({ node, lookup }) {
  const tone = resolve(node.tone, lookup)
  const caption = node.caption === undefined ? '' : asText(resolve(node.caption, lookup, ''))
  return h('div', { className: 'dui-widget-metric', 'data-tone': TONES.includes(tone) ? tone : undefined },
    h('span', { className: 'dui-widget-metric-label' }, node.label),
    h('span', { className: 'dui-widget-metric-value' }, asText(resolve(node.value, lookup, '—'))),
    caption !== '' ? h('span', { className: 'dui-view-caption' }, caption) : null)
}

function WidgetCallout({ node, lookup }) {
  const ui = useViewUi()
  const tone = resolve(node.tone, lookup)
  return h('div', { className: 'dui-view-callout', 'data-tone': CALLOUT_TONES.includes(tone) ? tone : 'info' },
    h('span', { className: 'dui-view-callout-icon', 'aria-hidden': true }, h(InfoIcon)),
    h('div', { className: 'dui-view-callout-text' }, h(ui.Markdown, { text: asText(resolve(node.text, lookup, '')), labels: mdLabels(ui), variant: 'compact' })))
}

const LinkIcon = () => h('svg', { width: 12, height: 12, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
  h('path', { d: 'M8.5 11.5l3-3' }), h('path', { d: 'M7 9.5L5.5 11a2.5 2.5 0 0 0 3.5 3.5L10.5 13' }), h('path', { d: 'M13 10.5l1.5-1.5A2.5 2.5 0 0 0 11 5.5L9.5 7' }))

function WidgetSources({ node }) {
  const ui = useViewUi()
  const items = (Array.isArray(node.items) ? node.items : []).filter(item => typeof item?.url === 'string' && /^https?:\/\//i.test(item.url))
  return h('div', { className: 'dui-view-sources', role: 'list', 'aria-label': ui.t('Sources') },
    items.map((item, index) => h('a', { key: index, role: 'listitem', className: 'dui-view-source', href: item.url, target: '_blank', rel: 'noopener noreferrer', title: item.url }, h(LinkIcon), item.label)))
}

// -------------------------------------------------------------------------
// Inputs. Their values stay in the page; formulas read them on every change.

function InputHead({ id, label, value }) {
  return h('div', { className: 'dui-view-input-head' },
    h('label', { htmlFor: id, className: 'dui-view-input-label' }, label),
    value !== undefined ? h('output', { htmlFor: id, className: 'dui-view-input-value' }, value) : null)
}

const withUnit = (value, unit) => `${asText(value)}${unit ? ` ${unit}` : ''}`
const grouped = value => (typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('en-US', { maximumFractionDigits: 6 }) : asText(value))

function SliderInput({ node, ctx }) {
  const id = useId()
  const value = Number(ctx.values[node.id])
  const percent = node.max > node.min ? ((value - node.min) / (node.max - node.min)) * 100 : 0
  return h('div', { className: 'dui-view-input' },
    h(InputHead, { id, label: node.label, value: withUnit(grouped(value), node.unit) }),
    h('input', {
      id, type: 'range', className: 'dui-view-range', min: node.min, max: node.max, step: node.step ?? 'any', value,
      disabled: ctx.locked, style: { '--dui-fill': `${percent}%` },
      onChange: event => ctx.setInput(node.id, Number(event.target.value)),
    }))
}

function NumberInput({ node, ctx }) {
  const id = useId()
  const [draft, setDraft] = useState(null)
  const value = ctx.values[node.id]
  const accept = (raw) => {
    setDraft(raw)
    const next = Number(raw)
    if (raw.trim() === '' || !Number.isFinite(next)) return
    if ((node.min !== undefined && next < node.min) || (node.max !== undefined && next > node.max)) return
    ctx.setInput(node.id, next)
  }
  return h('div', { className: 'dui-view-input' },
    h(InputHead, { id, label: node.label }),
    h('span', { className: 'dui-q-field dui-view-number' },
      h('input', {
        id, className: 'dui-q-input', type: 'number', inputMode: 'decimal', value: draft ?? asText(value),
        min: node.min, max: node.max, step: node.step ?? 'any', disabled: ctx.locked,
        onChange: event => accept(event.target.value), onBlur: () => setDraft(null),
      }),
      node.unit ? h('span', { className: 'dui-view-unit' }, node.unit) : null))
}

// A few short options sit side by side; more, or longer ones, stack as a list.
function ChoiceInput({ node, ctx }) {
  const labelId = useId()
  const options = optionsOf(node)
  const current = ctx.values[node.id]
  const side = options.length <= 4 && options.every(option => [...option.label].length <= 14)
  const pick = option => () => { if (!ctx.locked) ctx.setInput(node.id, choiceValue(option)) }
  return h('div', { className: 'dui-view-input' },
    h('span', { className: 'dui-view-input-label', id: labelId }, node.label),
    side
      ? h(Segmented, { label: node.label, value: options.findIndex(option => choiceValue(option) === current), className: 'dui-view-seg' },
        options.map(option => h('button', { key: option.label, type: 'button', 'aria-pressed': choiceValue(option) === current, disabled: ctx.locked, onClick: pick(option) }, option.label)))
      : h('div', { className: 'dui-view-radios', role: 'radiogroup', 'aria-labelledby': labelId },
        options.map(option => h('button', {
          key: option.label, type: 'button', role: 'radio', className: 'dui-view-radio',
          'aria-checked': choiceValue(option) === current, disabled: ctx.locked, onClick: pick(option),
        }, h('span', { className: 'dui-view-radio-dot', 'aria-hidden': true }), option.label))))
}

function ToggleInput({ node, ctx }) {
  const on = ctx.values[node.id] === true
  return h('div', { className: 'dui-view-toggle' },
    h('span', { className: 'dui-view-input-label' }, node.label),
    h('button', { type: 'button', role: 'switch', className: 'dui-switch', 'aria-checked': on, 'aria-label': node.label, disabled: ctx.locked, onClick: () => ctx.setInput(node.id, !on) },
      h('span', { className: 'dui-switch-knob', 'aria-hidden': true })))
}

// One blueprint node. Unknown types render nothing: the host validates the
// blueprint, so what arrives here is known or safely ignored.
function WidgetNode({ node, ctx }) {
  const ui = useViewUi()
  if (node === null || typeof node !== 'object') return null
  const { lookup } = ctx
  switch (node.type) {
    case 'stack':
    case 'row': {
      const children = Array.isArray(node.children) ? node.children : []
      return h('div', { className: node.type === 'row' ? 'dui-view-row' : 'dui-widget-stack' },
        children.map((child, index) => h(WidgetNode, { key: child?.id ?? index, node: child, ctx })))
    }
    case 'text': {
      const text = h(ui.Markdown, { text: asText(resolve(node.text, lookup, '')), labels: mdLabels(ui), variant: 'compact' })
      return node.tone === 'muted' ? h('div', { className: 'dui-view-muted' }, text) : text
    }
    case 'metric': return h(WidgetMetric, { node, lookup })
    case 'table': return h(WidgetTable, { node, lookup })
    case 'chart': return h(WidgetChart, { node, lookup, registerChart: ctx.registerChart, refreshCharts: ctx.refreshCharts })
    case 'progress': return h(WidgetProgress, { node, lookup })
    case 'callout': return h(WidgetCallout, { node, lookup })
    case 'sources': return h(WidgetSources, { node })
    case 'html': return h(HtmlFrame, { node })
    case 'slider': return h(SliderInput, { node, ctx })
    case 'number': return h(NumberInput, { node, ctx })
    case 'choice': return h(ChoiceInput, { node, ctx })
    case 'toggle': return h(ToggleInput, { node, ctx })
    case 'submit': return h(SubmitInput, { node, ctx })
    case 'options': return ctx.settled ? h(SettledOptions, { node, answer: ctx.answer }) : h(OptionsInput, { node, onSubmit: ctx.onSubmit, keys: ctx.keys, busy: ctx.busy })
    case 'confirm': return ctx.settled ? h(SettledConfirm, { node, answer: ctx.answer }) : h(ConfirmInput, { node, onSubmit: ctx.onSubmit, busy: ctx.busy })
    case 'form': return ctx.settled ? h(SettledForm, { node, answer: ctx.answer }) : h(FormInput, { node, onSubmit: ctx.onSubmit, busy: ctx.busy })
    default: return null
  }
}

// A whole blueprint. Inputs start where the Bot set them; an answered view shows
// them as they were sent. Every answer carries the inputs' values. Letter keys
// answer a lone options block from the keyboard; with more than one in a card the
// same letter would hit both.
export function WidgetView({ view, onSubmit, settled = false, answer = null, busy = false, registerChart, refreshCharts }) {
  const inputs = viewInputs(view)
  const [values, setValues] = useState(() => Object.fromEntries(inputs.map(node => [node.id, inputDefault(node)])))
  const sent = answer?.values?.inputs
  const current = settled && sent !== null && typeof sent === 'object' ? { ...values, ...sent } : values
  const submit = (action, extra) => onSubmit?.(action, inputs.length > 0 ? { ...extra, inputs: current } : extra)
  const ctx = {
    onSubmit: submit, settled, answer, busy, keys: !settled && countType(view, 'options') === 1,
    lookup: viewScope(view, current), values: current, locked: settled || busy,
    setInput: (id, value) => setValues(before => ({ ...before, [id]: value })), registerChart, refreshCharts,
  }
  return h(WidgetNode, { node: view, ctx })
}

// A chart keeps its actions (table view, copy, save) in the card's ⋯ menu: each
// chart registers a handle in mount order and bumps the card so a table switch
// shows in the open menu's wording.
function useChartHandles() {
  const [, bump] = useState(0)
  const charts = useRef(new Map())
  const fns = useRef(null)
  if (fns.current === null) {
    const refresh = () => bump(value => value + 1)
    fns.current = {
      registerChart: (key, handle) => {
        charts.current.set(key, handle)
        refresh()
        return () => { charts.current.delete(key); refresh() }
      },
      refreshCharts: refresh,
    }
  }
  return { charts: [...charts.current.values()], ...fns.current }
}

// The dropdown's items: one flat list for a lone chart, one labelled group per
// chart otherwise.
export function ViewMenuList({ charts, pick }) {
  const ui = useViewUi()
  return h('div', { className: 'dui-menu dui-view-menu', role: 'menu' },
    charts.map((chart, index) => h(Fragment, { key: index },
      charts.length > 1 ? h(Fragment, null,
        index > 0 ? h('div', { className: 'dui-menu-sep', role: 'separator' }) : null,
        h('div', { className: 'dui-view-menu-label' }, chart.label ?? ui.t('Chart {n}', { n: index + 1 }))) : null,
      h('button', { type: 'button', role: 'menuitem', onClick: pick(chart.toggleTable) }, h(TableIcon), chart.asTable ? ui.t('View as chart') : ui.t('View as table')),
      h('button', { type: 'button', role: 'menuitem', onClick: pick(chart.copy) }, h(CopyIcon), ui.t('Copy data')),
      h('button', { type: 'button', role: 'menuitem', onClick: pick(chart.save) }, h(DownloadIcon), ui.t('Download image')))))
}

function ViewMenu({ charts }) {
  const ui = useViewUi()
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const away = (event) => { if (!root.current?.contains(event.target)) setOpen(false) }
    const key = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', away, true)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', away, true); document.removeEventListener('keydown', key) }
  }, [open])
  const pick = run => () => { setOpen(false); run() }
  return h('div', { ref: root, className: 'dui-view-tools', 'data-open': open ? '' : undefined },
    h('button', { type: 'button', className: 'dui-view-more', 'aria-label': ui.t('Chart options'), 'aria-haspopup': 'menu', 'aria-expanded': open, onClick: () => setOpen(value => !value) }, h(DotsIcon)),
    open ? h(ViewMenuList, { charts, pick }) : null)
}

// What every view wears. A view with controls is a light card; one that only shows
// sits in the reply without a frame. The title is an optional small heading, and a
// view that still waits for its answer has a dismiss button.
export function WidgetCard({ title, view, onSubmit, onDismiss, busy = false, raised = false, settled = false, answer = null }) {
  const ui = useViewUi()
  const titleId = useId()
  const { charts, registerChart, refreshCharts } = useChartHandles()
  const framed = raised || hasControls(view)
  const className = ['dui-view', framed ? 'dui-q' : 'dui-view-bare', settled ? 'dui-q-settled' : '', raised ? 'dui-q-raised' : ''].filter(Boolean).join(' ')
  const head = title || onDismiss || countType(view, 'chart') > 0
    ? h('div', { className: 'dui-view-head' },
      title ? h('p', { className: 'dui-view-title', id: titleId }, title) : h('span', { className: 'dui-view-title' }),
      countType(view, 'chart') > 0 ? h(ViewMenu, { charts }) : null,
      onDismiss ? h('button', { type: 'button', className: 'dui-q-x', 'aria-label': ui.t('Dismiss view'), title: ui.t('Dismiss'), onClick: onDismiss, disabled: busy }, h(CloseIcon)) : null)
    : null
  return h('div', {
    className, role: 'group', 'aria-labelledby': title ? titleId : undefined, 'aria-label': title ? undefined : ui.t('View'), 'aria-busy': busy || undefined,
  },
  head,
  h('div', { className: 'dui-view-body' }, h(WidgetView, { view, onSubmit, settled, answer, busy, registerChart, refreshCharts })))
}

// An answered view rides on the reply message itself: the settled card, read-only.
export function AnsweredView({ node }) {
  const data = node.data ?? {}
  let payload = null
  if (Array.isArray(data.views)) payload = data
  else {
    try { payload = typeof data.text === 'string' ? JSON.parse(data.text) : null } catch { payload = null }
    if (payload?.kind !== 'answer_to_pending_view') payload = null
  }
  const view = payload?.views?.[0]
  if (view === null || typeof view !== 'object' || view.view === undefined) return null
  const answers = Array.isArray(payload.answers) ? payload.answers : []
  const answer = answers.find(entry => entry?.id === view.id) ?? answers[0] ?? null
  return h('div', { className: 'dui-q-inline' }, h(WidgetCard, { title: view.title ?? '', view: view.view, settled: true, answer }))
}

export const WIDGET_CSS = `
.dui-view{min-width:0}
.dui-view-bare{display:flex;flex-direction:column;gap:8px;width:100%;color:var(--dui-ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;animation:dui-veil-in .2s ease-out backwards}
.dui-view-head{display:flex;align-items:flex-start;gap:8px;min-width:0}
.dui-view-title{flex:1 1 0;min-width:0;margin:0;font-size:13px;line-height:18px;font-weight:500;color:var(--dui-ink);overflow-wrap:anywhere}
.dui-q-settled .dui-view-title{color:var(--dui-ink-2)}
.dui-view-tools{position:relative;flex:none;align-self:flex-start;opacity:0;transition:opacity .12s ease}
.dui-view:hover .dui-view-tools,.dui-view-tools:focus-within,.dui-view-tools[data-open]{opacity:1}
@media (hover:none){.dui-view-tools{opacity:1}}
.dui-view-more{width:28px;height:28px;padding:0;border:0;border-radius:50%;background:none;color:var(--dui-ink-2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.dui-view-more:hover,.dui-view-tools[data-open] .dui-view-more{background:var(--dui-hover);color:var(--dui-ink)}
.dui-view-more:focus-visible{outline:2px solid var(--dui-accent);outline-offset:1px}
.dui-view-more svg{width:16px;height:16px}
.dui-menu.dui-view-menu{position:absolute;top:32px;right:0;--dui-origin:top right;min-width:180px}
.dui-menu.dui-view-menu button{gap:8px}
.dui-view-menu-label{padding:2px 8px;font-size:11px;line-height:14px;color:var(--dui-ink-3);white-space:nowrap}
.dui-view-body{min-width:0}
.dui-widget-stack{display:flex;flex-direction:column;gap:12px;min-width:0}
.dui-view-row{display:flex;flex-wrap:wrap;gap:12px 24px;min-width:0}
.dui-view-row>*{flex:1 1 160px;min-width:0}
.dui-widget-metric{display:flex;flex-direction:column;gap:1px;min-width:0}
.dui-widget-metric-label{font-size:12px;line-height:16px;color:var(--dui-ink-2)}
.dui-widget-metric-value{font-size:22px;line-height:28px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--dui-ink);overflow-wrap:anywhere}
.dui-widget-metric[data-tone=good] .dui-widget-metric-value{color:var(--dui-green)}
.dui-widget-metric[data-tone=warn] .dui-widget-metric-value{color:var(--dui-star)}
.dui-widget-metric[data-tone=bad] .dui-widget-metric-value{color:var(--dui-danger)}
.dui-view-caption{font-size:12px;line-height:16px;color:var(--dui-ink-2);overflow-wrap:anywhere}
.dui-view-muted{font-size:12px;line-height:16px;color:var(--dui-ink-2)}
.dui-view-muted *{font-size:inherit!important;line-height:inherit!important;color:inherit!important}
.dui-widget-table{max-width:100%;overflow-x:auto;border:.5px solid var(--dui-line-2);border-radius:10px}
.dui-widget-table table{border-collapse:collapse;min-width:100%;font-size:13px;line-height:18px}
.dui-widget-table th{padding:6px 10px;font-weight:500;text-align:start;white-space:nowrap;color:var(--dui-ink-2);border-bottom:.5px solid var(--dui-line-2)}
.dui-widget-table td{padding:6px 10px;max-width:280px;color:var(--dui-ink);overflow-wrap:anywhere}
.dui-widget-table tbody tr+tr>*{border-top:.5px solid var(--dui-line)}
.dui-widget-table .dui-num{text-align:end;font-variant-numeric:tabular-nums}
.dui-widget-form{display:flex;flex-direction:column;gap:8px;margin:0}
.dui-widget-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.dui-widget-field-label{font-size:12px;line-height:16px;color:var(--dui-ink-2)}
.dui-widget-field .dui-q-field:has(.dui-q-input:disabled){cursor:default;opacity:.75}
.dui-widget-progress{display:flex;flex-direction:column;gap:5px;min-width:0}
.dui-widget-progress-label{display:flex;justify-content:space-between;gap:8px;font-size:12px;line-height:16px;color:var(--dui-ink-2);font-variant-numeric:tabular-nums}
.dui-widget-progress-name{color:var(--dui-ink);font-weight:500}
.dui-widget-progress-track{height:6px;border-radius:999px;background:var(--dui-hover);overflow:hidden}
.dui-widget-progress-fill{height:100%;border-radius:inherit;background:var(--dui-accent);transition:width .12s ease,background-color .12s ease}
.dui-widget-progress[data-tone=good] .dui-widget-progress-fill{background:var(--dui-green)}
.dui-widget-progress[data-tone=warn] .dui-widget-progress-fill{background:var(--dui-star)}
.dui-widget-progress[data-tone=bad] .dui-widget-progress-fill{background:var(--dui-danger)}
.dui-widget-progress[data-tone=bad] .dui-widget-progress-label>span:last-child{color:var(--dui-danger)}
.dui-view-callout{display:flex;gap:8px;padding:8px 12px;border-radius:10px;--dui-tone:var(--dui-accent);background:color-mix(in srgb,var(--dui-tone) 8%,transparent);color:var(--dui-ink)}
.dui-view-callout[data-tone=good]{--dui-tone:var(--dui-green)}
.dui-view-callout[data-tone=warn]{--dui-tone:var(--dui-star)}
.dui-view-callout[data-tone=bad]{--dui-tone:var(--dui-danger)}
.dui-view-callout-icon{flex:none;display:flex;padding-top:3px;color:var(--dui-tone)}
.dui-view-callout-icon svg{width:16px;height:16px}
.dui-view-callout-text{flex:1 1 auto;min-width:0}
.dui-view-sources{display:flex;flex-wrap:wrap;gap:6px}
.dui-view-source{display:inline-flex;align-items:center;gap:4px;max-width:100%;height:20px;padding:0 6px;border-radius:4px;background:var(--dui-tag-bg,var(--dui-hover));color:var(--dui-ink-2);font-size:11px;line-height:16px;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:background-color .12s ease,color .12s ease}
.dui-view-source:hover{background:var(--dui-hover);color:var(--dui-ink)}
.dui-view-source:focus-visible{outline:2px solid var(--dui-accent);outline-offset:1px}
.dui-view-input{display:flex;flex-direction:column;gap:6px;min-width:0}
.dui-view-input-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.dui-view-input-label{font-size:12px;line-height:16px;color:var(--dui-ink-2)}
.dui-view-input-value{font-size:15px;line-height:20px;font-weight:600;color:var(--dui-ink);font-variant-numeric:tabular-nums}
.dui-view-range{-webkit-appearance:none;appearance:none;width:100%;height:20px;margin:0;background:transparent;cursor:pointer}
.dui-view-range:disabled{cursor:default;opacity:.6}
.dui-view-range::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:linear-gradient(to right,var(--dui-accent) var(--dui-fill,0%),var(--dui-hover) var(--dui-fill,0%))}
.dui-view-range::-moz-range-track{height:6px;border-radius:999px;background:var(--dui-hover)}
.dui-view-range::-moz-range-progress{height:6px;border-radius:999px;background:var(--dui-accent)}
.dui-view-range::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;margin-top:-5px;border-radius:50%;corner-shape:round;background:var(--dui-knob);box-shadow:0 1px 3px rgba(0,0,0,.25),0 0 0 .5px rgba(0,0,0,.12)}
.dui-view-range::-moz-range-thumb{width:16px;height:16px;border:0;border-radius:50%;background:var(--dui-knob);box-shadow:0 1px 3px rgba(0,0,0,.25),0 0 0 .5px rgba(0,0,0,.12)}
.dui-view-range:focus-visible{outline:2px solid var(--dui-accent);outline-offset:2px;border-radius:6px}
.dui-view-number{max-width:200px;align-items:center;gap:6px}
.dui-view-number .dui-q-input{font-variant-numeric:tabular-nums}
.dui-view-unit{flex:none;font-size:13px;color:var(--dui-ink-2)}
.dui-seg.dui-view-seg{align-self:flex-start;max-width:100%}
.dui-seg.dui-view-seg button{flex:none;padding:0 12px;white-space:nowrap}
.dui-view-radios{display:flex;flex-direction:column;gap:2px}
.dui-view-radio{display:flex;align-items:center;gap:8px;min-height:30px;padding:4px 8px;margin:0 -8px;border:0;border-radius:8px;background:none;font:inherit;font-size:14px;line-height:20px;color:var(--dui-ink);text-align:start;cursor:pointer;transition:background-color .12s ease}
.dui-view-radio:hover:not(:disabled){background:var(--dui-hover)}
.dui-view-radio:disabled{cursor:default}
.dui-view-radio:focus-visible{outline:2px solid var(--dui-accent);outline-offset:-2px}
.dui-view-radio-dot{flex:none;width:16px;height:16px;border-radius:50%;corner-shape:round;box-shadow:inset 0 0 0 1.5px var(--dui-line-2);transition:box-shadow .12s ease}
.dui-view-radio[aria-checked=true] .dui-view-radio-dot{box-shadow:inset 0 0 0 5px var(--dui-accent)}
.dui-view-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:28px}
.dui-view-toggle .dui-view-input-label{font-size:14px;line-height:20px;color:var(--dui-ink)}
.dui-q.dui-view{gap:10px}
.dui-q.dui-view:not(.dui-q-raised):not(.dui-q-settled)>.dui-view-head:has(.dui-view-title:empty){margin-bottom:-6px}
.dui-q-raised .dui-view-head{padding:14px 16px 4px 20px}
.dui-q-raised .dui-view-body{padding:0 16px 14px 20px}
.dui-q-raised .dui-view-body .dui-q-list{padding:0;margin:0 -8px}
.dui-q-inline .dui-view{margin:0;width:100%;max-width:min(100%,max(calc(var(--dui-msg-w,.8) * 100%),560px));order:0}
body[data-dui-layout=flat] .dui-q-inline .dui-view{max-width:calc(var(--dui-flat-w,1) * 100%)}
.dui-q-inline:has(>.dui-view-bare){margin:8px 0 12px}
@media (prefers-reduced-motion:reduce){.dui-widget-progress-fill,.dui-view-radio-dot,.dui-view-tools,.dui-view-more{transition:none}.dui-view-bare{animation:none}}
${CHART_CSS}
${HTML_CSS}
`
