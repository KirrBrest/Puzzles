import createLogoutButton from '../components/LogoutButton';
import { createConfirmModal, createAlertModal } from '../components/ConfirmModal';
import { clearUserData } from '../utils/storage';
import renderLoginPage from './LoginPage';
import createGameBoard from '../components/GameBoard';
import createSourceCardsArea from '../components/SourceCardsArea';
import createNewGameButton from '../components/NewGameButton';
import createContinueButton from '../components/ContinueButton';
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

function isSentenceCorrect(
  sentence: string,
  gameBoard: ReturnType<typeof createGameBoard>
): boolean {
  const words = getSentenceWords(sentence);
  const currentRow = gameBoard.getCurrentRowIndex();
  const rowCards = gameBoard.getRowCards(currentRow);

  if (rowCards.length !== words.length) {
    return false;
  }

  const cardWords = rowCards.map((card) => card.textContent?.trim() || '');
  return cardWords.every((word, index) => word === words[index]);
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
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  continueButton: HTMLButtonElement
): void {
  if (card.isUsed) {
    return;
  }

  const currentRow = gameBoard.getCurrentRowIndex();
  gameBoard.addCardToRow(currentRow, card.element);
  sourceArea.removeCard(card);

  const currentSentence = getCurrentSentence();
  if (isValidSentence(currentSentence)) {
    continueButton.disabled = !isSentenceCorrect(currentSentence, gameBoard);
  } else {
    continueButton.disabled = true;
  }
}

function handlePlacedCardClick(
  cardElement: HTMLElement,
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  continueButton: HTMLButtonElement
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

    const currentSentence = getCurrentSentence();
    if (isValidSentence(currentSentence)) {
      continueButton.disabled = !isSentenceCorrect(currentSentence, gameBoard);
    } else {
      continueButton.disabled = true;
    }
  }
}

function setupCardClickHandlers(
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  continueButton: HTMLButtonElement
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
      handleCardClick(card, sourceArea, gameBoard, getCurrentSentence, continueButton);
    }
  };

  sourceArea.container.removeEventListener('click', clickHandler);
  sourceArea.container.addEventListener('click', clickHandler);
}

function setupPlacedCardClickHandlers(
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  continueButton: HTMLButtonElement
): void {
  const currentRow = gameBoard.getCurrentRowIndex();
  gameBoard.setupRowClickHandler(currentRow, (cardElement) => {
    handlePlacedCardClick(cardElement, sourceArea, gameBoard, getCurrentSentence, continueButton);
  });
}

function startNewRound(
  sentence: string,
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  continueButton: HTMLButtonElement,
  getCurrentSentence: () => string | undefined
): void {
  const words = getSentenceWords(sentence);
  const currentRow = gameBoard.getCurrentRowIndex();
  gameBoard.setRowSentence(currentRow, words);
  sourceArea.reset(words);
  continueButton.disabled = true;
  setupCardClickHandlers(sourceArea, gameBoard, getCurrentSentence, continueButton);
  setupPlacedCardClickHandlers(sourceArea, gameBoard, getCurrentSentence, continueButton);
}

function handleNewGame(
  sentences: string[],
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  continueButton: HTMLButtonElement,
  getCurrentSentence: () => string | undefined
): void {
  gameBoard.clearAllRows();
  gameBoard.setCurrentRowIndex(0);
  continueButton.disabled = true;
  const firstSentence = sentences[0];
  if (isValidSentence(firstSentence)) {
    startNewRound(firstSentence, sourceArea, gameBoard, continueButton, getCurrentSentence);
  }
}

function handleContinue(
  sentences: string[],
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentRoundIndex: () => number,
  setCurrentRoundIndex: (_index: number) => void,
  continueButton: HTMLButtonElement,
  getCurrentSentence: () => string | undefined
): void {
  const currentRow = gameBoard.getCurrentRowIndex();
  const currentRound = getCurrentRoundIndex();
  const currentSentence = sentences[currentRound];

  if (!isValidSentence(currentSentence) || !isSentenceCorrect(currentSentence, gameBoard)) {
    return;
  }

  if (isValidSentence(currentSentence)) {
    const words = getSentenceWords(currentSentence);
    const rowCards = gameBoard.getRowCards(currentRow);
    const isRowComplete = rowCards.length === words.length;

    if (isRowComplete) {
      const nextRow = currentRow + 1;
      if (nextRow >= 10) {
        const modal = createAlertModal('Congratulations! You completed all rounds!', 'OK');
        modal.show().then(() => {
          setCurrentRoundIndex(0);
          handleNewGame(sentences, sourceArea, gameBoard, continueButton, getCurrentSentence);
        });
        return;
      }

      const nextRound = currentRound + 1;
      if (nextRound >= sentences.length) {
        const modal = createAlertModal('Congratulations! You completed all rounds!', 'OK');
        modal.show().then(() => {
          setCurrentRoundIndex(0);
          handleNewGame(sentences, sourceArea, gameBoard, continueButton, getCurrentSentence);
        });
        return;
      }

      const sentence = sentences[nextRound];
      if (isValidSentence(sentence)) {
        gameBoard.setCurrentRowIndex(nextRow);
        setCurrentRoundIndex(nextRound);
        startNewRound(sentence, sourceArea, gameBoard, continueButton, getCurrentSentence);
      }
      return;
    }
  }

  const rowCards = gameBoard.getRowCards(currentRow);
  rowCards.forEach((cardElement) => {
    const originalCardId = cardElement.getAttribute('data-original-card-id');
    if (originalCardId) {
      const card = sourceArea.cards.find((c) => {
        const cardId = c.element.getAttribute('data-card-id');
        return cardId === originalCardId;
      });
      if (card) {
        gameBoard.removeCardFromRow(currentRow, cardElement);
        sourceArea.addCardAtEnd(card);
      }
    }
  });

  gameBoard.clearRow(currentRow);

  const nextRound = currentRound + 1;
  if (nextRound >= sentences.length) {
    const modal = createAlertModal('Congratulations! You completed all rounds!', 'OK');
    modal.show().then(() => {
      setCurrentRoundIndex(0);
      handleNewGame(sentences, sourceArea, gameBoard, continueButton, getCurrentSentence);
    });
    return;
  }

  const sentence = sentences[nextRound];
  if (isValidSentence(sentence)) {
    setCurrentRoundIndex(nextRound);
    startNewRound(sentence, sourceArea, gameBoard, continueButton, getCurrentSentence);
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

  let currentRoundIndex = 0;

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

  const continueButton = createContinueButton();

  const getCurrentSentence = (): string | undefined => {
    return sentences[currentRoundIndex];
  };

  const newGameButton = createNewGameButton();
  newGameButton.addEventListener('click', () => {
    currentRoundIndex = 0;
    handleNewGame(sentences, sourceArea, gameBoard, continueButton, getCurrentSentence);
  });
  controlsContainer.appendChild(newGameButton);

  continueButton.addEventListener('click', () => {
    handleContinue(
      sentences,
      sourceArea,
      gameBoard,
      () => currentRoundIndex,
      (index) => {
        currentRoundIndex = index;
      },
      continueButton,
      getCurrentSentence
    );
  });
  controlsContainer.appendChild(continueButton);

  gameContent.appendChild(controlsContainer);

  gamePage.appendChild(gameContent);

  container.appendChild(gamePage);

  const firstSentence = sentences[0];
  if (isValidSentence(firstSentence)) {
    startNewRound(firstSentence, sourceArea, gameBoard, continueButton, getCurrentSentence);
  }
}
