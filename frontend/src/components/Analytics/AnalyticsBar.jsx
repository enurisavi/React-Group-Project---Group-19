import React, { useContext, useMemo } from 'react';
import { TaskContext } from '../../Context/TaskContext';
import { ProgressCard } from './ProgressCard';
import { StatusCounter } from './StatusCounter';
import styles from './Analytics.module.css';

/**
 * AnalyticsBar Component (Member 2 Deliverable)
 * Dynamic progress bar, status counters (TODO, DOING, DONE), and top filter input.
 * Fully responsive, accessible, and performance-optimized.
 */
export const AnalyticsBar = () => {
  const context = useContext(TaskContext);
  const tasks = context?.tasks || [];
  const searchQuery = context?.searchQuery || '';
  const setSearchQuery = context?.setSearchQuery || (() => {});

  // 1. Single-pass memoized metrics computation (O(N))
  const { totalTasks, todoCount, doingCount, doneCount, percentage } = useMemo(() => {
    let todo = 0;
    let doing = 0;
    let done = 0;

    for (let i = 0; i < tasks.length; i++) {
      const normalized = tasks[i]?.status?.toUpperCase()?.replace(/[\s-_]/g, '') || '';
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
    <section className={styles.analyticsContainer} aria-label="Task Analytics & Filters">
      {/* Dynamic Progress Metric */}
      <ProgressCard
        totalTasks={totalTasks}
        doneCount={doneCount}
        percentage={percentage}
      />

      <div className={styles.divider} aria-hidden="true" />

      {/* Status Counters */}
      <div className={styles.statusGroup}>
        <StatusCounter label="TODO" count={todoCount} statusType="todo" />
        <StatusCounter label="DOING" count={doingCount} statusType="doing" />
        <StatusCounter label="DONE" count={doneCount} statusType="done" />
      </div>

      {/* Live Search & Filter Input Field */}
      <div className={styles.searchWrapper}>
        <svg
          className={styles.searchIcon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>

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
            aria-label="Clear search filter"
          >
            ✕
          </button>
        )}
      </div>
    </section>
  );
};

export default AnalyticsBar;
