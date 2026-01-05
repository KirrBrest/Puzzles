import './styles.css';
import './styles/login.css';
import './styles/game.css';
import './styles/modal.css';
import renderLoginPage from './pages/LoginPage';
import renderGamePage from './pages/GamePage';
import isUserLoggedIn from './utils/auth';

function initApp(): void {
  const appElement = document.getElementById('app');

  if (!appElement || !(appElement instanceof HTMLElement)) {
    throw new Error('Element with id "app" not found');
  }

  if (isUserLoggedIn()) {
    renderGamePage(appElement);
  } else {
    renderLoginPage(appElement);
  }
}

initApp();
