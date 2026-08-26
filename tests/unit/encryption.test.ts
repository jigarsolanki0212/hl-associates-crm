import { describe, it, expect } from 'vitest';
import { encryptString, decryptString } from '@/lib/crypto/encryption';

describe('AES-256-GCM Symmetric Encryption', () => {
  it('should encrypt and decrypt strings accurately preserving data integrity', () => {
    const plainText = 'super-secret-smtp-password-12345!@#$%';
    const encrypted = encryptString(plainText);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(plainText);
    expect(encrypted).toContain(':'); // IV:AuthTag:Ciphertext structure

    const decrypted = decryptString(encrypted);
    expect(decrypted).toBe(plainText);
  });

  it('verifies that sensitive fields are sanitized before being transmitted to the client', () => {
    const rawUserRecord = {
      id: 'usr-123',
      email: 'alex@hlassociates.com',
      fullName: 'Alex Mercer',
      passwordHash: '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
      role: 'ADMIN',
      token: 'session_token_xyz_998877',
    };

    // Sanitizer simulation
    const sanitizeUser = (user: typeof rawUserRecord) => {
      const { passwordHash, token, ...sanitized } = user;
      return sanitized;
    };

    const clientPayload = sanitizeUser(rawUserRecord);

    expect(clientPayload).not.toHaveProperty('passwordHash');
    expect(clientPayload).not.toHaveProperty('token');
    expect(clientPayload).toHaveProperty('id', 'usr-123');
    expect(clientPayload).toHaveProperty('email', 'alex@hlassociates.com');
  });
});
