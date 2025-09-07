import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import NodeRSA from 'node-rsa';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keysDir = path.join(__dirname, '..', 'keys');
const privateKeyPath = path.join(keysDir, 'private.pem');
const publicKeyPath = path.join(keysDir, 'public.pem');

export async function ensureRsaKeysExist() {
  if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });

  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    const key = new NodeRSA({ b: 2048 });
    key.setOptions({ encryptionScheme: 'pkcs1_oaep' });
    const privatePem = key.exportKey('private');
    const publicPem = key.exportKey('public');
    fs.writeFileSync(privateKeyPath, privatePem);
    fs.writeFileSync(publicKeyPath, publicPem);
  }
}

function getPublicKey() {
  const pub = fs.readFileSync(publicKeyPath, 'utf8');
  const key = new NodeRSA(pub);
  key.setOptions({ encryptionScheme: 'pkcs1_oaep' });
  return key;
}

function getPrivateKey() {
  const priv = fs.readFileSync(privateKeyPath, 'utf8');
  const key = new NodeRSA(priv);
  key.setOptions({ encryptionScheme: 'pkcs1_oaep' });
  return key;
}

export function encryptBufferWithHybridScheme(plainBuffer) {
  const aesKey = crypto.randomBytes(32); // AES-256
  const iv = crypto.randomBytes(12); // GCM recommended 12 bytes
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload = Buffer.concat([aesKey, iv]);
  const encryptedKey = getPublicKey().encrypt(payload);

  return {
    ciphertext,
    authTag, // Buffer
    encryptedKey, // Buffer
    algorithm: 'aes-256-gcm',
  };
}

export function decryptBufferWithHybridScheme(ciphertextBuffer, authTagBuffer, encryptedKeyBuffer) {
  const payload = getPrivateKey().decrypt(encryptedKeyBuffer);
  const aesKey = payload.subarray(0, 32);
  const iv = payload.subarray(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
  decipher.setAuthTag(authTagBuffer);
  const plain = Buffer.concat([decipher.update(ciphertextBuffer), decipher.final()]);
  return plain;
}

