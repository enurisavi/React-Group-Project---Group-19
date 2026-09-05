// src/Context/TaskContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getTasks, saveTasks } from '../utils/offlineStorage';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // Initialize state from local cache if available for instant hydration
  const [tasks, setTasks] = useState(() => {
    try {
      const cached = getTasks(null);
      return Array.isArray(cached) ? cached : [];
    } catch {
      return [];
    }
  });

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

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    const config = getAuthHeaders();
    if (!config) return;

    try {
      const response = await axios.get(API_URL, config);
      const serverTasks = Array.isArray(response.data) ? response.data : [];
      setTasks(serverTasks);
      saveTasks(serverTasks);
    } catch (error) {
      console.error('Error fetching tasks from server:', error);
      // Fallback to cache if offline
      const cached = getTasks(null);
      if (cached && Array.isArray(cached)) {
        setTasks(cached);
      }
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Member 4 Listener: Cross-tab sync updates from PersistenceEngine
  useEffect(() => {
    const handleStorageSync = (event) => {
      if (event.detail?.tasks && Array.isArray(event.detail.tasks)) {
        setTasks(event.detail.tasks);
      }
    };

    window.addEventListener('syncboard:storage_updated', handleStorageSync);
    return () => window.removeEventListener('syncboard:storage_updated', handleStorageSync);
  }, []);

  // Function 1: Add New Task (Optimistic Offline-Aware)
  const addTask = async (newTask) => {
    const tempId = `temp-${Date.now()}`;
    const taskPayload = {
      ...newTask,
      status: 'TODO',
      __v: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const config = getAuthHeaders();

    // If offline or lacking token, persist locally with temp ID
    if (!navigator.onLine || !config) {
      const localTask = { ...taskPayload, _id: tempId };
      setTasks((prev) => [...prev, localTask]);
      return localTask;
    }

    try {
      const response = await axios.post(API_URL, taskPayload, config);
      const savedTask = response.data;
      setTasks((prev) => [...prev, savedTask]);
      return savedTask;
    } catch (error) {
      console.error('Error adding task, saving locally:', error);
      const localTask = { ...taskPayload, _id: tempId };
      setTasks((prev) => [...prev, localTask]);
      return localTask;
    }
  };

  // Function 2: Delete Task
  const deleteTask = async (taskId) => {
    // Immediate optimistic removal from state
    setTasks((prev) => prev.filter((task) => (task._id || task.id) !== taskId));

    const config = getAuthHeaders();
    if (!navigator.onLine || !config) return;

    try {
      await axios.delete(`${API_URL}/${taskId}`, config);
    } catch (error) {
      console.error('Error deleting task on server:', error);
    }
  };

  // Function 3: Move Task Status (Includes OCC __v version checks)
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
    const currentVersion = typeof targetTask.__v === 'number' ? targetTask.__v : 0;

    // Optimistic UI state update
    setTasks((prev) =>
      prev.map((task) =>
        (task._id || task.id) === taskId
          ? { ...task, status: updatedStatus }
          : task
      )
    );

    const config = getAuthHeaders();
    if (!navigator.onLine || !config) return;

    try {
      const response = await axios.put(
        `${API_URL}/${taskId}`,
        {
          status: updatedStatus,
          __v: currentVersion, // Satisfies Member 3's OCC controller
        },
        config
      );

      // Replace state with the updated document returned from the backend (includes new __v)
      if (response.data && typeof response.data === 'object') {
        setTasks((prev) =>
          prev.map((task) =>
            (task._id || task.id) === taskId ? response.data : task
          )
        );
      }
    } catch (error) {
      if (error.response?.status === 409) {
        console.warn('Concurrency conflict (409):', error.response.data);
        // Dispatch custom event to notify ConflictModal and sync with latest server state
        window.dispatchEvent(
          new CustomEvent('syncboard:conflict_detected', {
            detail: {
              taskId,
              localTask: targetTask,
              serverVersion: error.response.data.currentVersion,
            },
          })
        );
        fetchTasks();
      } else {
        console.error('Error moving task on server:', error);
      }
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