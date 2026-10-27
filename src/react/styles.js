// The --dui-* tokens the view styles read, mapped onto DeepSeek Harness's
// documented --dsw-* aliases so light and dark both follow the shell theme.
export const THEME_CSS = `
body{
--dui-ink:var(--dsw-alias-label-primary);
--dui-ink-2:var(--dsw-alias-label-secondary);
--dui-ink-3:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-caption));
--dui-line:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);
--dui-line-2:color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent);
--dui-card:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base)));
--dui-main:var(--dsw-alias-bg-base);
--dui-hover:var(--dsw-alias-interactive-bg-hover);
--dui-active:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-interactive-bg-hover));
--dui-accent:var(--dsw-alias-state-business-primary);
--dui-accent-ink:var(--dsw-alias-label-primary-inverted,#fff);
--dui-green:var(--dsw-alias-state-success-primary);
--dui-star:var(--dsw-alias-state-warn-primary,var(--dsw-alias-state-warn-label));
--dui-danger:var(--dsw-alias-state-error-primary);
--dui-knob:var(--dsw-alias-label-primary-inverted,#fff);
--dui-user:var(--dsw-specific-bubble,var(--dsw-alias-state-business-primary));
--dui-user-ink:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-label-primary));
--dui-tag-bg:var(--dsw-alias-interactive-bg-hover);
--dui-ink-tangerine:var(--dsw-alias-brand-text,var(--dsw-alias-state-warn-primary));
--dui-ink-green:var(--dsw-alias-state-success-primary);
--dui-ink-violet:color-mix(in srgb,var(--dsw-alias-state-business-primary) 60%,var(--dsw-alias-state-error-primary));
--dui-ink-sky:var(--dsw-alias-link,var(--dsw-alias-state-business-primary));
--dui-ink-rose:var(--dsw-alias-state-error-primary);
--dui-ink-yellow:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary));
--dui-ink-cyan:var(--dsw-alias-state-success-tertiary,var(--dsw-alias-state-success-primary));
--dui-ink-magenta:var(--dsw-alias-state-error-secondary,var(--dsw-alias-state-error-primary));
color-scheme:light}
body[data-ds-dark-theme]{color-scheme:dark}
.dui-q-inline .dui-view{max-width:100%}
`

