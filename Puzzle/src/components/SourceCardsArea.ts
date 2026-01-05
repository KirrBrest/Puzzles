import createWordCard, { WordCardResult } from './WordCard';
import { shuffleArray } from '../utils/levelLoader';

export interface SourceCardsAreaResult {
  container: HTMLElement;
  cards: WordCardResult[];
  removeCard: (_card: WordCardResult) => void;
  addCard: (_card: WordCardResult) => void;
  clearAll: () => void;
  reset: (_words: string[]) => void;
  updateCardStyles: () => void;
}

function updateCardStyles(cards: WordCardResult[]): void {
  const availableCards = cards.filter((card) => !card.isUsed);
  const total = cards.length;
  availableCards.forEach((card) => {
    card.element.className = 'word-card';
    if (card.originalIndex === 0) {
      card.element.classList.add('word-card-start');
    } else if (card.originalIndex === total - 1) {
      card.element.classList.add('word-card-end');
    } else {
      card.element.classList.add('word-card-middle');
    }
  });
}

export default function createSourceCardsArea(words: string[]): SourceCardsAreaResult {
  const container = document.createElement('div');
  container.className = 'source-cards-area';

  const cards: WordCardResult[] = words.map((word, index) =>
    createWordCard(word, index, words.length)
  );

  const shuffledCards = shuffleArray([...cards]);
  cards.length = 0;
  cards.push(...shuffledCards);

  shuffledCards.forEach((card) => {
    container.appendChild(card.element);
  });

  function removeCard(cardToRemove: WordCardResult): void {
    if (cardToRemove.element.parentNode === container) {
      container.removeChild(cardToRemove.element);
    }
    cardToRemove.isUsed = true;
    updateCardStyles(cards);
  }

  function addCard(card: WordCardResult): void {
    if (!cards.includes(card)) {
      cards.push(card);
    }
    if (card.element.parentNode !== container) {
      container.appendChild(card.element);
    }
    card.isUsed = false;
    updateCardStyles(cards);
  }

  function clearAll(): void {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    cards.forEach((card) => {
      card.isUsed = false;
    });
  }

  function reset(newWords: string[]): void {
    clearAll();
    cards.length = 0;

    const newCards: WordCardResult[] = newWords.map((word, index) =>
      createWordCard(word, index, newWords.length)
    );

    const newShuffledCards = shuffleArray([...newCards]);

    newShuffledCards.forEach((card) => {
      cards.push(card);
      container.appendChild(card.element);
    });
  }

  return {
    container,
    cards,
    removeCard,
    addCard,
    clearAll,
    reset,
    updateCardStyles: () => updateCardStyles(cards),
  };
}
