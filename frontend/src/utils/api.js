let offlineQueue = [];

export const sendApiRequest = async (url, method = 'POST', data = {}) => {
    if (!navigator.onLine) {

        offlineQueue.push({ url, method, data });
        console.log("⚠️ Offline mode: Action saved to queue.", { url, method, data });
        
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
    if (offlineQueue.length > 0) {
        console.log("🌐 Internet is back! Syncing pending requests...");
        
        for (let req of offlineQueue) {
            await sendApiRequest(req.url, req.method, req.data);
        }
        
        console.log("✅ All offline data synced successfully!");
        offlineQueue = [];
    }
};