/**
 * main.js
 * Core Game Loop, State Management, Input Controller & High-Fidelity Entities
 * Supports both HD Vector Art and 16-Bit Retro Pixel Art!
 */

// ==========================================
// 1. INPUT HANDLER (Keyboard + Mouse Drag + Touch Joystick)
// ==========================================
class InputHandler {
  constructor() {
    this.keys = {};
    this.joystick = { dx: 0, dy: 0, active: false };
    this.mouseDrag = { active: false, startX: 0, startY: 0 };
    
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

    // Touch & Mouse Virtual Joystick
    const base = document.getElementById('joystickBase');
    const stick = document.getElementById('joystickStick');
    const wrapper = document.getElementById('joystickWrapper');

    if (!base || !stick) return;

    const handleTouch = (clientX, clientY) => {
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = rect.width / 2;

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      stick.style.transform = `translate(${dx}px, ${dy}px)`;
      this.joystick.dx = dx / maxRadius;
      this.joystick.dy = dy / maxRadius;
    };

    const resetJoystick = () => {
      stick.style.transform = `translate(0px, 0px)`;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      this.joystick.active = false;
    };

    wrapper.addEventListener('mousedown', (e) => {
      this.joystick.active = true;
      handleTouch(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => {
      if (this.joystick.active) handleTouch(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => {
      if (this.joystick.active) resetJoystick();
    });

    wrapper.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.joystick.active = true;
      const touch = e.targetTouches[0];
      handleTouch(touch.clientX, touch.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.joystick.active) {
        e.preventDefault();
        const touch = e.targetTouches[0] || e.touches[0];
        if (touch) handleTouch(touch.clientX, touch.clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (this.joystick.active) resetJoystick();
    });
  }
}

// ==========================================
// 2. PARTICLE & FX SYSTEM
// ==========================================
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawnFlame(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -1.2 - Math.random() * 1.5,
      radius: 4 + Math.random() * 4,
      color: Math.random() > 0.5 ? '#00f0ff' : '#67e8f9', // Cyan magic flame
      alpha: 1.0,
      life: 25 + Math.random() * 15,
      maxLife: 40
    });
  }

  spawnSlashFX(x, y, angle) {
    for (let i = 0; i < 15; i++) {
      const spd = 2 + Math.random() * 4;
      const spread = angle + (Math.random() - 0.5) * 0.8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(spread) * spd,
        vy: Math.sin(spread) * spd,
        radius: 2 + Math.random() * 3,
        color: i % 2 === 0 ? '#fbbf24' : '#ffffff',
        alpha: 1.0,
        life: 15 + Math.random() * 10,
        maxLife: 25
      });
    }
  }

  spawnBossMagmaFX(x, y) {
    for (let i = 0; i < 40; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 6;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        radius: 4 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#ef4444' : '#f97316',
        alpha: 1.0,
        life: 30 + Math.random() * 20,
        maxLife: 50
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.radius > 0.1) p.radius *= 0.96;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
}

