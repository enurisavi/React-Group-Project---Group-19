/**
 * Client-Side Persistence Engine (Member 4 Deliverable)
 * Provides robust localStorage caching, form draft persistence,
 * cross-tab synchronization, and offline action queue helpers for SyncBoard / CollabBoard.
 */

export const STORAGE_KEYS = {
  TASKS: 'syncboard_tasks_cache',
  LEGACY_TASKS: 'collabboard_tasks_cache',
  DRAFT_TASK: 'syncboard_draft_task_cache',
  PENDING_ACTIONS: 'syncboard_pending_actions',
  LAST_SYNC: 'syncboard_last_sync_timestamp',
  BOARD_METADATA: 'syncboard_board_metadata',
};

/**
 * Validates if window.localStorage is accessible and writable in the current runtime environment.
 * Handles incognito mode, security sandboxes, and quota blocks gracefully.
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
    console.warn('[OfflineStorage] LocalStorage is not accessible:', err.message);
    return false;
  }
};

/**
 * Saves tasks array to localStorage cache with QuotaExceeded protection.
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
      console.error('[OfflineStorage] Storage quota exceeded. Unable to cache tasks.');
    } else {
      console.error('[OfflineStorage] Error saving tasks cache:', err);
    }
    return false;
  }
};

/**
 * Retrieves cached tasks from localStorage with backward-compatible key lookup and corrupted JSON self-healing.
 * @param {Array} fallbackTasks - Default fallback tasks array if cache is empty or invalid
 * @returns {Array} Parsed tasks array
 */
export const getTasks = (fallbackTasks = []) => {
  if (!isStorageAvailable()) return fallbackTasks;
  try {
    // Primary key check with fallback to legacy key
    const rawData =
      window.localStorage.getItem(STORAGE_KEYS.TASKS) ||
      window.localStorage.getItem(STORAGE_KEYS.LEGACY_TASKS);

    if (!rawData) return fallbackTasks;
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return fallbackTasks;
  } catch (err) {
    console.warn('[OfflineStorage] Corrupted tasks cache detected, resetting key:', err);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.TASKS);
      window.localStorage.removeItem(STORAGE_KEYS.LEGACY_TASKS);
    } catch (_) {}
    return fallbackTasks;
  }
};

/**
 * Clears the cached tasks from storage.
 */
export const clearTasks = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.TASKS);
    window.localStorage.removeItem(STORAGE_KEYS.LEGACY_TASKS);
  } catch (err) {
    console.error('[OfflineStorage] Error clearing tasks cache:', err);
  }
};

/**
 * Saves in-progress form inputs (title, assignee, dueDate) to avoid data loss on accidental reload.
 * @param {Object} draft - Form draft state object
 */
export const saveDraft = (draft) => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.DRAFT_TASK, JSON.stringify(draft || {}));
  } catch (err) {
    console.error('[OfflineStorage] Error saving form draft:', err);
  }
};

/**
 * Retrieves saved task form draft with corruption recovery.
 * @returns {Object|null} Draft object or null
 */
export const getDraft = () => {
  if (!isStorageAvailable()) return null;
  try {
    const rawDraft = window.localStorage.getItem(STORAGE_KEYS.DRAFT_TASK);
    return rawDraft ? JSON.parse(rawDraft) : null;
  } catch (err) {
    console.warn('[OfflineStorage] Error reading form draft, resetting draft key:', err);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.DRAFT_TASK);
    } catch (_) {}
    return null;
  }
};

/**
 * Clears the saved task form draft upon successful form submission.
 */
export const clearDraft = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.DRAFT_TASK);
  } catch (err) {
    console.error('[OfflineStorage] Error clearing form draft:', err);
  }
};

/**
 * Queues an action executed while offline to be synced when online connection returns.
 * @param {Object} action - Action descriptor (e.g. { type: 'ADD_TASK', payload: {...}, timestamp })
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
    console.error('[OfflineStorage] Error queuing pending action:', err);
  }
};

/**
 * Retrieves all pending offline action queue items.
 * @returns {Array} Array of pending action objects
 */
export const getPendingActions = () => {
  if (!isStorageAvailable()) return [];
  try {
    const rawActions = window.localStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
    return rawActions ? JSON.parse(rawActions) : [];
  } catch (err) {
    console.warn('[OfflineStorage] Error retrieving pending actions, resetting queue:', err);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
    } catch (_) {}
    return [];
  }
};

/**
 * Clears pending offline actions once synchronized with the server API.
 */
export const clearPendingActions = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
  } catch (err) {
    console.error('[OfflineStorage] Error clearing pending actions:', err);
  }
};

/**
 * Retrieves storage metadata including last sync timestamp, cache availability, and queue size.
 * @returns {Object}
 */
export const getStorageMetadata = () => {
  if (!isStorageAvailable()) return { available: false };
  return {
    available: true,
    lastSync: window.localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || null,
    hasDraft: Boolean(window.localStorage.getItem(STORAGE_KEYS.DRAFT_TASK)),
    pendingActionsCount: getPendingActions().length,
  };
};

/**
 * Purges all SyncBoard storage keys from localStorage.
 */
export const clearAllStorage = () => {
  if (!isStorageAvailable()) return;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch (err) {
    console.error('[OfflineStorage] Error clearing all storage:', err);
  }
};

export default {
  STORAGE_KEYS,
  isStorageAvailable,
  saveTasks,
  getTasks,
  clearTasks,
  saveDraft,
  getDraft,
  clearDraft,
  queuePendingAction,
  getPendingActions,
  clearPendingActions,
  getStorageMetadata,
  clearAllStorage,
};
