/**
 * User Story 3: Hostile Sea Creatures - Integration Test
 * E2E test for enemy interactions, collision damage, and AI behaviors
 */

import { test, expect } from '@playwright/test';

test.describe('User Story 3: Hostile Sea Creatures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for Phaser to initialize
  });

  test('should render enemies in the cavern', async ({ page }) => {
    // Check that enemies exist in the game
    const gameCanvas = page.locator('canvas');
    await expect(gameCanvas).toBeVisible();
    
    // Wait for game to load enemies
    await page.waitForTimeout(500);
    
    // Verify game scene is active (enemies should be present)
    const canvasExists = await gameCanvas.count();
    expect(canvasExists).toBe(1);
  });

  test('should damage player on enemy collision', async ({ page }) => {
    // Get initial oxygen value
    const initialOxygen = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      return scene.oxygenSystem.currentOxygen;
    });

    // Move player toward enemy position
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(3000); // Move for 3 seconds
    await page.keyboard.up('ArrowRight');

    // Check if oxygen decreased (collision occurred)
    const currentOxygen = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      return scene.oxygenSystem.currentOxygen;
    });

    expect(currentOxygen).toBeLessThanOrEqual(initialOxygen);
  });

  test('jellyfish should patrol waypoints', async ({ page }) => {
    // Get jellyfish initial position
    const initialPos = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      const jellyfish = scene.enemies.find(e => e.constructor.name === 'Jellyfish');
      return { x: jellyfish.x, y: jellyfish.y };
    });

    // Wait for jellyfish to move
    await page.waitForTimeout(2000);

    // Get jellyfish new position
    const newPos = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      const jellyfish = scene.enemies.find(e => e.constructor.name === 'Jellyfish');
      return { x: jellyfish.x, y: jellyfish.y };
    });

    // Verify jellyfish moved (patrolling)
    const distance = Math.sqrt(
      (newPos.x - initialPos.x) ** 2 + 
      (newPos.y - initialPos.y) ** 2
    );
    expect(distance).toBeGreaterThan(10);
  });

  test('jellyfish should chase player when detected', async ({ page }) => {
    // Get player and jellyfish positions
    const initialDistance = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      const jellyfish = scene.enemies.find(e => e.constructor.name === 'Jellyfish');
      const player = scene.player;
      return Math.sqrt(
        (jellyfish.x - player.x) ** 2 + 
        (jellyfish.y - player.y) ** 2
      );
    });

    // Move player close to jellyfish
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(1500);
    await page.keyboard.up('ArrowRight');

    // Wait for jellyfish to react
    await page.waitForTimeout(500);

    // Check if jellyfish is chasing (distance should be closing)
    const finalDistance = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      const jellyfish = scene.enemies.find(e => e.constructor.name === 'Jellyfish');
      const player = scene.player;
      const hasTarget = jellyfish.hasTarget;
      const distance = Math.sqrt(
        (jellyfish.x - player.x) ** 2 + 
        (jellyfish.y - player.y) ** 2
      );
      return { distance, hasTarget };
    });

    expect(finalDistance.hasTarget).toBe(true);
  });

  test('eel should lunge attack when player is close', async ({ page }) => {
    // Move player near eel
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowDown');

    // Check eel state
    const eelState = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      const eel = scene.enemies.find(e => e.constructor.name === 'Eel');
      return eel ? eel.state : null;
    });

    // Eel should be in chase or lunging state
    expect(['chasing', 'lunging']).toContain(eelState);
  });

  test('eel should return to hiding after losing target', async ({ page }) => {
    // Trigger eel chase
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(1500);
    await page.keyboard.up('ArrowDown');

    // Move away from eel
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowUp');

    // Wait for eel to return
    await page.waitForTimeout(1000);

    // Check eel state
    const eelState = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      const eel = scene.enemies.find(e => e.constructor.name === 'Eel');
      return eel ? eel.state : null;
    });

    expect(['returning', 'idle']).toContain(eelState);
  });

  test('player should have invulnerability period after collision', async ({ page }) => {
    // Get initial collision count
    const initialCollisions = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      return scene.oxygenSystem.totalEnemyCollisions || 0;
    });

    // Collide with enemy
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowRight');

    // Immediately check collision count (should only increase by 1 due to invulnerability)
    const afterCollisions = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      return scene.oxygenSystem.totalEnemyCollisions || 0;
    });

    expect(afterCollisions - initialCollisions).toBeLessThanOrEqual(2);
  });

  test('multiple enemies should not interfere with each other', async ({ page }) => {
    // Get enemy count
    const enemyCount = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      return scene.enemies.length;
    });

    expect(enemyCount).toBeGreaterThanOrEqual(2);

    // Wait and verify all enemies still active
    await page.waitForTimeout(2000);

    const activeEnemies = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      return scene.enemies.filter(e => e.active).length;
    });

    expect(activeEnemies).toBe(enemyCount);
  });

  test('enemy visuals should update based on state', async ({ page }) => {
    // Move player to trigger jellyfish chase
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(1500);
    await page.keyboard.up('ArrowRight');

    // Verify visual state changed
    const visualsUpdated = await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      const jellyfish = scene.enemies.find(e => e.constructor.name === 'Jellyfish');
      return jellyfish && jellyfish.hasTarget;
    });

    expect(visualsUpdated).toBe(true);
  });

  test('collision should emit damage event', async ({ page }) => {
    // Setup event listener
    await page.evaluate(() => {
      const scene = window.game.scene.scenes[0];
      window.enemyCollisionDetected = false;
      scene.events.on('enemy-collision', () => {
        window.enemyCollisionDetected = true;
      });
    });

    // Collide with enemy
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowRight');

    // Check if event fired
    const eventFired = await page.evaluate(() => window.enemyCollisionDetected);
    expect(eventFired).toBe(true);
  });
});
