/**
 * Client-Side Offline Caching & Persistence Engine (Member 4 Deliverable)
 * Provides comprehensive localStorage utility functions, form draft persistence,
 * active board state caching, and hooks/listeners that save user inputs locally as they type or drag cards.
 * Updated to support generic getters/setters for Member 5's state hydration & offline sync.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const STORAGE_KEYS = {
  TASKS: 'syncboard_tasks_cache',
  BOARD_STATE: 'syncboard_active_board_state',
  DRAFT_TASK: 'syncboard_draft_task_cache',
  CARD_POSITIONS: 'syncboard_card_positions_cache',
  PENDING_ACTIONS: 'syncboard_pending_actions',
  LAST_SYNC: 'syncboard_last_sync_timestamp',
  BOARD_METADATA: 'syncboard_board_metadata',
  // Authentication & session keys
  TOKEN: 'userToken',
  USER: 'userData',
};

// ==========================================
// 1. Core Storage Availability & Safety
// ==========================================

/**
 * Validates if window.localStorage is accessible and writable in current runtime environment.
 * Gracefully handles Private/Incognito modes and sandboxed iframes.
 * @returns {boolean}
 */
export const isStorageAvailable = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__syncboard_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (err) {
    console.warn('[LocalStorage] Storage is not accessible:', err.message);
    return false;
  }
};

// ==========================================
// 2. Generic Storage Helpers (Member 5 Compatibility)
// ==========================================

/**
 * Generic getter function to retrieve and parse JSON data by key
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
export const getFromStorage = (key, fallback = null) => {
  if (!isStorageAvailable()) return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`[LocalStorage] Error reading ${key} from storage:`, err);
    return fallback;
  }
};

/**
 * Generic setter function to serialize and persist data by key
 * @param {string} key
 * @param {*} data
 * @returns {boolean}
 */
export const saveToStorage = (key, data) => {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`[LocalStorage] Error saving ${key} to storage:`, err);
    return false;
  }
};

// ==========================================
// 3. Active Board & Tasks State Caching
// ==========================================

/**
 * Saves active board state (columns, card orders, title) to localStorage
 * @param {Object} boardState - Active board state object
 * @returns {boolean} Success status
 */
export const saveBoardState = (boardState) => {
  if (!isStorageAvailable()) return false;
  try {
    const serialized = JSON.stringify(boardState || {});
    window.localStorage.setItem(STORAGE_KEYS.BOARD_STATE, serialized);
    window.localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014) {
      console.error('[LocalStorage] Storage quota exceeded while saving board state.');
    } else {
      console.error('[LocalStorage] Error saving board state:', err);
    }
    return false;
  }
};

/**
 * Retrieves cached active board state from localStorage with self-healing on corruption
 * @param {Object} fallbackState - Default fallback board state
 * @returns {Object} Parsed board state
 */
export const getBoardState = (fallbackState = null) => {
  if (!isStorageAvailable()) return fallbackState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.BOARD_STATE);
    if (!raw) return fallbackState;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : fallbackState;
  } catch (err) {
    console.warn('[LocalStorage] Corrupted board state detected, resetting:', err);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.BOARD_STATE);
    } catch (_) {}
    return fallbackState;
  }
};

/**
 * Clears the active board state cache
 */
export const clearBoardState = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.BOARD_STATE);
  } catch (err) {
    console.error('[LocalStorage] Error clearing board state:', err);
  }
};

/**
 * Saves tasks array to localStorage cache
 * @param {Array} tasks - Array of task objects
 * @returns {boolean} Success status
 */
export const saveTasks = (tasks) => {
  if (!isStorageAvailable()) return false;
  try {
    const serialized = JSON.stringify(tasks || []);
    window.localStorage.setItem(STORAGE_KEYS.TASKS, serialized);
    window.localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014) {
      console.error('[LocalStorage] Storage quota exceeded while saving tasks.');
    } else {
      console.error('[LocalStorage] Error saving tasks cache:', err);
    }
    return false;
  }
};

/**
 * Retrieves cached tasks from localStorage
 * @param {Array} fallbackTasks - Default fallback tasks array
 * @returns {Array} Parsed tasks array
 */
export const getTasks = (fallbackTasks = []) => {
  if (!isStorageAvailable()) return fallbackTasks;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return fallbackTasks;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackTasks;
  } catch (err) {
    console.warn('[LocalStorage] Corrupted tasks cache detected, resetting:', err);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.TASKS);
    } catch (_) {}
    return fallbackTasks;
  }
};

/**
 * Clears cached tasks from localStorage
 */
export const clearTasks = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.TASKS);
  } catch (err) {
    console.error('[LocalStorage] Error clearing tasks cache:', err);
  }
};

// ==========================================
// 4. Draft Task Inputs Persistence
// ==========================================

/**
 * Saves in-progress form inputs (title, assignee, dueDate, etc.) to prevent data loss
 * @param {Object} draft - Form draft inputs object
 */
export const saveDraft = (draft) => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.DRAFT_TASK, JSON.stringify(draft || {}));
  } catch (err) {
    console.error('[LocalStorage] Error saving draft task:', err);
  }
};

/**
 * Retrieves saved form draft inputs
 * @returns {Object|null} Draft inputs object or null
 */
export const getDraft = () => {
  if (!isStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.DRAFT_TASK);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[LocalStorage] Corrupted draft task detected, resetting:', err);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.DRAFT_TASK);
    } catch (_) {}
    return null;
  }
};

