import { useState, useEffect } from 'react';
// Import Member 4's offline storage utilities
import { getFromStorage, STORAGE_KEYS } from '../utils/offlineStorage';

export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // State Hydration: Load data lazily during initial render to avoid React warnings
    const [cachedData] = useState(() => {
        try {
            const localData = getFromStorage(STORAGE_KEYS.TASKS);
            if (localData) {
                console.log(' Hydrated state successfully from local cache');
                return localData;
            }
        } catch (error) {
            console.error('⚠️ Failed to hydrate state from cache:', error);
        }
        return null;
    });

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isOnline, cachedData };
};