export default function createLogoutButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'logout-button';
  button.textContent = 'Logout';

  return button;
}
