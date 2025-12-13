# 🌊 Deep End

A vibe coded action arcade browser game where you navigate procedurally generated underwater caverns, collect pearls from clams, and manage your oxygen supply before time runs out.

**🎮 [Play Now on GitHub Pages](https://muskeg.github.io/deep-end/)**

## 🎮 Features

- **Intuitive Controls**: Arrow keys or WASD for movement, Spacebar to interact
- **Procedural Generation**: Unique cavern layouts using Cellular Automata algorithm
- **Progressive Difficulty**: Increasing challenge with more enemies, hazards, and faster oxygen depletion
- **Environmental Hazards**: Water currents and narrow passages that affect movement
- **Hostile Creatures**: Jellyfish and eels with patrol and chase AI behaviors
- **Sound Effects**: Procedurally generated audio for pearls, enemies, and events
- **High Score Tracking**: LocalStorage persistence of your best level reached
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

**Movement:**
- **Arrow Keys** or **WASD**: Move your diver in any direction

**Actions:**
- **Spacebar**: Interact with clams to collect pearls
- **ESC**: Pause/Resume game
- **F**: Toggle FPS counter (debug mode)
- **M**: Toggle audio mute/unmute

### Objective

1. Navigate through procedurally generated underwater caverns
2. Collect all pearls from clams to complete the level
3. Manage your oxygen supply (depletes over time)
4. Avoid hostile sea creatures (jellyfish and eels)
5. Complete levels to progress to harder challenges with increased difficulty

### Gameplay Tips

- **Watch your oxygen meter**: It depletes constantly, and collisions with enemies reduce it by 10%
- **Plan your route**: Collect pearls efficiently to minimize oxygen depletion
- **Avoid enemies**: Jellyfish patrol in patterns, eels chase you when nearby
- **Use water currents**: Green currents push you around - use them strategically or avoid them
- **Pace yourself**: Higher levels have more enemies, faster oxygen depletion, and denser caverns
- **Learn from failure**: Each level is procedurally generated but follows predictable difficulty curves

### Difficulty Progression

The game gets progressively harder with each level:

**Levels 1-5 (Early Game):**
- 3-5 clams per level
- 2-4 water currents
- 1-2 jellyfish
- No eels
- Oxygen depletion: 1.0x rate

**Levels 6-10 (Mid Game):**
- 5-7 clams per level
- 4-6 water currents
- 2-3 jellyfish
- 1 eel appears
- Oxygen depletion: ~1.3x rate
- Caverns become denser

**Levels 11-20 (Late Game):**
- 7-10 clams per level (capped at 10)
- 6-8 water currents (capped at 8)
- 3-5 jellyfish (capped at 5)
- 1-3 eels (capped at 3)
- Oxygen depletion: up to 2.5x rate (capped)
- Caverns reach maximum density

**Scaling Details:**
- Clams: +1 every 2 levels (max 10)
- Currents: +1 every 3 levels (max 8)
- Jellyfish: +1 every 4 levels (max 5)
- Eels: Start at level 2, +1 every 5 levels (max 3)
- Oxygen rate: Logarithmic curve, reaches 2.5x at level ~20
- Cavern complexity: Density increases 0.01 every 5 levels (0.40→0.55)

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

### Phase 1: MVP (User Story 1) ✅
- Player movement and controls (WASD/Arrow keys)
- Pearl collection from clams (Spacebar interaction)
- Oxygen management system
- Game over and level completion
- HUD with oxygen meter and score display

### Phase 2: Environmental Hazards (User Story 2) ✅
- Water currents affecting player movement
- Terrain-based oxygen penalties
- Improved collision physics
- Environmental interaction systems

### Phase 3: Hostile Creatures (User Story 3) ✅
- Jellyfish with patrol AI patterns
- Eels with chase behavior and aggro radius
- Enemy collision damage (10% oxygen reduction)
- Enemy state management

### Phase 4: Procedural Generation (User Story 4) ✅
- Cellular Automata level generation
- Progressive difficulty scaling with caps
- Infinite level progression
- Difficulty system with logarithmic oxygen scaling
- Cavern complexity scaling

### Phase 7: Polish & Optimization ✅
- Pause functionality (ESC key)
- FPS counter (F key toggle)
- LocalStorage high score tracking
- Performance optimizations
- Enhanced UI/UX polish

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
