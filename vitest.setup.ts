/**
 * Vitest global setup — polyfills and environment normalization.
 */
import { webcrypto } from "node:crypto";

// Polyfill crypto.randomUUID() for happy-dom and environments where
// the Web Crypto API is not available.
if (typeof globalThis.crypto === "undefined") {
  // @ts-expect-error — webcrypto is compatible enough for randomUUID
  globalThis.crypto = webcrypto;
} else if (typeof globalThis.crypto.randomUUID !== "function") {
  globalThis.crypto.randomUUID = webcrypto.randomUUID.bind(webcrypto);
}
