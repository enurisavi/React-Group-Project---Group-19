import React from 'react';
import { TaskCard } from './TaskCard';
import styles from './Board.module.css';

export const Column = ({ title, tasks, statusType }) => {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div className={styles.columnTitleGroup}>
          <span className={`${styles.statusDot} ${styles[statusType]}`}></span>
          <h3 className={styles.columnTitle}>{title}</h3>
        </div>
        <span className={styles.taskCounter}>{tasks.length}</span>
      </div>

      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};