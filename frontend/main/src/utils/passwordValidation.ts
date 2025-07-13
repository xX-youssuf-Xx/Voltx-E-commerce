export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let score = 0;

  // Length contribution
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Number contribution
  if (/\d/.test(password)) score += 1;

  if (score <= 1) return 'weak';
  if (score <= 2) return 'medium';
  return 'strong';
}; 