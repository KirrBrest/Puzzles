import { getUserData } from './storage';

export default function isUserLoggedIn(): boolean {
  const userData = getUserData();
  return userData !== null;
}
