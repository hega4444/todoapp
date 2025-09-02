import crypto from 'crypto';

/**
 * Encryption service using hybrid key derivation
 * Combines app master key + user session token for enhanced security
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly PBKDF2_ITERATIONS = 100000;
  private static readonly SALT = 'todoapp-salt';

  /**
   * Generate a cryptographically secure 256-bit session token
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get and validate the master encryption key from environment
   */
  private static getMasterKey(): string {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKey) {
      throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
    }
    if (masterKey.length < 64) {
      throw new Error('ENCRYPTION_MASTER_KEY must be at least 64 characters (256 bits)');
    }
    return masterKey;
  }

  /**
   * Derive encryption key using PBKDF2 with master key + session token
   */
  private static deriveEncryptionKey(sessionToken: string): Buffer {
    const masterKey = this.getMasterKey();
    return crypto.pbkdf2Sync(
      masterKey + sessionToken, 
      this.SALT, 
      this.PBKDF2_ITERATIONS, 
      32, 
      'sha256'
    );
  }

  /**
   * Encrypt text using AES-256-CBC with random IV
   * Returns format: iv:encrypted_data
   */
  static encrypt(text: string, sessionToken: string): string {
    const key = this.deriveEncryptionKey(sessionToken);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt text using derived key and extracted IV
   */
  static decrypt(encryptedData: string, sessionToken: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = this.deriveEncryptionKey(sessionToken);
    
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Check if text is in encrypted format (iv:encrypted_data)
   */
  static isEncrypted(text: string): boolean {
    const parts = text.split(':');
    return parts.length === 2 && 
           parts.every(part => /^[0-9a-fA-F]+$/.test(part)) &&
           parts[0].length === 32; // IV should be 16 bytes = 32 hex chars
  }
}