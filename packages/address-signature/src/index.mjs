/**
 * @universal-profiles/address-signature
 *
 * Dependency-free helpers for the Address Signature: the identicon badge, the #XXXX
 * suffix and the address-derived gradient that every Universal Profile carries.
 *
 * Every function is pure and deterministic. Colours are emitted as CSS strings.
 * See ../README.md for the algorithm notes and the status of each rule.
 */
import { keccak256 } from "./keccak.mjs";

/** Regular expression for a 20-byte hex address with the 0x prefix. */
export const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/** Fallback gradient stops when no valid address exists (neutral.20 at 6 and 12 percent alpha). */
export const FALLBACK_STOPS = Object.freeze({
  light: Object.freeze({ start: "#24354210", end: "#24354220" }),
  dark: Object.freeze({ start: "#F8FAFB10", end: "#F8FAFB20" }),
});

/** Canvas colours used by the aura and card recipes. */
export const CANVAS = Object.freeze({ light: "#F8FAFB", dark: "#121B21" });

/** Label rendered when a profile has no name. Observed product string. */
export const ANONYMOUS_LABEL = "anonymous-profile";

/** Alpha applied to both gradient stops in production (0x80, 50 percent). */
export const GRADIENT_ALPHA = 0x80;

/**
 * True when the value is a syntactically valid 20-byte hex address.
 * @param {unknown} value
 */
export function isAddress(value) {
  return typeof value === "string" && ADDRESS_RE.test(value);
}

/**
 * Lower-case, 0x-prefixed form of a valid address; null for anything else.
 * Whitespace around the value is tolerated; a missing 0x prefix is not.
 * @param {unknown} value
 * @returns {string|null}
 */
export function normalizeAddress(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return ADDRESS_RE.test(trimmed) ? trimmed.toLowerCase() : null;
}

/**
 * EIP-55 mixed-case checksum encoding. Throws for invalid input.
 * @param {string} value
 */
export function toChecksumAddress(value) {
  const normalized = normalizeAddress(value);
  if (!normalized) throw new TypeError(`Invalid address: ${String(value)}`);
  const hex = normalized.slice(2);
  const hash = keccak256(hex);
  let out = "0x";
  for (let i = 0; i < hex.length; i++) {
    out += parseInt(hash[i], 16) >= 8 ? hex[i].toUpperCase() : hex[i];
  }
  return out;
}

/**
 * True when the value is a valid address whose mixed-case form matches EIP-55.
 * All-lower-case and all-upper-case inputs are accepted as unchecksummed but valid.
 * @param {unknown} value
 */
export function isChecksumAddress(value) {
  if (!isAddress(value)) return false;
  const hex = value.slice(2);
  if (hex === hex.toLowerCase() || hex === hex.toUpperCase()) return true;
  return toChecksumAddress(value) === value;
}

/**
 * Alpha option to two hex digits. Numbers from 0 to 1 inclusive are fractions (1 is opaque);
 * integers from 2 to 255 are 8-bit values. Anything else is rejected, so an alpha of 1 can never
 * silently mean 1/255.
 */
const alphaHex = (alpha) => {
  if (typeof alpha !== "number" || !Number.isFinite(alpha) || alpha < 0 || alpha > 255) throw new RangeError(`alpha must be a fraction from 0 to 1 or an integer from 2 to 255: ${alpha}`);
  const n = alpha <= 1 ? Math.round(alpha * 255) : alpha;
  if (!Number.isInteger(n)) throw new RangeError(`alpha above 1 must be an integer from 2 to 255: ${alpha}`);
  return n.toString(16).padStart(2, "0").toUpperCase();
};

// Option validation for the generators. The options are developer input, not user data, but they are
// interpolated into CSS and SVG, so numbers must be finite and colours and ids must match a safe shape.
const checkNumber = (name, value, { min = -Infinity, integer = false, exclusiveMin = false } = {}) => {
  if (typeof value !== "number" || !Number.isFinite(value) || (integer && !Number.isInteger(value)) || value < min || (exclusiveMin && value === min)) {
    throw new RangeError(`${name} must be a finite${integer ? " integer" : " number"}${min > -Infinity ? ` ${exclusiveMin ? "above" : "of at least"} ${min}` : ""}: ${String(value)}`);
  }
  return value;
};
const SAFE_COLOR_RE = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+|(rgb|rgba|hsl|hsla)\([0-9.,%\s/-]+\))$/;
const checkColor = (name, value) => {
  if (typeof value !== "string" || !SAFE_COLOR_RE.test(value)) throw new TypeError(`${name} must be a hex, rgb(), hsl() or named colour: ${String(value)}`);
  return value;
};
const SAFE_ID_RE = /^[A-Za-z_][A-Za-z0-9_.:-]*$/;
const checkId = (name, value) => {
  if (typeof value !== "string" || !SAFE_ID_RE.test(value)) throw new TypeError(`${name} must be an XML id (letters, digits, "_", "-", ".", ":"; no spaces): ${String(value)}`);
  return value;
};

