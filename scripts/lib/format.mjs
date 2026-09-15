/**
 * Value formatters shared by the build outputs.
 */
import { parseColor } from "./color.mjs";

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export const dimensionToCss = (v) => (isObject(v) ? `${v.value}${v.unit}` : String(v));
export const dimensionToNumber = (v) => (isObject(v) ? v.value : Number(v));
export const durationToCss = (v) => (isObject(v) ? `${v.value}${v.unit}` : String(v));
export const durationToNumber = (v) => (isObject(v) ? v.value : Number(v));

export const fontFamilyToCss = (v) => {
  const list = Array.isArray(v) ? v : [v];
  return list.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(", ");
};

export const cubicBezierToCss = (v) => `cubic-bezier(${v.join(", ")})`;

export const shadowToCss = (v) => {
  const layers = Array.isArray(v) ? v : [v];
  return layers
    .map((l) => `${l.inset ? "inset " : ""}${l.offsetX} ${l.offsetY} ${l.blur} ${l.spread ?? "0px"} ${l.color}`)
    .join(", ");
};

/** Expand a typography composite into CSS longhand pairs and a `font` shorthand. */
export function typographyToCss(v) {
  const family = fontFamilyToCss(v.fontFamily);
  const size = dimensionToCss(v.fontSize);
  const lh = dimensionToCss(v.lineHeight);
  const ls = v.letterSpacing ? dimensionToCss(v.letterSpacing) : "0px";
  const parts = {
    "font-family": family,
    "font-weight": String(v.fontWeight),
    "font-size": size,
    "line-height": lh,
    "letter-spacing": ls,
  };
  if (v.textTransform) parts["text-transform"] = v.textTransform;
  const shorthand = `${v.fontWeight} ${size}/${lh} ${family}`;
  return { parts, shorthand };
}

/** Convert any resolved token value to its CSS string form. */
export function valueToCss(type, v) {
  switch (type) {
    case "color":
    case "string":
      return String(v);
    case "dimension":
      return dimensionToCss(v);
    case "duration":
      return durationToCss(v);
    case "fontFamily":
      return fontFamilyToCss(v);
    case "fontWeight":
    case "number":
      return String(v);
    case "cubicBezier":
      return cubicBezierToCss(v);
    case "shadow":
      return shadowToCss(v);
    case "typography":
      return typographyToCss(v).shorthand;
    default:
      return typeof v === "string" ? v : JSON.stringify(v);
  }
}

/** Convert a resolved value to a plain JS/TS literal-friendly value. */
export function valueToJs(type, v) {
  switch (type) {
    case "dimension":
      return dimensionToNumber(v);
    case "duration":
      return durationToNumber(v);
    case "typography":
      return {
        fontFamily: Array.isArray(v.fontFamily) ? v.fontFamily : [v.fontFamily],
        fontWeight: Number(v.fontWeight),
        fontSize: dimensionToNumber(v.fontSize),
        lineHeight: dimensionToNumber(v.lineHeight),
        letterSpacing: v.letterSpacing ? dimensionToNumber(v.letterSpacing) : 0,
        ...(v.textTransform ? { textTransform: v.textTransform } : {}),
      };
    case "shadow": {
      const layers = Array.isArray(v) ? v : [v];
      const out = layers.map((l) => ({
        color: l.color,
        offsetX: parseFloat(l.offsetX),
        offsetY: parseFloat(l.offsetY),
        blur: parseFloat(l.blur),
        spread: parseFloat(l.spread ?? "0"),
        ...(l.inset ? { inset: true } : {}),
      }));
      return out.length === 1 ? out[0] : out;
    }
    default:
      return v;
  }
}

/** Colour string -> Figma {r,g,b,a} floats. */
export function colorToFigma(str) {
  const c = parseColor(str);
  if (!c) return null;
  const round = (n) => Math.round(n * 10000) / 10000;
  return { r: round(c.r / 255), g: round(c.g / 255), b: round(c.b / 255), a: round(c.a ?? 1) };
}

/** Stable JSON with two-space indent and trailing newline. */
export const stableJson = (obj) => `${JSON.stringify(obj, null, 2)}\n`;

/** Set a value at a dotted path inside a nested object. */
export function setPath(obj, segments, value) {
  let cur = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const k = segments[i];
    if (!isObject(cur[k])) cur[k] = {};
    cur = cur[k];
  }
  cur[segments[segments.length - 1]] = value;
}

/** Render a JS value as a TypeScript literal with quoted keys. */
export function toTsLiteral(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);
  if (Array.isArray(value)) {
    return `[${value.map((v) => toTsLiteral(v, indent)).join(", ")}]`;
  }
  if (isObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    const body = entries
      .map(([k, v]) => `${padIn}${JSON.stringify(k)}: ${toTsLiteral(v, indent + 1)}`)
      .join(",\n");
    return `{\n${body},\n${pad}}`;
  }
  return JSON.stringify(value);
}
