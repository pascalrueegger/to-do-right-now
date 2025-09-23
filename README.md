# to-do-right-now, Kiro branch
This should have been a minimalist todo app focussing on the right now, but Kiro was not able to debug the code it had written, so this vibe coding project will be frozen in this state.

## Development

This project uses [Bun](https://bun.sh) as the package manager and runtime.

### Prerequisites

Make sure you have Bun installed:
```bash
curl -fsSL https://bun.sh/install | bash
```

### Getting Started

1. Install dependencies:
```bash
bun install
```

2. Run the development server:
```bash
bun run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run test` - Run tests with Jest
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Run ESLint with auto-fix
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting

### Important Notes

- **Package Manager**: This project uses Bun, not npm or yarn
- **Test Runner**: Uses Jest (run via `bun run test`)
- **Lockfile**: Uses `bun.lock`, not `package-lock.json` or `yarn.lock`
