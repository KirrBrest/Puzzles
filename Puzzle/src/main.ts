import './styles.css';

const appElement = document.getElementById('app');

if (!appElement || !(appElement instanceof HTMLDivElement)) {
  throw new Error('Element with id "app" not found or is not a div');
}

const app: HTMLDivElement = appElement;

const container = document.createElement('div');

const heading = document.createElement('h1');
heading.textContent = 'Puzzle Project';
container.appendChild(heading);

const paragraph = document.createElement('p');
paragraph.textContent = 'Body of the future puzzle game';
container.appendChild(paragraph);

app.appendChild(container);
