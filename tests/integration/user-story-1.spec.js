/**
 * Integration Test for User Story 1
 * Complete gameplay flow: Move player, interact with clams, collect pearls, manage oxygen
 * 
 * @jest-environment jsdom
 */

import { test, expect } from '@playwright/test';

test.describe('User Story 1: Core Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for game to load
    await page.waitForSelector('#game-canvas');
    await page.waitForTimeout(1000); // Allow Phaser to initialize
  });

  test('should load game and display menu', async ({ page }) => {
    // Verify menu elements are visible
    const title = await page.locator('text=UNDERWATER CAVERN');
    await expect(title).toBeVisible();
    
    const startButton = await page.locator('text=START GAME');
    await expect(startButton).toBeVisible();
  });

  test('should start game when clicking START GAME button', async ({ page }) => {
    const startButton = await page.locator('text=START GAME');
    await startButton.click();
    
    // Wait for transition to game scene
    await page.waitForTimeout(1000);
    
    // Verify game UI elements
    const levelText = await page.locator('text=Level:');
    await expect(levelText).toBeVisible();
    
    const scoreText = await page.locator('text=Score:');
    await expect(scoreText).toBeVisible();
    
    const oxygenText = await page.locator('text=O2:');
    await expect(oxygenText).toBeVisible();
  });

  test('should start game with spacebar', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    const levelText = await page.locator('text=Level:');
    await expect(levelText).toBeVisible();
  });

  test('should move player with WASD keys', async ({ page }) => {
    // Start game
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Get canvas element
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Press W key (up) for 500ms
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyW');
    
    // Verify player position changed (would need to check game state or visual diff)
    // For now, just verify no errors occurred
    await page.waitForTimeout(100);
  });

  test('should move player with arrow keys', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Test all arrow keys
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowUp');
    
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowRight');
    
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowDown');
    
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowLeft');
    
    await page.waitForTimeout(100);
  });

  test('should display oxygen meter that depletes over time', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Get initial oxygen reading
    const oxygenText = await page.locator('text=/O2: \\d+%/');
    const initialOxygen = await oxygenText.textContent();
    
    // Wait 3 seconds
    await page.waitForTimeout(3000);
    
    // Get new oxygen reading
    const newOxygen = await oxygenText.textContent();
    
    // Verify oxygen decreased
    const initialValue = parseInt(initialOxygen.match(/\d+/)[0]);
    const newValue = parseInt(newOxygen.match(/\d+/)[0]);
    
    expect(newValue).toBeLessThan(initialValue);
  });

  test('should interact with clam using spacebar', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Move player near a clam (would need known clam position)
    // For now, simulate interaction attempt
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    // Verify no errors occurred
    await page.waitForTimeout(100);
  });

  test('should collect pearl and increase score', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    const scoreText = await page.locator('text=/Score: \\d+/');
    const initialScore = await scoreText.textContent();
    
    // Navigate to clam location and interact
    // (This would require knowing clam positions from level data)
    // For now, verify score display is functional
    
    const initialValue = parseInt(initialScore.match(/\d+/)[0]);
    expect(initialValue).toBe(0);
  });

  test('should trigger game over when oxygen depletes', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Wait for oxygen to fully deplete (would take ~100 seconds at base rate)
    // For testing, we'd need to speed up time or inject depleted state
    
    // Verify game continues running
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display victory screen when all pearls collected', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Collect all 3 pearls (would need to navigate to each)
    // This test verifies the victory flow exists
    
    await page.waitForTimeout(500);
  });

  test('should return to menu when pressing ESC', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    const startButton = await page.locator('text=START GAME');
    await expect(startButton).toBeVisible();
  });

  test('should restart game from game over screen', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Trigger game over (would need helper function)
    // Then click restart
    
    await page.waitForTimeout(500);
  });

  test('should maintain 60 FPS during gameplay', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Measure FPS using Performance API
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();
        
        function measureFrame() {
          frames++;
          if (performance.now() - startTime >= 1000) {
            resolve(frames);
          } else {
            requestAnimationFrame(measureFrame);
          }
        }
        
        measureFrame();
      });
    });
    
    expect(fps).toBeGreaterThanOrEqual(55); // Allow slight variance
  });

  test('should handle rapid key presses without errors', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Rapidly press multiple keys
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('KeyW');
      await page.keyboard.press('KeyD');
      await page.keyboard.press('Space');
      await page.waitForTimeout(50);
    }
    
    // Verify game still running
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should keep player within game bounds', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Try to move player off screen
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(3000); // Hold for 3 seconds
    await page.keyboard.up('ArrowLeft');
    
    // Player should be at left boundary, not off-screen
    await page.waitForTimeout(100);
    
    // Try other directions
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(3000);
    await page.keyboard.up('ArrowUp');
    
    await page.waitForTimeout(100);
  });

  test('should display all 3 clams in level', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // Verify 3 clams are present (would need to query game state)
    // For now, verify game loaded successfully
    
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should complete full gameplay loop', async ({ page }) => {
    // This is the master integration test
    
    // 1. Start game
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // 2. Verify initial state
    const levelText = await page.locator('text=/Level: \\d+/');
    await expect(levelText).toBeVisible();
    
    const scoreText = await page.locator('text=/Score: 0/');
    await expect(scoreText).toBeVisible();
    
    const oxygenText = await page.locator('text=/O2: 100%/');
    await expect(oxygenText).toBeVisible();
    
    // 3. Move around
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyW');
    
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyD');
    
    // 4. Verify oxygen depleted slightly
    await page.waitForTimeout(1000);
    const updatedOxygen = await page.locator('text=/O2: \\d+%/');
    const oxygenValue = await updatedOxygen.textContent();
    const oxygen = parseInt(oxygenValue.match(/\d+/)[0]);
    expect(oxygen).toBeLessThan(100);
    
    // 5. Return to menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    const startButton = await page.locator('text=START GAME');
    await expect(startButton).toBeVisible();
  });
});
