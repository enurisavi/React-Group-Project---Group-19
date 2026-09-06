import React, { useContext } from 'react';
import { TaskContext } from '../../Context/TaskContext';
import styles from './AnalyticsBar.module.css';

export default function AnalyticsBar() {
  const { tasks = [], searchQuery, setSearchQuery } = useContext(TaskContext);

  // 1. Calculate analytics dynamically from tasks
  const totalTasks = tasks.length;
  
  // Normalizing status strings (handles 'TODO', 'Todo', 'to-do', etc.)
  const todoCount = tasks.filter((t) =>
    t.status?.toUpperCase().replace('-', '') === 'TODO'
  ).length;

  const doingCount = tasks.filter((t) =>
    t.status?.toUpperCase() === 'DOING' || t.status?.toUpperCase() === 'IN PROGRESS'
  ).length;

  const doneCount = tasks.filter((t) =>
    t.status?.toUpperCase() === 'DONE' || t.status?.toUpperCase() === 'COMPLETED'
  ).length;

  // 2. Percentage calculation
  const percentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className={styles.analyticsContainer}>
      {/* Progress Metric */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>PROGRESS</span>
          <span className={styles.progressFraction}>{doneCount}/{totalTasks}</span>
        </div>
        
        <div className={styles.progressMain}>
          <span className={styles.boldCount}>{doneCount} of {totalTasks}</span>
          <span className={styles.subText}>tasks completed</span>
        </div>

        <div className={styles.barTrack}>
          <div
            className={styles.barFill}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={styles.percentText}>{percentage}% complete</span>
      </div>

      <div className={styles.divider} />

      {/* Status Counters */}
      <div className={styles.statusGroup}>
        <div className={styles.statusCard}>
          <div className={styles.cardHeader}>
            <span className={`${styles.dot} ${styles.todoDot}`} />
            <span className={styles.cardTitle}>TODO</span>
          </div>
          <span className={styles.cardValue}>{todoCount}</span>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.cardHeader}>
            <span className={`${styles.dot} ${styles.doingDot}`} />
            <span className={styles.cardTitle}>DOING</span>
          </div>
          <span className={styles.cardValue}>{doingCount}</span>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.cardHeader}>
            <span className={`${styles.dot} ${styles.doneDot}`} />
            <span className={styles.cardTitle}>DONE</span>
          </div>
          <span className={styles.cardValue}>{doneCount}</span>
        </div>
      </div>

      {/* Live Search Input */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          placeholder="Filter tasks by title..."
          className={styles.searchInput}
        />
      </div>
    </div>
  );
}