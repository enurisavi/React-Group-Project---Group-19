/**
 * Client-Side Persistence Engine (Member 4 Deliverable)
 * Provides robust localStorage caching, form draft persistence,
 * and offline action queue helpers for SyncBoard.
 */

export const STORAGE_KEYS = {
  TASKS: 'syncboard_tasks_cache',
  DRAFT_TASK: 'syncboard_draft_task_cache',
  PENDING_ACTIONS: 'syncboard_pending_actions',
  LAST_SYNC: 'syncboard_last_sync_timestamp',
  BOARD_METADATA: 'syncboard_board_metadata',
};

/**
 * Validates if window.localStorage is accessible and writable in the current environment
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
    console.error('[OfflineStorage] Error saving tasks cache:', err);
    return false;
  }
};

/**
 * Retrieves cached tasks from localStorage
 * @param {Array} fallbackTasks - Default fallback tasks array if cache is empty or invalid
 * @returns {Array} Parsed tasks array
 */
export const getTasks = (fallbackTasks = []) => {
  if (!isStorageAvailable()) return fallbackTasks;
  try {
    const rawData = window.localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!rawData) return fallbackTasks;
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackTasks;
  } catch (err) {
    console.error('[OfflineStorage] Error parsing tasks cache:', err);
    return fallbackTasks;
  }
};

/**
 * Clears the cached tasks from storage
 */
export const clearTasks = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.TASKS);
  } catch (err) {
    console.error('[OfflineStorage] Error clearing tasks cache:', err);
  }
};

/**
 * Saves in-progress form inputs (title, assignee, dueDate) to avoid data loss on page refresh
 * @param {Object} draft - Form draft state
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
 * Retrieves saved task form draft
 * @returns {Object|null} Draft object or null
 */
export const getDraft = () => {
  if (!isStorageAvailable()) return null;
  try {
    const rawDraft = window.localStorage.getItem(STORAGE_KEYS.DRAFT_TASK);
    return rawDraft ? JSON.parse(rawDraft) : null;
  } catch (err) {
    console.error('[OfflineStorage] Error reading form draft:', err);
    return null;
  }
};

/**
 * Clears the saved task form draft
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
 * Queues an action executed while offline to be synced when online connection returns
 * @param {Object} action - Action descriptor (e.g. { type: 'ADD_TASK', payload: {...}, timestamp })
 */
export const queuePendingAction = (action) => {
  if (!isStorageAvailable()) return;
  try {
    const currentActions = getPendingActions();
    const actionWithMeta = {
      ...action,
      id: action.id || Date.now().toString(),
      timestamp: action.timestamp || new Date().toISOString(),
    };
    currentActions.push(actionWithMeta);
    window.localStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(currentActions));
  } catch (err) {
    console.error('[OfflineStorage] Error queuing pending action:', err);
  }
};

/**
 * Retrieves all pending offline action queue items
 * @returns {Array} Array of pending action objects
 */
export const getPendingActions = () => {
  if (!isStorageAvailable()) return [];
  try {
    const rawActions = window.localStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
    return rawActions ? JSON.parse(rawActions) : [];
  } catch (err) {
    console.error('[OfflineStorage] Error retrieving pending actions:', err);
    return [];
  }
};

/**
 * Clears pending offline actions once synchronized with the server
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
 * Retrieves storage metadata including last sync timestamp and item count
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
 * Purges all SyncBoard caches from localStorage
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
