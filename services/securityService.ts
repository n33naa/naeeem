
import CryptoJS from 'crypto-js';

/**
 * Security Service for Elite English AI
 * Handles data encryption and hashing for user privacy.
 */

export const SecurityService = {
  /**
   * Generates a SHA-256 hash of a string (e.g., user key).
   * Used for indexing data without storing the raw key.
   */
  hashKey: (key: string): string => {
    return CryptoJS.SHA256(key).toString();
  },

  /**
   * Encrypts data using AES with the user's key as the secret.
   */
  encryptData: (data: any, secret: string): string => {
    try {
      const jsonStr = JSON.stringify(data);
      return CryptoJS.AES.encrypt(jsonStr, secret).toString();
    } catch (e) {
      console.error("Encryption failed", e);
      return "";
    }
  },

  /**
   * Decrypts AES encrypted data using the user's key.
   */
  decryptData: (encryptedStr: string, secret: string): any | null => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedStr, secret);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedStr) return null;
      return JSON.parse(decryptedStr);
    } catch (e) {
      console.error("Decryption failed", e);
      return null;
    }
  }
};
