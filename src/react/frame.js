import { createElement as h, useEffect, useMemo, useRef, useState } from 'react'
import { CloseIcon, ExpandIcon, useViewUi } from './ui.js'

// -------------------------------------------------------------------------
// The html component of a view, for what the catalog cannot draw. The markup an
// agent wrote runs in a sandboxed frame: scripts only (no same-origin, so no
// access to the app, its storage or its API), and a policy written ahead of the
// markup that blocks every network request. The frame reports its height and
// takes theme colors; it has no way to answer the agent. A frame that navigates
// away is stopped.

// Read off the page's --dv-* tokens; the frame gets them under the --view-*
// names the tool description teaches, with the legacy --bt-* names as aliases
// for blueprints written before the rename.
const THEME_VARS = [
  ['--view-ink', '--bt-ink', '--dv-ink'],
  ['--view-ink-2', '--bt-ink-2', '--dv-ink-2'],
  ['--view-ink-3', '--bt-ink-3', '--dv-ink-3'],
  ['--view-line', '--bt-line', '--dv-line'],
  ['--view-line-2', '--bt-line-2', '--dv-line-2'],
  ['--view-card', '--bt-card', '--dv-card'],
  ['--view-main', '--bt-main', '--dv-main'],
  ['--view-hover', '--bt-hover', '--dv-hover'],
  ['--view-accent', '--bt-accent', '--dv-accent'],
  ['--view-accent-ink', '--bt-accent-ink', '--dv-accent-ink'],
  ['--view-green', '--bt-green', '--dv-green'],
  ['--view-star', '--bt-star', '--dv-star'],
  ['--view-danger', '--bt-danger', '--dv-danger'],
]
export const FRAME_POLICY = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; form-action 'none'; base-uri 'none'"
const HEIGHT = 'dv-view-height'
const THEME = 'dv-view-theme'
const MIN_HEIGHT = 24
export const MAX_FIT_HEIGHT = 20_000
export const PAGE_ACTIVATION_MS = 5_000
export const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype

const supportsPopover = () => typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype
const clampHeight = value => Math.min(MAX_FIT_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(value)))

const HOST_INPUT_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'keydown']
let lastHostInputAt = -Infinity
let hostInputRefCount = 0
let hostInputListener = null

const nowMs = () => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now())

export function recordHostInput(now = nowMs()) {
  if (!Number.isFinite(now)) return
  lastHostInputAt = now
}

export function resetHostInputForTest() {
  lastHostInputAt = -Infinity
}

function acquireHostInputTracking() {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return () => {}
  if (hostInputRefCount === 0) {
    hostInputListener = () => recordHostInput()
    for (const type of HOST_INPUT_EVENTS) window.addEventListener(type, hostInputListener, { capture: true, passive: true })
  }
  hostInputRefCount += 1
  let released = false
  return () => {
    if (released) return
    released = true
    hostInputRefCount = Math.max(0, hostInputRefCount - 1)
    if (hostInputRefCount === 0 && hostInputListener !== null) {
      for (const type of HOST_INPUT_EVENTS) window.removeEventListener(type, hostInputListener, { capture: true })
      hostInputListener = null
    }
  }
}

// Fail-closed guard for future iframe-initiated fullscreen requests: the iframe
// must hold focus, user activation must be live, and no host input may have
// occurred within PAGE_ACTIVATION_MS (blocking click-hijack attempts).
export function canIframeRequestFullscreen(iframeEl, now = nowMs()) {
  if (!iframeEl || !Number.isFinite(now) || typeof document === 'undefined' || typeof navigator === 'undefined') return false
  if (document.activeElement !== iframeEl) return false
  if (navigator.userActivation?.isActive !== true) return false
  return now - lastHostInputAt >= PAGE_ACTIVATION_MS
}

function detectColorScheme() {
  if (typeof document === 'undefined') return 'light'
  const read = (element) => {
    if (!element || typeof getComputedStyle !== 'function') return ''
    const raw = getComputedStyle(element).getPropertyValue('color-scheme').trim().toLowerCase()
    return raw === 'dark' || raw === 'light' ? raw : ''
  }
  const explicit = read(document.body) || read(document.documentElement)
  if (explicit !== '') return explicit
  const root = document.documentElement
  const dark = Boolean(
    document.body?.hasAttribute('data-ds-dark-theme')
    || root?.classList?.contains('dark')
    || root?.getAttribute('data-theme') === 'dark',
  )
  return dark ? 'dark' : 'light'
}

