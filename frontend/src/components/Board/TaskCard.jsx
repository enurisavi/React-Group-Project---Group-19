// src/components/Board/TaskCard.jsx
import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import styles from './Board.module.css';

export const TaskCard = ({ task }) => {
  const { moveTask, deleteTask } = useTasks();
  const taskId = task._id || task.id;

  return (
    <div className={styles.card}>
      <h4 className={styles.cardTitle}>{task.title}</h4>
      
      <div className={styles.cardMeta}>
        <span className={styles.metaItem}>👤 {task.assignee}</span>
        <span className={styles.metaItem}>📅 {task.dueDate}</span>
      </div>

      <div className={styles.cardActions}>
        <div className={styles.moveButtonGroup}>
          {task.status !== 'TODO' && (
            <button className={styles.btnMove} onClick={() => moveTask(taskId, 'prev')}>
              ← Move
            </button>
          )}
          {task.status !== 'DONE' && (
            <button className={styles.btnMove} onClick={() => moveTask(taskId, 'next')}>
              Move →
            </button>
          )}
        </div>

        <button className={styles.btnDelete} onClick={() => deleteTask(taskId)}>
          Delete
        </button>
      </div>
    </div>
  );
};