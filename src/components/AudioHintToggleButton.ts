export default function createAudioHintToggleButton(): {
  element: HTMLElement;
  isEnabled: () => boolean;
  toggle: () => void;
} {
  const button = document.createElement('button');
  button.className = 'audio-hint-toggle-button';
  button.setAttribute('aria-label', 'Toggle audio hint');

  const icon = document.createElement('span');
  icon.className = 'audio-hint-toggle-icon';
  icon.textContent = '🔊';

  const text = document.createElement('span');
  text.className = 'audio-hint-toggle-text';
  text.textContent = 'ON';

  button.appendChild(icon);
  button.appendChild(text);

  let enabled = true;

  function isEnabled(): boolean {
    return enabled;
  }

  function toggle(): void {
    enabled = !enabled;
    if (enabled) {
      button.classList.add('active');
      icon.textContent = '🔊';
      text.textContent = 'ON';
      button.setAttribute('aria-label', 'Disable audio hint');
    } else {
      button.classList.remove('active');
      icon.textContent = '🔇';
      text.textContent = 'OFF';
      button.setAttribute('aria-label', 'Enable audio hint');
    }
  }

  button.classList.add('active');

  return {
    element: button,
    isEnabled,
    toggle,
  };
}
