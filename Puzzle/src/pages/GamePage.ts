import createLogoutButton from '../components/LogoutButton';
import createHintButton from '../components/HintButton';
import { createTranslationHintModal } from '../components/TranslationHintModal';
import { createConfirmModal, createAlertModal } from '../components/ConfirmModal';
import { clearUserData } from '../utils/storage';
import renderLoginPage from './LoginPage';
import createGameBoard from '../components/GameBoard';
import createSourceCardsArea from '../components/SourceCardsArea';
import createNewGameButton from '../components/NewGameButton';
import createCheckButton from '../components/CheckButton';
import createAutoCompleteButton from '../components/AutoCompleteButton';
import {
  getSentencesForGame,
  getSentenceWords,
  getTranslationForSentence,
} from '../utils/levelLoader';
import { createAudioHintManager } from '../utils/audioHintManager';
import { WordCardResult } from '../components/WordCard';
import { isSentenceComplete, validateSentence } from '../utils/sentenceValidator';
import { clearAllHighlights, highlightCardsByValidation } from '../utils/cardHighlighter';
import { autoCompleteSentence } from '../utils/autoComplete';
import { setupDragAndDrop } from '../utils/dragDropHandler';
import { setupTouchHandlers } from '../utils/touchHandler';
import calculateCardWidths from '../utils/cardWidthCalculator';

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
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  checkButton: HTMLButtonElement,
  autoCompleteButton: HTMLButtonElement
): void {
  if (card.isUsed) {
    return;
  }

  const currentRow = gameBoard.getCurrentRowIndex();
  gameBoard.addCardToRow(currentRow, card.element);
  sourceArea.removeCard(card);

  const currentSentence = getCurrentSentence();
  if (isValidSentence(currentSentence)) {
    const rowCards = gameBoard.getRowCards(currentRow);
    checkButton.disabled = !isSentenceComplete(currentSentence, rowCards);
    clearAllHighlights(rowCards);
    switchToCheckMode(checkButton);
    updateAutoCompleteButtonState(currentSentence, gameBoard, autoCompleteButton);
  } else {
    checkButton.disabled = true;
    autoCompleteButton.disabled = true;
  }
}

function handlePlacedCardClick(
  cardElement: HTMLElement,
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  checkButton: HTMLButtonElement,
  autoCompleteButton: HTMLButtonElement
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
      const rowCards = gameBoard.getRowCards(currentRow);
      checkButton.disabled = !isSentenceComplete(currentSentence, rowCards);
      clearAllHighlights(rowCards);
      switchToCheckMode(checkButton);
      updateAutoCompleteButtonState(currentSentence, gameBoard, autoCompleteButton);
    } else {
      checkButton.disabled = true;
      autoCompleteButton.disabled = true;
    }
  }
}

function setupCardClickHandlers(
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  checkButton: HTMLButtonElement,
  autoCompleteButton: HTMLButtonElement
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
      handleCardClick(
        card,
        sourceArea,
        gameBoard,
        getCurrentSentence,
        checkButton,
        autoCompleteButton
      );
    }
  };

  sourceArea.container.removeEventListener('click', clickHandler);
  sourceArea.container.addEventListener('click', clickHandler);
}

function setupPlacedCardClickHandlers(
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  checkButton: HTMLButtonElement,
  autoCompleteButton: HTMLButtonElement
): void {
  const currentRow = gameBoard.getCurrentRowIndex();
  gameBoard.setupRowClickHandler(currentRow, (cardElement) => {
    handlePlacedCardClick(
      cardElement,
      sourceArea,
      gameBoard,
      getCurrentSentence,
      checkButton,
      autoCompleteButton
    );
  });
}

function switchToCheckMode(button: HTMLButtonElement): void {
  button.textContent = 'Check';
}

function switchToContinueMode(button: HTMLButtonElement): void {
  button.textContent = 'Continue';
}

