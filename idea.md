I would like to build a minimal todo app, called "Todo right now". The key feature is that helps a user to focus on only the one thing they should be doing right now.

The app wil have two views: a "doing" view, showing the current todo item, and a "planning" view, where the user can create, update, delete and order todo items. The "doing" view is the main view, the "planning" view can be opened through a drawer from the left side.

We will use nextjs with typescript and we will store all data in localStorage so that a user will still have their todos available after closing and reopening the tab. A todo item has a title, description, priority, color, tags dueDate and createdDate.

The app should have a modern looking UI with darkmode.