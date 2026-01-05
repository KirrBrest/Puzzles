const ROWS_COUNT = 10;

export interface GameBoardResult {
  container: HTMLElement;
  rows: HTMLElement[];
  addCardToRow: (_rowIndex: number, _card: HTMLElement) => void;
  removeCardFromRow: (_rowIndex: number, _cardElement: HTMLElement) => HTMLElement | null;
  clearRow: (_rowIndex: number) => void;
  clearAllRows: () => void;
  getCurrentRowIndex: () => number;
  setCurrentRowIndex: (_index: number) => void;
  setRowSentence: (_rowIndex: number, _words: string[]) => void;
  setupRowClickHandler: (_rowIndex: number, _handler: (_cardElement: HTMLElement) => void) => void;
}

let currentRowIndex = 0;
const rowClickHandlers = new Map<number, (e: Event) => void>();

export default function createGameBoard(): GameBoardResult {
  const board = document.createElement('div');
  board.className = 'game-board';

  const rows: HTMLElement[] = [];

  for (let i = 0; i < ROWS_COUNT; i += 1) {
    const row = document.createElement('div');
    row.className = 'game-board-row';
    row.setAttribute('data-row-index', i.toString());
    if (i === 0) {
      row.classList.add('active-row');
    }
    board.appendChild(row);
    rows.push(row);
  }

  function getCardPadding(card: HTMLElement): { left: number; right: number } {
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
            const cardTotalWidth =
              cardContentWidth + padding.left + padding.right + borderWidth * 2;
            const widthPercentage = (cardTotalWidth / rowWidth) * 100;
            card.style.setProperty('--card-width', `${widthPercentage}%`);
          }
        });
      }
    }
  }

  function addCardToRow(rowIndex: number, card: HTMLElement): void {
    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      if (row) {
        const cardClone = card.cloneNode(true);
        if (!(cardClone instanceof HTMLElement)) {
          return;
        }

        cardClone.classList.add('word-card-placed');
        const cardId = card.getAttribute('data-card-id');
        if (cardId) {
          cardClone.setAttribute('data-original-card-id', cardId);
        }

        row.appendChild(cardClone);

        setTimeout(() => {
          calculateCardWidths(row);
        }, 0);
      }
    }
  }

  function removeCardFromRow(rowIndex: number, cardElement: HTMLElement): HTMLElement | null {
    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      if (row && cardElement.parentNode === row) {
        row.removeChild(cardElement);
        setTimeout(() => {
          calculateCardWidths(row);
        }, 0);
        return cardElement;
      }
    }
    return null;
  }

  function setupRowClickHandler(
    rowIndex: number,
    handler: (cardElement: HTMLElement) => void
  ): void {
    rows.forEach((r, index) => {
      const existingHandler = rowClickHandlers.get(index);
      if (existingHandler) {
        r.removeEventListener('click', existingHandler);
        rowClickHandlers.delete(index);
      }
    });

    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      if (row) {
        const clickHandler = (e: Event): void => {
          if (rowIndex !== currentRowIndex) {
            return;
          }

          const { target } = e;
          if (!(target instanceof HTMLElement)) {
            return;
          }

          let cardElement: HTMLElement | null = target;
          while (cardElement && !cardElement.classList.contains('word-card-placed')) {
            cardElement = cardElement.parentElement;
          }

          if (cardElement && cardElement.parentNode === row) {
            handler(cardElement);
          }
        };

        rowClickHandlers.set(rowIndex, clickHandler);
        row.addEventListener('click', clickHandler);
      }
    }
  }

  function clearRow(rowIndex: number): void {
    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      if (row) {
        while (row.firstChild) {
          row.removeChild(row.firstChild);
        }
      }
    }
  }

  function clearAllRows(): void {
    rows.forEach((row) => {
      while (row.firstChild) {
        row.removeChild(row.firstChild);
      }
    });
  }

  function getCurrentRowIndex(): number {
    return currentRowIndex;
  }

  function setCurrentRowIndex(index: number): void {
    if (index >= 0 && index < ROWS_COUNT) {
      rows.forEach((row, i) => {
        if (i === index) {
          row.classList.add('active-row');
        } else {
          row.classList.remove('active-row');
        }
      });
      currentRowIndex = index;
    }
  }

  function getCardPaddingByIndex(index: number, total: number): { left: number; right: number } {
    if (index === 0) {
      return { left: 12, right: 24 };
    }
    if (index === total - 1) {
      return { left: 24, right: 12 };
    }
    return { left: 24, right: 24 };
  }

  function setRowSentence(rowIndex: number, words: string[]): void {
    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      if (row) {
        const totalLength = words.reduce((sum, word) => sum + word.length, 0);
        const ratios = words.map((word) => word.length / totalLength);
        const borderWidth = 2;
        const totalPaddingAndBorders = words.reduce((sum, _word, index) => {
          const padding = getCardPaddingByIndex(index, words.length);
          return sum + padding.left + padding.right + borderWidth * 2;
        }, 0);
        row.setAttribute('data-sentence-ratios', JSON.stringify(ratios));
        row.setAttribute('data-total-padding-borders', totalPaddingAndBorders.toString());
      }
    }
  }

  const resizeHandler = (): void => {
    rows.forEach((row) => {
      if (row.children.length > 0) {
        calculateCardWidths(row);
      }
    });
  };

  window.addEventListener('resize', resizeHandler);

  const resizeObserver = new ResizeObserver(() => {
    resizeHandler();
  });

  resizeObserver.observe(board);

  return {
    container: board,
    rows,
    addCardToRow,
    removeCardFromRow,
    clearRow,
    clearAllRows,
    getCurrentRowIndex,
    setCurrentRowIndex,
    setRowSentence,
    setupRowClickHandler,
  };
}
