import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {

  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = 'http://localhost:5000/api/tasks';

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(API_URL);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // Function 1: Add New Task (Backend POST Call)
  const addTask = async (newTask) => {
    try {
      const response = await axios.post(API_URL, {
        ...newTask,
        status: 'TODO',
      });
      setTasks((prevTasks) => [...prevTasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Function 2: Delete Task (Backend DELETE Call)
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => (task._id || task.id) !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Function 3: Move Task Status (Backend PUT/PATCH Call)
  const moveTask = async (taskId, direction) => {
    const statusOrder = ['TODO', 'DOING', 'DONE'];
    const targetTask = tasks.find((task) => (task._id || task.id) === taskId);

    if (!targetTask) return;

    const currentIndex = statusOrder.indexOf(targetTask.status);
    let newIndex = currentIndex;

    if (direction === 'next' && currentIndex < statusOrder.length - 1) {
      newIndex += 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex -= 1;
    }

    const updatedStatus = statusOrder[newIndex];

    try {
      const response = await axios.put(`${API_URL}/${taskId}`, {
        status: updatedStatus,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          (task._id || task.id) === taskId ? { ...task, status: response.data.status || updatedStatus } : task
        )
      );
    } catch (error) {
      console.error('Error moving task:', error);
    }
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