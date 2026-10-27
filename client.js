// Generated from src/client by `npm run build` (scripts/build-client.mjs). Do not edit by hand.
window.__ModuleLoader__.load({
  id: 'dsh-deep-ui',
  factory: (require) => {
const module = { exports: {} }
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.js
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/react/ui.js
var import_react = require("react");
var FallbackMarkdown = ({ text }) => (0, import_react.createElement)("span", null, String(text ?? ""));
var ViewUi = (0, import_react.createContext)({ t: (key) => key, Markdown: FallbackMarkdown });
var useViewUi = () => (0, import_react.useContext)(ViewUi);
var lineIcon = (paths) => function LineIcon() {
  return (0, import_react.createElement)(
    "svg",
    { width: 15, height: 15, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    paths.map((d, index) => (0, import_react.createElement)("path", { key: index, d }))
  );
};
var DotsIcon = lineIcon(["M5 10h.01M10 10h.01M15 10h.01"]);
var CheckIcon = lineIcon(["M4.5 10.5l3.5 3.5 7.5-8"]);
var DownloadIcon = lineIcon(["M10 3.5v9", "M6.5 9.5L10 13l3.5-3.5", "M4 16h12"]);
var CopyIcon = lineIcon(["M8.5 7h6A1.5 1.5 0 0 1 16 8.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 7 14.5v-6A1.5 1.5 0 0 1 8.5 7z", "M4 12.5V5.5A1.5 1.5 0 0 1 5.5 4H13"]);
var InfoIcon = lineIcon(["M10 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z", "M10 9.25v4", "M10 6.6h.01"]);
function CloseIcon() {
  return (0, import_react.createElement)("svg", { width: 16, height: 16, viewBox: "0 0 20 20", "aria-hidden": true }, (0, import_react.createElement)("path", { d: "M5 5l10 10M15 5L5 15", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" }));
}
function Segmented({ label, value, className, children }) {
  return (0, import_react.createElement)("div", { className: className ? `dui-seg ${className}` : "dui-seg", role: "group", "aria-label": label, "data-active": value }, children);
}
var keyLetter = (index) => String.fromCharCode(65 + index);
var isTypingTarget = (node) => node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement || node instanceof HTMLElement && node.isContentEditable;
var keyCards = /* @__PURE__ */ (() => {
  let count = 0;
  const listeners = /* @__PURE__ */ new Set();
  return {
    subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    getSnapshot: () => count,
    set: (change) => {
      count = change(count);
      for (const fn of listeners) fn();
    }
  };
})();
function useOptionKeys(count, onPick, ownRef) {
  const pick = (0, import_react.useRef)(onPick);
  pick.current = onPick;
  const listening = (0, import_react.useSyncExternalStore)(keyCards.subscribe, keyCards.getSnapshot);
  (0, import_react.useEffect)(() => {
    if (count === 0) return void 0;
    keyCards.set((value) => value + 1);
    const onKey = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.key.length !== 1) return;
      if (isTypingTarget(event.target) || isTypingTarget(document.activeElement)) return;
      if (document.querySelector('[role="dialog"], [aria-modal="true"]') !== null) return;
      if (keyCards.getSnapshot() !== 1) return;
      const index = event.key.toUpperCase().charCodeAt(0) - 65;
      if (index >= 0 && index < count) {
        event.preventDefault();
        pick.current(index);
      } else if (index === count && ownRef.current) {
        event.preventDefault();
        ownRef.current.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      keyCards.set((value) => value - 1);
    };
  }, [count, ownRef]);
  return count > 0 && listening <= 1;
}

// src/core/formula.js
var FUNCTIONS = {
  min: { args: [1, Infinity], run: (...values) => Math.min(...values.map(num)) },
  max: { args: [1, Infinity], run: (...values) => Math.max(...values.map(num)) },
  abs: { args: [1, 1], run: (value) => Math.abs(num(value)) },
  floor: { args: [1, 1], run: (value) => Math.floor(num(value)) },
  ceil: { args: [1, 1], run: (value) => Math.ceil(num(value)) },
  sqrt: { args: [1, 1], run: (value) => Math.sqrt(num(value)) },
  pow: { args: [2, 2], run: (base, power) => num(base) ** num(power) },
  round: { args: [1, 2], run: (value, digits = 0) => roundTo(num(value), digitsOf(digits)) },
  clamp: { args: [3, 3], run: (value, low, high) => Math.min(Math.max(num(value), num(low)), num(high)) },
  fixed: { args: [1, 2], run: (value, digits = 0) => roundTo(num(value), digitsOf(digits)).toFixed(digitsOf(digits)) },
  format: { args: [1, 2], run: (value, digits = 0) => grouped(num(value), digitsOf(digits)) },
  percent: { args: [1, 2], run: (value, digits = 0) => `${grouped(num(value) * 100, digitsOf(digits))}%` }
};
var FORMULA_FUNCTIONS = Object.keys(FUNCTIONS);
var CONSTANTS = /* @__PURE__ */ new Map([["true", true], ["false", false]]);
var MAX_NESTING = 64;
var FormulaError = class extends Error {
};
var fail = (message) => {
  throw new FormulaError(message);
};
function num(value) {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  const parsed = Number(value);
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(parsed)) return parsed;
  return fail(`${JSON.stringify(value)} is not a number`);
}
var digitsOf = (digits) => {
  const value = num(digits);
  if (!Number.isInteger(value) || value < 0 || value > 10) fail("digits must be a whole number from 0 to 10");
  return value;
};
var roundTo = (value, digits) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};
function grouped(value, digits) {
  if (!Number.isFinite(value)) return String(value);
  const [whole, part] = Math.abs(roundTo(value, digits)).toFixed(digits).split(".");
  const sign = value < 0 && Number(whole + (part ?? "")) !== 0 ? "-" : "";
  return `${sign}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${part ? `.${part}` : ""}`;
}
var IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
var isName = (value) => typeof value === "string" && IDENT.test(value);
var OPERATORS = ["==", "!=", "<=", ">=", "&&", "||", "+", "-", "*", "/", "%", "<", ">", "!", "?", ":", "(", ")", ","];
function tokenize(source) {
  const tokens = [];
  let at = 0;
  while (at < source.length) {
    const char = source[at];
    if (/\s/.test(char)) {
      at += 1;
      continue;
    }
    const number = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(source.slice(at));
    if (number) {
      tokens.push({ kind: "number", value: Number(number[0]), at });
      at += number[0].length;
      continue;
    }
    const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(at));
    if (name) {
      tokens.push({ kind: "name", value: name[0], at });
      at += name[0].length;
      continue;
    }
    if (char === '"' || char === "'") {
      let end = at + 1;
      let text = "";
      while (end < source.length && source[end] !== char) {
        if (source[end] === "\\" && end + 1 < source.length) {
          text += source[end + 1];
          end += 2;
          continue;
        }
        text += source[end];
        end += 1;
      }
      if (end >= source.length) fail(`unclosed string at ${at + 1}`);
      tokens.push({ kind: "string", value: text, at });
      at = end + 1;
      continue;
    }
    const operator = OPERATORS.find((op) => source.startsWith(op, at));
    if (operator === void 0) fail(`unexpected ${JSON.stringify(char)} at ${at + 1}`);
    tokens.push({ kind: "op", value: operator, at });
    at += operator.length;
  }
  return tokens;
}
var BINARY = [["||"], ["&&"], ["==", "!="], ["<", "<=", ">", ">="], ["+", "-"], ["*", "/", "%"]];
function parse(source) {
  const tokens = tokenize(source);
  let index = 0;
  let depth = 0;
  const peek = () => tokens[index];
  const isOp = (value) => peek()?.kind === "op" && peek().value === value;
  const expect = (value) => {
    if (!isOp(value)) fail(peek() ? `expected "${value}" at ${peek().at + 1}` : `expected "${value}" at the end`);
    index += 1;
  };
  const nest = (read) => {
    depth += 1;
    if (depth > MAX_NESTING) fail(`nested more than ${MAX_NESTING} levels`);
    const node = read();
    depth -= 1;
    return node;
  };
  const ternary = () => nest(() => {
    const test = binary2(0);
    if (!isOp("?")) return test;
    index += 1;
    const yes = ternary();
    expect(":");
    return { type: "if", test, yes, no: ternary() };
  });
  const binary2 = (level) => {
    if (level === BINARY.length) return unary();
    let left = binary2(level + 1);
    while (peek()?.kind === "op" && BINARY[level].includes(peek().value)) {
      const op = peek().value;
      index += 1;
      left = { type: "binary", op, left, right: binary2(level + 1) };
    }
    return left;
  };
  const unary = () => {
    if (isOp("-") || isOp("!") || isOp("+")) {
      const op = peek().value;
      index += 1;
      return nest(() => ({ type: "unary", op, value: unary() }));
    }
    return primary();
  };
  const primary = () => {
    const token = peek();
    if (token === void 0) fail("the formula ends too early");
    index += 1;
    if (token.kind === "number" || token.kind === "string") return { type: "value", value: token.value };
    if (token.kind === "op" && token.value === "(") {
      const inner = ternary();
      expect(")");
      return inner;
    }
    if (token.kind !== "name") fail(`unexpected "${token.value}" at ${token.at + 1}`);
    if (!isOp("(")) return CONSTANTS.has(token.value) ? { type: "value", value: CONSTANTS.get(token.value) } : { type: "name", name: token.value };
    const fn = Object.hasOwn(FUNCTIONS, token.value) ? FUNCTIONS[token.value] : void 0;
    if (fn === void 0) fail(`unknown function "${token.value}"; allowed: ${FORMULA_FUNCTIONS.join(", ")}`);
    index += 1;
    const args = [];
    if (!isOp(")")) {
      args.push(ternary());
      while (isOp(",")) {
        index += 1;
        args.push(ternary());
      }
    }
    expect(")");
    if (args.length < fn.args[0] || args.length > fn.args[1]) {
      fail(`${token.value}() takes ${fn.args[0] === fn.args[1] ? fn.args[0] : fn.args[1] === Infinity ? `at least ${fn.args[0]}` : `${fn.args[0]} or ${fn.args[1]}`} argument${fn.args[1] === 1 ? "" : "s"}; got ${args.length}`);
    }
    return { type: "call", name: token.value, args };
  };
  if (tokens.length === 0) fail("the formula is empty");
  const tree = ternary();
  if (index < tokens.length) fail(`unexpected "${peek().value}" at ${peek().at + 1}`);
  return tree;
}
function namesIn(node, found = /* @__PURE__ */ new Set()) {
  if (node.type === "name") found.add(node.name);
  else if (node.type === "unary") namesIn(node.value, found);
  else if (node.type === "binary") {
    namesIn(node.left, found);
    namesIn(node.right, found);
  } else if (node.type === "if") {
    namesIn(node.test, found);
    namesIn(node.yes, found);
    namesIn(node.no, found);
  } else if (node.type === "call") for (const arg of node.args) namesIn(arg, found);
  return found;
}
function compileFormula(source) {
  if (typeof source !== "string") return { error: "expected a formula string" };
  try {
    const tree = parse(source);
    return { tree, names: [...namesIn(tree)] };
  } catch (error) {
    if (error instanceof FormulaError) return { error: error.message };
    throw error;
  }
}
function run(node, lookup) {
  switch (node.type) {
    case "value":
      return node.value;
    case "name":
      return lookup(node.name);
    case "unary": {
      const value = run(node.value, lookup);
      if (node.op === "!") return !truthy(value);
      return node.op === "-" ? -num(value) : num(value);
    }
    case "if":
      return truthy(run(node.test, lookup)) ? run(node.yes, lookup) : run(node.no, lookup);
    case "call":
      return FUNCTIONS[node.name].run(...node.args.map((arg) => run(arg, lookup)));
    default:
      return binary(node, lookup);
  }
}
var truthy = (value) => typeof value === "string" ? value !== "" : Boolean(value);
function binary(node, lookup) {
  if (node.op === "&&") return truthy(run(node.left, lookup)) ? run(node.right, lookup) : false;
  if (node.op === "||") {
    const left2 = run(node.left, lookup);
    return truthy(left2) ? left2 : run(node.right, lookup);
  }
  const left = run(node.left, lookup);
  const right = run(node.right, lookup);
  switch (node.op) {
    case "+":
      return typeof left === "string" || typeof right === "string" ? `${show(left)}${show(right)}` : num(left) + num(right);
    case "-":
      return num(left) - num(right);
    case "*":
      return num(left) * num(right);
    case "/":
      return num(left) / num(right);
    case "%":
      return num(left) % num(right);
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case "<":
      return num(left) < num(right);
    case "<=":
      return num(left) <= num(right);
    case ">":
      return num(left) > num(right);
    default:
      return num(left) >= num(right);
  }
}
function show(value) {
  if (typeof value === "number") return Number.isFinite(value) ? String(Number(value.toPrecision(12))) : String(value);
  return String(value);
}
function createScope(inputs, lets) {
  const done = /* @__PURE__ */ new Map();
  const busy = /* @__PURE__ */ new Set();
  const lookup = (name) => {
    if (inputs.has(name)) return inputs.get(name);
    if (done.has(name)) return done.get(name);
    const tree = lets.get(name);
    if (tree === void 0) fail(`unknown name "${name}"`);
    if (busy.has(name)) fail(`"${name}" refers to itself`);
    busy.add(name);
    try {
      const value = run(tree, lookup);
      done.set(name, value);
      return value;
    } finally {
      busy.delete(name);
    }
  };
  return lookup;
}
function evaluate(tree, lookup) {
  try {
    return { value: run(tree, lookup) };
  } catch (error) {
    if (error instanceof FormulaError) return { error: error.message };
    if (error instanceof RangeError) return { error: "the formula is too deep to work out" };
    throw error;
  }
}

// src/core/views.js
var LAYOUT = ["stack", "row"];
var DISPLAY = ["text", "metric", "table", "chart", "progress", "callout", "sources", "html"];
var INPUT_TYPES = ["slider", "choice", "toggle", "number"];
var ANSWERS = ["options", "confirm", "form", "submit"];
var COMPONENTS = [...LAYOUT, ...DISPLAY, ...INPUT_TYPES, ...ANSWERS];
var TONES = ["good", "warn", "bad"];
var TEXT_TONES = ["muted"];
var CALLOUT_TONES = ["info", "good", "warn", "bad"];
var CHART_KINDS = ["bar", "hbar", "line", "area", "donut"];
var INTERACTIVE = new Set(ANSWERS);
var INPUTS = new Set(INPUT_TYPES);
var PROPS = {
  stack: ["children", "let"],
  row: ["children", "let"],
  text: ["text", "tone"],
  metric: ["label", "value", "tone", "caption"],
  table: ["columns", "rows"],
  chart: ["kind", "categories", "series", "unit", "caption"],
  progress: ["label", "percent", "value", "max", "valueLabel", "tone"],
  callout: ["text", "tone"],
  sources: ["items"],
  html: ["html", "summary", "height"],
  slider: ["id", "label", "min", "max", "step", "value", "unit"],
  choice: ["id", "label", "options", "value"],
  toggle: ["id", "label", "value"],
  number: ["id", "label", "min", "max", "step", "value", "unit"],
  options: ["id", "options", "multi"],
  confirm: ["id", "confirmLabel", "cancelLabel"],
  form: ["id", "fields", "submitLabel"],
  submit: ["id", "label"]
};
var MAX_DEPTH = 8;
var MAX_NODES = 64;
var MAX_CHILDREN = 16;
var MAX_TEXT = 2e3;
var MAX_CELL = 200;
var MAX_COLUMNS = 8;
var MAX_ROWS = 50;
var MAX_OPTIONS = 8;
var MAX_FIELDS = 6;
var SUMMARY_PART = 40;
var SUMMARY_COUNT = 8;
var RESERVED = /* @__PURE__ */ new Set(["true", "false"]);
var VIEW_BYTE_LIMIT = 8192;
var isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
var quoted = (value) => JSON.stringify(value);
var allowed = (list) => list.join(", ");
var isNumber = (value) => typeof value === "number" && Number.isFinite(value);
var isScalar = (value) => typeof value === "string" || typeof value === "boolean" || isNumber(value);
var isFormula = (value) => isRecord(value) && Object.keys(value).length === 1 && Object.hasOwn(value, "=");
function viewBytes(title, view) {
  return new TextEncoder().encode(`${JSON.stringify(view) ?? ""}${title ?? ""}`).length;
}
var NUMERIC = ["value", "percent", "min", "max", "step", "height"];
var numeric = (value) => typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value)) ? Number(value) : value;
function normalizeView(value) {
  if (Array.isArray(value)) return value.map(normalizeView);
  if (!isRecord(value)) return value;
  const keys = Object.keys(value);
  if (keys.length === 1 && keys[0] === "item") {
    const inner = normalizeView(value.item);
    if (Array.isArray(inner)) return inner;
  }
  const out = {};
  for (const key of keys) Object.defineProperty(out, key, { value: normalizeView(value[key]), writable: true, enumerable: true, configurable: true });
  for (const field of NUMERIC) if (Object.hasOwn(out, field)) out[field] = numeric(out[field]);
  if (Array.isArray(out.values)) out.values = out.values.map(numeric);
  return out;
}
function validateView(view) {
  const ctx = { ids: /* @__PURE__ */ new Set(), nodes: 0, interactive: false, inputs: /* @__PURE__ */ new Map(), lets: /* @__PURE__ */ new Map(), formulas: [] };
  const error = checkNode(view, "view", 1, ctx) ?? checkFormulas(ctx);
  return error === void 0 ? { ok: true, interactive: ctx.interactive } : { ok: false, error };
}
function checkShownView(title, sent) {
  let bytes;
  try {
    bytes = viewBytes(title, sent);
  } catch {
    return { error: "The view is not JSON data." };
  }
  if (bytes > VIEW_BYTE_LIMIT) return { error: `The view is ${bytes} bytes; the limit is ${VIEW_BYTE_LIMIT}.` };
  if (title !== void 0 && title !== null && typeof title !== "string") return { error: "title: expected a string" };
  const named = String(title ?? "").trim();
  const view = normalizeView(sent);
  const checked = validateView(view);
  if (!checked.ok) return { error: checked.error };
  return { title: named, view, interactive: checked.interactive };
}
function checkNode(node, path, depth, ctx) {
  if (!isRecord(node)) return `${path}: expected a component object`;
  if (depth > MAX_DEPTH) return `${path}: ${depth} levels exceeds the limit of ${MAX_DEPTH}`;
  ctx.nodes += 1;
  if (ctx.nodes > MAX_NODES) return `${path}: ${ctx.nodes} components exceeds the limit of ${MAX_NODES}`;
  const type = node.type;
  if (!COMPONENTS.includes(type)) return `${path}.type: unknown component ${quoted(type)}; allowed: ${allowed(COMPONENTS)}`;
  const props = PROPS[type];
  for (const key of Object.keys(node)) {
    if (key === "type" || props.includes(key)) continue;
    return `${path}.${key}: unknown property ${quoted(key)}; allowed: ${allowed(props)}`;
  }
  if (INTERACTIVE.has(type)) ctx.interactive = true;
  switch (type) {
    case "stack":
    case "row":
      return checkLayout(node, path, depth, ctx);
    case "text":
      return checkText(node, path, ctx);
    case "metric":
      return checkMetric(node, path, ctx);
    case "table":
      return checkTable(node, path, ctx);
    case "chart":
      return checkChart(node, path, ctx);
    case "progress":
      return checkProgress(node, path, ctx);
    case "callout":
      return checkCallout(node, path, ctx);
    case "sources":
      return checkSources(node, path);
    case "html":
      return checkHtml(node, path);
    case "slider":
    case "number":
      return checkNumberInput(node, path, ctx);
    case "choice":
      return checkChoice(node, path, ctx);
    case "toggle":
      return checkToggle(node, path, ctx);
    case "options":
      return checkOptions(node, path, ctx);
    case "confirm":
      return checkConfirm(node, path, ctx);
    case "form":
      return checkForm(node, path, ctx);
    default:
      return checkSubmit(node, path, ctx);
  }
}
function checkLayout(node, path, depth, ctx) {
  if (node.let !== void 0) {
    if (depth !== 1) return `${path}.let: only the outermost component can define names`;
    if (!isRecord(node.let)) return `${path}.let: expected an object of names to formulas`;
    for (const [name, source] of Object.entries(node.let)) {
      if (!isName(name) || RESERVED.has(name)) return `${path}.let.${name}: a name is letters, digits and _, and starts with a letter or _`;
      if (typeof source !== "string") return `${path}.let.${name}: expected a formula string`;
      ctx.lets.set(name, { source, path: `${path}.let.${name}` });
    }
  }
  if (!Array.isArray(node.children)) return `${path}.children: expected an array of 1 to ${MAX_CHILDREN} components`;
  if (node.children.length < 1 || node.children.length > MAX_CHILDREN) return `${path}.children: expected 1 to ${MAX_CHILDREN} children; got ${node.children.length}`;
  for (let index = 0; index < node.children.length; index += 1) {
    const error = checkNode(node.children[index], `${path}.children[${index}]`, depth + 1, ctx);
    if (error !== void 0) return error;
  }
  return void 0;
}
function checkValue(node, key, path, ctx, kind, { required = false, max = MAX_TEXT } = {}) {
  const value = node[key];
  const at = `${path}.${key}`;
  if (value === void 0) return required ? `${at}: ${expected(kind)}` : void 0;
  if (isFormula(value)) {
    ctx.formulas.push({ source: value["="], path: at, kind });
    return void 0;
  }
  if (kind === "number") return isNumber(value) ? void 0 : `${at}: ${expected(kind)}`;
  if (Array.isArray(kind)) return kind.includes(value) ? void 0 : `${at}: unknown tone ${quoted(value)}; allowed: ${allowed(kind)}`;
  if (kind === "string") {
    if (typeof value !== "string") return `${at}: ${expected(kind)}`;
    return value.length > max ? `${at}: ${value.length} characters exceeds the limit of ${max}` : void 0;
  }
  if (!isScalar(value)) return `${at}: ${expected(kind)}`;
  return void 0;
}
var expected = (kind) => kind === "number" ? "expected a number" : kind === "string" ? "expected a string" : Array.isArray(kind) ? `expected one of ${allowed(kind)}` : "expected a string or a number";
function checkText(node, path, ctx) {
  return checkValue(node, "text", path, ctx, "string", { required: true }) ?? checkValue(node, "tone", path, ctx, TEXT_TONES);
}
function checkMetric(node, path, ctx) {
  if (typeof node.label !== "string") return `${path}.label: expected a string`;
  if (node.value === void 0) return `${path}.value: expected a string or a number`;
  if (typeof node.value === "number" && !Number.isFinite(node.value)) return `${path}.value: expected a finite number`;
  return checkValue(node, "value", path, ctx, "scalar") ?? checkValue(node, "tone", path, ctx, TONES) ?? checkValue(node, "caption", path, ctx, "string");
}
function checkTable(node, path, ctx) {
  if (!Array.isArray(node.columns)) return `${path}.columns: expected an array of at most ${MAX_COLUMNS} columns`;
  if (node.columns.length > MAX_COLUMNS) return `${path}.columns: ${node.columns.length} columns exceeds the limit of ${MAX_COLUMNS}`;
  for (let index = 0; index < node.columns.length; index += 1) {
    const column = node.columns[index];
    const at = `${path}.columns[${index}]`;
    if (!isRecord(column)) return `${at}: expected a column object`;
    for (const key of Object.keys(column)) {
      if (key !== "key" && key !== "label") return `${at}.${key}: unknown property ${quoted(key)}; allowed: key, label`;
    }
    if (typeof column.key !== "string" || column.key === "") return `${at}.key: expected a non-empty string`;
    if (typeof column.label !== "string") return `${at}.label: expected a string`;
  }
  if (!Array.isArray(node.rows)) return `${path}.rows: expected an array of at most ${MAX_ROWS} rows`;
  if (node.rows.length > MAX_ROWS) return `${path}.rows: ${node.rows.length} rows exceeds the limit of ${MAX_ROWS}`;
  for (let row = 0; row < node.rows.length; row += 1) {
    const cells = node.rows[row];
    if (!Array.isArray(cells)) return `${path}.rows[${row}]: expected an array of cells`;
    for (let column = 0; column < cells.length; column += 1) {
      const at = `${path}.rows[${row}][${column}]`;
      if (isFormula(cells[column])) {
        ctx.formulas.push({ source: cells[column]["="], path: at, kind: "scalar" });
        continue;
      }
      const text = cellText(cells[column]);
      if (text.length > MAX_CELL) return `${at}: ${text.length} characters exceeds the limit of ${MAX_CELL}`;
    }
  }
  return void 0;
}
function checkChart(node, path, ctx) {
  if (node.kind !== void 0 && !CHART_KINDS.includes(node.kind)) return `${path}.kind: unknown chart ${quoted(node.kind)}; allowed: ${allowed(CHART_KINDS)}`;
  if (!Array.isArray(node.categories) || node.categories.length === 0) return `${path}.categories: expected a non-empty array of labels`;
  for (let index = 0; index < node.categories.length; index += 1) {
    const label = node.categories[index];
    if (typeof label !== "string" && !isNumber(label)) return `${path}.categories[${index}]: expected a string`;
  }
  if (!Array.isArray(node.series) || node.series.length === 0) return `${path}.series: expected a non-empty array of { name?, values }`;
  if (node.kind === "donut" && node.series.length > 1) return `${path}.series: a donut takes one series; got ${node.series.length}`;
  for (let index = 0; index < node.series.length; index += 1) {
    const series = node.series[index];
    const at = `${path}.series[${index}]`;
    if (!isRecord(series)) return `${at}: expected a series object`;
    for (const key of Object.keys(series)) {
      if (key !== "name" && key !== "values") return `${at}.${key}: unknown property ${quoted(key)}; allowed: name, values`;
    }
    if (series.name !== void 0 && typeof series.name !== "string") return `${at}.name: expected a string`;
    if (!Array.isArray(series.values)) return `${at}.values: expected an array of numbers`;
    if (series.values.length !== node.categories.length) return `${at}.values: ${series.values.length} values for ${node.categories.length} categories`;
    for (let item = 0; item < series.values.length; item += 1) {
      const value = series.values[item];
      if (isFormula(value)) ctx.formulas.push({ source: value["="], path: `${at}.values[${item}]`, kind: "number" });
      else if (!isNumber(value)) return `${at}.values[${item}]: expected a number`;
    }
  }
  if (node.unit !== void 0 && typeof node.unit !== "string") return `${path}.unit: expected a string`;
  if (node.caption !== void 0 && typeof node.caption !== "string") return `${path}.caption: expected a string`;
  return void 0;
}
function checkProgress(node, path, ctx) {
  if (node.label !== void 0 && typeof node.label !== "string") return `${path}.label: expected a string`;
  if (node.percent === void 0 === (node.value === void 0)) return `${path}: give percent (0 to 100), or value with max`;
  if (node.percent !== void 0 && !isFormula(node.percent)) {
    if (typeof node.percent !== "number" || !Number.isFinite(node.percent) || node.percent < 0 || node.percent > 100) return `${path}.percent: expected a number from 0 to 100`;
  }
  if (node.value !== void 0 && node.max === void 0) return `${path}.max: expected a number with value`;
  if (node.value === void 0 && node.max !== void 0) return `${path}.value: expected a number with max`;
  return checkValue(node, "percent", path, ctx, "number") ?? checkValue(node, "value", path, ctx, "number") ?? checkValue(node, "max", path, ctx, "number") ?? checkValue(node, "valueLabel", path, ctx, "scalar") ?? checkValue(node, "tone", path, ctx, TONES);
}
function checkCallout(node, path, ctx) {
  return checkValue(node, "text", path, ctx, "string", { required: true }) ?? checkValue(node, "tone", path, ctx, CALLOUT_TONES);
}
function checkSources(node, path) {
  if (!Array.isArray(node.items) || node.items.length === 0) return `${path}.items: expected a non-empty array of { label, url }`;
  for (let index = 0; index < node.items.length; index += 1) {
    const item = node.items[index];
    const at = `${path}.items[${index}]`;
    if (!isRecord(item)) return `${at}: expected a { label, url } object`;
    for (const key of Object.keys(item)) {
      if (key !== "label" && key !== "url") return `${at}.${key}: unknown property ${quoted(key)}; allowed: label, url`;
    }
    if (typeof item.label !== "string" || item.label.trim() === "") return `${at}.label: expected a non-empty string`;
    if (typeof item.url !== "string" || !/^https?:\/\/[^\s]+$/i.test(item.url)) return `${at}.url: expected an http(s) address`;
  }
  return void 0;
}
function checkHtml(node, path) {
  if (typeof node.html !== "string" || node.html.trim() === "") return `${path}.html: expected a non-empty string`;
  if (typeof node.summary !== "string" || node.summary.trim() === "") return `${path}.summary: expected one line that says what the view shows`;
  if (node.height !== void 0 && (!isNumber(node.height) || node.height <= 0)) return `${path}.height: expected a positive number of pixels`;
  return void 0;
}
function checkInputId(node, path, ctx) {
  if (!isName(node.id) || RESERVED.has(node.id)) return `${path}.id: an input id is letters, digits and _, and starts with a letter or _, so formulas can use it`;
  if (ctx.ids.has(node.id)) return `${path}.id: duplicate id ${quoted(node.id)}`;
  ctx.ids.add(node.id);
  if (typeof node.label !== "string") return `${path}.label: expected a string`;
  return void 0;
}
function checkNumberInput(node, path, ctx) {
  const idError = checkInputId(node, path, ctx);
  if (idError !== void 0) return idError;
  for (const key of ["min", "max", "step"]) {
    if (node[key] !== void 0 && !isNumber(node[key])) return `${path}.${key}: expected a number`;
  }
  if (node.type === "slider" && (node.min === void 0 || node.max === void 0)) return `${path}: a slider needs min and max`;
  if (node.min !== void 0 && node.max !== void 0 && node.max <= node.min) return `${path}.max: expected more than min (${node.min})`;
  if (node.step !== void 0 && node.step <= 0) return `${path}.step: expected more than 0`;
  if (!isNumber(node.value)) return `${path}.value: expected a number`;
  if (node.min !== void 0 && node.value < node.min || node.max !== void 0 && node.value > node.max) return `${path}.value: expected a number from ${node.min ?? "-∞"} to ${node.max ?? "∞"}`;
  if (node.unit !== void 0 && typeof node.unit !== "string") return `${path}.unit: expected a string`;
  ctx.inputs.set(node.id, node.value);
  return void 0;
}
function checkChoice(node, path, ctx) {
  const idError = checkInputId(node, path, ctx);
  if (idError !== void 0) return idError;
  if (!Array.isArray(node.options) || node.options.length === 0) return `${path}.options: expected a non-empty array of { label, value }`;
  const labels = /* @__PURE__ */ new Set();
  const values = /* @__PURE__ */ new Set();
  for (let index = 0; index < node.options.length; index += 1) {
    const option = node.options[index];
    const at = `${path}.options[${index}]`;
    if (!isRecord(option)) return `${at}: expected a { label, value } object`;
    for (const key of Object.keys(option)) {
      if (key !== "label" && key !== "value") return `${at}.${key}: unknown property ${quoted(key)}; allowed: label, value`;
    }
    if (typeof option.label !== "string" || option.label.trim() === "") return `${at}.label: expected a non-empty string`;
    if (labels.has(option.label)) return `${at}.label: duplicate label ${quoted(option.label)}`;
    labels.add(option.label);
    const value = option.value ?? option.label;
    if (!isScalar(value)) return `${at}.value: expected a string, a number or true/false`;
    if (values.has(value)) return `${at}.value: duplicate value ${quoted(value)}`;
    values.add(value);
  }
  const chosen = node.value ?? choiceValue(node.options[0]);
  if (!values.has(chosen)) return `${path}.value: expected one of the options' values`;
  ctx.inputs.set(node.id, chosen);
  return void 0;
}
function checkToggle(node, path, ctx) {
  const idError = checkInputId(node, path, ctx);
  if (idError !== void 0) return idError;
  if (node.value !== void 0 && typeof node.value !== "boolean") return `${path}.value: expected true or false`;
  ctx.inputs.set(node.id, node.value === true);
  return void 0;
}
function checkOptions(node, path, ctx) {
  const idError = checkId(node, path, ctx);
  if (idError !== void 0) return idError;
  if (node.multi !== void 0 && typeof node.multi !== "boolean") return `${path}.multi: expected a boolean`;
  if (!Array.isArray(node.options)) return `${path}.options: expected an array of 1 to ${MAX_OPTIONS} options`;
  if (node.options.length < 1 || node.options.length > MAX_OPTIONS) return `${path}.options: expected 1 to ${MAX_OPTIONS} options; got ${node.options.length}`;
  const labels = /* @__PURE__ */ new Set();
  for (let index = 0; index < node.options.length; index += 1) {
    const option = node.options[index];
    const at = `${path}.options[${index}]`;
    if (!isRecord(option)) return `${at}: expected an option object`;
    for (const key of Object.keys(option)) {
      if (key !== "label" && key !== "description") return `${at}.${key}: unknown property ${quoted(key)}; allowed: label, description`;
    }
    if (typeof option.label !== "string" || option.label.trim() === "") return `${at}.label: expected a non-empty string`;
    if (labels.has(option.label)) return `${at}.label: duplicate label ${quoted(option.label)}`;
    labels.add(option.label);
    if (option.description !== void 0 && typeof option.description !== "string") return `${at}.description: expected a string`;
  }
  return void 0;
}
function checkConfirm(node, path, ctx) {
  const idError = checkId(node, path, ctx);
  if (idError !== void 0) return idError;
  if (node.confirmLabel !== void 0 && typeof node.confirmLabel !== "string") return `${path}.confirmLabel: expected a string`;
  if (node.cancelLabel !== void 0 && typeof node.cancelLabel !== "string") return `${path}.cancelLabel: expected a string`;
  return void 0;
}
function checkForm(node, path, ctx) {
  const idError = checkId(node, path, ctx);
  if (idError !== void 0) return idError;
  if (node.submitLabel !== void 0 && typeof node.submitLabel !== "string") return `${path}.submitLabel: expected a string`;
  if (!Array.isArray(node.fields)) return `${path}.fields: expected an array of at most ${MAX_FIELDS} fields`;
  if (node.fields.length > MAX_FIELDS) return `${path}.fields: ${node.fields.length} fields exceeds the limit of ${MAX_FIELDS}`;
  const seen = /* @__PURE__ */ new Set();
  for (let index = 0; index < node.fields.length; index += 1) {
    const field = node.fields[index];
    const at = `${path}.fields[${index}]`;
    if (!isRecord(field)) return `${at}: expected a field object`;
    for (const key of Object.keys(field)) {
      if (key !== "id" && key !== "label" && key !== "placeholder") return `${at}.${key}: unknown property ${quoted(key)}; allowed: id, label, placeholder`;
    }
    if (typeof field.id !== "string" || field.id === "") return `${at}.id: expected a non-empty string`;
    if (field.id === "__proto__") return `${at}.id: "__proto__" cannot be an id`;
    if (seen.has(field.id)) return `${at}.id: duplicate field id ${quoted(field.id)}`;
    seen.add(field.id);
    if (typeof field.label !== "string") return `${at}.label: expected a string`;
    if (field.placeholder !== void 0 && typeof field.placeholder !== "string") return `${at}.placeholder: expected a string`;
  }
  return void 0;
}
function checkSubmit(node, path, ctx) {
  const idError = checkId(node, path, ctx);
  if (idError !== void 0) return idError;
  if (node.label !== void 0 && typeof node.label !== "string") return `${path}.label: expected a string`;
  return void 0;
}
function checkId(node, path, ctx) {
  if (typeof node.id !== "string" || node.id === "") return `${path}.id: expected a non-empty string`;
  if (node.id === "__proto__") return `${path}.id: "__proto__" cannot be an id`;
  if (ctx.ids.has(node.id)) return `${path}.id: duplicate id ${quoted(node.id)}`;
  ctx.ids.add(node.id);
  return void 0;
}
function checkFormulas(ctx) {
  const known = /* @__PURE__ */ new Set([...ctx.inputs.keys(), ...ctx.lets.keys()]);
  const lets = /* @__PURE__ */ new Map();
  for (const [name, entry] of ctx.lets) {
    if (ctx.inputs.has(name)) return `${entry.path}: ${quoted(name)} is already an input id`;
    const compiled2 = compileFormula(entry.source);
    if (compiled2.error !== void 0) return `${entry.path}: ${compiled2.error}`;
    const unknown = compiled2.names.find((item) => !known.has(item));
    if (unknown !== void 0) return `${entry.path}: unknown name ${quoted(unknown)}; known: ${allowed([...known]) || "(none)"}`;
    lets.set(name, compiled2.tree);
  }
  const lookup = createScope(ctx.inputs, lets);
  for (const [name, entry] of ctx.lets) {
    const result = evaluate(lets.get(name), lookup);
    if (result.error !== void 0) return `${entry.path}: ${result.error}`;
  }
  for (const formula of ctx.formulas) {
    const compiled2 = compileFormula(formula.source);
    if (compiled2.error !== void 0) return `${formula.path}: ${compiled2.error}`;
    const unknown = compiled2.names.find((item) => !known.has(item));
    if (unknown !== void 0) return `${formula.path}: unknown name ${quoted(unknown)}; known: ${allowed([...known]) || "(none)"}`;
    const result = evaluate(compiled2.tree, lookup);
    if (result.error !== void 0) return `${formula.path}: ${result.error}`;
    const problem = kindProblem(result.value, formula.kind);
    if (problem !== void 0) return `${formula.path}: the formula gives ${quoted(result.value)}; ${problem}`;
  }
  return void 0;
}
function kindProblem(value, kind) {
  if (kind === "number") return isNumber(value) ? void 0 : "expected a number";
  if (Array.isArray(kind)) return kind.includes(value) ? void 0 : `expected one of ${allowed(kind)}`;
  if (kind === "string") return isScalar(value) ? void 0 : "expected text";
  return isScalar(value) ? void 0 : "expected a string or a number";
}
function cellText(value) {
  if (typeof value === "string") return value;
  const text = JSON.stringify(value);
  return typeof text === "string" ? text : "";
}
var compiled = /* @__PURE__ */ new WeakMap();
var treeOf = (formula) => {
  let entry = compiled.get(formula);
  if (entry === void 0) {
    entry = compileFormula(formula["="]);
    compiled.set(formula, entry);
  }
  return entry;
};
var choiceValue = (option) => option?.value ?? option?.label;
function walk(node, visit) {
  if (!isRecord(node)) return;
  visit(node);
  if (LAYOUT.includes(node.type) && Array.isArray(node.children)) for (const child of node.children) walk(child, visit);
}
function viewInputs(view) {
  const found = [];
  walk(view, (node) => {
    if (INPUTS.has(node.type)) found.push(node);
  });
  return found;
}
function inputDefault(node) {
  if (node.type === "toggle") return node.value === true;
  if (node.type === "choice") return node.value ?? choiceValue(Array.isArray(node.options) ? node.options[0] : void 0);
  return node.value;
}
var hasInputs = (view) => viewInputs(view).length > 0;
function viewScope(view, values = {}) {
  const inputs = /* @__PURE__ */ new Map();
  for (const node of viewInputs(view)) inputs.set(node.id, Object.hasOwn(values, node.id) ? values[node.id] : inputDefault(node));
  const lets = /* @__PURE__ */ new Map();
  for (const [name, source] of Object.entries(isRecord(view?.let) ? view.let : {})) {
    const entry = compileFormula(source);
    if (entry.tree !== void 0) lets.set(name, entry.tree);
  }
  return createScope(inputs, lets);
}
function resolve(value, lookup, fallback = void 0) {
  if (!isFormula(value)) return value;
  const entry = treeOf(value);
  if (entry.tree === void 0) return fallback;
  const result = evaluate(entry.tree, lookup);
  return result.error === void 0 ? result.value : fallback;
}
var asText = (value) => value === void 0 || value === null ? "" : show(value);
function clip(text) {
  const flat = String(text).replace(/\s+/g, " ").trim();
  return flat.length <= SUMMARY_PART ? flat : flat.slice(0, SUMMARY_PART);
}
var choiceLabel = (node, value) => (Array.isArray(node.options) ? node.options : []).find((option) => choiceValue(option) === value)?.label ?? asText(value);
function inputText(node, value) {
  if (node.type === "toggle") return value === true ? "on" : "off";
  if (node.type === "choice") return choiceLabel(node, value);
  return `${asText(value)}${node.unit ? ` ${node.unit}` : ""}`;
}
function progressPercent(node, lookup) {
  if (node.percent !== void 0) return Number(resolve(node.percent, lookup, 0));
  const max = Number(resolve(node.max, lookup, 0));
  return max > 0 ? Number(resolve(node.value, lookup, 0)) / max * 100 : 0;
}
function componentSummary(node, lookup) {
  const value = (item) => asText(resolve(item, lookup, ""));
  switch (node.type) {
    case "text":
      return `text: ${value(node.text)}`;
    case "metric":
      return `metric: ${node.label}=${value(node.value)}`;
    case "table":
      return `table: ${(Array.isArray(node.columns) ? node.columns : []).map((column) => column?.label ?? column?.key ?? "").filter(Boolean).join("/")}`;
    case "chart": {
      const series = Array.isArray(node.series) ? node.series[0] : void 0;
      const values = Array.isArray(series?.values) ? series.values : [];
      const unit = node.unit ? ` ${node.unit}` : "";
      return `chart: ${(Array.isArray(node.categories) ? node.categories : []).map((label, index) => `${label}=${value(values[index])}${unit}`).join(", ")}`;
    }
    case "progress":
      return `progress: ${node.label ? `${node.label} ` : ""}${Math.round(progressPercent(node, lookup))}%`;
    case "callout":
      return `callout: ${value(node.text)}`;
    case "sources":
      return `sources: ${(Array.isArray(node.items) ? node.items : []).map((item) => item?.label).filter(Boolean).join("/")}`;
    case "html":
      return `html: ${node.summary ?? ""}`;
    case "slider":
    case "number":
    case "choice":
    case "toggle":
      return `${node.type}: ${node.label}=${inputText(node, inputDefault(node))}`;
    case "options":
      return `options: ${(Array.isArray(node.options) ? node.options : []).map((option) => option?.label).filter(Boolean).join("/")}`;
    case "confirm":
      return "confirm";
    case "form":
      return `form: ${(Array.isArray(node.fields) ? node.fields : []).map((field) => field?.label ?? field?.id).filter(Boolean).join("/")}`;
    case "submit":
      return `submit: ${node.label ?? "Send"}`;
    default:
      return void 0;
  }
}
function viewSummary(view) {
  const parts = [];
  const lookup = viewScope(view);
  const visit = (node) => {
    if (parts.length >= SUMMARY_COUNT || !isRecord(node)) return;
    const line = componentSummary(node, lookup);
    if (line !== void 0) parts.push(clip(line));
    if (parts.length >= SUMMARY_COUNT || !LAYOUT.includes(node.type) || !Array.isArray(node.children)) return;
    for (const child of node.children) visit(child);
  };
  visit(view);
  return parts.join("; ");
}
function inputsSummary(view, inputs) {
  if (!isRecord(inputs)) return "";
  return viewInputs(view).filter((node) => Object.hasOwn(inputs, node.id)).map((node) => `${node.label || node.id}=${inputText(node, inputs[node.id])}`).join("; ");
}
function interactiveNodes(node, found = []) {
  walk(node, (item) => {
    if (INTERACTIVE.has(item.type)) found.push(item);
  });
  return found;
}
function validateViewAnswer(view, action, values) {
  const nodes = interactiveNodes(view);
  if (typeof action !== "string" || action === "") return { error: `action: expected an interactive component id; allowed: ${allowed(nodes.map((node2) => node2.id))}` };
  const node = nodes.find((item) => item.id === action);
  if (node === void 0) return { error: `action: no interactive component with id ${quoted(action)}; allowed: ${allowed(nodes.map((item) => item.id))}` };
  if (!isRecord(values)) return { error: "values: expected an object" };
  const inputs = validateInputs(view, values.inputs);
  if (inputs.error !== void 0) return inputs;
  const extra = inputs.inputs === void 0 ? {} : { inputs: inputs.inputs };
  if (node.type === "submit") return { ...extra };
  const own = node.type === "options" ? validateOptions(node, values) : node.type === "confirm" ? validateConfirm(values) : validateForm(node, values);
  return own.error === void 0 ? { ...own, ...extra } : own;
}
function validateInputs(view, sent) {
  const nodes = viewInputs(view);
  if (nodes.length === 0) return sent === void 0 ? {} : { error: "values.inputs: this view has no inputs" };
  if (sent !== void 0 && !isRecord(sent)) return { error: "values.inputs: expected an object of input ids to values" };
  const given = sent ?? {};
  const ids = nodes.map((node) => node.id);
  const unknown = Object.keys(given).find((key) => !ids.includes(key));
  if (unknown !== void 0) return { error: `values.inputs.${unknown}: unknown input; allowed: ${allowed(ids)}` };
  const inputs = {};
  for (const node of nodes) {
    const value = Object.hasOwn(given, node.id) ? given[node.id] : inputDefault(node);
    const at = `values.inputs.${node.id}`;
    if (node.type === "toggle" && typeof value !== "boolean") return { error: `${at}: expected true or false` };
    if (node.type === "choice" && !(Array.isArray(node.options) ? node.options : []).some((option) => choiceValue(option) === value)) return { error: `${at}: expected one of the options' values` };
    if (node.type === "slider" || node.type === "number") {
      if (!isNumber(value)) return { error: `${at}: expected a number` };
      if (node.min !== void 0 && value < node.min || node.max !== void 0 && value > node.max) return { error: `${at}: expected a number from ${node.min ?? "-∞"} to ${node.max ?? "∞"}` };
    }
    inputs[node.id] = value;
  }
  return { inputs };
}
function validateOptions(node, values) {
  if (!Array.isArray(values.selected)) return { error: "values.selected: expected an array of option labels" };
  const labels = new Set((node.options ?? []).map((option) => option?.label));
  const picked = values.selected.filter((label) => typeof label === "string" && labels.has(label));
  const selected = node.multi === true ? [...new Set(picked)] : picked.slice(0, 1);
  if (selected.length === 0) return { error: "values.selected: select at least one option" };
  return { selected };
}
function validateConfirm(values) {
  if (typeof values.confirmed !== "boolean") return { error: "values.confirmed: expected a boolean" };
  return { confirmed: values.confirmed };
}
function validateForm(node, values) {
  if (!isRecord(values.fields)) return { error: "values.fields: expected an object of field ids to strings" };
  const declared = (node.fields ?? []).map((field) => field?.id).filter((id) => typeof id === "string");
  const allowedIds = new Set(declared);
  const fields = {};
  for (const [key, value] of Object.entries(values.fields)) {
    if (!allowedIds.has(key)) return { error: `values.fields.${key}: unknown field; allowed: ${allowed(declared)}` };
    if (typeof value !== "string") return { error: `values.fields.${key}: expected a string` };
    if (value.length > MAX_TEXT) return { error: `values.fields.${key}: ${value.length} characters exceeds the limit of ${MAX_TEXT}` };
    fields[key] = value;
  }
  return { fields };
}

// src/react/chart.js
var import_react2 = require("react");
var PALETTE = ["var(--dui-accent)", "var(--dui-ink-tangerine)", "var(--dui-ink-green)", "var(--dui-ink-violet)", "var(--dui-ink-sky)", "var(--dui-ink-rose)", "var(--dui-ink-yellow)", "var(--dui-ink-cyan)", "var(--dui-ink-magenta)"];
var colorAt = (index) => PALETTE[index % PALETTE.length];
var TICK = 10;
var LABEL = 11;
var textWidth = (text, size) => [...String(text)].reduce((sum, char) => sum + (char.charCodeAt(0) > 11904 ? size : size * 0.58), 0);
var fit = (text, room, size) => {
  if (textWidth(text, size) <= room) return text;
  let out = "";
  for (const char of String(text)) {
    if (textWidth(`${out}${char}…`, size) > room) break;
    out += char;
  }
  return out === "" ? "" : `${out}…`;
};
function formatNumber(value) {
  if (!Number.isFinite(value)) return asText(value);
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return Number(value.toFixed(digits)).toLocaleString("en-US", { maximumFractionDigits: digits });
}
var withUnit = (value, unit) => unit ? unit === "%" ? `${formatNumber(value)}%` : `${formatNumber(value)} ${unit}` : formatNumber(value);
function niceTicks(low, high) {
  let lo = low;
  let hi = high;
  if (lo === hi) {
    lo = Math.min(0, lo);
    hi = hi === 0 ? 1 : Math.max(0, hi);
  }
  if (lo === hi) hi = lo + 1;
  const raw = (hi - lo) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((scale) => scale * magnitude).find((candidate) => candidate >= raw);
  const start = Math.floor(lo / step + 1e-9) * step;
  const end = Math.ceil(hi / step - 1e-9) * step;
  const ticks = [];
  for (let value = start; value <= end + step / 2; value += step) ticks.push(Number(value.toPrecision(12)));
  return ticks;
}
function chartData(node, lookup) {
  const categories = (Array.isArray(node.categories) ? node.categories : []).map(asText);
  const series = (Array.isArray(node.series) ? node.series : []).map((item, index) => ({
    name: typeof item?.name === "string" ? item.name : "",
    color: colorAt(index),
    values: categories.map((_, at) => {
      const value = Number(resolve(Array.isArray(item?.values) ? item.values[at] : void 0, lookup, 0));
      return Number.isFinite(value) ? value : 0;
    })
  }));
  return { kind: node.kind ?? "bar", categories, series, unit: typeof node.unit === "string" ? node.unit : "" };
}
var csvCell = (value) => /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
function chartCsv({ categories, series, unit }, t = (key) => key) {
  const head = ["", ...series.map((item, index) => item.name || (series.length === 1 ? unit || t("Value") : `${t("Series")} ${index + 1}`))];
  const rows2 = categories.map((label, at) => [label, ...series.map((item) => String(item.values[at]))]);
  return [head, ...rows2].map((row) => row.map((cell) => csvCell(String(cell))).join(",")).join("\n");
}
function valueAxis(values, zero) {
  const finite = values.length > 0 ? values : [0];
  const low = Math.min(...finite);
  const high = Math.max(...finite);
  if (zero) return niceTicks(Math.min(0, low), Math.max(0, high));
  const pad = (high - low) * 0.1 || Math.abs(high) * 0.1 || 1;
  return niceTicks(low - pad, high + pad);
}
function columns({ categories, series, unit, kind }, width, active, shown) {
  const visible = series.filter((_, index) => shown[index]);
  const ticks = valueAxis(visible.flatMap((item) => item.values), kind !== "line");
  const lo = ticks[0];
  const hi = ticks.at(-1);
  const left = Math.ceil(Math.max(...ticks.map((tick) => textWidth(withUnit(tick, unit), TICK)))) + 10;
  const top = 8;
  const height = 220;
  const bottom = 24;
  const plot = { x: left, y: top, w: Math.max(40, width - left - 4), h: height - top - bottom };
  const y = (value) => plot.y + plot.h - (value - lo) / (hi - lo) * plot.h;
  const band = plot.w / categories.length;
  const parts = [];
  for (const tick of ticks) {
    parts.push((0, import_react2.createElement)("line", { key: `g${tick}`, className: "dui-chart-grid", x1: plot.x, x2: plot.x + plot.w, y1: y(tick), y2: y(tick) }));
    parts.push((0, import_react2.createElement)("text", { key: `t${tick}`, className: "dui-chart-tick", x: plot.x - 8, y: y(tick) + 3, textAnchor: "end" }, withUnit(tick, unit)));
  }
  const points = [];
  categories.forEach((label, at) => {
    const cx = plot.x + band * at + band / 2;
    parts.push((0, import_react2.createElement)("text", { key: `c${at}`, className: "dui-chart-label", x: cx, y: height - 7, textAnchor: "middle" }, fit(label, band - 4, LABEL)));
    points.push({ x: cx, y: y(Math.max(...visible.map((item) => item.values[at]), lo)) });
  });
  if (kind === "bar") {
    const group = band * 0.72;
    const gap = visible.length > 1 ? 2 : 0;
    const barW = Math.max(2, (group - gap * (visible.length - 1)) / visible.length);
    const zero = y(Math.max(lo, Math.min(0, hi)));
    categories.forEach((_, at) => {
      visible.forEach((item, row) => {
        const value = item.values[at];
        const x = plot.x + band * at + (band - group) / 2 + row * (barW + gap);
        const top2 = Math.min(y(value), zero);
        const tall = Math.max(1, Math.abs(y(value) - zero));
        const r = Math.min(4, barW / 2, tall);
        const up = value >= 0;
        const d = up ? `M${x},${top2 + tall}V${top2 + r}q0,-${r} ${r},-${r}h${barW - 2 * r}q${r},0 ${r},${r}V${top2 + tall}z` : `M${x},${top2}V${top2 + tall - r}q0,${r} ${r},${r}h${barW - 2 * r}q${r},0 ${r},-${r}V${top2}z`;
        parts.push((0, import_react2.createElement)("path", { key: `b${at}-${row}`, className: "dui-chart-mark", "data-dim": active !== null && active !== at ? "" : void 0, d, style: { fill: item.color } }));
      });
    });
  } else {
    const xs = categories.map((_, at) => plot.x + band * at + band / 2);
    visible.forEach((item, row) => {
      const line = item.values.map((value, at) => `${at === 0 ? "M" : "L"}${xs[at]},${y(value)}`).join("");
      if (kind === "area") {
        const base = y(Math.max(lo, Math.min(0, hi)));
        parts.push((0, import_react2.createElement)("path", { key: `a${row}`, className: "dui-chart-area", d: `${line}L${xs.at(-1)},${base}L${xs[0]},${base}z`, style: { fill: item.color } }));
      }
      parts.push((0, import_react2.createElement)("path", { key: `l${row}`, className: "dui-chart-line", d: line, style: { stroke: item.color } }));
      item.values.forEach((value, at) => {
        parts.push((0, import_react2.createElement)("circle", { key: `p${row}-${at}`, className: "dui-chart-dot", cx: xs[at], cy: y(value), r: active === at ? 4 : 2.5, style: { fill: item.color } }));
      });
    });
    if (active !== null) parts.unshift((0, import_react2.createElement)("line", { key: "guide", className: "dui-chart-guide", x1: xs[active], x2: xs[active], y1: plot.y, y2: plot.y + plot.h }));
  }
  const hits = categories.map((_, at) => ({ x: plot.x + band * at, y: plot.y, w: band, h: plot.h }));
  return { parts, height, points, hits };
}
function rows({ categories, series, unit }, width, active, shown) {
  const visible = series.filter((_, index) => shown[index]);
  const ticks = valueAxis(visible.flatMap((item) => item.values), true);
  const lo = ticks[0];
  const hi = ticks.at(-1);
  const labelW = Math.min(width * 0.38, Math.ceil(Math.max(...categories.map((label) => textWidth(label, LABEL)))) + 10);
  const valueW = Math.ceil(Math.max(...visible.flatMap((item) => item.values).map((value) => textWidth(withUnit(value, unit), LABEL)))) + 10;
  const barH = 14;
  const rowH = 10 + visible.length * barH + (visible.length - 1) * 2;
  const top = 4;
  const height = top + rowH * categories.length + 22;
  const plot = { x: labelW, y: top, w: Math.max(40, width - labelW - valueW), h: rowH * categories.length };
  const x = (value) => plot.x + (value - lo) / (hi - lo) * plot.w;
  const parts = [];
  for (const tick of ticks) {
    parts.push((0, import_react2.createElement)("line", { key: `g${tick}`, className: "dui-chart-grid", x1: x(tick), x2: x(tick), y1: plot.y, y2: plot.y + plot.h }));
    parts.push((0, import_react2.createElement)("text", { key: `t${tick}`, className: "dui-chart-tick", x: x(tick), y: height - 6, textAnchor: "middle" }, withUnit(tick, unit)));
  }
  const points = [];
  const zero = x(Math.max(lo, Math.min(0, hi)));
  categories.forEach((label, at) => {
    const rowY = plot.y + rowH * at + 5;
    parts.push((0, import_react2.createElement)("text", { key: `c${at}`, className: "dui-chart-label", x: labelW - 10, y: rowY + (rowH - 10) / 2 + 4, textAnchor: "end" }, fit(label, labelW - 12, LABEL)));
    visible.forEach((item, row) => {
      const value = item.values[at];
      const by = rowY + row * (barH + 2);
      const left = Math.min(x(value), zero);
      const long = Math.max(1, Math.abs(x(value) - zero));
      parts.push((0, import_react2.createElement)("rect", { key: `b${at}-${row}`, className: "dui-chart-mark", "data-dim": active !== null && active !== at ? "" : void 0, x: left, y: by, width: long, height: barH, rx: Math.min(4, long / 2), style: { fill: item.color } }));
      parts.push((0, import_react2.createElement)("text", { key: `v${at}-${row}`, className: "dui-chart-value", x: left + long + 6, y: by + barH - 3 }, withUnit(value, unit)));
    });
    points.push({ x: Math.max(...visible.map((item) => x(item.values[at])), zero), y: rowY });
  });
  const hits = categories.map((_, at) => ({ x: 0, y: plot.y + rowH * at, w: width, h: rowH }));
  return { parts, height, points, hits };
}
function donut({ categories, series }, width, active, hover) {
  const values = (series[0]?.values ?? []).map((value) => Math.max(0, value));
  const total = values.reduce((sum, value) => sum + value, 0);
  const size = Math.min(180, Math.max(120, width * 0.42));
  const r = size / 2;
  const inner = r * 0.62;
  const cx = r;
  const cy = r;
  const parts = [];
  const points = [];
  let angle = -Math.PI / 2;
  values.forEach((value, at) => {
    const sweep = total > 0 ? value / total * Math.PI * 2 : 0;
    const end = angle + sweep;
    const mid = angle + sweep / 2;
    points.push({ x: cx + Math.cos(mid) * (r - (r - inner) / 2), y: cy + Math.sin(mid) * (r - (r - inner) / 2) });
    if (sweep > 0) {
      const large = sweep > Math.PI ? 1 : 0;
      const full = sweep >= Math.PI * 2 - 1e-6;
      const p = (radius, theta) => `${cx + Math.cos(theta) * radius},${cy + Math.sin(theta) * radius}`;
      const d = full ? `M${p(r, angle)}A${r},${r} 0 1 1 ${p(r, angle + Math.PI)}A${r},${r} 0 1 1 ${p(r, angle)}M${p(inner, angle)}A${inner},${inner} 0 1 0 ${p(inner, angle + Math.PI)}A${inner},${inner} 0 1 0 ${p(inner, angle)}z` : `M${p(r, angle)}A${r},${r} 0 ${large} 1 ${p(r, end)}L${p(inner, end)}A${inner},${inner} 0 ${large} 0 ${p(inner, angle)}z`;
      parts.push((0, import_react2.createElement)("path", { key: `s${at}`, className: "dui-chart-mark", "data-dim": active !== null && active !== at ? "" : void 0, d, fillRule: "evenodd", style: { fill: colorAt(at) }, onPointerEnter: () => hover(at) }));
    }
    angle = end;
  });
  return { parts, height: size, size, points, total, values, categories };
}
function useWidth(box, initial) {
  const [width, setWidth] = (0, import_react2.useState)(initial);
  (0, import_react2.useLayoutEffect)(() => {
    const node = box.current;
    if (!node || typeof ResizeObserver !== "function") return void 0;
    const measure = () => {
      const next = Math.round(node.clientWidth);
      if (next > 0) setWidth(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return width;
}
var INLINE = ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "fill-opacity", "font-size", "font-family", "font-weight"];
function saveImage(svg, name) {
  const clone = svg.cloneNode(true);
  const live = [svg, ...svg.querySelectorAll("*")];
  const copy = [clone, ...clone.querySelectorAll("*")];
  live.forEach((node, index) => {
    const style = getComputedStyle(node);
    copy[index].setAttribute("style", INLINE.map((prop) => `${prop}:${style.getPropertyValue(prop)}`).join(";"));
  });
  const width = Number(svg.getAttribute("width"));
  const height = Number(svg.getAttribute("height"));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const page = getComputedStyle(document.body);
  const background = page.getPropertyValue("--dui-main").trim() || page.backgroundColor;
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
  const image = new Image();
  image.onload = () => {
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const paint = canvas.getContext("2d");
    paint.fillStyle = background;
    paint.fillRect(0, 0, canvas.width, canvas.height);
    paint.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1e3);
    }, "image/png");
  };
  image.onerror = () => URL.revokeObjectURL(url);
  image.src = url;
}
var TableIcon = () => (0, import_react2.createElement)(
  "svg",
  { width: 16, height: 16, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
  (0, import_react2.createElement)("path", { d: "M4.5 4h11A1.5 1.5 0 0 1 17 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5v-9A1.5 1.5 0 0 1 4.5 4z" }),
  (0, import_react2.createElement)("path", { d: "M3 8.5h14M8 8.5V16" })
);
function ChartTable({ data }) {
  const ui = useViewUi();
  const { categories, series, unit } = data;
  const heads = series.map((item, index) => item.name || (series.length === 1 ? unit || ui.t("Value") : `${ui.t("Series")} ${index + 1}`));
  return (0, import_react2.createElement)(
    "div",
    { className: "dui-widget-table" },
    (0, import_react2.createElement)(
      "table",
      null,
      (0, import_react2.createElement)("thead", null, (0, import_react2.createElement)("tr", null, (0, import_react2.createElement)("th", { scope: "col" }), heads.map((head, index) => (0, import_react2.createElement)("th", { key: index, scope: "col", className: "dui-num" }, head)))),
      (0, import_react2.createElement)("tbody", null, categories.map((label, at) => (0, import_react2.createElement)(
        "tr",
        { key: at },
        (0, import_react2.createElement)("th", { scope: "row" }, label),
        series.map((item, index) => (0, import_react2.createElement)("td", { key: index, className: "dui-num" }, withUnit(item.values[at], series.length === 1 && !item.name ? "" : unit)))
      )))
    )
  );
}
function WidgetChart({ node, lookup, registerChart, refreshCharts }) {
  const ui = useViewUi();
  const data = chartData(node, lookup);
  const { kind, categories, series, unit } = data;
  const box = (0, import_react2.useRef)(null);
  const svg = (0, import_react2.useRef)(null);
  const width = useWidth(box, 520);
  const [active, setActive] = (0, import_react2.useState)(null);
  const [hidden, setHidden] = (0, import_react2.useState)([]);
  const [asTable, setAsTable] = (0, import_react2.useState)(false);
  const [copied, setCopied] = (0, import_react2.useState)(false);
  const labelId = (0, import_react2.useId)();
  const menuKey = (0, import_react2.useId)();
  const table = (0, import_react2.useRef)(asTable);
  table.current = asTable;
  const shown = series.map((_, index) => !hidden.includes(index));
  const toggle = (index) => {
    if (hidden.includes(index)) setHidden(hidden.filter((item) => item !== index));
    else if (shown.filter(Boolean).length > 1) setHidden([...hidden, index]);
  };
  const label = typeof node.caption === "string" && node.caption !== "" ? node.caption : ui.t("Chart");
  const isDonut = kind === "donut";
  const legendBeside = isDonut && width >= 360;
  const drawn = isDonut ? donut(data, legendBeside ? width - 200 : width, active, setActive) : kind === "hbar" ? rows(data, width, active, shown) : columns(data, width, active, shown);
  const svgWidth = isDonut ? drawn.size : width;
  const move = (event) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (event.key === "Escape") {
      setActive(null);
      return;
    }
    if (keys[event.key] === void 0) return;
    event.preventDefault();
    setActive((current) => current === null ? 0 : (current + keys[event.key] + categories.length) % categories.length);
  };
  const point = active === null ? null : drawn.points[active];
  const share = (at) => unit === "%" ? withUnit(drawn.values[at], unit) : `${withUnit(drawn.values[at], unit)} · ${drawn.total > 0 ? Math.round(drawn.values[at] / drawn.total * 100) : 0}%`;
  const tipRows = active === null || isDonut ? [] : series.filter((_, index) => shown[index]).map((item) => ({ color: item.color, name: item.name, value: withUnit(item.values[active], unit) }));
  const copy = () => {
    void navigator.clipboard?.writeText(chartCsv(data, ui.t)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };
  const toggleTable = () => {
    table.current = !table.current;
    setAsTable(table.current);
  };
  const menuLabel = typeof node.caption === "string" && node.caption !== "" ? node.caption : null;
  const action = (0, import_react2.useRef)(null);
  action.current = { label: menuLabel, copy, save: () => {
    if (svg.current) saveImage(svg.current, "chart.png");
  }, toggleTable };
  (0, import_react2.useEffect)(() => registerChart?.(menuKey, {
    get label() {
      return action.current.label;
    },
    get asTable() {
      return table.current;
    },
    toggleTable: () => action.current.toggleTable(),
    copy: () => action.current.copy(),
    save: () => action.current.save()
  }), [registerChart, menuKey]);
  (0, import_react2.useEffect)(() => refreshCharts?.(), [refreshCharts, asTable, menuLabel]);
  const legend = isDonut ? (0, import_react2.createElement)("div", { className: "dui-chart-legend dui-chart-legend-list" }, categories.map((name, at) => (0, import_react2.createElement)(
    "div",
    {
      key: at,
      className: "dui-chart-key",
      "data-dim": active !== null && active !== at ? "" : void 0,
      onPointerEnter: () => setActive(at),
      onPointerLeave: () => setActive(null)
    },
    (0, import_react2.createElement)("i", { style: { background: colorAt(at) } }),
    (0, import_react2.createElement)("span", { className: "dui-chart-key-name" }, name),
    (0, import_react2.createElement)("span", { className: "dui-chart-key-value" }, share(at))
  ))) : series.length > 1 ? (0, import_react2.createElement)("div", { className: "dui-chart-legend" }, series.map((item, index) => (0, import_react2.createElement)("button", {
    key: index,
    type: "button",
    className: "dui-chart-key",
    "aria-pressed": shown[index],
    onClick: () => toggle(index)
  }, (0, import_react2.createElement)("i", { style: { background: item.color } }), item.name || `${ui.t("Series")} ${index + 1}`))) : null;
  const plot = (0, import_react2.createElement)(
    "div",
    { className: "dui-chart-plot", style: isDonut ? { width: svgWidth } : void 0 },
    (0, import_react2.createElement)(
      "svg",
      {
        ref: svg,
        className: "dui-chart-svg",
        width: svgWidth,
        height: drawn.height,
        viewBox: `0 0 ${svgWidth} ${drawn.height}`,
        role: "img",
        "aria-labelledby": labelId,
        tabIndex: 0,
        onKeyDown: move,
        onBlur: () => setActive(null),
        onPointerLeave: () => setActive(null)
      },
      drawn.parts,
      isDonut ? active === null ? (0, import_react2.createElement)("text", { className: "dui-chart-center", x: svgWidth / 2, y: drawn.height / 2 + 5, textAnchor: "middle" }, unit === "%" ? "" : withUnit(drawn.total, unit)) : (0, import_react2.createElement)(
        import_react2.Fragment,
        null,
        (0, import_react2.createElement)("text", { className: "dui-chart-center-name", x: svgWidth / 2, y: drawn.height / 2 - 4, textAnchor: "middle" }, fit(categories[active], drawn.size * 0.56, LABEL)),
        (0, import_react2.createElement)("text", { className: "dui-chart-center", x: svgWidth / 2, y: drawn.height / 2 + 14, textAnchor: "middle" }, share(active))
      ) : drawn.hits.map((hit, at) => (0, import_react2.createElement)("rect", { key: `h${at}`, className: "dui-chart-hit", x: hit.x, y: hit.y, width: hit.w, height: hit.h, onPointerEnter: () => setActive(at) }))
    ),
    point && !asTable && !isDonut ? (0, import_react2.createElement)(
      "div",
      { className: "dui-chart-tip", role: "status", style: { left: point.x, top: point.y } },
      (0, import_react2.createElement)("b", null, categories[active]),
      tipRows.map((row, index) => (0, import_react2.createElement)("span", { key: index }, (0, import_react2.createElement)("i", { style: { background: row.color } }), row.name ? `${row.name}  ` : "", row.value))
    ) : null
  );
  const body = asTable ? (0, import_react2.createElement)(ChartTable, { data }) : isDonut ? (0, import_react2.createElement)("div", { className: legendBeside ? "dui-chart-donut dui-chart-donut-beside" : "dui-chart-donut", onPointerLeave: () => setActive(null) }, plot, legend) : (0, import_react2.createElement)(import_react2.Fragment, null, legend, plot);
  return (0, import_react2.createElement)(
    "figure",
    { ref: box, className: "dui-chart", "data-kind": kind },
    (0, import_react2.createElement)("span", { id: labelId, hidden: true }, label),
    body,
    // The SVG stays mounted under the table, so the image can still be saved from it.
    asTable ? (0, import_react2.createElement)("div", { hidden: true }, plot) : null,
    copied ? (0, import_react2.createElement)("span", { className: "dui-chart-copied", role: "status" }, ui.t("Copied")) : null,
    typeof node.caption === "string" && node.caption !== "" ? (0, import_react2.createElement)("figcaption", { className: "dui-view-caption" }, node.caption) : null
  );
}
var CHART_CSS = `
.dui-chart{position:relative;margin:0;min-width:0;display:flex;flex-direction:column;gap:8px}
.dui-chart-plot{position:relative;min-width:0}
.dui-chart-svg{display:block;overflow:visible;outline:none;font-family:inherit}
.dui-chart-svg text{pointer-events:none}
.dui-chart-svg:focus-visible{outline:2px solid var(--dui-accent);outline-offset:4px;border-radius:4px}
.dui-chart-grid{stroke:var(--dui-line);stroke-width:1;stroke-dasharray:3 3}
.dui-chart-tick{font-size:${TICK}px;fill:var(--dui-ink-3);font-variant-numeric:tabular-nums}
.dui-chart-label{font-size:${LABEL}px;fill:var(--dui-ink-2)}
.dui-chart-value{font-size:${LABEL}px;fill:var(--dui-ink-2);font-variant-numeric:tabular-nums}
.dui-chart-center{font-size:15px;font-weight:600;fill:var(--dui-ink);font-variant-numeric:tabular-nums}
.dui-chart-center-name{font-size:${LABEL}px;fill:var(--dui-ink-2)}
.dui-chart-mark{transition:opacity .12s ease}
.dui-chart-mark[data-dim]{opacity:.28}
.dui-chart-line{fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.dui-chart-area{opacity:.14}
.dui-chart-dot{transition:r .12s ease}
.dui-chart-guide{stroke:var(--dui-line-2);stroke-width:1}
.dui-chart-hit{fill:transparent}
.dui-chart-tip{position:absolute;z-index:4;pointer-events:none;transform:translate(-50%,calc(-100% - 8px));display:flex;flex-direction:column;gap:2px;padding:6px 10px;border-radius:10px;background:var(--dui-main);border:.5px solid var(--dui-line-2);box-shadow:0 10px 20px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);font-size:12px;line-height:16px;color:var(--dui-ink);white-space:nowrap;font-variant-numeric:tabular-nums;animation:dui-veil-in .12s ease-out}
.dui-chart-tip b{font-weight:600}
.dui-chart-tip span{display:flex;align-items:center;gap:6px;color:var(--dui-ink-2)}
.dui-chart-tip i,.dui-chart-key i{flex:none;width:8px;height:8px;border-radius:50%;corner-shape:round}
.dui-chart-legend{display:flex;flex-wrap:wrap;gap:4px 12px;padding-right:32px}
.dui-chart-key{display:inline-flex;align-items:center;gap:6px;min-height:20px;padding:0;border:0;background:none;font:inherit;font-size:12px;line-height:16px;color:var(--dui-ink-2);cursor:pointer;transition:opacity .12s ease}
.dui-chart-key[aria-pressed=false]{opacity:.4}
.dui-chart-key:focus-visible{outline:2px solid var(--dui-accent);outline-offset:2px;border-radius:4px}
.dui-chart-legend-list{flex-direction:column;flex-wrap:nowrap;gap:6px;padding:0;min-width:0}
.dui-chart-legend-list .dui-chart-key{cursor:default;width:100%}
.dui-chart-legend-list .dui-chart-key[data-dim]{opacity:.4}
.dui-chart-key-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dui-ink)}
.dui-chart-key-value{flex:none;font-variant-numeric:tabular-nums}
.dui-chart-donut{display:flex;flex-direction:column;align-items:center;gap:12px}
.dui-chart-donut-beside{flex-direction:row;align-items:center;gap:24px}
.dui-chart-donut-beside .dui-chart-legend-list{flex:1 1 auto;max-width:280px}
.dui-chart-copied{position:absolute;top:2px;right:36px;font-size:12px;line-height:16px;color:var(--dui-ink-2);animation:dui-veil-in .16s ease-out}
.dui-widget-table .dui-num{text-align:end;font-variant-numeric:tabular-nums}
.dui-widget-table tbody th{padding:6px 10px;font-weight:400;text-align:start;color:var(--dui-ink);border-bottom:0}
@media (prefers-reduced-motion:reduce){.dui-chart-mark,.dui-chart-dot{transition:none}.dui-chart-tip{animation:none}}
`;

// src/react/frame.js
var import_react3 = require("react");
var THEME_VARS = [
  ["--view-ink", "--bt-ink", "--dui-ink"],
  ["--view-ink-2", "--bt-ink-2", "--dui-ink-2"],
  ["--view-ink-3", "--bt-ink-3", "--dui-ink-3"],
  ["--view-line", "--bt-line", "--dui-line"],
  ["--view-line-2", "--bt-line-2", "--dui-line-2"],
  ["--view-card", "--bt-card", "--dui-card"],
  ["--view-main", "--bt-main", "--dui-main"],
  ["--view-hover", "--bt-hover", "--dui-hover"],
  ["--view-accent", "--bt-accent", "--dui-accent"],
  ["--view-accent-ink", "--bt-accent-ink", "--dui-accent-ink"],
  ["--view-green", "--bt-green", "--dui-green"],
  ["--view-star", "--bt-star", "--dui-star"],
  ["--view-danger", "--bt-danger", "--dui-danger"]
];
var FRAME_POLICY = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; form-action 'none'; base-uri 'none'";
var HEIGHT = "dui-view-height";
var THEME = "dui-view-theme";
var MIN_HEIGHT = 24;
function themeVars() {
  if (typeof getComputedStyle !== "function" || typeof document === "undefined" || !document.body) return {};
  const style = getComputedStyle(document.body);
  const vars = {};
  for (const [view, legacy, source] of THEME_VARS) {
    const value = style.getPropertyValue(source).trim();
    if (value === "") continue;
    vars[view] = value;
    vars[legacy] = value;
  }
  vars["color-scheme"] = style.getPropertyValue("color-scheme").trim() || "normal";
  return vars;
}
var cssValue = (value) => String(value).replace(/[<>{};]/g, "");
function frameDocument(html, vars = {}) {
  const root = Object.entries(vars).map(([name, value]) => `${name}:${cssValue(value)}`).join(";");
  const report = `(()=>{const send=()=>parent.postMessage({type:${JSON.stringify(HEIGHT)},height:Math.ceil(document.documentElement.getBoundingClientRect().height)},'*');new ResizeObserver(send).observe(document.documentElement);addEventListener('load',send);addEventListener('message',e=>{if(e.source!==parent||!e.data||e.data.type!==${JSON.stringify(THEME)})return;for(const[k,v]of Object.entries(e.data.vars||{}))document.documentElement.style.setProperty(k,String(v))})})()`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${FRAME_POLICY}"><style>:root{${root}}html,body{margin:0;padding:0;background:transparent;color:var(--view-ink,var(--bt-ink));font:14px/22px -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}*{box-sizing:border-box}</style><script>${report}<\/script></head><body>${html}</body></html>`;
}
function HtmlFrame({ node }) {
  const ui = useViewUi();
  const frame = (0, import_react3.useRef)(null);
  const loads = (0, import_react3.useRef)(0);
  const [height, setHeight] = (0, import_react3.useState)(Number.isFinite(node.height) ? node.height : 120);
  const [stopped, setStopped] = (0, import_react3.useState)(false);
  const doc = (0, import_react3.useMemo)(() => frameDocument(String(node.html ?? ""), themeVars()), [node.html]);
  (0, import_react3.useEffect)(() => {
    const onMessage = (event) => {
      if (event.source !== frame.current?.contentWindow || event.data?.type !== HEIGHT) return;
      const next = Number(event.data.height);
      if (Number.isFinite(next)) setHeight(Math.max(MIN_HEIGHT, Math.ceil(next)));
    };
    window.addEventListener("message", onMessage);
    const retheme = () => frame.current?.contentWindow?.postMessage({ type: THEME, vars: themeVars() }, "*");
    const observer = typeof MutationObserver === "function" ? new MutationObserver(retheme) : null;
    observer?.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme", "style", "class"] });
    return () => {
      window.removeEventListener("message", onMessage);
      observer?.disconnect();
    };
  }, []);
  if (stopped) return (0, import_react3.createElement)("p", { className: "dui-view-frame-stopped" }, ui.t("This view tried to open a page and was stopped."));
  return (0, import_react3.createElement)("iframe", {
    ref: frame,
    className: "dui-view-frame",
    title: String(node.summary ?? ""),
    sandbox: "allow-scripts",
    srcDoc: doc,
    referrerPolicy: "no-referrer",
    style: { height: `${height}px` },
    onLoad: () => {
      loads.current += 1;
      if (loads.current > 1) setStopped(true);
    }
  });
}
var HTML_CSS = `
.dui-view-frame{display:block;width:100%;border:0;background:transparent}
.dui-view-frame-stopped{margin:0;font-size:13px;line-height:18px;color:var(--dui-ink-2)}
`;

// src/react/card.js
var import_react4 = require("react");
var mdLabels = (ui) => ({ code: { copyLabel: ui.t("Copy"), copiedLabel: ui.t("Copied") }, footnotes: ui.t("Footnotes") });
var TONES2 = ["good", "warn", "bad"];
var CALLOUT_TONES2 = ["info", "good", "warn", "bad"];
var optionsOf = (node) => (Array.isArray(node?.options) ? node.options : []).map((option) => typeof option === "string" ? { label: option } : option).filter((option) => option !== null && typeof option === "object" && option.label !== void 0);
var fieldsOf = (node) => (Array.isArray(node?.fields) ? node.fields : []).filter((field) => field !== null && typeof field === "object" && field.id !== void 0);
var cellText2 = (value) => value === null || value === void 0 ? "" : typeof value === "object" ? JSON.stringify(value) : asText(value);
var NUMERIC_CELL = /^[-+]?[\d.,]+\s?(%|[a-zA-Z]{1,4})?$/;
var countType = (node, type) => {
  if (node === null || typeof node !== "object") return 0;
  const children = Array.isArray(node.children) ? node.children : [];
  return (node.type === type ? 1 : 0) + children.reduce((sum, child) => sum + countType(child, type), 0);
};
var ANSWER_TYPES = /* @__PURE__ */ new Set(["options", "confirm", "form", "submit", "slider", "choice", "toggle", "number"]);
var hasControls = (node) => {
  if (node === null || typeof node !== "object") return false;
  if (ANSWER_TYPES.has(node.type)) return true;
  return Array.isArray(node.children) && node.children.some(hasControls);
};
var answerValues = (answer, node) => answer?.action === node.id ? answer.values : void 0;
function OptionsInput({ node, onSubmit, keys, busy = false }) {
  const ui = useViewUi();
  const [picked, setPicked] = (0, import_react4.useState)([]);
  const options = optionsOf(node);
  const multi = node.multi === true;
  const choose = (label) => {
    if (busy) return;
    if (multi) {
      setPicked((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
      return;
    }
    onSubmit?.(node.id, { selected: [label] });
  };
  const submit = () => {
    if (!busy && picked.length > 0) onSubmit?.(node.id, { selected: picked });
  };
  const ownRef = (0, import_react4.useRef)(null);
  const hints = useOptionKeys(busy || !keys ? 0 : options.length, (index) => choose(options[index].label), ownRef);
  return (0, import_react4.createElement)(
    import_react4.Fragment,
    null,
    (0, import_react4.createElement)("div", { className: "dui-q-list", role: "group" }, options.map((option, index) => {
      const selected = multi && picked.includes(option.label);
      return (0, import_react4.createElement)(
        "button",
        {
          key: option.label,
          type: "button",
          className: "dui-q-opt",
          disabled: busy,
          "aria-pressed": multi ? selected : void 0,
          "aria-keyshortcuts": hints ? keyLetter(index).toLowerCase() : void 0,
          onClick: () => choose(option.label)
        },
        hints ? (0, import_react4.createElement)("span", { className: "dui-key", "aria-hidden": true }, keyLetter(index)) : null,
        (0, import_react4.createElement)(
          "span",
          { className: "dui-q-body" },
          (0, import_react4.createElement)("span", { className: "dui-q-label" }, option.label),
          option.description ? (0, import_react4.createElement)("span", { className: "dui-q-desc" }, option.description) : null
        ),
        selected ? (0, import_react4.createElement)("span", { className: "dui-q-check", title: ui.t("Selected") }, (0, import_react4.createElement)(CheckIcon)) : null
      );
    })),
    multi ? (0, import_react4.createElement)(
      "div",
      { className: "dui-q-foot" },
      (0, import_react4.createElement)("button", { type: "button", className: "dui-q-submit", disabled: busy || picked.length === 0, onClick: submit }, ui.t("Submit"))
    ) : null
  );
}
function SettledOptions({ node, answer }) {
  const ui = useViewUi();
  const selected = answerValues(answer, node)?.selected;
  const chosen = Array.isArray(selected) ? selected : [];
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-q-list", role: "group", "aria-label": ui.t("Your answer") },
    optionsOf(node).map((option) => (0, import_react4.createElement)(
      "div",
      { key: option.label, className: "dui-q-opt" },
      (0, import_react4.createElement)(
        "span",
        { className: "dui-q-body" },
        (0, import_react4.createElement)("span", { className: "dui-q-label" }, option.label),
        option.description ? (0, import_react4.createElement)("span", { className: "dui-q-desc" }, option.description) : null
      ),
      chosen.includes(option.label) ? (0, import_react4.createElement)("span", { className: "dui-q-check", title: ui.t("Selected") }, (0, import_react4.createElement)(CheckIcon)) : null
    ))
  );
}
function ConfirmInput({ node, onSubmit, busy = false }) {
  const ui = useViewUi();
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-q-foot" },
    (0, import_react4.createElement)("button", { type: "button", className: "dui-q-btn", disabled: busy, onClick: () => onSubmit?.(node.id, { confirmed: false }) }, node.cancelLabel ?? ui.t("Cancel")),
    (0, import_react4.createElement)("button", { type: "button", className: "dui-q-submit", disabled: busy, onClick: () => onSubmit?.(node.id, { confirmed: true }) }, node.confirmLabel ?? ui.t("Confirm"))
  );
}
function SettledConfirm({ node, answer }) {
  const ui = useViewUi();
  const confirmed = answerValues(answer, node)?.confirmed;
  if (confirmed !== true && confirmed !== false) {
    return (0, import_react4.createElement)(
      "div",
      { className: "dui-q-foot" },
      (0, import_react4.createElement)("button", { type: "button", className: "dui-q-btn", disabled: true }, node.cancelLabel ?? ui.t("Cancel")),
      (0, import_react4.createElement)("button", { type: "button", className: "dui-q-submit", disabled: true }, node.confirmLabel ?? ui.t("Confirm"))
    );
  }
  const label = confirmed ? node.confirmLabel ?? ui.t("Confirm") : node.cancelLabel ?? ui.t("Cancel");
  return (0, import_react4.createElement)("span", { className: "dui-q-badge" }, label);
}
function FormInput({ node, onSubmit, busy = false }) {
  const ui = useViewUi();
  const fields = fieldsOf(node);
  const [draft, setDraft] = (0, import_react4.useState)({});
  const submit = () => {
    if (!busy) onSubmit?.(node.id, { fields: Object.fromEntries(fields.map((field) => [field.id, draft[field.id] ?? ""])) });
  };
  return (0, import_react4.createElement)(
    "form",
    {
      className: "dui-widget-form",
      onSubmit: (event) => {
        event.preventDefault();
        submit();
      }
    },
    fields.map((field) => (0, import_react4.createElement)(
      "label",
      { key: field.id, className: "dui-widget-field" },
      (0, import_react4.createElement)("span", { className: "dui-widget-field-label" }, field.label),
      (0, import_react4.createElement)(
        "span",
        { className: "dui-q-field" },
        (0, import_react4.createElement)("input", {
          className: "dui-q-input",
          type: "text",
          value: draft[field.id] ?? "",
          autoComplete: "off",
          spellCheck: false,
          readOnly: busy,
          "aria-label": field.label,
          placeholder: field.placeholder ?? void 0,
          onChange: (event) => {
            if (!busy) setDraft((current) => ({ ...current, [field.id]: event.target.value }));
          },
          onKeyDown: (event) => {
            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
            event.preventDefault();
            submit();
          }
        })
      )
    )),
    (0, import_react4.createElement)("div", { className: "dui-q-foot" }, (0, import_react4.createElement)("button", { type: "submit", className: "dui-q-submit", disabled: busy }, node.submitLabel ?? ui.t("Submit")))
  );
}
function SettledForm({ node, answer }) {
  const fields = answerValues(answer, node)?.fields;
  const values = fields !== null && typeof fields === "object" ? fields : {};
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-widget-form" },
    fieldsOf(node).map((field) => (0, import_react4.createElement)(
      "label",
      { key: field.id, className: "dui-widget-field" },
      (0, import_react4.createElement)("span", { className: "dui-widget-field-label" }, field.label),
      (0, import_react4.createElement)(
        "span",
        { className: "dui-q-field" },
        (0, import_react4.createElement)("input", { className: "dui-q-input", type: "text", value: values[field.id] ?? "", disabled: true, readOnly: true, "aria-label": field.label })
      )
    ))
  );
}
function SubmitInput({ node, ctx }) {
  const ui = useViewUi();
  if (ctx.settled) return null;
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-q-foot" },
    (0, import_react4.createElement)("button", { type: "button", className: "dui-q-submit", disabled: ctx.busy, onClick: () => ctx.onSubmit?.(node.id, {}) }, node.label || ui.t("Send"))
  );
}
function WidgetTable({ node, lookup }) {
  const columns2 = (Array.isArray(node.columns) ? node.columns : []).filter((column) => column !== null && typeof column === "object");
  const rows2 = (Array.isArray(node.rows) ? node.rows : []).map((row) => (Array.isArray(row) ? row : []).map((cell) => resolve(cell, lookup, "")));
  const numeric2 = columns2.map((_, index) => {
    const cells = rows2.map((row) => row[index]).filter((cell) => cell !== void 0 && cell !== "");
    return cells.length > 0 && cells.every((cell) => typeof cell === "number" || typeof cell === "string" && NUMERIC_CELL.test(cell.trim()));
  });
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-widget-table" },
    (0, import_react4.createElement)(
      "table",
      null,
      (0, import_react4.createElement)("thead", null, (0, import_react4.createElement)("tr", null, columns2.map((column, index) => (0, import_react4.createElement)("th", { key: column.key ?? index, scope: "col", className: numeric2[index] ? "dui-num" : void 0 }, column.label)))),
      (0, import_react4.createElement)("tbody", null, rows2.map((row, rowIndex) => (0, import_react4.createElement)(
        "tr",
        { key: rowIndex },
        columns2.map((column, columnIndex) => (0, import_react4.createElement)("td", { key: column.key ?? columnIndex, className: numeric2[columnIndex] ? "dui-num" : void 0 }, cellText2(row[columnIndex])))
      )))
    )
  );
}
function WidgetProgress({ node, lookup }) {
  const ui = useViewUi();
  let percent;
  if (node.percent !== void 0) percent = Number(resolve(node.percent, lookup, 0));
  else {
    const max = Number(resolve(node.max, lookup, 0));
    percent = max > 0 ? Number(resolve(node.value, lookup, 0)) / max * 100 : 0;
  }
  percent = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const tone = resolve(node.tone, lookup);
  const right = node.valueLabel !== void 0 ? asText(resolve(node.valueLabel, lookup, "")) : `${Math.round(percent)}%`;
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-widget-progress", "data-tone": TONES2.includes(tone) ? tone : void 0 },
    (0, import_react4.createElement)("span", { className: "dui-widget-progress-label" }, (0, import_react4.createElement)("span", { className: "dui-widget-progress-name" }, node.label), (0, import_react4.createElement)("span", null, right)),
    (0, import_react4.createElement)("div", {
      className: "dui-widget-progress-track",
      role: "progressbar",
      "aria-valuenow": Math.round(percent),
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-label": node.label ?? ui.t("Progress"),
      "aria-valuetext": right
    }, (0, import_react4.createElement)("div", { className: "dui-widget-progress-fill", style: { width: `${percent}%` } }))
  );
}
function WidgetMetric({ node, lookup }) {
  const tone = resolve(node.tone, lookup);
  const caption = node.caption === void 0 ? "" : asText(resolve(node.caption, lookup, ""));
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-widget-metric", "data-tone": TONES2.includes(tone) ? tone : void 0 },
    (0, import_react4.createElement)("span", { className: "dui-widget-metric-label" }, node.label),
    (0, import_react4.createElement)("span", { className: "dui-widget-metric-value" }, asText(resolve(node.value, lookup, "—"))),
    caption !== "" ? (0, import_react4.createElement)("span", { className: "dui-view-caption" }, caption) : null
  );
}
function WidgetCallout({ node, lookup }) {
  const ui = useViewUi();
  const tone = resolve(node.tone, lookup);
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-view-callout", "data-tone": CALLOUT_TONES2.includes(tone) ? tone : "info" },
    (0, import_react4.createElement)("span", { className: "dui-view-callout-icon", "aria-hidden": true }, (0, import_react4.createElement)(InfoIcon)),
    (0, import_react4.createElement)("div", { className: "dui-view-callout-text" }, (0, import_react4.createElement)(ui.Markdown, { text: asText(resolve(node.text, lookup, "")), labels: mdLabels(ui), variant: "compact" }))
  );
}
var LinkIcon = () => (0, import_react4.createElement)(
  "svg",
  { width: 12, height: 12, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
  (0, import_react4.createElement)("path", { d: "M8.5 11.5l3-3" }),
  (0, import_react4.createElement)("path", { d: "M7 9.5L5.5 11a2.5 2.5 0 0 0 3.5 3.5L10.5 13" }),
  (0, import_react4.createElement)("path", { d: "M13 10.5l1.5-1.5A2.5 2.5 0 0 0 11 5.5L9.5 7" })
);
function WidgetSources({ node }) {
  const ui = useViewUi();
  const items = (Array.isArray(node.items) ? node.items : []).filter((item) => typeof item?.url === "string" && /^https?:\/\//i.test(item.url));
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-view-sources", role: "list", "aria-label": ui.t("Sources") },
    items.map((item, index) => (0, import_react4.createElement)("a", { key: index, role: "listitem", className: "dui-view-source", href: item.url, target: "_blank", rel: "noopener noreferrer", title: item.url }, (0, import_react4.createElement)(LinkIcon), item.label))
  );
}
function InputHead({ id, label, value }) {
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-view-input-head" },
    (0, import_react4.createElement)("label", { htmlFor: id, className: "dui-view-input-label" }, label),
    value !== void 0 ? (0, import_react4.createElement)("output", { htmlFor: id, className: "dui-view-input-value" }, value) : null
  );
}
var withUnit2 = (value, unit) => `${asText(value)}${unit ? ` ${unit}` : ""}`;
var grouped2 = (value) => typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-US", { maximumFractionDigits: 6 }) : asText(value);
function SliderInput({ node, ctx }) {
  const id = (0, import_react4.useId)();
  const value = Number(ctx.values[node.id]);
  const percent = node.max > node.min ? (value - node.min) / (node.max - node.min) * 100 : 0;
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-view-input" },
    (0, import_react4.createElement)(InputHead, { id, label: node.label, value: withUnit2(grouped2(value), node.unit) }),
    (0, import_react4.createElement)("input", {
      id,
      type: "range",
      className: "dui-view-range",
      min: node.min,
      max: node.max,
      step: node.step ?? "any",
      value,
      disabled: ctx.locked,
      style: { "--dui-fill": `${percent}%` },
      onChange: (event) => ctx.setInput(node.id, Number(event.target.value))
    })
  );
}
function NumberInput({ node, ctx }) {
  const id = (0, import_react4.useId)();
  const [draft, setDraft] = (0, import_react4.useState)(null);
  const value = ctx.values[node.id];
  const accept = (raw) => {
    setDraft(raw);
    const next = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(next)) return;
    if (node.min !== void 0 && next < node.min || node.max !== void 0 && next > node.max) return;
    ctx.setInput(node.id, next);
  };
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-view-input" },
    (0, import_react4.createElement)(InputHead, { id, label: node.label }),
    (0, import_react4.createElement)(
      "span",
      { className: "dui-q-field dui-view-number" },
      (0, import_react4.createElement)("input", {
        id,
        className: "dui-q-input",
        type: "number",
        inputMode: "decimal",
        value: draft ?? asText(value),
        min: node.min,
        max: node.max,
        step: node.step ?? "any",
        disabled: ctx.locked,
        onChange: (event) => accept(event.target.value),
        onBlur: () => setDraft(null)
      }),
      node.unit ? (0, import_react4.createElement)("span", { className: "dui-view-unit" }, node.unit) : null
    )
  );
}
function ChoiceInput({ node, ctx }) {
  const labelId = (0, import_react4.useId)();
  const options = optionsOf(node);
  const current = ctx.values[node.id];
  const side = options.length <= 4 && options.every((option) => [...option.label].length <= 14);
  const pick = (option) => () => {
    if (!ctx.locked) ctx.setInput(node.id, choiceValue(option));
  };
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-view-input" },
    (0, import_react4.createElement)("span", { className: "dui-view-input-label", id: labelId }, node.label),
    side ? (0, import_react4.createElement)(
      Segmented,
      { label: node.label, value: options.findIndex((option) => choiceValue(option) === current), className: "dui-view-seg" },
      options.map((option) => (0, import_react4.createElement)("button", { key: option.label, type: "button", "aria-pressed": choiceValue(option) === current, disabled: ctx.locked, onClick: pick(option) }, option.label))
    ) : (0, import_react4.createElement)(
      "div",
      { className: "dui-view-radios", role: "radiogroup", "aria-labelledby": labelId },
      options.map((option) => (0, import_react4.createElement)("button", {
        key: option.label,
        type: "button",
        role: "radio",
        className: "dui-view-radio",
        "aria-checked": choiceValue(option) === current,
        disabled: ctx.locked,
        onClick: pick(option)
      }, (0, import_react4.createElement)("span", { className: "dui-view-radio-dot", "aria-hidden": true }), option.label))
    )
  );
}
function ToggleInput({ node, ctx }) {
  const on = ctx.values[node.id] === true;
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-view-toggle" },
    (0, import_react4.createElement)("span", { className: "dui-view-input-label" }, node.label),
    (0, import_react4.createElement)(
      "button",
      { type: "button", role: "switch", className: "dui-switch", "aria-checked": on, "aria-label": node.label, disabled: ctx.locked, onClick: () => ctx.setInput(node.id, !on) },
      (0, import_react4.createElement)("span", { className: "dui-switch-knob", "aria-hidden": true })
    )
  );
}
function WidgetNode({ node, ctx }) {
  const ui = useViewUi();
  if (node === null || typeof node !== "object") return null;
  const { lookup } = ctx;
  switch (node.type) {
    case "stack":
    case "row": {
      const children = Array.isArray(node.children) ? node.children : [];
      return (0, import_react4.createElement)(
        "div",
        { className: node.type === "row" ? "dui-view-row" : "dui-widget-stack" },
        children.map((child, index) => (0, import_react4.createElement)(WidgetNode, { key: child?.id ?? index, node: child, ctx }))
      );
    }
    case "text": {
      const text = (0, import_react4.createElement)(ui.Markdown, { text: asText(resolve(node.text, lookup, "")), labels: mdLabels(ui), variant: "compact" });
      return node.tone === "muted" ? (0, import_react4.createElement)("div", { className: "dui-view-muted" }, text) : text;
    }
    case "metric":
      return (0, import_react4.createElement)(WidgetMetric, { node, lookup });
    case "table":
      return (0, import_react4.createElement)(WidgetTable, { node, lookup });
    case "chart":
      return (0, import_react4.createElement)(WidgetChart, { node, lookup, registerChart: ctx.registerChart, refreshCharts: ctx.refreshCharts });
    case "progress":
      return (0, import_react4.createElement)(WidgetProgress, { node, lookup });
    case "callout":
      return (0, import_react4.createElement)(WidgetCallout, { node, lookup });
    case "sources":
      return (0, import_react4.createElement)(WidgetSources, { node });
    case "html":
      return (0, import_react4.createElement)(HtmlFrame, { node });
    case "slider":
      return (0, import_react4.createElement)(SliderInput, { node, ctx });
    case "number":
      return (0, import_react4.createElement)(NumberInput, { node, ctx });
    case "choice":
      return (0, import_react4.createElement)(ChoiceInput, { node, ctx });
    case "toggle":
      return (0, import_react4.createElement)(ToggleInput, { node, ctx });
    case "submit":
      return (0, import_react4.createElement)(SubmitInput, { node, ctx });
    case "options":
      return ctx.settled ? (0, import_react4.createElement)(SettledOptions, { node, answer: ctx.answer }) : (0, import_react4.createElement)(OptionsInput, { node, onSubmit: ctx.onSubmit, keys: ctx.keys, busy: ctx.busy });
    case "confirm":
      return ctx.settled ? (0, import_react4.createElement)(SettledConfirm, { node, answer: ctx.answer }) : (0, import_react4.createElement)(ConfirmInput, { node, onSubmit: ctx.onSubmit, busy: ctx.busy });
    case "form":
      return ctx.settled ? (0, import_react4.createElement)(SettledForm, { node, answer: ctx.answer }) : (0, import_react4.createElement)(FormInput, { node, onSubmit: ctx.onSubmit, busy: ctx.busy });
    default:
      return null;
  }
}
function WidgetView({ view, onSubmit, settled = false, answer = null, busy = false, registerChart, refreshCharts }) {
  const inputs = viewInputs(view);
  const [values, setValues] = (0, import_react4.useState)(() => Object.fromEntries(inputs.map((node) => [node.id, inputDefault(node)])));
  const sent = answer?.values?.inputs;
  const current = settled && sent !== null && typeof sent === "object" ? { ...values, ...sent } : values;
  const submit = (action, extra) => onSubmit?.(action, inputs.length > 0 ? { ...extra, inputs: current } : extra);
  const ctx = {
    onSubmit: submit,
    settled,
    answer,
    busy,
    keys: !settled && countType(view, "options") === 1,
    lookup: viewScope(view, current),
    values: current,
    locked: settled || busy,
    setInput: (id, value) => setValues((before) => ({ ...before, [id]: value })),
    registerChart,
    refreshCharts
  };
  return (0, import_react4.createElement)(WidgetNode, { node: view, ctx });
}
function useChartHandles() {
  const [, bump] = (0, import_react4.useState)(0);
  const charts = (0, import_react4.useRef)(/* @__PURE__ */ new Map());
  const fns = (0, import_react4.useRef)(null);
  if (fns.current === null) {
    const refresh = () => bump((value) => value + 1);
    fns.current = {
      registerChart: (key, handle) => {
        charts.current.set(key, handle);
        refresh();
        return () => {
          charts.current.delete(key);
          refresh();
        };
      },
      refreshCharts: refresh
    };
  }
  return { charts: [...charts.current.values()], ...fns.current };
}
function ViewMenuList({ charts, pick }) {
  const ui = useViewUi();
  return (0, import_react4.createElement)(
    "div",
    { className: "dui-menu dui-view-menu", role: "menu" },
    charts.map((chart, index) => (0, import_react4.createElement)(
      import_react4.Fragment,
      { key: index },
      charts.length > 1 ? (0, import_react4.createElement)(
        import_react4.Fragment,
        null,
        index > 0 ? (0, import_react4.createElement)("div", { className: "dui-menu-sep", role: "separator" }) : null,
        (0, import_react4.createElement)("div", { className: "dui-view-menu-label" }, chart.label ?? ui.t("Chart {n}", { n: index + 1 }))
      ) : null,
      (0, import_react4.createElement)("button", { type: "button", role: "menuitem", onClick: pick(chart.toggleTable) }, (0, import_react4.createElement)(TableIcon), chart.asTable ? ui.t("View as chart") : ui.t("View as table")),
      (0, import_react4.createElement)("button", { type: "button", role: "menuitem", onClick: pick(chart.copy) }, (0, import_react4.createElement)(CopyIcon), ui.t("Copy data")),
      (0, import_react4.createElement)("button", { type: "button", role: "menuitem", onClick: pick(chart.save) }, (0, import_react4.createElement)(DownloadIcon), ui.t("Download image"))
    ))
  );
}
function ViewMenu({ charts }) {
  const ui = useViewUi();
  const [open, setOpen] = (0, import_react4.useState)(false);
  const root = (0, import_react4.useRef)(null);
  (0, import_react4.useEffect)(() => {
    if (!open) return void 0;
    const away = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const key = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away, true);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away, true);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const pick = (run2) => () => {
    setOpen(false);
    run2();
  };
  return (0, import_react4.createElement)(
    "div",
    { ref: root, className: "dui-view-tools", "data-open": open ? "" : void 0 },
    (0, import_react4.createElement)("button", { type: "button", className: "dui-view-more", "aria-label": ui.t("Chart options"), "aria-haspopup": "menu", "aria-expanded": open, onClick: () => setOpen((value) => !value) }, (0, import_react4.createElement)(DotsIcon)),
    open ? (0, import_react4.createElement)(ViewMenuList, { charts, pick }) : null
  );
}
function WidgetCard({ title, view, onSubmit, onDismiss, busy = false, raised = false, settled = false, answer = null }) {
  const ui = useViewUi();
  const titleId = (0, import_react4.useId)();
  const { charts, registerChart, refreshCharts } = useChartHandles();
  const framed = raised || hasControls(view);
  const className = ["dui-view", framed ? "dui-q" : "dui-view-bare", settled ? "dui-q-settled" : "", raised ? "dui-q-raised" : ""].filter(Boolean).join(" ");
  const head = title || onDismiss || countType(view, "chart") > 0 ? (0, import_react4.createElement)(
    "div",
    { className: "dui-view-head" },
    title ? (0, import_react4.createElement)("p", { className: "dui-view-title", id: titleId }, title) : (0, import_react4.createElement)("span", { className: "dui-view-title" }),
    countType(view, "chart") > 0 ? (0, import_react4.createElement)(ViewMenu, { charts }) : null,
    onDismiss ? (0, import_react4.createElement)("button", { type: "button", className: "dui-q-x", "aria-label": ui.t("Dismiss view"), title: ui.t("Dismiss"), onClick: onDismiss, disabled: busy }, (0, import_react4.createElement)(CloseIcon)) : null
  ) : null;
  return (0, import_react4.createElement)(
    "div",
    {
      className,
      role: "group",
      "aria-labelledby": title ? titleId : void 0,
      "aria-label": title ? void 0 : ui.t("View"),
      "aria-busy": busy || void 0
    },
    head,
    (0, import_react4.createElement)("div", { className: "dui-view-body" }, (0, import_react4.createElement)(WidgetView, { view, onSubmit, settled, answer, busy, registerChart, refreshCharts }))
  );
}
function AnsweredView({ node }) {
  const data = node.data ?? {};
  let payload = null;
  if (Array.isArray(data.views)) payload = data;
  else {
    try {
      payload = typeof data.text === "string" ? JSON.parse(data.text) : null;
    } catch {
      payload = null;
    }
    if (payload?.kind !== "answer_to_pending_view") payload = null;
  }
  const view = payload?.views?.[0];
  if (view === null || typeof view !== "object" || view.view === void 0) return null;
  const answers = Array.isArray(payload.answers) ? payload.answers : [];
  const answer = answers.find((entry) => entry?.id === view.id) ?? answers[0] ?? null;
  return (0, import_react4.createElement)("div", { className: "dui-q-inline" }, (0, import_react4.createElement)(WidgetCard, { title: view.title ?? "", view: view.view, settled: true, answer }));
}
var WIDGET_CSS = `
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
`;

