import { WordCardResult } from '../components/WordCard';

export interface DragState {
  draggedCard: HTMLElement | null;
  draggedCardData: WordCardResult | null;
  sourceElement: HTMLElement | null;
  dropTarget: HTMLElement | null;
}

let dragState: DragState = {
  draggedCard: null,
  draggedCardData: null,
  sourceElement: null,
  dropTarget: null,
};

export function getDragState(): DragState {
  return dragState;
}

export function setDragState(newState: Partial<DragState>): void {
  dragState = { ...dragState, ...newState };
}

export function resetDragState(): void {
  dragState = {
    draggedCard: null,
    draggedCardData: null,
    sourceElement: null,
    dropTarget: null,
  };
}

export function isDropTarget(element: HTMLElement): boolean {
  return (
    element.classList.contains('source-cards-area') ||
    element.classList.contains('game-board-row') ||
    element.closest('.source-cards-area') !== null ||
    element.closest('.game-board-row') !== null
  );
}

export function getDropTarget(element: HTMLElement): HTMLElement | null {
  const sourceArea = element.closest('.source-cards-area');
  if (sourceArea instanceof HTMLElement) {
    return sourceArea;
  }

  const row = element.closest('.game-board-row');
  if (row instanceof HTMLElement) {
    return row;
  }

  return null;
}

export function getInsertPosition(
  dropTarget: HTMLElement,
  x: number,
  y: number,
  draggedCard?: HTMLElement | null
): { beforeElement: HTMLElement | null; index: number } {
  const children = Array.from(dropTarget.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      !child.classList.contains('drop-indicator') &&
      child !== draggedCard
  );

  if (children.length === 0) {
    return { beforeElement: null, index: 0 };
  }

  const lastChild = children[children.length - 1];
  if (lastChild) {
    const lastRect = lastChild.getBoundingClientRect();
    const lastRightEdge = lastRect.right;
    
    if (x >= lastRightEdge - lastRect.width * 0.3) {
      return { beforeElement: null, index: children.length };
    }
  }

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    if (!child) {
      continue;
    }

    const rect = child.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    if (x < centerX) {
      return { beforeElement: child, index: i };
    }
  }

  return { beforeElement: null, index: children.length };
}

