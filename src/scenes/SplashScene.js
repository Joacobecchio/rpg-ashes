import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { ASSETS, SCENES } from "../constants.js";
import { t } from "../i18n/i18n.js";
import {
  createFogLayer,
  ensureCircleTexture,
  ensureWaveTexture,
  getCoverScale,
  getEmitter,
} from "../utils/sceneVfx.js";

export default class SplashScene extends Phaser.Scene {
  constructor() {
    super(SCENES.SPLASH);
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    const background = this.add.image(centerX, centerY, ASSETS.MENU_BG);
    const scale = getCoverScale(width, height, background.width, background.height);
    background.setScale(scale);

    const logo = this.add.image(centerX, centerY, ASSETS.MENU_LOGO);
    const logoTargetWidth = width * 0.6;
    const logoScale = logoTargetWidth / logo.width;
    logo.setScale(logoScale);
    logo.setY(height * 0.35);

    const logoGlow = this.add.image(logo.x, logo.y, ASSETS.MENU_LOGO);
    logoGlow.setScale(logoScale * 1.02);
    logoGlow.setTint(0xffc073);
    logoGlow.setAlpha(0.22);
    logoGlow.setBlendMode(Phaser.BlendModes.ADD);

    ensureWaveTexture(this);
    const logoWaves = this.add.tileSprite(
      logo.x,
      logo.y,
      logo.displayWidth,
      logo.displayHeight,
      "waves"
    );
    logoWaves.setAlpha(0.18);
    logoWaves.setBlendMode(Phaser.BlendModes.SCREEN);
    logoWaves.setMask(logo.createBitmapMask());

    this.time.addEvent({
      delay: 40,
      loop: true,
      callback: () => {
        logoWaves.tilePositionX += 0.8;
        logoWaves.tilePositionY += 0.25;
      },
    });

    this.tweens.add({
      targets: logoGlow,
      alpha: { from: 0.16, to: 0.3 },
      scale: { from: logoScale * 1.01, to: logoScale * 1.05 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    ensureCircleTexture(this, "fire", 3);
    const logoFire = this.add.particles(logo.x, logo.y + logo.displayHeight * 0.2, "fire", {
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
    });
    logoFire.setDepth(2);

    ensureCircleTexture(this, "ember", 2);
    const embers = this.add.particles(0, 0, "ember", {
      x: { min: 0, max: width },
      y: height + 20,
      lifespan: { min: 2600, max: 4200 },
      speedY: { min: -20, max: -60 },
      speedX: { min: -10, max: 10 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.35, end: 0 },
      tint: [0xff9a3c, 0xffc46a, 0xffe4b5],
      quantity: 2,
      frequency: 120,
      blendMode: "ADD",
    });
    embers.setDepth(1);

    ensureCircleTexture(this, "ash", 2);
    const ash = this.add.particles(0, 0, "ash", {
      lifespan: { min: 1200, max: 2000 },
      speedY: { min: -10, max: -30 },
      speedX: { min: -15, max: 15 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.35, end: 0 },
      tint: [0xcaa777, 0x9f7a55, 0x6f4f35],
      blendMode: "ADD",
      frequency: 180,
    });
    ash.setDepth(1);

    const fog = createFogLayer(this, width, height, {
      alpha: 0.06,
      speedX: 0.08,
      speedY: 0.04,
    });
    fog.setDepth(0.5);

    const pressContainer = this.add.container(centerX, height * 0.82);
    const pressBox = this.add.rectangle(0, 0, 260, 46, 0x140d08, 0.65);
    pressBox.setStrokeStyle(2, 0x8a5a2b, 0.9);
    const pressText = this.add
      .text(0, 0, t(this, "splash.pressStart"), {
        fontFamily: "Dalelands",
        fontSize: "26px",
        color: "#f0d9b5",
      })
      .setOrigin(0.5);
    pressContainer.add([pressBox, pressText]);

    this.tweens.add({
      targets: pressContainer,
      alpha: { from: 0.5, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    const goToMenu = () => {
      if (this.transitioning) return;
      this.transitioning = true;
      this.cameras.main.flash(160, 255, 220, 180);
      this.cameras.main.fadeOut(260, 0, 0, 0);
      this.time.delayedCall(260, () => {
        this.scene.start(SCENES.MENU);
      });
    };

    this.input.once("pointerdown", goToMenu);
    this.input.keyboard.once("keydown", goToMenu);

    this.ui = {
      background,
      logo,
      logoGlow,
      logoWaves,
      logoFire,
      embers,
      ash,
      fog,
      pressContainer,
      pressBox,
      pressText,
    };

    this.applyLayout();

    this.scale.on("resize", this.handleResize, this);
    this.events.once("shutdown", () => {
      this.scale.off("resize", this.handleResize, this);
    });
  }

  handleResize() {
    if (!this.ui) return;
    if (this.scene.isActive()) {
      this.applyLayout();
    }
  }

  applyLayout() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    const background = this.ui.background;
    const scale = getCoverScale(width, height, background.width, background.height);
    background.setScale(scale);
    background.setPosition(centerX, centerY);

    const logo = this.ui.logo;
    const logoGlow = this.ui.logoGlow;
    const logoWaves = this.ui.logoWaves;
    const logoTargetWidth = width * 0.6;
    const logoScale = logoTargetWidth / logo.width;
    logo.setScale(logoScale);
    logo.setPosition(centerX, height * 0.35);
    logoGlow.setScale(logoScale * 1.02);
    logoGlow.setPosition(logo.x, logo.y);

    if (logoWaves) {
      logoWaves.setPosition(logo.x, logo.y);
      logoWaves.setSize(logo.displayWidth, logo.displayHeight);
      logoWaves.setMask(logo.createBitmapMask());
    }

    if (this.ui.logoFire) {
      this.ui.logoFire.setPosition(logo.x, logo.y + logo.displayHeight * 0.2);
      const emitter = getEmitter(this.ui.logoFire);
      if (emitter) {
        emitter.setEmitZone({
          type: "edge",
          source: new Phaser.Geom.Rectangle(
            -logo.displayWidth * 0.35,
            -logo.displayHeight * 0.15,
            logo.displayWidth * 0.7,
            logo.displayHeight * 0.25
          ),
          quantity: 30,
        });
      }
    }

    if (this.ui.ash) {
      const emitter = getEmitter(this.ui.ash);
      if (emitter) {
        emitter.setEmitZone({
          type: "edge",
          source: new Phaser.Geom.Rectangle(0, height * 0.6, width, height * 0.4),
          quantity: 40,
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

    if (this.ui.fog) {
      this.ui.fog.setPosition(centerX, centerY);
      this.ui.fog.setSize(width, height);
    }

    if (this.ui.pressContainer) {
      this.ui.pressContainer.setPosition(centerX, height * 0.82);
    }
  }

  
}
