# 🌊 Deep End

A roguelike underwater diving game where you explore procedurally generated caverns, battle sea creatures, collect pearls, and buy permanent upgrades between dives. Built with Phaser 3 and vanilla JavaScript.

**🎮 [Play Now on GitHub Pages](https://muskeg.github.io/deep-end/)**

## 🎮 Features

- **Roguelike Dive Loop**: Dive, collect pearls, return to shop, upgrade, dive deeper
- **Procedural Caverns**: Cellular automata generation with landmark-aware density regions
- **Combat System**: Fire harpoons (Q) and dash (Shift) to fight enemies
- **Depth Zones**: Sunlight → Twilight → Midnight with dynamic ambient lighting
- **Persistent Upgrades**: Oxygen, light, speed, harpoon damage, dash cooldown, sonar
- **Enemy AI**: Jellyfish patrol patterns, eel chase/lunge behavior, zone-scaled spawning
- **Sprite-Based Graphics**: Procedurally generated pixel art for all entities
- **Procedural Audio**: Web Audio API sound effects and zone-specific ambient music
- **Statistics Tracking**: Pearls collected, enemies killed, deepest depth, play time
- **First-Run Tutorial**: Control overlay shown on first dive

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 How to Play

### Controls

| Key | Action |
|-----|--------|
| **WASD / Arrows** | Move diver |
| **Q** | Fire harpoon |
| **Shift** | Dash (speed burst with cooldown) |
| **Space** | Interact with clams |
| **ESC** | Surface voluntarily (end dive, keep pearls) |
| **P** | Pause |
| **M** | Toggle audio |
| **F** | Toggle FPS counter |

### Gameplay Loop

1. **Start at the Surface Shop** — view upgrades and stats
2. **Dive** into procedurally generated underwater caverns
3. **Explore** — swim through zones that get darker and more dangerous with depth
4. **Collect pearls** from clams scattered throughout the cavern
5. **Fight or flee** — harpoon jellyfish and eels, or dash past them
6. **Manage oxygen** — it depletes over time; enemies drain it on contact
7. **Surface** (ESC) when ready — keep your pearls
8. **Upgrade** at the shop — improve oxygen, light, speed, weapons
9. **Dive deeper** next time with better equipment

### Depth Zones

- **Sunlight Zone** (0–500m): Bright, calm waters. Low enemy density.
- **Twilight Zone** (500–1500m): Dimmer lighting, more enemies, clams worth 5× pearls.
- **Midnight Zone** (1500m+): Near darkness, aggressive fauna, clams worth 20× pearls.

### Upgrades

| Upgrade | Effect |
|---------|--------|
| Oxygen Tank | Increases max oxygen capacity |
| Light | Expands visible radius in deeper zones |
| Speed | Increases swim speed |
| Harpoon | Boosts harpoon damage |
| Dash | Reduces dash cooldown |
| Sonar | Increases detection range for clams/enemies |

## 🧪 Testing

```bash
# Run unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests (Playwright)
npm run test:integration
```

**Test coverage**: 360 tests across unit, integration, and performance suites.

## 📁 Project Structure

```
src/
├── main.js              # Game initialization
├── data/                # JSON configs (zones, upgrades, landmarks)
├── scenes/              # Phaser scenes
│   ├── BootScene.js     # Asset loading with progress bar
│   ├── MenuScene.js     # Start menu (new game / continue)
│   ├── ShopScene.js     # Upgrade shop + statistics
│   ├── GameScene.js     # Main gameplay
│   └── GameOverScene.js # End-of-dive screen
├── entities/            # Game objects
│   ├── Player.js        # Diver with 8-direction movement, dash, harpoon
│   ├── Clam.js          # Pearl-dropping clam with gravity settling
│   ├── Jellyfish.js     # Patrol + chase AI
│   ├── Eel.js           # Aggressive lunge AI
│   └── ...
├── systems/             # Game logic
│   ├── CavernGenerator.js    # Cellular automata + landmarks
│   ├── CombatSystem.js       # Damage, kills, effects
│   ├── DepthZoneSystem.js    # Zone transitions + lighting
│   ├── EnemySpawnManager.js  # Zone-scaled enemy spawning
│   ├── OxygenSystem.js       # O2 depletion + warnings
│   ├── ProgressionSystem.js  # Pearls, upgrades, stats (LocalStorage)
│   └── ...
├── ui/                  # HUD components
│   ├── DepthMeter.js    # Depth + zone display
│   ├── OxygenMeter.js   # O2 bar with color warnings
│   ├── DashCooldown.js  # Dash ready/cooldown indicator
│   └── ...
└── utils/               # AudioManager, Constants, LocalStorage
```

## 🛠️ Tech Stack

- **Game Engine**: [Phaser 3.80+](https://phaser.io/) with Light2D pipeline
- **Build**: [Vite](https://vitejs.dev/)
- **Unit Tests**: [Jest](https://jestjs.io/)
- **E2E Tests**: [Playwright](https://playwright.dev/)
- **Audio**: Web Audio API (procedural)
- **Sprites**: Node Canvas (procedural generation)
- **Language**: JavaScript ES6+

## 📜 License

MIT

---

Built with Phaser.js | Procedurally generated everything
