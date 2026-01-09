export default function createStartButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'start-button';
  button.textContent = 'Start';

  return button;
}
