let currentRowIndex = 0;
const rowClickHandlers = new Map<number, (e: Event) => void>();

export function getCurrentRowIndex(): number {
  return currentRowIndex;
}

export function setCurrentRowIndex(index: number, rows: HTMLElement[]): void {
  const ROWS_COUNT = 10;
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

export function setupRowClickHandler(
  rowIndex: number,
  rows: HTMLElement[],
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