function handleCheck(
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  checkButton: HTMLButtonElement,
  translationHintModal?: ReturnType<typeof createTranslationHintModal>
): void {
  const currentSentence = getCurrentSentence();
  if (!isValidSentence(currentSentence)) {
    return;
  }

  const currentRow = gameBoard.getCurrentRowIndex();
  const rowCards = gameBoard.getRowCards(currentRow);
  const validationResults = validateSentence(currentSentence, rowCards);
  highlightCardsByValidation(rowCards, validationResults);

  const isCorrect = validationResults.every((result) => result.isCorrect);
  if (isCorrect) {
    switchToContinueMode(checkButton);
    if (translationHintModal) {
      const translation = getTranslationForSentence(currentSentence);
      if (translation) {
        translationHintModal.setTranslation(translation);
        translationHintModal.show();
      }
    }
  }
}

function handleAutoComplete(
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  checkButton: HTMLButtonElement,
  autoCompleteButton: HTMLButtonElement
): void {
  const currentSentence = getCurrentSentence();
  if (!isValidSentence(currentSentence)) {
    return;
  }

  const currentRow = gameBoard.getCurrentRowIndex();
  const rowCards = gameBoard.getRowCards(currentRow);
  const correctWords = getSentenceWords(currentSentence);
  const isComplete = rowCards.length === correctWords.length;

  const validationResults = validateSentence(currentSentence, rowCards);
  const isCorrect = validationResults.every((result) => result.isCorrect);

  if (isComplete && isCorrect) {
    return;
  }

  autoCompleteButton.disabled = true;
  autoCompleteSentence(currentSentence, sourceArea, gameBoard).then(() => {
    const newRowCards = gameBoard.getRowCards(currentRow);
    const newValidationResults = validateSentence(currentSentence, newRowCards);
    highlightCardsByValidation(newRowCards, newValidationResults);

    const newIsCorrect = newValidationResults.every((result) => result.isCorrect);
    const newIsComplete = newRowCards.length === correctWords.length;

    if (newIsComplete) {
      checkButton.disabled = false;
      if (newIsCorrect) {
        switchToContinueMode(checkButton);
      } else {
        switchToCheckMode(checkButton);
      }
    }

    updateAutoCompleteButtonState(currentSentence, gameBoard, autoCompleteButton);
    autoCompleteButton.disabled = false;
  });
}

function updateAutoCompleteButtonState(
  sentence: string | undefined,
  gameBoard: ReturnType<typeof createGameBoard>,
  autoCompleteButton: HTMLButtonElement
): void {
  if (!isValidSentence(sentence)) {
    autoCompleteButton.disabled = true;
    return;
  }

  const currentRow = gameBoard.getCurrentRowIndex();
  const rowCards = gameBoard.getRowCards(currentRow);
  const correctWords = getSentenceWords(sentence);
  const isComplete = rowCards.length === correctWords.length;

  const validationResults = validateSentence(sentence, rowCards);
  const isCorrect = validationResults.every((result) => result.isCorrect);

  autoCompleteButton.disabled = isComplete && isCorrect;
}

