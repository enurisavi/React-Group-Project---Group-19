import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = 'http://localhost:5000/api/tasks';

  // Helper to fetch the current auth token and build request headers
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('userToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('syncboard_token');

    return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
  };

  const fetchTasks = useCallback(async () => {
    const config = getAuthHeaders();
    if (!config) {
      // User is not authenticated yet; skip call to prevent 401
      return;
    }

    try {
      const response = await axios.get(API_URL, config);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Function 1: Add New Task (Backend POST Call)
  const addTask = async (newTask) => {
    const config = getAuthHeaders();
    if (!config) {
      console.warn('Cannot add task: No auth token found.');
      return;
    }

    try {
      const response = await axios.post(
        API_URL,
        {
          ...newTask,
          status: 'TODO',
        },
        config
      );
      setTasks((prevTasks) => [...prevTasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Function 2: Delete Task (Backend DELETE Call)
  const deleteTask = async (taskId) => {
    const config = getAuthHeaders();
    if (!config) return;

    try {
      await axios.delete(`${API_URL}/${taskId}`, config);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => (task._id || task.id) !== taskId)
      );
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Function 3: Move Task Status (Backend PUT/PATCH Call)
  const moveTask = async (taskId, direction) => {
    const config = getAuthHeaders();
    if (!config) return;

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
      const response = await axios.put(
        `${API_URL}/${taskId}`,
        { status: updatedStatus },
        config
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          (task._id || task.id) === taskId
            ? { ...task, status: response.data?.status || updatedStatus }
            : task
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
        setTasks,
        searchQuery,
        setSearchQuery,
        fetchTasks,
        addTask,
        deleteTask,
        moveTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};