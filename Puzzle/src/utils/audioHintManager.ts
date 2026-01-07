import createAudioHintButton from '../components/AudioHintButton';
import { playAudio } from './audioPlayer';
import { getAudioForSentence } from './levelLoader';

export function createAudioHintManager(getCurrentSentence: () => string | undefined): {
  element: HTMLElement;
  stop: () => void;
} {
  const audioHintButton = createAudioHintButton();
  let currentAudio: HTMLAudioElement | null = null;

  audioHintButton.element.addEventListener('click', () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      audioHintButton.setPlaying(false);
      audioHintButton.element.disabled = false;
      return;
    }

    const currentSentence = getCurrentSentence();
    if (currentSentence) {
      const audioExample = getAudioForSentence(currentSentence);
      if (audioExample) {
        audioHintButton.element.disabled = true;
        audioHintButton.setPlaying(true);

        const { audio, promise } = playAudio(audioExample);
        currentAudio = audio;

        promise
          .then(() => {
            audioHintButton.setPlaying(false);
            audioHintButton.element.disabled = false;
            currentAudio = null;
          })
          .catch((error) => {
            console.error('Error playing audio:', error);
            audioHintButton.setPlaying(false);
            audioHintButton.element.disabled = false;
            currentAudio = null;
          });
      }
    }
  });

  function stop(): void {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      audioHintButton.setPlaying(false);
      audioHintButton.element.disabled = false;
    }
  }

  return {
    element: audioHintButton.element,
    stop,
  };
}
