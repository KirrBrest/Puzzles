export default function createAudioHintButton(): {
  element: HTMLButtonElement;
  setPlaying: (isPlaying: boolean) => void;
} {
  const button = document.createElement('button');
  button.className = 'audio-hint-button';
  button.setAttribute('aria-label', 'Play audio pronunciation');
  button.innerHTML = '🔊';

  function setPlaying(isPlaying: boolean): void {
    if (isPlaying) {
      button.classList.add('playing');
    } else {
      button.classList.remove('playing');
    }
  }

  return {
    element: button,
    setPlaying,
  };
}
