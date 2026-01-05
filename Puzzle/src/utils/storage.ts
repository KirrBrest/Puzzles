import { UserData } from '../types';

const STORAGE_KEY = 'puzzle_user_data';

function isUserData(value: unknown): value is UserData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('firstName' in value) || !('surname' in value)) {
    return false;
  }

  const valueObj: Record<string, unknown> = {};
  Object.keys(value).forEach((key) => {
    const val = (value as Record<string, unknown>)[key];
    valueObj[key] = val;
  });

  return (
    typeof valueObj.firstName === 'string' &&
    typeof valueObj.surname === 'string' &&
    valueObj.firstName.length > 0 &&
    valueObj.surname.length > 0
  );
}

export function saveUserData(userData: UserData): void {
  try {
    const jsonData = JSON.stringify(userData);
    localStorage.setItem(STORAGE_KEY, jsonData);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save user data: ${error.message}`);
    }
    throw new Error('Failed to save user data: Unknown error');
  }
}

export function getUserData(): UserData | null {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return null;
    }

    const parsed = JSON.parse(storedData);

    if (isUserData(parsed)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function clearUserData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to clear user data: ${error.message}`);
    }
    throw new Error('Failed to clear user data: Unknown error');
  }
}
