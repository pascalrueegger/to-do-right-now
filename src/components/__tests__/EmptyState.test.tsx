import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders no-tasks state correctly', () => {
    render(<EmptyState type="no-tasks" />);
    
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Start by adding your first task to get organized and focused.')).toBeInTheDocument();
    expect(screen.queryByText('Add your first task')).not.toBeInTheDocument(); // No button without onAddTask
  });

  it('renders all-completed state correctly', () => {
    render(<EmptyState type="all-completed" />);
    
    expect(screen.getByText('All tasks completed!')).toBeInTheDocument();
    expect(screen.getByText('Great job! You\'ve completed all your tasks. Time to add new ones or take a well-deserved break.')).toBeInTheDocument();
  });

  it('renders no-current-task state correctly', () => {
    render(<EmptyState type="no-current-task" />);
    
    expect(screen.getByText('No current task')).toBeInTheDocument();
    expect(screen.getByText('All your tasks are either completed or none are available. Add a new task to get started.')).toBeInTheDocument();
  });

  it('shows add task button when onAddTask is provided', () => {
    const mockAddTask = jest.fn();
    
    render(<EmptyState type="no-tasks" onAddTask={mockAddTask} />);
    
    expect(screen.getByText('Add your first task')).toBeInTheDocument();
  });

  it('calls onAddTask when button is clicked', () => {
    const mockAddTask = jest.fn();
    
    render(<EmptyState type="no-tasks" onAddTask={mockAddTask} />);
    
    fireEvent.click(screen.getByText('Add your first task'));
    expect(mockAddTask).toHaveBeenCalledTimes(1);
  });

  it('shows correct action text for different states', () => {
    const mockAddTask = jest.fn();
    
    const { rerender } = render(<EmptyState type="no-tasks" onAddTask={mockAddTask} />);
    expect(screen.getByText('Add your first task')).toBeInTheDocument();
    
    rerender(<EmptyState type="all-completed" onAddTask={mockAddTask} />);
    expect(screen.getByText('Add more tasks')).toBeInTheDocument();
    
    rerender(<EmptyState type="no-current-task" onAddTask={mockAddTask} />);
    expect(screen.getByText('Add a task')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState type="no-tasks" className="custom-class" />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('displays appropriate icons for different states', () => {
    const { rerender } = render(<EmptyState type="no-tasks" />);
    
    // Check that icons are rendered (we can't easily test specific icons, but we can check they exist)
    expect(document.querySelector('svg')).toBeInTheDocument();
    
    rerender(<EmptyState type="all-completed" />);
    expect(document.querySelector('svg')).toBeInTheDocument();
    
    rerender(<EmptyState type="no-current-task" />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<EmptyState type="no-tasks" onAddTask={() => {}} />);
    
    // Check heading structure
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    
    // Check button accessibility
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders without onAddTask prop', () => {
    render(<EmptyState type="no-tasks" />);
    
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('maintains consistent layout structure', () => {
    render(<EmptyState type="no-tasks" onAddTask={() => {}} />);
    
    // Check that the card structure is present
    const card = screen.getByText('No tasks yet').closest('[class*="rounded-lg"]');
    expect(card).toBeInTheDocument();
    
    // Check that content is centered (the outer wrapper has the centering classes)
    const outerWrapper = screen.getByText('No tasks yet').closest('[class*="min-h-"]');
    expect(outerWrapper).toHaveClass('items-center', 'justify-center');
  });
});