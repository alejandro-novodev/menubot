// AES-256-GCM encryption for secrets at rest (customer Anthropic API keys).
// Key comes from APP_ENCRYPTION_KEY: 64 hex chars (32 bytes), e.g. `openssl rand -hex 32`.
// Blob format: 'v1:<ivB64>:<tagB64>:<ctB64>' — the v1 prefix leaves room for key rotation.

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function getKey(): Buffer {
  const hex = process.env.APP_ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('APP_ENCRYPTION_KEY must be set to 64 hex characters (openssl rand -hex 32)');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`;
}

export function decryptSecret(blob: string): string {
  const [version, ivB64, tagB64, ctB64] = blob.split(':');
  if (version !== 'v1' || !ivB64 || !tagB64 || !ctB64) {
    throw new Error('Unrecognized encrypted blob format');
  }
  const key = getKey();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]).toString('utf8');
}
