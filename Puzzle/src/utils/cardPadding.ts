export function getCardPadding(card: HTMLElement): { left: number; right: number } {
  if (card.classList.contains('word-card-start')) {
    return { left: 10, right: 20 };
  }
  if (card.classList.contains('word-card-end')) {
    return { left: 20, right: 10 };
  }
  if (card.classList.contains('word-card-middle')) {
    return { left: 20, right: 20 };
  }
  return { left: 17, right: 17 };
}

export function getCardPaddingByIndex(
  index: number,
  total: number
): { left: number; right: number } {
  if (index === 0) {
    return { left: 10, right: 20 };
  }
  if (index === total - 1) {
    return { left: 20, right: 10 };
  }
  return { left: 20, right: 20 };
}
