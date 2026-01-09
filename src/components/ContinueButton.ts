export default function createContinueButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'continue-button';
  button.textContent = 'Continue';
  button.disabled = true;

  return button;
}
