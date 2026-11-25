/**
 * Save tool inputs on the visitor's device only. Every call is wrapped so a
 * blocked or full storage (private mode, strict settings) never breaks a tool.
 */
export const deviceStorage = {
  read<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  /** Returns false if the value couldn't be saved (storage blocked or full). */
  write(key: string, value: unknown): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      // Storage unavailable: the tool still works, it just won't remember.
      return false;
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
