// src/App.jsx
import React from 'react';
import { TaskProvider } from './context/TaskContext';
import './App.css';

export default function App() {
  return (
    <TaskProvider>
      <div className="app-container">
        {/* Member 1: <Navbar /> will go here */}
        <main className="main-content">
          {/* Member 2: <AnalyticsBar /> will go here */}
          {/* Member 3: <AddTaskForm /> will go here */}
          {/* Member 4: <TaskBoard /> will go here */}
        </main>
      </div>
    </TaskProvider>
  );
}