import { encodeText, fromBase64, toArrayBuffer, toBase64 } from './base64';

const PUBLIC_KEY_PEM = import.meta.env.VITE_SECURE_API_PUBLIC_KEY as string | undefined;

let publicKeyPromise: Promise<CryptoKey> | null = null;

function getCrypto(): Crypto {
  if (typeof globalThis === 'undefined' || typeof globalThis.crypto === 'undefined') {
    throw new Error('Web Crypto API indisponible dans cet environnement.');
  }

  return globalThis.crypto;
}

function parsePublicKeyPem(pem: string): ArrayBuffer {
  const normalized = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\r?\n|\s+/g, '');
  return toArrayBuffer(fromBase64(normalized));
}

async function importPublicKey(): Promise<CryptoKey> {
  if (!PUBLIC_KEY_PEM) {
    throw new Error('La clé publique serveur (VITE_SECURE_API_PUBLIC_KEY) est manquante.');
  }

  if (!publicKeyPromise) {
    const crypto = getCrypto();
    const binary = parsePublicKeyPem(PUBLIC_KEY_PEM);
    publicKeyPromise = crypto.subtle.importKey(
      'spki',
      binary,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt'],
    );
  }

  return publicKeyPromise;
}

export interface EncryptedRequestPayload {
  version: number;
  algorithm: 'AES-256-GCM';
  keyAlgorithm: 'RSA-OAEP-256';
  encryptedKey: string;
  iv: string;
  ciphertext: string;
  authTag: string;
  nonce: string;
  timestamp: number;
}

function toUint8Array(buffer: ArrayBuffer): Uint8Array {
  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
}

export async function encryptJsonPayload(payload: unknown): Promise<EncryptedRequestPayload> {
  const crypto = getCrypto();
  const publicKey = await importPublicKey();
  const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const plaintext = encodeText(JSON.stringify(payload));
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    toArrayBuffer(plaintext),
  );

  const ciphertext = toUint8Array(ciphertextBuffer);
  if (ciphertext.byteLength <= 16) {
    throw new Error('Le chiffrement a produit un bloc trop court.');
  }

  const authTag = ciphertext.slice(ciphertext.byteLength - 16);
  const sealedCiphertext = ciphertext.slice(0, ciphertext.byteLength - 16);
  const rawKey = await crypto.subtle.exportKey('raw', aesKey);
  const encryptedKeyBuffer = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawKey);

  return {
    version: 1,
    algorithm: 'AES-256-GCM',
    keyAlgorithm: 'RSA-OAEP-256',
    encryptedKey: toBase64(toUint8Array(encryptedKeyBuffer)),
    iv: toBase64(iv),
    ciphertext: toBase64(sealedCiphertext),
    authTag: toBase64(authTag),
    nonce: toBase64(nonce),
    timestamp: Date.now(),
  };
}

export async function stringifyEncryptedPayload(payload: unknown): Promise<string> {
  const envelope = await encryptJsonPayload(payload);
  return JSON.stringify(envelope);
}
