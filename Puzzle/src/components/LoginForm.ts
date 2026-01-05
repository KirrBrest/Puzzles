import createInputField from './InputField';
import createLoginButton from './LoginButton';
import { validateNameField, formatNameInput } from '../utils/validation';
import { saveUserData, getUserData } from '../utils/storage';

function updateFieldError(
  errorElement: HTMLElement,
  input: HTMLInputElement,
  errorMessage: string
): void {
  if (errorMessage) {
    errorElement.textContent = errorMessage;
    errorElement.classList.add('input-error-visible');
    input.classList.add('input-error-state');
  } else {
    errorElement.textContent = '';
    errorElement.classList.remove('input-error-visible');
    input.classList.remove('input-error-state');
  }
}

export default function createLoginForm(): HTMLElement {
  const form = document.createElement('form');
  form.className = 'login-form';
  form.setAttribute('novalidate', '');

  const firstNameField = createInputField('firstName', 'First Name', true);
  const surnameField = createInputField('surname', 'Surname', true);
  const loginButton = createLoginButton();

  loginButton.disabled = true;

  let firstNameValid = false;
  let surnameValid = false;

  const validateForm = (): void => {
    const firstNameValue = firstNameField.input.value;
    const surnameValue = surnameField.input.value;

    const firstNameValidation = validateNameField('firstName', firstNameValue);
    const surnameValidation = validateNameField('surname', surnameValue);

    firstNameValid = firstNameValidation.isValid;
    surnameValid = surnameValidation.isValid;

    updateFieldError(
      firstNameField.errorMessage,
      firstNameField.input,
      firstNameValidation.errorMessage
    );
    updateFieldError(surnameField.errorMessage, surnameField.input, surnameValidation.errorMessage);

    loginButton.disabled = !(firstNameValid && surnameValid);
  };

  const handleFirstNameInput = (): void => {
    const formatted = formatNameInput(firstNameField.input.value);
    firstNameField.input.value = formatted;
    validateForm();
  };

  const handleSurnameInput = (): void => {
    const formatted = formatNameInput(surnameField.input.value);
    surnameField.input.value = formatted;
    validateForm();
  };

  const savedData = getUserData();
  if (savedData) {
    firstNameField.input.value = savedData.firstName;
    surnameField.input.value = savedData.surname;
    validateForm();
  }

  firstNameField.input.addEventListener('input', handleFirstNameInput);
  firstNameField.input.addEventListener('blur', validateForm);
  surnameField.input.addEventListener('input', handleSurnameInput);
  surnameField.input.addEventListener('blur', validateForm);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    validateForm();

    if (firstNameValid && surnameValid) {
      const userData = {
        firstName: firstNameField.input.value.trim(),
        surname: surnameField.input.value.trim(),
      };

      try {
        saveUserData(userData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save user data';
        updateFieldError(surnameField.errorMessage, surnameField.input, errorMessage);
      }
    }
  });

  form.appendChild(firstNameField.container);
  form.appendChild(surnameField.container);
  form.appendChild(loginButton);

  return form;
}
