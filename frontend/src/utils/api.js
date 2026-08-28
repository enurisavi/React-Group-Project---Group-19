import { saveToStorage, getFromStorage, STORAGE_KEYS } from './offlineStorage';

export const sendApiRequest = async (url, method = 'POST', data = {}) => {
    if (!navigator.onLine) {
        let currentQueue = getFromStorage(STORAGE_KEYS.PENDING_ACTIONS) || [];
        
        
        currentQueue.push({ url, method, data });
        
        saveToStorage(STORAGE_KEYS.PENDING_ACTIONS, currentQueue);

        console.log("Offline mode: Action saved to storage queue.", { url, method, data });
        
        return { success: true, offline: true, message: 'Saved locally. Will sync later.' };
    } else {
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("API Request Error:", error);
            return { success: false, error: error.message };
        }
    }
};

export const syncOfflineData = async () => {

    let pendingQueue = getFromStorage(STORAGE_KEYS.PENDING_ACTIONS) || [];

    if (pendingQueue.length > 0) {
        console.log("Internet is back! Syncing pending requests...");
        
        for (let req of pendingQueue) {
            await sendApiRequest(req.url, req.method, req.data);
        }
        
        console.log("All offline data synced successfully!");
        
        saveToStorage(STORAGE_KEYS.PENDING_ACTIONS, []);
    }
};