function handleDragDrop(
  target: HTMLElement,
  card: HTMLElement,
  _cardData: WordCardResult,
  insertIndex: number,
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentSentence: () => string | undefined,
  checkButton: HTMLButtonElement,
  autoCompleteButton: HTMLButtonElement
): void {
  const isSourceArea = target.classList.contains('source-cards-area');
  const isRow = target.classList.contains('game-board-row');

  if (isSourceArea) {
    const currentRow = gameBoard.getCurrentRowIndex();
    const rowCards = gameBoard.getRowCards(currentRow);
    const cardId = card.getAttribute('data-card-id');
    const originalCardId = card.getAttribute('data-original-card-id');
    const cardInRow = rowCards.find((c) => {
      const cOriginalCardId = c.getAttribute('data-original-card-id');
      return cOriginalCardId === (originalCardId || cardId);
    });

    if (cardInRow) {
      gameBoard.removeCardFromRow(currentRow, cardInRow);
    }

    const sourceCardId = originalCardId || cardId;
    if (!sourceCardId) {
      return;
    }

    const sourceCard = sourceArea.cards.find((c) => {
      const cCardId = c.element.getAttribute('data-card-id');
      return cCardId === sourceCardId;
    });

    if (sourceCard) {
      sourceCard.isUsed = false;

      const cardElement = sourceCard.element;
      cardElement.classList.remove(
        'word-card-placed',
        'dragging',
        'word-card-start',
        'word-card-middle',
        'word-card-end'
      );
      if (!cardElement.classList.contains('word-card')) {
        cardElement.classList.add('word-card');
      }
      cardElement.removeAttribute('data-original-card-id');
      cardElement.style.opacity = '';
      cardElement.style.transform = '';

      sourceArea.addCardAtEnd(sourceCard);

      setTimeout(() => {
        setupCardClickHandlers(
          sourceArea,
          gameBoard,
          getCurrentSentence,
          checkButton,
          autoCompleteButton
        );
      }, 0);
    }
  } else if (isRow) {
    const rowIndex = parseInt(target.getAttribute('data-row-index') || '0', 10);
    const currentRow = gameBoard.getCurrentRowIndex();

    if (rowIndex !== currentRow) {
      return;
    }

    const isCardFromRow = card.classList.contains('word-card-placed') && card.parentNode === target;

    if (isCardFromRow) {
      const currentIndex = Array.from(target.children)
        .filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && child.classList.contains('word-card-placed')
        )
        .indexOf(card);

      if (currentIndex === -1) {
        return;
      }

      const allCardsCount = Array.from(target.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.classList.contains('word-card-placed')
      ).length;

      let adjustedInsertIndex = insertIndex;
      if (insertIndex > currentIndex) {
        adjustedInsertIndex = insertIndex - 1;
      }

      if (insertIndex >= allCardsCount - 1 && currentIndex !== allCardsCount - 1) {
        adjustedInsertIndex = allCardsCount - 1;
      }

      if (currentIndex !== adjustedInsertIndex && adjustedInsertIndex >= 0) {
        card.classList.remove('dragging');
        card.style.opacity = '';
        card.style.transform = '';
        target.removeChild(card);

        const updatedRowCards = Array.from(target.children).filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement &&
            child.classList.contains('word-card-placed') &&
            !child.classList.contains('drop-indicator')
        );

        if (adjustedInsertIndex >= 0 && adjustedInsertIndex < updatedRowCards.length) {
          const nextCard = updatedRowCards[adjustedInsertIndex];
          if (nextCard) {
            target.insertBefore(card, nextCard);
          } else {
            target.appendChild(card);
          }
        } else if (adjustedInsertIndex >= updatedRowCards.length || insertIndex >= allCardsCount) {
          target.appendChild(card);
        } else if (updatedRowCards.length > 0) {
          const lastCard = updatedRowCards[updatedRowCards.length - 1];
          if (lastCard && lastCard.nextSibling) {
            target.insertBefore(card, lastCard.nextSibling);
          } else {
            target.appendChild(card);
          }
        } else {
          target.appendChild(card);
        }
      }

      setTimeout(() => {
        const currentRow = gameBoard.getCurrentRowIndex();
        const row = gameBoard.rows[currentRow];
        if (row) {
          const cards = gameBoard.getRowCards(currentRow);
          if (cards.length > 0) {
            calculateCardWidths(row);
          }
        }
      }, 0);

      const currentSentence = getCurrentSentence();
      if (isValidSentence(currentSentence)) {
        const currentRow = gameBoard.getCurrentRowIndex();
        const rowCards = gameBoard.getRowCards(currentRow);
        checkButton.disabled = !isSentenceComplete(currentSentence, rowCards);
        clearAllHighlights(rowCards);
        switchToCheckMode(checkButton);
        updateAutoCompleteButtonState(currentSentence, gameBoard, autoCompleteButton);
      }
      return;
    }

    const cardId = card.getAttribute('data-card-id');
    const originalCardId = card.getAttribute('data-original-card-id');
    const rowCards = gameBoard.getRowCards(currentRow);
    const cardInRow = rowCards.find((c) => {
      const cOriginalCardId = c.getAttribute('data-original-card-id');
      return cOriginalCardId === (originalCardId || cardId);
    });

    if (cardInRow && cardInRow.parentNode === target) {
      const existingRowCards = Array.from(target.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.classList.contains('word-card-placed')
      );
      const currentIndex = existingRowCards.indexOf(cardInRow);

      if (currentIndex !== insertIndex) {
        cardInRow.classList.remove('dragging');
        cardInRow.style.opacity = '';
        cardInRow.style.transform = '';
        target.removeChild(cardInRow);

        const updatedRowCards = Array.from(target.children).filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement &&
            child.classList.contains('word-card-placed') &&
            !child.classList.contains('drop-indicator')
        );

        let adjustedInsertIndex = insertIndex;
        if (insertIndex > currentIndex) {
          adjustedInsertIndex = insertIndex - 1;
        }

        if (adjustedInsertIndex >= 0 && adjustedInsertIndex < updatedRowCards.length) {
          const nextCard = updatedRowCards[adjustedInsertIndex];
          if (nextCard && nextCard !== cardInRow) {
            target.insertBefore(cardInRow, nextCard);
          } else {
            target.appendChild(cardInRow);
          }
        } else if (adjustedInsertIndex >= updatedRowCards.length) {
          target.appendChild(cardInRow);
        } else {
          target.appendChild(cardInRow);
        }
      }

      setTimeout(() => {
        const currentRow = gameBoard.getCurrentRowIndex();
        const row = gameBoard.rows[currentRow];
        if (row) {
          const cards = gameBoard.getRowCards(currentRow);
          if (cards.length > 0) {
            calculateCardWidths(row);
          }

          const currentSentence = getCurrentSentence();
          if (isValidSentence(currentSentence)) {
            const rowCards = gameBoard.getRowCards(currentRow);
            checkButton.disabled = !isSentenceComplete(currentSentence, rowCards);
            clearAllHighlights(rowCards);
            switchToCheckMode(checkButton);
            updateAutoCompleteButtonState(currentSentence, gameBoard, autoCompleteButton);
          }
        }
      }, 0);
      return;
    } else {
      if (!cardId) {
        return;
      }

      const sourceCard = sourceArea.cards.find((c) => {
        const cCardId = c.element.getAttribute('data-card-id');
        return cCardId === cardId;
      });

      if (sourceCard) {
        const cardClone = card.cloneNode(true);
        if (cardClone instanceof HTMLElement) {
          cardClone.classList.remove('dragging');
          cardClone.classList.add('word-card-placed');
          const words = getSentenceWords(getCurrentSentence() || '');
          const originalIndex = sourceCard.originalIndex;
          if (originalIndex === 0) {
            cardClone.classList.add('word-card-start');
            cardClone.classList.remove('word-card-middle', 'word-card-end');
          } else if (originalIndex === words.length - 1) {
            cardClone.classList.add('word-card-end');
            cardClone.classList.remove('word-card-start', 'word-card-middle');
          } else {
            cardClone.classList.add('word-card-middle');
            cardClone.classList.remove('word-card-start', 'word-card-end');
          }
          cardClone.setAttribute('data-original-card-id', cardId);
          cardClone.draggable = true;
          cardClone.setAttribute('data-card-data', JSON.stringify(sourceCard));

          const existingRowCards = gameBoard.getRowCards(currentRow);
          if (insertIndex >= 0 && insertIndex < existingRowCards.length) {
            const nextCard = existingRowCards[insertIndex];
            if (nextCard) {
              target.insertBefore(cardClone, nextCard);
            } else {
              target.appendChild(cardClone);
            }
          } else {
            target.appendChild(cardClone);
          }

          sourceArea.removeCard(sourceCard);
        }
      }
    }
  }

  setTimeout(() => {
    const currentRow = gameBoard.getCurrentRowIndex();
    const row = gameBoard.rows[currentRow];
    if (row) {
      const cards = gameBoard.getRowCards(currentRow);
      const currentSentence = getCurrentSentence();
      if (isValidSentence(currentSentence)) {
        const words = getSentenceWords(currentSentence);
        cards.forEach((card) => {
          card.classList.remove('dragging');
          const originalCardId = card.getAttribute('data-original-card-id');
          if (originalCardId) {
            const sourceCard = sourceArea.cards.find((c) => {
              const cardId = c.element.getAttribute('data-card-id');
              return cardId === originalCardId;
            });
            if (sourceCard) {
              const originalIndex = sourceCard.originalIndex;
              card.classList.remove('word-card-start', 'word-card-middle', 'word-card-end');
              if (originalIndex === 0) {
                card.classList.add('word-card-start');
              } else if (originalIndex === words.length - 1) {
                card.classList.add('word-card-end');
              } else {
                card.classList.add('word-card-middle');
              }
            }
          }
        });
      }
      if (cards.length > 0) {
        calculateCardWidths(row);
      }
    }

    const allDraggingCards = document.querySelectorAll(
      '.word-card.dragging, .word-card-placed.dragging'
    );
    allDraggingCards.forEach((card) => {
      card.classList.remove('dragging');
      if (card instanceof HTMLElement) {
        card.style.opacity = '';
        card.style.transform = '';
      }
    });
  }, 0);

  const currentSentence = getCurrentSentence();
  if (isValidSentence(currentSentence)) {
    const currentRow = gameBoard.getCurrentRowIndex();
    const rowCards = gameBoard.getRowCards(currentRow);
    checkButton.disabled = !isSentenceComplete(currentSentence, rowCards);
    clearAllHighlights(rowCards);
    switchToCheckMode(checkButton);
    updateAutoCompleteButtonState(currentSentence, gameBoard, autoCompleteButton);
  }
}

