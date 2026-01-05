import './styles.css';
import './styles/login.css';
import renderLoginPage from './pages/LoginPage';

function initApp(): void {
  const appElement = document.getElementById('app');

  if (!appElement || !(appElement instanceof HTMLElement)) {
    throw new Error('Element with id "app" not found');
  }

  renderLoginPage(appElement);
}

initApp();
