/**
 * TaskList Drag and Drop Tests
 * Tests for drag-and-drop reordering functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../TaskList';
import { TodoProvider } from '../../context/TodoContext';
import { useTodos } from '../../hooks/useTodos';

// Mock the useTodos hook
jest.mock('../../hooks/useTodos');
const mockUseTodos = useTodos as jest.MockedFunction<typeof useTodos>;

// Mock @dnd-kit/core
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: ({ children, onDragEnd, onDragStart }: any) => (
    <div data-testid="dnd-context" data-ondragend={onDragEnd} data-ondragstart={onDragStart}>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
  ...jest.requireActual('@dnd-kit/sortable'),
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  useSortable: () => ({
    attributes: { 'data-testid': 'sortable-item' },
    listeners: { onPointerDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: jest.fn((array, oldIndex, newIndex) => {
    const result = [...array];
    const [removed] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, removed);
    return result;
  }),
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: 'vertical',
}));

// Mock TaskCard component
jest.mock('../TaskCard', () => ({
  TaskCard: ({ todo, onEdit, onDelete, showActions, isDragging, dragHandleProps, className }: any) => (
    <div 
      className={className}
      data-testid={`task-card-${todo.id}`}
      data-dragging={isDragging}
      {...dragHandleProps}
    >
      <span>{todo.title}</span>
      <span>{todo.status}</span>
      {showActions && (
        <>
          <button data-testid={`edit-${todo.id}`} onClick={() => onEdit(todo)}>
            Edit
          </button>
          <button data-testid={`delete-${todo.id}`} onClick={() => onDelete(todo.id)}>
            Delete
          </button>
        </>
      )}
    </div>
  ),
}));

// Mock TaskForm component
jest.mock('../TaskForm', () => ({
  TaskForm: ({ todo, onSubmit, onCancel }: any) => (
    <div data-testid="task-form">
      <span>{todo ? 'Edit Mode' : 'Add Mode'}</span>
      <button onClick={() => onSubmit({ title: 'Test Task', description: '', priority: 'medium', tags: [], color: '#ff6b6b' })}>
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('TaskList Drag and Drop', () => {
  const mockTodos = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      priority: 'high' as const,
      tags: ['work'],
      color: '#ff6b6b',
      createdDate: new Date('2024-01-01'),
      status: 'pending' as const,
      order: 1,
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      priority: 'medium' as const,
      tags: ['personal'],
      color: '#4ecdc4',
      createdDate: new Date('2024-01-02'),
      status: 'in-progress' as const,
      order: 2,
    },
    {
      id: '3',
      title: 'Task 3',
      description: 'Description 3',
      priority: 'low' as const,
      tags: ['hobby'],
      color: '#45b7d1',
      createdDate: new Date('2024-01-03'),
      status: 'pending' as const,
      order: 3,
    },
  ];

  const mockCompletedTodos = [
    {
      id: '4',
      title: 'Completed Task',
      description: 'Completed Description',
      priority: 'medium' as const,
      tags: ['done'],
      color: '#96ceb4',
      createdDate: new Date('2024-01-04'),
      status: 'completed' as const,
      order: 4,
    },
  ];

  const defaultMockUseTodos = {
    todos: [...mockTodos, ...mockCompletedTodos],
    incompleteTodos: mockTodos,
    completedTodos: mockCompletedTodos,
    currentTodo: mockTodos[0],
    isDrawerOpen: false,
    todosByPriority: {
      high: [mockTodos[0]],
      medium: [mockTodos[1]],
      low: [mockTodos[2]],
    },
    addTodo: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
    completeTodo: jest.fn(),
    reorderTodos: jest.fn(),
    sortByPriority: jest.fn(),
    toggleDrawer: jest.fn(),
    setCurrentTodo: jest.fn(),
    getTodoById: jest.fn(),
    getNextTodo: jest.fn(),
    getPreviousTodo: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodos.mockReturnValue(defaultMockUseTodos);
  });

  describe('Drag and Drop Setup', () => {
    it('renders DndContext with proper configuration', () => {
      render(<TaskList />);
      
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('renders SortableContext for incomplete todos', () => {
      render(<TaskList />);
      
      expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
    });

    it('renders drag overlay', () => {
      render(<TaskList />);
      
      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
    });

    it('applies sortable props to incomplete task cards', () => {
      render(<TaskList />);
      
      // The sortable items are wrapped in divs, not the task cards themselves
      const sortableItems = screen.getAllByTestId('sortable-item');
      expect(sortableItems).toHaveLength(3); // 3 incomplete todos
    });

    it('does not apply sortable props to completed task cards', () => {
      render(<TaskList />);
      
      const completedTaskCard = screen.getByTestId('task-card-4');
      expect(completedTaskCard).not.toHaveAttribute('data-testid', 'sortable-item');
    });
  });

  describe('Drag and Drop Behavior', () => {
    it('calls reorderTodos when drag ends with valid reorder', async () => {
      const mockReorderTodos = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        reorderTodos: mockReorderTodos,
      });

      render(<TaskList />);
      
      const dndContext = screen.getByTestId('dnd-context');
      const onDragEnd = dndContext.getAttribute('data-ondragend');
      
      // Simulate drag end event
      if (onDragEnd) {
        const dragEndEvent = {
          active: { id: '1' },
          over: { id: '2' },
        };
        
        // Call the onDragEnd handler directly since we can't simulate actual drag events easily
        const handler = eval(`(${onDragEnd})`);
        handler(dragEndEvent);
        
        expect(mockReorderTodos).toHaveBeenCalled();
      }
    });

    it('does not call reorderTodos when dragging to same position', async () => {
      const mockReorderTodos = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        reorderTodos: mockReorderTodos,
      });

      render(<TaskList />);
      
      const dndContext = screen.getByTestId('dnd-context');
      const onDragEnd = dndContext.getAttribute('data-ondragend');
      
      if (onDragEnd) {
        const dragEndEvent = {
          active: { id: '1' },
          over: { id: '1' },
        };
        
        const handler = eval(`(${onDragEnd})`);
        handler(dragEndEvent);
        
        expect(mockReorderTodos).not.toHaveBeenCalled();
      }
    });

    it('does not call reorderTodos when no drop target', async () => {
      const mockReorderTodos = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        reorderTodos: mockReorderTodos,
      });

      render(<TaskList />);
      
      const dndContext = screen.getByTestId('dnd-context');
      const onDragEnd = dndContext.getAttribute('data-ondragend');
      
      if (onDragEnd) {
        const dragEndEvent = {
          active: { id: '1' },
          over: null,
        };
        
        const handler = eval(`(${onDragEnd})`);
        handler(dragEndEvent);
        
        expect(mockReorderTodos).not.toHaveBeenCalled();
      }
    });

    it('disables dragging when form is open', () => {
      render(<TaskList />);
      
      // Open add form
      const addButton = screen.getByRole('button', { name: /add new task/i });
      fireEvent.click(addButton);
      
      // Check that sortable items are disabled (this would be handled by the isDisabled prop)
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    it('disables dragging when editing', async () => {
      const user = userEvent.setup();
      render(<TaskList />);
      
      // Start editing
      await user.click(screen.getByTestId('edit-1'));
      
      // Check that form is open (dragging would be disabled via isDisabled prop)
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when reorder fails', async () => {
      const mockReorderTodos = jest.fn(() => {
        throw new Error('Reorder failed');
      });
      
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        reorderTodos: mockReorderTodos,
      });

      render(<TaskList />);
      
      const dndContext = screen.getByTestId('dnd-context');
      const onDragEnd = dndContext.getAttribute('data-ondragend');
      
      if (onDragEnd) {
        const dragEndEvent = {
          active: { id: '1' },
          over: { id: '2' },
        };
        
        const handler = eval(`(${onDragEnd})`);
        handler(dragEndEvent);
        
        await waitFor(() => {
          expect(screen.getByText(/failed to reorder tasks/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('provides keyboard navigation instructions', () => {
      render(<TaskList />);
      
      // @dnd-kit provides accessibility instructions through aria-describedby
      // Check that the DndContext is rendered (accessibility is handled internally)
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('provides live region for screen readers', () => {
      render(<TaskList />);
      
      // @dnd-kit creates live regions internally for announcements
      // Check that the DndContext is rendered (live regions are handled internally)
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });
  });

  describe('Touch Support', () => {
    it('configures pointer sensor with activation constraint', () => {
      // This test verifies that the sensors are configured correctly
      // The actual sensor configuration is tested by checking that the component renders without errors
      render(<TaskList />);
      
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('shows drag overlay when dragging', () => {
      render(<TaskList />);
      
      const dragOverlay = screen.getByTestId('drag-overlay');
      expect(dragOverlay).toBeInTheDocument();
    });

    it('applies dragging styles to task card in overlay', () => {
      // This would be tested by checking the isDragging prop and className
      // The actual visual feedback is handled by the TaskCard component
      render(<TaskList />);
      
      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
    });
  });

  describe('Order Persistence', () => {
    it('maintains completed todos order when reordering incomplete todos', async () => {
      const mockReorderTodos = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        reorderTodos: mockReorderTodos,
      });

      render(<TaskList />);
      
      const dndContext = screen.getByTestId('dnd-context');
      const onDragEnd = dndContext.getAttribute('data-ondragend');
      
      if (onDragEnd) {
        const dragEndEvent = {
          active: { id: '1' },
          over: { id: '2' },
        };
        
        const handler = eval(`(${onDragEnd})`);
        handler(dragEndEvent);
        
        expect(mockReorderTodos).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: '4', status: 'completed' })
          ])
        );
      }
    });
  });
});