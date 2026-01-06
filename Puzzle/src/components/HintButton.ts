export default function createHintButton(): HTMLElement {
  const button = document.createElement('button');
  button.className = 'hint-button';
  button.setAttribute('aria-label', 'Show translation hint');
  button.innerHTML = '💡';
  return button;
}
