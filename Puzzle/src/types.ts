export interface InputFieldResult {
  container: HTMLElement;
  input: HTMLInputElement;
  errorMessage: HTMLElement;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export interface UserData {
  firstName: string;
  surname: string;
}
