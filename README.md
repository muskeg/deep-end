# 🌊 Deep End

A vibe coded action arcade browser game where you navigate procedurally generated underwater caverns, collect pearls from clams, and manage your oxygen supply before time runs out.

## 🎮 Features

- **Intuitive Controls**: Arrow keys or WASD for movement, Spacebar to interact
- **Procedural Generation**: Unique cavern layouts using Cellular Automata algorithm
- **Progressive Difficulty**: Increasing challenge with more enemies, hazards, and faster oxygen depletion
- **Environmental Hazards**: Water currents and narrow passages that affect movement
- **Hostile Creatures**: Jellyfish and eels with patrol and chase AI behaviors
- **Performance Optimized**: 60 FPS target with WebGL rendering via Phaser.js

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 How to Play

### Controls

- **Arrow Keys** or **WASD**: Move your diver
- **Spacebar**: Interact with clams to collect pearls
- **ESC**: Pause game

### Objective

1. Navigate through underwater caverns
2. Collect all pearls from clams
3. Manage your oxygen supply (depletes over time)
4. Avoid hostile sea creatures
5. Complete levels to progress to harder challenges

### Gameplay Tips

- **Watch your oxygen**: It depletes faster in narrow passages
- **Plan your route**: Collect pearls efficiently
- **Avoid enemies**: Collisions reduce oxygen by 10%
- **Use currents**: Water currents can help or hinder movement

## 🧪 Testing

```bash
# Run unit tests
npm test

# Watch mode for TDD
npm run test:watch

# Coverage report
npm run test:coverage

# Integration tests (E2E)
npm run test:integration

# Integration tests with UI
npm run test:integration:ui
```

## 📁 Project Structure

```
src/
├── main.js              # Game initialization
├── scenes/              # Phaser scenes
│   ├── BootScene.js     # Asset loading
│   ├── MenuScene.js     # Start menu
│   ├── GameScene.js     # Main gameplay
│   └── GameOverScene.js # End game
├── entities/            # Game objects (Player, Enemy, Clam, etc.)
├── systems/             # Game logic (CavernGenerator, Collision, Oxygen)
├── utils/               # Helpers and constants
└── ui/                  # HUD components

tests/
├── unit/                # Jest unit tests
├── integration/         # Playwright E2E tests
├── fixtures/            # Test data
└── helpers/             # Test utilities
```

## 🛠️ Tech Stack

- **Game Framework**: [Phaser.js 3.80+](https://phaser.io/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Unit Testing**: [Jest](https://jestjs.io/)
- **E2E Testing**: [Playwright](https://playwright.dev/)
- **Language**: JavaScript ES6+

## 📊 Game Features by Phase

### Phase 1: MVP (User Story 1)
- ✅ Player movement and controls
- ✅ Pearl collection from clams
- ✅ Oxygen management
- ✅ Game over and level completion

### Phase 2: Environmental Hazards (User Story 2)
- ✅ Water currents
- ✅ Terrain-based oxygen penalties
- ✅ Improved collision physics

### Phase 3: Hostile Creatures (User Story 3)
- ✅ Jellyfish with patrol AI
- ✅ Eels with chase behavior
- ✅ Enemy collision damage

### Phase 4: Procedural Generation (User Story 4)
- ✅ Cellular Automata level generation
- ✅ Progressive difficulty scaling
- ✅ Infinite level progression

## 🎨 Assets

Game uses procedurally generated graphics and placeholder sprites during development. Custom sprites and audio can be added to the `assets/` directory.

## 📝 Development

This project follows Test-Driven Development (TDD) principles:

1. Write failing tests for acceptance criteria
2. Implement minimum code to pass tests
3. Refactor while keeping tests green
4. Repeat for next feature

See [specs/001-underwater-cavern-game/](specs/001-underwater-cavern-game/) for detailed specification, technical plan, and task breakdown.

## 🐛 Known Issues

- None currently

## 🤝 Contributing

This is a learning/demo project. Feel free to fork and experiment!

## 📜 License

MIT

## 🎓 Learn More

- [Phaser Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Cellular Automata for Game Development](https://www.roguebasin.com/index.php/Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels)
- [Game Design Patterns](https://gameprogrammingpatterns.com/)

---

Built with ❤️ using Phaser.js and modern web technologies
