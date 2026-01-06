export function createTranslationHintModal(): {
  element: HTMLElement;
  setTranslation: (translation: string | null) => void;
  show: () => void;
  hide: () => void;
} {
  const modal = document.createElement('div');
  modal.className = 'translation-hint-modal';
  modal.setAttribute('role', 'status');
  modal.setAttribute('aria-hidden', 'true');

  const content = document.createElement('div');
  content.className = 'translation-hint-content';
  modal.appendChild(content);

  const translationText = document.createElement('p');
  translationText.className = 'translation-hint-text';
  content.appendChild(translationText);

  function setTranslation(translation: string | null): void {
    if (translation) {
      translationText.textContent = translation;
    } else {
      translationText.textContent = '';
    }
  }

  function show(): void {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('visible');
  }

  function hide(): void {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('visible');
  }

  return {
    element: modal,
    setTranslation,
    show,
    hide,
  };
}
