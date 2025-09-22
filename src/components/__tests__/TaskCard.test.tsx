import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../TaskCard';
import { Todo } from '@/lib/types';

const mockTodo: Todo = {
  id: 'test-id',
  title: 'Test Task',
  description: 'This is a test task description',
  priority: 'high',
  tags: ['work', 'urgent'],
  color: '#ff6b6b',
  createdDate: new Date('2024-01-01'),
  status: 'pending',
  order: 1
};

const mockTodoMinimal: Todo = {
  id: 'test-id-2',
  title: 'Minimal Task',
  description: '',
  priority: 'low',
  tags: [],
  color: '#4ecdc4',
  createdDate: new Date('2024-01-02'),
  status: 'in-progress',
  order: 2
};

describe('TaskCard', () => {
  it('renders task information correctly', () => {
    render(<TaskCard todo={mockTodo} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test task description')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('Status: pending')).toBeInTheDocument();
    expect(screen.getByText('Created: 1/1/2024')).toBeInTheDocument();
  });

  it('renders minimal task without description and tags', () => {
    render(<TaskCard todo={mockTodoMinimal} />);
    
    expect(screen.getByText('Minimal Task')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.getByText('Status: in-progress')).toBeInTheDocument();
    expect(screen.queryByText('This is a test task description')).not.toBeInTheDocument();
  });

  it('applies correct priority styling', () => {
    const { rerender } = render(<TaskCard todo={mockTodo} />);
    
    // High priority should have destructive variant
    expect(screen.getByText('high')).toHaveClass('border-transparent', 'bg-destructive');
    
    rerender(<TaskCard todo={mockTodoMinimal} />);
    
    // Low priority should have secondary variant
    expect(screen.getByText('low')).toHaveClass('border-transparent', 'bg-secondary');
  });

  it('shows action buttons when showActions is true', () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();
    
    render(
      <TaskCard 
        todo={mockTodo} 
        showActions={true}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    );
    
    expect(screen.getByLabelText('Edit task')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete task')).toBeInTheDocument();
  });

  it('hides action buttons when showActions is false', () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();
    
    render(
      <TaskCard 
        todo={mockTodo} 
        showActions={false}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    );
    
    expect(screen.queryByLabelText('Edit task')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete task')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockEdit = jest.fn();
    
    render(
      <TaskCard 
        todo={mockTodo} 
        showActions={true}
        onEdit={mockEdit}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Edit task'));
    expect(mockEdit).toHaveBeenCalledWith(mockTodo);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockDelete = jest.fn();
    
    render(
      <TaskCard 
        todo={mockTodo} 
        showActions={true}
        onDelete={mockDelete}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Delete task'));
    expect(mockDelete).toHaveBeenCalledWith('test-id');
  });

  it('shows drag handle when dragHandleProps are provided', () => {
    const mockDragProps = {
      'data-testid': 'drag-handle'
    };
    
    render(
      <TaskCard 
        todo={mockTodo} 
        showActions={true}
        dragHandleProps={mockDragProps}
      />
    );
    
    expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });

  it('applies dragging styles when isDragging is true', () => {
    const { container } = render(
      <TaskCard 
        todo={mockTodo} 
        isDragging={true}
      />
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('opacity-50', 'rotate-2', 'shadow-lg');
  });

  it('applies custom className', () => {
    const { container } = render(
      <TaskCard 
        todo={mockTodo} 
        className="custom-class"
      />
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('displays color indicator with correct background color', () => {
    render(<TaskCard todo={mockTodo} />);
    
    const colorIndicator = screen.getByLabelText('Color: #ff6b6b');
    expect(colorIndicator).toHaveStyle({ backgroundColor: '#ff6b6b' });
  });

  it('truncates long titles properly', () => {
    const longTitleTodo = {
      ...mockTodo,
      title: 'This is a very long task title that should be truncated when displayed in the card component'
    };
    
    render(<TaskCard todo={longTitleTodo} />);
    
    const titleElement = screen.getByText(longTitleTodo.title);
    expect(titleElement).toHaveClass('truncate');
  });
});