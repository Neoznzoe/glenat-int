import { encodeText, fromBase64, toArrayBuffer, toBase64 } from './base64';

export const SECURE_PAYLOAD_ENVELOPE_KEY = 'data';
export const SECURE_PAYLOAD_ENCRYPTION_HEADER = 'X-Content-Encryption';
export const SECURE_PAYLOAD_ENCRYPTION_SCHEME = 'hybrid-aes256gcm+rsa';

type SecurePayloadMode = 'disabled' | 'optional' | 'required';

const PUBLIC_KEY_PEM = import.meta.env.VITE_SECURE_API_PUBLIC_KEY as string | undefined;
const RAW_MODE = (import.meta.env.VITE_SECURE_API_MODE as string | undefined)?.toLowerCase();
const DEFAULT_MODE: SecurePayloadMode = PUBLIC_KEY_PEM ? 'optional' : 'disabled';
const SECURE_PAYLOAD_MODE: SecurePayloadMode =
  RAW_MODE === 'required' || RAW_MODE === 'mandatory'
    ? 'required'
    : RAW_MODE === 'optional' || RAW_MODE === 'hybrid'
      ? 'optional'
      : DEFAULT_MODE;

const SHOULD_ANNOUNCE_ENCRYPTION =
  (import.meta.env.VITE_SECURE_API_SEND_ENCRYPTION_HEADER as string | undefined)?.toLowerCase() ===
  'true';

let runtimeDisabled = SECURE_PAYLOAD_MODE === 'disabled';
let publicKeyPromise: Promise<CryptoKey> | null = null;
let loggedDisabledWarning = false;

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

export interface PreparedSecureJsonPayload {
  body: string;
  encrypted: boolean;
}

export function applySecurePayloadHeaders(headers: Headers, encrypted: boolean): void {
  headers.delete(SECURE_PAYLOAD_ENCRYPTION_HEADER);

  if (!encrypted || !SHOULD_ANNOUNCE_ENCRYPTION) {
    return;
  }

  headers.set(SECURE_PAYLOAD_ENCRYPTION_HEADER, SECURE_PAYLOAD_ENCRYPTION_SCHEME);
}

function isEncryptionEnabled(): boolean {
  return !runtimeDisabled && Boolean(PUBLIC_KEY_PEM);
}

function ensureFallbackLogged(): void {
  if (!loggedDisabledWarning && SECURE_PAYLOAD_MODE !== 'disabled') {
    loggedDisabledWarning = true;
    console.warn(
      "[securePayload] Le chiffrement des corps JSON est désactivé : mode optionnel ou clé publique manquante.",
    );
  }
}

export function isSecurePayloadRequired(): boolean {
  return SECURE_PAYLOAD_MODE === 'required';
}

export function disableSecurePayload(reason?: unknown): void {
  if (runtimeDisabled) {
    return;
  }

  runtimeDisabled = true;

  if (SECURE_PAYLOAD_MODE === 'required') {
    const detail = reason instanceof Error ? reason.message : undefined;
    throw new Error(
      detail
        ? `Le chiffrement des requêtes est requis mais a échoué : ${detail}`
        : 'Le chiffrement des requêtes est requis mais a été désactivé.',
    );
  }

  if (reason) {
    console.warn('[securePayload] Chiffrement des corps JSON désactivé.', reason);
  }
}

function toUint8Array(buffer: ArrayBuffer): Uint8Array {
  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
}

async function encryptJsonPayload(payload: unknown): Promise<EncryptedRequestPayload> {
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
  const rawKey = await crypto.subtle.exportKey('raw', aesKey);
  const encryptedKeyBuffer = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawKey);

  return {
    version: 1,
    algorithm: 'AES-256-GCM',
    keyAlgorithm: 'RSA-OAEP-256',
    encryptedKey: toBase64(toUint8Array(encryptedKeyBuffer)),
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
    authTag: toBase64(authTag),
    nonce: toBase64(nonce),
    timestamp: Date.now(),
  };
}

export async function prepareSecureJsonPayload(
  payload: unknown,
): Promise<PreparedSecureJsonPayload> {
  if (!isEncryptionEnabled()) {
    if (SECURE_PAYLOAD_MODE === 'required') {
      throw new Error(
        'Le chiffrement des requêtes est requis mais aucune clé publique valide est disponible.',
      );
    }

    ensureFallbackLogged();
    return {
      body: JSON.stringify({ encrypt: false, [SECURE_PAYLOAD_ENVELOPE_KEY]: payload }),
      encrypted: false,
    };
  }

  try {
    const envelope = await encryptJsonPayload(payload);
    return {
      body: JSON.stringify({ encrypt: true, [SECURE_PAYLOAD_ENVELOPE_KEY]: envelope }),
      encrypted: true,
    };
  } catch (error) {
    disableSecurePayload(error instanceof Error ? error : undefined);
    ensureFallbackLogged();
    return {
      body: JSON.stringify({ encrypt: false, [SECURE_PAYLOAD_ENVELOPE_KEY]: payload }),
      encrypted: false,
    };
  }
}
