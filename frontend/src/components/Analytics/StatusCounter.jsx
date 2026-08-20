import React from 'react';
import styles from './Analytics.module.css';

/**
 * StatusCounter Component (Member 2 Deliverable)
 * Displays individual status badge card (TODO, DOING, DONE) with dot indicator and count.
 *
 * @param {Object} props
 * @param {string} props.label - Status name (TODO | DOING | DONE)
 * @param {number} props.count - Number of tasks with this status
 * @param {'todo' | 'doing' | 'done'} props.statusType - Status type key for dot styling
 */
export const StatusCounter = ({ label, count = 0, statusType = 'todo' }) => {
  const dotClassMap = {
    todo: styles.todoDot,
    doing: styles.doingDot,
    done: styles.doneDot,
  };

  const dotClass = dotClassMap[statusType.toLowerCase()] || styles.todoDot;

  return (
    <div className={styles.statusCard}>
      <div className={styles.cardHeader}>
        <span className={`${styles.dot} ${dotClass}`} />
        <span className={styles.cardTitle}>{label}</span>
      </div>
      <span className={styles.cardValue}>{count}</span>
    </div>
  );
};

export default StatusCounter;
