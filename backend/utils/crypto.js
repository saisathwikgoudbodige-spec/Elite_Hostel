const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Use a secure key from environment variables or fallback to a default 32-byte key for local development
const ENCRYPTION_KEY = process.env.AADHAAR_ENCRYPTION_KEY 
  ? crypto.scryptSync(process.env.AADHAAR_ENCRYPTION_KEY, 'salt', 32)
  : Buffer.from('foobar_secret_key_32_bytes_long_!!', 'utf8');

const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a plain text string
 * @param {string} text 
 * @returns {string} iv:encryptedhex
 */
function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts an encrypted string
 * @param {string} text 
 * @returns {string} decrypted plain text
 */
function decrypt(text) {
  if (!text) return '';
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    return '';
  }
}

/**
 * Masks an Aadhaar number to display only the last 4 digits (e.g. XXXX-XXXX-1234)
 * @param {string} plainAadhaar 
 * @returns {string} masked Aadhaar
 */
function maskAadhaar(plainAadhaar) {
  if (!plainAadhaar || plainAadhaar.length < 4) return 'XXXX-XXXX-XXXX';
  const last4 = plainAadhaar.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

module.exports = {
  encrypt,
  decrypt,
  maskAadhaar
};
