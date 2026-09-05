import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Column from '../components/Board/Column';

describe('Column Component', () => {
  const mockTasks = [
    { _id: '1', title: 'Integration testing pass', assignee: 'Riku Tanaka', dueDate: 'Aug 28, 2026' },
    { _id: '2', title: 'Performance audit', assignee: 'Sam Patel', dueDate: 'Sep 1, 2026' },
  ];

  it('renders the column title properly', () => {
    render(<Column title="TODO" tasks={mockTasks} />);
    
    expect(screen.getByText('TODO')).toBeInTheDocument();
  });

  it('renders the correct task cards inside the column', () => {
    render(<Column title="TODO" tasks={mockTasks} />);
    
    expect(screen.getByText('Integration testing pass')).toBeInTheDocument();
    expect(screen.getByText('Performance audit')).toBeInTheDocument();
  });
});