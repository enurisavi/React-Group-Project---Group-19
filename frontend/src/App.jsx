

// src/App.jsx
import React from 'react';
import { TaskProvider } from './Context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import AddTaskForm from './components/TaskForm/AddTaskForm';
import { TaskBoard } from './components/Board/TaskBoard';
import './App.css';

export default function App() {
  return (
    <TaskProvider>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          {/* Member 2: <AnalyticsBar /> will go here */}
          <AddTaskForm/>
          <TaskBoard/>
        </main>
      </div>
    </TaskProvider>
  );
}