

// src/App.jsx
import React, { useState, useEffect } from 'react';
import { TaskProvider } from './Context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import AddTaskForm from './components/TaskForm/AddTaskForm';
import TaskBoard from './components/Board/TaskBoard';
import AnalyticsBar from './components/Board/AnalyticsBar';
import OfflineBanner from './components/OfflineBanner';
import useOfflineSync from './hooks/useOfflineSync';
import ConflictModal from './components/ConflictModal';
import './App.css';

export default function App() {
  const { isOnline, offlineQueue, syncOfflineData } = useOfflineSync();
  const [conflict, setConflict] = useState({
    isOpen: false,
    conflictData: null,
  });

  // Automatically flush offline sync queue when network connectivity restores
  useEffect(() => {
    if (isOnline && offlineQueue && offlineQueue.length > 0) {
      syncOfflineData()
        .then((res) => {
          if (res?.hasConflict) {
            setConflict({
              isOpen: true,
              conflictData: res.conflictDetails,
            });
          }
        })
        .catch((err) => console.error('Error syncing offline queue:', err));
    }
  }, [isOnline, offlineQueue, syncOfflineData]);

  // Handler for conflict modal actions
  const handleResolveConflict = (resolutionChoice) => {
    if (resolutionChoice === 'keepLocal') {
      console.log('Resolving conflict: Keeping local changes');
    } else {
      console.log('Resolving conflict: Accepting server state');
    }
    setConflict({ isOpen: false, conflictData: null });
  };

  return (
    <TaskProvider>
      <div className="app-container">
        {/* Offline Indicator */}
        <OfflineBanner isOnline={isOnline} />
        
        <Navbar />

        {/* Conflict Resolution Modal */}
        <ConflictModal
          isOpen={conflict.isOpen}
          conflictData={conflict.conflictData}
          onResolve={handleResolveConflict}
        />

        <main className="main-content">
          <AnalyticsBar />
          <AddTaskForm />
          <TaskBoard />
        </main>
      </div>
    </TaskProvider>
  );
}