// ==========================================
// 3. HERO KNIGHT (Player)
// ==========================================
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 22;
    this.speed = 4.8;
    this.angle = -Math.PI / 2;
    
    this.walkAnim = 0;
    this.isMoving = false;
    this.capeHistory = [];
    for (let i = 0; i < 10; i++) {
      this.capeHistory.push({ x: x, y: y });
    }
    this.weaponAngle = 0;
    this.slashTimer = 0;
  }

  update(input, bounds) {
    let dx = 0;
    let dy = 0;

    if (input.keys['KeyW'] || input.keys['ArrowUp'] || input.joystick.dy < -0.1) {
      dy -= input.joystick.dy < -0.1 ? Math.abs(input.joystick.dy) : 1;
    }
    if (input.keys['KeyS'] || input.keys['ArrowDown'] || input.joystick.dy > 0.1) {
      dy += input.joystick.dy > 0.1 ? input.joystick.dy : 1;
    }
    if (input.keys['KeyA'] || input.keys['ArrowLeft'] || input.joystick.dx < -0.1) {
      dx -= input.joystick.dx < -0.1 ? Math.abs(input.joystick.dx) : 1;
    }
    if (input.keys['KeyD'] || input.keys['ArrowRight'] || input.joystick.dx > 0.1) {
      dx += input.joystick.dx > 0.1 ? input.joystick.dx : 1;
    }

    this.isMoving = (dx !== 0 || dy !== 0);

    if (this.isMoving) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      
      this.x += dx * this.speed;
      this.y += dy * this.speed;
      this.angle = Math.atan2(dy, dx);
      this.walkAnim += 0.25;
    } else {
      this.walkAnim *= 0.85;
    }

    this.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.x));
    this.y = Math.max(bounds.minY, Math.min(bounds.maxY, this.y));

    this.capeHistory.unshift({ x: this.x, y: this.y });
    if (this.capeHistory.length > 10) {
      this.capeHistory.pop();
    }

    this.weaponAngle = Math.sin(this.walkAnim * 1.5) * 0.45;
    if (this.slashTimer > 0) this.slashTimer--;
  }

  triggerAttack() {
    this.slashTimer = 15;
  }

  draw(ctx, time, styleMode = 'vector') {
    // 16-Bit Retro Pixel Art Style
    if (styleMode === 'pixel' && window.SpriteManager && window.SpriteManager.get('player_idle_0')) {
      ctx.save();
      ctx.translate(this.x, this.y);
      const frameIdx = Math.floor(time * 3) % 2;
      const runIdx = Math.floor(time * 8) % 2;
      const spriteName = this.isMoving ? `player_run_${runIdx}` : `player_idle_${frameIdx}`;
      const flipX = (Math.abs(this.angle) > Math.PI / 2);
      window.SpriteManager.drawSprite(ctx, spriteName, 0, 0, 52, 70, flipX);

      if (this.slashTimer > 0) {
        ctx.rotate(this.angle);
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(20, 0, 35, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // HD Vector Procedural Style
    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. Waving Red Cape
    ctx.save();
    ctx.rotate(this.angle + Math.PI);
    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.lineTo(-6, 10);
    const capeSway = Math.sin(time * 12) * (this.isMoving ? 9 : 3);
    ctx.lineTo(26 + Math.sin(time * 5) * 4, 15 + capeSway);
    ctx.lineTo(30 + Math.cos(time * 6) * 4, capeSway);
    ctx.lineTo(26 + Math.sin(time * 5) * 4, -15 + capeSway);
    ctx.closePath();
    const capeGrad = ctx.createLinearGradient(0, 0, 32, 0);
    capeGrad.addColorStop(0, '#ef4444');
    capeGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = capeGrad;
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 2. Rotate Body to Facing Angle
    ctx.rotate(this.angle);

    // Shoulders
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(2, -15, 9, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(2, 15, 9, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 3. Glowing Magic Shield
    ctx.save();
    ctx.translate(8, -17);
    ctx.rotate(-0.25);
    ctx.beginPath();
    ctx.roundRect(-5, -9, 15, 18, 5);
    const shieldGrad = ctx.createLinearGradient(-5, 0, 10, 0);
    shieldGrad.addColorStop(0, '#0f172a');
    shieldGrad.addColorStop(0.5, '#00f0ff');
    shieldGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = shieldGrad;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 4. Knight Torso
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
    const armorGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 16);
    armorGrad.addColorStop(0, '#f8fafc');
    armorGrad.addColorStop(0.4, '#94a3b8');
    armorGrad.addColorStop(1, '#334155');
    ctx.fillStyle = armorGrad;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Gold Trim
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 10, -Math.PI/2, Math.PI/2); ctx.stroke();

    // 5. Knight Helmet & Visor
    ctx.beginPath();
    ctx.arc(4, 0, 10, 0, Math.PI * 2);
    const helmGrad = ctx.createRadialGradient(2, -2, 1, 4, 0, 10);
    helmGrad.addColorStop(0, '#ffffff');
    helmGrad.addColorStop(0.5, '#cbd5e1');
    helmGrad.addColorStop(1, '#475569');
    ctx.fillStyle = helmGrad;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing Eye Slit
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(8, -4, 5, 8);
    ctx.shadowBlur = 0;

    // 6. Sword Arm & Blade
    ctx.save();
    ctx.translate(6, 16);
    ctx.rotate(0.3 + this.weaponAngle + (this.slashTimer > 0 ? -1.5 : 0));

    ctx.fillStyle = '#78350f';
    ctx.fillRect(-3, -3, 10, 6);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(5, -6, 4, 12);

    ctx.beginPath();
    ctx.moveTo(9, -3);
    ctx.lineTo(38, -2);
    ctx.lineTo(43, 0);
    ctx.lineTo(38, 2);
    ctx.lineTo(9, 3);
    ctx.closePath();
    const bladeGrad = ctx.createLinearGradient(9, 0, 43, 0);
    bladeGrad.addColorStop(0, '#cbd5e1');
    bladeGrad.addColorStop(0.7, '#f8fafc');
    bladeGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = bladeGrad;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = this.slashTimer > 0 ? 15 : 4;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 7. Sword Slash Arc FX
    if (this.slashTimer > 0) {
      ctx.beginPath();
      ctx.arc(12, 0, 42, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}

// ==========================================
// 4. INFERNO GOLEM (Boss Entity)
// ==========================================
class BossGolem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 42;
    this.hp = 1000;
    this.maxHp = 1000;
    this.state = 'IDLE';
    this.angle = 0;
    this.pulse = 0;
    this.skillCooldown = 0;

    this.leftHandAngle = -0.5;
    this.rightHandAngle = 0.5;
    this.handDist = 65;
  }

  update(player, particles, time) {
    this.pulse = Math.sin(time * 3) * 0.08;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    this.angle = Math.atan2(dy, dx);

    if (this.skillCooldown > 0) this.skillCooldown--;

    if (this.state === 'IDLE' && dist < 400) {
      this.state = 'CHASE';
    }

    if (this.state === 'CHASE') {
      if (dist > 80) {
        this.x += Math.cos(this.angle) * 1.5;
        this.y += Math.sin(this.angle) * 1.5;
      } else {
        this.state = 'ATTACK';
        setTimeout(() => { this.state = 'CHASE'; }, 800);
      }

      if (this.skillCooldown <= 0 && dist < 320 && Math.random() < 0.02) {
        this.triggerSkill(particles);
      }
    }

    this.leftHandAngle = -0.6 + Math.sin(time * 4) * 0.2;
    this.rightHandAngle = 0.6 + Math.cos(time * 4) * 0.2;
    if (this.state === 'ATTACK') {
      this.handDist = 85 + Math.sin(time * 15) * 20;
    } else {
      this.handDist = 65 + Math.sin(time * 2) * 5;
    }
  }

  triggerSkill(particles) {
    this.state = 'SKILL';
    this.skillCooldown = 180;
    particles.spawnBossMagmaFX(this.x, this.y);
    setTimeout(() => { this.state = 'CHASE'; }, 1000);
  }

  draw(ctx, time, styleMode = 'vector') {
    // 16-Bit Retro Pixel Art Style
    if (styleMode === 'pixel' && window.SpriteManager && window.SpriteManager.get('boss_idle_0')) {
      ctx.save();
      ctx.translate(this.x, this.y);
      const frameIdx = Math.floor(time * 2) % 2;
      const spriteName = `boss_idle_${frameIdx}`;
      window.SpriteManager.drawSprite(ctx, spriteName, 0, 0, 110, 110);
      ctx.restore();
      return;
    }

    // HD Vector Procedural Style
    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. Lava Aura on Ground
    const auraRadius = (this.radius + 18) * (1 + this.pulse);
    const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, auraRadius);
    auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
    auraGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.35)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Floating Stone Fists
    const drawHand = (angOffset, dist, size) => {
      ctx.save();
      const hx = Math.cos(this.angle + angOffset) * dist;
      const hy = Math.sin(this.angle + angOffset) * dist;
      ctx.translate(hx, hy);
      ctx.rotate(this.angle + angOffset);

      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-size, -size, size * 2, size * 2, 6);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    };

    drawHand(this.leftHandAngle, this.handDist, 16);
    drawHand(this.rightHandAngle, this.handDist, 18);

    // 3. Rotate Torso
    ctx.rotate(this.angle);

    // Jagged Shoulder Crystals
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(-22, -45); ctx.lineTo(12, -60); ctx.lineTo(28, -38); ctx.lineTo(-12, -28);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-22, 45); ctx.lineTo(12, 60); ctx.lineTo(28, 38); ctx.lineTo(-12, 28);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // 4. Central Magma Core & Obsidian Armor
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    const bodyGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 40);
    bodyGrad.addColorStop(0, '#f97316');
    bodyGrad.addColorStop(0.35, '#dc2626');
    bodyGrad.addColorStop(0.75, '#1e293b');
    bodyGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 5. Pulsing Magma Fissures
    ctx.beginPath();
    ctx.moveTo(-18, -18); ctx.lineTo(6, -6); ctx.lineTo(-6, 18); ctx.lineTo(-28, 12);
    ctx.moveTo(12, -22); ctx.lineTo(22, 0); ctx.lineTo(14, 24);
    ctx.strokeStyle = '#ffedd5';
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 6. Golem Mask & Eyes
    ctx.save();
    ctx.translate(20, 0);
    ctx.beginPath();
    ctx.moveTo(-14, -18); ctx.lineTo(16, -11); ctx.lineTo(20, 0); ctx.lineTo(16, 11); ctx.lineTo(-14, 18);
    ctx.closePath();
    ctx.fillStyle = '#050811';
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(7, -7, 3.5, 0, Math.PI * 2);
    ctx.arc(7, 7, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();
  }
}

