/**
 * Keccak-256 (the original Keccak padding used by Ethereum, not SHA3-256).
 * Dependency-free BigInt implementation; fast enough for addresses and short strings.
 */

const ROUND_CONSTANTS = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

// Rotation offsets r[x][y]
const ROTATION = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14],
];

const MASK64 = (1n << 64n) - 1n;
const rotl = (v, n) => n === 0 ? v : (((v << BigInt(n)) | (v >> BigInt(64 - n))) & MASK64);

function keccakF(state) {
  const C = new Array(5);
  const D = new Array(5);
  const B = new Array(25);
  for (let round = 0; round < 24; round++) {
    for (let x = 0; x < 5; x++) {
      C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
    }
    for (let x = 0; x < 5; x++) {
      D[x] = C[(x + 4) % 5] ^ rotl(C[(x + 1) % 5], 1);
    }
    for (let i = 0; i < 25; i++) state[i] ^= D[i % 5];
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        B[y + 5 * ((2 * x + 3 * y) % 5)] = rotl(state[x + 5 * y], ROTATION[x][y]);
      }
    }
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        state[x + 5 * y] = B[x + 5 * y] ^ ((~B[((x + 1) % 5) + 5 * y] & MASK64) & B[((x + 2) % 5) + 5 * y]);
      }
    }
    state[0] ^= ROUND_CONSTANTS[round];
  }
}

/**
 * The 256-bit sponge shared by Keccak-256 and SHA3-256; only the padding domain byte differs.
 * @param {Uint8Array|string} input
 * @param {number} domain 0x01 for the original Keccak padding (Ethereum), 0x06 for FIPS 202 SHA3
 */
function sponge256(input, domain) {
  if (typeof input !== "string" && !(input instanceof Uint8Array)) throw new TypeError("keccak input must be a string or Uint8Array");
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const rate = 136; // (1600 - 2*256) / 8
  const padded = new Uint8Array(Math.ceil((bytes.length + 1) / rate) * rate);
  padded.set(bytes);
  padded[bytes.length] ^= domain; // pad10*1 with the domain byte
  padded[padded.length - 1] ^= 0x80;
  const state = new Array(25).fill(0n);
  for (let offset = 0; offset < padded.length; offset += rate) {
    for (let i = 0; i < rate / 8; i++) {
      let lane = 0n;
      for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(padded[offset + i * 8 + b]);
      state[i] ^= lane;
    }
    keccakF(state);
  }
  let hex = "";
  for (let i = 0; i < 4; i++) {
    let lane = state[i];
    for (let b = 0; b < 8; b++) {
      hex += Number(lane & 0xffn).toString(16).padStart(2, "0");
      lane >>= 8n;
    }
  }
  return hex;
}

/**
 * Keccak-256 of a byte array or UTF-8 string. Returns lowercase hex without 0x.
 * @param {Uint8Array|string} input
 */
export const keccak256 = (input) => sponge256(input, 0x01);

/**
 * SHA3-256 (FIPS 202 padding) over the same sponge. Not part of the package API; exported so the
 * tests can verify the multi-block absorb against node:crypto, which ships SHA3 but not Keccak.
 * @param {Uint8Array|string} input
 */
export const sha3_256 = (input) => sponge256(input, 0x06);
