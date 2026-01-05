import createWordCard, { WordCardResult } from './WordCard';
import { shuffleArray } from '../utils/levelLoader';

export interface SourceCardsAreaResult {
  container: HTMLElement;
  cards: WordCardResult[];
  removeCard: (_card: WordCardResult) => void;
  addCard: (_card: WordCardResult) => void;
  addCardAtEnd: (_card: WordCardResult) => void;
  clearAll: () => void;
  reset: (_words: string[]) => void;
  updateCardStyles: () => void;
  findCardByElement: (_element: HTMLElement) => WordCardResult | undefined;
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

function calculateSourceCardWidth(card: WordCardResult, allWords: string[]): void {
  const wordLength = card.word.length;
  const totalLength = allWords.reduce((sum, word) => sum + word.length, 0);

  if (totalLength > 0) {
    const widthRatio = wordLength / totalLength;
    card.element.style.setProperty('--card-width', `${widthRatio * 100}%`);
    card.element.setAttribute('data-width-ratio', widthRatio.toString());
  }
}

export default function createSourceCardsArea(words: string[]): SourceCardsAreaResult {
  const container = document.createElement('div');
  container.className = 'source-cards-area';

  const cards: WordCardResult[] = words.map((word, index) =>
    createWordCard(word, index, words.length)
  );

  const shuffledCards = shuffleArray([...cards]);
  shuffledCards.forEach((card, index) => {
    card.shuffledIndex = index;
  });
  cards.length = 0;
  cards.push(...shuffledCards);

  shuffledCards.forEach((card) => {
    calculateSourceCardWidth(card, words);
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

  function addCardAtEnd(card: WordCardResult): void {
    card.isUsed = false;
    if (card.element.parentNode !== container) {
      const availableCards = cards.filter((c) => !c.isUsed && c.element.parentNode === container);
      const insertIndex = availableCards.findIndex((c) => c.shuffledIndex > card.shuffledIndex);

      if (insertIndex === -1) {
        container.appendChild(card.element);
      } else {
        const nextCard = availableCards[insertIndex];
        if (nextCard) {
          container.insertBefore(card.element, nextCard.element);
        } else {
          container.appendChild(card.element);
        }
      }
    }
    const allWords = cards.map((c) => c.word);
    calculateSourceCardWidth(card, allWords);
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
    newShuffledCards.forEach((card, index) => {
      card.shuffledIndex = index;
    });

    newShuffledCards.forEach((card) => {
      calculateSourceCardWidth(card, newWords);
      cards.push(card);
      container.appendChild(card.element);
    });
  }

  function findCardByElement(element: HTMLElement): WordCardResult | undefined {
    return cards.find((card) => card.element === element);
  }

  return {
    container,
    cards,
    removeCard,
    addCard,
    addCardAtEnd,
    clearAll,
    reset,
    updateCardStyles: () => updateCardStyles(cards),
    findCardByElement,
  };
}
