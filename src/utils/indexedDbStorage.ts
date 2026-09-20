// Robust IndexedDB persistence engine for Standalone HTML and WebView
// In Mobile WebViews (e.g., file:// protocol or exported apps), localStorage can be volatile or subject to strict quotas.
// IndexedDB provides durable, persistent, multi-megabyte storage that survives app refreshes and WebView restarts.

import { AppState } from '../types';

const DB_NAME = 'EPL_PRO_STORAGE_DB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state_store';
const RECORD_KEY = 'current_app_state';

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase | null> | null = null;

const openDB = (): Promise<IDBDatabase | null> => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        } catch (e) {
          console.warn('[IndexedDB] Upgrade error:', e);
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.warn('[IndexedDB] Open error:', (event.target as IDBOpenDBRequest).error);
        resolve(null);
      };

      request.onblocked = () => {
        console.warn('[IndexedDB] Open blocked');
        resolve(null);
      };
    } catch (err) {
      console.warn('[IndexedDB] Initialization exception:', err);
      resolve(null);
    }
  });

  return dbInitPromise;
};

/**
 * Save AppState asynchronously to IndexedDB
 */
export const saveStateToIndexedDB = async (state: AppState): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(state, RECORD_KEY);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  } catch (e) {
    return false;
  }
};

/**
 * Load AppState from IndexedDB
 */
export const loadStateFromIndexedDB = async (): Promise<AppState | null> => {
  try {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(RECORD_KEY);

        req.onsuccess = () => {
          const result = req.result;
          if (result && typeof result === 'object' && (result.matchHistory || result.eplMatches || result.settings)) {
            resolve(result as AppState);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  } catch (e) {
    return null;
  }
};

/**
 * Clear IndexedDB state on reset
 */
export const clearIndexedDBState = async (): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(RECORD_KEY);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  } catch (e) {
    return false;
  }
};