// src/react/styles.js
var THEME_CSS = `
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
`;
var QUESTION_CSS = `
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
.dui-gone{display:none}
@keyframes dui-veil-in{from{opacity:0;filter:blur(6px)}}
@keyframes dui-check-pop{from{opacity:0;scale:.4}}
@media (prefers-reduced-motion:reduce){.dui-q,.dui-view-bare,.dui-q-submit,.dui-menu,.dui-q-check{animation:none}}
`;

// src/react/index.js
var DEEP_UI_CSS = THEME_CSS + QUESTION_CSS + WIDGET_CSS;

// src/client/views-definition.js
var viewsDefinition = {
  kind: "deep-ui-views",
  match(event) {
    if (event?.type === "turn/start") return { id: String(event.data?.turn), role: "start" };
    if (event?.type === "tool/call" && event.data?.name === "show_view") return { id: String(event.data?.turn), role: "update" };
    if (event?.type === "tool/result" && event.data?.turn !== void 0) return { id: String(event.data.turn), role: "update" };
    return null;
  },
  start: (context, match) => ({ turn: match.event.data.turn, calls: /* @__PURE__ */ new Map() }),
  update: (context, match) => {
    const { state } = context;
    const event = match.event;
    if (event.type === "tool/call") {
      let args = null;
      try {
        args = JSON.parse(event.data.arguments);
      } catch {
        args = null;
      }
      if (args === null || typeof args !== "object" || Array.isArray(args)) return state;
      const calls = new Map(state.calls);
      calls.set(String(event.data.callId), { callId: String(event.data.callId), args, ok: null });
      return { ...state, calls };
    }
    if (event.type === "tool/result") {
      const callId = String(event.data?.message?.source?.callId ?? "");
      if (!state.calls.has(callId)) return state;
      const calls = new Map(state.calls);
      calls.set(callId, { ...calls.get(callId), ok: event.data.message?.isError !== true });
      return { ...state, calls };
    }
    return state;
  },
  buildLocationData: (context, scope, previous) => {
    if (scope !== "turn" || context.state === void 0) return null;
    const views = [...context.state.calls.values()].filter((call2) => call2.ok === true);
    if (previous?.kind === "turn" && previous.turn === context.state.turn && previous.key === "deep-ui-views" && previous.value.views.length === views.length && previous.value.views.every((call2, index) => call2 === views[index])) {
      return previous;
    }
    return {
      kind: "turn",
      turn: context.state.turn,
      key: "deep-ui-views",
      value: { views }
    };
  }
};

