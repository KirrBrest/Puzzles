const ROWS_COUNT = 10;

export interface GameBoardResult {
  container: HTMLElement;
  rows: HTMLElement[];
  addCardToRow: (_rowIndex: number, _card: HTMLElement) => void;
  clearRow: (_rowIndex: number) => void;
  clearAllRows: () => void;
  getCurrentRowIndex: () => number;
  setCurrentRowIndex: (_index: number) => void;
}

let currentRowIndex = 0;

export default function createGameBoard(): GameBoardResult {
  const board = document.createElement('div');
  board.className = 'game-board';

  const rows: HTMLElement[] = [];

  for (let i = 0; i < ROWS_COUNT; i += 1) {
    const row = document.createElement('div');
    row.className = 'game-board-row';
    row.setAttribute('data-row-index', i.toString());
    board.appendChild(row);
    rows.push(row);
  }

  function addCardToRow(rowIndex: number, card: HTMLElement): void {
    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      if (row) {
        const cardClone = card.cloneNode(true) as HTMLElement;

        cardClone.classList.add('word-card-placed');

        row.appendChild(cardClone);
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
      currentRowIndex = index;
    }
  }

  return {
    container: board,
    rows,
    addCardToRow,
    clearRow,
    clearAllRows,
    getCurrentRowIndex,
    setCurrentRowIndex,
  };
}
