/**
 * Normalizes user input into a strict E.164 phone number format required by Firebase Telecom SMS.
 * Accurately preserves 10-digit Indian numbers that start with '91' (e.g. Jio/Airtel 91XXXXXXXX series)
 * while still handling full pasted international formats, leading trunk zeros, and duplicate prefixes.
 */
export function normalizeE164PhoneNumber(selectedCountryCode: string, inputRaw: string): string {
  const cleaned = inputRaw.trim().replace(/[\s\-().]/g, '');
  if (!cleaned) return '';

  // 1. If user typed or pasted an international number starting with '+'
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // 2. If user started with international exit prefix '00'
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.slice(2);
  }

  const normCountry = selectedCountryCode.startsWith('+') ? selectedCountryCode : `+${selectedCountryCode}`;
  const countryDigits = normCountry.slice(1); // e.g. "91"

  let digitsOnly = cleaned;
  // 3. Strip leading trunk '0' (e.g. 09123456789 -> 9123456789)
  if (digitsOnly.startsWith('0')) {
    digitsOnly = digitsOnly.slice(1);
  }

  // 4. Special rule for India (+91):
  // Indian mobile subscriber numbers are EXACTLY 10 digits.
  // Many Indian mobile numbers naturally begin with "91" (e.g. 91XXXXXXXX).
  // A 10-digit number is ALWAYS the subscriber number, even if it starts with "91"!
  if (countryDigits === '91') {
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
    // If user explicitly typed 12 digits starting with "91" (country code + 10 digits)
    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      return `+${digitsOnly}`;
    }
  }

  // General rule for other countries:
  if (digitsOnly.startsWith(countryDigits) && digitsOnly.length > 10) {
    return `+${digitsOnly}`;
  }

  return `${normCountry}${digitsOnly}`;
}
