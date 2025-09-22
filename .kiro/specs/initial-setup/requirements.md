# Requirements Document

## Introduction

A minimalist todo application built with Next.js that emphasizes focus and productivity by providing two distinct views: a "doing" view for concentrated work on the current task, and a "planning" view for managing the todo list. The app prioritizes the present moment by defaulting to the focused "doing" view while keeping planning activities accessible but secondary. For the MVP, data will be stored in local storage with future plans to integrate Convex for backend functionality.

## Requirements

### Requirement 1

**User Story:** As a user, I want to focus on my current task without distractions, so that I can maintain productivity and avoid overwhelm from seeing my entire todo list.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL display the "doing" view as the default interface
2. WHEN I am in the "doing" view THEN the system SHALL show only the current task without displaying the full todo list or next tasks
3. WHEN there is a current task THEN the system SHALL display the task title, description, priority, tags, and color along with a button to mark the task as complete
4. WHEN there are no tasks available THEN the system SHALL display an appropriate empty state message

### Requirement 2

**User Story:** As a user, I want to access my planning view when needed, so that I can add new tasks and manage my todo list without losing focus on my current work.

#### Acceptance Criteria

1. WHEN I need to plan or add tasks THEN the system SHALL provide a drawer that opens from the left side of the screen
2. WHEN the planning drawer is closed THEN the system SHALL return to the focused "doing" view
3. WHEN there are no todo items in the list THEN the system SHALL highlight the planning view button to encourage task creation
4. WHEN there are existing todo items THEN the system SHALL display the planning view button in a normal state

### Requirement 3

**User Story:** As a user, I want to create and manage todo items with comprehensive details, so that I can organize my tasks effectively with proper context and prioritization.

#### Acceptance Criteria

1. WHEN creating a new todo item THEN the system SHALL allow me to enter a title, description, priority, tags, and color
2. WHEN a todo item is created THEN the system SHALL automatically set the createdDate to the current timestamp
3. WHEN a todo item is created THEN the system SHALL set the initial status appropriately
4. WHEN managing todo items THEN the system SHALL allow me to view and edit all task properties
5. WHEN I assign tags to a task THEN the system SHALL support multiple tags per task
6. WHEN I set a priority THEN the system SHALL provide clear priority levels (e.g., high, medium, low)

### Requirement 4

**User Story:** As a user, I want my todo data to persist between sessions, so that I don't lose my tasks when I close and reopen the application.

#### Acceptance Criteria

1. WHEN I create, update, or delete todo items THEN the system SHALL save the changes to local storage immediately
2. WHEN I reload the application THEN the system SHALL restore all todo items from local storage
3. WHEN local storage is unavailable THEN the system SHALL gracefully handle the error and inform the user
4. WHEN the app initializes THEN the system SHALL load existing data and display the appropriate view based on available tasks

### Requirement 5

**User Story:** As a user, I want to update task status and progress through my todo list, so that I can track completion and move to the next task seamlessly.

#### Acceptance Criteria

1. WHEN I complete a task THEN the system SHALL allow me to mark it as completed
2. WHEN a task is marked complete THEN the system SHALL automatically display the next available task in the "doing" view
3. WHEN I want to change task status THEN the system SHALL provide clear status options (e.g., pending, in-progress, completed)
4. WHEN all tasks are completed THEN the system SHALL display an appropriate completion state and highlight the planning button

### Requirement 6

**User Story:** As a user, I want to reorder my todo items in the planning view, so that I can prioritize tasks according to my current needs and preferences.

#### Acceptance Criteria

1. WHEN I am in the planning view THEN the system SHALL allow me to drag and drop todo items to reorder them manually
2. WHEN I drag a todo item THEN the system SHALL provide visual feedback showing the new position
3. WHEN I drop a todo item in a new position THEN the system SHALL update the order and persist the changes to local storage
4. WHEN I want to sort by priority THEN the system SHALL provide a button to automatically order all todos by priority level (high, medium, low)
5. WHEN I click the priority sort button THEN the system SHALL reorder all tasks with high priority first, followed by medium, then low priority tasks
6. WHEN tasks have the same priority level THEN the system SHALL maintain their relative order or sort by creation date

### Requirement 7

**User Story:** As a user, I want a responsive and intuitive interface, so that I can use the app effectively on different devices and screen sizes.

#### Acceptance Criteria

1. WHEN using the app on mobile devices THEN the system SHALL provide a touch-friendly interface with appropriate sizing
2. WHEN using the app on desktop THEN the system SHALL optimize the layout for larger screens
3. WHEN interacting with the planning drawer THEN the system SHALL provide smooth animations and transitions
4. WHEN the interface loads THEN the system SHALL display content quickly and responsively
5. WHEN using keyboard navigation THEN the system SHALL support standard keyboard shortcuts and tab navigation