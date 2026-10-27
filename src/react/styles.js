// The --dv-* tokens the view styles read, mapped onto DeepSeek Harness's
// documented --dsw-* aliases so light and dark both follow the shell theme.
export const THEME_CSS = `
body{
--dv-ink:var(--dsw-alias-label-primary);
--dv-ink-2:var(--dsw-alias-label-secondary);
--dv-ink-3:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-caption));
--dv-line:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);
--dv-line-2:color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent);
--dv-card:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base)));
--dv-main:var(--dsw-alias-bg-base);
--dv-hover:var(--dsw-alias-interactive-bg-hover);
--dv-active:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover));
--dv-accent:var(--dsw-alias-state-business-primary);
--dv-accent-ink:var(--dsw-alias-label-primary-inverted,#fff);
--dv-green:var(--dsw-alias-state-success-primary);
--dv-star:var(--dsw-alias-state-warn-primary,var(--dsw-alias-state-warn-label));
--dv-danger:var(--dsw-alias-state-error-primary);
--dv-knob:var(--dsw-alias-label-primary-inverted,#fff);
--dv-tag-bg:var(--dsw-alias-interactive-bg-hover);
--dv-ink-tangerine:var(--dsw-alias-brand-text,var(--dsw-alias-state-warn-primary));
--dv-ink-green:var(--dsw-alias-state-success-primary);
--dv-ink-violet:color-mix(in srgb,var(--dsw-alias-state-business-primary) 60%,var(--dsw-alias-state-error-primary));
--dv-ink-sky:var(--dsw-alias-link,var(--dsw-alias-state-business-primary));
--dv-ink-rose:var(--dsw-alias-state-error-primary);
--dv-ink-yellow:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary));
--dv-ink-cyan:var(--dsw-alias-state-success-tertiary,var(--dsw-alias-state-success-primary));
--dv-ink-magenta:var(--dsw-alias-state-error-secondary,var(--dsw-alias-state-error-primary));
color-scheme:light}
body[data-ds-dark-theme]{color-scheme:dark}
.dv-q-inline .dv-view{max-width:100%}
`