/**
 * The two gradient stops derived from an address: bytes 1-3 (hex characters 2-8) and
 * bytes 18-20 (hex characters 36-42) as RGB, each with the same alpha (default 0x80).
 * Invalid or missing addresses return the neutral fallback for the theme.
 *
 * @param {unknown} address
 * @param {{alpha?: number, theme?: "light"|"dark"}} [options] alpha as a fraction 0-1 (1 is opaque) or an integer 2-255; theme selects the fallback
 * @returns {{start: string, end: string, valid: boolean, address: string|null}}
 */
export function gradientStops(address, options = {}) {
  const theme = options.theme === "dark" ? "dark" : "light";
  const normalized = normalizeAddress(address);
  if (!normalized) return { ...FALLBACK_STOPS[theme], valid: false, address: null };
  const a = alphaHex(options.alpha ?? GRADIENT_ALPHA);
  const hex = normalized.slice(2).toUpperCase();
  return {
    start: `#${hex.slice(0, 6)}${a}`,
    end: `#${hex.slice(34, 40)}${a}`,
    valid: true,
    address: normalized,
  };
}

/**
 * CSS background-image for the address gradient, identical to the production helper:
 * a 90 degree linear gradient from the start stop to the end stop.
 * @param {unknown} address
 * @param {{alpha?: number, theme?: "light"|"dark", angle?: number}} [options]
 */
export function gradientCss(address, options = {}) {
  const { start, end } = gradientStops(address, options);
  const angle = checkNumber("angle", options.angle ?? 90);
  return `linear-gradient(${angle}deg, ${start}, ${end})`;
}

/**
 * Props for a React Native LinearGradient: horizontal, left to right.
 * @param {unknown} address
 * @param {{alpha?: number, theme?: "light"|"dark"}} [options]
 */
export function gradientReactNative(address, options = {}) {
  const { start, end } = gradientStops(address, options);
  return { colors: [start, end], start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } };
}

/** Escape text for an XML attribute or text node. */
export const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

/** Split "#RRGGBBAA" into {hex: "#RRGGBB", opacity: 0-1}. */
const splitAlpha = (stop) => {
  const m = /^#([0-9A-F]{6})([0-9A-F]{2})?$/i.exec(stop);
  if (!m) throw new TypeError(`Unexpected stop ${stop}`);
  return { hex: `#${m[1].toUpperCase()}`, opacity: m[2] ? Math.round((parseInt(m[2], 16) / 255) * 1000) / 1000 : 1 };
};

/**
 * A self-contained SVG rectangle filled with the address gradient over the cover fallback.
 * @param {unknown} address
 * @param {{width?: number, height?: number, theme?: "light"|"dark", alpha?: number, id?: string, radius?: number, background?: string}} [options]
 */
export function gradientSvg(address, options = {}) {
  const width = checkNumber("width", options.width ?? 1200, { min: 0, exclusiveMin: true });
  const height = checkNumber("height", options.height ?? 630, { min: 0, exclusiveMin: true });
  const theme = options.theme === "dark" ? "dark" : "light";
  const gradientId = checkId("id", options.id ?? "up-address-gradient");
  const radius = checkNumber("radius", options.radius ?? 0, { min: 0 });
  const background = checkColor("background", options.background ?? (theme === "dark" ? "#1B2832" : "#DEE7ED"));
  const { start, end } = gradientStops(address, { alpha: options.alpha, theme });
  const s = splitAlpha(start);
  const e = splitAlpha(end);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Address gradient">`,
    `  <defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="0">`,
    `    <stop offset="0" stop-color="${s.hex}" stop-opacity="${s.opacity}"/>`,
    `    <stop offset="1" stop-color="${e.hex}" stop-opacity="${e.opacity}"/>`,
    `  </linearGradient></defs>`,
    `  <rect width="${width}" height="${height}" rx="${radius}" fill="${background}"/>`,
    `  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#${gradientId})"/>`,
    `</svg>`,
    "",
  ].join("\n");
}

