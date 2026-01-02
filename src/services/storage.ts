import type { NormalizedBoardData } from "@/types/domain";

const STORAGE_KEY = "trello_clone_v1";

export function loadFromStorage(): NormalizedBoardData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as NormalizedBoardData;
    if (!parsed?.board?.id || !parsed?.lists || !parsed?.cards) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveToStorage(data: NormalizedBoardData): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
