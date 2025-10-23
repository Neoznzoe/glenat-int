import { encryptStructuredPayload, isUrlEncryptionConfigured } from './urlEncryption';

export interface EncryptedJsonBody {
  body: string;
  headers: Record<string, string>;
  encrypted: boolean;
}

export async function prepareJsonBody(payload: unknown): Promise<EncryptedJsonBody> {
  if (!isUrlEncryptionConfigured()) {
    return {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      encrypted: false,
    };
  }

  const ciphertext = await encryptStructuredPayload({ payload, issuedAt: Date.now() });
  return {
    body: JSON.stringify({ ciphertext }),
    headers: {
      'Content-Type': 'application/json',
      'X-Encrypted-Payload': 'aes-256-gcm',
    },
    encrypted: true,
  };
}
