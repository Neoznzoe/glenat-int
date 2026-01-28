import { decodeText, encodeText, fromBase64Url, toArrayBuffer, toBase64Url } from './base64';

const STORAGE_KEY_BASE64 = import.meta.env.VITE_OAUTH_STORAGE_KEY as
  | string
  | undefined;

let storageKeyPromise: Promise<CryptoKey> | null = null;

function getCrypto(): Crypto {
  if (typeof globalThis === 'undefined' || typeof globalThis.crypto === 'undefined') {
    throw new Error('Web Crypto API indisponible dans cet environnement.');
  }

  return globalThis.crypto;
}

async function importStorageKey(): Promise<CryptoKey> {
  if (!STORAGE_KEY_BASE64) {
    throw new Error('La clé de chiffrement du stockage (VITE_OAUTH_STORAGE_KEY) est manquante.');
  }

  if (!storageKeyPromise) {
    const rawKey = fromBase64Url(STORAGE_KEY_BASE64);
    if (rawKey.byteLength !== 32) {
      throw new Error('La clé de stockage doit être un bloc AES de 32 octets.');
    }

    const crypto = getCrypto();
    storageKeyPromise = crypto.subtle.importKey('raw', toArrayBuffer(rawKey), 'AES-GCM', false, [
      'encrypt',
      'decrypt',
    ]);
  }

  return storageKeyPromise;
}

export async function encryptForStorage(payload: unknown): Promise<string> {
  const crypto = getCrypto();
  const key = await importStorageKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encodeText(JSON.stringify(payload));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    toArrayBuffer(plaintext),
  );
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);

  return toBase64Url(combined);
}

export async function decryptFromStorage(token: string): Promise<unknown> {
  const crypto = getCrypto();
  const key = await importStorageKey();
  const combined = fromBase64Url(token);

  if (combined.byteLength <= 12) {
    throw new Error('Bloc de stockage chiffré invalide.');
  }

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    toArrayBuffer(ciphertext),
  );
  const decoded = decodeText(new Uint8Array(plaintext));

  return JSON.parse(decoded) as unknown;
}
