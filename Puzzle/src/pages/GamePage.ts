import createLogoutButton from '../components/LogoutButton';
import createConfirmModal from '../components/ConfirmModal';
import { clearUserData } from '../utils/storage';
import renderLoginPage from './LoginPage';

function clearContainer(container: HTMLElement): void {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function showErrorMessage(message: string): void {
  const modal = createConfirmModal(message, 'OK');
  modal.show();
}

function handleLogout(container: HTMLElement): void {
  const confirmModal = createConfirmModal('Are you sure you want to logout?', 'Logout', 'Cancel');

  confirmModal.show().then((confirmed) => {
    if (confirmed) {
      try {
        clearUserData();
        renderLoginPage(container);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
        showErrorMessage(errorMessage);
      }
    }
  });
}

export default function renderGamePage(container: HTMLElement): void {
  clearContainer(container);

  const gamePage = document.createElement('div');
  gamePage.className = 'game-page';

  const header = document.createElement('header');
  header.className = 'game-header';

  const title = document.createElement('h1');
  title.className = 'game-title';
  title.textContent = 'Puzzle Game';
  header.appendChild(title);

  const logoutButton = createLogoutButton();
  logoutButton.addEventListener('click', () => {
    handleLogout(container);
  });
  header.appendChild(logoutButton);

  gamePage.appendChild(header);

  const gameContent = document.createElement('div');
  gameContent.className = 'game-content';
  gameContent.textContent = 'Game content will be here';
  gamePage.appendChild(gameContent);

  container.appendChild(gamePage);
}
