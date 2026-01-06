export function createTranslationHintModal(): {
  element: HTMLElement;
  show: (translation: string) => void;
  hide: () => void;
  updateTranslation: (translation: string | null) => void;
} {
  const modal = document.createElement('div');
  modal.className = 'translation-hint-modal';
  modal.setAttribute('role', 'tooltip');
  modal.setAttribute('aria-hidden', 'true');

  const content = document.createElement('div');
  content.className = 'translation-hint-content';
  modal.appendChild(content);

  const translationText = document.createElement('p');
  translationText.className = 'translation-hint-text';
  content.appendChild(translationText);

  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  function show(translation: string): void {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    translationText.textContent = translation;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('visible');

    setTimeout(() => {
      const headerCenter = modal.parentElement;
      if (headerCenter) {
        const header = headerCenter.parentElement;
        if (header) {
          const headerRect = header.getBoundingClientRect();
          const centerRect = headerCenter.getBoundingClientRect();
          const modalHeight = modal.offsetHeight || 60;
          const topPosition = headerRect.top - modalHeight - 8;
          const centerX = centerRect.left + centerRect.width / 2;

          modal.style.top = `${Math.max(8, topPosition)}px`;
          modal.style.left = `${centerX}px`;
          modal.style.transform = 'translateX(-50%) translateY(0)';
        }
      }
    }, 0);
  }

  function hide(): void {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    hideTimeout = setTimeout(() => {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('visible');
      hideTimeout = null;
    }, 150);
  }

  function updateTranslation(translation: string | null): void {
    if (translation) {
      translationText.textContent = translation;
    } else {
      translationText.textContent = '';
    }
  }

  return {
    element: modal,
    show,
    hide,
    updateTranslation,
  };
}
