/**
 * sprites.js
 * 16-Bit Pixel Art Sprite Sheet & Procedural Texture Engine
 * Generates authentic retro 2D pixel art sprites (Zelda / Chrono Trigger / Octopath Traveler style)
 * to offscreen canvases with crisp 0ms loading and zero network dependencies!
 */

window.SpriteManager = {
  cache: {},
  palettes: {
    player: {
      '.': null,
      'K': '#0f172a', // Outline
      'H': '#f1f5f9', // Helmet silver highlight
      'h': '#94a3b8', // Armor steel mid
      'd': '#475569', // Armor dark shadow
      'E': '#38bdf8', // Glowing cyan eye slit
      'C': '#ef4444', // Crimson cape bright
      'c': '#991b1b', // Crimson cape shadow
      'T': '#2563eb', // Blue royal tunic
      't': '#1e3a8a', // Tunic shadow
      'B': '#78350f', // Leather brown
      'b': '#451a03', // Leather dark
      'S': '#f8fafc', // Sword blade bright
      's': '#cbd5e1', // Sword blade mid
      'G': '#fbbf24', // Golden buckle / trim
    },
    boss: {
      '.': null,
      'K': '#050505', // Pitch black outline
      'O': '#475569', // Obsidian stone highlight
      'o': '#1e293b', // Obsidian stone mid
      'd': '#0f172a', // Obsidian stone shadow
      'M': '#ffffff', // Magma white-hot core
      'Y': '#facc15', // Magma yellow
      'R': '#f97316', // Lava orange
      'r': '#dc2626', // Lava dark red
      'E': '#ff0000', // Glowing demon eyes
      'P': '#9333ea', // Dark magic purple rune
    },
    tree: {
      '.': null,
      'K': '#022c22', // Deep forest outline
      'L': '#4ade80', // Foliage lime highlight
      'G': '#16a34a', // Foliage emerald mid
      'g': '#15803d', // Foliage dark
      's': '#065f46', // Foliage shadow
      'T': '#92400e', // Wood trunk bark light
      't': '#451a03', // Wood trunk bark dark
    },
    torch: {
      '.': null,
      'K': '#0f172a', // Outline
      'S': '#94a3b8', // Stone brick light
      's': '#475569', // Stone brick mid
      'd': '#334155', // Stone brick dark
      'm': '#15803d', // Moss patch
      'W': '#ffffff', // Magic flame core
      'C': '#67e8f9', // Cyan flame inner
      'c': '#06b6d4', // Cyan flame mid
      'B': '#3b82f6', // Blue flame outer
    },
    bush: {
      '.': null,
      'K': '#022c22',
      'L': '#86efac',
      'G': '#22c55e',
      'g': '#15803d',
      'F': '#f43f5e', // Flower petal red
      'Y': '#fde047', // Flower center yellow
    }
  },

  spritesData: {
    // ----------------------------------------------------
    // HERO KNIGHT (16x22 Grid) - 16-Bit RPG Character
    // ----------------------------------------------------
    player_idle_0: {
      palette: 'player',
      grid: [
        "......KKKK......",
        "....KKHHHHKK....",
        "...KHHhHhhHhK...",
        "...KHhHEEEhhK...",
        "...KHhHhhhHhK...",
        "....KKhhhhKK....",
        "....cKTTTTKc....",
        "...cKTTGGTTKc...",
        "...cKTThhTTKc...",
        "..ccKTTTTTTKcc..",
        "..cKHhhBBhhHKc..",
        "..cKdhBBBBhdKc..",
        "..cKddhhhhddKc..",
        "..cKKKTTTTKKKc..",
        "..c..KTTTTK..c..",
        ".....KBBBBK.....",
        ".....KBKKBK.....",
        ".....KBKKBK.....",
        ".....KhKKhK.....",
        "....KddKKddK....",
        "....KKK..KKK....",
        "................"
      ]
    },
    player_idle_1: {
      palette: 'player',
      grid: [
        "......KKKK......",
        "....KKHHHHKK....",
        "...KHHhHhhHhK...",
        "...KHhHEEEhhK...",
        "...KHhHhhhHhK...",
        "....KKhhhhKK....",
        "....cKTTTTKc....",
        "...cKTTGGTTKc...",
        "...cKTThhTTKc...",
        "..ccKTTTTTTKcc..",
        "..cKHhhBBhhHKc..",
        "..cKdhBBBBhdKc..",
        "..cKddhhhhddKc..",
        "..cKKKTTTTKKKc..",
        "..c..KTTTTK..c..",
        ".....KBBBBK.....",
        ".....KBKKBK.....",
        ".....KhKKhK.....",
        "....KddKKddK....",
        "....KKK..KKK....",
        "................",
        "................"
      ]
    },
    player_run_0: {
      palette: 'player',
      grid: [
        "......KKKK......",
        "....KKHHHHKK....",
        "...KHHhHhhHhK...",
        "...KHhHEEEhhK...",
        "...KHhHhhhHhK...",
        "....KKhhhhKK....",
        "....cKTTTTKc....",
        "...cKTTGGTTKc...",
        "..ccKTThhTTK....",
        "..cKdhTTTTTTK...",
        "..cKddhBBBBhK...",
        "..cKKKhhhhddK...",
        ".....KTTTTKKK...",
        ".....KTTTTK.....",
        ".....KBBBBK.....",
        "....KBKKKKhK....",
        "...KBK...KddK...",
        "..KhK.....KKK...",
        ".KddK...........",
        ".KKK............",
        "................",
        "................"
      ]
    },
    player_run_1: {
      palette: 'player',
      grid: [
        "......KKKK......",
        "....KKHHHHKK....",
        "...KHHhHhhHhK...",
        "...KHhHEEEhhK...",
        "...KHhHhhhHhK...",
        "....KKhhhhKK....",
        "....cKTTTTKc....",
        "...cKTTGGTTKc...",
        "...cKTThhTTKc...",
        "..ccKTTTTTTKcc..",
        "..cKHhhBBhhHKc..",
        "..cKdhBBBBhdKc..",
        "..cKddhhhhddKc..",
        "..cKKKTTTTKKKc..",
        "..c..KTTTTK..c..",
        ".....KBBBBK.....",
        ".....KBKKBK.....",
        "....KhKKKBK.....",
        "...KddK..KhK....",
        "...KKK...KddK...",
        ".........KKK....",
        "................"
      ]
    },

    // ----------------------------------------------------
    // INFERNO GOLEM BOSS (28x28 Grid) - Massive 16-Bit Monster
    // ----------------------------------------------------
    boss_idle_0: {
      palette: 'boss',
      grid: [
        "..........KKKKKKKK..........",
        "........KKOOOOOOOOKK........",
        ".......KOOOOOOOOOOOOK.......",
        "......KOOOEEOOOOOEEOOK......",
        "......KOOOEEOOOOOEEOOK......",
        ".....KOOOOooOOOOOooOOOK.....",
        "....KOOOOoooMMYMMoooOOOK....",
        "...KOOOOooMMYYYYYMMooOOOK...",
        "..KKOOOooMYYYRRRYYYMooOOOKK.",
        ".KooKOOooMYRRrrrrRRYMooOOKooK",
        "KoooKOOooYRrrrPPrrrRYooOOKoooK",
        "KooKKOOooYRrrPPPPrrrRYooOOKoK",
        "KooKOOOooYRrrPPPPrrrRYooOOOooK",
        "KooKOOOooMYRRrrrrRRYMooOOOOooK",
        "KooKOOOOooMYYYRRRYYYMooOOOOooK",
        "KooKKOOOooMMYYYYYMMooOOOOOKooK",
        ".KooKKOOOoooMMYMMoooOOOOOKooK",
        ".KoooKKOOOoooOOOOOoooOOOKoooK",
        "..KoooKKOOOOOOOOOOOOOOOKoooK..",
        "...KoooKKOOOOOOOOOOOOOKoooK...",
        "....KKooKKOOOOOOOOOOOKooKK....",
        ".....KooKKOOOOOOOOOOOKooK.....",
        ".....KOOOOKKOOOOOOKKOOOOK.....",
        "....KOOOOOOK......KOOOOOOK....",
        "....KOOOOOOK......KOOOOOOK....",
        "....KooooooK......KooooooK....",
        "....KddddddK......KddddddK....",
        "....KKKKKKKK......KKKKKKKK...."
      ]
    },
    boss_idle_1: {
      palette: 'boss',
      grid: [
        "..........KKKKKKKK..........",
        "........KKOOOOOOOOKK........",
        ".......KOOOOOOOOOOOOK.......",
        "......KOOOEEOOOOOEEOOK......",
        "......KOOOEEOOOOOEEOOK......",
        ".....KOOOOooOOOOOooOOOK.....",
        "....KOOOOoooMYYYMoooOOOK....",
        "...KOOOOooMYYMMMMYYooOOOK...",
        "..KKOOOooMYMMYYYYMMYMooOOOKK.",
        ".KooKOOooMYYRrrrrRYYMooOOKooK",
        "KoooKOOooYRrrPPPPrrrRYooOOKoooK",
        "KooKKOOooYRrrPPPPrrrRYooOOKoK",
        "KooKOOOooYRrrPPPPrrrRYooOOOooK",
        "KooKOOOooMYYRrrrrRYYMooOOOOooK",
        "KooKOOOOooMYMMYYYYMMYMooOOOOooK",
        "KooKKOOOooMYYMMMMYYooOOOOOKooK",
        ".KooKKOOOoooMYYYMoooOOOOOKooK",
        ".KoooKKOOOoooOOOOOoooOOOKoooK",
        "..KoooKKOOOOOOOOOOOOOOOKoooK..",
        "...KoooKKOOOOOOOOOOOOOKoooK...",
        "....KKooKKOOOOOOOOOOOKooKK....",
        ".....KooKKOOOOOOOOOOOKooK.....",
        ".....KOOOOKKOOOOOOKKOOOOK.....",
        "....KOOOOOOK......KOOOOOOK....",
        "....KOOOOOOK......KOOOOOOK....",
        "....KooooooK......KooooooK....",
        "....KddddddK......KddddddK....",
        "....KKKKKKKK......KKKKKKKK...."
      ]
    },

    // ----------------------------------------------------
    // RPG PINE TREE (20x26 Grid)
    // ----------------------------------------------------
    tree_pine: {
      palette: 'tree',
      grid: [
        ".........KK.........",
        "........KLLK........",
        ".......KLLGGK.......",
        "......KLLGGGGK......",
        ".....KLLGGGGssK.....",
        "....KLLGGGGssssK....",
        "....KssssssssssK....",
        "......KLLGGGGK......",
        ".....KLLGGGGggK.....",
        "....KLLGGGGggggK....",
        "...KLLGGGGggggssK...",
        "..KLLGGGGggggssssK..",
        "..KssssssssssssssK..",
        "....KLLGGGGggggK....",
        "...KLLGGGGggggssK...",
        "..KLLGGGGggggssssK..",
        ".KLLGGGGggggssssssK.",
        "KLLGGGGggggssssssssK",
        "KssssssssssssssssssK",
        "........KTTK........",
        "........KTTK........",
        "........KTTK........",
        "........KTTK........",
        "........KttK........",
        ".......KTTttK.......",
        ".......KKKKKK......."
      ]
    },

    // ----------------------------------------------------
    // MAGIC STONE TORCH PILLAR (12x20 Grid)
    // ----------------------------------------------------
    torch_0: {
      palette: 'torch',
      grid: [
        ".....WW.....",
        "....WCCW....",
        "...WCCccW...",
        "...WccBBW...",
        "....WBBW....",
        ".....WW.....",
        "...KKKKKK...",
        "..KSSSSSSK..",
        "..KSssssSK..",
        "..KSsmssSK..",
        "..KSssssSK..",
        "..KSssssSK..",
        "..KSssmsSK..",
        "..KSssssSK..",
        "..KSssssSK..",
        "..KSsmssSK..",
        "..KSssssSK..",
        ".KSSSSSSSSK.",
        ".KddddddddK.",
        ".KKKKKKKKKK."
      ]
    },
    torch_1: {
      palette: 'torch',
      grid: [
        "....WW......",
        "...WCCW.....",
        "..WCCccW....",
        "...WccBBW...",
        "....WBBW....",
        ".....WW.....",
        "...KKKKKK...",
        "..KSSSSSSK..",
        "..KSssssSK..",
        "..KSsmssSK..",
        "..KSssssSK..",
        "..KSssssSK..",
        "..KSssmsSK..",
        "..KSssssSK..",
        "..KSssssSK..",
        "..KSsmssSK..",
        "..KSssssSK..",
        ".KSSSSSSSSK.",
        ".KddddddddK.",
        ".KKKKKKKKKK."
      ]
    },
    torch_2: {
      palette: 'torch',
      grid: [
        "......WW....",
        ".....WCCW...",
        "....WCCccW..",
        "...WccBBW...",
        "....WBBW....",
        ".....WW.....",
        "...KKKKKK...",
        "..KSSSSSSK..",
        "..KSssssSK..",
        "..KSsmssSK..",
        "..KSssssSK..",
        "..KSssssSK..",
        "..KSssmsSK..",
        "..KSssssSK..",
        "..KSssssSK..",
        "..KSsmssSK..",
        "..KSssssSK..",
        ".KSSSSSSSSK.",
        ".KddddddddK.",
        ".KKKKKKKKKK."
      ]
    },

    // ----------------------------------------------------
    // RPG BUSH & FLOWERS (12x12 Grid)
    // ----------------------------------------------------
    bush_normal: {
      palette: 'bush',
      grid: [
        "....KKKK....",
        "..KKLLLLKK..",
        ".KLLGGGGGGK.",
        "KLLGGGGGGGGK",
        "KLGGGGGGGGgK",
        "KLGGGGGGGGgK",
        "KGGGGGGGGggK",
        "KGGGGGGGGggK",
        ".KGGGGGGggK.",
        "..KKggggKK..",
        "....KKKK....",
        "............"
      ]
    },
    bush_flower: {
      palette: 'bush',
      grid: [
        "....KKKK....",
        "..KKLLLLKK..",
        ".KLLGFYFGGK.",
        "KLLGGFFGGGGK",
        "KLGGGGGGGFYK",
        "KLGGGGGGGFFK",
        "KGGFYGGGGggK",
        "KGGFYGGGGggK",
        ".KGGGGGGggK.",
        "..KKggggKK..",
        "....KKKK....",
        "............"
      ]
    }
  },

  init() {
    console.log("🎨 Generating 16-Bit Retro Pixel Art Sprite Sheets...");
    for (let [name, data] of Object.entries(this.spritesData)) {
      this.cache[name] = this.createCanvasSprite(data.grid, this.palettes[data.palette]);
    }
    console.log("✅ All Pixel Art Sprites compiled successfully!");
  },

  createCanvasSprite(grid, palette) {
    const rows = grid.length;
    const cols = grid[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const char = grid[r][c];
        const color = palette[char];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c, r, 1, 1);
        }
      }
    }
    return canvas;
  },

  get(name) {
    return this.cache[name] || null;
  },

  // Draw crisp pixel sprite with imageSmoothingEnabled = false
  drawSprite(ctx, name, x, y, width, height, flipX = false) {
    const sprite = this.get(name);
    if (!sprite) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false; // CRITICAL for authentic retro pixel art sharpness!
    ctx.translate(x, y);
    if (flipX) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
    ctx.restore();
  }
};

// Auto initialize when loaded
window.addEventListener('DOMContentLoaded', () => {
  if (window.SpriteManager) {
    window.SpriteManager.init();
  }
});
