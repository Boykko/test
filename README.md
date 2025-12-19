# Chaos Age: Card Battles

Chaos Age: Card Battles is a tactical card battle game built with React, Vite, and Tailwind CSS. Players can build decks, engage in strategic battles in the arena, and manage their collection.

## 🚀 Overview

The game features a rich set of mechanics including card abilities, status effects (poison, freeze, taunt), and dynamic battle animations. It is architected using a Feature-Sliced Design (FSD) approach for scalability and maintainability.

## ✨ Features

- **Battle Arena**: Engage in turn-based combat with dynamic animations and visual effects.
- **Deck Builder**: Customize your deck from a collection of unique cards.
- **Admin Dashboard**: Manage game data and configurations.
- **Sophisticated Combat System**: Includes mechanics like targeting, abilities, and status effects.
- **Visual Effects**: Powered by Framer Motion and custom CSS animations for an immersive experience.
- **Audio Support**: Integrated sound effects using Howler.js.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Audio**: [Howler.js](https://howlerjs.com/)
- **Deployment**: [gh-pages](https://github.com/tschaub/gh-pages)

## 📋 Requirements

- **Node.js**: v18 or higher recommended
- **npm**: v9 or higher

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd chaos-age_-card-battles
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Currently, the project does not require specific environment variables to run locally. 
   - [ ] TODO: Document any upcoming environment variables here.

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server on port 3000.
- `npm run build`: Builds the project for production (output in `dist/`). Note: Base path is set to `/test/`.
- `npm run preview`: Previews the production build locally.
- `npm run deploy`: Deploys the production build to GitHub Pages.
- `npm run test`: Runs Vitest in watch mode.
- `npm run test:run`: Runs Vitest once and exits.

## 🏗️ Project Structure

The project follows a **Feature-Sliced Design (FSD)** inspired architecture:

- `src/app`: Global setup, providers, and global styles.
- `src/entities`: Business entities like Card and Hero components.
- `src/features`: User interactions and complex features (Battle, Deck management).
- `src/widgets`: High-level page components (BattleArena, DeckBuilder, MainMenu).
- `src/shared`: Reusable components, utilities, hooks, and configurations.
- `src/server`: Mock server logic and socket simulations.

## 🧪 Testing

The project uses **Vitest** for unit and integration testing.

- **Run tests**: `npm run test`
- **Location**: Tests are located alongside the files they test or in `__tests__` directories using `.spec.ts` or `.test.ts` extensions.

## 🚀 Deployment

The project is configured to deploy to GitHub Pages. 
The production build is generated with a base path of `/test/`.

```bash
npm run deploy
```

## 📄 License

- [ ] TODO: Add license information.