// src/client/api.js
var ROUTE = "api/deep-ui";
var call = async (op, payload, signal) => {
  const response = await fetch(ROUTE, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op, ...payload }),
    signal
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (!result.ok) {
    throw Object.assign(new Error(result.error?.message ?? "Request failed"), { code: result.error?.code ?? "deep-ui/error" });
  }
  return result.value;
};

// src/client/tail.js
var import_react5 = require("react");
var REPLY_HEAD = '{"kind":"answer_to_pending_view"';
var findReplyText = (snapshot, callId) => {
  const chat = snapshot?.views?.get?.("chat");
  if (chat === void 0) return void 0;
  const needle = `"callId":"${callId}"`;
  for (const node of chat.nodes?.values?.() ?? []) {
    const data = node?.data;
    const text = typeof data?.text === "string" ? data.text : Array.isArray(data?.content) ? data.content.filter((block) => block?.type === "text").map((block) => block.text).join("\n") : void 0;
    if (typeof text === "string" && text.startsWith(REPLY_HEAD) && text.includes(needle)) return text;
  }
  return void 0;
};
var SettledView = ({ replyText }) => {
  let payload = null;
  try {
    payload = JSON.parse(replyText);
  } catch {
    payload = null;
  }
  const view = payload?.views?.[0];
  if (view === void 0 || view?.view === void 0) return null;
  const answers = Array.isArray(payload.answers) ? payload.answers : [];
  const answer = answers.find((entry) => entry?.id === view.id) ?? answers[0] ?? null;
  return (0, import_react5.createElement)("div", { className: "dui-q-inline" }, (0, import_react5.createElement)(WidgetCard, { title: view.title ?? "", view: view.view, settled: true, answer }));
};
var InteractiveView = ({ callId, sessionId, useConversation }) => {
  const order = useConversation?.((snapshot) => snapshot?.views?.get?.("chat")?.order?.length ?? 0) ?? 0;
  const replyText = useConversation?.((snapshot) => findReplyText(snapshot, callId));
  const [record, setRecord] = (0, import_react5.useState)(void 0);
  const [revision, setRevision] = (0, import_react5.useState)(0);
  const [flying, setFlying] = (0, import_react5.useState)(false);
  (0, import_react5.useEffect)(() => {
    if (typeof sessionId !== "string" || replyText !== void 0) return void 0;
    let alive = true;
    call("pending", { sessionId }).then((value) => {
      if (alive) setRecord(value);
    }).catch(() => {
      if (alive) setRecord(null);
    });
    return () => {
      alive = false;
    };
  }, [sessionId, order, replyText, revision]);
  if (replyText !== void 0) return (0, import_react5.createElement)(SettledView, { replyText });
  if (flying === "gone" || record === void 0 || record === null || record.callId !== callId) return null;
  const run2 = (make) => {
    if (flying) return;
    setFlying(true);
    void Promise.resolve().then(make).then(() => setFlying("gone")).catch(() => {
      setFlying(false);
      setRevision((value) => value + 1);
    });
  };
  const onSubmit = (action, values) => run2(() => call("reply", { sessionId, viewId: record.id, action, values }));
  const onDismiss = () => run2(() => call("dismiss", { sessionId }));
  return (0, import_react5.createElement)("div", { className: "dui-q-inline" }, (0, import_react5.createElement)(WidgetCard, { title: record.title ?? "", view: record.view, onSubmit, onDismiss, busy: flying === true }));
};
var TailView = ({ call: call2, sessionId, useConversation }) => {
  const shown = checkShownView(call2.args?.title, call2.args?.view);
  if (shown.error !== void 0) return null;
  if (!shown.interactive && call2.args?.await_reply === true) return null;
  if (shown.interactive && call2.args?.await_reply === false) return null;
  if (shown.interactive || call2.args?.await_reply === true) {
    return (0, import_react5.createElement)(InteractiveView, { callId: call2.callId, sessionId, useConversation });
  }
  return (0, import_react5.createElement)("div", { className: "dui-q-inline" }, (0, import_react5.createElement)(WidgetCard, { title: shown.title, view: shown.view }));
};
function ViewsTail({ turn, sessionId, useConversation }) {
  const source = (0, import_react5.useMemo)(() => turn?.data?.source?.("deep-ui-views"), [turn]);
  const data = (0, import_react5.useSyncExternalStore)(source?.subscribe ?? (() => () => {
  }), () => source?.getSnapshot());
  const views = data?.views ?? [];
  if (views.length === 0) return null;
  return views.map((item) => (0, import_react5.createElement)(TailView, { key: item.callId, call: item, sessionId, useConversation }));
}

