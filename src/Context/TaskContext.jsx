import React, { createContext, useState } from 'react';

// 1. Context eka create karagන්නවා
export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // Mock Data (Initial state eka podiyata damma anith ayat UI balaganna)
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Write unit tests',
      assignee: 'Sam Patel',
      dueDate: '2026-08-26',
      status: 'TODO',
    },
    {
      id: '2',
      title: 'Build API endpoints',
      assignee: 'Jordan Lee',
      dueDate: '2026-08-22',
      status: 'DOING',
    },
    {
      id: '3',
      title: 'Define project scope',
      assignee: 'Jordan Lee',
      dueDate: '2026-08-15',
      status: 'DONE',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // Function 1: Add New Task
  const addTask = (newTask) => {
    const taskWithId = {
      ...newTask,
      id: Date.now().toString(), // Simple ID generator
      status: 'TODO', // Default status for new tasks
    };
    setTasks((prevTasks) => [...prevTasks, taskWithId]);
  };

  // Function 2: Delete Task
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  // Function 3: Move Task Status (TODO -> DOING -> DONE)
  const moveTask = (taskId, direction) => {
    const statusOrder = ['TODO', 'DOING', 'DONE'];

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const currentIndex = statusOrder.indexOf(task.status);
          let newIndex = currentIndex;

          if (direction === 'next' && currentIndex < statusOrder.length - 1) {
            newIndex += 1;
          } else if (direction === 'prev' && currentIndex > 0) {
            newIndex -= 1;
          }

          return { ...task, status: statusOrder[newIndex] };
        }
        return task;
      })
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        searchQuery,
        setSearchQuery,
        addTask,
        deleteTask,
        moveTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};