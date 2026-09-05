import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Column } from '../components/Board/Column';
import { useTasks } from '../hooks/useTasks';

vi.mock('../hooks/useTasks', () => ({
  useTasks: vi.fn(),
}));

describe('Column Component', () => {
  beforeEach(() => {
    useTasks.mockReturnValue({
      moveTask: vi.fn(),
      deleteTask: vi.fn(),
    });
  });

  const mockTasks = [
    { id: '1', title: 'Integration testing pass', assignee: 'Riku Tanaka', dueDate: 'Aug 28, 2026', status: 'TODO' },
    { id: '2', title: 'Performance audit', assignee: 'Sam Patel', dueDate: 'Sep 1, 2026', status: 'TODO' },
  ];

  it('renders the column title properly', () => {
    render(<Column title="TODO" tasks={mockTasks} statusType="todo" />);
    
    expect(screen.getByText('TODO')).toBeInTheDocument();
  });

  it('renders the correct task cards inside the column', () => {
    render(<Column title="TODO" tasks={mockTasks} statusType="todo" />);
    
    expect(screen.getByText('Integration testing pass')).toBeInTheDocument();
    expect(screen.getByText('Performance audit')).toBeInTheDocument();
  });
});