export function themeVars() {
  if (typeof getComputedStyle !== 'function' || typeof document === 'undefined' || !document.body) return {}
  const style = getComputedStyle(document.body)
  const vars = {}
  for (const [view, legacy, source] of THEME_VARS) {
    const value = style.getPropertyValue(source).trim()
    if (value === '') continue
    vars[view] = value
    vars[legacy] = value
  }
  // Always emit an explicit 'dark' or 'light' scheme so Chromium paints a
  // transparent dark-aware backdrop on the very first frame instead of white.
  vars['color-scheme'] = detectColorScheme()
  return vars
}

const cssValue = value => String(value).replace(/[<>{};]/g, '')

// The document the frame loads. The policy and our script come before the
// markup, so nothing in the markup runs before them or loosens the policy.
export function frameDocument(html, vars = {}) {
  const rawScheme = String(vars['color-scheme'] ?? '').trim().toLowerCase()
  const scheme = rawScheme === 'dark' || rawScheme === 'light' ? rawScheme : 'light'
  const custom = Object.entries(vars)
    .filter(([name]) => name !== 'color-scheme')
    .map(([name, value]) => `${name}:${cssValue(value)}`)
  const root = [...custom, `color-scheme:${cssValue(scheme)}`].join(';')
  const report = `(()=>{let raf=0;const emit=()=>{raf=0;parent.postMessage({type:${JSON.stringify(HEIGHT)},height:Math.ceil(document.documentElement.getBoundingClientRect().height)},'*')};`
    + 'const schedule=()=>{if(!raf)raf=typeof requestAnimationFrame===\'function\'?requestAnimationFrame(emit):(emit(),0)};'
    + 'new ResizeObserver(schedule).observe(document.documentElement);addEventListener(\'load\',emit);'
    + 'addEventListener(\'pagehide\',()=>{if(raf&&typeof cancelAnimationFrame===\'function\'){cancelAnimationFrame(raf);raf=0}});'
    + `addEventListener('message',e=>{if(e.source!==parent||!e.data||e.data.type!==${JSON.stringify(THEME)})return;for(const[k,v]of Object.entries(e.data.vars||{}))document.documentElement.style.setProperty(k,String(v))})})()`
  return '<!doctype html><html><head><meta charset="utf-8">'
    + `<meta http-equiv="Content-Security-Policy" content="${FRAME_POLICY}">`
    + `<style>:root{${root}}html,body{margin:0;padding:0;background:transparent;color:var(--view-ink,var(--bt-ink));font:14px/22px -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}*{box-sizing:border-box}</style>`
    + `<script>${report}</script></head><body>${html}</body></html>`
}

