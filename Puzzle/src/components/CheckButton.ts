export default function createCheckButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'check-button';
  button.textContent = 'Check';
  button.disabled = true;

  return button;
}
