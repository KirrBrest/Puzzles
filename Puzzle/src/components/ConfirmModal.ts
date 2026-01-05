import { ConfirmModalResult, AlertModalResult } from '../types';

export function createConfirmModal(
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

export function createAlertModal(
  message: string,
  buttonText: string = 'Continue'
): AlertModalResult {
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

  const continueButton = document.createElement('button');
  continueButton.type = 'button';
  continueButton.className = 'modal-button modal-button-confirm';
  continueButton.textContent = buttonText;

  modalButtons.appendChild(continueButton);
  modalContent.appendChild(modalButtons);

  modal.appendChild(modalContent);
  modalOverlay.appendChild(modal);

  const show = (): Promise<void> =>
    new Promise((resolve) => {
      document.body.appendChild(modalOverlay);

      let isResolved = false;
      let cleanup: () => void;

      function handleContinue(): void {
        if (isResolved) return;
        isResolved = true;
        cleanup();
        resolve();
      }

      function handleOverlayClick(e: MouseEvent): void {
        if (e.target === modalOverlay) {
          handleContinue();
        }
      }

      function handleEscape(e: KeyboardEvent): void {
        if (e.key === 'Escape') {
          handleContinue();
        }
      }

      cleanup = (): void => {
        document.body.removeChild(modalOverlay);
        continueButton.removeEventListener('click', handleContinue);
        modalOverlay.removeEventListener('click', handleOverlayClick);
        document.removeEventListener('keydown', handleEscape);
      };

      continueButton.addEventListener('click', handleContinue);
      modalOverlay.addEventListener('click', handleOverlayClick);
      document.addEventListener('keydown', handleEscape);
    });

  return { container: modalOverlay, show };
}
