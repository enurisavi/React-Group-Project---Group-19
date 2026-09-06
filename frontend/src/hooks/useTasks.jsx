import { useContext } from 'react';
import { TaskContext } from "../Context/TaskContext";

export const useTasks = () => {
  const context = useContext(TaskContext);
  
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  
  return context;
};