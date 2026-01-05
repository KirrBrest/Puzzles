export default function createAutoCompleteButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'auto-complete-button';
  button.textContent = 'Auto-Complete';

  return button;
}
