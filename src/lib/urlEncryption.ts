const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

const BASE64_KEY = import.meta.env.VITE_AES_GCM_KEY as string | undefined;

let keyPromise: Promise<CryptoKey> | undefined;

function getCrypto(): Crypto {
  if (typeof globalThis === 'undefined' || typeof globalThis.crypto === 'undefined') {
    throw new Error('Web Crypto API indisponible dans cet environnement.');
  }
  return globalThis.crypto;
}

function base64Encode(bytes: Uint8Array): string {
  if (typeof globalThis.btoa === 'function') {
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return globalThis.btoa(binary);
  }

  if ('Buffer' in globalThis) {
    const bufferCtor = (globalThis as typeof globalThis & { Buffer: { from(data: Uint8Array): { toString(encoding: string): string } } }).Buffer;
    return bufferCtor.from(bytes).toString('base64');
  }

  throw new Error('Aucun moteur Base64 disponible.');
}

function base64Decode(input: string): Uint8Array {
  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(input);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  if ('Buffer' in globalThis) {
    const bufferCtor = (globalThis as typeof globalThis & { Buffer: { from(data: string, encoding: string): { values(): IterableIterator<number> } } }).Buffer;
    return Uint8Array.from(bufferCtor.from(input, 'base64').values());
  }

  throw new Error('Aucun moteur Base64 disponible.');
}

function base64UrlEncode(bytes: Uint8Array): string {
  return base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

function base64UrlDecode(token: string): Uint8Array {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLength);
  return base64Decode(base64);
}

async function importKey(): Promise<CryptoKey> {
  if (!BASE64_KEY) {
    throw new Error('La clé AES (VITE_AES_GCM_KEY) est manquante.');
  }

  if (!keyPromise) {
    const crypto = getCrypto();
    const keyBytes = base64UrlDecode(BASE64_KEY) as Uint8Array<ArrayBuffer>;

    if (keyBytes.byteLength !== 32) {
      throw new Error('La clé AES doit faire 32 octets (256 bits) une fois décodée.');
    }

    keyPromise = crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }

  return keyPromise;
}

export interface EncryptedUrlPayload {
  path: string;
  search?: string;
  method: string;
  issuedAt: number;
}

export async function encryptUrlPayload(payload: {
  path: string;
  search?: string;
  method: string;
}): Promise<string> {
  const crypto = getCrypto();
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const data: EncryptedUrlPayload = {
    ...payload,
    search: payload.search && payload.search.length > 0 ? payload.search : undefined,
    method: payload.method.toUpperCase(),
    issuedAt: Date.now(),
  };

  const plaintext = TEXT_ENCODER.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);

  return base64UrlEncode(combined);
}

export async function decryptUrlToken(token: string): Promise<EncryptedUrlPayload> {
  const crypto = getCrypto();
  const key = await importKey();
  const combined = base64UrlDecode(token);

  if (combined.byteLength <= 12) {
    throw new Error('Jeton chiffré invalide.');
  }

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

  const json = TEXT_DECODER.decode(plaintext);
  const payload = JSON.parse(json) as EncryptedUrlPayload;

  if (!payload?.path) {
    throw new Error('Le jeton chiffré ne contient pas de chemin.');
  }

  return payload;
}

export function isUrlEncryptionConfigured(): boolean {
  return typeof BASE64_KEY === 'string' && BASE64_KEY.length > 0;
}