function startNewRound(
  sentence: string,
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  checkButton: HTMLButtonElement,
  autoCompleteButton: HTMLButtonElement,
  getCurrentSentence: () => string | undefined,
  _updateHintTranslation?: () => void
): void {
  const words = getSentenceWords(sentence);
  const currentRow = gameBoard.getCurrentRowIndex();
  gameBoard.setRowSentence(currentRow, words);
  sourceArea.reset(words);
  checkButton.disabled = true;
  switchToCheckMode(checkButton);
  updateAutoCompleteButtonState(sentence, gameBoard, autoCompleteButton);
  const rowCards = gameBoard.getRowCards(currentRow);
  clearAllHighlights(rowCards);
  setupCardClickHandlers(
    sourceArea,
    gameBoard,
    getCurrentSentence,
    checkButton,
    autoCompleteButton
  );
  setupPlacedCardClickHandlers(
    sourceArea,
    gameBoard,
    getCurrentSentence,
    checkButton,
    autoCompleteButton
  );

  setupDragAndDrop(sourceArea.container, gameBoard.container, {
    onCardDragStart: () => {},
    onCardDragEnd: () => {},
    onCardDrop: (target, card, cardData, insertIndex) => {
      handleDragDrop(
        target,
        card,
        cardData,
        insertIndex,
        sourceArea,
        gameBoard,
        getCurrentSentence,
        checkButton,
        autoCompleteButton
      );
    },
  });

  const handleTouchDrop = (target: HTMLElement, card: HTMLElement, cardData: unknown): void => {
    const cardDataObj = typeof cardData === 'string' ? JSON.parse(cardData) : cardData;
    if (cardDataObj && target) {
      const insertIndex = 0;
      handleDragDrop(
        target,
        card,
        cardDataObj as WordCardResult,
        insertIndex,
        sourceArea,
        gameBoard,
        getCurrentSentence,
        checkButton,
        autoCompleteButton
      );
    }
  };

  setupTouchHandlers(
    sourceArea.container,
    () => {},
    () => {},
    handleTouchDrop
  );

  setupTouchHandlers(
    gameBoard.container,
    () => {},
    () => {},
    handleTouchDrop
  );

  if (_updateHintTranslation) {
    _updateHintTranslation();
  }
}

