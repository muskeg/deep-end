#!/usr/bin/env node
/**
 * Sprite Generator Script
 * Generates PNG sprite assets for DeepEnd game entities
 * Uses @napi-rs/canvas (no native deps needed)
 * 
 * Usage: node scripts/generate-sprites.js
 * Output: assets/sprites/<entity>/*.png
 */

const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

// ── Color Constants (matching src/utils/Constants.js) ──────────────────────
const COLORS = {
  WATER: '#003d66',
  WALL: '#1a1a2e',
  PLAYER_BODY: '#0088cc',
  PLAYER_HELMET: '#cccccc',
  PLAYER_VISOR: '#88ddff',
  PLAYER_TANK: '#666666',
  CLAM_CLOSED: '#8b7355',
  CLAM_OPEN: '#ffd700',
  PEARL: '#ffffff',
  PEARL_GLOW: '#aaddff',
  JELLYFISH_BODY: '#ff69b4',
  JELLYFISH_TENTACLE: '#ff1493',
  EEL_BODY: '#2d5016',
  EEL_BELLY: '#8fbc8f',
  EEL_EYE: '#ffff00',
  HARPOON_SHAFT: '#888888',
  HARPOON_TIP: '#cccccc',
  WALL_HIGHLIGHT: '#2c2c48',
};

const TILE_SIZE = 32;

// ── Utility ─────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function saveCanvas(canvas, filepath) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
}

