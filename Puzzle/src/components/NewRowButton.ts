export default function createNewRowButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'new-row-button';
  button.textContent = 'New Row';

  return button;
}
