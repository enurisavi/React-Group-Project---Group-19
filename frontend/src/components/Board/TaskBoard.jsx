// src/components/Board/TaskBoard.jsx
import OfflineBanner from '../OfflineBanner';
import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Column } from './Column';
import styles from './Board.module.css';

export const TaskBoard = () => {
  const { tasks, searchQuery } = useTasks();

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery || !searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(query) ||
      task.assignee?.toLowerCase().includes(query)
    );
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const doingTasks = filteredTasks.filter((t) => t.status === 'DOING');
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE');

  return (
    <>
    <OfflineBanner />
    <div className={styles.boardGrid}>
      <Column title="TODO" tasks={todoTasks} statusType="todo" />
      <Column title="DOING" tasks={doingTasks} statusType="doing" />
      <Column title="DONE" tasks={doneTasks} statusType="done" />
    </div>
    </>
  );
};