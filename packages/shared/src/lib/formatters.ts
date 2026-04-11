/**
 * Formats a 10 or 11 digit North American phone number string into a standard (XXX) XXX-XXXX format.
 * Returns the original string if it doesn't match exactly.
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(?:1)?(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
}