/**
 * Clears saved task form draft
 */
export const clearDraft = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.DRAFT_TASK);
  } catch (err) {
    console.error('[LocalStorage] Error clearing draft task:', err);
  }
};

// ==========================================
// 5. Card Drag & Position Persistence
// ==========================================

/**
 * Saves card ordering and position changes locally during/after drag-and-drop
 * @param {string|number} cardId - Unique identifier of the card
 * @param {string} columnId - Target column ID (TODO, DOING, DONE)
 * @param {number} positionIndex - New order index within the column
 */
export const saveCardPosition = (cardId, columnId, positionIndex) => {
  if (!isStorageAvailable()) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.CARD_POSITIONS);
    const positions = raw ? JSON.parse(raw) : {};
    positions[cardId] = {
      columnId,
      positionIndex,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEYS.CARD_POSITIONS, JSON.stringify(positions));
  } catch (err) {
    console.error('[LocalStorage] Error saving card position:', err);
  }
};

/**
 * Retrieves saved card positions from localStorage
 * @returns {Object} Map of cardId -> { columnId, positionIndex, updatedAt }
 */
export const getCardPositions = () => {
  if (!isStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.CARD_POSITIONS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('[LocalStorage] Error reading card positions:', err);
    return {};
  }
};

/**
 * Clears card position cache
 */
export const clearCardPositions = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.CARD_POSITIONS);
  } catch (err) {
    console.error('[LocalStorage] Error clearing card positions:', err);
  }
};

// ==========================================
// 6. Offline Action Queue Helpers (for Member 5 & 6 Sync)
// ==========================================

/**
 * Queues an action executed while offline for synchronization upon reconnection
 * @param {Object} action - Action descriptor (e.g. { type: 'CREATE_TASK', payload: {...} })
 */
export const queuePendingAction = (action) => {
  if (!isStorageAvailable()) return;
  try {
    const currentActions = getPendingActions();
    const actionWithMeta = {
      ...action,
      id: action.id || `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: action.timestamp || new Date().toISOString(),
    };
    currentActions.push(actionWithMeta);
    window.localStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(currentActions));
  } catch (err) {
    console.error('[LocalStorage] Error queuing pending action:', err);
  }
};

/**
 * Retrieves all pending offline action queue items
 * @returns {Array} Array of pending actions
 */
export const getPendingActions = () => {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[LocalStorage] Error reading pending actions, resetting queue:', err);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
    } catch (_) {}
    return [];
  }
};

/**
 * Clears pending offline actions once synchronized with the server API
 */
export const clearPendingActions = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
  } catch (err) {
    console.error('[LocalStorage] Error clearing pending actions:', err);
  }
};

/**
 * Purges all SyncBoard cache items from localStorage
 */
export const clearAllStorage = () => {
  if (!isStorageAvailable()) return;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch (err) {
    console.error('[LocalStorage] Error clearing all storage:', err);
  }
};

// ==========================================
// 7. Custom React Hooks & Event Listeners
// ==========================================

/**
 * Custom Hook: useAutoSaveDraft
 * Automatically debounces and persists form inputs locally as the user types,
 * restores draft on initial mount, and provides a clear callback on submit.
 */
export const useAutoSaveDraft = (
  initialValues = {},
  storageKey = STORAGE_KEYS.DRAFT_TASK,
  debounceMs = 300
) => {
  const [formValues, setFormValues] = useState(() => {
    if (!isStorageAvailable()) return initialValues;
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved ? { ...initialValues, ...JSON.parse(saved) } : initialValues;
    } catch (_) {
      return initialValues;
    }
  });

  const timerRef = useRef(null);

  // Debounced auto-save effect as user types
  useEffect(() => {
    if (!isStorageAvailable()) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(formValues));
      } catch (err) {
        console.error('[useAutoSaveDraft] Failed to save draft:', err);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [formValues, storageKey, debounceMs]);

  const clearDraftValues = useCallback(() => {
    setFormValues(initialValues);
    if (isStorageAvailable()) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch (_) {}
    }
  }, [initialValues, storageKey]);

  return [formValues, setFormValues, clearDraftValues];
};

/**
 * Custom Hook: useBoardDragPersistence
 * Provides a card drag listener/callback that immediately persists new positions
 * and active board ordering into localStorage as cards are dragged between columns.
 */
export const useBoardDragPersistence = (onPersistCallback) => {
  return useCallback(
    (cardId, targetColumn, newIndex, updatedTasks = null) => {
      // 1. Save specific card movement
      saveCardPosition(cardId, targetColumn, newIndex);

      // 2. If full updated tasks/columns array is provided, save active board state
      if (updatedTasks && Array.isArray(updatedTasks)) {
        saveTasks(updatedTasks);
      }

      // 3. Optional notification callback
      if (typeof onPersistCallback === 'function') {
        onPersistCallback({ cardId, targetColumn, newIndex, updatedTasks });
      }
    },
    [onPersistCallback]
  );
};

export default {
  STORAGE_KEYS,
  isStorageAvailable,
  getFromStorage,
  saveToStorage,
  saveBoardState,
  getBoardState,
  clearBoardState,
  saveTasks,
  getTasks,
  clearTasks,
  saveDraft,
  getDraft,
  clearDraft,
  saveCardPosition,
  getCardPositions,
  clearCardPositions,
  queuePendingAction,
  getPendingActions,
  clearPendingActions,
  clearAllStorage,
  useAutoSaveDraft,
  useBoardDragPersistence,
};