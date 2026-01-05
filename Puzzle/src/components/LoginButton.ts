export default function createLoginButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'login-button';
  button.textContent = 'Login';

  return button;
}
