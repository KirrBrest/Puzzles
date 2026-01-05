import level1Data from '../levels/wordCollectionLevel1.json';
import { LevelCollection } from '../types';

const MAX_ROUNDS = 10;

function isLevelCollection(data: unknown): data is LevelCollection {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.rounds);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    const swap = shuffled[j];
    if (temp !== undefined && swap !== undefined) {
      shuffled[i] = swap;
      shuffled[j] = temp;
    }
  }
  return shuffled;
}

interface SentenceWithId {
  id: number;
  text: string;
}

function getUniqueSentencesWithIds(levelData: LevelCollection): SentenceWithId[] {
  const sentencesMap = new Map<number, string>();

  levelData.rounds.forEach((round) => {
    round.words.forEach((word) => {
      if (word.textExample && word.textExample.trim() && word.id) {
        if (!sentencesMap.has(word.id)) {
          sentencesMap.set(word.id, word.textExample.trim());
        }
      }
    });
  });

  return Array.from(sentencesMap.entries()).map(([id, text]) => ({ id, text }));
}

export function loadLevelData(): LevelCollection {
  if (!isLevelCollection(level1Data)) {
    throw new Error('Invalid level data format');
  }
  return level1Data;
}

export function getSentencesForGame(): string[] {
  const levelData = loadLevelData();
  const sentencesWithIds = getUniqueSentencesWithIds(levelData);

  if (sentencesWithIds.length === 0) {
    throw new Error('No sentences found in level data');
  }

  const shuffledSentences = shuffleArray([...sentencesWithIds]);
  const selectedSentences = shuffledSentences.slice(0, MAX_ROUNDS);

  return selectedSentences.map((sentence) => sentence.text);
}

export function getSentenceWords(sentence: string): string[] {
  return sentence.split(/\s+/).filter((word) => word.length > 0);
}
