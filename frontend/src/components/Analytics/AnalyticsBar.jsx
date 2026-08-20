import React, { useContext } from 'react';
import { TaskContext } from '../../Context/TaskContext';
import { ProgressCard } from './ProgressCard';
import { StatusCounter } from './StatusCounter';
import styles from './Analytics.module.css';

/**
 * AnalyticsBar Component (Member 2 Deliverable)
 * Dynamic progress bar, status counters (TODO, DOING, DONE), and top filter input.
 */
export const AnalyticsBar = () => {
  const context = useContext(TaskContext);
  const tasks = context?.tasks || [];
  const searchQuery = context?.searchQuery || '';
  const setSearchQuery = context?.setSearchQuery || (() => {});

  // 1. Calculate analytics dynamically from tasks state
  const totalTasks = tasks.length;

  // Normalized status string checks
  const todoCount = tasks.filter((t) =>
    t.status?.toUpperCase().replace('-', '') === 'TODO'
  ).length;

  const doingCount = tasks.filter((t) => {
    const status = t.status?.toUpperCase();
    return status === 'DOING' || status === 'IN PROGRESS';
  }).length;

  const doneCount = tasks.filter((t) => {
    const status = t.status?.toUpperCase();
    return status === 'DONE' || status === 'COMPLETED';
  }).length;

  // 2. Percentage calculation: ((Done / Total) * 100)
  const percentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className={styles.analyticsContainer}>
      {/* Dynamic Progress Metric */}
      <ProgressCard
        totalTasks={totalTasks}
        doneCount={doneCount}
        percentage={percentage}
      />

      <div className={styles.divider} />

      {/* Status Counters */}
      <div className={styles.statusGroup}>
        <StatusCounter label="TODO" count={todoCount} statusType="todo" />
        <StatusCounter label="DOING" count={doingCount} statusType="doing" />
        <StatusCounter label="DONE" count={doneCount} statusType="done" />
      </div>

      {/* Live Search & Filter Input Field */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tasks by title..."
          className={styles.searchInput}
          aria-label="Filter tasks by title"
        />
      </div>
    </div>
  );
};

export default AnalyticsBar;
