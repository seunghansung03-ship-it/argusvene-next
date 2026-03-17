import type { User } from "@argusvene/contracts";

const SESSION_USER_KEY = "argusvene.session.user";

export function getStoredSessionUser() {
  const raw = window.localStorage.getItem(SESSION_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredSessionUser(user: User) {
  window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export function clearStoredSessionUser() {
  window.localStorage.removeItem(SESSION_USER_KEY);
}
