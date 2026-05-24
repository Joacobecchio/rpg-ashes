import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";

export function getCoverScale(targetWidth, targetHeight, sourceWidth, sourceHeight) {
  return Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
}

export function getContainScale(
  targetWidth,
  targetHeight,
  sourceWidth,
  sourceHeight
) {
  return Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
}

export function ensureCircleTexture(scene, key, radius) {
  if (scene.textures.exists(key)) return;
  const size = radius * 2;
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(radius, radius, radius);
  gfx.generateTexture(key, size, size);
  gfx.destroy();
}

export function ensureWaveTexture(scene, key = "waves") {
  if (scene.textures.exists(key)) return;
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  gfx.clear();
  for (let y = 0; y < 128; y += 8) {
    const alpha = 0.08 + (y % 16 === 0 ? 0.04 : 0);
    gfx.lineStyle(2, 0xffffff, alpha);
    gfx.beginPath();
    gfx.moveTo(0, y + 4);
    gfx.lineTo(128, y);
    gfx.strokePath();
  }
  gfx.generateTexture(key, 128, 128);
  gfx.destroy();
}

export function createFogLayer(
  scene,
  width,
  height,
  { alpha = 0.04, speedX = 0.1, speedY = 0.05 } = {}
) {
  if (!scene.textures.exists("fog")) {
    const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
    for (let i = 0; i < 40; i += 1) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const r = 8 + Math.random() * 18;
      gfx.fillStyle(0xffffff, 0.08);
      gfx.fillCircle(x, y, r);
    }
    gfx.generateTexture("fog", 128, 128);
    gfx.destroy();
  }

  const fog = scene.add.tileSprite(width / 2, height / 2, width, height, "fog");
  fog.setAlpha(alpha);
  fog.setBlendMode(Phaser.BlendModes.SCREEN);
  scene.time.addEvent({
    delay: 50,
    loop: true,
    callback: () => {
      fog.tilePositionX += speedX;
      fog.tilePositionY += speedY;
    },
  });

  return fog;
}

export function getEmitter(manager) {
  if (!manager) return null;
  if (manager.emitters?.list) return manager.emitters.list[0];
  if (Array.isArray(manager.emitters)) return manager.emitters[0];
  if (manager.emitters) return manager.emitters;
  return null;
}