// src/core/reply.js
var REPLY_KIND = "user-question-reply";
function viewCardText(args) {
  let card = args;
  if (typeof card === "string") {
    try {
      card = JSON.parse(card);
    } catch {
      return "";
    }
  }
  const shown = checkShownView(card?.title, card?.view);
  if (shown.error !== void 0) return "";
  if (!shown.interactive && card?.await_reply === true) return "";
  if (shown.interactive && card?.await_reply === false) return "";
  const summary = viewSummary(shown.view);
  const head = shown.title === "" ? "[View card]" : `[View card] ${shown.title}`;
  return summary === "" ? head : `${head}
${summary}`;
}
function viewReply(record, action, values, sourceKind = REPLY_KIND) {
  const checked = validateViewAnswer(record?.view, action, values);
  if (checked.error !== void 0) return void 0;
  const callId = record.callId ?? record.id;
  const shown = { id: record.id, title: record.title, view: record.view };
  const given = { id: record.id, action, values: checked };
  return {
    text: JSON.stringify({ kind: "answer_to_pending_view", tool: "show_view", callId, views: [shown], answers: [given] }),
    source: { kind: sourceKind, callId, outcome: "answered" }
  };
}
var isRecord2 = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
function eachNode(view, visit) {
  if (!isRecord2(view)) return;
  visit(view);
  for (const child of Array.isArray(view.children) ? view.children : []) eachNode(child, visit);
}
function viewAnswerText(view, answer) {
  const values = answer?.values;
  if (!isRecord2(values)) return "";
  const parts = [];
  if (Array.isArray(values.selected)) {
    const labels = /* @__PURE__ */ new Map();
    eachNode(view, (node) => {
      for (const option of Array.isArray(node.options) ? node.options : []) for (const key of [option?.label, option?.value]) if (key !== void 0) labels.set(key, option?.label);
    });
    parts.push(...values.selected.map((value) => labels.get(value) ?? String(value)));
  } else if (typeof values.confirmed === "boolean") {
    let confirmLabel, cancelLabel;
    eachNode(view, (node) => {
      if (node.id === answer.action) {
        confirmLabel = node.confirmLabel;
        cancelLabel = node.cancelLabel;
      }
    });
    parts.push(values.confirmed ? confirmLabel ?? "Confirmed" : cancelLabel ?? "Cancelled");
  } else if (isRecord2(values.fields)) {
    const labels = /* @__PURE__ */ new Map();
    eachNode(view, (node) => {
      for (const field of Array.isArray(node.fields) ? node.fields : []) labels.set(field?.id, field?.label ?? field?.id);
    });
    parts.push(...Object.entries(values.fields).map(([key, value]) => `${labels.get(key) ?? key}: ${value}`));
  }
  if (isRecord2(values.inputs)) {
    const labels = /* @__PURE__ */ new Map();
    eachNode(view, (node) => {
      if (typeof node.id === "string" && node.label !== void 0) labels.set(node.id, node.label);
    });
    parts.push(...Object.entries(values.inputs).map(([key, value]) => `${labels.get(key) ?? key}=${value}`));
  }
  const text = parts.join("; ");
  return text.length > 200 ? `${text.slice(0, 200)}…` : text;
}
function readViewReply(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    return void 0;
  }
  if (value?.kind === "answer_to_pending_view" || Array.isArray(value?.views) && value.views.length > 0 && value?.kind !== "answer_to_pending_question") {
    const views = (Array.isArray(value.views) ? value.views : []).filter((item) => typeof item?.id === "string" && typeof item.title === "string" && isRecord2(item.view));
    if (views.length === 0) return void 0;
    const answers = (Array.isArray(value.answers) ? value.answers : []).filter((item) => typeof item?.id === "string" && typeof item.action === "string" && isRecord2(item.values));
    return { views, answers };
  }
  return void 0;
}
function actionSummary(answer, view) {
  const values = answer?.values;
  if (!isRecord2(values)) return "(skipped)";
  const inputs = inputsSummary(view, values.inputs);
  let text;
  if (Array.isArray(values.selected)) text = `selected: ${values.selected.join(", ")}`;
  else if (typeof values.confirmed === "boolean") text = values.confirmed ? "confirmed" : "cancelled";
  else if (isRecord2(values.fields)) text = Object.entries(values.fields).map(([key, value]) => `${key}: ${value}`).join("; ");
  else if (inputs !== "") text = "";
  else text = typeof answer.action === "string" && answer.action !== "" ? answer.action : "(skipped)";
  if (inputs !== "") text = text === "" ? inputs : `${text}; ${inputs}`;
  if (text === "") text = "(empty)";
  return text.length > 500 ? text.slice(0, 500) : text;
}
function viewReplyText(text) {
  const reply = readViewReply(text);
  if (reply === void 0) return text;
  return reply.views.map((view) => {
    const answer = reply.answers.find((item) => item.id === view.id);
    return `${view.title === "" ? "[Answer to view card]" : `[Answer to view card] ${view.title}`}
Answer: ${actionSummary(answer, view.view)}`;
  }).join("\n\n");
}

