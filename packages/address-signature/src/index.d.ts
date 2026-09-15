/** Regular expression for a 20-byte hex address with the 0x prefix. */
export declare const ADDRESS_RE: RegExp;
export declare const FALLBACK_STOPS: Readonly<{ light: Readonly<{ start: string; end: string }>; dark: Readonly<{ start: string; end: string }> }>;
export declare const CANVAS: Readonly<{ light: string; dark: string }>;
export declare const ANONYMOUS_LABEL: "anonymous-profile";
export declare const GRADIENT_ALPHA: 128;
export declare const MIN_BADGE_AVATAR: 24;

export type Theme = "light" | "dark";

export interface GradientStops {
  /** "#RRGGBBAA" stop derived from bytes 1-3, or the theme fallback. */
  start: string;
  /** "#RRGGBBAA" stop derived from bytes 18-20, or the theme fallback. */
  end: string;
  /** False when the input was not a valid address and the fallback is returned. */
  valid: boolean;
  /** Lower-case normalized address, or null. */
  address: string | null;
}

export interface GradientOptions {
  /** Alpha as a fraction from 0 to 1 (1 is opaque) or an integer from 2 to 255. Default 0x80. Anything else throws a RangeError. */
  alpha?: number;
  theme?: Theme;
}


export interface AuraBlob { cx: number; cy: number; radius: number; color: string; alpha: number }
export interface AuraRecipe {
  theme: Theme;
  canvas: string;
  valid: boolean;
  blobs: AuraBlob[];
  blur: number;
  grain: { frequency: number; opacity: number };
  safeZone: { text: string; lockup: string };
}

export interface DisplayNameParts {
  prefix: string;
  name: string;
  suffix: string;
  anonymous: boolean;
  text: string;
}

export interface IdenticonData {
  seed: string;
  size: number;
  colors: { background: string; foreground: string; spot: string };
  /** Rows of 0 (background), 1 (foreground) and 2 (spot). */
  grid: number[][];
}

export type IdenticonSizeName = "2xs" | "xs" | "s" | "m" | "l" | "xl" | "2xl";
export interface IdenticonSize { avatar: number; badge: number; ring: number }
export declare const IDENTICON_SIZES: Readonly<Record<IdenticonSizeName, Readonly<IdenticonSize>>>;

export declare function isAddress(value: unknown): value is string;
export declare function normalizeAddress(value: unknown): string | null;
export declare function toChecksumAddress(value: string): string;
export declare function isChecksumAddress(value: unknown): boolean;
export declare function gradientStops(address: unknown, options?: GradientOptions): GradientStops;
// Builder options are validated, not escaped: widths, heights, scale and angle must be finite numbers
// (widths, heights and scale above zero; radius at least zero), `id` an XML id without spaces or quotes,
// `background` a hex, rgb(), hsl() or named colour. Invalid options throw a RangeError or TypeError.
export declare function gradientCss(address: unknown, options?: GradientOptions & { angle?: number }): string;
export declare function gradientReactNative(address: unknown, options?: GradientOptions): { colors: [string, string]; start: { x: number; y: number }; end: { x: number; y: number } };
export declare function gradientSvg(address: unknown, options?: GradientOptions & { width?: number; height?: number; id?: string; radius?: number; background?: string }): string;
export declare function auraRecipe(address: unknown, options?: { theme?: Theme }): AuraRecipe;
export declare function auraSvg(address: unknown, options?: { theme?: Theme; width?: number; height?: number; id?: string }): string;
export declare function nameSuffix(address: unknown): string;
/** The name is trimmed; an empty or whitespace-only name yields the anonymous form. */
export declare function displayNameParts(name: string | null | undefined, address: unknown, options?: { prefix?: string; anonymousLabel?: string }): DisplayNameParts;
export declare function displayName(name: string | null | undefined, address: unknown, options?: { prefix?: string; anonymousLabel?: string }): string;
/** `leading` and `trailing` are non-negative integers; a zero `trailing` renders no trailing characters. */
export declare function sliceAddress(address: unknown, options?: { leading?: number; trailing?: number; separator?: string }): string;
export declare function identiconSeed(address: unknown): string | null;
export declare function identiconData(address: unknown, options?: { size?: number }): IdenticonData | null;
export declare function identiconSvg(address: unknown, options?: { scale?: number; size?: number; title?: string; round?: boolean }): string;
export declare function signatureSvg(address: unknown, options?: { name?: string; width?: number; theme?: Theme; id?: string }): string;
export declare function identiconSizeFor(size: number | IdenticonSizeName): IdenticonSize & { showBadge: boolean };
export declare function escapeXml(value: unknown): string;
export declare function keccak256(input: Uint8Array | string): string;
