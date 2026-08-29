import React, { createContext, useState } from 'react';


export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  
  const [tasks, setTasks] = useState([]);

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