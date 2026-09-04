import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../components/Board/TaskCard';


describe('TaskCard Component', () => {
  const mockTask = {
    title: 'Update Database',
    description: 'Fix the MongoDB connection string'
  };

  // vi.fn() or jest.fn() will be used depending on Role 4's test setup
  const mockOnDelete = vi.fn(); 
  const mockOnEdit = vi.fn();

  it('renders card title and descriptions as expected', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Update Database')).toBeInTheDocument();
    expect(screen.getByText('Fix the MongoDB connection string')).toBeInTheDocument();
  });

  it('fires handler functions when action buttons are clicked', () => {
    render(<TaskCard task={mockTask} onDelete={mockOnDelete} onEdit={mockOnEdit} />);
    
    // Test the Edit button 
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);

    // Test the Delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});