// ==========================================
// 5. ATMOSPHERIC CLOUD SYSTEM
// ==========================================
class CloudSystem {
  constructor() {
    this.clouds = [
      { x: 100, y: 150, radiusX: 180, radiusY: 100, alpha: 0.38, speed: 0.3, blobs: [{dx:0, dy:0, r:1}, {dx:60, dy:-20, r:0.8}, {dx:-70, dy:10, r:0.85}] },
      { x: 600, y: 700, radiusX: 220, radiusY: 130, alpha: 0.35, speed: 0.25, blobs: [{dx:0, dy:0, r:1}, {dx:80, dy:20, r:0.9}, {dx:-80, dy:-15, r:0.75}] },
      { x: -150, y: 800, radiusX: 200, radiusY: 110, alpha: 0.40, speed: 0.35, blobs: [{dx:0, dy:0, r:1}, {dx:50, dy:30, r:0.8}] }
    ];
  }

  update() {
    for (let c of this.clouds) {
      c.x += c.speed;
      if (c.x - c.radiusX > 1500) {
        c.x = -400;
        c.y = 100 + Math.random() * 800;
      }
    }
  }
}

// ==========================================
// 6. ENVIRONMENT SYSTEM (Forest Trees, Torches & Bushes)
// ==========================================
class ForestSystem {
  constructor() {
    this.midgroundTrees = [
      { x: 200, y: 200, radius: 45, color: '#065f46' },
      { x: 300, y: 150, radius: 55, color: '#047857' },
      { x: 750, y: 200, radius: 50, color: '#065f46' },
      { x: 820, y: 320, radius: 40, color: '#059669' },
      { x: 180, y: 750, radius: 55, color: '#047857' },
      { x: 300, y: 850, radius: 48, color: '#065f46' },
      { x: 750, y: 780, radius: 52, color: '#059669' },
      { x: 850, y: 680, radius: 45, color: '#047857' },
      { x: 150, y: 480, radius: 42, color: '#065f46' },
      { x: 860, y: 500, radius: 48, color: '#059669' }
    ];

    this.torches = [
      { x: 350, y: 350, flameY: -28 },
      { x: 650, y: 350, flameY: -28 },
      { x: 350, y: 650, flameY: -28 },
      { x: 650, y: 650, flameY: -28 }
    ];

    this.bushes = [];
    for (let i = 0; i < 35; i++) {
      this.bushes.push({
        x: 80 + Math.random() * 840,
        y: 80 + Math.random() * 840,
        radius: 12 + Math.random() * 10,
        color: Math.random() > 0.5 ? '#15803d' : '#16a34a',
        hasFlower: Math.random() < 0.4,
        flowerColor: Math.random() > 0.5 ? '#f43f5e' : '#fde047'
      });
    }

    this.foregroundBokehTrees = [
      { x: 250, y: 650, radius: 110, color: '#022c22', alpha: 0.85 },
      { x: 700, y: 350, radius: 120, color: '#022c22', alpha: 0.85 },
      { x: 480, y: 800, radius: 105, color: '#064e3b', alpha: 0.80 }
    ];
  }

