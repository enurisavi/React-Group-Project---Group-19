import React from 'react';
import styles from './Analytics.module.css';

/**
 * ProgressCard Component (Member 2 Deliverable)
 * Renders the task completion progress fraction, visual bar, and percentage.
 *
 * @param {Object} props
 * @param {number} props.totalTasks - Total number of tasks
 * @param {number} props.doneCount - Number of completed tasks (DONE)
 * @param {number} props.percentage - Calculated completion percentage ((Done / Total) * 100)
 */
export const ProgressCard = ({ totalTasks = 0, doneCount = 0, percentage = 0 }) => {
  const safePercentage = Math.min(100, Math.max(0, Math.round(percentage) || 0));
  const taskUnitText = totalTasks === 1 ? 'task completed' : 'tasks completed';

  return (
    <div className={styles.progressSection}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>PROGRESS</span>
        <span className={styles.progressFraction}>
          {doneCount}/{totalTasks}
        </span>
      </div>

      <div className={styles.progressMain}>
        <span className={styles.boldCount}>
          {doneCount} of {totalTasks}
        </span>
        <span className={styles.subText}>{taskUnitText}</span>
      </div>

      <div
        className={styles.barTrack}
        role="progressbar"
        aria-label="Task completion progress"
        aria-valuenow={safePercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={styles.barFill}
          style={{ width: `${safePercentage}%` }}
        />
      </div>

      <span className={styles.percentText}>{safePercentage}% complete</span>
    </div>
  );
};

export default ProgressCard;
