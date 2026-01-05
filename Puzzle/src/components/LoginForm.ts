import createInputField from './InputField';
import createLoginButton from './LoginButton';

export default function createLoginForm(): HTMLElement {
  const form = document.createElement('form');
  form.className = 'login-form';
  form.setAttribute('novalidate', '');

  const firstNameField = createInputField('firstName', 'First Name', true);
  const surnameField = createInputField('surname', 'Surname', true);
  const loginButton = createLoginButton();

  loginButton.disabled = true;

  const handleInputChange = (): void => {
    const firstNameValue = firstNameField.input.value.trim();
    const surnameValue = surnameField.input.value.trim();

    loginButton.disabled = !(firstNameValue && surnameValue);
  };

  firstNameField.input.addEventListener('input', handleInputChange);
  surnameField.input.addEventListener('input', handleInputChange);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  form.appendChild(firstNameField.container);
  form.appendChild(surnameField.container);
  form.appendChild(loginButton);

  return form;
}
