export interface InputFieldResult {
  container: HTMLElement;
  input: HTMLInputElement;
  errorMessage: HTMLElement;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export interface UserData {
  firstName: string;
  surname: string;
}

export interface ConfirmModalResult {
  container: HTMLElement;
  show: () => Promise<boolean>;
}

export interface AlertModalResult {
  container: HTMLElement;
  show: () => Promise<void>;
}

export interface LevelData {
  id: string;
  name: string;
  imageSrc: string;
  cutSrc: string;
  author: string;
  year: string;
}

export interface WordData {
  audioExample: string;
  textExample: string;
  textExampleTranslate: string;
  id: number;
  word: string;
  wordTranslate: string;
}

export interface RoundData {
  levelData: LevelData;
  words: WordData[];
}

export interface LevelCollection {
  rounds: RoundData[];
}
