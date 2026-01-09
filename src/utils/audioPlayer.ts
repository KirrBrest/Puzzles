const AUDIO_BASE_URL =
  'https://raw.githubusercontent.com/rolling-scopes-school/rss-puzzle-data/main/';

export function getAudioUrl(audioExample: string): string {
  if (audioExample.startsWith('http://') || audioExample.startsWith('https://')) {
    return audioExample;
  }
  return `${AUDIO_BASE_URL}${audioExample}`;
}

export function playAudio(audioExample: string): {
  audio: HTMLAudioElement;
  promise: Promise<void>;
} {
  const audioUrl = getAudioUrl(audioExample);
  const audio = new Audio(audioUrl);

  const promise = new Promise<void>((resolve, reject) => {
    audio.addEventListener('ended', () => {
      resolve();
    });

    audio.addEventListener('error', (error) => {
      reject(error);
    });

    audio.play().catch((error) => {
      reject(error);
    });
  });

  return {
    audio,
    promise,
  };
}

export function stopAudio(): void {
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}
