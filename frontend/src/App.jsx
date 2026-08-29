// src/App.jsx
import React, { useState, useEffect } from 'react';

import { TaskProvider } from './Context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import AddTaskForm from './components/TaskForm/AddTaskForm';
import { TaskBoard } from './components/Board/TaskBoard';
import AnalyticsBar from './components/Board/AnalyticsBar';
import Login from './components/Login';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user session exists in localStorage on page load
  useEffect(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  if (loading) {
    return <div className="app-container">Loading session...</div>;
  }

  return (
    <TaskProvider>
      <div className="app-container">
        {!user ? (
          <Login onLoginSuccess={(userData) => setUser(userData)} />
        ) : (
          <>
            <Navbar onLogout={handleLogout} currentUser={user} />
            <main className="main-content">
              <AnalyticsBar />
              <AddTaskForm />
              <TaskBoard />
            </main>
          </>
        )}
      </div>
    </TaskProvider>
  );
}