/**
 * Secure local password generator running entirely in the browser using Web Crypto API.
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  const allChars =
    charset.uppercase + charset.lowercase + charset.numbers + charset.symbols;

  if (length < 8) length = 8;
  if (length > 64) length = 64;

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  // Ensure at least one char from each set
  const passwordChars: string[] = [];
  passwordChars.push(
    charset.uppercase[
      array[0] % charset.uppercase.length
    ]
  );
  passwordChars.push(
    charset.lowercase[
      array[1] % charset.lowercase.length
    ]
  );
  passwordChars.push(
    charset.numbers[
      array[2] % charset.numbers.length
    ]
  );
  passwordChars.push(
    charset.symbols[
      array[3] % charset.symbols.length
    ]
  );

  for (let i = 4; i < length; i++) {
    passwordChars.push(allChars[array[i] % allChars.length]);
  }

  // Fisher-Yates shuffle using crypto values
  const shuffleArray = new Uint32Array(length);
  window.crypto.getRandomValues(shuffleArray);

  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = shuffleArray[i] % (i + 1);
    const temp = passwordChars[i];
    passwordChars[i] = passwordChars[j];
    passwordChars[j] = temp;
  }

  return passwordChars.join('');
}
