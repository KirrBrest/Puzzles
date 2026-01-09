import createAudioHintButton from '../components/AudioHintButton';
import { playAudio } from './audioPlayer';
import { getAudioForSentence } from './levelLoader';

export function createAudioHintManager(getCurrentSentence: () => string | undefined): {
  element: HTMLElement;
  stop: () => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
  enableButton: () => void;
  disableButton: () => void;
} {
  const audioHintButton = createAudioHintButton();
  let currentAudio: HTMLAudioElement | null = null;
  let isEnabled = true;
  let isButtonEnabled = true;

  audioHintButton.element.addEventListener('click', () => {
    if (audioHintButton.element.disabled) {
      return;
    }

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
            if (isEnabled) {
              audioHintButton.element.disabled = false;
            } else {
              audioHintButton.element.disabled = !isButtonEnabled;
            }
            currentAudio = null;
          })
          .catch((error) => {
            console.error('Error playing audio:', error);
            audioHintButton.setPlaying(false);
            if (isEnabled) {
              audioHintButton.element.disabled = false;
            } else {
              audioHintButton.element.disabled = !isButtonEnabled;
            }
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
      if (isEnabled) {
        audioHintButton.element.disabled = false;
      } else {
        audioHintButton.element.disabled = !isButtonEnabled;
      }
    }
  }

  function setEnabled(enabled: boolean): void {
    isEnabled = enabled;
    if (enabled) {
      isButtonEnabled = true;
      audioHintButton.element.disabled = false;
    } else {
      isButtonEnabled = false;
      audioHintButton.element.disabled = true;
      stop();
    }
  }

  function getIsEnabled(): boolean {
    return isEnabled;
  }

  function enableButton(): void {
    if (!isEnabled) {
      isButtonEnabled = true;
      audioHintButton.element.disabled = false;
    }
  }

  function disableButton(): void {
    if (!isEnabled) {
      isButtonEnabled = false;
      audioHintButton.element.disabled = true;
      stop();
    }
  }

  return {
    element: audioHintButton.element,
    stop,
    setEnabled,
    isEnabled: getIsEnabled,
    enableButton,
    disableButton,
  };
}
