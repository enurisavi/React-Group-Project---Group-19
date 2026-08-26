import { useState, useEffect } from 'react';

const OfflineBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    if (isOnline) return null;

    return (
        <div style={{ backgroundColor: '#ef4444', color: 'white', textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>
            ⚠️ You are currently offline. Changes are saved locally and will sync once online.
        </div>
    );
};

export default OfflineBanner;