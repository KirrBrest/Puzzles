export interface WordCardResult {
  element: HTMLElement;
  word: string;
  isUsed: boolean;
  originalIndex: number;
  shuffledIndex: number;
}

export default function createWordCard(word: string, index: number, total: number): WordCardResult {
  const card = document.createElement('div');
  card.className = 'word-card';
  card.textContent = word;
  card.setAttribute('data-word-length', word.length.toString());
  card.setAttribute('data-card-id', `${word}-${index}`);
  card.draggable = true;

  if (index === 0) {
    card.classList.add('word-card-start');
  } else if (index === total - 1) {
    card.classList.add('word-card-end');
  } else {
    card.classList.add('word-card-middle');
  }

  const cardResult: WordCardResult = {
    element: card,
    word,
    isUsed: false,
    originalIndex: index,
    shuffledIndex: index,
  };

  card.setAttribute('data-card-data', JSON.stringify(cardResult));

  return cardResult;
}
