import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { SCENES } from "../constants.js";
import { getLanguage, setLanguage, t } from "../i18n/i18n.js";

const RESOLUTIONS = [
  { label: "800x600", width: 800, height: 600 },
  { label: "1280x720", width: 1280, height: 720 },
  { label: "1600x900", width: 1600, height: 900 },
  { label: "1920x1080", width: 1920, height: 1080 },
  { label: "2560x1440", width: 2560, height: 1440 },
];
const LANGUAGE_OPTIONS = [
  { id: "en", labelKey: "lang.english" },
  { id: "es", labelKey: "lang.spanish" },
];

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super(SCENES.SETTINGS);
  }

  create() {
    this.ui = {};
    this.scale.on("resize", this.layout, this);
    this.events.once("shutdown", () => {
      this.scale.off("resize", this.layout, this);
    });

    this.ui.title = this.add
      .text(0, 0, t(this, "settings.title"), {
        fontFamily: "Dalelands",
        fontSize: "36px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.ui.subtitle = this.add
      .text(0, 0, t(this, "settings.resolution"), {
        fontFamily: "Dalelands",
        fontSize: "22px",
        color: "#e0d6c3",
      })
      .setOrigin(0.5);

    this.ui.buttons = RESOLUTIONS.map((res) =>
      this.createResolutionButton(0, 0, res)
    );

    this.ui.languageLabel = this.add
      .text(0, 0, t(this, "settings.language"), {
        fontFamily: "Dalelands",
        fontSize: "22px",
        color: "#e0d6c3",
      })
      .setOrigin(0.5);

    this.ui.languageButtons = LANGUAGE_OPTIONS.map((lang) =>
      this.createLanguageButton(0, 0, lang)
    );

    this.ui.back = this.add
      .text(0, 0, t(this, "settings.back"), {
        fontFamily: "Dalelands",
        fontSize: "22px",
        color: "#f0d9b5",
        backgroundColor: "#2b2b2b",
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.ui.back.on("pointerover", () => this.ui.back.setColor("#ffffff"));
    this.ui.back.on("pointerout", () => this.ui.back.setColor("#f0d9b5"));
    this.ui.back.on("pointerdown", () => this.scene.start(SCENES.MENU));

    this.layout();

    if (this.registry.get("lastResolutionLabel")) {
      this.showToast(
        t(this, "settings.toast.resolutionApplied", {
          value: this.registry.get("lastResolutionLabel"),
        })
      );
      this.registry.set("lastResolutionLabel", null);
    }
  }

  createResolutionButton(x, y, res) {
    const button = this.add
      .text(x, y, res.label, {
        fontFamily: "Dalelands",
        fontSize: "20px",
        color: "#dddddd",
        backgroundColor: "#1e1e1e",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.resolution = res;
    button.on("pointerover", () => button.setColor("#ffffff"));
    button.on("pointerout", () => button.setColor("#dddddd"));
    button.on("pointerdown", () => {
      this.applyResolution(res);
    });

    return button;
  }

  createLanguageButton(x, y, lang) {
    const button = this.add
      .text(x, y, t(this, lang.labelKey), {
        fontFamily: "Dalelands",
        fontSize: "20px",
        color: "#dddddd",
        backgroundColor: "#1e1e1e",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.langId = lang.id;
    button.on("pointerover", () => button.setColor("#ffffff"));
    button.on("pointerout", () => button.setColor("#dddddd"));
    button.on("pointerdown", () => {
      const current = getLanguage(this);
      if (current !== lang.id) {
        setLanguage(this, lang.id);
        this.scene.restart();
      }
    });

    return button;
  }

  applyResolution(res) {
    this.registry.set("lastResolutionLabel", res.label);
    this.scale.setGameSize(res.width, res.height);
    this.scale.resize(res.width, res.height);
    if (this.scale.parent) {
      this.scale.parent.style.width = `${res.width}px`;
      this.scale.parent.style.height = `${res.height}px`;
    }
    if (this.scale.canvas) {
      this.scale.canvas.style.width = `${res.width}px`;
      this.scale.canvas.style.height = `${res.height}px`;
    }
    this.layout();
    this.showToast(
      t(this, "settings.toast.resolutionApplied", { value: res.label })
    );
  }

  layout() {
    if (!this.cameras?.main) return;
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const startY = 210;
    const gap = 48;

    this.ui.title.setPosition(centerX, 80);
    this.ui.subtitle.setPosition(centerX, 140);

    this.ui.buttons.forEach((btn, idx) => {
      btn.setPosition(centerX, startY + gap * idx);
    });

    const languageStartY = startY + gap * RESOLUTIONS.length + 40;
    this.ui.languageLabel.setPosition(centerX, languageStartY);
    this.ui.languageButtons.forEach((btn, idx) => {
      btn.setPosition(centerX, languageStartY + 40 + idx * 44);
    });

    this.ui.back.setPosition(centerX, height - 80);
  }

  showToast(message) {
    const { width, height } = this.cameras.main;
    const box = this.add.rectangle(width / 2, height * 0.9, 520, 42, 0x000000, 0.6);
    const text = this.add
      .text(width / 2, height * 0.9, message, {
        fontFamily: "Dalelands",
        fontSize: "18px",
        color: "#e9dcc9",
      })
      .setOrigin(0.5);

    const container = this.add.container(0, 0, [box, text]);
    container.alpha = 0;

    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 140,
      yoyo: true,
      hold: 900,
      ease: "Sine.easeOut",
      onComplete: () => container.destroy(),
    });
  }
}
