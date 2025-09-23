# Implementation Plan

- [x] 1. Set up Next.js project foundation and core dependencies
  - Initialize Next.js 14+ project with TypeScript and Tailwind CSS
  - Install and configure shadcn/ui with required components
  - Set up project structure with folders for components, hooks, lib, and context
  - Configure ESLint and Prettier for code consistency
  - _Requirements: 7.4_

- [x] 2. Create core TypeScript interfaces and utilities
  - Define Todo interface with all required properties (id, title, description, priority, tags, color, createdDate, status, order)
  - Create TodoState and TodoAction types for state management
  - Implement utility functions for data validation and formatting
  - Create constants file for priority levels and default values
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Implement local storage service with error handling
  - Create useLocalStorage hook with get, set, and remove operations
  - Implement JSON serialization/deserialization with validation
  - Add error handling for QuotaExceededError and SecurityError scenarios
  - Create fallback mechanisms for when localStorage is unavailable
  - Write unit tests for storage operations and error scenarios
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4. Build todo state management system
  - Create TodoContext with React Context and useReducer
  - Implement reducer functions for all TodoAction types (ADD_TODO, UPDATE_TODO, DELETE_TODO, etc.)
  - Create useTodos hook that combines context with localStorage persistence
  - Add logic to determine current task (first non-completed task in order)
  - Write unit tests for state management and reducer functions
  - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.3_

- [x] 5. Create basic UI components using shadcn/ui
  - Install and configure shadcn/ui components: button, input, select, badge, card, drawer
  - Create TaskCard component to display todo items with all properties
  - Build EmptyState component for when no tasks are available
  - Implement responsive layout components with proper Tailwind classes
  - Write unit tests for component rendering and prop handling
  - _Requirements: 1.4, 5.4, 7.1, 7.2_

- [x] 6. Implement the main "doing" view interface
  - Create DoingView component that displays current task or empty state
  - Show task title, description, priority badge, tags, and color indicator
  - Add "Mark Complete" button with proper styling and accessibility
  - Implement task completion logic that updates status and advances to next task
  - Handle edge cases when no tasks are available or all tasks are completed
  - Write unit tests for doing view behavior and task completion flow
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2_

- [x] 7. Build the planning drawer interface
  - Create PlanningDrawer component using shadcn/ui drawer/sheet component
  - Implement slide-in animation from left side with backdrop
  - Add drawer toggle button with highlighted state when no todos exist
  - Handle drawer open/close with keyboard shortcuts (Escape key)
  - Ensure drawer closes on backdrop click and maintains focus management
  - Write unit tests for drawer behavior and accessibility
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.3, 7.5_

- [x] 8. Create task form for adding and editing todos
  - Build TaskForm component with fields for title, description, priority, tags, and color
  - Implement form validation with real-time feedback for required fields
  - Add tag input with support for multiple tags and proper formatting
  - Create color picker interface for task categorization
  - Handle form submission with proper error handling and success feedback
  - Write unit tests for form validation and submission logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 9. Implement task list display in planning drawer
  - Create task list component that renders all todos in current order
  - Display tasks with TaskCard components showing all properties
  - Add edit and delete functionality for existing tasks
  - Implement proper loading states and error handling
  - Ensure list updates immediately when tasks are modified
  - Write unit tests for task list rendering and CRUD operations
  - _Requirements: 3.4, 5.3_

- [ ] 10. Add drag-and-drop reordering functionality
  - Install and configure @dnd-kit/core for accessible drag-and-drop
  - Implement drag handles and visual feedback during dragging
  - Update task order property when items are dropped in new positions
  - Persist reordered tasks to localStorage immediately
  - Add touch support for mobile drag-and-drop interactions
  - Write unit tests for drag-and-drop behavior and order persistence
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11. Implement priority-based automatic sorting
  - Create sort button in planning drawer with clear labeling
  - Implement sorting algorithm that orders by priority (high → medium → low)
  - Handle tasks with same priority by maintaining their previous relative order
  - Update task order properties and persist changes to localStorage
  - Provide visual feedback when sorting is applied
  - Write unit tests for sorting logic and edge cases
  - _Requirements: 6.4, 6.5, 6.6_

- [ ] 12. Add responsive design and mobile optimizations
  - Implement responsive breakpoints for mobile, tablet, and desktop layouts
  - Optimize touch targets for mobile interactions (minimum 44px)
  - Ensure drawer behavior works properly on mobile devices
  - Test and refine animations for smooth performance on all devices
  - Add proper viewport meta tags and mobile-specific CSS
  - Write integration tests for responsive behavior across screen sizes
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 13. Implement keyboard navigation and accessibility
  - Add keyboard shortcuts for common actions (Escape to close drawer, Enter to complete task)
  - Ensure proper tab order and focus management throughout the application
  - Add ARIA labels and roles for screen reader compatibility
  - Implement proper color contrast and visual indicators
  - Test with keyboard-only navigation and screen readers
  - Write accessibility tests and ensure WCAG compliance
  - _Requirements: 7.5_

- [ ] 14. Create comprehensive error handling and user feedback
  - Implement React Error Boundary for graceful error recovery
  - Add user-friendly error messages for storage quota and private browsing issues
  - Create loading states for async operations
  - Add success feedback for completed actions (task completion, saving, etc.)
  - Implement retry mechanisms for failed operations
  - Write unit tests for error scenarios and recovery flows
  - _Requirements: 4.3_

- [ ] 15. Add data persistence and application initialization
  - Implement app initialization that loads existing todos from localStorage
  - Handle data migration for future schema changes
  - Add data export/import functionality for backup purposes
  - Ensure proper cleanup and memory management
  - Test application behavior with various data states (empty, populated, corrupted)
  - Write integration tests for full application lifecycle
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 16. Integrate all components into main application layout
  - Create main layout component that combines DoingView and PlanningDrawer
  - Wire up TodoContext provider at the application root
  - Implement proper component composition and data flow
  - Add global styles and theme configuration
  - Ensure smooth transitions between different application states
  - Write end-to-end tests for complete user workflows
  - _Requirements: 1.1, 2.1, 7.4_