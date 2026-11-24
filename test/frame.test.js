import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import { findRootPercentHeight, findViewportHeightUnit, validateView } from '../src/core/views.js'
import { showViewParameters } from '../src/core/tool-schema.js'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement', 'SVGElement', 'Element', 'Node', 'MutationObserver', 'getComputedStyle', 'CustomEvent', 'Event', 'KeyboardEvent', 'MouseEvent', 'MessageEvent']) {
  if (dom.window[key] === undefined) continue
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true })
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { createElement: h, act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { ViewUi, useOptionKeys } = await import('../src/react/ui.js')
const {
  HTML_CSS,
  HtmlFrame,
  MAX_FIT_HEIGHT,
  PAGE_ACTIVATION_MS,
  canIframeRequestFullscreen,
  frameDocument,
  recordHostInput,
  resetHostInputForTest,
  themeVars,
} = await import('../src/react/frame.js')
const { ViewsTail } = await import('../src/client/tail.js')
const { viewsDefinition } = await import('../src/client/views-definition.js')
const { apply } = await import('../index.js')
const { fakeContext } = await import('./fake-ctx.js')

const ui = { t: key => key, Markdown: ({ text }) => h('span', null, String(text ?? '')) }

async function renderFrame(node) {
  const box = document.createElement('div')
  document.body.appendChild(box)
  const root = createRoot(box)
  await act(async () => { root.render(h(ViewUi.Provider, { value: ui }, h(HtmlFrame, { node }))) })
  return { box, root, unmount: () => act(async () => { root.unmount(); box.remove() }) }
}

function resetThemeAttrs() {
  document.body.removeAttribute('data-ds-dark-theme')
  document.body.removeAttribute('style')
  document.body.className = ''
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('style')
  document.documentElement.className = ''
}

test('findViewportHeightUnit detects [sld]?vh in <style> and style= forms without false positives', () => {
  // All viewport height unit variants (case-insensitive) in <style> and style=.
  assert.equal(findViewportHeightUnit('<style>.a{height:100vh}</style>'), '100vh')
  assert.equal(findViewportHeightUnit('<style>.a{min-height:50.5svh}</style>'), '50.5svh')
  assert.equal(findViewportHeightUnit('<style>.a{height:.5lvh}</style>'), '.5lvh')
  assert.equal(findViewportHeightUnit('<style>.a{height:calc(100DVH - 12px)}</style>'), '100DVH')
  assert.equal(findViewportHeightUnit('<div style="height: 80vh"></div>'), '80vh')
  assert.equal(findViewportHeightUnit("<div style='min-height: 40dvh'></div>"), '40dvh')
  assert.equal(findViewportHeightUnit('<div style=height:60svh></div>'), '60svh')
  assert.equal(findViewportHeightUnit('<div style=height:60lvh/>'), '60lvh')

  // Non-false-positives: comments, CSS comments, quoted strings, data URIs, identifiers, body text, script.
  assert.equal(findViewportHeightUnit('<!-- <div style="height:100vh"></div> --><div>ok</div>'), null)
  assert.equal(findViewportHeightUnit('<style>/* height: 100vh */ .a { height: 240px }</style>'), null)
  assert.equal(findViewportHeightUnit('<style>.a::after { content: "100vh"; --my-vh: 10; --10vh: 2; }</style>'), null)
  assert.equal(findViewportHeightUnit('<style>.a { background: url(data:image/png;base64,abc1vh+2vh/3dvh==); }</style>'), null)
  assert.equal(findViewportHeightUnit('<style>.a { background: url("data:image/png;base64,abc1vh"); }</style>'), null)
  assert.equal(findViewportHeightUnit('<p>Avoid 100vh in html views</p><script>const s = "<div style=height:100vh>";</script>'), null)
  assert.equal(findViewportHeightUnit('<div class="h-100vh" data-note="50dvh" style="height: 300px"></div>'), null)
})

test('findViewportHeightUnit stays linear-time on adversarial long inputs (ReDoS safety)', () => {
  const longOpenComment = `<!--${'a'.repeat(100_000)}`
  const longStyle = `<style>${'/* '.repeat(10_000)}${'a'.repeat(50_000)}</style>`
  const longAttrs = `<div ${'data-x="1" '.repeat(5_000)} style="${'color:red;'.repeat(5_000)}">`
  const start = performance.now()
  assert.equal(findViewportHeightUnit(longOpenComment), null)
  assert.equal(findViewportHeightUnit(longStyle), null)
  assert.equal(findViewportHeightUnit(longAttrs), null)
  const elapsed = performance.now() - start
  assert.ok(elapsed < 500, `expected linear-time scan (<500ms), took ${elapsed.toFixed(1)}ms`)
})

test('findRootPercentHeight and validateView reject vh units and root html/body 100% height', () => {
  assert.equal(findRootPercentHeight('<style>html, body { height: 100%; }</style>'), 'height: 100%')
  assert.equal(findRootPercentHeight('<style>body { min-height: 100% !important; }</style>'), 'min-height: 100%')
  assert.equal(findRootPercentHeight('<style>@media screen { html { height: 100% } }</style>'), 'height: 100%')
  assert.equal(findRootPercentHeight('<body style="height: 100%"><div>hi</div></body>'), 'height: 100%')
  assert.equal(findRootPercentHeight('<html style=\'min-height:100%\'></html>'), 'min-height: 100%')

  // Descendants, non-root elements, line-height, and keyframes must stay allowed.
  assert.equal(findRootPercentHeight('<style>body .chart { height: 100%; } .body { height: 100%; }</style>'), null)
  assert.equal(findRootPercentHeight('<style>body { line-height: 100%; max-height: 100%; height: 240px; }</style>'), null)
  assert.equal(findRootPercentHeight('<style>body { .inner { height: 100%; } }</style>'), null)
  assert.equal(findRootPercentHeight('<style>@keyframes grow { to { height: 100%; } }</style>'), null)
  assert.equal(findRootPercentHeight('<div style="height: 100%"><canvas style="height: 100%"></canvas></div>'), null)

  const vhErr = validateView({ type: 'html', html: '<div style="height:100dvh"></div>', summary: 'Chart' })
  assert.equal(vhErr.ok, false)
  assert.match(vhErr.error, /view\.html: viewport height unit "100dvh" is not allowed.*fixed px/i)

  const rootErr = validateView({ type: 'html', html: '<style>body{height:100%}</style><div>hi</div>', summary: 'Chart' })
  assert.equal(rootErr.ok, false)
  assert.match(rootErr.error, /view\.html: "height: 100%" on html\/body is not allowed.*fixed px/i)

  const ok = validateView({ type: 'html', html: '<style>.box{height:240px}</style><div class="box"></div>', summary: 'Chart' })
  assert.deepEqual(ok, { ok: true, interactive: false })
  assert.match(showViewParameters.view.description, /vh\/svh\/lvh\/dvh/)
})

test('themeVars resolves dark/light fallback chain and never falls back to normal', () => {
  resetThemeAttrs()
  assert.equal(themeVars()['color-scheme'], 'light')

  document.body.setAttribute('data-ds-dark-theme', '')
  assert.equal(themeVars()['color-scheme'], 'dark')

  resetThemeAttrs()
  document.documentElement.classList.add('dark')
  assert.equal(themeVars()['color-scheme'], 'dark')

  resetThemeAttrs()
  document.documentElement.setAttribute('data-theme', 'dark')
  assert.equal(themeVars()['color-scheme'], 'dark')

  resetThemeAttrs()
  document.documentElement.style.setProperty('color-scheme', 'dark')
  assert.equal(themeVars()['color-scheme'], 'dark')

  document.body.style.setProperty('color-scheme', 'light')
  assert.equal(themeVars()['color-scheme'], 'light')

  document.body.style.setProperty('color-scheme', 'normal')
  assert.equal(themeVars()['color-scheme'], 'dark')

  resetThemeAttrs()
  const docDark = frameDocument('<p>hi</p>', { 'color-scheme': 'dark', '--view-ink': '#fff' })
  assert.match(docDark, /<style id="dv-theme">:root\{[^}]*color-scheme:dark\}<\/style><style>html,body\{margin:0;padding:0;background:transparent/)
  assert.match(docDark, /requestAnimationFrame/)
  const docNormal = frameDocument('<p>hi</p>', { 'color-scheme': 'normal' })
  assert.match(docNormal, /<style id="dv-theme">:root\{color-scheme:light\}<\/style>/)
})

test('HtmlFrame clamps reported height to [24, MAX_FIT_HEIGHT], updates colorScheme reactively without reloading srcDoc', async () => {
  resetThemeAttrs()
  document.body.setAttribute('data-ds-dark-theme', '')
  const { box, unmount } = await renderFrame({ type: 'html', html: '<p>chart</p>', summary: 'Sales chart', height: 150 })
  const iframe = box.querySelector('iframe.dv-view-frame')
  assert.ok(iframe)
  const initialSrcDoc = iframe.getAttribute('srcdoc')
  assert.equal(iframe.style.colorScheme, 'dark')
  assert.equal(iframe.style.height, '150px')

  // Height message clamps both above MAX_FIT_HEIGHT and below MIN_HEIGHT.
  await act(async () => {
    window.dispatchEvent(new MessageEvent('message', {
      source: iframe.contentWindow,
      data: { type: 'dv-view-height', height: 999_999 },
    }))
  })
  assert.equal(iframe.style.height, `${MAX_FIT_HEIGHT}px`)
  assert.equal(box.querySelector('.dv-view-frame-slot').style.height, `${MAX_FIT_HEIGHT}px`)

  await act(async () => {
    window.dispatchEvent(new MessageEvent('message', {
      source: iframe.contentWindow,
      data: { type: 'dv-view-height', height: 4 },
    }))
  })
  assert.equal(iframe.style.height, '24px')

  // Switching theme via documentElement updates iframe colorScheme without regenerating srcDoc.
  const posted = []
  const origPost = iframe.contentWindow.postMessage.bind(iframe.contentWindow)
  iframe.contentWindow.postMessage = (msg, target) => { posted.push(msg); origPost(msg, target) }
  await act(async () => {
    document.body.removeAttribute('data-ds-dark-theme')
    await new Promise(resolve => setTimeout(resolve, 10))
  })
  assert.equal(iframe.style.colorScheme, 'light')
  assert.equal(iframe.getAttribute('srcdoc'), initialSrcDoc, 'srcDoc must not change on theme switch')
  assert.ok(posted.some(m => m?.type === 'dv-view-theme' && m.vars['color-scheme'] === 'light'))

  await act(async () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    await new Promise(resolve => setTimeout(resolve, 10))
  })
  assert.equal(iframe.style.colorScheme, 'dark')
  assert.equal(iframe.getAttribute('srcdoc'), initialSrcDoc, 'srcDoc must not change on html data-theme switch')

  await unmount()
  resetThemeAttrs()
})