function handleNewGame(
  sentences: string[],
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  checkButton: HTMLButtonElement,
  autoCompleteButton: HTMLButtonElement,
  getCurrentSentence: () => string | undefined,
  updateHintTranslation?: () => void
): void {
  gameBoard.clearAllRows();
  gameBoard.setCurrentRowIndex(0);
  checkButton.disabled = true;
  switchToCheckMode(checkButton);
  const firstSentence = sentences[0];
  if (isValidSentence(firstSentence)) {
    updateAutoCompleteButtonState(firstSentence, gameBoard, autoCompleteButton);
    startNewRound(
      firstSentence,
      sourceArea,
      gameBoard,
      checkButton,
      autoCompleteButton,
      getCurrentSentence,
      updateHintTranslation
    );
  } else {
    autoCompleteButton.disabled = true;
  }

  if (updateHintTranslation) {
    updateHintTranslation();
  }
}

function handleContinue(
  sentences: string[],
  sourceArea: ReturnType<typeof createSourceCardsArea>,
  gameBoard: ReturnType<typeof createGameBoard>,
  getCurrentRoundIndex: () => number,
  setCurrentRoundIndex: (_index: number) => void,
  checkButton: HTMLButtonElement,
  autoCompleteButton: HTMLButtonElement,
  getCurrentSentence: () => string | undefined,
  updateHintTranslation?: () => void
): void {
  const currentRow = gameBoard.getCurrentRowIndex();
  const currentRound = getCurrentRoundIndex();
  const currentSentence = sentences[currentRound];

  if (!isValidSentence(currentSentence)) {
    return;
  }

  const words = getSentenceWords(currentSentence);
  const rowCards = gameBoard.getRowCards(currentRow);
  const isRowComplete = rowCards.length === words.length;

  if (isRowComplete) {
    const nextRow = currentRow + 1;
    if (nextRow >= 10) {
      const modal = createAlertModal('Congratulations! You completed all rounds!', 'OK');
      modal.show().then(() => {
        setCurrentRoundIndex(0);
        handleNewGame(
          sentences,
          sourceArea,
          gameBoard,
          checkButton,
          autoCompleteButton,
          getCurrentSentence,
          updateHintTranslation
        );
      });
      return;
    }

    const nextRound = currentRound + 1;
    if (nextRound >= sentences.length) {
      const modal = createAlertModal('Congratulations! You completed all rounds!', 'OK');
      modal.show().then(() => {
        setCurrentRoundIndex(0);
        handleNewGame(
          sentences,
          sourceArea,
          gameBoard,
          checkButton,
          autoCompleteButton,
          getCurrentSentence,
          updateHintTranslation
        );
      });
      return;
    }

    const sentence = sentences[nextRound];
    if (isValidSentence(sentence)) {
      gameBoard.setCurrentRowIndex(nextRow);
      setCurrentRoundIndex(nextRound);
      startNewRound(
        sentence,
        sourceArea,
        gameBoard,
        checkButton,
        autoCompleteButton,
        getCurrentSentence,
        updateHintTranslation
      );
    }
    return;
  }

  const rowCardsToReturn = gameBoard.getRowCards(currentRow);
  rowCardsToReturn.forEach((cardElement) => {
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
      handleNewGame(
        sentences,
        sourceArea,
        gameBoard,
        checkButton,
        autoCompleteButton,
        getCurrentSentence,
        updateHintTranslation
      );
    });
    return;
  }

  const sentence = sentences[nextRound];
  if (isValidSentence(sentence)) {
    setCurrentRoundIndex(nextRound);
    startNewRound(
      sentence,
      sourceArea,
      gameBoard,
      checkButton,
      autoCompleteButton,
      getCurrentSentence,
      updateHintTranslation
    );
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

  const headerLeft = document.createElement('div');
  headerLeft.className = 'game-header-left';

  const logo = document.createElement('img');
  logo.src = '/favicon.svg';
  logo.alt = 'RSS Puzzle Logo';
  logo.className = 'game-logo';
  headerLeft.appendChild(logo);

  const title = document.createElement('h1');
  title.className = 'game-title';
  title.textContent = 'English Puzzle';
  headerLeft.appendChild(title);

  header.appendChild(headerLeft);

  const headerCenter = document.createElement('div');
  headerCenter.className = 'game-header-center';

  const translationHintModal = createTranslationHintModal();
  header.appendChild(headerCenter);
  headerCenter.appendChild(translationHintModal.element);

  const headerRight = document.createElement('div');
  headerRight.className = 'game-header-right';

  const hintButton = createHintButton();
  let isHintEnabled = false;

  const updateHintTranslation = (): void => {
    const currentSentence = getCurrentSentence();
    if (currentSentence) {
      const translation = getTranslationForSentence(currentSentence);
      translationHintModal.setTranslation(translation);
      if (isHintEnabled) {
        translationHintModal.show();
      } else {
        translationHintModal.hide();
      }
    } else {
      translationHintModal.setTranslation(null);
      translationHintModal.hide();
    }
  };

  hintButton.element.addEventListener('click', () => {
    hintButton.toggle();
    isHintEnabled = hintButton.isEnabled();
    updateHintTranslation();
  });

  headerRight.appendChild(hintButton.element);

  const logoutButton = createLogoutButton();
  logoutButton.addEventListener('click', () => {
    handleLogout(container);
  });
  headerRight.appendChild(logoutButton);

  header.appendChild(headerRight);

  gamePage.appendChild(header);

  const gameContent = document.createElement('div');
  gameContent.className = 'game-content';

  const gameBoard = createGameBoard();
  gameContent.appendChild(gameBoard.container);

  const sourceArea = createSourceCardsArea([]);
  gameContent.appendChild(sourceArea.container);

  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'game-controls';

  const controlsLeft = document.createElement('div');
  controlsLeft.className = 'game-controls-left';

  const checkButton = createCheckButton();
  const autoCompleteButton = createAutoCompleteButton();

  const getCurrentSentence = (): string | undefined => {
    return sentences[currentRoundIndex];
  };

  const audioHintManager = createAudioHintManager(getCurrentSentence);
  headerRight.appendChild(audioHintManager.element);

  const newGameButton = createNewGameButton();
  newGameButton.addEventListener('click', () => {
    currentRoundIndex = 0;
    handleNewGame(
      sentences,
      sourceArea,
      gameBoard,
      checkButton,
      autoCompleteButton,
      getCurrentSentence,
      updateHintTranslation
    );
  });
  controlsLeft.appendChild(newGameButton);

  const handleCheckClick = (): void => {
    handleCheck(
      gameBoard,
      getCurrentSentence,
      checkButton,
      !isHintEnabled ? translationHintModal : undefined
    );
    const currentSentence = getCurrentSentence();
    if (isValidSentence(currentSentence)) {
      updateAutoCompleteButtonState(currentSentence, gameBoard, autoCompleteButton);
    }
  };

  const handleContinueClick = (): void => {
    if (!isHintEnabled) {
      translationHintModal.hide();
    }
    handleContinue(
      sentences,
      sourceArea,
      gameBoard,
      () => currentRoundIndex,
      (index) => {
        currentRoundIndex = index;
      },
      checkButton,
      autoCompleteButton,
      getCurrentSentence,
      updateHintTranslation
    );
    switchToCheckMode(checkButton);
  };

  checkButton.addEventListener('click', () => {
    if (checkButton.textContent === 'Check') {
      handleCheckClick();
    } else {
      handleContinueClick();
    }
  });
  controlsLeft.appendChild(checkButton);

  controlsContainer.appendChild(controlsLeft);

  autoCompleteButton.addEventListener('click', () => {
    handleAutoComplete(sourceArea, gameBoard, getCurrentSentence, checkButton, autoCompleteButton);
  });
  controlsContainer.appendChild(autoCompleteButton);

  gameContent.appendChild(controlsContainer);

  gamePage.appendChild(gameContent);

  container.appendChild(gamePage);

  const firstSentence = sentences[0];
  if (isValidSentence(firstSentence)) {
    updateHintTranslation();
    startNewRound(
      firstSentence,
      sourceArea,
      gameBoard,
      checkButton,
      autoCompleteButton,
      getCurrentSentence,
      updateHintTranslation
    );
  }
}
