import React from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';

const OfflineBanner = () => {
    const { isOnline } = useOfflineSync();

    if (isOnline) {
        return null;
    }

    return (
        <div style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            padding: '10px',
            textAlign: 'center',
            fontWeight: 'bold',
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 1000
        }}>
            ⚠️ Offline Mode 
        </div>
    );
};

export default OfflineBanner;