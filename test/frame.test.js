import assert from 'node:assert/strict'
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
const { ViewUi } = await import('../src/react/ui.js')
const {
  HtmlFrame,
  MAX_FIT_HEIGHT,
  PAGE_ACTIVATION_MS,
  canIframeRequestFullscreen,
  frameDocument,
  recordHostInput,
  resetHostInputForTest,
  themeVars,
} = await import('../src/react/frame.js')

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
  assert.match(docDark, /<style>:root\{[^}]*color-scheme:dark\}html,body\{margin:0;padding:0;background:transparent/)
  assert.match(docDark, /requestAnimationFrame/)
  const docNormal = frameDocument('<p>hi</p>', { 'color-scheme': 'normal' })
  assert.match(docNormal, /<style>:root\{color-scheme:light\}/)
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
  } finally {
    if (origActive) Object.defineProperty(document, 'activeElement', origActive)
    else delete document.activeElement
    if (origUA) Object.defineProperty(navigator, 'userActivation', origUA)
    else delete navigator.userActivation
    iframe.remove()
    resetHostInputForTest()
  }
})
