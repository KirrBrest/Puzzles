import createLoginForm from '../components/LoginForm';

function clearContainer(container: HTMLElement): void {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

export default function renderLoginPage(container: HTMLElement): void {
  clearContainer(container);

  const loginPage = document.createElement('div');
  loginPage.className = 'login-page';

  const title = document.createElement('h1');
  title.className = 'login-title';
  title.textContent = 'English Puzzle';
  loginPage.appendChild(title);

  const formContainer = createLoginForm(container);
  loginPage.appendChild(formContainer);

  container.appendChild(loginPage);
}
