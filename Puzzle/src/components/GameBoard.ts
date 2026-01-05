import calculateCardWidths from '../utils/cardWidthCalculator';
import { getCardPaddingByIndex } from '../utils/cardPadding';
import {
  getCurrentRowIndex as getCurrentRowIndexUtil,
  setCurrentRowIndex as setCurrentRowIndexUtil,
  setupRowClickHandler as setupRowClickHandlerUtil,
} from '../utils/rowClickHandler';

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
  getRowCards: (_rowIndex: number) => HTMLElement[];
}

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
    setupRowClickHandlerUtil(rowIndex, rows, handler);
  }

  function getRowCards(rowIndex: number): HTMLElement[] {
    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      if (row) {
        return Array.from(row.children).filter(
          (child): child is HTMLElement => child instanceof HTMLElement
        );
      }
    }
    return [];
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
    return getCurrentRowIndexUtil();
  }

  function setCurrentRowIndex(index: number): void {
    setCurrentRowIndexUtil(index, rows);
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
    getRowCards,
  };
}
