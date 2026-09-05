import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../components/Board/TaskCard';

describe('TaskCard Component', () => {
  const mockTask = {
    title: 'Integration testing pass',
    assignee: 'Riku Tanaka',
    dueDate: 'Aug 28, 2026'
  };

  const mockOnDelete = vi.fn();
  const mockOnMove = vi.fn();

  it('renders card title and details as expected', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Integration testing pass')).toBeInTheDocument();
  });

  it('fires handler functions when Move and Delete buttons are clicked', () => {
    render(<TaskCard task={mockTask} onDelete={mockOnDelete} onMove={mockOnMove} />);
    
    
    const moveButtons = screen.getAllByRole('button', { name: /move/i });
    fireEvent.click(moveButtons[0]);
    expect(mockOnMove).toHaveBeenCalled();

    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});