import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Column from '../components/Board/Column';

describe('Column Component', () => {
  const mockTasks = [
    { _id: '1', title: 'Task 1', description: 'Desc 1' },
    { _id: '2', title: 'Task 2', description: 'Desc 2' },
  ];

  it('renders the column title properly', () => {
    render(<Column title="TODO" tasks={mockTasks} />);
    expect(screen.getByText('TODO')).toBeInTheDocument();
  });
});