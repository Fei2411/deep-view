// The page's share of a view: labels through `t`, Markdown through `Markdown`.
// A host mounts <ViewUi.Provider> once; without one a view still renders, in
// English with plain text where Markdown would be.
import { createElement as h, createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react'

const FallbackMarkdown = ({ text }) => h('span', null, String(text ?? ''))
export const ViewUi = createContext({ t: key => key, Markdown: FallbackMarkdown })
export const useViewUi = () => useContext(ViewUi)

const lineIcon = paths => function LineIcon() {
  return h('svg', { width: 15, height: 15, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
    paths.map((d, index) => h('path', { key: index, d })))
}
export const DotsIcon = lineIcon(['M5 10h.01M10 10h.01M15 10h.01'])
export const CheckIcon = lineIcon(['M4.5 10.5l3.5 3.5 7.5-8'])
export const DownloadIcon = lineIcon(['M10 3.5v9', 'M6.5 9.5L10 13l3.5-3.5', 'M4 16h12'])
export const CopyIcon = lineIcon(['M8.5 7h6A1.5 1.5 0 0 1 16 8.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 7 14.5v-6A1.5 1.5 0 0 1 8.5 7z', 'M4 12.5V5.5A1.5 1.5 0 0 1 5.5 4H13'])
export const InfoIcon = lineIcon(['M10 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z', 'M10 9.25v4', 'M10 6.6h.01'])
export function CloseIcon() {
  return h('svg', { width: 16, height: 16, viewBox: '0 0 20 20', 'aria-hidden': true }, h('path', { d: 'M5 5l10 10M15 5L5 15', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }))
}

// A few short options sit side by side as segmented buttons.
export function Segmented({ label, value, className, children }) {
  return h('div', { className: className ? `dui-seg ${className}` : 'dui-seg', role: 'group', 'aria-label': label, 'data-active': value }, children)
}

export const keyLetter = index => String.fromCharCode(65 + index)
const isTypingTarget = node => node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement
  || node instanceof HTMLSelectElement || (node instanceof HTMLElement && node.isContentEditable)

// A bare letter picks that option. The listener is document-wide, so two open
// cards with letter keys would both answer the same key: each card registers
// here and the keys fire only while it is the sole registered card.
const keyCards = (() => {
  let count = 0
  const listeners = new Set()
  return {
    subscribe: fn => (listeners.add(fn), () => listeners.delete(fn)),
    getSnapshot: () => count,
    set: (change) => { count = change(count); for (const fn of listeners) fn() },
  }
})()
export function useOptionKeys(count, onPick, ownRef) {
  const pick = useRef(onPick)
  pick.current = onPick
  const listening = useSyncExternalStore(keyCards.subscribe, keyCards.getSnapshot)
  useEffect(() => {
    if (count === 0) return undefined
    keyCards.set(value => value + 1)
    const onKey = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.key.length !== 1) return
      if (isTypingTarget(event.target) || isTypingTarget(document.activeElement)) return
      if (document.querySelector('[role="dialog"], [aria-modal="true"]') !== null) return
      if (keyCards.getSnapshot() !== 1) return
      const index = event.key.toUpperCase().charCodeAt(0) - 65
      if (index >= 0 && index < count) {
        event.preventDefault()
        pick.current(index)
      } else if (index === count && ownRef.current) {
        event.preventDefault()
        ownRef.current.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      keyCards.set(value => value - 1)
    }
  }, [count, ownRef])
  return count > 0 && listening <= 1
}
