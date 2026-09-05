

// src/App.jsx
import React from 'react';
import { TaskProvider } from './Context/TaskContext';
import Navbar from './components/Navbar/Navbar';
import AddTaskForm from './components/TaskForm/AddTaskForm';
import { TaskBoard } from './components/Board/TaskBoard';
import AnalyticsBar from './components/Board/AnalyticsBar';
import {OfflineBanner} from './components/OfflineBanner'; // adjust path if it's in components/OfflineBanner
import './App.css';

export default function App() {
  return (
    <TaskProvider>
      <div className="app-container">
        <OfflineBanner />
        <Navbar />
        <main className="main-content">
          <AnalyticsBar />
          <AddTaskForm/>
          <TaskBoard/>
        </main>
      </div>
    </TaskProvider>
  );
}