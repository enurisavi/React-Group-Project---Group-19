import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Column } from './Column';
import styles from './Board.module.css';

export const TaskBoard = () => {
  const { tasks } = useTasks();

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const doingTasks = tasks.filter((t) => t.status === 'DOING');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  return (
    <div className={styles.boardGrid}>
      <Column title="TODO" tasks={todoTasks} statusType="todo" />
      <Column title="DOING" tasks={doingTasks} statusType="doing" />
      <Column title="DONE" tasks={doneTasks} statusType="done" />
    </div>
  );
};