

// src/App.jsx
import React from 'react';
import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import AddTaskForm from './components/TaskForm/AddTaskForm';
import './App.css';

export default function App() {
  return (
    <TaskProvider>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          {/* Member 2: <AnalyticsBar /> will go here */}
          <AddTaskForm/>
          {/* Member 4: <TaskBoard /> will go here */}
        </main>
      </div>
    </TaskProvider>
  );
}