/**
 * Recipe for an aura background: the two address stops as soft radial blobs on the canvas.
 * Numbers are fractions of the canvas so the recipe is resolution independent.
 * @param {unknown} address
 * @param {{theme?: "light"|"dark"}} [options]
 */
export function auraRecipe(address, options = {}) {
  const theme = options.theme === "dark" ? "dark" : "light";
  const stops = gradientStops(address, { alpha: 0xff, theme });
  const alpha = theme === "dark" ? 0.45 : 0.3;
  return {
    theme,
    canvas: CANVAS[theme],
    valid: stops.valid,
    blobs: [
      { cx: 0.22, cy: 0.3, radius: 0.55, color: splitAlpha(stops.start).hex, alpha },
      { cx: 0.78, cy: 0.72, radius: 0.55, color: splitAlpha(stops.end).hex, alpha },
    ],
    blur: 0.12,
    grain: { frequency: 0.9, opacity: 0.04 },
    safeZone: { text: "left 40 percent", lockup: "bottom right 25 percent; keep the darker blob away from it" },
  };
}

/**
 * Self-contained SVG rendering of the aura recipe (radial blobs, Gaussian blur, monochrome grain).
 * @param {unknown} address
 * @param {{width?: number, height?: number, theme?: "light"|"dark", id?: string}} [options]
 */
export function auraSvg(address, options = {}) {
  const width = checkNumber("width", options.width ?? 1600, { min: 0, exclusiveMin: true });
  const height = checkNumber("height", options.height ?? 900, { min: 0, exclusiveMin: true });
  const auraId = checkId("id", options.id ?? "up-aura");
  const r = auraRecipe(address, options);
  const short = Math.min(width, height);
  const blobs = r.blobs
    .map(
      (b, i) =>
        `  <circle cx="${(b.cx * width).toFixed(1)}" cy="${(b.cy * height).toFixed(1)}" r="${(b.radius * short).toFixed(1)}" fill="${b.color}" fill-opacity="${b.alpha}" filter="url(#${auraId}-blur)"/>`,
    )
    .join("\n");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Address aura background">`,
    `  <defs>`,
    `    <filter id="${auraId}-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${(r.blur * short).toFixed(1)}"/></filter>`,
    `    <filter id="${auraId}-grain"><feTurbulence type="fractalNoise" baseFrequency="${r.grain.frequency}" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`,
    `  </defs>`,
    `  <rect width="${width}" height="${height}" fill="${r.canvas}"/>`,
    blobs,
    `  <rect width="${width}" height="${height}" filter="url(#${auraId}-grain)" opacity="${r.grain.opacity}"/>`,
    `</svg>`,
    "",
  ].join("\n");
}

/**
 * The #XXXX suffix: a hash sign plus characters 2-6 of the EIP-55 checksummed address.
 * Returns an empty string for invalid or missing addresses.
 * @param {unknown} address
 */
export function nameSuffix(address) {
  const normalized = normalizeAddress(address);
  if (!normalized) return "";
  return `#${toChecksumAddress(normalized).slice(2, 6)}`;
}

/**
 * Parts of a display name so consumers can style the prefix, name and suffix separately.
 * Named profiles: "@" + name + "#XXXX". Anonymous profiles: "anonymous-profile#XXXX" with no prefix.
 * The name is trimmed, so a whitespace-only name is anonymous (a normalization: the shipped mobile
 * username component does not trim and would render the spaces as a name).
 * @param {string|null|undefined} name
 * @param {unknown} address
 * @param {{prefix?: string, anonymousLabel?: string}} [options]
 * @returns {{prefix: string, name: string, suffix: string, anonymous: boolean, text: string}}
 */
export function displayNameParts(name, address, options = {}) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  const anonymous = trimmed.length === 0;
  const prefix = anonymous ? "" : options.prefix ?? "@";
  const label = anonymous ? options.anonymousLabel ?? ANONYMOUS_LABEL : trimmed;
  const suffix = nameSuffix(address);
  return { prefix, name: label, suffix, anonymous, text: `${prefix}${label}${suffix}` };
}