// The frame an interactive or answered view wears, ported from ds-bot's
// question card (bt-q-*): list, options, key hints, fields, buttons, badge,
// plus the menu, segmented buttons, switch and the shared keyframes.
export const QUESTION_CSS = `
.dui-q{margin:0 auto 8px;width:100%;max-width:var(--dsh-chat-content-width,748px);display:flex;flex-direction:column;gap:12px;--dui-q-edge:color-mix(in srgb,var(--dui-ink) 10%,transparent);--dui-q-rule:color-mix(in srgb,var(--dui-ink) 8%,transparent);--dui-q-rule-2:color-mix(in srgb,var(--dui-ink) 5%,transparent);background:var(--dui-card);box-shadow:0 1px 3px rgba(20,20,20,.04),inset 0 0 0 1px var(--dui-q-edge);border-radius:16px;padding:14px 16px;box-sizing:border-box;color:var(--dui-ink);font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif);animation:dui-veil-in .2s ease-out backwards}
body[data-ds-dark-theme] .dui-q{--dui-q-edge:rgba(255,255,255,.16);--dui-q-rule:rgba(255,255,255,.12);--dui-q-rule-2:rgba(255,255,255,.08)}
.dui-q-settled{animation:none}
.dui-q-x{flex:none;width:20px;height:20px;border:0;padding:0;border-radius:6px;background:none;color:var(--dui-ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.dui-q-x svg{width:14px;height:14px}
.dui-q-x:hover{background:var(--dui-hover);color:var(--dui-ink)}
.dui-q-x:focus-visible,.dui-q-opt:focus-visible{outline:2px solid var(--dui-accent);outline-offset:-2px}
.dui-q-list{display:flex;flex-direction:column;gap:1px;min-width:0;box-sizing:border-box;margin:0 -8px}
.dui-q-opt{position:relative;display:flex;align-items:flex-start;gap:16px;width:100%;min-width:0;box-sizing:border-box;margin:0;border:0;border-radius:12px;background:transparent;padding:10px 8px;font:inherit;color:var(--dui-ink);text-align:start;cursor:pointer;transition:background-color .12s ease}
.dui-q-opt+.dui-q-opt::before{content:"";position:absolute;left:calc(var(--dui-key,24px) + 24px);right:8px;top:-1px;height:1px;background:var(--dui-q-rule-2);pointer-events:none}
button.dui-q-opt:hover::before,button.dui-q-opt:hover+.dui-q-opt::before,.dui-q-opt[aria-pressed=true]::before,.dui-q-opt[aria-pressed=true]+.dui-q-opt::before{opacity:0}
button.dui-q-opt:hover{background:var(--dui-hover)}
button.dui-q-opt:active{background:var(--dui-active)}
.dui-q-opt[aria-pressed=true]{background:var(--dui-active)}
.dui-key{flex:none;box-sizing:border-box;width:var(--dui-key,24px);height:var(--dui-key,24px);border-radius:8px;background:var(--dui-hover);color:var(--dui-ink-2);font-size:12px;line-height:var(--dui-key,24px);font-weight:500;text-align:center;font-variant-numeric:tabular-nums;transition:background-color .12s ease,color .12s ease}
.dui-q-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px;padding-top:2px}
.dui-q-opt:has(.dui-q-desc){--dui-key:34px}
.dui-q-opt:has(.dui-q-desc) .dui-key{margin-top:2px;border-radius:10px;font-size:13px}
.dui-q-opt:has(.dui-q-desc) .dui-q-body{padding-top:0}
.dui-q-label{font-size:14px;line-height:20px;font-weight:500;white-space:normal;overflow-wrap:anywhere}
.dui-q-desc{font-size:12px;line-height:17px;color:var(--dui-ink-2);overflow-wrap:anywhere}
.dui-q-check{flex:none;display:inline-flex;align-items:center;color:var(--dui-ink-2);animation:dui-check-pop .18s ease-out backwards}
.dui-q-settled .dui-q-check{animation:none}
.dui-q-check svg{width:16px;height:16px}
.dui-q-settled .dui-key{opacity:.4}
.dui-q-settled .dui-q-label{color:color-mix(in srgb,var(--dui-ink) 45%,transparent)}
.dui-q.dui-q-settled{gap:6px;padding:12px 16px}
.dui-q-settled .dui-q-opt{padding:4px 8px}
.dui-q-badge{flex:none;height:20px;padding:0 7px;border-radius:999px;border:1px dotted var(--dui-line-2);color:var(--dui-ink-2);font-size:12px;line-height:18px;box-sizing:border-box}
.dui-q-field{flex:1 1 0;min-width:0;display:flex;box-sizing:border-box;min-height:32px;padding:5px 11px;border-radius:8px;border:.5px solid var(--dui-line-2);background:none;cursor:text;transition:border-color .12s ease}
.dui-q-field:focus-within{border-color:color-mix(in srgb,var(--dui-ink) 30%,transparent)}
.dui-q-input{flex:1;width:100%;min-width:0;max-height:120px;margin:0;padding:0;border:0;outline:none;background:transparent;color:var(--dui-ink);font:inherit;font-size:14px;line-height:20px;resize:none;overflow-y:hidden;white-space:pre-wrap;overflow-wrap:anywhere}
.dui-q-input::placeholder{color:var(--dui-ink-3)}
.dui-q-submit,.dui-q-btn{flex:none;height:36px;padding:0 14px;border:0;border-radius:999px;font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .12s ease,background-color .12s ease}
.dui-q-submit{background:var(--dui-accent);color:var(--dui-accent-ink,#fff);animation:dui-veil-in .16s ease-out backwards}
.dui-q-submit:hover:not(:disabled){opacity:.86}
.dui-q-submit:disabled{opacity:.4;cursor:default}
.dui-q-btn{background:var(--dui-hover);color:var(--dui-ink)}
.dui-q-btn:hover{background:var(--dui-active)}
.dui-q-foot{display:flex;justify-content:flex-end;gap:8px}
.dui-menu{position:fixed;pointer-events:auto;z-index:60;min-width:200px;padding:6px;border-radius:12px;background:var(--dui-main);border:.5px solid var(--dui-line-2);box-shadow:0 10px 20px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1),0 0 0 1px rgba(228,228,228,.04);display:flex;flex-direction:column;gap:2px;transform-origin:var(--dui-origin,top left);animation:dui-veil-in .14s ease-out;font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif);box-sizing:border-box}
.dui-menu.dui-view-menu{position:absolute;z-index:4}
.dui-menu button{display:flex;align-items:center;gap:4px;width:100%;min-height:30px;text-align:left;border:0;background:none;border-radius:6px;padding:6px 8px;font:inherit;font-size:13px;line-height:18px;color:var(--dui-ink);cursor:pointer;box-sizing:border-box}
.dui-menu button:hover{background:var(--dui-hover)}
.dui-menu 
.dui-menu button{display:flex;align-items:center;gap:4px;width:100%;min-height:30px;text-align:left;border:0;background:none;border-radius:6px;padding:6px 8px;font:inherit;font-size:13px;line-height:18px;color:var(--dui-ink);cursor:pointer;box-sizing:border-box}
.dui-menu button:hover{background:var(--dui-hover)}
.dui-menu button svg{flex:none;width:16px;height:16px;margin:0 1px}
.dui-menu-sep{height:.5px;flex:none;background:var(--dui-line-2);margin:4px 8px}
.dui-seg{position:relative;display:flex;gap:2px;padding:2px;border-radius:10px;background:var(--dui-hover)}
.dui-seg button{position:relative;z-index:1;flex:1;height:30px;border:0;border-radius:8px;background:none;font:inherit;font-size:13px;color:var(--dui-ink-2);cursor:pointer;transition:background-color .15s ease,color .15s ease,box-shadow .15s ease}
.dui-seg button[aria-pressed=true]{background:var(--dui-card);color:var(--dui-ink);box-shadow:0 1px 3px rgba(0,0,0,.08)}
.dui-seg button:disabled{opacity:.4;cursor:default}
.dui-switch{position:relative;flex:none;width:36px;height:20px;padding:0;border:0;border-radius:999px;background:var(--dui-line-2);cursor:pointer;transition:background-color .15s ease}
.dui-switch[aria-checked=true]{background:var(--dui-accent)}
.dui-switch:disabled{opacity:.4;cursor:default}
.dui-switch-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dui-knob);box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .15s ease}
.dui-switch[aria-checked=true] .dui-switch-knob{transform:translateX(16px)}
.dui-switch:focus-visible{outline:2px solid var(--dui-accent);outline-offset:2px}
.dui-urow{display:flex;justify-content:flex-end}
.dui-ububble{max-width:72%;background:var(--dui-user);color:var(--dui-user-ink);border-radius:18px;padding:7px 12px;font-size:14px;line-height:20px;box-sizing:border-box;overflow-wrap:anywhere}
.dui-ububble p{margin:0;line-height:22px}
.dui-gone{display:none}
@keyframes dui-veil-in{from{opacity:0;filter:blur(6px)}}
@keyframes dui-check-pop{from{opacity:0;scale:.4}}
@media (prefers-reduced-motion:reduce){.dui-q,.dui-view-bare,.dui-q-submit,.dui-menu,.dui-q-check{animation:none}}
`