// The frame an interactive or answered view wears, ported from ds-bot's
// question card (bt-q-*): list, options, key hints, fields, buttons, badge,
// plus the menu, segmented buttons, switch and the shared keyframes.
export const QUESTION_CSS = `
.dv-q{margin:0 auto 8px;width:100%;max-width:var(--dsh-chat-content-width,748px);display:flex;flex-direction:column;gap:12px;--dv-q-edge:color-mix(in srgb,var(--dv-ink) 10%,transparent);--dv-q-rule:color-mix(in srgb,var(--dv-ink) 8%,transparent);--dv-q-rule-2:color-mix(in srgb,var(--dv-ink) 5%,transparent);background:var(--dv-card);box-shadow:0 1px 3px rgba(20,20,20,.04),inset 0 0 0 1px var(--dv-q-edge);border-radius:16px;padding:14px 16px;box-sizing:border-box;color:var(--dv-ink);font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif);animation:dv-veil-in .2s ease-out backwards}
body[data-ds-dark-theme] .dv-q{--dv-q-edge:rgba(255,255,255,.16);--dv-q-rule:rgba(255,255,255,.12);--dv-q-rule-2:rgba(255,255,255,.08)}
.dv-q-settled{animation:none}
.dv-q-x{flex:none;width:20px;height:20px;border:0;padding:0;border-radius:6px;background:none;color:var(--dv-ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.dv-q-x svg{width:14px;height:14px}
.dv-q-x:hover{background:var(--dv-hover);color:var(--dv-ink)}
.dv-q-x:focus-visible,.dv-q-opt:focus-visible{outline:2px solid var(--dv-accent);outline-offset:-2px}
.dv-q-list{display:flex;flex-direction:column;gap:1px;min-width:0;box-sizing:border-box;margin:0 -8px}
.dv-q-opt{position:relative;display:flex;align-items:flex-start;gap:16px;width:100%;min-width:0;box-sizing:border-box;margin:0;border:0;border-radius:12px;background:transparent;padding:10px 8px;font:inherit;color:var(--dv-ink);text-align:start;cursor:pointer;transition:background-color .12s ease}
.dv-q-opt+.dv-q-opt::before{content:"";position:absolute;left:calc(var(--dv-key,24px) + 24px);right:8px;top:-1px;height:1px;background:var(--dv-q-rule-2);pointer-events:none}
button.dv-q-opt:hover::before,button.dv-q-opt:hover+.dv-q-opt::before,.dv-q-opt[aria-pressed=true]::before,.dv-q-opt[aria-pressed=true]+.dv-q-opt::before{opacity:0}
button.dv-q-opt:hover{background:var(--dv-hover)}
button.dv-q-opt:active{background:var(--dv-active)}
.dv-q-opt[aria-pressed=true]{background:var(--dv-active)}
.dv-key{flex:none;box-sizing:border-box;width:var(--dv-key,24px);height:var(--dv-key,24px);border-radius:8px;background:var(--dv-hover);color:var(--dv-ink-2);font-size:12px;line-height:var(--dv-key,24px);font-weight:500;text-align:center;font-variant-numeric:tabular-nums;transition:background-color .12s ease,color .12s ease}
.dv-q-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px;padding-top:2px}
.dv-q-opt:has(.dv-q-desc){--dv-key:34px}
.dv-q-opt:has(.dv-q-desc) .dv-key{margin-top:2px;border-radius:10px;font-size:13px}
.dv-q-opt:has(.dv-q-desc) .dv-q-body{padding-top:0}
.dv-q-label{font-size:14px;line-height:20px;font-weight:500;white-space:normal;overflow-wrap:anywhere}
.dv-q-desc{font-size:12px;line-height:17px;color:var(--dv-ink-2);overflow-wrap:anywhere}
.dv-q-check{flex:none;display:inline-flex;align-items:center;color:var(--dv-ink-2);animation:dv-check-pop .18s ease-out backwards}
.dv-q-settled .dv-q-check{animation:none}
.dv-q-check svg{width:16px;height:16px}
.dv-q-settled .dv-key{opacity:.4}
.dv-q-settled .dv-q-label{color:color-mix(in srgb,var(--dv-ink) 45%,transparent)}
.dv-q.dv-q-settled{gap:6px;padding:12px 16px}
.dv-q-settled .dv-q-opt{padding:4px 8px}
.dv-q-badge{flex:none;height:20px;padding:0 7px;border-radius:999px;border:1px dotted var(--dv-line-2);color:var(--dv-ink-2);font-size:12px;line-height:18px;box-sizing:border-box}
.dv-q-field{flex:1 1 0;min-width:0;display:flex;box-sizing:border-box;min-height:32px;padding:5px 11px;border-radius:8px;border:.5px solid var(--dv-line-2);background:none;cursor:text;transition:border-color .12s ease}
.dv-q-field:focus-within{border-color:color-mix(in srgb,var(--dv-ink) 30%,transparent)}
.dv-q-input{flex:1;width:100%;min-width:0;max-height:120px;margin:0;padding:0;border:0;outline:none;background:transparent;color:var(--dv-ink);font:inherit;font-size:14px;line-height:20px;resize:none;overflow-y:hidden;white-space:pre-wrap;overflow-wrap:anywhere}
.dv-q-input::placeholder{color:var(--dv-ink-3)}
.dv-q-submit,.dv-q-btn{flex:none;height:36px;padding:0 14px;border:0;border-radius:999px;font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .12s ease,background-color .12s ease}
.dv-q-submit{background:var(--dv-accent);color:var(--dv-accent-ink,#fff);animation:dv-veil-in .16s ease-out backwards}
.dv-q-submit:hover:not(:disabled){opacity:.86}
.dv-q-submit:disabled{opacity:.4;cursor:default}
.dv-q-btn{background:var(--dv-hover);color:var(--dv-ink)}
.dv-q-btn:hover{background:var(--dv-active)}
.dv-q-foot{display:flex;justify-content:flex-end;gap:8px}
.dv-menu{position:fixed;pointer-events:auto;z-index:60;min-width:200px;padding:6px;border-radius:12px;background:var(--dv-main);border:.5px solid var(--dv-line-2);box-shadow:0 10px 20px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1),0 0 0 1px rgba(228,228,228,.04);display:flex;flex-direction:column;gap:2px;transform-origin:var(--dv-origin,top left);animation:dv-veil-in .14s ease-out;font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif);box-sizing:border-box}
.dv-menu.dv-view-menu{position:absolute;z-index:4}
.dv-menu button{display:flex;align-items:center;gap:4px;width:100%;min-height:30px;text-align:left;border:0;background:none;border-radius:6px;padding:6px 8px;font:inherit;font-size:13px;line-height:18px;color:var(--dv-ink);cursor:pointer;box-sizing:border-box}
.dv-menu button:hover{background:var(--dv-hover)}
.dv-menu 
.dv-menu button{display:flex;align-items:center;gap:4px;width:100%;min-height:30px;text-align:left;border:0;background:none;border-radius:6px;padding:6px 8px;font:inherit;font-size:13px;line-height:18px;color:var(--dv-ink);cursor:pointer;box-sizing:border-box}
.dv-menu button:hover{background:var(--dv-hover)}
.dv-menu button svg{flex:none;width:16px;height:16px;margin:0 1px}
.dv-menu-sep{height:.5px;flex:none;background:var(--dv-line-2);margin:4px 8px}
.dv-seg{position:relative;display:flex;gap:2px;padding:2px;border-radius:10px;background:var(--dv-hover)}
.dv-seg button{position:relative;z-index:1;flex:1;height:30px;border:0;border-radius:8px;background:none;font:inherit;font-size:13px;color:var(--dv-ink-2);cursor:pointer;transition:background-color .15s ease,color .15s ease,box-shadow .15s ease}
.dv-seg button[aria-pressed=true]{background:var(--dv-card);color:var(--dv-ink);box-shadow:0 1px 3px rgba(0,0,0,.08)}
.dv-seg button:disabled{opacity:.4;cursor:default}
.dv-switch{position:relative;flex:none;width:36px;height:20px;padding:0;border:0;border-radius:999px;background:var(--dv-line-2);cursor:pointer;transition:background-color .15s ease}
.dv-switch[aria-checked=true]{background:var(--dv-accent)}
.dv-switch:disabled{opacity:.4;cursor:default}
.dv-switch-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dv-knob);box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .15s ease}
.dv-switch[aria-checked=true] .dv-switch-knob{transform:translateX(16px)}
.dv-switch:focus-visible{outline:2px solid var(--dv-accent);outline-offset:2px}
.dv-gone{display:none}
@keyframes dv-veil-in{from{opacity:0;filter:blur(6px)}}
@keyframes dv-check-pop{from{opacity:0;scale:.4}}
@media (prefers-reduced-motion:reduce){.dv-q,.dv-view-bare,.dv-q-submit,.dv-menu,.dv-q-check{animation:none}}
`