// src/client/reply-node.js
var import_react6 = require("react");
var viewReplyRule = {
  id: "deep-ui-view-reply",
  order: 10,
  match: (text, from) => {
    const rest = text.slice(from).trimStart();
    const start = from + (text.slice(from).length - rest.length);
    const data = readViewReply(rest);
    if (data === void 0) return void 0;
    return { id: "deep-ui-view-reply", start, end: text.length, data: { text: rest } };
  }
};
function ViewReplyNode({ node }) {
  const reply = readViewReply(node.data?.text ?? "");
  if (reply === void 0) return null;
  const lines = reply.views.map((view) => {
    const answer = reply.answers.find((item) => item.id === view.id) ?? reply.answers[0];
    return viewAnswerText(view.view, answer);
  }).filter((text) => text !== "");
  if (lines.length === 0) return null;
  return lines.join(" · ");
}

// src/client/index.js
var import_react7 = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
var NS = "deep-ui";
var en = {
  "Cancel": "Cancel",
  "Confirm": "Confirm",
  "Submit": "Submit",
  "Send": "Send",
  "Selected": "Selected",
  "Dismiss": "Dismiss",
  "Dismiss view": "Dismiss view",
  "View": "View",
  "View as chart": "View as chart",
  "View as table": "View as table",
  "Copy data": "Copy data",
  "Download image": "Download image",
  "Chart options": "Chart options",
  "Chart": "Chart",
  "Chart {n}": "Chart {n}",
  "Copied": "Copied",
  "Copy": "Copy",
  "Value": "Value",
  "Series": "Series",
  "Sources": "Sources",
  "Progress": "Progress",
  "Your answer": "Your answer",
  "This view tried to open a page and was stopped.": "This view tried to open a page and was stopped.",
  "(skipped)": "(skipped)"
};
var zh = {
  "Cancel": "取消",
  "Confirm": "确认",
  "Submit": "提交",
  "Send": "发送",
  "Selected": "已选择",
  "Dismiss": "关闭",
  "Dismiss view": "关闭视图",
  "View": "视图",
  "View as chart": "以图表查看",
  "View as table": "以表格查看",
  "Copy data": "复制数据",
  "Download image": "下载图片",
  "Chart options": "图表选项",
  "Chart": "图表",
  "Chart {n}": "图表 {n}",
  "Copied": "已复制",
  "Copy": "复制",
  "Value": "值",
  "Series": "系列",
  "Sources": "来源",
  "Progress": "进度",
  "Your answer": "你的回答",
  "This view tried to open a page and was stopped.": "此视图试图打开页面，已被停止。",
  "(skipped)": "（已跳过）"
};
var withUi = (Component) => function DeepUiView(props) {
  return (0, import_react7.createElement)(ViewUi.Provider, { value: { t: props.t ?? ((key) => key), Markdown: import_dsh_client_ui_primitives.MarkdownText } }, (0, import_react7.createElement)(Component, props));
};
var inject = ["slots", "uiConversation", "locale"];
function apply(ctx) {
  const step = (label, run2) => {
    try {
      run2();
    } catch (error) {
      console.error(`dsh-deep-ui: ${label} failed`, error);
    }
  };
  step("labels and styles", () => ctx.effect(() => {
    const dispose = typeof ctx.locale?.register === "function" ? ctx.locale.register(NS, { zh, en }) : () => {
    };
    const tag = document.createElement("style");
    tag.dataset.plugin = "dsh-deep-ui";
    tag.dataset.pluginCss = "dsh-deep-ui/views";
    tag.textContent = DEEP_UI_CSS;
    document.head.appendChild(tag);
    return () => {
      dispose();
      tag.remove();
    };
  }, "deep-ui: labels and styles"));
  step("views definition", () => ctx.effect(() => ctx.uiConversation.events.register(viewsDefinition), "deep-ui: views definition"));
  step("turn tail", () => ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
    name: "conversation.chat.turnTail",
    id: "deep-ui-views",
    locale: NS
  }, withUi(ViewsTail))));
  step("user text rule", () => ctx.uiConversation.userText.register(viewReplyRule));
  step("user text node", () => ctx.slots.inject("conversation.user.text.node", () => ctx.slots.register({
    name: "conversation.user.text.node",
    key: "deep-ui-view-reply",
    locale: NS
  }, withUi(ViewReplyNode))));
}
return Object.defineProperty({ ...module.exports }, Symbol.toStringTag, { value: 'Module' })
  },
})
