import React from 'react';
import Navbar from './components/Navbar/Navbar';
import './App.css';

function App() {
// src/App.jsx
import React from 'react';
import { TaskProvider } from './context/TaskContext';
import './App.css';

export default function App() {
  return (
    <div className="app-container">

      <Navbar />

      <main className="main-content">

      </main>
    </div>
  );
}

export default App;

    <TaskProvider>
      <div className="app-container">
        
        <main className="main-content">
          {/* Member 2: <AnalyticsBar /> will go here */}
          {/* Member 3: <AddTaskForm /> will go here */}
          {/* Member 4: <TaskBoard /> will go here */}
        </main>
      </div>
    </TaskProvider>
  );
}