/**
 * The full display string, e.g. "@alice#3b2F" or "anonymous-profile#3b2F".
 * @param {string|null|undefined} name
 * @param {unknown} address
 * @param {{prefix?: string, anonymousLabel?: string}} [options]
 */
export function displayName(name, address, options = {}) {
  return displayNameParts(name, address, options).text;
}

/**
 * Middle-truncated, checksummed address: 0x + `leading` hex characters, three dots, `trailing` characters.
 * Presets: compact 6/4 (rows, EOA labels), full 10/8 (detail views). Returns "" for invalid input.
 * @param {unknown} address
 * @param {{leading?: number, trailing?: number, separator?: string}} [options]
 */
export function sliceAddress(address, options = {}) {
  const leading = checkNumber("leading", options.leading ?? 6, { min: 0, integer: true });
  const trailing = checkNumber("trailing", options.trailing ?? 4, { min: 0, integer: true });
  const separator = String(options.separator ?? "...");
  const normalized = normalizeAddress(address);
  if (!normalized) return "";
  const checksummed = toChecksumAddress(normalized);
  if (leading + trailing >= 40) return checksummed;
  return `${checksummed.slice(0, 2 + leading)}${separator}${trailing ? checksummed.slice(-trailing) : ""}`;
}

/**
 * Seed used for the identicon: the lower-cased address, matching the identicon library
 * both products use. Returns null for invalid input.
 * @param {unknown} address
 */
export function identiconSeed(address) {
  return normalizeAddress(address);
}

// ---------------------------------------------------------------------------
// Identicon: an exact reimplementation of the 8x8 "blockies" algorithm used by the
// products' identicon library (ethereum-blockies-base64 1.x), so that web, mobile and
// this package derive identical badges from the same seed.

const createPrng = (seed) => {
  // A plain array on purpose: the reference keeps un-truncated doubles between seeding steps
  // and only the shift operator applies 32-bit truncation, so a typed array would diverge.
  const randseed = [0, 0, 0, 0];
  for (let i = 0; i < seed.length; i++) {
    randseed[i % 4] = (randseed[i % 4] << 5) - randseed[i % 4] + seed.charCodeAt(i);
  }
  return () => {
    const t = randseed[0] ^ (randseed[0] << 11);
    randseed[0] = randseed[1];
    randseed[1] = randseed[2];
    randseed[2] = randseed[3];
    randseed[3] = randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8);
    return (randseed[3] >>> 0) / ((1 << 31) >>> 0);
  };
};

const hue2rgb = (p, q, t) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

const hslToHex = ([h, s, l]) => {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const hex = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
};

/**
 * Deterministic identicon data for an address: three colours and an 8x8 grid where
 * 0 is the background, 1 the foreground and 2 the spot colour. Rows are mirrored
 * horizontally, as in the reference algorithm. Returns null for invalid input.
 * @param {unknown} address
 * @param {{size?: number}} [options] grid size (default 8)
 */
export function identiconData(address, options = {}) {
  const size = checkNumber("size", options.size ?? 8, { min: 1, integer: true });
  const seed = identiconSeed(address);
  if (!seed) return null;
  const rand = createPrng(seed);
  const createColor = () => {
    const h = Math.floor(rand() * 360);
    const s = rand() * 60 + 40;
    const l = (rand() + rand() + rand() + rand()) * 25;
    return [h / 360, s / 100, l / 100];
  };
  const color = createColor();
  const bgcolor = createColor();
  const spotcolor = createColor();
  const dataWidth = Math.ceil(size / 2);
  const mirrorWidth = size - dataWidth;
  const grid = [];
  for (let y = 0; y < size; y++) {
    let row = [];
    for (let x = 0; x < dataWidth; x++) row[x] = Math.floor(rand() * 2.3);
    row = row.concat(row.slice(0, mirrorWidth).reverse());
    grid.push(row);
  }
  return {
    seed,
    size,
    colors: { background: hslToHex(bgcolor), foreground: hslToHex(color), spot: hslToHex(spotcolor) },
    grid,
  };
}

/**
 * Self-contained SVG identicon. `scale` is the pixel size of one cell (default 4 -> 32 px).
 * Invalid input renders nothing and returns "".
 * @param {unknown} address
 * @param {{scale?: number, size?: number, title?: string, round?: boolean}} [options]
 */
