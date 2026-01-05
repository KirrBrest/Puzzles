import { getCardPadding } from './cardPadding';

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number');
}

function calculateCardWidths(row: HTMLElement): void {
  const rowCards = Array.from(row.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement
  );
  if (rowCards.length === 0) {
    return;
  }

  const sentenceData = row.getAttribute('data-sentence-ratios');
  const totalPaddingBordersData = row.getAttribute('data-total-padding-borders');
  if (!sentenceData || !totalPaddingBordersData) {
    return;
  }

  const parsed = JSON.parse(sentenceData);
  if (!isNumberArray(parsed)) {
    return;
  }
  const sentenceRatios = parsed;
  const totalRatio = sentenceRatios.reduce((sum, ratio) => sum + ratio, 0);
  const totalPaddingAndBorders = parseFloat(totalPaddingBordersData);

  if (totalRatio > 0) {
    const rowWidth = row.getBoundingClientRect().width || row.offsetWidth;
    const borderWidth = 2;
    const availableWidth = rowWidth - totalPaddingAndBorders;

    if (availableWidth > 0) {
      rowCards.forEach((card) => {
        const ratio = parseFloat(card.getAttribute('data-width-ratio') || '0');
        if (ratio > 0) {
          const padding = getCardPadding(card);
          const cardContentWidth = (ratio / totalRatio) * availableWidth;
          const cardTotalWidth = cardContentWidth + padding.left + padding.right + borderWidth * 2;
          const widthPercentage = (cardTotalWidth / rowWidth) * 100;
          card.style.setProperty('--card-width', `${widthPercentage}%`);
        }
      });
    }
  }
}

export default calculateCardWidths;
