export function getCardPadding(card: HTMLElement): { left: number; right: number } {
  if (card.classList.contains('word-card-start')) {
    return { left: 12, right: 24 };
  }
  if (card.classList.contains('word-card-end')) {
    return { left: 24, right: 12 };
  }
  if (card.classList.contains('word-card-middle')) {
    return { left: 24, right: 24 };
  }
  return { left: 20, right: 20 };
}

export function getCardPaddingByIndex(
  index: number,
  total: number
): { left: number; right: number } {
  if (index === 0) {
    return { left: 12, right: 24 };
  }
  if (index === total - 1) {
    return { left: 24, right: 12 };
  }
  return { left: 24, right: 24 };
}