export function identiconSvg(address, options = {}) {
  const scale = checkNumber("scale", options.scale ?? 4, { min: 0, exclusiveMin: true });
  const data = identiconData(address, options);
  if (!data) return "";
  const px = data.size * scale;
  const rects = [];
  data.grid.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (!cell) return;
      const fill = cell === 1 ? data.colors.foreground : data.colors.spot;
      rects.push(`<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${fill}"/>`);
    }),
  );
  const title = escapeXml(options.title ?? `Identicon for ${sliceAddress(data.seed)}`);
  const clip = options.round ? ` clip-path="circle(50%)"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" shape-rendering="crispEdges" role="img" aria-label="${title}"><g${clip}><rect width="${px}" height="${px}" fill="${data.colors.background}"/>${rects.join("")}</g></svg>`;
}

/**
 * Self-contained SVG share card carrying the full Address Signature: cover with the address
 * gradient, a floating avatar ring with the identicon badge, the name with its suffix and the
 * truncated address. Fonts are referenced by family name and fall back to the platform's
 * sans-serif and monospace faces. Values are tokens from the design system.
 * @param {unknown} address
 * @param {{name?: string, width?: number, theme?: "light"|"dark", id?: string}} [options]
 */
export function signatureSvg(address, options = {}) {
  const theme = options.theme === "dark" ? "dark" : "light";
  const width = checkNumber("width", options.width ?? 1200, { min: 0, exclusiveMin: true });
  const height = Math.round(width * 0.525);
  const id = checkId("id", options.id ?? "up-signature");
  const t =
    theme === "dark"
      ? { canvas: "#121B21", card: "#1B2832", ink: "#F8FAFB", muted: "#8BA9C1", ring: "#121B21", cover: "#1B2832", border: "#2D4253" }
      : { canvas: "#F8FAFB", card: "#FFFFFF", ink: "#243542", muted: "#476A85", ring: "#FFFFFF", cover: "#DEE7ED", border: "#DEE7ED" };
  const parts = displayNameParts(options.name, address);
  const stops = gradientStops(address, { theme });
  const s = splitAlpha(stops.start);
  const e = splitAlpha(stops.end);
  const cardX = Math.round(width * 0.08);
  const cardW = width - cardX * 2;
  const cardY = Math.round(height * 0.1);
  const cardH = height - cardY * 2;
  const coverH = Math.round(cardH * 0.46);
  const radius = Math.round(width * 0.02);
  const avatar = Math.round(width * 0.1);
  const ring = Math.max(3, Math.round(avatar * 0.035));
  const badge = Math.round(avatar * 0.3);
  const cx = cardX + Math.round(cardW * 0.14);
  const cy = cardY + coverH;
  const nameSize = Math.round(width * 0.03);
  const addrSize = Math.round(width * 0.016);
  const n = (v) => Math.round(v * 100) / 100;
  const badgeSvg = badge > 0 && identiconData(address)
    ? identiconSvg(address, { scale: badge / 8 })
        .replace(/^<svg[^>]*>/, "")
        .replace(/<\/svg>$/, "")
    : "";
  const textY = cy + avatar / 2 + nameSize * 1.6;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(parts.text)}">`,
    `  <defs>`,
    `    <linearGradient id="${id}-cover" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${s.hex}" stop-opacity="${s.opacity}"/><stop offset="1" stop-color="${e.hex}" stop-opacity="${e.opacity}"/></linearGradient>`,
    `    <clipPath id="${id}-card"><rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${radius}"/></clipPath>`,
    `    <clipPath id="${id}-avatar"><circle cx="${cx}" cy="${cy}" r="${avatar / 2}"/></clipPath>`,
    `    <clipPath id="${id}-badge"><circle cx="${cx + avatar / 2 - badge / 2 - 1}" cy="${cy + avatar / 2 - badge / 2 - 1}" r="${badge / 2}"/></clipPath>`,
    `  </defs>`,
    `  <rect width="${width}" height="${height}" fill="${t.canvas}"/>`,
    `  <g clip-path="url(#${id}-card)">`,
    `    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${t.card}"/>`,
    `    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${coverH}" fill="${t.cover}"/>`,
    `    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${coverH}" fill="url(#${id}-cover)"/>`,
    `  </g>`,
    `  <rect x="${cardX + 0.5}" y="${cardY + 0.5}" width="${cardW - 1}" height="${cardH - 1}" rx="${radius}" fill="none" stroke="${t.border}"/>`,
    `  <circle cx="${cx}" cy="${cy}" r="${avatar / 2 + ring}" fill="${t.ring}"/>`,
    `  <circle cx="${cx}" cy="${cy}" r="${avatar / 2}" fill="${t.cover}"/>`,
    `  <g transform="translate(${n(cx - avatar * 0.22)}, ${n(cy - avatar * 0.26)})" fill="none" stroke="${t.ring}" stroke-width="${n(Math.max(1.5, avatar * 0.03))}" stroke-linecap="round"><circle cx="${n(avatar * 0.22)}" cy="${n(avatar * 0.16)}" r="${n(avatar * 0.13)}"/><path d="M0 ${n(avatar * 0.52)} a${n(avatar * 0.22)} ${n(avatar * 0.2)} 0 0 1 ${n(avatar * 0.44)} 0"/></g>`,
    badgeSvg
      ? `  <circle cx="${cx + avatar / 2 - badge / 2 - 1}" cy="${cy + avatar / 2 - badge / 2 - 1}" r="${n(badge / 2 + Math.max(1, ring / 2))}" fill="${t.ring}"/>\n  <g clip-path="url(#${id}-badge)" shape-rendering="crispEdges"><g transform="translate(${cx + avatar / 2 - badge - 1}, ${cy + avatar / 2 - badge - 1})">${badgeSvg}</g></g>`
      : "",
    `  <text x="${cardX + Math.round(cardW * 0.14) - avatar / 2}" y="${textY}" font-family="PT Mono, ui-monospace, monospace" font-weight="700" font-size="${nameSize}" fill="${t.ink}">${escapeXml(parts.prefix + parts.name)}<tspan fill="${t.muted}">${escapeXml(parts.suffix)}</tspan></text>`,
    stops.valid
      ? `  <text x="${cardX + Math.round(cardW * 0.14) - avatar / 2}" y="${textY + addrSize * 1.9}" font-family="PT Mono, ui-monospace, monospace" font-size="${addrSize}" fill="${t.muted}">${escapeXml(sliceAddress(address, { leading: 10, trailing: 8 }))}</text>`
      : "",
    `</svg>`,
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

