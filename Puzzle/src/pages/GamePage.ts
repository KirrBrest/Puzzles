import createLogoutButton from '../components/LogoutButton';
import { createConfirmModal, createAlertModal } from '../components/ConfirmModal';
import { clearUserData } from '../utils/storage';
import renderLoginPage from './LoginPage';
import createGameBoard from '../components/GameBoard';
import createSourceCardsArea from '../components/SourceCardsArea';
import createNewGameButton from '../components/NewGameButton';
import createNewRowButton from '../components/NewRowButton';
import { getSentencesForGame, getSentenceWords } from '../utils/levelLoader';
import { WordCardResult } from '../components/WordCard';

function clearContainer(container: HTMLElement): void {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function isValidSentence(sentence: string | undefined): sentence is string {
  return typeof sentence === 'string' && sentence.length > 0;
}

function showErrorMessage(message: string): void {
  const modal = createAlertModal(message, 'OK');
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

function handleCardClick(
  card: WordCardResult,
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>
): void {
  if (card.isUsed) {
    return;
  }

  const currentRow = gameBoard.getCurrentRowIndex();
  gameBoard.addCardToRow(currentRow, card.element);
  sourceArea.removeCard(card);
}

function handlePlacedCardClick(
  cardElement: HTMLElement,
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>
): void {
  const currentRow = gameBoard.getCurrentRowIndex();
  const originalCardId = cardElement.getAttribute('data-original-card-id');
  if (!originalCardId) {
    return;
  }

  const card = sourceArea.cards.find((c) => {
    const cardId = c.element.getAttribute('data-card-id');
    return cardId === originalCardId;
  });

  if (card) {
    gameBoard.removeCardFromRow(currentRow, cardElement);
    sourceArea.addCardAtEnd(card);
  }
}

function setupCardClickHandlers(
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>
): void {
  const clickHandler = (e: Event): void => {
    const { target } = e;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    let cardElement: HTMLElement | null = target;
    while (cardElement && !cardElement.classList.contains('word-card')) {
      cardElement = cardElement.parentElement;
    }

    if (!cardElement) {
      return;
    }

    const card = sourceArea.cards.find((c) => c.element === cardElement);
    if (card && !card.isUsed) {
      handleCardClick(card, sourceArea, gameBoard);
    }
  };

  sourceArea.container.removeEventListener('click', clickHandler);
  sourceArea.container.addEventListener('click', clickHandler);
}

function setupPlacedCardClickHandlers(
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>
): void {
  const currentRow = gameBoard.getCurrentRowIndex();
  gameBoard.setupRowClickHandler(currentRow, (cardElement) => {
    handlePlacedCardClick(cardElement, sourceArea, gameBoard);
  });
}

function startNewRound(
  sentence: string,
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>
): void {
  const words = getSentenceWords(sentence);
  const currentRow = gameBoard.getCurrentRowIndex();
  gameBoard.setRowSentence(currentRow, words);
  sourceArea.reset(words);
  setupCardClickHandlers(sourceArea, gameBoard);
  setupPlacedCardClickHandlers(sourceArea, gameBoard);
}

function handleNewGame(
  sentences: string[],
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>
): void {
  gameBoard.clearAllRows();
  gameBoard.setCurrentRowIndex(0);
  const firstSentence = sentences[0];
  if (isValidSentence(firstSentence)) {
    startNewRound(firstSentence, sourceArea, gameBoard);
  }
}

function handleNewRow(
  sentences: string[],
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>
): void {
  const currentRow = gameBoard.getCurrentRowIndex();
  if (currentRow >= 10) {
    const modal = createAlertModal('Congratulations! You completed all rounds!', 'OK');
    modal.show().then(() => {
      handleNewGame(sentences, sourceArea, gameBoard);
    });
    return;
  }

  const nextRow = currentRow + 1;
  if (nextRow < sentences.length) {
    const sentence = sentences[nextRow];
    if (isValidSentence(sentence)) {
      gameBoard.setCurrentRowIndex(nextRow);
      startNewRound(sentence, sourceArea, gameBoard);
    }
  } else {
    const modal = createAlertModal('Congratulations! You completed all rounds!', 'OK');
    modal.show().then(() => {
      handleNewGame(sentences, sourceArea, gameBoard);
    });
  }
}

export default function renderGamePage(container: HTMLElement): void {
  clearContainer(container);

  let sentences: string[] = [];
  try {
    sentences = getSentencesForGame();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load game data';
    showErrorMessage(errorMessage);
    return;
  }

  const gamePage = document.createElement('div');
  gamePage.className = 'game-page';

  const header = document.createElement('header');
  header.className = 'game-header';

  const logo = document.createElement('img');
  logo.src = '/favicon.svg';
  logo.alt = 'RSS Puzzle Logo';
  logo.className = 'game-logo';
  header.appendChild(logo);

  const title = document.createElement('h1');
  title.className = 'game-title';
  title.textContent = 'English Puzzle';
  header.appendChild(title);

  const logoutButton = createLogoutButton();
  logoutButton.addEventListener('click', () => {
    handleLogout(container);
  });
  header.appendChild(logoutButton);

  gamePage.appendChild(header);

  const gameContent = document.createElement('div');
  gameContent.className = 'game-content';

  const gameBoard = createGameBoard();
  gameContent.appendChild(gameBoard.container);

  const sourceArea = createSourceCardsArea([]);
  gameContent.appendChild(sourceArea.container);

  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'game-controls';

  const newGameButton = createNewGameButton();
  newGameButton.addEventListener('click', () => {
    handleNewGame(sentences, sourceArea, gameBoard);
  });
  controlsContainer.appendChild(newGameButton);

  const newRowButton = createNewRowButton();
  newRowButton.addEventListener('click', () => {
    handleNewRow(sentences, sourceArea, gameBoard);
  });
  controlsContainer.appendChild(newRowButton);

  gameContent.appendChild(controlsContainer);

  gamePage.appendChild(gameContent);

  container.appendChild(gamePage);

  const firstSentence = sentences[0];
  if (isValidSentence(firstSentence)) {
    startNewRound(firstSentence, sourceArea, gameBoard);
  }
}
