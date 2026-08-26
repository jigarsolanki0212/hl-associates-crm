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
});
