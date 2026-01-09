import { WordCardResult } from '../components/WordCard';
import {
  getDragState,
  setDragState,
  resetDragState,
  getDropTarget,
  isDropTarget,
  getInsertPosition,
} from './dragDropManager';
import {
  addDragOverClass,
  removeDragOverClass,
  addDraggingClass,
  removeDraggingClass,
  addDropIndicator,
  removeDropIndicator,
  removeAllDropIndicators,
} from './dragVisualFeedback';

export interface DragDropCallbacks {
  onCardDragStart: (card: HTMLElement, cardData: WordCardResult) => void;
  onCardDragEnd: () => void;
  onCardDrop: (
    target: HTMLElement,
    card: HTMLElement,
    cardData: WordCardResult,
    insertIndex: number
  ) => void;
}

export function setupDragAndDrop(
  sourceArea: HTMLElement,
  gameBoard: HTMLElement,
  callbacks: DragDropCallbacks
): void {
  const handleDragStart = (e: DragEvent): void => {
    const { target } = e;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const card = target.closest('.word-card, .word-card-placed');
    if (!(card instanceof HTMLElement)) {
      return;
    }

    let cardDataAttr = card.getAttribute('data-card-data');
    if (!cardDataAttr && card.classList.contains('word-card-placed')) {
      const originalCardId = card.getAttribute('data-original-card-id');
      if (originalCardId) {
        const sourceCardElement = sourceArea.querySelector(`[data-card-id="${originalCardId}"]`);
        if (sourceCardElement instanceof HTMLElement) {
          cardDataAttr = sourceCardElement.getAttribute('data-card-data');
        }
      }
    }

    if (!cardDataAttr) {
      return;
    }

    try {
      const cardData = JSON.parse(cardDataAttr) as WordCardResult;
      setDragState({
        draggedCard: card,
        draggedCardData: cardData,
        sourceElement: card.parentElement,
      });

      addDraggingClass(card);
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      }

      callbacks.onCardDragStart(card, cardData);
    } catch {
      e.preventDefault();
    }
  };

  const handleDragOver = (e: DragEvent): void => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }

    const { target } = e;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const dropTarget = getDropTarget(target);
    if (!dropTarget) {
      removeAllDropIndicators();
      return;
    }

    addDragOverClass(dropTarget);
    setDragState({ dropTarget });

    const dragState = getDragState();
    const { beforeElement } = getInsertPosition(
      dropTarget,
      e.clientX,
      e.clientY,
      dragState.draggedCard
    );
    addDropIndicator(dropTarget, beforeElement);

    const allDropTargets = document.querySelectorAll('.source-cards-area, .game-board-row');
    allDropTargets.forEach((dropTargetElement) => {
      if (dropTargetElement !== dropTarget) {
        removeDragOverClass(dropTargetElement as HTMLElement);
      }
    });
  };

  const handleDragLeave = (e: DragEvent): void => {
    const { target, relatedTarget } = e;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const dropTarget = getDropTarget(target);
    if (!dropTarget) {
      return;
    }

    if (relatedTarget instanceof HTMLElement && dropTarget.contains(relatedTarget)) {
      return;
    }

    removeDragOverClass(dropTarget);
    removeDropIndicator(dropTarget);
  };

  const handleDrop = (e: DragEvent): void => {
    e.preventDefault();

    const { target } = e;
    if (!(target instanceof HTMLElement)) {
      resetDragState();
      removeAllDropIndicators();
      return;
    }

    const dropTarget = getDropTarget(target);
    const dragState = getDragState();

    if (!dropTarget) {
      resetDragState();
      removeAllDropIndicators();
      return;
    }

    if (!dragState.draggedCard || !dragState.draggedCardData) {
      resetDragState();
      removeAllDropIndicators();
      return;
    }

    if (!isDropTarget(dropTarget)) {
      resetDragState();
      removeAllDropIndicators();
      return;
    }

    try {
      const { index } = getInsertPosition(dropTarget, e.clientX, e.clientY, dragState.draggedCard);
      callbacks.onCardDrop(dropTarget, dragState.draggedCard, dragState.draggedCardData, index);
    } catch {
      if (dragState.draggedCard) {
        removeDraggingClass(dragState.draggedCard);
        dragState.draggedCard.style.opacity = '';
        dragState.draggedCard.style.transform = '';
      }
      resetDragState();
      removeAllDropIndicators();
      return;
    }

    if (dragState.draggedCard) {
      removeDraggingClass(dragState.draggedCard);
      dragState.draggedCard.style.opacity = '';
      dragState.draggedCard.style.transform = '';
    }

    removeAllDropIndicators();
    const allDropTargets = document.querySelectorAll('.source-cards-area, .game-board-row');
    allDropTargets.forEach((dropTargetElement) => {
      removeDragOverClass(dropTargetElement as HTMLElement);
    });

    resetDragState();
  };

  const handleDragEnd = (): void => {
    const dragState = getDragState();
    if (dragState.draggedCard) {
      removeDraggingClass(dragState.draggedCard);
      dragState.draggedCard.style.opacity = '';
      dragState.draggedCard.style.transform = '';
    }

    removeAllDropIndicators();
    const allDropTargets = document.querySelectorAll('.source-cards-area, .game-board-row');
    allDropTargets.forEach((dropTarget) => {
      removeDragOverClass(dropTarget as HTMLElement);
    });

    const allCards = document.querySelectorAll('.word-card.dragging');
    allCards.forEach((card) => {
      removeDraggingClass(card as HTMLElement);
    });

    resetDragState();
    callbacks.onCardDragEnd();
  };

  sourceArea.addEventListener('dragstart', handleDragStart);
  sourceArea.addEventListener('dragover', handleDragOver);
  sourceArea.addEventListener('dragleave', handleDragLeave);
  sourceArea.addEventListener('drop', handleDrop);
  sourceArea.addEventListener('dragend', handleDragEnd);

  gameBoard.addEventListener('dragstart', handleDragStart);
  gameBoard.addEventListener('dragover', handleDragOver);
  gameBoard.addEventListener('dragleave', handleDragLeave);
  gameBoard.addEventListener('drop', handleDrop);
  gameBoard.addEventListener('dragend', handleDragEnd);
}

export function makeCardDraggable(card: HTMLElement, cardData: WordCardResult): void {
  card.draggable = true;
  card.setAttribute('data-card-data', JSON.stringify(cardData));
}
