export default function createNewGameButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'new-game-button';
  button.textContent = 'New Game';

  return button;
}
