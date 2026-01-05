import { ValidationResult } from '../types';

const NAME_REGEX = /^[A-Za-z-]+$/;
const MIN_FIRST_NAME_LENGTH = 3;
const MIN_SURNAME_LENGTH = 4;

function isValidCharacters(value: string): boolean {
  return NAME_REGEX.test(value);
}

function isValidHyphenPosition(value: string): boolean {
  if (value.length === 0) return true;
  return value[0] !== '-' && value[value.length - 1] !== '-';
}

function isFirstLetterUppercase(value: string): boolean {
  if (value.length === 0) return true;
  const firstChar = value[0];
  if (!firstChar) return false;
  return firstChar >= 'A' && firstChar <= 'Z';
}

function validateFirstName(value: string): ValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { isValid: false, errorMessage: 'First name is required' };
  }

  if (trimmed.length < MIN_FIRST_NAME_LENGTH) {
    return {
      isValid: false,
      errorMessage: `First name must be at least ${MIN_FIRST_NAME_LENGTH} characters`,
    };
  }

  if (!isValidCharacters(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'First name can only contain letters and hyphen',
    };
  }

  if (!isValidHyphenPosition(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Hyphen cannot be first or last character',
    };
  }

  if (!isFirstLetterUppercase(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'First letter must be uppercase',
    };
  }

  return { isValid: true, errorMessage: '' };
}

function validateSurname(value: string): ValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { isValid: false, errorMessage: 'Surname is required' };
  }

  if (trimmed.length < MIN_SURNAME_LENGTH) {
    return {
      isValid: false,
      errorMessage: `Surname must be at least ${MIN_SURNAME_LENGTH} characters`,
    };
  }

  if (!isValidCharacters(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Surname can only contain letters and hyphen',
    };
  }

  if (!isValidHyphenPosition(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Hyphen cannot be first or last character',
    };
  }

  if (!isFirstLetterUppercase(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'First letter must be uppercase',
    };
  }

  return { isValid: true, errorMessage: '' };
}

export function validateNameField(fieldId: string, value: string): ValidationResult {
  if (fieldId === 'firstName') {
    return validateFirstName(value);
  }
  if (fieldId === 'surname') {
    return validateSurname(value);
  }
  return { isValid: false, errorMessage: 'Invalid field' };
}

export function formatNameInput(value: string): string {
  let formatted = value;

  formatted = formatted.replace(/[^A-Za-z-]/g, '');

  if (formatted.length > 0) {
    const firstChar = formatted[0];
    if (firstChar) {
      const upperFirst = firstChar.toUpperCase();
      const rest = formatted.slice(1).toLowerCase();
      formatted = upperFirst + rest;
    }
  }

  return formatted;
}
