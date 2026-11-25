/**
 * Passcode lock for data saved on the device: AES-GCM (256-bit), with the key
 * derived from the passcode by PBKDF2-SHA-256 and a random salt. Uses the
 * browser's Web Crypto. Nothing leaves the device.
 */

export type Sealed = { v: 1; kdf: "PBKDF2-SHA256"; iterations: number; salt: string; iv: string; data: string };

export const ITERATIONS = 310_000;

export class WrongPasscodeError extends Error {
  constructor() {
    super("That passcode doesn’t match.");
  }
}

const b64 = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
};
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function deriveKey(passcode: string, salt: Uint8Array, iterations = ITERATIONS): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passcode), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

/** A key plus its salt, kept in memory while unlocked so saves don't re-derive. */
export type VaultKey = { key: CryptoKey; salt: Uint8Array; iterations: number };

export async function newVaultKey(passcode: string, iterations = ITERATIONS): Promise<VaultKey> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { key: await deriveKey(passcode, salt, iterations), salt, iterations };
}

export async function seal(value: unknown, vk: VaultKey): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, vk.key, new TextEncoder().encode(JSON.stringify(value)));
  return { v: 1, kdf: "PBKDF2-SHA256", iterations: vk.iterations, salt: b64(vk.salt), iv: b64(iv), data: b64(new Uint8Array(data)) };
}

/** Open sealed data. Throws WrongPasscodeError if the passcode is wrong. */
export async function unseal<T>(sealed: Sealed, passcode: string): Promise<{ value: T; key: VaultKey }> {
  const salt = unb64(sealed.salt);
  const key = await deriveKey(passcode, salt, sealed.iterations);
  try {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(sealed.iv) as BufferSource }, key, unb64(sealed.data) as BufferSource);
    return { value: JSON.parse(new TextDecoder().decode(plain)) as T, key: { key, salt, iterations: sealed.iterations } };
  } catch {
    throw new WrongPasscodeError();
  }
}

export const isSealed = (x: unknown): x is Sealed =>
  !!x && typeof x === "object" && (x as Sealed).v === 1 && typeof (x as Sealed).data === "string" && typeof (x as Sealed).salt === "string" && typeof (x as Sealed).iv === "string";