export function HtmlFrame({ node }) {
  const ui = useViewUi()
  const frame = useRef(null)
  const boxRef = useRef(null)
  const expandBtnRef = useRef(null)
  const closeBtnRef = useRef(null)
  const restoreFocusRef = useRef(false)
  const rethemeRef = useRef(null)
  const loads = useRef(0)
  const fullscreenRef = useRef(false)
  const [height, setHeight] = useState(() => clampHeight(Number.isFinite(node.height) ? node.height : 120))
  const [scheme, setScheme] = useState(() => themeVars()['color-scheme'] || 'light')
  const [fullscreen, setFullscreen] = useState(false)
  const [fallbackFull, setFallbackFull] = useState(false)
  const [stopped, setStopped] = useState(false)
  const popover = supportsPopover()
  const doc = useMemo(() => frameDocument(String(node.html ?? ''), themeVars()), [node.html])

  const isPopoverOpen = () => {
    try { return Boolean(popover && boxRef.current?.matches?.(':popover-open')) } catch { return false }
  }

  useEffect(() => {
    const releaseHostInput = acquireHostInputTracking()
    const onMessage = (event) => {
      if (event.source !== frame.current?.contentWindow || event.data?.type !== HEIGHT) return
      if (fullscreenRef.current || isPopoverOpen()) return
      const next = Number(event.data.height)
      if (Number.isFinite(next)) setHeight(clampHeight(next))
    }
    window.addEventListener('message', onMessage)
    const retheme = () => {
      const vars = themeVars()
      if (vars['color-scheme']) setScheme(vars['color-scheme'])
      frame.current?.contentWindow?.postMessage({ type: THEME, vars }, '*')
    }
    rethemeRef.current = retheme
    const observer = typeof MutationObserver === 'function' ? new MutationObserver(retheme) : null
    if (observer) {
      if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme', 'style', 'class'] })
      if (document.documentElement) observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
    }
    return () => {
      rethemeRef.current = null
      window.removeEventListener('message', onMessage)
      observer?.disconnect()
      releaseHostInput()
    }
  }, [popover])

  useEffect(() => {
    const box = boxRef.current
    if (!popover || !box || stopped) return undefined
    const onToggle = (event) => {
      const open = event.newState === 'open'
      if (!open && fullscreenRef.current) restoreFocusRef.current = true
      fullscreenRef.current = open
      setFullscreen(open)
      if (!open) setFallbackFull(false)
    }
    box.addEventListener('toggle', onToggle)
    return () => box.removeEventListener('toggle', onToggle)
  }, [popover, stopped])

  useEffect(() => {
    if (!fallbackFull || stopped) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        restoreFocusRef.current = true
        fullscreenRef.current = false
        setFallbackFull(false)
        setFullscreen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [fallbackFull, stopped])

  useEffect(() => {
    if (fullscreen) {
      closeBtnRef.current?.focus?.({ preventScroll: true })
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current = false
      expandBtnRef.current?.focus?.()
    }
  }, [fullscreen])

  const enterFullscreen = () => {
    const box = boxRef.current
    fullscreenRef.current = true
    if (popover && typeof box?.showPopover === 'function') {
      try {
        box.showPopover()
        return
      } catch { /* fall through to fixed overlay */ }
    }
    setFallbackFull(true)
    setFullscreen(true)
  }

  const exitFullscreen = () => {
    restoreFocusRef.current = true
    const box = boxRef.current
    if (popover && typeof box?.hidePopover === 'function') {
      try {
        if (box.matches?.(':popover-open')) {
          box.hidePopover()
          return
        }
      } catch { /* fall through to state reset */ }
    }
    fullscreenRef.current = false
    setFallbackFull(false)
    setFullscreen(false)
  }

  if (stopped) return h('p', { className: 'dv-view-frame-stopped' }, ui.t('This view tried to open a page and was stopped.'))
  const summary = String(node.summary ?? '').trim()
  const label = summary || ui.t('View')
  const boxClass = fallbackFull ? 'dv-view-frame-box dv-view-frame-box--fallback' : 'dv-view-frame-box'
  return h('div', { className: 'dv-view-frame-slot', style: { height: `${height}px` } },
    h('div', {
      ref: boxRef,
      popover: popover && !fallbackFull ? 'auto' : undefined,
      role: fullscreen ? 'dialog' : undefined,
      'aria-modal': fullscreen ? 'true' : undefined,
      'aria-label': fullscreen ? label : undefined,
      'data-dv-fullscreen': fullscreen ? '' : undefined,
      className: boxClass,
    },
    h('div', { className: fullscreen ? 'dv-view-frame-bar' : 'dv-view-frame-actions' },
      fullscreen
        ? [
          h('span', { key: 'title', className: 'dv-view-frame-title' }, label),
          h('button', {
            key: 'close', ref: closeBtnRef, type: 'button', className: 'dv-view-frame-btn',
            'aria-label': ui.t('Exit fullscreen'), title: ui.t('Exit fullscreen'),
            onClick: exitFullscreen,
          }, h(CloseIcon)),
        ]
        : h('button', {
          ref: expandBtnRef, type: 'button', className: 'dv-view-frame-btn dv-view-frame-expand',
          'aria-label': ui.t('Fullscreen'), title: ui.t('Fullscreen'),
          onClick: enterFullscreen,
        }, h(ExpandIcon))),
    h('iframe', {
      key: 'frame',
      ref: frame, className: 'dv-view-frame', title: summary,
      sandbox: 'allow-scripts', srcDoc: doc, referrerPolicy: 'no-referrer',
      style: { height: fullscreen ? undefined : `${height}px`, colorScheme: scheme },
      onLoad: () => {
        loads.current += 1
        if (loads.current === 1) {
          rethemeRef.current?.()
        } else if (loads.current > 1) {
          try { if (boxRef.current?.matches?.(':popover-open')) boxRef.current.hidePopover() } catch {}
          fullscreenRef.current = false
          setFallbackFull(false)
          setFullscreen(false)
          setStopped(true)
        }
      },
    })))
}

export const HTML_CSS = `
.dv-view-frame-slot{position:relative;width:100%}
.dv-view-frame-box{position:relative;display:flex;flex-direction:column;width:100%;height:100%;margin:0;padding:0;border:0;background:transparent;color:inherit;inset:auto;overflow:visible}
.dv-view-frame-box[popover]:not(:popover-open){position:relative;display:flex;flex-direction:column;width:100%;height:100%;margin:0;padding:0;border:0;background:transparent;color:inherit;inset:auto;overflow:visible}
.dv-view-frame-box:popover-open{position:fixed;inset:16px;width:auto;height:auto;max-width:none;max-height:none;margin:0;padding:0;display:flex;flex-direction:column;border-radius:16px;border:1px solid var(--dv-line-2);background:var(--dv-card);color:var(--dv-ink);box-shadow:0 20px 50px rgba(0,0,0,.28),0 4px 12px rgba(0,0,0,.12);overflow:hidden;z-index:9999;font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif);box-sizing:border-box}
.dv-view-frame-box.dv-view-frame-box--fallback{position:fixed;inset:0;width:auto;height:auto;max-width:none;max-height:none;margin:0;padding:0;display:flex;flex-direction:column;border-radius:0;border:0;background:var(--dv-card);color:var(--dv-ink);box-shadow:0 20px 50px rgba(0,0,0,.28),0 4px 12px rgba(0,0,0,.12);overflow:hidden;z-index:9999;font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif);box-sizing:border-box}
.dv-view-frame-box::backdrop{background:rgba(0,0,0,.55);backdrop-filter:blur(4px)}
.dv-view-frame-actions{position:absolute;top:8px;right:8px;z-index:2;opacity:.72;transition:opacity .12s ease;pointer-events:none}
.dv-view:hover .dv-view-frame-actions,.dv-view-frame-slot:hover .dv-view-frame-actions,.dv-view-frame-actions:hover,.dv-view-frame-actions:focus-within{opacity:1}
@media (hover:none){.dv-view-frame-actions{opacity:1}}
.dv-view-frame-bar{flex:none;display:flex;align-items:center;gap:8px;min-height:44px;padding:8px 12px 8px 16px;border-bottom:1px solid var(--dv-line);background:var(--dv-card);box-sizing:border-box}
.dv-view-frame-title{flex:1 1 0;min-width:0;font-size:13px;line-height:18px;font-weight:500;color:var(--dv-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dv-view-frame-btn{flex:none;width:28px;height:28px;padding:0;border:0;border-radius:8px;background:none;color:var(--dv-ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.dv-view-frame-btn svg{width:15px;height:15px}
.dv-view-frame-btn:hover{background:var(--dv-hover);color:var(--dv-ink)}
.dv-view-frame-btn:focus-visible{outline:2px solid var(--dv-accent);outline-offset:1px}
.dv-view-frame-actions .dv-view-frame-btn{pointer-events:auto;background:color-mix(in srgb,var(--dv-card) 86%,transparent);border:.5px solid var(--dv-line-2);backdrop-filter:blur(6px);box-shadow:0 1px 3px rgba(0,0,0,.08)}
.dv-view-frame-actions .dv-view-frame-btn:hover{background:var(--dv-card);color:var(--dv-ink)}
.dv-view-frame{display:block;width:100%;border:0;background:transparent}
.dv-view-frame-box:popover-open .dv-view-frame{flex:1 1 auto;width:100%;height:100%;min-height:0}
.dv-view-frame-box.dv-view-frame-box--fallback .dv-view-frame{flex:1 1 auto;width:100%;height:100%;min-height:0}
.dv-view-frame-stopped{margin:0;font-size:13px;line-height:18px;color:var(--dv-ink-2)}
@media (prefers-reduced-motion:reduce){.dv-view-frame-actions,.dv-view-frame-btn{transition:none}}
`
