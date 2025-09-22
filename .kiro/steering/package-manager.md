# Package Manager Configuration

## Important: Use Bun, Not npm

This project uses **Bun** as the package manager, not npm or yarn.

### Commands to Use:
- `bun install` - Install dependencies
- `bun add <package>` - Add new dependency
- `bun remove <package>` - Remove dependency
- `bun run <script>` - Run package.json scripts

### Commands to Avoid:
- ❌ `npm install`
- ❌ `npm run <script>`
- ❌ `yarn install`
- ❌ `yarn <script>`

### Testing:
- Use `bun run test` (which runs Jest)
- Do NOT use `bun test` (Bun's built-in test runner)

### Why Bun?
- Faster package installation
- Better performance
- Modern JavaScript runtime
- Compatible with Node.js ecosystem

### Lockfile:
- Uses `bun.lock` (committed to repo)
- Do not commit `package-lock.json` or `yarn.lock`