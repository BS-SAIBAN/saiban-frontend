/** Strip to digits only, max 15 (CNIC 13 or B‑Form 15). */
export function extractCnicDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 15);
}

/** CNIC: 5-7-1. B‑Form (15 digits): 5-7-3. */
export function formatCnicOrBForm(value: string): string {
  const digits = extractCnicDigits(value);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  if (digits.length <= 13) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 15)}`;
}