// ── Diver Sprites (8-direction, idle + 2 swim frames) ──────────────────────
function generateDiverSprites(outDir) {
  ensureDir(outDir);
  const size = 32;
  const directions = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];

  function drawDiver(ctx, cx, cy, direction) {
    let headX = cx, headY = cy, bodyX = cx, bodyY = cy;
    let tankX = cx, tankY = cy;
    let flipperX1, flipperY1, flipperX2, flipperY2;
    let armX1, armY1, armX2, armY2;

    switch (direction) {
      case 'down':
        headY = cy + 8; bodyY = cy + 2; tankY = cy + 1;
        flipperX1 = cx - 3; flipperY1 = cy - 8;
        flipperX2 = cx + 3; flipperY2 = cy - 8;
        armX1 = cx - 9; armY1 = cy + 2;
        armX2 = cx + 9; armY2 = cy + 2;
        break;
      case 'up':
        headY = cy - 8; bodyY = cy - 2; tankY = cy - 1;
        flipperX1 = cx - 3; flipperY1 = cy + 8;
        flipperX2 = cx + 3; flipperY2 = cy + 8;
        armX1 = cx - 9; armY1 = cy - 2;
        armX2 = cx + 9; armY2 = cy - 2;
        break;
      case 'left':
        headX = cx - 8; bodyX = cx - 2; tankX = cx - 1;
        flipperX1 = cx + 8; flipperY1 = cy - 3;
        flipperX2 = cx + 8; flipperY2 = cy + 3;
        armX1 = cx - 2; armY1 = cy - 9;
        armX2 = cx - 2; armY2 = cy + 9;
        break;
      case 'right':
        headX = cx + 8; bodyX = cx + 2; tankX = cx + 1;
        flipperX1 = cx - 8; flipperY1 = cy - 3;
        flipperX2 = cx - 8; flipperY2 = cy + 3;
        armX1 = cx + 2; armY1 = cy - 9;
        armX2 = cx + 2; armY2 = cy + 9;
        break;
      case 'down-right':
        headX = cx + 6; headY = cy + 6; bodyX = cx + 2; bodyY = cy + 2;
        tankX = cx + 1; tankY = cy + 1;
        flipperX1 = cx - 6; flipperY1 = cy - 6;
        flipperX2 = cx - 5; flipperY2 = cy - 5;
        armX1 = cx - 4; armY1 = cy + 8;
        armX2 = cx + 8; armY2 = cy - 4;
        break;
      case 'down-left':
        headX = cx - 6; headY = cy + 6; bodyX = cx - 2; bodyY = cy + 2;
        tankX = cx - 1; tankY = cy + 1;
        flipperX1 = cx + 6; flipperY1 = cy - 6;
        flipperX2 = cx + 5; flipperY2 = cy - 5;
        armX1 = cx + 4; armY1 = cy + 8;
        armX2 = cx - 8; armY2 = cy - 4;
        break;
      case 'up-right':
        headX = cx + 6; headY = cy - 6; bodyX = cx + 2; bodyY = cy - 2;
        tankX = cx + 1; tankY = cy - 1;
        flipperX1 = cx - 6; flipperY1 = cy + 6;
        flipperX2 = cx - 5; flipperY2 = cy + 5;
        armX1 = cx - 4; armY1 = cy - 8;
        armX2 = cx + 8; armY2 = cy + 4;
        break;
      case 'up-left':
        headX = cx - 6; headY = cy - 6; bodyX = cx - 2; bodyY = cy - 2;
        tankX = cx - 1; tankY = cy - 1;
        flipperX1 = cx + 6; flipperY1 = cy + 6;
        flipperX2 = cx + 5; flipperY2 = cy + 5;
        armX1 = cx + 4; armY1 = cy - 8;
        armX2 = cx - 8; armY2 = cy + 4;
        break;
    }

    const isHorizontal = direction === 'left' || direction === 'right';

    // Oxygen tank
    ctx.fillStyle = COLORS.PLAYER_TANK;
    ctx.beginPath();
    ctx.ellipse(tankX, tankY, isHorizontal ? 8 : 5, isHorizontal ? 5 : 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = COLORS.PLAYER_BODY;
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyY, isHorizontal ? 10 : 7, isHorizontal ? 7 : 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.strokeStyle = COLORS.PLAYER_BODY;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bodyX, bodyY); ctx.lineTo(armX1, armY1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bodyX, bodyY); ctx.lineTo(armX2, armY2); ctx.stroke();

    // Flippers
    ctx.fillStyle = COLORS.PLAYER_BODY;
    ctx.beginPath();
    ctx.ellipse(flipperX1, flipperY1, isHorizontal ? 5 : 3, isHorizontal ? 3 : 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(flipperX2, flipperY2, isHorizontal ? 5 : 3, isHorizontal ? 3 : 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = COLORS.PLAYER_HELMET;
    ctx.beginPath();
    ctx.arc(headX, headY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Visor
    ctx.fillStyle = COLORS.PLAYER_VISOR;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(headX, headY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Visor highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    const hlX = direction.includes('left') ? 2 : -2;
    const hlY = direction.includes('up') ? 2 : -2;
    ctx.beginPath();
    ctx.arc(headX + hlX, headY + hlY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  // Idle frames (8 directions)
  for (const dir of directions) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    drawDiver(ctx, size / 2, size / 2, dir);
    saveCanvas(canvas, path.join(outDir, `diver-idle-${dir}.png`));
  }

  // Swim frames (8 directions x 2 frames with bob)
  for (let frame = 0; frame < 2; frame++) {
    const bobOffset = frame === 0 ? 0 : 1;
    for (const dir of directions) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      drawDiver(ctx, size / 2, size / 2 + bobOffset, dir);
      saveCanvas(canvas, path.join(outDir, `diver-swim-${dir}-${frame}.png`));
    }
  }

  // Dash frame (tinted cyan overlay)
  for (const dir of directions) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    drawDiver(ctx, size / 2, size / 2, dir);
    // Cyan overlay for dash
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0, 255, 255, 0.35)';
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
    saveCanvas(canvas, path.join(outDir, `diver-dash-${dir}.png`));
  }

  console.log(`  ✓ Diver: ${directions.length * 4} sprites (idle/swim/dash)`);
}

// ── Jellyfish Sprites (3 pulse frames) ─────────────────────────────────────
function generateJellyfishSprites(outDir) {
  ensureDir(outDir);
  const size = 48;

  for (let frame = 0; frame < 3; frame++) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;

    const pulseScale = 1 + (frame * 0.1);
    const bellRadius = 12 * pulseScale;

    // Bell (dome)
    ctx.fillStyle = COLORS.JELLYFISH_BODY;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, bellRadius, bellRadius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Bell highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 8, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Tentacles
    ctx.strokeStyle = COLORS.JELLYFISH_TENTACLE;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const startX = cx + Math.cos(angle) * (bellRadius * 0.6);
      const startY = cy + Math.sin(angle) * (bellRadius * 0.4) + 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const waveOffset = (frame - 1) * 2;
      for (let j = 1; j <= 3; j++) {
        const segX = startX + Math.cos(angle) * j * 2 + Math.sin(j + frame) * waveOffset;
        const segY = startY + j * 4;
        ctx.lineTo(segX, segY);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    saveCanvas(canvas, path.join(outDir, `jellyfish-${frame}.png`));
  }

  console.log(`  ✓ Jellyfish: 3 sprites (pulse animation)`);
}

// ── Eel Sprites (4 directions x 2 frames) ──────────────────────────────────
function generateEelSprites(outDir) {
  ensureDir(outDir);
  const directions = ['left', 'right', 'up', 'down'];

  for (const direction of directions) {
    for (let frame = 0; frame < 2; frame++) {
      const isHorizontal = direction === 'left' || direction === 'right';
      const texWidth = isHorizontal ? 64 : 32;
      const texHeight = isHorizontal ? 32 : 64;

      const canvas = createCanvas(texWidth, texHeight);
      const ctx = canvas.getContext('2d');
      const cx = texWidth / 2;
      const cy = texHeight / 2;
      const wavePhase = frame * Math.PI;

      if (isHorizontal) {
        const headX = direction === 'right' ? texWidth - 12 : 12;
        const tailX = direction === 'right' ? 8 : texWidth - 8;
        const segments = 8;

        // Body segments
        ctx.fillStyle = COLORS.EEL_BODY;
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          const x = headX + (tailX - headX) * t;
          const waveY = Math.sin(t * Math.PI * 2 + wavePhase) * 4;
          const w = 8 - (t * 2);
          ctx.beginPath();
          ctx.ellipse(x, cy + waveY, w, 6, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Belly stripe
        ctx.strokeStyle = COLORS.EEL_BELLY;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX, cy);
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          ctx.lineTo(headX + (tailX - headX) * t, cy + Math.sin(t * Math.PI * 2 + wavePhase) * 4);
        }
        ctx.stroke();

        // Head
        ctx.fillStyle = COLORS.EEL_BODY;
        ctx.beginPath();
        ctx.ellipse(headX, cy, 8, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        const eyeX = direction === 'right' ? headX - 2 : headX + 2;
        ctx.fillStyle = COLORS.EEL_EYE;
        ctx.beginPath(); ctx.arc(eyeX, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.arc(eyeX, cy - 2, 1, 0, Math.PI * 2); ctx.fill();
      } else {
        const headY = direction === 'down' ? texHeight - 12 : 12;
        const tailY = direction === 'down' ? 8 : texHeight - 8;
        const segments = 8;

        ctx.fillStyle = COLORS.EEL_BODY;
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          const y = headY + (tailY - headY) * t;
          const waveX = Math.sin(t * Math.PI * 2 + wavePhase) * 4;
          const h = 8 - (t * 2);
          ctx.beginPath();
          ctx.ellipse(cx + waveX, y, 6, h, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.strokeStyle = COLORS.EEL_BELLY;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, headY);
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          ctx.lineTo(cx + Math.sin(t * Math.PI * 2 + wavePhase) * 4, headY + (tailY - headY) * t);
        }
        ctx.stroke();

        ctx.fillStyle = COLORS.EEL_BODY;
        ctx.beginPath();
        ctx.ellipse(cx, headY, 7, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        const eyeY = direction === 'down' ? headY - 2 : headY + 2;
        ctx.fillStyle = COLORS.EEL_EYE;
        ctx.beginPath(); ctx.arc(cx + 2, eyeY, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.arc(cx + 2, eyeY, 1, 0, Math.PI * 2); ctx.fill();
      }

      saveCanvas(canvas, path.join(outDir, `eel-${direction}-${frame}.png`));
    }
  }

  console.log(`  ✓ Eel: 8 sprites (4 dirs x 2 frames)`);
}

// ── Clam Sprites (closed, open-empty, open-with-pearl) ─────────────────────
function generateClamSprites(outDir) {
  ensureDir(outDir);
  const size = 48;

  // Closed clam
  {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    // Shell body
    ctx.fillStyle = COLORS.CLAM_CLOSED;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ridges on shell
    ctx.strokeStyle = '#7a6548';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy + i * 3, 16, 6, 0, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }

    // Subtle outline
    ctx.strokeStyle = COLORS.CLAM_OPEN;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 5, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    saveCanvas(canvas, path.join(outDir, 'clam-closed.png'));
  }

  // Open clam (empty)
  {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    // Left shell half
    ctx.fillStyle = COLORS.CLAM_OPEN;
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy, 12, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Right shell half
    ctx.beginPath();
    ctx.ellipse(cx + 10, cy, 12, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Inner shadow
    ctx.fillStyle = '#b8860b';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Shell ridges on halves
    ctx.strokeStyle = '#ccaa00';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy + i * 4, 10, 5, -0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 10, cy + i * 4, 10, 5, 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    saveCanvas(canvas, path.join(outDir, 'clam-open.png'));
  }

  // Open clam with pearl visible
  {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    // Left shell half
    ctx.fillStyle = COLORS.CLAM_OPEN;
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy, 12, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Right shell half
    ctx.beginPath();
    ctx.ellipse(cx + 10, cy, 12, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Inner shadow
    ctx.fillStyle = '#b8860b';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Pearl inside
    ctx.fillStyle = COLORS.PEARL;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Pearl highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    saveCanvas(canvas, path.join(outDir, 'clam-open-pearl.png'));
  }

  // Opening animation frames (3 intermediate frames)
  for (let frame = 0; frame < 3; frame++) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;
    const openAmount = (frame + 1) / 4; // 0.25, 0.5, 0.75

    const shellSpread = 10 * openAmount;
    const shellRotation = 0.2 * openAmount;

    // Left shell
    ctx.fillStyle = frame < 2 ? COLORS.CLAM_CLOSED : COLORS.CLAM_OPEN;
    ctx.beginPath();
    ctx.ellipse(cx - shellSpread, cy, 12 + openAmount * 2, 14, -shellRotation, 0, Math.PI * 2);
    ctx.fill();

    // Right shell
    ctx.beginPath();
    ctx.ellipse(cx + shellSpread, cy, 12 + openAmount * 2, 14, shellRotation, 0, Math.PI * 2);
    ctx.fill();

    saveCanvas(canvas, path.join(outDir, `clam-opening-${frame}.png`));
  }

  console.log(`  ✓ Clam: 7 sprites (closed, 3 opening, open, open-pearl)`);
}

// ── Pearl Sprites (base + shimmer frames) ──────────────────────────────────
function generatePearlSprites(outDir) {
  ensureDir(outDir);
  const size = 24;

  for (let frame = 0; frame < 3; frame++) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    // Outer glow
    ctx.fillStyle = COLORS.PEARL_GLOW;
    ctx.globalAlpha = 0.15 + frame * 0.05;
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Main pearl body
    ctx.fillStyle = COLORS.PEARL;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    // Subtle pearl gradient (pearlescent effect)
    ctx.fillStyle = '#e8e0d0';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(cx + 1, cy + 2, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Highlight (moves slightly between frames)
    const hlOffset = frame * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.7 - frame * 0.1;
    ctx.beginPath();
    ctx.arc(cx - 3 + hlOffset, cy - 3 + hlOffset, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Small secondary highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(cx + 2, cy + 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    saveCanvas(canvas, path.join(outDir, `pearl-${frame}.png`));
  }

  console.log(`  ✓ Pearl: 3 sprites (shimmer animation)`);
}

// ── Harpoon Sprite ─────────────────────────────────────────────────────────
function generateHarpoonSprites(outDir) {
  ensureDir(outDir);
  const width = 32, height = 12;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const cy = height / 2;

  // Shaft
  ctx.fillStyle = COLORS.HARPOON_SHAFT;
  ctx.fillRect(2, cy - 2, 22, 4);

  // Shaft detail (darker center line)
  ctx.fillStyle = '#666666';
  ctx.fillRect(4, cy - 0.5, 18, 1);

  // Tip (triangle)
  ctx.fillStyle = COLORS.HARPOON_TIP;
  ctx.beginPath();
  ctx.moveTo(24, cy);
  ctx.lineTo(30, cy - 4);
  ctx.lineTo(30, cy + 4);
  ctx.closePath();
  ctx.fill();

  // Tip edge highlight
  ctx.strokeStyle = '#eeeeee';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(24, cy);
  ctx.lineTo(30, cy - 4);
  ctx.stroke();

  // Barb details on tip
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(28, cy - 2);
  ctx.lineTo(26, cy - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(28, cy + 2);
  ctx.lineTo(26, cy + 4);
  ctx.stroke();

  // Tail fins
  ctx.fillStyle = '#777777';
  ctx.beginPath();
  ctx.moveTo(2, cy);
  ctx.lineTo(0, cy - 3);
  ctx.lineTo(4, cy);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(2, cy);
  ctx.lineTo(0, cy + 3);
  ctx.lineTo(4, cy);
  ctx.closePath();
  ctx.fill();

  saveCanvas(canvas, path.join(outDir, 'harpoon.png'));

  console.log(`  ✓ Harpoon: 1 sprite`);
}

// ── Wall Tile Sprite ───────────────────────────────────────────────────────
function generateWallSprites(outDir) {
  ensureDir(outDir);
  const size = TILE_SIZE;

  // Generate a few wall tile variants for visual variety
  for (let variant = 0; variant < 4; variant++) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base wall color
    ctx.fillStyle = COLORS.WALL;
    ctx.fillRect(0, 0, size, size);

    // Add subtle texture per variant
    ctx.fillStyle = COLORS.WALL_HIGHLIGHT;
    ctx.globalAlpha = 0.3 + variant * 0.05;

    // Different rock patterns per variant
    const seed = variant * 7;
    for (let i = 0; i < 4 + variant; i++) {
      const px = ((seed + i * 13) % 28) + 2;
      const py = ((seed + i * 17) % 28) + 2;
      const pr = 2 + (i % 3);
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Edge highlight (top-left)
    ctx.strokeStyle = COLORS.WALL_HIGHLIGHT;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Edge shadow (bottom-right)
    ctx.strokeStyle = '#111120';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(size, size);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    saveCanvas(canvas, path.join(outDir, `wall-${variant}.png`));
  }

  console.log(`  ✓ Wall: 4 sprite variants`);
}

// ── Water Current Sprite ───────────────────────────────────────────────────
function generateCurrentSprites(outDir) {
  ensureDir(outDir);
  const size = 32;

  for (let frame = 0; frame < 3; frame++) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#66d9ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3 + frame * 0.1;

    // Flowing lines
    for (let i = 0; i < 3; i++) {
      const yOff = 8 + i * 8;
      const xShift = frame * 4;
      ctx.beginPath();
      ctx.moveTo(-2 + xShift, yOff);
      ctx.bezierCurveTo(8 + xShift, yOff - 4, 16 + xShift, yOff + 4, 26 + xShift, yOff);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
    saveCanvas(canvas, path.join(outDir, `current-${frame}.png`));
  }

  console.log(`  ✓ Current: 3 sprites (flow animation)`);
}

// ── Generate Sprite Atlas JSON ─────────────────────────────────────────────
function generateAtlasJson(baseDir) {
  // Phaser multi-image atlas - maps texture keys to file paths
  // We'll use individual image loading instead of a packed atlas
  // since the sprites are small and we avoid the TexturePacker dependency
  const manifest = {
    generated: new Date().toISOString(),
    sprites: {}
  };

  function scanDir(dir, prefix) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    for (const file of files) {
      const key = file.replace('.png', '');
      manifest.sprites[key] = `assets/sprites/${prefix}/${file}`;
    }
  }

  scanDir(path.join(baseDir, 'diver'), 'diver');
  scanDir(path.join(baseDir, 'enemies'), 'enemies');
  scanDir(path.join(baseDir, 'clams'), 'clams');
  scanDir(path.join(baseDir, 'pearl'), 'pearl');
  scanDir(path.join(baseDir, 'harpoon'), 'harpoon');
  scanDir(path.join(baseDir, 'walls'), 'walls');
  scanDir(path.join(baseDir, 'effects'), 'effects');

  const manifestPath = path.join(baseDir, 'sprite-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  ✓ Manifest: ${Object.keys(manifest.sprites).length} entries → sprite-manifest.json`);
}

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  const baseDir = path.join(__dirname, '..', 'assets', 'sprites');
  console.log('🎨 Generating sprite assets...\n');

  generateDiverSprites(path.join(baseDir, 'diver'));
  generateJellyfishSprites(path.join(baseDir, 'enemies'));
  generateEelSprites(path.join(baseDir, 'enemies'));
  generateClamSprites(path.join(baseDir, 'clams'));
  generatePearlSprites(path.join(baseDir, 'pearl'));
  generateHarpoonSprites(path.join(baseDir, 'harpoon'));
  generateWallSprites(path.join(baseDir, 'walls'));
  generateCurrentSprites(path.join(baseDir, 'effects'));
  generateAtlasJson(baseDir);

  console.log('\n✅ Done! All sprites generated in assets/sprites/');
}

main();
