import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../components/Board/TaskCard';
import { useTasks } from '../../hooks/useTasks';

vi.mock('../../hooks/useTasks', () => ({
  useTasks: vi.fn(),
}));

describe('TaskCard Component', () => {
  const mockMoveTask = vi.fn();
  const mockDeleteTask = vi.fn();

  beforeEach(() => {
    useTasks.mockReturnValue({
      moveTask: mockMoveTask,
      deleteTask: mockDeleteTask,
    });
  });

  const mockTask = {
    id: '1',
    title: 'Integration testing pass',
    assignee: 'Riku Tanaka',
    dueDate: 'Aug 28, 2026',
    status: 'TODO' 
  };

  it('renders card title and details as expected', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Integration testing pass')).toBeInTheDocument();
  });

  it('fires handler functions when Move and Delete buttons are clicked', () => {
    render(<TaskCard task={mockTask} />);
    
    const moveButtons = screen.getAllByRole('button', { name: /move/i });
    fireEvent.click(moveButtons[0]);
    expect(mockMoveTask).toHaveBeenCalled();

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockDeleteTask).toHaveBeenCalledTimes(1);
  });
});