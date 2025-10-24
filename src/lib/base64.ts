const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

function getGlobal(): typeof globalThis {
  if (typeof globalThis === 'undefined') {
    throw new Error('Environnement global indisponible.');
  }
  return globalThis;
}

export function toBase64(bytes: Uint8Array): string {
  const globalScope = getGlobal();
  if (typeof globalScope.btoa === 'function') {
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return globalScope.btoa(binary);
  }

  if ('Buffer' in globalScope) {
    const bufferCtor = (globalScope as typeof globalThis & {
      Buffer: { from(data: Uint8Array): { toString(encoding: string): string } };
    }).Buffer;
    return bufferCtor.from(bytes).toString('base64');
  }

  throw new Error('Aucun encodeur Base64 disponible.');
}

export function fromBase64(value: string): Uint8Array {
  const globalScope = getGlobal();
  if (typeof globalScope.atob === 'function') {
    const binary = globalScope.atob(value);
    const output = new Uint8Array(binary.length) as Uint8Array<ArrayBuffer>;
    for (let index = 0; index < binary.length; index += 1) {
      output[index] = binary.charCodeAt(index);
    }
    return output;
  }

  if ('Buffer' in globalScope) {
    const bufferCtor = (globalScope as typeof globalThis & {
      Buffer: { from(data: string, encoding: string): { values(): IterableIterator<number> } };
    }).Buffer;
    return Uint8Array.from(bufferCtor.from(value, 'base64').values()) as Uint8Array<ArrayBuffer>;
  }

  throw new Error('Aucun décodeur Base64 disponible.');
}

export function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

export function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLength);
  return fromBase64(base64);
}

export function encodeText(value: string): Uint8Array {
  return TEXT_ENCODER.encode(value) as Uint8Array<ArrayBuffer>;
}

export function decodeText(bytes: Uint8Array): string {
  return TEXT_DECODER.decode(bytes);
}

export function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  const { buffer, byteLength, byteOffset } = view;
  if (
    buffer instanceof ArrayBuffer &&
    byteOffset === 0 &&
    byteLength === buffer.byteLength
  ) {
    return buffer;
  }

  const copy = new Uint8Array(byteLength);
  copy.set(view);
  return copy.buffer;
}
