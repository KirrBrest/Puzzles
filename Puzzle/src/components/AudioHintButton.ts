export default function createAudioHintButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'audio-hint-button';
  button.setAttribute('aria-label', 'Play audio pronunciation');
  button.innerHTML = '🔊';
  return button;
}

