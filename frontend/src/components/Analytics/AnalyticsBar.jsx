import React, { useContext, useMemo } from 'react';
import { TaskContext } from '../../Context/TaskContext';
import { ProgressCard } from './ProgressCard';
import { StatusCounter } from './StatusCounter';
import styles from './Analytics.module.css';

/**
 * AnalyticsBar Component (Member 2 Deliverable)
 * Dynamic progress bar, status counters (TODO, DOING, DONE), and top filter input.
 * Memoized for high performance and low latency.
 */
export const AnalyticsBar = () => {
  const context = useContext(TaskContext);
  const tasks = context?.tasks || [];
  const searchQuery = context?.searchQuery || '';
  const setSearchQuery = context?.setSearchQuery || (() => {});

  // 1. Single-pass memoized metrics calculation (O(N))
  // Prevents re-running counts on every character keystroke in search bar
  const { totalTasks, todoCount, doingCount, doneCount, percentage } = useMemo(() => {
    let todo = 0;
    let doing = 0;
    let done = 0;

    for (let i = 0; i < tasks.length; i++) {
      const normalized = tasks[i]?.status?.toUpperCase()?.replace('-', '') || '';
      if (normalized === 'TODO') {
        todo += 1;
      } else if (normalized === 'DOING' || normalized === 'INPROGRESS') {
        doing += 1;
      } else if (normalized === 'DONE' || normalized === 'COMPLETED') {
        done += 1;
      }
    }

    const total = tasks.length;
    const calculatedPercentage = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      totalTasks: total,
      todoCount: todo,
      doingCount: doing,
      doneCount: done,
      percentage: calculatedPercentage,
    };
  }, [tasks]);

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
        {searchQuery.length > 0 && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search input"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalyticsBar;
