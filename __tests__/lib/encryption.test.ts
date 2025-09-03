import { EncryptionService } from '@/lib/encryption'

describe('EncryptionService', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_MASTER_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  })

  describe('generateSessionToken', () => {
    it('generates a 64-character hex token', () => {
      const token = EncryptionService.generateSessionToken()
      expect(token).toMatch(/^[0-9a-f]{64}$/)
    })

    it('generates unique tokens', () => {
      const token1 = EncryptionService.generateSessionToken()
      const token2 = EncryptionService.generateSessionToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('encryption/decryption', () => {
    const testText = 'Hello, World!'
    const sessionToken = 'abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef9012'

    it('encrypts and decrypts text correctly', () => {
      const encrypted = EncryptionService.encrypt(testText, sessionToken)
      const decrypted = EncryptionService.decrypt(encrypted, sessionToken)
      
      expect(decrypted).toBe(testText)
    })

    it('produces different encrypted output each time', () => {
      const encrypted1 = EncryptionService.encrypt(testText, sessionToken)
      const encrypted2 = EncryptionService.encrypt(testText, sessionToken)
      
      expect(encrypted1).not.toBe(encrypted2)
    })

    it('encrypted data has correct format (iv:data)', () => {
      const encrypted = EncryptionService.encrypt(testText, sessionToken)
      const parts = encrypted.split(':')
      
      expect(parts).toHaveLength(2)
      expect(parts[0]).toMatch(/^[0-9a-f]{32}$/) // 16-byte IV in hex
      expect(parts[1]).toMatch(/^[0-9a-f]+$/) // Hex encrypted data
    })

    it('throws error when decrypting with wrong session token', () => {
      const encrypted = EncryptionService.encrypt(testText, sessionToken)
      const wrongToken = 'wrong1234token5678here9012abcd3456efgh7890ijkl1234mnop5678qrst9012'
      
      expect(() => {
        EncryptionService.decrypt(encrypted, wrongToken)
      }).toThrow()
    })

    it('throws error with invalid encrypted data format', () => {
      expect(() => {
        EncryptionService.decrypt('invalid-format', sessionToken)
      }).toThrow('Invalid encrypted data format')
    })

    it('handles empty strings', () => {
      const encrypted = EncryptionService.encrypt('', sessionToken)
      const decrypted = EncryptionService.decrypt(encrypted, sessionToken)
      
      expect(decrypted).toBe('')
    })

    it('handles special characters', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`\n\t'
      const encrypted = EncryptionService.encrypt(specialText, sessionToken)
      const decrypted = EncryptionService.decrypt(encrypted, sessionToken)
      
      expect(decrypted).toBe(specialText)
    })
  })

  describe('isEncrypted', () => {
    const sessionToken = 'abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef9012'

    it('returns true for encrypted data', () => {
      const encrypted = EncryptionService.encrypt('test', sessionToken)
      expect(EncryptionService.isEncrypted(encrypted)).toBe(true)
    })

    it('returns false for plain text', () => {
      expect(EncryptionService.isEncrypted('plain text')).toBe(false)
    })

    it('returns false for invalid formats', () => {
      expect(EncryptionService.isEncrypted('onlyonepart')).toBe(false)
      expect(EncryptionService.isEncrypted('short:hex')).toBe(false)
      expect(EncryptionService.isEncrypted('nonhex:characters!')).toBe(false)
    })
  })

  describe('master key validation', () => {
    it('throws error when master key is missing', () => {
      delete process.env.ENCRYPTION_MASTER_KEY
      
      expect(() => {
        EncryptionService.encrypt('test', 'session')
      }).toThrow('ENCRYPTION_MASTER_KEY environment variable is required')
    })

    it('throws error when master key is too short', () => {
      process.env.ENCRYPTION_MASTER_KEY = 'short'
      
      expect(() => {
        EncryptionService.encrypt('test', 'session')
      }).toThrow('ENCRYPTION_MASTER_KEY must be at least 64 characters')
    })
  })
})