export default function createHintButton(): {
  element: HTMLElement;
  isEnabled: () => boolean;
  toggle: () => void;
} {
  const button = document.createElement('button');
  button.className = 'hint-button';
  button.setAttribute('aria-label', 'Disable translation hint');
  button.innerHTML = '💡';

  let enabled = true;

  function isEnabled(): boolean {
    return enabled;
  }

  function toggle(): void {
    enabled = !enabled;
    if (enabled) {
      button.classList.add('active');
      button.setAttribute('aria-label', 'Disable translation hint');
    } else {
      button.classList.remove('active');
      button.setAttribute('aria-label', 'Enable translation hint');
    }
  }

  button.classList.add('active');

  return {
    element: button,
    isEnabled,
    toggle,
  };
}
