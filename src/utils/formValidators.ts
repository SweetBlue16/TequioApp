/**
 * Result structure returned by every validation rule.
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}

/**
 * Universal validator function contract.
 */
export type ValidatorFunction<ValueType = string> = (value: ValueType) => ValidationResult;

/**
 * Helper to build an approved validation result.
 */
const createSuccessResult = (): ValidationResult => ({
  isValid: true,
  errorMessage: null,
});

/**
 * Helper to build a rejected validation result.
 */
const createFailureResult = (errorMessage: string): ValidationResult => ({
  isValid: false,
  errorMessage,
});

// ============================================================================
// ATOMIC VALIDATORS (Cyclomatic Complexity <= 3)
// ============================================================================

/**
 * Validates that an input string is not empty or composed solely of whitespace.
 */
export const validateRequiredField = (fieldDisplayName: string): ValidatorFunction => {
  return (value: string): ValidationResult => {
    return value.trim().length > 0
      ? createSuccessResult()
      : createFailureResult(`Ingresa tu ${fieldDisplayName.toLowerCase()}.`);
  };
};

/**
 * Validates that an input contains only alphabetical characters, Spanish accents, and spaces.
 */
export const validateAlphabeticTextOnly = (fieldDisplayName: string): ValidatorFunction => {
  return (value: string): ValidationResult => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return createSuccessResult();
    }

    const alphabeticRegularExpression = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return alphabeticRegularExpression.test(trimmedValue)
      ? createSuccessResult()
      : createFailureResult(`El ${fieldDisplayName.toLowerCase()} solo debe contener letras.`);
  };
};

/**
 * Validates standard email address format according to RFC 5322.
 */
export const validateEmailAddress: ValidatorFunction = (emailAddress: string): ValidationResult => {
  const trimmedEmail = emailAddress.trim();
  if (!trimmedEmail) {
    return createFailureResult('Ingresa tu correo electrónico.');
  }

  const emailRegularExpression = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegularExpression.test(trimmedEmail)
    ? createSuccessResult()
    : createFailureResult('Ingresa un correo electrónico con formato válido.');
};

/**
 * Validates that a mobile telephone string contains exactly 10 numeric digits.
 */
export const validateTelephoneNumber: ValidatorFunction = (telephoneNumber: string): ValidationResult => {
  const numericDigitsOnly = telephoneNumber.replace(/\D/g, '');
  if (!numericDigitsOnly) {
    return createFailureResult('Ingresa tu número de teléfono.');
  }

  return numericDigitsOnly.length === 10
    ? createSuccessResult()
    : createFailureResult('El teléfono debe contener exactamente 10 dígitos.');
};

/**
 * Validate that a string does not exceed a specified maximum length.
 */
export const validateMaximumLength = (
  fieldDisplayName: string,
  maxLength: number
): ValidatorFunction => {
  return (value: string): ValidationResult => {
    return value.trim().length <= maxLength
      ? createSuccessResult()
      : createFailureResult(`El ${fieldDisplayName.toLowerCase()} no puede exceder los ${maxLength} caracteres.`);
  };
};

/**
 * Calculates full chronological age based on a birth date string (YYYY-MM-DD).
 */
export const calculateAgeFromBirthDate = (birthDateString: string): number => {
  const birthDate = new Date(birthDateString);
  const currentDate = new Date();

  let calculatedAge = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDifference = currentDate.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
    calculatedAge -= 1;
  }
  return isNaN(calculatedAge) ? 0 : calculatedAge;
};

/**
 * Validates that the provided birth date corresponds to a legal adult (at least 18 years old)
 * and does not exceed a reasonable human lifespan (maximum 100 years).
 */
export const validateLegalAdultAge: ValidatorFunction = (birthDateString: string): ValidationResult => {
  if (!birthDateString) {
    return createFailureResult('Selecciona tu fecha de nacimiento.');
  }

  const birthDate = new Date(birthDateString);
  const currentYear = new Date().getFullYear();
  const birthYear = birthDate.getFullYear();

  // Valida que el año no sea ilógico (ej. 1800 o menor a 100 años atrás)
  if (birthYear < currentYear - 100) {
    return createFailureResult('Ingresa una fecha de nacimiento válida (máximo 100 años).');
  }

  const calculatedAge = calculateAgeFromBirthDate(birthDateString);

  if (calculatedAge < 18) {
    return createFailureResult('Debes tener al menos 18 años para comerciar en la plataforma.');
  }

  return createSuccessResult();
};

// ============================================================================
// PASSWORD CRITERIA EVALUATION
// ============================================================================

export interface PasswordRequirementsStatus {
  hasMinimumLength: boolean;
  hasUppercaseLetter: boolean;
  hasNumericDigit: boolean;
  hasSpecialCharacter: boolean;
  isFullyValid: boolean;
}

/**
 * Pure function providing real-time boolean states for password checklist feedback.
 */
export const evaluatePasswordComplexity = (password: string): PasswordRequirementsStatus => {
  const hasMinimumLength = password.length >= 8;
  const hasUppercaseLetter = /[A-Z]/.test(password);
  const hasNumericDigit = /\d/.test(password);
  const hasSpecialCharacter = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  return {
    hasMinimumLength,
    hasUppercaseLetter,
    hasNumericDigit,
    hasSpecialCharacter,
    isFullyValid: hasMinimumLength && hasUppercaseLetter && hasNumericDigit && hasSpecialCharacter,
  };
};

/**
 * Validates exact string match between password and password confirmation fields.
 */
export const validatePasswordConfirmationMatch = (
  originalPassword: string,
  confirmationPassword: string
): ValidationResult => {
  if (!confirmationPassword) {
    return createFailureResult('Confirma tu contraseña.');
  }
  return originalPassword === confirmationPassword
    ? createSuccessResult()
    : createFailureResult('Las contraseñas no coinciden.');
};

// ============================================================================
// FIELD RUNNER EXECUTOR
// ============================================================================

/**
 * Executes a sequence of validator functions on a target value and returns the first error message.
 */
export const executeFieldValidation = (
  value: string,
  validatorSequence: ValidatorFunction[]
): string | null => {
  for (const validateRule of validatorSequence) {
    const result = validateRule(value);
    if (!result.isValid) {
      return result.errorMessage;
    }
  }
  return null;
};