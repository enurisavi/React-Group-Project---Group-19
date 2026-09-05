// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { TaskProvider } from './Context/TaskContext';
import { useTasks } from './hooks/useTasks';
import Navbar from './components/Navbar/Navbar';
import AddTaskForm from './components/TaskForm/AddTaskForm';
import { TaskBoard } from './components/Board/TaskBoard';
import AnalyticsBar from './components/Board/AnalyticsBar';
import OfflineBanner from './components/OfflineBanner';
import ConflictModal from './components/ConflictModal';
import useOfflineSync from './hooks/useOfflineSync';
import Login from './components/Login';
import {
  saveTasks,
  getTasks,
  isStorageAvailable,
  STORAGE_KEYS,
} from './utils/offlineStorage';
import './App.css';

/**
 * PersistenceEngine Component (Member 4 Deliverable)
 * Automatically writes board updates and task mutations to localStorage cache,
 * supports cross-tab synchronization, and provides offline resilience.
 */
function PersistenceEngine({ children }) {
  const { tasks } = useTasks();
  const isInitialMount = useRef(true);

  // 1. Automatically write board & task state updates to localStorage with hydration check
  useEffect(() => {
    if (!tasks || !Array.isArray(tasks)) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      const cached = getTasks(null);
      if (!cached) {
        saveTasks(tasks);
      }
      return;
    }

    // Subsequent user actions (add, delete, move) automatically persist
    saveTasks(tasks);
  }, [tasks]);

  // 2. Cross-tab synchronization listener & Custom Event broadcasting
  useEffect(() => {
    if (!isStorageAvailable()) return;

    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEYS.TASKS && event.newValue) {
        try {
          const remoteTasks = JSON.parse(event.newValue);
          if (Array.isArray(remoteTasks)) {
            window.dispatchEvent(
              new CustomEvent('syncboard:storage_updated', {
                detail: { tasks: remoteTasks },
              })
            );
          }
        } catch (err) {
          console.warn('[PersistenceEngine] Cross-tab sync parse error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Member 6: Offline Sync & Conflict Handling
  const { isOnline, offlineQueue, syncOfflineData } = useOfflineSync();
  const [conflict, setConflict] = useState({
    isOpen: false,
    conflictData: null,
  });

  // Check if user session exists in localStorage on page load
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER || 'userData');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user data', e);
      }
    }
    setLoading(false);
  }, []);

  // Automatically flush offline sync queue when network connectivity restores
  useEffect(() => {
    if (isOnline && offlineQueue && offlineQueue.length > 0 && user) {
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
  }, [isOnline, offlineQueue, syncOfflineData, user]);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN || 'userToken');
    localStorage.removeItem(STORAGE_KEYS.USER || 'userData');
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // Handler for conflict modal actions
  const handleResolveConflict = (resolutionChoice) => {
    if (resolutionChoice === 'keepLocal') {
      console.log('Resolving conflict: Keeping local changes');
    } else {
      console.log('Resolving conflict: Accepting server state');
    }
    setConflict({ isOpen: false, conflictData: null });
  };

  if (loading) {
    return <div className="app-container">Loading session...</div>;
  }

  return (
    <TaskProvider>
      <PersistenceEngine>
        <div className="app-container">
          <OfflineBanner isOnline={isOnline} />

          {/* Conflict Resolution Modal */}
          <ConflictModal
            isOpen={conflict.isOpen}
            conflictData={conflict.conflictData}
            onResolve={handleResolveConflict}
          />

          {!user ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <>
              <Navbar user={user} currentUser={user} onLogout={handleLogout} />
              <main className="main-content">
                <AnalyticsBar />
                <AddTaskForm />
                <TaskBoard />
              </main>
            </>
          )}
        </div>
      </PersistenceEngine>
    </TaskProvider>
  );
}