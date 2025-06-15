// CPF Generator - Creates valid CPF numbers for testing purposes
export function generateValidCPF(): string {
  // Generate first 9 digits
  const firstNineDigits: number[] = [];
  for (let i = 0; i < 9; i++) {
    firstNineDigits.push(Math.floor(Math.random() * 10));
  }

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += firstNineDigits[i] * (10 - i);
  }
  let firstVerificationDigit = 11 - (sum % 11);
  if (firstVerificationDigit >= 10) {
    firstVerificationDigit = 0;
  }

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += firstNineDigits[i] * (11 - i);
  }
  sum += firstVerificationDigit * 2;
  let secondVerificationDigit = 11 - (sum % 11);
  if (secondVerificationDigit >= 10) {
    secondVerificationDigit = 0;
  }

  // Combine all digits
  const cpf = [
    ...firstNineDigits,
    firstVerificationDigit,
    secondVerificationDigit
  ].join('');

  return cpf;
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function validateCPF(cpf: string): boolean {
  // Remove formatting
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate verification digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  
  if (parseInt(cleanCPF[9]) !== firstDigit) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  
  return parseInt(cleanCPF[10]) === secondDigit;
}