import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { ASSETS, SCENES } from "../constants.js";
import { getLanguage } from "../i18n/i18n.js";
import { getUiKey } from "../i18n/i18n.js";
import {
  createFogLayer,
  ensureCircleTexture,
  ensureWaveTexture,
  getCoverScale,
  getEmitter,
} from "../utils/sceneVfx.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  create() {
    this.transitioning = false;
    const background = this.add.image(0, 0, ASSETS.MENU_BG);

    const logo = this.add.image(0, 0, ASSETS.MENU_LOGO);
    const logoGlow = this.add.image(0, 0, ASSETS.MENU_LOGO);
    logoGlow.setTint(0xffc073);
    logoGlow.setAlpha(0.18);
    logoGlow.setBlendMode(Phaser.BlendModes.ADD);

    const knight = this.add.image(
      0,
      0,
      ASSETS.MENU_KNIGHT
    );
    knight.setDepth(1);
    knight.setTint(0xe3d7c6);
    knight.setAlpha(0.95);

    const auraGlow = this.add.image(0, 0, ASSETS.MENU_KNIGHT);
    auraGlow.setTint(0xffd3a1);
    auraGlow.setAlpha(0.28);
    auraGlow.setBlendMode(Phaser.BlendModes.ADD);
    auraGlow.setDepth(0.95);

    ensureWaveTexture(this);
    const waves = this.add.tileSprite(0, 0, 1, 1, "waves");
    waves.setAlpha(0.16);
    waves.setBlendMode(Phaser.BlendModes.SCREEN);
    waves.setDepth(0.96);

    this.time.addEvent({
      delay: 40,
      loop: true,
      callback: () => {
        waves.tilePositionX += 0.9;
        waves.tilePositionY += 0.3;
      },
    });

    this.tweens.add({
      targets: waves,
      alpha: { from: 0.1, to: 0.22 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    ensureCircleTexture(this, "ember", 2);
    const embers = this.add.particles(0, 0, "ember", {
      x: { min: 0, max: 1 },
      y: 1,
      lifespan: { min: 2600, max: 4200 },
      speedY: { min: -20, max: -60 },
      speedX: { min: -10, max: 10 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.3, end: 0 },
      tint: [0xff9a3c, 0xffc46a, 0xffe4b5],
      quantity: 2,
      frequency: 120,
      blendMode: "ADD",
    });
    embers.setDepth(2);
    this.embers = embers;

    ensureCircleTexture(this, "ash", 2);
    const ash = this.add.particles(0, 0, "ash", {
      lifespan: { min: 800, max: 1400 },
      speedY: { min: -15, max: -40 },
      speedX: { min: -20, max: 20 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: [0xcaa777, 0x9f7a55, 0x6f4f35],
      blendMode: "ADD",
      quantity: 0,
    });
    ash.setDepth(3);
    this.ash = ash;

    ensureCircleTexture(this, "fire", 3);
    const logoFire = this.add.particles(
      logo.x,
      logo.y + logo.displayHeight * 0.2,
      "fire",
      {
        x: { min: -logo.displayWidth * 0.35, max: logo.displayWidth * 0.35 },
        y: { min: -logo.displayHeight * 0.15, max: logo.displayHeight * 0.1 },
        lifespan: { min: 700, max: 1200 },
        speedY: { min: -20, max: -60 },
        speedX: { min: -10, max: 10 },
        scale: { start: 0.9, end: 0 },
        alpha: { start: 0.7, end: 0 },
        tint: [0xff8a2b, 0xffb15a, 0xffdf9a],
        frequency: 80,
        blendMode: "ADD",
      }
    );
    logoFire.setDepth(3);

    const menuHoverFire = this.add.particles(0, 0, "fire", {
      lifespan: { min: 500, max: 900 },
      speedY: { min: -10, max: -40 },
      speedX: { min: -8, max: 8 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: [0xff8a2b, 0xffb15a, 0xffdf9a],
      quantity: 0,
      frequency: -1,
      blendMode: "ADD",
    });
    menuHoverFire.setDepth(3);

    const logoAsh = this.add.particles(
      logo.x,
      logo.y + logo.displayHeight * 0.25,
      "ash",
      {
        x: { min: -logo.displayWidth * 0.4, max: logo.displayWidth * 0.4 },
        y: { min: 0, max: logo.displayHeight * 0.2 },
        lifespan: { min: 1200, max: 2000 },
        speedY: { min: -10, max: -30 },
        speedX: { min: -15, max: 15 },
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.35, end: 0 },
        tint: [0xcaa777, 0x9f7a55, 0x6f4f35],
        frequency: 140,
        blendMode: "ADD",
      }
    );
    logoAsh.setDepth(2);

    const fog = createFogLayer(this, 1, 1, {
      alpha: 0.04,
      speedX: 0.1,
      speedY: 0.05,
    });
    fog.setDepth(1);

    const newGame = this.createImageButton(
      0,
      0,
      getUiKey(this, ASSETS.MENU_NEW),
      1,
      () => this.transitionToCharacterCreation()
    );
    const loadGame = this.createImageButton(
      0,
      0,
      getUiKey(this, ASSETS.MENU_LOAD),
      1,
      () => console.log("Load Game (stub)")
    );
    const settings = this.createImageButton(
      0,
      0,
      getUiKey(this, ASSETS.MENU_SETTINGS),
      1,
      () => this.scene.start(SCENES.SETTINGS)
    );
    const exit = this.createImageButton(
      0,
      0,
      getUiKey(this, ASSETS.MENU_EXIT),
      1,
      null
    );

    this.ui = {
      background,
      logo,
      logoGlow,
      knight,
      auraGlow,
      waves,
      embers,
      ash,
      logoFire,
      menuHoverFire,
      logoAsh,
      fog,
      buttons: [newGame, loadGame, settings, exit],
    };

    this.applyLayout();

    this.scale.on("resize", this.handleResize, this);
    this.events.once("shutdown", () => {
      this.scale.off("resize", this.handleResize, this);
    });
    this.events.on("wake", () => {
      this.transitioning = false;
      this.cameras.main.fadeIn(140, 0, 0, 0);
    });
  }

  handleResize() {
    if (!this.ui) return;
    if (this.scene.isActive()) {
      this.applyLayout();
    }
  }

  createImageButton(x, y, key, targetWidth, onClick) {
    const button = this.add.image(x, y, key);
    const glow = this.add.image(x, y, key);
    glow.setTint(0xffc073);
    glow.setAlpha(0);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    button.glow = glow;
    button.baseScale = 1;

    if (!onClick) {
      return button;
    }

    button.setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      this.tweens.add({
        targets: [button, glow],
        scale: button.baseScale * 1.03,
        duration: 120,
        ease: "Sine.Out",
      });
      button.setTint(0xffe0b2);
      glow.setAlpha(0.45);
      if (this.embers) {
        this.embers.emitParticleAt(x - button.displayWidth * 0.35, y, 5);
        this.embers.emitParticleAt(x + button.displayWidth * 0.35, y, 5);
      }
      if (this.ui?.menuHoverFire) {
        this.ui.menuHoverFire.emitParticleAt(
          button.x,
          button.y - button.displayHeight * 0.05,
          8
        );
      }
    });

    button.on("pointerout", () => {
      this.tweens.add({
        targets: [button, glow],
        scale: button.baseScale,
        duration: 120,
        ease: "Sine.Out",
      });
      button.clearTint();
      glow.setAlpha(0);
    });

    button.on("pointerdown", () => {
      this.tweens.add({
        targets: [button, glow],
        scale: button.baseScale * 0.98,
        duration: 80,
        yoyo: true,
        ease: "Sine.InOut",
      });
      if (this.embers) {
        this.embers.emitParticleAt(x, y, 14);
      }
      if (this.ash) {
        this.ash.emitParticleAt(x, y, 10);
      }
      onClick();
    });

    return button;
  }

  transitionToCharacterCreation() {
    if (this.transitioning) return;
    this.transitioning = true;
    this.cameras.main.flash(160, 255, 220, 180);
    this.cameras.main.fadeOut(260, 0, 0, 0);
    this.time.delayedCall(260, () => {
      try {
        this.scene.start(SCENES.CHARACTER_CREATION);
      } finally {
        this.transitioning = false;
      }
    });
  }

  applyLayout() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    const background = this.ui.background;
    const bgScale = getCoverScale(width, height, background.width, background.height);
    background.setPosition(centerX, centerY);
    background.setScale(bgScale);

    const logo = this.ui.logo;
    const logoGlow = this.ui.logoGlow;
    const logoTargetWidth = background.displayWidth * 0.45;
    const logoScale = logoTargetWidth / logo.width;
    logo.setScale(logoScale);
    const bgTop = background.y - background.displayHeight / 2;
    const desiredLogoY = background.y - background.displayHeight * 0.34;
    const minLogoY = bgTop + logo.displayHeight * 0.45;
    logo.setPosition(centerX, Math.max(desiredLogoY, minLogoY));
    logoGlow.setScale(logoScale * 1.02);
    logoGlow.setPosition(logo.x, logo.y);

    const knight = this.ui.knight;
    const knightScale = (background.displayHeight * 0.55) / knight.height;
    knight.setScale(knightScale);
    knight.setPosition(
      background.x - background.displayWidth * 0.22,
      background.y + background.displayHeight * 0.18
    );

    const auraGlow = this.ui.auraGlow;
    const auraScale = knightScale * 3.18;
    auraGlow.setScale(auraScale);
    auraGlow.setPosition(knight.x, knight.y);

    if (this.auraTween) {
      this.auraTween.stop();
    }
    this.auraTween = this.tweens.add({
      targets: auraGlow,
      alpha: { from: 0.2, to: 0.32 },
      scale: { from: auraScale * 0.98, to: auraScale * 1.05 },
      duration: 4200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    const waves = this.ui.waves;
    waves.setPosition(knight.x, knight.y);
    waves.setSize(knight.displayWidth, knight.displayHeight);
    waves.setMask(knight.createBitmapMask());

    if (this.ui.fog) {
      this.ui.fog.setPosition(centerX, centerY);
      this.ui.fog.setSize(width, height);
    }

    if (this.ui.logoFire) {
      this.ui.logoFire.setPosition(logo.x, logo.y + logo.displayHeight * 0.2);
      const emitter = getEmitter(this.ui.logoFire);
      if (emitter) {
        emitter.setEmitZone({
          type: "edge",
          source: new Phaser.Geom.Rectangle(
            -logo.displayWidth * 0.5,
            -logo.displayHeight * 0.2,
            logo.displayWidth,
            logo.displayHeight * 0.35
          ),
          quantity: 50,
        });
      }
    }
    if (this.ui.logoAsh) {
      this.ui.logoAsh.setPosition(logo.x, logo.y + logo.displayHeight * 0.25);
      const emitter = getEmitter(this.ui.logoAsh);
      if (emitter) {
        emitter.setEmitZone({
          type: "edge",
          source: new Phaser.Geom.Rectangle(
            -logo.displayWidth * 0.5,
            0,
            logo.displayWidth,
            logo.displayHeight * 0.35
          ),
          quantity: 60,
        });
      }
    }

    if (this.ui.embers) {
      const emitter = getEmitter(this.ui.embers);
      if (emitter) {
        emitter.setPosition(width / 2, height + 20);
        emitter.setEmitZone({
          type: "edge",
          source: new Phaser.Geom.Rectangle(0, height + 20, width, 1),
          quantity: 50,
        });
      }
    }

    const buttonX = background.x + background.displayWidth * 0.31;
    const topY = background.y - background.displayHeight * 0.125;
    const targetWidth = background.displayWidth * 0.23;

    const newGame = this.ui.buttons[0];
    const newScale = targetWidth / newGame.width;
    newGame.baseScale = newScale;
    newGame.setScale(newScale);
    newGame.setPosition(buttonX, topY);
    if (newGame.glow) {
      newGame.glow.setScale(newScale * 1.03);
      newGame.glow.setPosition(buttonX, topY);
    }

    const buttonHeight = newGame.displayHeight;
    const spacing = buttonHeight * 0.1;
    const lang = getLanguage(this);
    const buttonOffsetsByLang = {
      en: [0, 0, 0],
      es: [-24, -66, -104],
    };
    const buttonOffsets = buttonOffsetsByLang[lang] || [0, 0, 0];
    this.ui.buttons.slice(1).forEach((btn, idx) => {
      const offsetPixels = buttonOffsets[idx] ?? 0;
      const sizePercent =
        lang === "es" ? [0.97, 0.97, 0.9][idx] ?? 1 : 1;
      const y = topY + (buttonHeight + spacing) * (idx + 1) + offsetPixels;
      const scale = targetWidth / btn.width;
      btn.baseScale = scale;
      btn.setScale(scale * sizePercent);
      btn.setPosition(buttonX, y);
      if (btn.glow) {
        btn.glow.setScale(scale * 1.03);
        btn.glow.setPosition(buttonX, y);
      }
    });
  }

  
}
