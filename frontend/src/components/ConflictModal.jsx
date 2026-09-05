import React from 'react';

export const ConflictModal = ({ isOpen, conflictData, onResolve }) => {
  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
        <h3 style={modalStyles.title}>⚠️ Sync Conflict Detected</h3>
        <p style={modalStyles.description}>
          The task <strong>"{conflictData?.title}"</strong> was modified on the server while you were offline.
        </p>
        
        <div style={modalStyles.detailsContainer}>
          <div style={modalStyles.detailBox}>
            <h4>Your Local Version</h4>
            <p><strong>Status:</strong> {conflictData?.local?.status}</p>
            <p><strong>Assignee:</strong> {conflictData?.local?.assignee}</p>
          </div>
          <div style={modalStyles.detailBox}>
            <h4>Server Version</h4>
            <p><strong>Status:</strong> {conflictData?.server?.status}</p>
            <p><strong>Assignee:</strong> {conflictData?.server?.assignee}</p>
          </div>
        </div>

        <div style={modalStyles.buttonGroup}>
          <button 
            onClick={() => onResolve('keepLocal')} 
            style={{ ...modalStyles.button, backgroundColor: '#3b82f6', color: '#fff' }}
          >
            Overwrite with My Version
          </button>
          <button 
            onClick={() => onResolve('acceptServer')} 
            style={{ ...modalStyles.button, backgroundColor: '#64748b', color: '#fff' }}
          >
            Accept Server Version
          </button>
        </div>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    color: '#dc2626',
    marginTop: 0,
  },
  description: {
    color: '#334155',
    fontSize: '0.95rem',
  },
  detailsContainer: {
    display: 'flex',
    gap: '12px',
    margin: '16px 0',
  },
  detailBox: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.85rem',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
};

export default ConflictModal;