export interface InputFieldResult {
  container: HTMLElement;
  input: HTMLInputElement;
  errorMessage: HTMLElement;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}
