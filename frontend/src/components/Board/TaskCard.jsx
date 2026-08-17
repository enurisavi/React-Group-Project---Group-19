import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import styles from './Board.module.css';

export const TaskCard = ({ task }) => {
  const { moveTask, deleteTask } = useTasks();

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
            <button className={styles.btnMove} onClick={() => moveTask(task.id, 'prev')}>
              ← Move
            </button>
          )}
          {task.status !== 'DONE' && (
            <button className={styles.btnMove} onClick={() => moveTask(task.id, 'next')}>
              Move →
            </button>
          )}
        </div>

        <button className={styles.btnDelete} onClick={() => deleteTask(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};