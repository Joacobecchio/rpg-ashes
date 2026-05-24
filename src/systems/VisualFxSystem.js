import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { ensureCircleTexture } from "../utils/sceneVfx.js";

const PRESETS = {
  warAsh: {
    grading: {
      color: 0x151318,
      alpha: 0.15,
      blendMode: Phaser.BlendModes.MULTIPLY,
      depth: 980,
    },
    fog: {
      key: "fx_fog",
      alpha: 0.22,
      speedX: 0.012,
      speedY: 0.006,
      tint: 0xc7c7c7,
      blendMode: Phaser.BlendModes.SCREEN,
      depth: 990,
    },
    ash: {
      key: "fx_ash",
      alpha: 0.16,
      tint: [0x9c9c9c, 0x7a7a7a, 0x5f5f5f],
      depth: 995,
      config: {
        lifespan: { min: 5500, max: 9500 },
        speedY: { min: -10, max: -42 },
        speedX: { min: -18, max: 18 },
        scale: { start: 0.6, end: 0.15 },
        alpha: { start: 0.12, end: 0 },
        rotate: { min: 0, max: 360 },
        frequency: 28,
        blendMode: "NORMAL",
      },
    },
    lights: {
      key: "fx_light_soft",
      alpha: 0.18,
      blendMode: Phaser.BlendModes.ADD,
      depth: 1005,
      flicker: {
        from: 0.12,
        to: 0.22,
        duration: 520,
      },
      positions: [
        { xPct: 0.32, yPct: 0.56, scale: 1.2 },
      ],
    },
  },
};

const DEFAULT_OPTIONS = {
  preset: "warAsh",
};

function ensureFogTexture(scene, key) {
  if (scene.textures.exists(key)) return;
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  for (let i = 0; i < 48; i += 1) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const r = 10 + Math.random() * 20;
    gfx.fillStyle(0xffffff, 0.08);
    gfx.fillCircle(x, y, r);
  }
  gfx.generateTexture(key, 128, 128);
  gfx.destroy();
}

function ensureSoftLightTexture(scene, key, radius = 96) {
  if (scene.textures.exists(key)) return;
  const size = radius * 2;
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  for (let i = radius; i > 0; i -= 6) {
    const alpha = Math.max(0.02, (i / radius) ** 2 * 0.2);
    gfx.fillStyle(0xffffff, alpha);
    gfx.fillCircle(radius, radius, i);
  }
  gfx.generateTexture(key, size, size);
  gfx.destroy();
}

export default class VisualFxSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.preset = PRESETS[this.options.preset] ?? PRESETS.warAsh;
    this.elements = {
      grading: null,
      fog: null,
      ash: null,
      lightSprites: [],
      lightTweens: [],
    };
    this.onResize = this.onResize.bind(this);
  }

  create() {
    this.ensureTextures();
    this.createLayers();
    this.scene.scale.on("resize", this.onResize);
    this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  ensureTextures() {
    ensureFogTexture(this.scene, this.preset.fog.key);
    ensureCircleTexture(this.scene, this.preset.ash.key, 2);
    ensureSoftLightTexture(this.scene, this.preset.lights.key, 96);
  }

  createLayers() {
    const { width, height } = this.scene.scale;

    const grading = this.scene.add
      .rectangle(width / 2, height / 2, width, height, this.preset.grading.color, this.preset.grading.alpha)
      .setScrollFactor(0)
      .setBlendMode(this.preset.grading.blendMode)
      .setDepth(this.preset.grading.depth);

    const fog = this.scene.add
      .tileSprite(width / 2, height / 2, width, height, this.preset.fog.key)
      .setAlpha(this.preset.fog.alpha)
      .setTint(this.preset.fog.tint)
      .setBlendMode(this.preset.fog.blendMode)
      .setScrollFactor(0)
      .setDepth(this.preset.fog.depth);

    const ash = this.scene.add.particles(0, 0, this.preset.ash.key, {
      x: { min: 0, max: width },
      y: height + 20,
      ...this.preset.ash.config,
      tint: this.preset.ash.tint,
    });
    ash.setScrollFactor(0).setDepth(this.preset.ash.depth);

    this.elements.grading = grading;
    this.elements.fog = fog;
    this.elements.ash = ash;
    this.createLights(width, height);
  }

  createLights(width, height) {
    const { lights } = this.preset;
    this.elements.lightSprites = lights.positions.map((pos) => {
      return this.scene.add
        .image(width * pos.xPct, height * pos.yPct, lights.key)
        .setAlpha(lights.alpha)
        .setScale(pos.scale)
        .setBlendMode(lights.blendMode)
        .setScrollFactor(0)
        .setDepth(lights.depth);
    });

    this.elements.lightTweens = this.elements.lightSprites.map((sprite) => {
      return this.scene.tweens.add({
        targets: sprite,
        alpha: { from: lights.flicker.from, to: lights.flicker.to },
        duration: lights.flicker.duration,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  onResize(gameSize) {
    const width = gameSize?.width ?? this.scene.scale.width;
    const height = gameSize?.height ?? this.scene.scale.height;

    if (this.elements.grading) {
      this.elements.grading.setPosition(width / 2, height / 2);
      this.elements.grading.setSize(width, height);
    }
    if (this.elements.fog) {
      this.elements.fog.setPosition(width / 2, height / 2);
      this.elements.fog.setSize(width, height);
    }
    const emitter = this.elements.ash?.emitters?.first;
    if (emitter) {
      emitter.setPosition(0, height + 20);
      emitter.setEmitZone({
        type: "random",
        source: new Phaser.Geom.Rectangle(0, height + 20, width, 1),
      });
    }
    this.elements.lightSprites.forEach((sprite, index) => {
      const pos = this.preset.lights.positions[index];
      if (!pos) return;
      sprite.setPosition(width * pos.xPct, height * pos.yPct);
    });
  }

  update(_time, delta) {
    if (!this.elements.fog) return;
    this.elements.fog.tilePositionX += this.preset.fog.speedX * delta;
    this.elements.fog.tilePositionY += this.preset.fog.speedY * delta;
  }

  destroy() {
    this.scene.scale.off("resize", this.onResize);
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.elements.lightTweens.forEach((tween) => tween?.stop());
    this.elements.lightSprites.forEach((sprite) => sprite?.destroy());
    this.elements.ash?.destroy();
    this.elements.fog?.destroy();
    this.elements.grading?.destroy();
  }
}
