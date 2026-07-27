/**
 * renderers.js
 * GameRenderer Engine - Implements 5 Perspective Modes with 6-Layer Atmospheric Depth Pipeline
 * Supports both HD Vector Procedural Art and 16-Bit Retro Pixel Art!
 */

window.GameRenderer = {
  render(ctx, canvas, state) {
    const width = canvas.width;
    const height = canvas.height;

    // Clear Screen
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, width, height);

    try {
      switch (state.mode) {
        case 'topdown':
          this.renderTopDown(ctx, width, height, state);
          break;
        case 'mode7':
          this.renderMode7(ctx, width, height, state);
          break;
        case 'billboard':
          this.renderBillboard3D(ctx, width, height, state);
          break;
        case 'depth':
          this.renderDepthShadow(ctx, width, height, state);
          break;
        case 'cinematic':
          this.renderCinematicTiltShift(ctx, width, height, state);
          break;
        default:
          this.renderTopDown(ctx, width, height, state);
      }
    } catch (err) {
      console.error('Renderer Mode Error:', state.mode, err);
    }
  },

  // ==========================================
  // HELPER DRAWING METHODS
  // ==========================================

  drawTerrainGrid(ctx, minX, maxX, minY, maxY, bushes = [], styleMode = 'vector') {
    ctx.save();
    // 1. Cobblestone base
    ctx.fillStyle = '#0c1322';
    ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

    // 2. Stone Tile Pavers Grid
    const tileSize = 80;
    ctx.lineWidth = 1;
    for (let x = minX; x < maxX; x += tileSize) {
      for (let y = minY; y < maxY; y += tileSize) {
        const tileHash = Math.sin(x * 12.34 + y * 56.78) * 10000;
        const isMossy = (tileHash - Math.floor(tileHash)) > 0.7;
        
        if (isMossy) {
          ctx.fillStyle = 'rgba(21, 128, 61, 0.18)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
        }
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // 3. Ground Bushes & Flowers
    for (let b of bushes) {
      ctx.save();
      ctx.translate(b.x, b.y);
      if (styleMode === 'pixel' && window.SpriteManager) {
        const spriteName = b.hasFlower ? 'bush_flower' : 'bush_normal';
        window.SpriteManager.drawSprite(ctx, spriteName, 0, 0, b.radius * 2.2, b.radius * 2.2);
      } else {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.arc(-6, -4, b.radius * 0.7, 0, Math.PI * 2);
        ctx.arc(6, 4, b.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        if (b.hasFlower) {
          ctx.fillStyle = b.flowerColor;
          ctx.beginPath();
          ctx.arc(0, -3, 3, 0, Math.PI * 2);
          ctx.arc(4, 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 4. Mystical Arena Runes
    ctx.beginPath();
    ctx.arc(500, 500, 280, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Arena Border Walls
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 6;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.restore();
  },

  drawCanopyShadows(ctx, trees, time) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
    for (let t of trees) {
      ctx.save();
      ctx.translate(t.x, t.y);
      const swayX = Math.sin(time * 2 + t.x) * 8;
      const swayY = Math.cos(time * 1.5 + t.y) * 6;
      ctx.translate(swayX, swayY);

      ctx.beginPath();
      ctx.arc(0, 0, t.radius * 1.3, 0, Math.PI * 2);
      ctx.arc(-20, -15, t.radius * 0.8, 0, Math.PI * 2);
      ctx.arc(25, 10, t.radius * 0.9, 0, Math.PI * 2);
      ctx.arc(5, 25, t.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  },

  // GOD RAYS LOCKED TO WORLD SPACE SO THEY NEVER FOLLOW THE PLAYER!
  drawGodRays(ctx, width, height, time, camera) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    if (camera) {
      // Anchor rays to world coordinates so player walks through them!
      ctx.translate(width / 2 - camera.x, height / 2 - camera.y);
    }
    
    const rayCount = 6;
    for (let i = 0; i < rayCount; i++) {
      const startX = (i * 220) - 100 + Math.sin(time * 0.5 + i) * 40;
      const rayWidth = 140 + Math.cos(time * 0.8 + i) * 40;
      
      const grad = ctx.createLinearGradient(startX, -200, startX + 550, height * 1.8);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
      grad.addColorStop(0.5, 'rgba(251, 191, 36, 0.10)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(startX, -200);
      ctx.lineTo(startX + rayWidth, -200);
      ctx.lineTo(startX + rayWidth + 500, height * 1.8);
      ctx.lineTo(startX + 500, height * 1.8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },

  drawForegroundBokehTrees(ctx, bokehTrees, time) {
    ctx.save();
    for (let bt of bokehTrees) {
      ctx.save();
      const swayX = Math.sin(time * 1.2 + bt.x) * 10;
      const swayY = Math.cos(time * 0.9 + bt.y) * 8;
      ctx.translate(bt.x + swayX, bt.y + swayY);

      ctx.shadowColor = bt.color;
      ctx.shadowBlur = 25;
      ctx.fillStyle = bt.color;
      ctx.globalAlpha = bt.alpha;

      ctx.beginPath();
      ctx.arc(0, 0, bt.radius, 0, Math.PI * 2);
      ctx.arc(-35, -25, bt.radius * 0.7, 0, Math.PI * 2);
      ctx.arc(45, 20, bt.radius * 0.8, 0, Math.PI * 2);
      ctx.arc(10, 45, bt.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#047857';
      ctx.globalAlpha = bt.alpha * 0.4;
      ctx.beginPath();
      ctx.arc(-15, -15, bt.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  },

  drawCloudShadows(ctx, width, height, clouds, camera) {
    ctx.save();
    ctx.fillStyle = '#000000';
    
    const offsetX = width / 2 - camera.x;
    const offsetY = height / 2 - camera.y;
    ctx.translate(offsetX, offsetY);

    for (let c of clouds) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.globalAlpha = c.alpha;

      ctx.beginPath();
      for (let blob of c.blobs) {
        ctx.ellipse(
          blob.dx, blob.dy,
          c.radiusX * blob.r, c.radiusY * blob.r,
          0, 0, Math.PI * 2
        );
      }
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  },

  drawMidgroundTree(ctx, tree, time, styleMode = 'vector') {
    if (styleMode === 'pixel' && window.SpriteManager && window.SpriteManager.get('tree_pine')) {
      ctx.save();
      ctx.translate(tree.x, tree.y);
      window.SpriteManager.drawSprite(ctx, 'tree_pine', 0, 0, 56, 76);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(tree.x, tree.y);

    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, 0, tree.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    const sway = Math.sin(time * 3 + tree.x) * 3;
    ctx.translate(sway, 0);

    ctx.fillStyle = tree.color;
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, tree.radius, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(-6, -6, tree.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawTorchPillar(ctx, torch, time, styleMode = 'vector') {
    if (styleMode === 'pixel' && window.SpriteManager && window.SpriteManager.get('torch_0')) {
      ctx.save();
      ctx.translate(torch.x, torch.y);
      const frameIdx = Math.floor(time * 6) % 3;
      window.SpriteManager.drawSprite(ctx, `torch_${frameIdx}`, 0, 0, 36, 56);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(torch.x, torch.y);

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    const haloGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 48);
    haloGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // ==========================================
  // VIEW MODE 1: STANDARD 2D TOP-DOWN
  // ==========================================
  renderTopDown(ctx, width, height, state) {
    ctx.save();
    ctx.translate(width / 2 - state.camera.x, height / 2 - state.camera.y);

    // Layer 0: Terrain Grid & Bushes
    this.drawTerrainGrid(ctx, 50, 950, 50, 950, state.forest.bushes, state.styleMode);

    // Layer 1: Canopy Ground Shadows
    if (state.atm.canopy) {
      this.drawCanopyShadows(ctx, state.forest.midgroundTrees, state.time);
    }

    // Layer 2: Entities (Depth Sorted by Y)
    const entities = [
      ...state.forest.midgroundTrees.map(t => ({ type: 'tree', obj: t, y: t.y })),
      ...state.forest.torches.map(t => ({ type: 'torch', obj: t, y: t.y })),
      { type: 'boss', obj: state.boss, y: state.boss.y },
      { type: 'player', obj: state.player, y: state.player.y }
    ];
    entities.sort((a, b) => a.y - b.y);

    for (let e of entities) {
      if (e.type === 'tree') this.drawMidgroundTree(ctx, e.obj, state.time, state.styleMode);
      else if (e.type === 'torch') this.drawTorchPillar(ctx, e.obj, state.time, state.styleMode);
      else e.obj.draw(ctx, state.time, state.styleMode);
    }

    // Draw Particles
    for (let p of state.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Layer 3: Foreground Bokeh Trees
    if (state.atm.bokeh) {
      this.drawForegroundBokehTrees(ctx, state.forest.foregroundBokehTrees, state.time);
    }

    ctx.restore(); // End camera world translation

    // Layer 4: God Rays (World Space anchored to camera)
    if (state.atm.godRays) {
      this.drawGodRays(ctx, width, height, state.time, state.camera);
    }

    // Layer 5: Cloud Shadows
    if (state.atm.clouds) {
      this.drawCloudShadows(ctx, width, height, state.clouds, state.camera);
    }
  },

  // ==========================================
  // VIEW MODE 2: MODE 7 TILT (SNES SCANLINES)
  // ==========================================
  renderMode7(ctx, width, height, state) {
    ctx.save();
    const camX = state.camera.x;
    const camY = state.camera.y;
    const horizonY = height * 0.25;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1000;
    tempCanvas.height = 1000;
    const tCtx = tempCanvas.getContext('2d');
    this.drawTerrainGrid(tCtx, 50, 950, 50, 950, state.forest.bushes, state.styleMode);
    if (state.atm.canopy) {
      this.drawCanopyShadows(tCtx, state.forest.midgroundTrees, state.time);
    }

    const scanlines = 220;
    for (let i = 0; i < scanlines; i++) {
      const factor = Math.pow(i / scanlines, 1.6);
      const sy = height - (i / scanlines) * (height - horizonY);
      const sliceHeight = (height - horizonY) / scanlines + 1.5;
      const zoom = 0.3 + factor * 1.5;
      const sliceWidth = width / zoom;
      const sx = camX - sliceWidth / 2;
      const worldY = camY + (1 - factor) * 450 - 150;

      ctx.drawImage(
        tempCanvas,
        Math.max(0, Math.min(999, sx)),
        Math.max(0, Math.min(999, worldY)),
        Math.min(1000, sliceWidth),
        4,
        0, sy - sliceHeight, width, sliceHeight + 1
      );
    }

    const projectM7 = (wx, wy) => {
      const dy = wy - camY + 150;
      if (dy < -100 || dy > 600) return null;
      const factor = 1 - Math.max(0, Math.min(1, (dy + 100) / 700));
      const sy = height - factor * (height - horizonY);
      const zoom = 0.3 + Math.pow(factor, 1.6) * 1.5;
      const sx = width / 2 + (wx - camX) * zoom;
      return { sx, sy, scale: zoom, dy };
    };

    const entities = [
      ...state.forest.midgroundTrees.map(t => ({ type: 'tree', obj: t, y: t.y })),
      ...state.forest.torches.map(t => ({ type: 'torch', obj: t, y: t.y })),
      { type: 'boss', obj: state.boss, y: state.boss.y },
      { type: 'player', obj: state.player, y: state.player.y }
    ];
    if (state.atm.bokeh) {
      for (let bt of state.forest.foregroundBokehTrees) {
        entities.push({ type: 'bokeh', obj: bt, y: bt.y + 100 });
      }
    }
    entities.sort((a, b) => a.y - b.y);

    for (let e of entities) {
      const p = projectM7(e.obj.x, e.obj.y);
      if (p) {
        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.scale(p.scale, p.scale);
        if (e.type === 'tree') this.drawMidgroundTree(ctx, { ...e.obj, x:0, y:0 }, state.time, state.styleMode);
        else if (e.type === 'torch') this.drawTorchPillar(ctx, { ...e.obj, x:0, y:0 }, state.time, state.styleMode);
        else if (e.type === 'bokeh') {
          ctx.shadowColor = e.obj.color;
          ctx.shadowBlur = 20;
          ctx.fillStyle = e.obj.color;
          ctx.globalAlpha = e.obj.alpha;
          ctx.beginPath(); ctx.arc(0, 0, e.obj.radius, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.translate(-e.obj.x, -e.obj.y);
          e.obj.draw(ctx, state.time, state.styleMode);
        }
        ctx.restore();
      }
    }
    ctx.restore();

    if (state.atm.godRays) this.drawGodRays(ctx, width, height, state.time, state.camera);
    if (state.atm.clouds) this.drawCloudShadows(ctx, width, height, state.clouds, state.camera);
  },

  // ==========================================
  // VIEW MODE 3: 2.5D BILLBOARD 3D & ORBIT
  // ==========================================
  renderBillboard3D(ctx, width, height, state) {
    ctx.save();
    const camX = state.camera.x;
    const camY = state.camera.y;
    const rotRad = (state.camera.rotDeg * Math.PI) / 180;
    const pitchRad = (state.camera.tiltDeg * Math.PI) / 180;

    const cosR = Math.cos(rotRad);
    const sinR = Math.sin(rotRad);
    const cosP = Math.cos(pitchRad);
    const sinP = Math.sin(pitchRad);

    const project3D = (wx, wy, wz = 0) => {
      const dx = wx - camX;
      const dy = wy - camY;
      const rx = dx * cosR - dy * sinR;
      const ry = dx * sinR + dy * cosR;
      const rz = wz;
      const vx = rx;
      const vy = ry * cosP - rz * sinP;
      const vz = ry * sinP + rz * cosP;
      const fov = 600;
      const viewZ = fov + vz;
      if (viewZ <= 20) return null;
      const scale = fov / viewZ;
      const sx = width / 2 + vx * scale;
      const sy = height / 2 - (vy - 140) * scale;
      return { sx, sy, scale, depth: viewZ };
    };

    // Layer 0: Project Grid Pavers in 3D
    const step = 60;
    ctx.lineWidth = 1;
    for (let x = 50; x < 950; x += step) {
      for (let y = 50; y < 950; y += step) {
        const p1 = project3D(x, y);
        const p2 = project3D(x + step, y);
        const p3 = project3D(x + step, y + step);
        const p4 = project3D(x, y + step);
        if (p1 && p2 && p3 && p4) {
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.lineTo(p3.sx, p3.sy);
          ctx.lineTo(p4.sx, p4.sy);
          ctx.closePath();
          
          const tileHash = Math.sin(x * 12.34 + y * 56.78) * 10000;
          ctx.fillStyle = (tileHash - Math.floor(tileHash)) > 0.7 ? 'rgba(21, 128, 61, 0.18)' : 'rgba(15, 23, 42, 0.85)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.stroke();
        }
      }
    }

    // Layer 2 & 3: Billboards
    const items = [];
    const addEntity = (obj, type) => {
      const p = project3D(obj.x, obj.y, 0);
      if (p) items.push({ p, obj, type });
    };

    for (let t of state.forest.midgroundTrees) addEntity(t, 'tree');
    for (let t of state.forest.torches) addEntity(t, 'torch');
    addEntity(state.boss, 'boss');
    addEntity(state.player, 'player');
    for (let pt of state.particles) addEntity(pt, 'particle');
    if (state.atm.bokeh) {
      for (let bt of state.forest.foregroundBokehTrees) addEntity(bt, 'bokeh');
    }

    items.sort((a, b) => b.p.depth - a.p.depth);

    for (let item of items) {
      const { p, obj, type } = item;
      ctx.save();
      ctx.translate(p.sx, p.sy);
      ctx.scale(p.scale, p.scale);

      if (type === 'tree') {
        ctx.translate(0, -obj.radius * 0.8);
        this.drawMidgroundTree(ctx, { ...obj, x:0, y:0 }, state.time, state.styleMode);
      } else if (type === 'torch') {
        this.drawTorchPillar(ctx, { ...obj, x:0, y:0 }, state.time, state.styleMode);
      } else if (type === 'particle') {
        ctx.globalAlpha = obj.alpha;
        ctx.fillStyle = obj.color;
        ctx.beginPath(); ctx.arc(0, 0, obj.radius, 0, Math.PI * 2); ctx.fill();
      } else if (type === 'bokeh') {
        ctx.shadowColor = obj.color; ctx.shadowBlur = 20; ctx.fillStyle = obj.color; ctx.globalAlpha = obj.alpha;
        ctx.beginPath(); ctx.arc(0, 0, obj.radius, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.translate(-obj.x, -obj.y);
        obj.draw(ctx, state.time, state.styleMode);
      }
      ctx.restore();
    }
    ctx.restore();

    if (state.atm.godRays) this.drawGodRays(ctx, width, height, state.time, state.camera);
    if (state.atm.clouds) this.drawCloudShadows(ctx, width, height, state.clouds, state.camera);
  },

  // ==========================================
  // VIEW MODE 4: DEPTH SCALING & SKEWED SHADOW
  // ==========================================
  renderDepthShadow(ctx, width, height, state) {
    this.renderTopDown(ctx, width, height, state);

    ctx.save();
    ctx.translate(width / 2 - state.camera.x, height / 2 - state.camera.y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';

    const drawShadow = (x, y, radius, heightFactor) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.transform(1, 0, -0.7, 0.4, 0, 0);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * heightFactor, radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawShadow(state.player.x, state.player.y, state.player.radius, 1.8);
    drawShadow(state.boss.x, state.boss.y, state.boss.radius, 2.2);
    for (let t of state.forest.midgroundTrees) {
      drawShadow(t.x, t.y, t.radius, 1.5);
    }
    ctx.restore();
  },

  // ==========================================
  // VIEW MODE 5: CINEMATIC TILT-SHIFT & BOKEH
  // ==========================================
  renderCinematicTiltShift(ctx, width, height, state) {
    ctx.save();
    ctx.translate(width * 0.1, height * 0.1);
    ctx.scale(0.8, 0.8);
    this.renderTopDown(ctx, width, height, state);
    ctx.restore();

    ctx.save();
    const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.25);
    topGrad.addColorStop(0, 'rgba(2, 6, 23, 0.95)');
    topGrad.addColorStop(1, 'rgba(2, 6, 23, 0.0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, height * 0.25);

    const botGrad = ctx.createLinearGradient(0, height * 0.75, 0, height);
    botGrad.addColorStop(0, 'rgba(2, 6, 23, 0.0)');
    botGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, height * 0.75, width, height * 0.25);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height * 0.08);
    ctx.fillRect(0, height * 0.92, width, height * 0.08);
    ctx.restore();
  }
};
