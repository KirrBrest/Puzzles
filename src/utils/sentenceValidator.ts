import { getSentenceWords } from './levelLoader';

export interface WordValidationResult {
  index: number;
  word: string;
  isCorrect: boolean;
}

export function validateSentence(
  sentence: string,
  rowCards: HTMLElement[]
): WordValidationResult[] {
  const correctWords = getSentenceWords(sentence);
  const cardWords = rowCards.map((card) => card.textContent?.trim() || '');

  return cardWords.map((cardWord, index) => ({
    index,
    word: cardWord,
    isCorrect: cardWord === correctWords[index],
  }));
}

export function isSentenceComplete(sentence: string, rowCards: HTMLElement[]): boolean {
  const correctWords = getSentenceWords(sentence);
  return rowCards.length === correctWords.length;
}