  update(time) {}
}

// ==========================================
// 7. GAME APP CORE ORCHESTRATOR
// ==========================================
class GameApp {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.currentMode = 'topdown';
    this.styleMode = 'vector'; // 'vector' or 'pixel'
    this.time = 0;
    
    this.bounds = { minX: 50, maxX: 950, minY: 50, maxY: 950 };
    this.camera = { x: 500, y: 500, targetX: 500, targetY: 500, tiltDeg: 45, rotDeg: 0 };

    this.input = new InputHandler();
    this.particles = new ParticleSystem();
    this.player = new Player(500, 500);
    this.boss = new BossGolem(500, 250);
    this.clouds = new CloudSystem();
    this.forest = new ForestSystem();

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupUI();
    this.setupCanvasControls();
    this.updateModeCard('topdown');
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    const wrapper = this.canvas.parentElement;
    this.canvas.width = wrapper.clientWidth || 800;
    this.canvas.height = wrapper.clientHeight || 600;
  }

  setupCanvasControls() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.player.triggerAttack();
        this.particles.spawnSlashFX(this.player.x, this.player.y, this.player.angle);
      } else if (e.button === 2) {
        this.input.mouseDrag.active = true;
        this.input.mouseDrag.startX = e.clientX;
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('mousemove', (e) => {
      if (this.input.mouseDrag.active && this.currentMode === 'billboard') {
        const dx = e.clientX - this.input.mouseDrag.startX;
        this.camera.rotDeg = (this.camera.rotDeg + dx * 0.4) % 360;
        this.input.mouseDrag.startX = e.clientX;
        document.getElementById('rotSlider').value = Math.round(this.camera.rotDeg);
        document.getElementById('rotVal').innerText = `${Math.round(this.camera.rotDeg)}°`;
      }
    });
    window.addEventListener('mouseup', () => { this.input.mouseDrag.active = false; });
  }

  setupUI() {
    const btns = document.querySelectorAll('.mode-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.updateModeCard(this.currentMode);
      });
    });

    // Art Style Selector Buttons
    const styleBtns = document.querySelectorAll('.style-btn');
    styleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        styleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.styleMode = btn.dataset.style;
      });
    });

    const tiltSlider = document.getElementById('tiltSlider');
    const rotSlider = document.getElementById('rotSlider');
    tiltSlider?.addEventListener('input', (e) => {
      this.camera.tiltDeg = parseFloat(e.target.value);
      document.getElementById('tiltVal').innerText = `${this.camera.tiltDeg}°`;
    });
    rotSlider?.addEventListener('input', (e) => {
      this.camera.rotDeg = parseFloat(e.target.value);
      document.getElementById('rotVal').innerText = `${this.camera.rotDeg}°`;
    });

    document.getElementById('bossAttackBtn')?.addEventListener('click', () => {
      this.boss.triggerSkill(this.particles);
    });
    document.getElementById('resetPosBtn')?.addEventListener('click', () => {
      this.player.x = 500;
      this.player.y = 500;
      this.boss.x = 500;
      this.boss.y = 250;
    });
  }

  updateModeCard(mode) {
    const title = document.getElementById('modeTitle');
    const desc = document.getElementById('modeDesc');
    const feat = document.getElementById('modeFeatures');
    if (!title || !desc || !feat) return;

    switch(mode) {
      case 'topdown':
        title.innerText = '01. Standard 2D Top-Down';
        desc.innerText = '기본 90도 수직 탑다운 시점입니다. 전체 맵 구도와 전투 상황을 한눈에 정확히 파악할 수 있습니다.';
        feat.innerHTML = '<span>• 90° Overhead</span><span>• Crisp 2D Grid</span><span>• Classic RPG</span>';
        break;
      case 'mode7':
        title.innerText = '02. Mode 7 Tilt (SNES Style)';
        desc.innerText = '고전 슈퍼닌텐도(SNES)의 Mode 7 스캔라인 투영을 완벽히 재현하여 2D 바닥을 지평선 너머로 입체적으로 눕힙니다.';
        feat.innerHTML = '<span>• Scanline Warp</span><span>• Retro Perspective</span><span>• Horizon Depth</span>';
        break;
      case 'billboard':
        title.innerText = '03. 2.5D Billboard 3D & Orbit';
        desc.innerText = '3D 카메라 회전 행렬(Pitch & Yaw)을 적용하고 2D 캐릭터를 카메라 방향으로 빌보드 세워 3D 필드처럼 연출합니다. 마우스 드래그로 카메라 회전이 가능합니다!';
        feat.innerHTML = '<span>• 3D Rotation Matrix</span><span>• Billboard Sprite</span><span>• 360° Orbit Drag</span>';
        break;
      case 'depth':
        title.innerText = '04. Depth Scaling & Skewed Shadow';
        desc.innerText = '카메라 Y축 거리에 따라 캐릭터와 오브젝트의 크기가 변하고, 광원에 의해 바닥 그림자가 길게 늘어나는 입체 연출입니다.';
        feat.innerHTML = '<span>• Distance Scaling</span><span>• Skewed Shadows</span><span>• Dynamic Lighting</span>';
        break;
      case 'cinematic':
        title.innerText = '05. Cinematic Tilt-Shift & Bokeh';
        desc.innerText = '보스 전투나 극적인 이벤트 씬에 적합한 시네마틱 뷰입니다. 상하단 뎁스오브필드(Bokeh blur)와 줌인 효과로 몰입감을 극대화합니다.';
        feat.innerHTML = '<span>• Tilt-Shift Blur</span><span>• Dramatic Zoom</span><span>• Boss Arena Focus</span>';
        break;
    }
  }

  loop(timestamp) {
    this.time += 0.016;

    try {
      this.player.update(this.input, this.bounds);
      this.boss.update(this.player, this.particles, this.time);
      this.clouds.update();
      this.forest.update(this.time);

      if (Math.random() < 0.45) {
        for (let t of this.forest.torches) {
          this.particles.spawnFlame(t.x, t.y + t.flameY);
        }
      }
      this.particles.update();

      this.camera.targetX = this.player.x;
      this.camera.targetY = this.player.y;
      this.camera.x += (this.camera.targetX - this.camera.x) * 0.12;
      this.camera.y += (this.camera.targetY - this.camera.y) * 0.12;

      const hpBar = document.getElementById('bossHpBar');
      if (hpBar) {
        const pct = Math.max(0, (this.boss.hp / this.boss.maxHp) * 100);
        hpBar.style.width = `${pct}%`;
      }

      const atm = {
        clouds: document.getElementById('toggleCloud')?.checked ?? true,
        bokeh: document.getElementById('toggleBokeh')?.checked ?? true,
        godRays: document.getElementById('toggleGodRays')?.checked ?? true,
        canopy: document.getElementById('toggleCanopy')?.checked ?? true
      };

      if (window.GameRenderer) {
        window.GameRenderer.render(this.ctx, this.canvas, {
          mode: this.currentMode,
          styleMode: this.styleMode,
          camera: this.camera,
          player: this.player,
          boss: this.boss,
          clouds: this.clouds.clouds,
          forest: this.forest,
          particles: this.particles.particles,
          time: this.time,
          atm: atm
        });
      }
    } catch (err) {
      console.error('Render Loop Error:', err);
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('load', () => {
  window.app = new GameApp();
});
