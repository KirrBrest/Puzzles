export interface WordCardResult {
  element: HTMLElement;
  word: string;
  isUsed: boolean;
  originalIndex: number;
}

export default function createWordCard(word: string, index: number, total: number): WordCardResult {
  const card = document.createElement('div');
  card.className = 'word-card';
  card.textContent = word;
  card.setAttribute('data-word-length', word.length.toString());

  if (index === 0) {
    card.classList.add('word-card-start');
  } else if (index === total - 1) {
    card.classList.add('word-card-end');
  } else {
    card.classList.add('word-card-middle');
  }

  return {
    element: card,
    word,
    isUsed: false,
    originalIndex: index,
  };
}
