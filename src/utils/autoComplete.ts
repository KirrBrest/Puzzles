import { getSentenceWords } from './levelLoader';
import { WordCardResult } from '../components/WordCard';

export function autoCompleteSentence(
  sentence: string,
  sourceArea: ReturnType<typeof import('../components/SourceCardsArea').default>,
  gameBoard: ReturnType<typeof import('../components/GameBoard').default>
): Promise<void> {
  return new Promise((resolve) => {
    const correctWords = getSentenceWords(sentence);
    const currentRow = gameBoard.getCurrentRowIndex();
    const existingCards = gameBoard.getRowCards(currentRow);

    existingCards.forEach((cardElement) => {
      const originalCardId = cardElement.getAttribute('data-original-card-id');
      if (originalCardId) {
        const card = sourceArea.cards.find((c) => {
          const cardId = c.element.getAttribute('data-card-id');
          return cardId === originalCardId;
        });
        if (card) {
          gameBoard.removeCardFromRow(currentRow, cardElement);
          sourceArea.addCardAtEnd(card);
        }
      }
    });

    gameBoard.clearRow(currentRow);

    const cardsToPlace: WordCardResult[] = [];
    correctWords.forEach((word) => {
      const card = sourceArea.cards.find((c) => c.word === word && !c.isUsed);
      if (card) {
        cardsToPlace.push(card);
      }
    });

    cardsToPlace.forEach((card, index) => {
      setTimeout(() => {
        gameBoard.addCardToRow(currentRow, card.element);
        sourceArea.removeCard(card);
        if (index === cardsToPlace.length - 1) {
          setTimeout(() => {
            resolve();
          }, 100);
        }
      }, index * 80);
    });

    if (cardsToPlace.length === 0) {
      resolve();
    }
  });
}
