export interface ConfirmModalResult {
  container: HTMLElement;
  show: () => Promise<boolean>;
}

export default function createConfirmModal(
  message: string,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
): ConfirmModalResult {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const modalMessage = document.createElement('p');
  modalMessage.className = 'modal-message';
  modalMessage.textContent = message;
  modalContent.appendChild(modalMessage);

  const modalButtons = document.createElement('div');
  modalButtons.className = 'modal-buttons';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'modal-button modal-button-cancel';
  cancelButton.textContent = cancelText;

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'modal-button modal-button-confirm';
  confirmButton.textContent = confirmText;

  modalButtons.appendChild(cancelButton);
  modalButtons.appendChild(confirmButton);
  modalContent.appendChild(modalButtons);

  modal.appendChild(modalContent);
  modalOverlay.appendChild(modal);

  const show = (): Promise<boolean> =>
    new Promise((resolve) => {
      document.body.appendChild(modalOverlay);

      let isResolved = false;

      let cleanup: () => void;

      const handleConfirm = (): void => {
        if (isResolved) return;
        isResolved = true;
        cleanup();
        resolve(true);
      };

      const handleCancel = (): void => {
        if (isResolved) return;
        isResolved = true;
        cleanup();
        resolve(false);
      };

      const handleOverlayClick = (e: MouseEvent): void => {
        if (e.target === modalOverlay) {
          handleCancel();
        }
      };

      const handleEscape = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
          handleCancel();
        }
      };

      cleanup = (): void => {
        document.body.removeChild(modalOverlay);
        confirmButton.removeEventListener('click', handleConfirm);
        cancelButton.removeEventListener('click', handleCancel);
        modalOverlay.removeEventListener('click', handleOverlayClick);
        document.removeEventListener('keydown', handleEscape);
      };

      confirmButton.addEventListener('click', handleConfirm);
      cancelButton.addEventListener('click', handleCancel);
      modalOverlay.addEventListener('click', handleOverlayClick);
      document.addEventListener('keydown', handleEscape);
    });

  return { container: modalOverlay, show };
}
