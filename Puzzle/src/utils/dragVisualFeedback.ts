export function addDragOverClass(element: HTMLElement): void {
  element.classList.add('drag-over');
}

export function removeDragOverClass(element: HTMLElement): void {
  element.classList.remove('drag-over');
}

export function addDraggingClass(element: HTMLElement): void {
  element.classList.add('dragging');
}

export function removeDraggingClass(element: HTMLElement): void {
  element.classList.remove('dragging');
}

export function addDropIndicator(
  dropTarget: HTMLElement,
  beforeElement: HTMLElement | null
): void {
  removeDropIndicator(dropTarget);

  const indicator = document.createElement('div');
  indicator.className = 'drop-indicator';
  indicator.setAttribute('data-drop-indicator', 'true');

  if (beforeElement && beforeElement.parentNode === dropTarget) {
    dropTarget.insertBefore(indicator, beforeElement);
  } else {
    dropTarget.appendChild(indicator);
  }
}

export function removeDropIndicator(dropTarget: HTMLElement): void {
  const indicator = dropTarget.querySelector('.drop-indicator');
  if (indicator) {
    indicator.remove();
  }
}

export function removeAllDropIndicators(): void {
  const indicators = document.querySelectorAll('.drop-indicator');
  indicators.forEach((indicator) => {
    indicator.remove();
  });
}

