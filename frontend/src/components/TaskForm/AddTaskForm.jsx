import { useState } from 'react';
import { useTasks } from "../../hooks/useTasks";
import styles from './TaskForm.module.css';

const AddTaskForm = () => {
  const { addTask } = useTasks(); 

  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    
    if (title.trim() === '') return setErrorMessage('Task title is required.');
    if (assignee.trim() === '') return setErrorMessage('Assignee is required.');
    if (dueDate === '') return setErrorMessage('Due date is required.');

    setErrorMessage('');
    
  
    addTask({ title, assignee, dueDate });

    // Clear fields
    setTitle('');
    setAssignee('');
    setDueDate('');
  };

  return (
    <div className={styles.formContainer}>
      <p className={styles.formHeading}>ADD TASK</p>
      
      <form onSubmit={handleSubmit} className={styles.formLayout}>
        
        {/* Title Input Field */}
        <div className={styles.inputGroupTitle}>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrorMessage(''); }}
            className={`${styles.inputField} ${errorMessage.includes('title') ? styles.inputFieldError : ''}`}
          />
          {errorMessage.includes('title') && <span className={styles.errorText}>{errorMessage}</span>}
        </div>

        {/* Assignee Input Field */}
        <div className={styles.inputGroupAssignee}>
          <input
            type="text"
            placeholder="Assignee name"
            value={assignee}
            onChange={(e) => { setAssignee(e.target.value); setErrorMessage(''); }}
            className={`${styles.inputField} ${errorMessage.includes('Assignee') ? styles.inputFieldError : ''}`}
          />
          {errorMessage.includes('Assignee') && <span className={styles.errorText}>{errorMessage}</span>}
        </div>

        {/* Due Date Input Field */}
        <div className={styles.inputGroupDate}>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => { setDueDate(e.target.value); setErrorMessage(''); }}
            className={`${styles.inputField} ${errorMessage.includes('Due date') ? styles.inputFieldError : ''}`}
          />
          {errorMessage.includes('Due date') && <span className={styles.errorText}>{errorMessage}</span>}
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitBtn}>
          + Add Task
        </button>
      </form>
    </div>
  );
};

export default AddTaskForm;