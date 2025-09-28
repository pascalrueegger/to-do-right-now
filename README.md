# Todo Right Now

A focused todo app that shows you only what you should be doing right now. Built with Next.js and designed for minimal distraction and maximum productivity.

## Features

- **Focus Mode**: Shows only your current task to minimize overwhelm
- **Planning Drawer**: Manage all your todos from a slide-out drawer
- **Drag & Drop Reordering**: Easily prioritize tasks by dragging them
- **Rich Todo Properties**: Title, description, priority, color coding, tags, and due dates
- **Local Storage**: All data persists in your browser - no account needed
- **Dark Mode**: Modern, easy-on-the-eyes interface
- **Responsive Design**: Works great on desktop and mobile

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Main View**: See your current task with all its details
2. **Complete Tasks**: Click "Mark as Complete" when you're done
3. **Planning**: Click the menu icon (☰) to open the planning drawer
4. **Add Todos**: Use the "Add New Todo" button in the planning drawer
5. **Organize**: Drag and drop todos to reorder them
6. **Edit/Delete**: Use the edit and trash icons on each todo

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Local Storage** - Client-side data persistence

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page (doing view)
├── components/         # React components
│   ├── PlanningDrawer.tsx
│   └── TodoForm.tsx
├── lib/               # Utilities
│   └── storage.ts     # localStorage utilities
└── types/             # TypeScript types
    └── todo.ts
```

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
