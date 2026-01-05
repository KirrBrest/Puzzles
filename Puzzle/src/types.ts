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

export interface ConfirmModalResult {
  container: HTMLElement;
  show: () => Promise<boolean>;
}

export interface AlertModalResult {
  container: HTMLElement;
  show: () => Promise<void>;
}
