/**
 * Colour math shared by the token build and the validators.
 * Dependency-free. Conversions follow the same rounding as the HSL palette
 * generator used by the product code (tinycolor2 semantics: HSL -> RGB, each
 * channel rounded with Math.round before hex encoding).
 */

/** Clamp a number into [min, max]. */
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const hue2rgb = (p, q, t) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

/**
 * HSL (h in degrees, s and l in percent) -> {r,g,b} 0-255 (rounded).
 */
export function hslToRgb(h, s, l) {
  const hh = (((h % 360) + 360) % 360) / 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  let r, g, b;
  if (ss === 0) {
    r = g = b = ll;
  } else {
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
    const p = 2 * ll - q;
    r = hue2rgb(p, q, hh + 1 / 3);
    g = hue2rgb(p, q, hh);
    b = hue2rgb(p, q, hh - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

const hex2 = (n) => n.toString(16).padStart(2, "0");

/** {r,g,b} -> "#RRGGBB" (upper-case, as used throughout the token sources). */
export const rgbToHex = ({ r, g, b }) => `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();

/** HSL -> "#RRGGBB". */
export const hslToHex = (h, s, l) => rgbToHex(hslToRgb(h, s, l));

/**
 * Parse a colour string into {r,g,b,a}. Supports #RGB, #RRGGBB, #RRGGBBAA,
 * rgb(), rgba(), hsl(), hsla(). Returns null for anything else.
 */
export function parseColor(input) {
  if (typeof input !== "string") return null;
  const s = input.trim();
  let m = s.match(/^#([0-9a-f]{3})$/i);
  if (m) {
    const [r, g, b] = m[1].split("").map((c) => parseInt(c + c, 16));
    return { r, g, b, a: 1 };
  }
  m = s.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (m) {
    const v = m[1];
    return {
      r: parseInt(v.slice(0, 2), 16),
      g: parseInt(v.slice(2, 4), 16),
      b: parseInt(v.slice(4, 6), 16),
      a: m[2] ? parseInt(m[2], 16) / 255 : 1,
    };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (m) {
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  }
  m = s.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (m) {
    const rgb = hslToRgb(+m[1], +m[2], +m[3]);
    return { ...rgb, a: m[4] === undefined ? 1 : +m[4] };
  }
  return null;
}

/** sRGB channel (0-255) -> linear light. */
const linear = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

/** WCAG 2.x relative luminance of an opaque colour. */
export function relativeLuminance({ r, g, b }) {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * Composite a foreground colour with alpha over an opaque background.
 * Returns an opaque {r,g,b}.
 */
export function composite(fg, bg) {
  const a = fg.a === undefined ? 1 : fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

/**
 * WCAG 2.x contrast ratio between two colours. Translucent foregrounds are
 * composited over the background first; translucent backgrounds are
 * composited over `base` (default white).
 */
export function contrastRatio(fgInput, bgInput, base = { r: 255, g: 255, b: 255, a: 1 }) {
  const fg = typeof fgInput === "string" ? parseColor(fgInput) : fgInput;
  const bgRaw = typeof bgInput === "string" ? parseColor(bgInput) : bgInput;
  if (!fg || !bgRaw) throw new Error(`contrastRatio: unparseable colour (${fgInput}, ${bgInput})`);
  const bg = bgRaw.a !== undefined && bgRaw.a < 1 ? composite(bgRaw, base) : bgRaw;
  const fgOpaque = fg.a !== undefined && fg.a < 1 ? composite(fg, bg) : fg;
  const l1 = relativeLuminance(fgOpaque);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Format a ratio as "4.90:1". */
export const formatRatio = (ratio) => `${ratio.toFixed(2)}:1`;
