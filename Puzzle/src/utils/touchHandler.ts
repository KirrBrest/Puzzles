import { getDragState, setDragState, resetDragState } from './dragDropManager';
import { getDropTarget, isDropTarget, getInsertPosition } from './dragDropManager';
import {
  addDragOverClass,
  removeDragOverClass,
  addDraggingClass,
  removeDraggingClass,
  addDropIndicator,
  removeDropIndicator,
  removeAllDropIndicators,
} from './dragVisualFeedback';

export interface TouchStartEvent {
  target: HTMLElement;
  touch: Touch;
}

export function setupTouchHandlers(
  element: HTMLElement,
  onDragStart: (card: HTMLElement, cardData: unknown) => void,
  onDragEnd: () => void,
  onDrop: (target: HTMLElement, card: HTMLElement, cardData: unknown) => void
): void {
  let touchStartTime = 0;
  let touchStartPosition = { x: 0, y: 0 };
  let isDragging = false;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  const handleTouchStart = (e: TouchEvent): void => {
    const { target } = e;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const card = target.closest('.word-card');
    if (!(card instanceof HTMLElement)) {
      return;
    }

    const touch = e.touches[0];
    if (!touch) {
      return;
    }

    touchStartTime = Date.now();
    touchStartPosition = { x: touch.clientX, y: touch.clientY };

    longPressTimer = setTimeout(() => {
      isDragging = true;
      addDraggingClass(card);
      const cardData = card.getAttribute('data-card-data');
      const parsedCardData = cardData ? JSON.parse(cardData) : null;
      setDragState({
        draggedCard: card,
        draggedCardData: parsedCardData,
        sourceElement: card.parentElement,
      });
      onDragStart(card, parsedCardData);
    }, 300);
  };

  const handleTouchMove = (e: TouchEvent): void => {
    if (!isDragging) {
      return;
    }

    e.preventDefault();

    const touch = e.touches[0];
    if (!touch) {
      return;
    }

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!(element instanceof HTMLElement)) {
      removeAllDropIndicators();
      return;
    }

    const target = getDropTarget(element);
    if (target) {
      addDragOverClass(target);
      const { beforeElement } = getInsertPosition(target, touch.clientX, touch.clientY);
      addDropIndicator(target, beforeElement);
    } else {
      removeAllDropIndicators();
    }

    const allDropTargets = document.querySelectorAll('.source-cards-area, .game-board-row');
    allDropTargets.forEach((dropTarget) => {
      if (dropTarget !== target) {
        removeDragOverClass(dropTarget as HTMLElement);
      }
    });
  };

  const handleTouchEnd = (e: TouchEvent): void => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (!isDragging) {
      return;
    }

    isDragging = false;

    const touch = e.changedTouches[0];
    if (!touch) {
      resetDragState();
      removeAllDropIndicators();
      removeDraggingClass(getDragState().draggedCard as HTMLElement);
      return;
    }

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!(element instanceof HTMLElement)) {
      resetDragState();
      removeAllDropIndicators();
      return;
    }

    const target = getDropTarget(element);
    const dragState = getDragState();

    if (target && dragState.draggedCard) {
      onDrop(target, dragState.draggedCard, dragState.draggedCardData);
    }

    removeAllDropIndicators();
    const allDropTargets = document.querySelectorAll('.source-cards-area, .game-board-row');
    allDropTargets.forEach((dropTarget) => {
      removeDragOverClass(dropTarget as HTMLElement);
    });

    if (dragState.draggedCard) {
      removeDraggingClass(dragState.draggedCard);
    }

    resetDragState();
    onDragEnd();
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: false });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });
  element.addEventListener('touchend', handleTouchEnd, { passive: false });
  element.addEventListener('touchcancel', handleTouchEnd, { passive: false });
}