test('HtmlFrame preserves the same iframe element across fullscreen enter/exit (fallback and popover)', async () => {
  resetThemeAttrs()
  const { box, unmount } = await renderFrame({ type: 'html', html: '<p>interactive</p>', summary: 'Canvas demo', height: 220 })
  const iframeBefore = box.querySelector('iframe.dv-view-frame')
  const parentBefore = iframeBefore.parentElement
  assert.ok(iframeBefore)

  // Enter fullscreen (jsdom has no popover, exercises fixed-overlay fallback).
  const expandBtn = box.querySelector('button.dv-view-frame-expand')
  assert.ok(expandBtn)
  await act(async () => { expandBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
  assert.equal(parentBefore.hasAttribute('data-dv-fullscreen'), true)
  assert.equal(box.querySelector('iframe.dv-view-frame'), iframeBefore, 'same iframe DOM node in fullscreen')
  assert.equal(iframeBefore.parentElement, parentBefore, 'same parent DOM node in fullscreen')
  assert.equal(box.querySelector('.dv-view-frame-title')?.textContent, 'Canvas demo')
  assert.equal(box.querySelector('.dv-view-frame-slot').style.height, '220px', 'slot height locked during fullscreen')

  // Height messages arriving while fullscreen must not disturb locked inline slot height.
  await act(async () => {
    window.dispatchEvent(new MessageEvent('message', {
      source: iframeBefore.contentWindow,
      data: { type: 'dv-view-height', height: 900 },
    }))
  })
  assert.equal(box.querySelector('.dv-view-frame-slot').style.height, '220px')

  // Escape closes fallback fullscreen cleanly without remounting iframe.
  await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
  assert.equal(parentBefore.hasAttribute('data-dv-fullscreen'), false)
  assert.equal(box.querySelector('iframe.dv-view-frame'), iframeBefore, 'same iframe DOM node after exit')
  assert.equal(iframeBefore.parentElement, parentBefore, 'same parent DOM node after exit')

  await unmount()
})

test('HtmlFrame uses native popover="auto" showPopover/hidePopover and toggle event without remounting iframe', async () => {
  resetThemeAttrs()
  const proto = HTMLElement.prototype
  let popoverOpen = false
  let showCalls = 0
  let hideCalls = 0
  const origMatches = proto.matches
  Object.defineProperty(proto, 'popover', { configurable: true, writable: true, value: null })
  Object.defineProperty(proto, 'showPopover', {
    configurable: true,
    value() {
      showCalls += 1
      popoverOpen = true
      const ev = new Event('toggle')
      ev.newState = 'open'
      this.dispatchEvent(ev)
    },
  })
  Object.defineProperty(proto, 'hidePopover', {
    configurable: true,
    value() {
      hideCalls += 1
      popoverOpen = false
      const ev = new Event('toggle')
      ev.newState = 'closed'
      this.dispatchEvent(ev)
    },
  })
  proto.matches = function matches(selector) {
    if (selector === ':popover-open') return popoverOpen
    return origMatches.call(this, selector)
  }

  try {
    const { box, unmount } = await renderFrame({ type: 'html', html: '<p>top layer</p>', summary: 'Top layer view', height: 200 })
    const frameBox = box.querySelector('.dv-view-frame-box')
    const iframeBefore = box.querySelector('iframe.dv-view-frame')
    assert.equal(frameBox.getAttribute('popover'), 'auto')

    await act(async () => { box.querySelector('button.dv-view-frame-expand').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    assert.equal(showCalls, 1)
    assert.equal(frameBox.hasAttribute('data-dv-fullscreen'), true)
    assert.equal(box.querySelector('iframe.dv-view-frame'), iframeBefore)
    assert.equal(iframeBefore.parentElement, frameBox)

    await act(async () => { box.querySelector('.dv-view-frame-bar button.dv-view-frame-btn').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    assert.equal(hideCalls, 1)
    assert.equal(frameBox.hasAttribute('data-dv-fullscreen'), false)
    assert.equal(box.querySelector('iframe.dv-view-frame'), iframeBefore)
    await unmount()
  } finally {
    delete proto.popover
    delete proto.showPopover
    delete proto.hidePopover
    proto.matches = origMatches
  }
})

test('canIframeRequestFullscreen enforces focus, userActivation, and 5s host input cooldown', () => {
  resetHostInputForTest()
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  const origActive = Object.getOwnPropertyDescriptor(document, 'activeElement')
  const origUA = Object.getOwnPropertyDescriptor(navigator, 'userActivation')
  let activeEl = document.body
  let ua = { isActive: true }
  Object.defineProperty(document, 'activeElement', { configurable: true, get: () => activeEl })
  Object.defineProperty(navigator, 'userActivation', { configurable: true, get: () => ua })

  try {
    assert.equal(PAGE_ACTIVATION_MS, 5_000)
    // Not focused -> denied.
    assert.equal(canIframeRequestFullscreen(iframe, 10_000), false)

    // Focused + userActivation + no recent host input -> allowed.
    activeEl = iframe
    assert.equal(canIframeRequestFullscreen(iframe, 10_000), true)

    // Missing or inactive userActivation -> denied.
    ua = { isActive: false }
    assert.equal(canIframeRequestFullscreen(iframe, 10_000), false)
    ua = undefined
    assert.equal(canIframeRequestFullscreen(iframe, 10_000), false)
    ua = { isActive: true }

    // Host input starts 5s cooldown -> denied inside window, allowed at >= 5000ms.
    recordHostInput(10_000)
    assert.equal(canIframeRequestFullscreen(iframe, 10_000), false)
    assert.equal(canIframeRequestFullscreen(iframe, 14_999), false)
    assert.equal(canIframeRequestFullscreen(iframe, 15_000), true)

    // Non-finite timestamps fail closed and never poison lastHostInputAt.
    assert.equal(canIframeRequestFullscreen(iframe, Number.POSITIVE_INFINITY), false)
    assert.equal(canIframeRequestFullscreen(iframe, Number.NaN), false)
    assert.equal(canIframeRequestFullscreen(iframe, Number.NEGATIVE_INFINITY), false)
    recordHostInput(Number.NaN)
    recordHostInput(Number.POSITIVE_INFINITY)
    assert.equal(canIframeRequestFullscreen(iframe, 15_000), true)
  } finally {
    if (origActive) Object.defineProperty(document, 'activeElement', origActive)
    else delete document.activeElement
    if (origUA) Object.defineProperty(navigator, 'userActivation', origUA)
    else delete navigator.userActivation
    iframe.remove()
    resetHostInputForTest()
  }
})

test('static CSS parser handles non-ASCII uppercase, RCDATA tags, unary/slash vh, grouped root selectors, and pseudo-elements', () => {
  // Non-ASCII U+0130 ('İ') must not shift offsets for subsequent style= or <style>.
  assert.equal(findViewportHeightUnit('<p>İstanbul</p><div style="height:100vh"></div>'), '100vh')
  assert.equal(findRootPercentHeight('<p>İstanbul</p><style>BODY { height: 100% }</style>'), 'height: 100%')

  // <textarea> and <title> literal text is skipped, while opening-tag style= is still checked.
  assert.equal(findViewportHeightUnit('<title><div style="height:100vh"></div></title><textarea><style>.x{height:100vh}</style></textarea>'), null)
  assert.equal(findViewportHeightUnit('<textarea style="height: 80vh">ok</textarea>'), '80vh')

  // Unary +, slash-delimited shorthand, and calc expressions are caught.
  assert.equal(findViewportHeightUnit('<style>.a{height:+100vh}</style>'), '+100vh')
  assert.equal(findViewportHeightUnit('<style>.a{font:14px/100vh sans-serif}</style>'), '100vh')
  assert.equal(findViewportHeightUnit('<style>.a{height:-50svh}</style>'), '-50svh')

  // Grouped :where/:is root selectors, trailing whitespace/comments before , or ), nested @media / &, and spaced ! important are caught.
  assert.equal(findRootPercentHeight('<style>:where(html, body) { height: 100%; }</style>'), 'height: 100%')
  assert.equal(findRootPercentHeight('<style>html , .card { height: 100%; }</style>'), 'height: 100%')
  assert.equal(findRootPercentHeight('<style>:is(body ) { height: 100%; }</style>'), 'height: 100%')
  assert.equal(findRootPercentHeight('<style>:where(\n  .card,\n  body\n) { height: 100%; }</style>'), 'height: 100%')
  assert.equal(findRootPercentHeight('<style>html/* note */, div { height: 100%; }</style>'), 'height: 100%')
  assert.equal(findRootPercentHeight('<style>:is(html, .card) { min-height: 100% ! important; }</style>'), 'min-height: 100%')
  assert.equal(findRootPercentHeight('<style>body { @media screen { height: 100%; } }</style>'), 'height: 100%')
  assert.equal(findRootPercentHeight('<style>body { &:hover { height: 100%; } }</style>'), 'height: 100%')

  // Qualified pseudo-elements, :is(html)::before, and :not(body) must NOT be falsely rejected.
  assert.equal(findRootPercentHeight('<style>body.has-hero::before { height: 100%; }</style>'), null)
  assert.equal(findRootPercentHeight('<style>:is(html, body)::before { height: 100%; }</style>'), null)
  assert.equal(findRootPercentHeight('<style>body:after { height: 100%; }</style>'), null)
  assert.equal(findRootPercentHeight('<style>:not(body) { height: 100%; }</style>'), null)

  // Deeply nested :is(...) must stay strictly O(n) with zero call-stack overflow.
  const deepNested = `<style>${':is('.repeat(20_000)}body${')'.repeat(20_000)} { height: 100%; }</style>`
  const t0 = performance.now()
  assert.equal(findRootPercentHeight(deepNested), 'height: 100%')
  const elapsed = performance.now() - t0
  assert.ok(elapsed < 500, `expected linear-time scan on 20k nested :is() (<500ms), took ${elapsed.toFixed(1)}ms`)
})

test('frameDocument theme sync updates #dv-theme stylesheet so card :root overrides stay intact', () => {
  const doc = frameDocument('<style>:root{--view-ink:#111}</style><p>hi</p>', { 'color-scheme': 'dark', '--view-ink': '#fff', '--view-card': '#16181d' })
  const inner = new JSDOM(doc, {
    runScripts: 'dangerously',
    url: 'http://localhost/',
    beforeParse(win) { win.ResizeObserver = class { observe() {} } },
  })
  try {
    const win = inner.window
    const themeRule = win.document.getElementById('dv-theme')?.sheet?.cssRules?.[0]
    assert.ok(themeRule, '#dv-theme stylesheet rule must exist')
    // Simulate a dv-view-theme postMessage from parent.
    win.dispatchEvent(new win.MessageEvent('message', {
      source: win.parent,
      data: { type: 'dv-view-theme', vars: { 'color-scheme': 'light', '--view-ink': '#eee', '--view-card': '#fafafa' } },
    }))
    // Theme updates the default stylesheet rule, NEVER documentElement inline style.
    assert.equal(win.document.documentElement.style.getPropertyValue('--view-ink'), '', 'must not set inline style on documentElement')
    assert.equal(themeRule.style.getPropertyValue('--view-card').trim(), '#fafafa')
    assert.equal(themeRule.style.getPropertyValue('color-scheme').trim(), 'light')
    // Card's later <style>:root{--view-ink:#111}</style> wins in cascade order.
    assert.equal(win.getComputedStyle(win.document.documentElement).getPropertyValue('--view-ink').trim(), '#111')
  } finally {
    inner.window.close()
  }
})

test('historical accepted 100vh HTML cards still replay in ViewsTail while newly refused calls are excluded', async (t) => {
  const home = mkdtempSync(join(tmpdir(), 'dv-replay-'))
  t.after(() => rmSync(home, { recursive: true, force: true }))
  const ctx = fakeContext()
  apply(ctx, { home })
  const tool = ctx.registeredTools.get('show_view')
  const legacyHtml = { type: 'html', html: '<div style="height:100vh">Legacy chart</div>', summary: 'Legacy chart' }

  // New host tool call rejects 100vh and marks presentationMeta as rejected.
  const refusedText = await tool.execute({ title: 'New', view: legacyHtml }, { agent: { id: 'a1', session: { id: 's1' } } })
  assert.match(refusedText, /viewport height unit "100vh" is not allowed/i)
  assert.deepEqual(tool.output.presentationMeta({ view: legacyHtml }, refusedText), { owner: 'deep-view', rejected: true })
  assert.deepEqual(tool.output.presentationMeta({ view: legacyHtml }, 'The view is on screen.'), { owner: 'deep-view' })

  // viewsDefinition keeps a pre-upgrade accepted call and drops a post-upgrade rejected call.
  const events = [
    { type: 'turn/start', seq: 1, data: { turn: 1 } },
    { type: 'tool/call', seq: 2, data: { turn: 1, step: 1, callId: 'legacy-1', name: 'show_view', arguments: JSON.stringify({ title: 'Old Chart', view: legacyHtml }) } },
    { type: 'tool/result', seq: 3, data: { turn: 1, step: 1, meta: { owner: 'deep-view' }, message: { source: { callId: 'legacy-1' }, content: [{ type: 'text', text: 'The view is on screen.' }] } } },
    { type: 'tool/call', seq: 4, data: { turn: 1, step: 2, callId: 'refused-2', name: 'show_view', arguments: JSON.stringify({ title: 'Refused Chart', view: legacyHtml }) } },
    { type: 'tool/result', seq: 5, data: { turn: 1, step: 2, meta: { owner: 'deep-view', rejected: true }, message: { source: { callId: 'refused-2' }, content: [{ type: 'text', text: refusedText }] } } },
  ]
  let state
  for (const event of events) {
    const matched = viewsDefinition.match(event)
    if (matched.role === 'start') state = viewsDefinition.start({ state }, { event, role: 'start' })
    else state = viewsDefinition.update({ state }, { event, role: 'update' })
  }
  const turnData = viewsDefinition.buildLocationData({ state }, 'turn', null)
  assert.deepEqual(turnData.value.views.map(v => v.callId), ['legacy-1'])

  // ViewsTail renders the historical accepted card instead of hiding it.
  const turn = {
    data: {
      get: key => (key === 'deep-view-views' ? turnData.value : undefined),
      source: () => ({ getSnapshot: () => turnData.value, subscribe: () => () => {} }),
    },
  }
  const box = document.createElement('div')
  document.body.appendChild(box)
  const root = createRoot(box)
  try {
    await act(async () => {
      root.render(h(ViewUi.Provider, { value: ui }, h(ViewsTail, { turn, sessionId: 's1', useConversation: () => undefined })))
    })
    assert.ok(box.querySelector('iframe.dv-view-frame'), 'historical 100vh card must still render on replay')
  } finally {
    await act(async () => { root.unmount(); box.remove() })
  }
})

test('HTML_CSS keeps fallback rules separate from :popover-open and HtmlFrame handles async toggle height lock, dialog semantics, focus restore, and listener cleanup', async () => {
  // No comma-separated CSS rule may mix :popover-open with non-popover selectors.
  for (const rule of HTML_CSS.split('}')) {
    const brace = rule.indexOf('{')
    if (brace === -1) continue
    const selector = rule.slice(0, brace)
    if (selector.includes(':popover-open')) {
      assert.equal(selector.includes(','), false, `selector mixing :popover-open in a comma list breaks non-popover browsers: ${selector}`)
    }
  }
  assert.match(HTML_CSS, /\.dv-view-frame-box\.dv-view-frame-box--fallback\{[^}]*position:fixed/)
  assert.match(HTML_CSS, /\.dv-view-frame-box\.dv-view-frame-box--fallback \.dv-view-frame\{[^}]*height:100%/)

  // Verify reference-counted host input listeners are removed on last unmount.
  const added = []
  const removed = []
  const origAdd = window.addEventListener.bind(window)
  const origRemove = window.removeEventListener.bind(window)
  window.addEventListener = (type, fn, opts) => { added.push(type); return origAdd(type, fn, opts) }
  window.removeEventListener = (type, fn, opts) => { removed.push(type); return origRemove(type, fn, opts) }

  try {
    const a = await renderFrame({ type: 'html', html: '<p>a</p>', summary: 'A', height: 180 })
    const b = await renderFrame({ type: 'html', html: '<p>b</p>', summary: 'B', height: 180 })
    assert.equal(added.filter(t => t === 'pointerdown').length, 1, 'host input listeners attached once across frames')
    await a.unmount()
    assert.equal(removed.filter(t => t === 'pointerdown').length, 0, 'listeners stay active while another frame is mounted')
    await b.unmount()
    assert.equal(removed.filter(t => t === 'pointerdown').length, 1, 'listeners removed after last frame unmounts')
  } finally {
    window.addEventListener = origAdd
    window.removeEventListener = origRemove
  }

  // Test native popover: delayed toggle height lock, dialog role suppressing useOptionKeys,
  // focus restore on native Escape/light-dismiss, and popover fallback when showPopover throws.
  const proto = HTMLElement.prototype
  let popoverOpen = false
  let pendingToggle = null
  let shouldThrow = false
  const origMatches = proto.matches
  Object.defineProperty(proto, 'popover', { configurable: true, writable: true, value: null })
  Object.defineProperty(proto, 'showPopover', {
    configurable: true,
    value() {
      if (shouldThrow) throw new Error('blocked')
      popoverOpen = true
      pendingToggle = () => {
        const ev = new Event('toggle')
        ev.newState = 'open'
        this.dispatchEvent(ev)
      }
    },
  })
  Object.defineProperty(proto, 'hidePopover', {
    configurable: true,
    value() {
      popoverOpen = false
      const ev = new Event('toggle')
      ev.newState = 'closed'
      this.dispatchEvent(ev)
    },
  })
  proto.matches = function matches(selector) {
    if (selector === ':popover-open') return popoverOpen
    return origMatches.call(this, selector)
  }

  const picks = []
  const ownRef = { current: null }
  const HostWithKeys = ({ node }) => {
    useOptionKeys(2, idx => picks.push(idx), ownRef)
    return h(HtmlFrame, { node })
  }

  const box = document.createElement('div')
  document.body.appendChild(box)
  const root = createRoot(box)
  try {
    await act(async () => {
      root.render(h(ViewUi.Provider, { value: ui }, h(HostWithKeys, { node: { type: 'html', html: '<p>top</p>', summary: 'Top', height: 210 } })))
    })
    const frameBox = box.querySelector('.dv-view-frame-box')
    const iframe = box.querySelector('iframe.dv-view-frame')

    // Click fullscreen twice rapidly before async toggle fires: second click must NOT throw into fallback.
    await act(async () => {
      const btn = box.querySelector('button.dv-view-frame-expand')
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    assert.equal(frameBox.classList.contains('dv-view-frame-box--fallback'), false)
    // Resize arriving BEFORE async toggle must NOT clobber the locked inline height (210px).
    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', {
        source: iframe.contentWindow,
        data: { type: 'dv-view-height', height: 950 },
      }))
    })
    assert.equal(box.querySelector('.dv-view-frame-slot').style.height, '210px')

    // Now fire async toggle('open').
    await act(async () => { pendingToggle?.() })
    assert.equal(frameBox.getAttribute('role'), 'dialog')
    assert.equal(frameBox.getAttribute('aria-modal'), 'true')
    assert.equal(frameBox.getAttribute('aria-label'), 'Top')

    // While dialog is open, useOptionKeys must stay quiet on bare letter keys.
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', bubbles: true })) })
    assert.deepEqual(picks, [])

    // Simulate browser-native Escape / light-dismiss (fires toggle closed directly without clicking Close).
    popoverOpen = false
    await act(async () => {
      const ev = new Event('toggle')
      ev.newState = 'closed'
      frameBox.dispatchEvent(ev)
    })
    assert.equal(frameBox.getAttribute('role'), null)
    assert.equal(document.activeElement, box.querySelector('button.dv-view-frame-expand'), 'native Escape/light-dismiss must restore focus to expand button')

    // Light-dismiss when user focused an external control must keep focus on that external control.
    const outsideInput = document.createElement('input')
    document.body.appendChild(outsideInput)
    try {
      await act(async () => { box.querySelector('button.dv-view-frame-expand').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
      await act(async () => { pendingToggle?.() })
      outsideInput.focus()
      popoverOpen = false
      await act(async () => {
        const ev = new Event('toggle')
        ev.newState = 'closed'
        frameBox.dispatchEvent(ev)
      })
      assert.equal(document.activeElement, outsideInput, 'light-dismiss must not steal focus from an external focused control')
    } finally {
      outsideInput.remove()
    }

    // If showPopover() throws on a popover-capable browser, fallback removes popover attr so box stays visible.
    shouldThrow = true
    await act(async () => { box.querySelector('button.dv-view-frame-expand').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    assert.equal(frameBox.classList.contains('dv-view-frame-box--fallback'), true)
    assert.equal(frameBox.hasAttribute('popover'), false, 'fallback mode must omit popover attr so UA popover rules cannot hide it')
  } finally {
    await act(async () => { root.unmount(); box.remove() })
    delete proto.popover
    delete proto.showPopover
    delete proto.hidePopover
    proto.matches = origMatches
  }
})
