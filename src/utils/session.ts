import { v4 as uuidv4 } from 'uuid';

export function getSessionToken(): string {
  const key = 'session-token';
  let token = localStorage.getItem(key);
  if (!token) {
    token = uuidv4();
    localStorage.setItem(key, token);
  }
  return token;
}
