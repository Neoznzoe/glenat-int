import { decodeText, encodeText, fromBase64Url, toArrayBuffer, toBase64Url } from './base64';

const BASE64_KEY = import.meta.env.VITE_AES_GCM_KEY as string | undefined;

let keyPromise: Promise<CryptoKey> | undefined;

function getCrypto(): Crypto {
  if (typeof globalThis === 'undefined' || typeof globalThis.crypto === 'undefined') {
    throw new Error('Web Crypto API indisponible dans cet environnement.');
  }
  return globalThis.crypto;
}

async function importKey(): Promise<CryptoKey> {
  if (!BASE64_KEY) {
    throw new Error('La clé AES (VITE_AES_GCM_KEY) est manquante.');
  }

  if (!keyPromise) {
    const crypto = getCrypto();
    const keyBytes = fromBase64Url(BASE64_KEY) as Uint8Array<ArrayBuffer>;

    if (keyBytes.byteLength !== 32) {
      throw new Error('La clé AES doit faire 32 octets (256 bits) une fois décodée.');
    }

    keyPromise = crypto.subtle.importKey('raw', toArrayBuffer(keyBytes), 'AES-GCM', false, [
      'encrypt',
      'decrypt',
    ]);
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

  const plaintext = encodeText(JSON.stringify(data));
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

export async function decryptUrlToken(token: string): Promise<EncryptedUrlPayload> {
  const crypto = getCrypto();
  const key = await importKey();
  const combined = fromBase64Url(token);

  if (combined.byteLength <= 12) {
    throw new Error('Jeton chiffré invalide.');
  }

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    toArrayBuffer(ciphertext),
  );

  const json = decodeText(new Uint8Array(plaintext));
  const payload = JSON.parse(json) as EncryptedUrlPayload;

  if (!payload?.path) {
    throw new Error('Le jeton chiffré ne contient pas de chemin.');
  }

  return payload;
}

export function isUrlEncryptionConfigured(): boolean {
  return typeof BASE64_KEY === 'string' && BASE64_KEY.length > 0;
}
