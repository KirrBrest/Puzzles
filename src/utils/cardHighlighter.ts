export type HighlightType = 'correct' | 'incorrect' | 'none';

export function highlightCard(card: HTMLElement, type: HighlightType): void {
  card.classList.remove('word-card-correct', 'word-card-incorrect');
  if (type === 'correct') {
    card.classList.add('word-card-correct');
  } else if (type === 'incorrect') {
    card.classList.add('word-card-incorrect');
  }
}

export function clearAllHighlights(rowCards: HTMLElement[]): void {
  rowCards.forEach((card) => {
    highlightCard(card, 'none');
  });
}

export function highlightCardsByValidation(
  rowCards: HTMLElement[],
  validationResults: Array<{ isCorrect: boolean }>
): void {
  rowCards.forEach((card, index) => {
    const result = validationResults[index];
    if (result) {
      highlightCard(card, result.isCorrect ? 'correct' : 'incorrect');
    }
  });
}