/** Identicon size table shared by web and mobile: avatar, badge and ring in px. */
export const IDENTICON_SIZES = Object.freeze({
  "2xs": Object.freeze({ avatar: 16, badge: 8, ring: 1 }),
  xs: Object.freeze({ avatar: 24, badge: 12, ring: 1 }),
  s: Object.freeze({ avatar: 40, badge: 16, ring: 2 }),
  m: Object.freeze({ avatar: 56, badge: 20, ring: 2 }),
  l: Object.freeze({ avatar: 80, badge: 24, ring: 2.5 }),
  xl: Object.freeze({ avatar: 96, badge: 28, ring: 3 }),
  "2xl": Object.freeze({ avatar: 120, badge: 36, ring: 3.5 }),
});

/** Avatar size (px) from which the identicon badge is mandatory. */
export const MIN_BADGE_AVATAR = 24;

/**
 * Badge and ring sizes for an avatar size. Exact for table sizes; interpolated otherwise.
 * @param {number|keyof typeof IDENTICON_SIZES} size
 */
export function identiconSizeFor(size) {
  if (typeof size === "string") {
    const entry = IDENTICON_SIZES[size];
    if (!entry) throw new RangeError(`Unknown identicon size "${size}"`);
    return { ...entry, showBadge: entry.avatar >= MIN_BADGE_AVATAR };
  }
  const avatar = Number(size);
  if (!Number.isFinite(avatar) || avatar <= 0) throw new RangeError(`Invalid avatar size ${size}`);
  const entries = Object.values(IDENTICON_SIZES);
  const exact = entries.find((e) => e.avatar === avatar);
  if (exact) return { ...exact, showBadge: avatar >= MIN_BADGE_AVATAR };
  const badge = Math.round(avatar * 0.3);
  const ring = avatar < 40 ? 1 : avatar < 80 ? 2 : avatar < 120 ? 3 : 3.5;
  return { avatar, badge, ring, showBadge: avatar >= MIN_BADGE_AVATAR };
}

export { keccak256 };
