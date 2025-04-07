import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique reference number for transactions.
 * Format: TX-YYYYMMDDHHMMSS-UUID
 * @returns {string} A unique reference number
 */
export function generateReferenceNumber(): string {
  const currentTime = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const uniqueId = uuidv4().split('-')[0];
  return `FXFG-${currentTime}-${uniqueId}`;
}
