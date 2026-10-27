// The show_view wire shape, shared by every host that registers the tool. A host
// puts its own wording around it: ds-bot speaks of the Bot's own chat, a plain
// agent's host of the chat.

export const showViewParameters = {
  title: { type: 'string', description: 'Optional short heading shown above the view' },
  view: {
    type: 'object',
    required: true,
    additionalProperties: true,
    description: 'One component { type, ...props }. Layout: stack (children, top to bottom) and row (children, side by side, wraps when narrow), 1 to 16 children; the outermost may define let: { name: "formula" }. Display: text ({ text: Markdown, tone?: "muted" }), metric ({ label, value, tone?: good|warn|bad, caption? }), table ({ columns: [{ key, label }], rows: [[cells]] }), chart ({ kind?: bar|hbar|line|area|donut, categories: [labels], series: [{ name?, values: [numbers] }], unit?, caption? }; donut takes one series), progress ({ label?, percent 0-100, or value with max, valueLabel?, tone? }), callout ({ text, tone?: info|good|warn|bad }), sources ({ items: [{ label, url }] }), html ({ html, summary, height? }: only for what nothing else can draw; it runs sandboxed with no network, cannot submit, and should use the CSS variables --view-ink, --view-ink-2, --view-line, --view-card, --view-accent, --view-green, --view-star, --view-danger). Inputs, which keep their value in the page: slider ({ id, label, min, max, step?, value, unit? }), number ({ id, label, value, min?, max?, step?, unit? }), choice ({ id, label, options: [{ label, value }], value? }), toggle ({ id, label, value? }); an input id is a plain name such as price. A metric value, caption or tone, a text, a progress field, a callout, a table cell or a chart value may be a formula { "=": "expression" } over input ids and let names: numbers, \'text\', + - * / %, < <= > >= == !=, && || !, a ? b : c, and min max abs floor ceil sqrt pow round clamp fixed(x, digits) format(x, digits) percent(x, digits). Answers, which end your turn: options ({ id, options: [{ label, description? }], multi? }), confirm ({ id, confirmLabel?, cancelLabel? }), form ({ id, fields: [{ id, label, placeholder? }], submitLabel? }), submit ({ id, label }: sends the inputs\' values to you).',
  },
  await_reply: { type: 'boolean', description: 'Wait for the user to submit the view. A view with options, confirm, form or submit always waits; a view without them cannot.' },
}

// `where` names the surface the view draws in: "the chat" here, "your own chat"
// for a host whose agents each own one.
export function showViewDescription({ where = 'the chat' } = {}) {
  return `Draw a view in ${where} as part of your reply: a chart, key numbers, a table, a small calculator the user can try values in, or a choice, confirmation or short form. Text you write before and after the call shows around it. Use a view when it answers better than text: a chart to compare values or show a trend, inputs with formulas to let the user try numbers (worked out in the page, no new turn), options to let the user pick. Plain rows and columns read fine as a Markdown table, and one number needs no view. Give the answer first, then the view. Never invent data; mark sample numbers and assumptions as such. Do not repeat the same data as text, chart and table. Add only the controls the user needs. A view with options, confirm, form or submit ends your turn, and the answer arrives as the user's next message. Never collect a key, token or password. Keep the view under 8 KB.`
}
