# Project Development Guidelines

## 1. Build & Configuration

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
npm install
```

### Development Server
Starts the Vite development server on `http://localhost:3000`.
```bash
npm run dev
```

### Build
Builds the project for production. The output will be in the `dist` directory.
Note: The project is configured with a base path of `/test/` in `vite.config.ts`.
```bash
npm run build
```

### Deployment
The project uses `gh-pages` for deployment.
```bash
npm run deploy
```

## 2. Testing Information

### Framework
The project uses **Vitest** for unit and integration testing.

### Running Tests
- **Watch Mode**: `npm run test`
- **Single Run**: `npm run test:run`

### Adding New Tests
Tests should be placed alongside the files they test or in a dedicated `__tests__` directory, using the `.spec.ts` or `.test.ts` extension.

#### Example Test
```typescript
import { describe, it, expect } from 'vitest';
import { getDescription } from '@/shared/utils';

describe('getDescription', () => {
  it('should replace {value} with the provided number', () => {
    const template = 'Deal {value} damage';
    const result = getDescription(template, 5);
    expect(result).toBe('Deal 5 damage');
  });
});
```

## 3. Additional Development Information

### Architecture
The project follows a **Feature-Sliced Design (FSD)** inspired architecture:
- `src/app`: Global setup (providers, stores, global styles).
- `src/entities`: Business entities (Card, Hero).
- `src/features`: User interactions and features (Battle, Deck).
- `src/shared`: Reusable components, utilities, and configuration.
- `src/server`: Mock/Client-side server logic (Socket simulations).

### Code Style & Best Practices
- **State Management**: Uses `zustand` for global state (e.g., `gameStore.ts`).
- **Styling**: Uses **Tailwind CSS** with `tailwind-merge` and `clsx` via a `cn` utility.
- **Animations**: Powered by **Framer Motion**.
- **Icons**: Uses `lucide-react`.
- **Imports**: Use the `@/` alias to reference the `src` directory.

### Key Files
- `src/shared/utils.ts`: Contains core utility functions like `createGameCard` and `shuffleDeck`.
- `src/app/model/gameStore.ts`: The main game engine state.
- `src/features/battle/useBattleSystem.ts`: Orchestrates the battle logic.
