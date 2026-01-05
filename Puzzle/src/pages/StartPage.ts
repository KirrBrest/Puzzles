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

export default function renderStartPage(container: HTMLElement): void {
  clearContainer(container);

  const startPage = document.createElement('div');
  startPage.className = 'start-page';

  const content = document.createElement('div');
  content.className = 'start-content';

  const header = document.createElement('div');
  header.className = 'start-header';

  const logo = document.createElement('img');
  logo.src = '/favicon.svg';
  logo.alt = 'RSS Puzzle Logo';
  logo.className = 'start-logo';
  header.appendChild(logo);

  const title = document.createElement('h1');
  title.className = 'start-title';
  title.textContent = 'ENGLISH PUZZLE';
  header.appendChild(title);

  content.appendChild(header);

  const description = document.createElement('p');
  description.className = 'start-description';
  description.textContent =
    'RSS Puzzle is an interactive mini-game aimed at enhancing English language skills. Players assemble sentences from jumbled words. The game integrates various levels of difficulty, hint options, and a unique puzzle-like experience with artwork.';
  content.appendChild(description);

  const logoutButton = createLogoutButton();
  logoutButton.addEventListener('click', () => {
    handleLogout(container);
  });
  content.appendChild(logoutButton);

  startPage.appendChild(content);
  container.appendChild(startPage);
}
