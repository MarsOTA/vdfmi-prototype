import { OperationalEvent, UserRole } from '../types';

/**
 * Persistenza locale (localStorage) per la webapp VVF Milano.
 *
 * NOTE IMPORTANTI
 * - Questo modulo salva SOLO lo stato applicativo (eventi, data selezionata, ruolo).
 * - Non tocca export PDF/Excel né UI: viene usato a livello App (top state).
 * - Resiliente a JSON corrotti e versioni future.
 */

const STORAGE_KEY = 'vdfmi.appState.v1';
const STORAGE_VERSION = 1;

export interface AppPersistedState {
  version: number;
  savedAt: string;
  events: OperationalEvent[];
  selectedDate?: string;
  role?: UserRole;
}

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safeJsonParse = <T,>(raw: string): T | null => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const loadAppState = (): AppPersistedState | null => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const parsed = safeJsonParse<AppPersistedState>(raw);
  if (!parsed) return null;
  if (parsed.version !== STORAGE_VERSION) return null;
  if (!Array.isArray(parsed.events)) return null;

  return parsed;
};

export const saveAppState = (state: Omit<AppPersistedState, 'version' | 'savedAt'>) => {
  if (!isBrowser()) return;
  const payload: AppPersistedState = {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    ...state,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // In caso di quota piena o storage bloccato, non blocchiamo l'app.
  }
};

export const clearAppState = () => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
