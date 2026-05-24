import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import CharacterBuilder from "../systems/CharacterBuilder.js";
import { ASSETS, SCENES } from "../constants.js";
import { getLanguage, getUiKey, t } from "../i18n/i18n.js";
import { CLASSES } from "../systems/ClassSystem.js";
import { FACTIONS } from "../systems/FactionSystem.js";
import { RACES } from "../systems/RaceSystem.js";

export default class CharacterCreationScene extends Phaser.Scene {
  constructor() {
    super(SCENES.CHARACTER_CREATION);
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    [ASSETS.CHARACTER_CREATION_BG].forEach((key) => {
      if (!this.textures.exists(key)) {
        console.error(`Missing texture key: ${key}`);
      }
    });
    this.ensureProceduralTextures();
    this.cameras.main.roundPixels = true;
    this.layoutBase = {
      width: 1280,
      height: 720,
      titleY: 40,
      selectorX: { label: 120, left: 260, value: 320, right: 420 },
      selectorY: { race: 120, class: 190, faction: 260, gender: 330, head: 400 },
      nameY: 470,
      nameX: { label: 120, input: 280 },
      nameBox: { x: 300, y: 470, width: 220, height: 32 },
      statsX: 500,
      statsY: 120,
      prosY: 320,
      consY: 400,
      previewFrame: {
        x: 982,
        y: 318,
        width: 360,
        height: 440,
        scale: 1.39425,
        scaleY: 1.267875,
      },
      previewImage: { x: 964, y: 354, height: 400 },
      previewArrows: { leftX: 830, rightX: 1100, y: 340, scale: 0.12 },
      backButton: { x: 30, y: 30 },
      startButton: { x: 1056, y: 651, width: 264 },
      leftBox: {
        x: 116,
        y: 300,
        width: 520,
        height: 360,
        scale: 1.19,
        scaleX: 1.15,
        scaleY: 1.21,
      },
      leftBoxLayout: {
        paddingX: 110,
        paddingTop: 120,
        rowGap: 48,
        arrowLeftOffset: 210,
        valueOffset: 270,
        arrowRightOffset: 390,
        valueScale: 0.7,
        valueYOffset: 72,
        nameRowOffset: 44,
        nameInputOffsetX: 220,
        nameBoxWidth: 280,
        nameBoxHeight: 30,
      },
      rightBox: { x: 256, y: 574, width: 460, height: 220, scale: 0.7586 },
      bonusBox: { x: 555, y: 588, width: 260, height: 180, scale: 1.1614162219 },
      rightBoxLayout: { paddingX: 70, paddingTop: 110, rowGap: 24 },
    };
    this.characterBuilder = new CharacterBuilder(this, "characters");

    this.bg = this.add
      .image(0, 0, ASSETS.CHARACTER_CREATION_BG)
      .setOrigin(0.5, 0.5)
      .setTint(0x1a1a1a)
      .setScrollFactor(0)
      .setDepth(-30);
    this.bgDark = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-28);
    this.bgLight = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.SCREEN)
      .setDepth(-25);
    this.fog1 = this.add
      .image(0, 0, "cc_fog_gen")
      .setOrigin(0.5)
      .setAlpha(0.5)
      .setTint(0xc0c0c0)
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.SCREEN)
      .setDepth(-40);
    this.fog2 = this.add
      .image(0, 0, "cc_fog_gen")
      .setOrigin(0.5)
      .setAlpha(0.4)
      .setTint(0xa8a8a8)
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.SCREEN)
      .setDepth(-40);
    this.tweens.add({
      targets: this.fog1,
      x: { from: 0, to: 40 },
      y: { from: 0, to: 20 },
      duration: 7000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
    this.tweens.add({
      targets: this.fog2,
      x: { from: 0, to: -30 },
      y: { from: 0, to: 25 },
      duration: 9500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
    this.ashes = this.add
      .particles(0, 0, "cc_ash_gen", {
        x: { min: 0, max: this.scale.width },
        y: { min: -20, max: this.scale.height + 20 },
        quantity: 6,
        frequency: 40,
        lifespan: { min: 5000, max: 10000 },
        speedY: { min: -8, max: -28 },
        speedX: { min: -14, max: 14 },
        scale: { min: 0.05, max: 0.12 },
        alpha: { start: 0.0, end: 0.5 },
        rotate: { min: 0, max: 360 },
        blendMode: "SCREEN",
        tint: [0xe0e0e0, 0xb8b8b8],
      })
      .setScrollFactor(0)
      .setDepth(-10);
    this.ashEmitter = this.ashes.emitters?.list?.[0] ?? null;

    const lang = getLanguage(this);
    this.titleImage = this.add
      .image(centerX, 40, `${ASSETS.CHARACTER_CREATION_TITLE}_${lang}`)
      .setOrigin(0.5);
    this.leftBox = this.add.image(
      this.layoutBase.leftBox.x,
      this.layoutBase.leftBox.y,
      `${ASSETS.CHARACTER_CREATION_BOX_LEFT}_${lang}`
    );
    this.leftBox.setOrigin(0.5);
    this.rightBox = this.add.image(
      this.layoutBase.rightBox.x,
      this.layoutBase.rightBox.y,
      `${ASSETS.CHARACTER_CREATION_BOX_RIGHT}_${lang}`
    );
    this.rightBox.setOrigin(0.5);
    this.bonusBox = this.add.image(
      this.layoutBase.bonusBox.x,
      this.layoutBase.bonusBox.y,
      `${ASSETS.CHARACTER_CREATION_BOX_BONUS}_${lang}`
    );
    this.bonusBox.setOrigin(0.5);

    this.raceIds = Object.keys(RACES);
    this.classIds = Object.keys(CLASSES);
    this.factionIds = Object.keys(FACTIONS);

    this.genderIds = ["male", "female"];
    this.genderIndex = 0;
    this.genderLabels = {
      male: "characterCreation.gender.male",
      female: "characterCreation.gender.female",
    };
    this.headVariantIndex = 0;
    this.headVariantLabels = {
      "head-1": "characterCreation.headVariant.head-1",
      "head-2": "characterCreation.headVariant.head-2",
    };

    this.raceIndex = this.getRandomIndex(this.raceIds);
    this.classIndex = this.getRandomIndex(this.classIds);
    this.factionIndex = this.getRandomIndex(this.factionIds);
    this.genderIndex = this.getRandomIndex(this.genderIds);
    this.headVariantIndex = this.getRandomIndex(this.getHeadVariantIds());

    this.headVariants = {
      human: {
        male: ["head-1", "head-2"],
        female: ["head-1", "head-2"],
      },
      elf: {
        male: ["head-1", "head-2"],
        female: ["head-1", "head-2"],
      },
    };

    this.selectors = [
      this.createSelector(
        "race",
        t(this, "characterCreation.label.race"),
        120,
        () => this.raceIds,
        (id) => t(this, RACES[id]?.nameKey || id),
        (index) => {
      this.raceIndex = index;
      this.updatePreview();
        }
      ),
      this.createSelector(
        "class",
        t(this, "characterCreation.label.class"),
        190,
        () => this.classIds,
        (id) => t(this, CLASSES[id]?.nameKey || id),
        (index) => {
      this.classIndex = index;
      this.updatePreview();
        }
      ),
      this.createSelector(
        "faction",
        t(this, "characterCreation.label.faction"),
        260,
        () => this.factionIds,
        (id) => t(this, FACTIONS[id]?.nameKey || id),
        (index) => {
      this.factionIndex = index;
      this.updatePreview();
        }
      ),
      this.createSelector(
        "gender",
        t(this, "characterCreation.label.gender"),
        330,
        () => this.genderIds,
        (id) => t(this, this.genderLabels[id] || id),
        (index) => {
          this.genderIndex = index;
          this.updatePreview();
        }
      ),
      this.createSelector(
        "head",
        t(this, "characterCreation.label.head"),
        400,
        () => this.getHeadVariantIds(),
        (id) => t(this, this.headVariantLabels[id] || id),
        (index) => {
          this.headVariantIndex = index;
          this.updateAppearancePreview();
        }
      ),
    ];
    this.valueOffsetsByKey = {
      race: 12,
      class: -5,
      faction: -20,
      gender: -39,
      head: -58,
    };
    this.valueScalesByKey = {
      race: 1,
      class: 1,
      faction: 1,
      gender: 1,
      head: 1,
    };

    this.nameLabel = this.add
      .text(120, 470, t(this, "characterCreation.label.name"), {
        fontFamily: "Dalelands",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);
    this.nameLabel.setVisible(false);

    this.nameInputBox = this.add
      .rectangle(
        this.layoutBase.nameBox.x,
        this.layoutBase.nameBox.y,
        this.layoutBase.nameBox.width,
        this.layoutBase.nameBox.height,
        0x0f0f0f,
        0.0
      )
      .setStrokeStyle(0, 0x000000, 0);
    this.nameInputBox.setVisible(false);

    this.nameInputReal = document.createElement("input");
    this.nameInputReal.type = "text";
    const defaultNames = this.cache.json.get("default_names");
    this.nameInputReal.value = (Array.isArray(defaultNames) && defaultNames.length > 0
      ? Phaser.Utils.Array.GetRandom(defaultNames)
      : t(this, "characterCreation.defaultName")
    ).toUpperCase();
    this.nameInputReal.style.position = "absolute";
    this.nameInputReal.style.fontFamily = "Dalelands, serif";
    this.nameInputReal.style.fontSize = "16px";
    this.nameInputReal.style.backgroundColor = "transparent";
    this.nameInputReal.style.border = "none";
    this.nameInputReal.style.outline = "none";
    this.nameInputReal.style.color = "#000000";
    this.nameInputReal.style.cursor = "text";
    this.nameInputReal.style.pointerEvents = "auto";
    this.nameInputReal.style.zIndex = "10000";
    this.nameInputReal.style.width = "200px";
    this.nameInputReal.style.padding = "0";
    this.nameInputReal.style.margin = "0";
    this.nameInputReal.style.boxSizing = "border-box";
    this.nameInputReal.setAttribute("tabindex", "0");
    this.nameInputReal.autocomplete = "off";
    this.nameInputReal.spellcheck = false;
    document.body.appendChild(this.nameInputReal);
    this.nameRules = { min: 2, max: 16 };
    this.nameInputReal.maxLength = this.nameRules.max;
    this.nameInputReal.minLength = this.nameRules.min;
    this.nameErrorText = this.add.text(0, 0, "", {
      fontFamily: "Dalelands",
      fontSize: "17px",
      color: "#ff3b3b",
      fontStyle: "bold",
    });
    this.nameMeasureText = this.add.text(0, 0, "", {
      fontFamily: "Dalelands",
      fontSize: "16px",
      color: "#000000",
    });
    this.nameMeasureText.setVisible(false);
    this.nameErrorBlink = this.tweens.add({
      targets: this.nameErrorText,
      alpha: { from: 1, to: 0.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      paused: true,
    });
    this.nameErrorText.setVisible(false).setDepth(10);
    this.nameInputReal.addEventListener("input", () => {
      const cursorPos = this.nameInputReal.selectionStart;
      this.nameInputReal.value = this.nameInputReal.value.toUpperCase();
      this.nameInputReal.setSelectionRange(cursorPos, cursorPos);
      this.handleNameInput();
    });
    this.nameInputReal.addEventListener("blur", () => this.handleNameInput());
    this.handleNameInput();
    this.nameInputRealOutsideHandler = (event) => {
      if (!this.nameInputReal) return;
      if (event.target !== this.nameInputReal) {
        this.nameInputReal.blur();
      }
    };
    document.addEventListener("mousedown", this.nameInputRealOutsideHandler);
    

    this.statKeys = ["hp", "mp", "str", "dex", "int", "vit"];
    this.statValueOffsets = {
      hp: -8,
      mp: -8,
      str: -8,
      dex: -10,
      int: -12,
      vit: -12,
    };
    this.statColors = {
      hp: 0xff3b3b,
      mp: 0x3b7bff,
      str: 0xff9b2f,
      dex: 0x4cd964,
      int: 0xb16bff,
      vit: 0xffd15a,
    };
    this.statValueTexts = this.statKeys.map(() =>
      this.add
        .text(500, 120, "", {
          fontFamily: "Dalelands",
      fontSize: "16px",
      color: "#ffffff",
        })
        .setDepth(2)
    );
    this.statBars = this.statKeys.map(() => this.add.graphics().setDepth(2));
    this.statBarLayout = {
      offsetX: 64,
      width: 120,
      height: 10,
      gap: 2,
      blocks: 10,
      barYOffset: 5,
      labelOffsetLeft: 30,
      labelZoneWidth: 70,
      labelZoneHeight: 24,
    };
    this.computeStatBounds();
    this.createStatTooltip();
    this.statLabelZones = this.statKeys.map(() => {
      const z = this.add.zone(0, 0, 70, 24).setDepth(2);
      z.setInteractive({ useHandCursor: false });
      return z;
    });
    this.statKeys.forEach((key, index) => {
      const zone = this.statLabelZones[index];
      if (!zone) return;
      zone.on("pointerover", () => this.showStatTooltip(key, zone));
      zone.on("pointerout", () => this.hideStatTooltip());
    });

    this.prosText = this.add.text(500, 320, "", {
      fontFamily: "Dalelands",
      fontSize: "14px",
      color: "#b2ffb2",
    });

    this.consText = this.add.text(500, 400, "", {
      fontFamily: "Dalelands",
      fontSize: "14px",
      color: "#ffb2b2",
    });

    this.viewOptions = [
      { id: "front", labelKey: "characterCreation.view.front" },
      { id: "profileLeft", labelKey: "characterCreation.view.profileLeft" },
      { id: "back", labelKey: "characterCreation.view.back" },
      { id: "profileRight", labelKey: "characterCreation.view.profileRight" },
    ];
    this.viewIndex = 0;

    this.baseAppearance = {
      human: {
        male: {
          front: ASSETS.HUMAN_BASE_FRONT,
          profileLeft: ASSETS.HUMAN_BASE_PROFILE_LEFT,
          profileRight: ASSETS.HUMAN_BASE_PROFILE_RIGHT,
          back: ASSETS.HUMAN_BASE_BACK,
        },
        female: {
          front: ASSETS.HUMAN_FEMALE_BASE_FRONT,
          profileLeft: ASSETS.HUMAN_FEMALE_BASE_PROFILE_LEFT,
          profileRight: ASSETS.HUMAN_FEMALE_BASE_PROFILE_RIGHT,
          back: ASSETS.HUMAN_FEMALE_BASE_BACK,
        },
      },
      elf: {
        male: {
          front: ASSETS.ELF_BASE_FRONT,
          profileLeft: ASSETS.ELF_BASE_PROFILE_LEFT,
          profileRight: ASSETS.ELF_BASE_PROFILE_RIGHT,
          back: ASSETS.ELF_BASE_BACK,
        },
        female: {
          front: ASSETS.ELF_FEMALE_BASE_FRONT,
          profileLeft: ASSETS.ELF_FEMALE_BASE_PROFILE_LEFT,
          profileRight: ASSETS.ELF_FEMALE_BASE_PROFILE_RIGHT,
          back: ASSETS.ELF_FEMALE_BASE_BACK,
        },
      },
    };
    this.headOffsets = {
      default: {
        front: { x: 0, y: -377 },
        profileLeft: { x: -6, y: -388 },
        profileRight: { x: 6, y: -388 },
        back: { x: 0, y: -396 },
      },
      "head-1": {
        front: { x: 0, y: -396 },
        profileLeft: { x: -14, y: -407 },
        profileRight: { x: 14, y: -407 },
        back: { x: 0, y: -416 },
      },
      "head-2": {
        front: { x: 0, y: -392 },
        profileLeft: { x: -22, y: -393 },
        profileRight: { x: 22, y: -393 },
        back: { x: 0, y: -404 },
      },
    };
    this.headScaleByView = {
      "head-1": {
        back: 0.338829,
      },
      "head-2": {
        front: 0.1519715285,
        profileLeft: 0.1634611249,
        profileRight: 0.1634611249,
        back: 0.2389782528,
      },
    };
    this.headScaleByRaceGenderVariant = {
      human: {
        male: {
          "*": 1.015,
        },
        female: {
          "head-1": 0.294,
        },
      },
      elf: {
        male: {
          "head-1": 0.2435125,
          "*": 1.015,
        },
        female: {
          "head-1": 0.294,
        },
      },
    };
    this.headScaleByRaceGenderVariantView = {
      human: {
        male: {
          "head-1": {
            front: 0.3737002723,
            profileLeft: 0.3662262668,
            profileRight: 0.3662262668,
            back: 0.3589017415,
          },
          "head-2": {
            front: 0.1573542718,
            profileLeft: 0.1687577408,
            profileRight: 0.1687577408,
            back: 0.2555584563,
          },
        },
      },
      elf: {
        male: {
          "head-1": {
            profileLeft: 0.2384828862,
            profileRight: 0.2384828862,
            front: 0.217033856,
            back: 0.2068671619,
          },
        },
      },
    };
    this.headScaleGlobalMultiplier = 0.95;
    this.headScaleMultiplierByRaceGenderVariant = {
      human: {
        male: {
          "head-1": 1,
          "head-2": 1,
        },
        female: {
          "head-1": 1,
          "head-2": 1,
        },
      },
      elf: {
        male: {
          "head-1": 1,
        },
      },
    };
    this.headScaleMultiplierByRaceGenderVariantView = {};
    this.headOffsetByRaceGenderVariant = {
      human: {
        female: {
          "head-1": {
            front: { x: 0, y: -347 },
            profileLeft: { x: -6, y: -357 },
            profileRight: { x: 6, y: -357 },
            back: { x: 0, y: -354 },
          },
        },
        male: {
          "head-1": {
            front: { x: 0, y: -413 },
            profileLeft: { x: -14, y: -425 },
            profileRight: { x: 14, y: -425 },
            back: { x: 0, y: -434 },
          },
          "head-2": {
            front: { x: 0, y: -416 },
            profileLeft: { x: -22, y: -417 },
            profileRight: { x: 22, y: -417 },
            back: { x: 8, y: -434 },
          },
        },
      },
      elf: {
        male: {
          "head-1": {
            front: { x: 0, y: -409 },
            profileLeft: { x: -8, y: -384 },
            profileRight: { x: 8, y: -384 },
            back: { x: 0, y: -383 },
          },
          "head-2": {
            front: { x: 0, y: -380 },
            profileLeft: { x: -22, y: -382 },
            profileRight: { x: 22, y: -382 },
            back: { x: 0, y: -392 },
          },
        },
        female: {
          "head-1": {
            front: { x: 0, y: -347 },
            profileLeft: { x: -6, y: -357 },
            profileRight: { x: 6, y: -357 },
            back: { x: 0, y: -354 },
          },
        },
      },
    };
    this.headTintByVariant = {
      default: 0xf7e6d8,
      "head-1": 0xf5e1d3,
      "head-2": null,
    };
    this.headTintByVariantView = {
      "head-2": {
        front: null,
        profileLeft: 0xf2d6c3,
        profileRight: 0xf2d6c3,
        back: 0xf2d6c3,
      },
    };
    this.headTintByRaceGenderVariantView = {
      human: {
        male: {
          "head-2": {
            profileLeft: null,
            profileRight: null,
            back: null,
          },
        },
      },
    };

    this.previewFrame = this.add.image(
      this.layoutBase.previewFrame.x,
      this.layoutBase.previewFrame.y,
      `${ASSETS.CHARACTER_CREATION_BOX_PREVIEW}_${lang}`
    );
    this.previewFrame.setOrigin(0.5);
    this.previewFrame.setDepth(1);

    this.previewImage = this.add.image(900, 340, ASSETS.HUMAN_BASE_FRONT);
    this.previewImage.setDepth(2);
    this.previewTargetHeight = 400;
    this.previewBodyScale = 0.767125;
    this.previewHeadScale = 0.3249;
    this.previewBodyOffset = { x: 0, y: 28 };
    this.bodyScaleByRace = {
      human: 0.759,
      elf: 0.759,
    };
    this.headScaleByRace = {
      human: 0.759,
      elf: 0.759,
    };
    this.bodyScaleFactorsByRaceGender = {
      human: { male: { x: 0.95, y: 1.1025 } },
      elf: { male: { x: 0.95, y: 1.1025 } },
    };
    this.previewHead = this.add.image(900, 340, ASSETS.HUMAN_BASE_FRONT);
    this.previewHead.setOrigin(0.5);
    this.previewHead.setDepth(this.previewImage.depth + 1);
    this.previewHead.setVisible(false);

    this.previewLeft = this.add
      .image(690, 340, ASSETS.CHARACTER_CREATION_PREVIEW_ARROW_LEFT)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.previewLeft.setDepth(4);

    this.previewRight = this.add
      .image(1110, 340, ASSETS.CHARACTER_CREATION_PREVIEW_ARROW_RIGHT)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.previewRight.setDepth(4);

    this.previewLeft.on("pointerdown", () => this.rotateView(1));
    this.previewRight.on("pointerdown", () => this.rotateView(-1));

    this.backButton = this.add
      .image(
        this.layoutBase.backButton.x,
        this.layoutBase.backButton.y,
        getUiKey(this, ASSETS.CHARACTER_CREATION_BACK)
      )
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    this.backButton.setDepth(10);
    this.backButton.setAlpha(0.95);
    this.backButton.on("pointerover", () => this.backButton.setTint(0xffe0b2));
    this.backButton.on("pointerout", () => this.backButton.clearTint());
    this.backButton.on("pointerdown", () => this.scene.start(SCENES.MENU));

    this.startButton = this.add
      .image(
        centerX,
        520,
        getUiKey(this, ASSETS.CHARACTER_CREATION_START)
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.startButton.setDepth(0);
    this.startButton.on("pointerover", () =>
      this.startButton.setTint(0xffe0b2)
    );
    this.startButton.on("pointerout", () => this.startButton.clearTint());
    this.startButton.on("pointerdown", () => this.startGame());

    this.applyLayout();
    this.updatePreview();
    this.scale.on("resize", this.handleResize, this);
    this.events.once("shutdown", () => {
      this.scale.off("resize", this.handleResize, this);
      if (this.nameInputReal && this.nameInputReal.parentNode) {
        this.nameInputReal.parentNode.removeChild(this.nameInputReal);
      }
      if (this.nameInputRealOutsideHandler) {
        document.removeEventListener("mousedown", this.nameInputRealOutsideHandler);
      }
    });
    this.events.on("wake", () => {
      this.applyLayout();
    });
  }

  handleResize() {
    this.hideStatTooltip();
    if (this.scene.isActive()) {
      this.applyLayout();
    }
  }

  ensureProceduralTextures() {
    if (!this.textures.exists("cc_fog_gen")) {
      const size = 1024;
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      for (let i = 0; i < 1200; i += 1) {
        const x = Phaser.Math.Between(0, size);
        const y = Phaser.Math.Between(0, size);
        const r = Phaser.Math.Between(18, 120);
        const alpha = Phaser.Math.FloatBetween(0.03, 0.12);
        gfx.fillStyle(0xffffff, alpha);
        gfx.fillCircle(x, y, r);
      }
      gfx.generateTexture("cc_fog_gen", size, size);
      gfx.destroy();
      this.textures.get("cc_fog_gen").setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    if (!this.textures.exists("cc_ash_gen")) {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(4, 4, 2.2);
      gfx.generateTexture("cc_ash_gen", 8, 8);
      gfx.destroy();
      this.textures.get("cc_ash_gen").setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }

  update(time, delta) {
    const d = delta * 0.001;
    if (this.fog1) {
      this.fog1.rotation = 0.0017 * d;
    }
    if (this.fog2) {
      this.fog2.rotation = -0.0014 * d;
    }
    if (this.nameHintActive) {
      this.positionNameHintFixed();
    }
  }

  getRandomIndex(list) {
    if (!list || list.length === 0) return 0;
    return Phaser.Math.Between(0, list.length - 1);
  }

  computeStatBounds() {
    if (
      !this.raceIds ||
      !this.classIds ||
      !this.factionIds ||
      !this.statKeys
    ) {
      return;
    }
    const statMap = {
      hp: "maxHp",
      mp: "maxMp",
      str: "str",
      dex: "dex",
      int: "int",
      vit: "vit",
    };
    const totals = {
      hp: 0,
      mp: 0,
      str: 0,
      dex: 0,
      int: 0,
      vit: 0,
    };
    const maxes = { ...totals };
    let count = 0;
    this.raceIds.forEach((raceId) => {
      this.classIds.forEach((classId) => {
        this.factionIds.forEach((factionId) => {
          const stats = this.characterBuilder.getPreviewStats({
            raceId,
            classId,
            factionId,
            level: 1,
            equipmentIds: [],
          });
          this.statKeys.forEach((key) => {
            const value = stats?.[statMap[key]] ?? 0;
            totals[key] += value;
            if (value > maxes[key]) maxes[key] = value;
          });
          count += 1;
        });
      });
    });
    const avgs = {};
    this.statKeys.forEach((key) => {
      avgs[key] = count > 0 ? totals[key] / count : 0;
    });
    this.statMax = maxes;
    this.statAvg = avgs;
  }

  createStatTooltip() {
    const w = 160;
    const h = 52;
    const pad = 16;
    const bg = this.add
      .rectangle(0, 0, w, h, 0x000000, 0.95)
      .setStrokeStyle(2, 0xffffff);
    const txt = this.add
      .text(0, 0, "", {
        fontFamily: "Dalelands",
        fontSize: "12px",
        color: "#e0e0e0",
        align: "center",
        wordWrap: { width: Math.max(60, w - pad * 2) },
      })
      .setOrigin(0.5, 0.5);
    this.statTooltip = this.add.container(0, 0, [bg, txt]);
    this.statTooltip.setDepth(200).setVisible(false);
  }

  showStatTooltip(statKey, zone) {
    if (!this.statTooltip || !zone) return;
    const msg = t(this, `characterCreation.stats.tooltip.${statKey}`);
    this.statTooltip.list[1].setText(msg);
    const tw = 160;
    const th = 52;
    const ox = zone.x + (zone.width || 70) / 2 + 10;
    const oy = zone.y - th / 2 - 20;
    const cam = this.cameras.main;
    let x = ox;
    let y = oy;
    if (x + tw > cam.width - 10) x = zone.x - (zone.width || 70) / 2 - tw - 10;
    if (y < 10) y = 10;
    if (y + th > cam.height - 10) y = cam.height - th - 10;
    this.statTooltip.setPosition(x, y);
    this.statTooltip.setVisible(true);
  }

  hideStatTooltip() {
    if (this.statTooltip) this.statTooltip.setVisible(false);
  }

  normalizeName(raw) {
    return (raw || "").replace(/\s+/g, " ").trim();
  }

  validateName(raw) {
    const name = this.normalizeName(raw);
    const min = this.nameRules?.min ?? 2;
    const max = this.nameRules?.max ?? 16;
    const onlyLetters = /^[\p{L} ]+$/u;
    if (!name) return { valid: false, reason: "required", value: "" };
    if (!onlyLetters.test(name))
      return { valid: false, reason: "invalidChars", value: name };
    if (name.length < min)
      return { valid: false, reason: "tooShort", value: name };
    if (name.length > max)
      return { valid: false, reason: "tooLong", value: name };
    return { valid: true, value: name };
  }

  setNameError(reason) {
    if (!this.nameErrorText) return;
    const key = `characterCreation.nameErrors.${reason}`;
    const msg = t(this, key);
    this.nameHintActive = false;
    this.nameErrorText
      .setText(reason === "required" ? msg.toUpperCase() : msg)
      .setVisible(true);
    if (this.nameErrorBlink) {
      this.nameErrorBlink.restart();
    }
  }

  setNameHint(key) {
    if (!this.nameErrorText) return;
    const msg = t(this, key);
    this.nameHintActive = true;
    this.nameErrorText.setText(msg).setVisible(true);
    if (this.nameErrorBlink) this.nameErrorBlink.restart();
  }

  clearNameError() {
    this.nameHintActive = false;
    if (this.nameErrorText) this.nameErrorText.setVisible(false);
    if (this.nameErrorBlink) this.nameErrorBlink.pause();
  }

  handleNameInput() {
    if (!this.nameInputReal) return;
    const raw = this.nameInputReal.value ?? "";
    const cleaned = raw.replace(/[^\p{L}\s]/gu, "");
    if (cleaned !== raw) {
      this.nameInputReal.value = cleaned;
      this.setNameError("invalidChars");
    }
    const min = this.nameRules?.min ?? 2;
    const normalized = this.normalizeName(cleaned);
    if (normalized.length > 0 && normalized.length < min) {
      this.setNameHint("characterCreation.nameHints.minChars");
      this.positionNameHintFixed();
      if (this.startButton) this.startButton.setAlpha(0.6);
      return;
    }
    const result = this.validateName(cleaned);
    if (!result.valid) {
      if (result.reason !== "invalidChars") {
        this.setNameError(result.reason);
      }
    } else {
      this.clearNameError();
    }
    if (this.startButton) {
      this.startButton.setAlpha(result.valid ? 1 : 0.6);
    }
  }

  positionNameHintFixed() {
    if (!this.nameInputReal || !this.nameErrorText) return false;
    const lang = getLanguage(this);
    const nameHintOffsetX = lang === "en" ? 45 : 47;
    const nameHintOffsetY = lang === "en" ? 31.5 : 33;
    const hintOffsetYUp = 30;
    const hintOffsetXLeft = 30;
    const inputRect = this.nameInputReal.getBoundingClientRect();
    const canvasRect = this.game.canvas.getBoundingClientRect();
    const gw = this.cameras.main.width;
    const gh = this.cameras.main.height;
    const rx = inputRect.left - canvasRect.left + nameHintOffsetX - hintOffsetXLeft;
    const ry = inputRect.top - canvasRect.top + nameHintOffsetY - hintOffsetYUp;
    const worldX = (rx / canvasRect.width) * gw;
    const worldY = (ry / canvasRect.height) * gh;
    const base = this.layoutBase;
    const scale = Math.max(
      0.55,
      Math.min(gw / base.width, gh / base.height, 1.1)
    );
    this.nameErrorText.setPosition(worldX, worldY).setScale(scale);
    return true;
  }

  getHeadVariantIds() {
    const raceId = this.raceIds[this.raceIndex];
    const genderId = this.genderIds[this.genderIndex];
    return this.headVariants?.[raceId]?.[genderId] || [];
  }

  getHeadVariantLabels() {
    const ids = this.getHeadVariantIds();
    if (ids.length === 0) return [t(this, "characterCreation.headVariant.base")];
    return ids.map((id) => t(this, this.headVariantLabels[id] || id));
  }

  ensureHeadVariantIndex() {
    const ids = this.getHeadVariantIds();
    if (ids.length === 0) {
      this.headVariantIndex = 0;
      return;
    }
    if (this.headVariantIndex >= ids.length) {
      this.headVariantIndex = 0;
    }
  }

  createSelector(key, label, y, getIds, getLabel, onChange) {
    const labelText = this.add.text(120, y, label, {
      fontFamily: "Dalelands",
      fontSize: "18px",
      color: "#ffffff",
    });
    labelText.setOrigin(0, 0.5);
    labelText.setVisible(false);

    const left = this.add
      .image(260, y, ASSETS.CHARACTER_CREATION_ARROW_LEFT)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const valueText = this.add.text(320, y, "", {
      fontFamily: "Dalelands",
      fontSize: "26px",
      color: "#ffffff",
    });
    valueText.setOrigin(0, 0.5);

    const right = this.add
      .image(420, y, ASSETS.CHARACTER_CREATION_ARROW_RIGHT)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const updateValue = (direction) => {
      const ids = getIds();
      let index;
      if (key === "race") index = this.raceIndex;
      if (key === "class") index = this.classIndex;
      if (key === "faction") index = this.factionIndex;
      if (key === "gender") index = this.genderIndex;
      if (key === "head") index = this.headVariantIndex;
      index = (index + direction + ids.length) % ids.length;
      valueText.setText(getLabel(ids[index]));
      onChange(index);
    };

    left.on("pointerdown", () => updateValue(-1));
    right.on("pointerdown", () => updateValue(1));

    const ids = getIds();
    if (key === "race") valueText.setText(getLabel(ids[this.raceIndex]));
    if (key === "class") valueText.setText(getLabel(ids[this.classIndex]));
    if (key === "faction") valueText.setText(getLabel(ids[this.factionIndex]));
    if (key === "gender") valueText.setText(getLabel(ids[this.genderIndex]));
    if (key === "head") valueText.setText(getLabel(ids[this.headVariantIndex]));

    return {
      key,
      labelText,
      left,
      valueText,
      right,
      baseY: y,
      arrowScale: 0.09,
    };
  }

  applyLayout() {
    const { width, height } = this.cameras.main;
    const base = this.layoutBase;
    const lang = getLanguage(this);
    const scale = Math.max(
      0.55,
      Math.min(width / base.width, height / base.height, 1.1)
    );
    const offsetX = (width - base.width * scale) / 2;
    const offsetY = (height - base.height * scale) / 2;
    const mapX = (value) => value * scale + offsetX;
    const mapY = (value) => value * scale + offsetY;

    if (this.bg) {
      const bgScale = Math.max(width / this.bg.width, height / this.bg.height);
      this.bg.setPosition(width / 2, height / 2);
      this.bg.setScale(bgScale);
    }
    if (this.bgDark) {
      this.bgDark.setSize(width, height);
    }
    if (this.bgLight) {
      this.bgLight.setSize(width, height);
    }
    if (this.fog1) {
      const fogScale = Math.max(
        width / this.fog1.width,
        height / this.fog1.height
      );
      this.fog1.setScale(fogScale * 2.2);
      this.fog1.setPosition(width / 2, height / 2);
    }
    if (this.fog2) {
      const fogScale = Math.max(
        width / this.fog2.width,
        height / this.fog2.height
      );
      this.fog2.setScale(fogScale * 2.35);
      this.fog2.setPosition(width / 2, height / 2);
    }
    if (this.ashEmitter?.setX && this.ashEmitter?.setY) {
      this.ashEmitter.setX({ min: 0, max: width });
      this.ashEmitter.setY({ min: -20, max: height + 20 });
    }

    if (this.titleImage) {
      this.titleImage.setPosition(mapX(base.width / 2), mapY(base.titleY) + 20);
      const currentWidth = this.titleImage.width * scale;
      const targetWidth = Math.max(100, currentWidth - 1000);
      const titleScale = (targetWidth / this.titleImage.width);
      this.titleImage.setScale(titleScale);
    }

    if (this.leftBox) {
      const targetLeftWidth =
        base.leftBox.width + (lang === "en" ? -40 : 0);
      const boxScale = targetLeftWidth / this.leftBox.width;
      const baseScale = boxScale * scale * base.leftBox.scale;
      this.leftBox.setScale(
        baseScale * base.leftBox.scaleX,
        baseScale * base.leftBox.scaleY
      );
      const leftBoxX = Math.max(
        this.leftBox.displayWidth / 2 + 20,
        mapX(base.leftBox.x)
      );
      const leftBoxY = mapY(base.leftBox.y + (lang === "en" ? -40 : 0));
      this.leftBox.setPosition(
        leftBoxX + (lang === "en" ? 30 * scale : 0),
        leftBoxY
      );
      if (this.backButton) {
        const backScale = 0.16 * scale;
        this.backButton
          .setScale(backScale)
          .setPosition(
            this.leftBox.x -
              this.leftBox.displayWidth / 2 +
              (lang === "es" ? 40 : 2) * scale,
            this.leftBox.y -
              this.leftBox.displayHeight / 2 -
              (lang === "es" ? 7 : 32) * scale
          );
      }
    }
    if (this.rightBox) {
      const targetRightWidth =
        base.rightBox.width + (lang === "en" ? -10 : 0);
      const boxScale = targetRightWidth / this.rightBox.width;
      this.rightBox.setScale(boxScale * scale * base.rightBox.scale);
      const rightBoxX = Math.min(
        width - this.rightBox.displayWidth / 2 - 20,
        mapX(base.rightBox.x)
      );
      const rightBoxY = mapY(base.rightBox.y);
      this.rightBox.setPosition(rightBoxX, rightBoxY);
    }
    if (this.bonusBox) {
      const targetBonusWidth =
        base.bonusBox.width + (lang === "en" ? 15 : 0);
      const boxScale = targetBonusWidth / this.bonusBox.width;
      this.bonusBox.setScale(boxScale * scale * base.bonusBox.scale);
      this.bonusBox.setPosition(
        mapX(base.bonusBox.x + (lang === "en" ? 2 : 0)),
        mapY(base.bonusBox.y + (lang === "en" ? 2 : 0))
      );
    }

    if (this.leftBox) {
      const boxLeft = this.leftBox.x - this.leftBox.displayWidth / 2;
      const boxTop = this.leftBox.y - this.leftBox.displayHeight / 2;
      const layout = base.leftBoxLayout;
      const labelX = boxLeft + layout.paddingX * scale;
      const arrowXExtra = lang === "en" ? -30 : 0;
      const leftX = labelX + (layout.arrowLeftOffset - 20) * scale + arrowXExtra * scale - 20;
      const valueXExtra = lang === "en" ? -45 : -25;
      const valueX = labelX + layout.valueOffset * scale + valueXExtra * scale - 20;
      const rightX = labelX + (layout.arrowRightOffset - 20) * scale + arrowXExtra * scale;
      this.selectors.forEach((selector, idx) => {
        const rowY = boxTop + (layout.paddingTop + layout.rowGap * idx) * scale;
        selector.labelText.setPosition(labelX, rowY).setScale(scale);
        const rowOffsetPixels =
          this.valueOffsetsByKey?.[selector.key] ?? 0;
        const valueYOffsetExtra = lang === "en" ? -23 : 0;
        const valueY =
          rowY +
          (layout.valueYOffset ?? 0) * scale +
          valueYOffsetExtra * scale +
          rowOffsetPixels;
        const rowScale = this.valueScalesByKey?.[selector.key] ?? 1;
        const valueScale = (layout.valueScale ?? 1) * rowScale;
        selector.valueText.setPosition(valueX, valueY).setScale(scale * valueScale);
        selector.left
          .setPosition(leftX, valueY)
          .setScale(scale * (selector.arrowScale ?? 1));
        selector.right
          .setPosition(rightX, valueY)
          .setScale(scale * (selector.arrowScale ?? 1));
      });
    } else {
      this.selectors.forEach((selector) => {
        const baseY = selector.baseY;
        selector.labelText
          .setPosition(mapX(base.selectorX.label), mapY(baseY))
          .setScale(scale);
        selector.valueText
          .setPosition(
            mapX(base.selectorX.value) - 20,
            mapY(
              baseY +
                (base.leftBoxLayout?.valueYOffset ?? 0) +
                (this.valueOffsetsByKey?.[selector.key] ?? 0) / scale
            )
          )
          .setScale(
            scale *
              (base.leftBoxLayout?.valueScale ?? 1) *
              (this.valueScalesByKey?.[selector.key] ?? 1)
          );
        selector.left
          .setPosition(
            mapX(base.selectorX.left) - 20,
            mapY(
              baseY +
                (base.leftBoxLayout?.valueYOffset ?? 0) +
                (this.valueOffsetsByKey?.[selector.key] ?? 0) / scale
            )
          )
          .setScale(scale * (selector.arrowScale ?? 1));
        selector.right
          .setPosition(
            mapX(base.selectorX.right),
            mapY(
              baseY +
                (base.leftBoxLayout?.valueYOffset ?? 0) +
                (this.valueOffsetsByKey?.[selector.key] ?? 0) / scale
            )
          )
          .setScale(scale * (selector.arrowScale ?? 1));
      });
    }

    if (this.leftBox) {
      const boxLeft = this.leftBox.x - this.leftBox.displayWidth / 2;
      const boxTop = this.leftBox.y - this.leftBox.displayHeight / 2;
      const layout = base.leftBoxLayout;
      const nameYOffset = lang === "en" ? 33.5 : 53.5;
      const nameY = boxTop + (layout.paddingTop - layout.rowGap) * scale + nameYOffset;
      const nameLabelX = boxLeft + layout.paddingX * scale;
      const valueXExtra = lang === "en" ? -45 : -8;
      const nameInputX = nameLabelX + layout.valueOffset * scale + valueXExtra * scale - 240;
      this.nameLabel.setPosition(nameLabelX, nameY).setScale(scale);
      if (this.nameInputBox) {
        this.nameInputBox.setPosition(
          nameLabelX + layout.nameInputOffsetX * scale,
          nameY
        );
        this.nameInputBox.setSize(
          layout.nameBoxWidth * scale,
          layout.nameBoxHeight * scale
        );
      }
      if (this.nameInputReal) {
        const canvas = this.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const gw = this.cameras.main.width;
        const gh = this.cameras.main.height;
        const boxX = nameLabelX + layout.nameInputOffsetX * scale;
        const boxY = nameY;
        const boxW = layout.nameBoxWidth * scale;
        const boxH = layout.nameBoxHeight * scale;
        const pad = 4;
        const nameInputOffsetX = lang === "es" ? -155 : -188;
        const nameInputOffsetY = 17;
        const screenX = canvasRect.left + (boxX / gw) * canvasRect.width;
        const screenY = canvasRect.top + (boxY / gh) * canvasRect.height;
        const screenW = Math.max(1, (boxW / gw) * canvasRect.width - pad * 2);
        const screenH = Math.max(1, (boxH / gh) * canvasRect.height - pad * 2);
        const fontSize = Math.max(12, Math.round(16 * (canvasRect.width / gw)));
        this.nameInputReal.style.left = `${screenX + pad + nameInputOffsetX}px`;
        this.nameInputReal.style.top = `${screenY + pad + nameInputOffsetY}px`;
        this.nameInputReal.style.width = `${screenW}px`;
        this.nameInputReal.style.height = `${screenH}px`;
        this.nameInputReal.style.fontSize = `${fontSize}px`;
      }
      if (this.nameErrorText) {
        if (this.nameHintActive && this.nameInputReal) {
          if (!this.positionNameHintFixed()) {
            this.nameErrorText
              .setPosition(nameInputX + 40 * scale - 30, nameY + 2 * scale - 30)
              .setScale(scale);
          }
        } else {
          const errorOffsetX = lang === "en" ? 30 : 30;
          const errorOffsetY = lang === "en" ? 18 * scale + 5 : 18 * scale + 7;
          this.nameErrorText
            .setPosition(nameInputX + errorOffsetX, nameY + errorOffsetY)
            .setScale(scale);
        }
      }
    } else {
      this.nameLabel
        .setPosition(mapX(base.nameX.label), mapY(base.nameY))
        .setScale(scale);
      if (this.nameInputBox) {
        this.nameInputBox.setPosition(mapX(base.nameBox.x), mapY(base.nameBox.y));
        this.nameInputBox.setSize(
          base.nameBox.width * scale,
          base.nameBox.height * scale
        );
      }
      if (this.nameInputReal) {
        const canvas = this.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const gw = this.cameras.main.width;
        const gh = this.cameras.main.height;
        const boxX = mapX(base.nameBox.x);
        const boxY = mapY(base.nameBox.y);
        const boxW = base.nameBox.width * scale;
        const boxH = base.nameBox.height * scale;
        const pad = 4;
        const nameInputOffsetX = lang === "es" ? -80 : -123;
        const nameInputOffsetY = 20;
        const screenX = canvasRect.left + (boxX / gw) * canvasRect.width;
        const screenY = canvasRect.top + (boxY / gh) * canvasRect.height;
        const screenW = Math.max(1, (boxW / gw) * canvasRect.width - pad * 2);
        const screenH = Math.max(1, (boxH / gh) * canvasRect.height - pad * 2);
        const fontSize = Math.max(12, Math.round(16 * (canvasRect.width / gw)));
        this.nameInputReal.style.left = `${screenX + pad + nameInputOffsetX}px`;
        this.nameInputReal.style.top = `${screenY + pad + nameInputOffsetY}px`;
        this.nameInputReal.style.width = `${screenW}px`;
        this.nameInputReal.style.height = `${screenH}px`;
        this.nameInputReal.style.fontSize = `${fontSize}px`;
      }
      if (this.nameErrorText) {
        if (this.nameHintActive && this.nameInputReal) {
          if (!this.positionNameHintFixed()) {
            this.nameErrorText
              .setPosition(mapX(base.nameX.input) + 40 * scale - 30, mapY(base.nameY) + 2 * scale - 30)
              .setScale(scale);
          }
        } else {
          const errorOffsetX = lang === "en" ? 30 : 30;
          const errorOffsetY = lang === "en" ? 5 : 7;
          this.nameErrorText
            .setPosition(mapX(base.nameX.input) + errorOffsetX, mapY(base.nameY + 18) + errorOffsetY)
            .setScale(scale);
        }
      }
    }
    if (this.nameInputReal && this.nameInputReal.value == null) {
      const defaultNames = this.cache.json.get("default_names");
      this.nameInputReal.value = (Array.isArray(defaultNames) && defaultNames.length > 0
        ? Phaser.Utils.Array.GetRandom(defaultNames)
        : t(this, "characterCreation.defaultName")
      ).toUpperCase();
    }

    if (this.rightBox) {
      const boxLeft = this.rightBox.x - this.rightBox.displayWidth / 2;
      const boxTop = this.rightBox.y - this.rightBox.displayHeight / 2;
      const paddingX = (base.rightBoxLayout?.paddingX ?? 26) * scale;
      const statsY = boxTop + (base.rightBoxLayout?.paddingTop ?? 40) * scale;
      const rowGap = (base.rightBoxLayout?.rowGap ?? 24) * scale;
      const labelLeft = (this.statBarLayout?.labelOffsetLeft ?? 30) * scale;
      const zoneW = (this.statBarLayout?.labelZoneWidth ?? 70) * scale;
      const zoneH = (this.statBarLayout?.labelZoneHeight ?? 24) * scale;
      (this.statValueTexts || []).forEach((text, index) => {
        const key = this.statKeys[index];
        const offset = (this.statValueOffsets?.[key] ?? 0) * scale;
        text
          .setPosition(boxLeft + paddingX, statsY + rowGap * index + offset)
          .setScale(scale);
        const bar = this.statBars?.[index];
        if (bar) {
          const barYOff = (this.statBarLayout.barYOffset ?? 0) * scale;
          bar
            .setPosition(
              boxLeft +
                paddingX +
                (this.statBarLayout.offsetX ?? 60) * scale,
              statsY + rowGap * index + offset + barYOff
            )
            .setScale(scale);
        }
        const zone = this.statLabelZones?.[index];
        if (zone) {
          const zoneW2 = Math.max(10, zoneW - 40);
          zone.setPosition(
            boxLeft + paddingX - labelLeft - zoneW / 2 + 15 + (zoneW - zoneW2) / 2,
            statsY + rowGap * index + offset
          );
          zone.setSize(zoneW2, zoneH);
        }
      });
    } else {
      const statsX = mapX(base.statsX);
      const statsY = mapY(base.statsY);
      const rowGap = 24 * scale;
      const labelLeft = (this.statBarLayout?.labelOffsetLeft ?? 30) * scale;
      const zoneW = (this.statBarLayout?.labelZoneWidth ?? 70) * scale;
      const zoneH = (this.statBarLayout?.labelZoneHeight ?? 24) * scale;
      (this.statValueTexts || []).forEach((text, index) => {
        const key = this.statKeys[index];
        const offset = (this.statValueOffsets?.[key] ?? 0) * scale;
        text
          .setPosition(statsX, statsY + rowGap * index + offset)
          .setScale(scale);
        const bar = this.statBars?.[index];
        if (bar) {
          const barYOff = (this.statBarLayout.barYOffset ?? 0) * scale;
          bar
            .setPosition(
              statsX + (this.statBarLayout.offsetX ?? 60) * scale,
              statsY + rowGap * index + offset + barYOff
            )
            .setScale(scale);
        }
        const zone = this.statLabelZones?.[index];
        if (zone) {
          const zoneW2 = Math.max(10, zoneW - 40);
          zone.setPosition(
            statsX - labelLeft - zoneW / 2 + 15 + (zoneW - zoneW2) / 2,
            statsY + rowGap * index + offset
          );
          zone.setSize(zoneW2, zoneH);
        }
      });
    }

    if (this.bonusBox) {
      const boxLeft = this.bonusBox.x - this.bonusBox.displayWidth / 2;
      const boxTop = this.bonusBox.y - this.bonusBox.displayHeight / 2;
      const paddingX = 22 * scale;
      const prosY = boxTop + 32 * scale + 60;
      const boxCenterX = this.bonusBox.x;
      this.prosText
        .setPosition(boxLeft + paddingX - 5, prosY)
        .setScale(scale);
      this.consText
        .setPosition(boxCenterX + paddingX - 5, prosY)
        .setScale(scale);
    } else {
      this.prosText
        .setPosition(mapX(base.statsX), mapY(base.prosY))
        .setScale(scale);
      this.consText
        .setPosition(mapX(base.statsX), mapY(base.consY))
        .setScale(scale);
    }

    if (this.previewFrame) {
      this.previewFrame.setDepth(1);
      const frameScaleX =
        (base.previewFrame.width / this.previewFrame.width) *
        scale *
        (base.previewFrame.scaleX ?? base.previewFrame.scale ?? 1);
      const frameScaleY =
        (base.previewFrame.height / this.previewFrame.height) *
        scale *
        (base.previewFrame.scaleY ?? base.previewFrame.scale ?? 1);
      this.previewFrame
        .setPosition(
          mapX(base.previewFrame.x),
          mapY(base.previewFrame.y + (lang === "en" ? -10 : 0))
        )
        .setScale(frameScaleX, frameScaleY);
    }

    const bodyOffset = this.previewBodyOffset || { x: 0, y: 0 };
    this.previewImage.setPosition(
      mapX(base.previewImage.x + bodyOffset.x),
      mapY(base.previewImage.y + bodyOffset.y)
    );
    if (this.previewHead) {
      this.previewHead.setDepth(3);
      this.previewHead.setPosition(
        mapX(base.previewImage.x + bodyOffset.x),
        mapY(base.previewImage.y + bodyOffset.y)
      );
    }
    this.previewTargetHeight = base.previewImage.height * scale;
    this.updateAppearancePreview();

    this.previewLeft
      .setPosition(mapX(base.previewArrows.leftX), mapY(base.previewArrows.y))
      .setScale(scale * (base.previewArrows.scale ?? 1))
      .setDepth(4);
    this.previewRight
      .setPosition(mapX(base.previewArrows.rightX), mapY(base.previewArrows.y))
      .setScale(scale * (base.previewArrows.scale ?? 1))
      .setDepth(4);

    if (!this.leftBox && this.backButton) {
      this.backButton
        .setPosition(mapX(base.backButton.x), mapY(base.backButton.y))
        .setScale(0.16 * scale);
    }
    if (this.startButton) {
      this.startButton.setDepth(0);
      const startScale = (base.startButton.width / this.startButton.width) * scale;
      this.startButton
        .setPosition(mapX(base.startButton.x), mapY(base.startButton.y))
        .setScale(
          startScale - (lang === "en" ? 15 / this.startButton.width : 0)
        );
    }
  }

  updatePreview() {
    const raceId = this.raceIds[this.raceIndex];
    const classId = this.classIds[this.classIndex];
    const factionId = this.factionIds[this.factionIndex];
    this.ensureHeadVariantIndex();

    const stats = this.characterBuilder.getPreviewStats({
      raceId,
      classId,
      factionId,
      level: 1,
      equipmentIds: [],
    });

    const statValues = {
      hp: stats.maxHp,
      mp: stats.maxMp,
      str: stats.str,
      dex: stats.dex,
      int: stats.int,
      vit: stats.vit,
    };
    if (this.statValueTexts && this.statKeys) {
      this.statValueTexts.forEach((text, index) => {
        const key = this.statKeys[index];
        text.setText(`${statValues[key] ?? ""}`);
      });
      this.currentStats = statValues;
      this.updateStatBars();
    }

    const classData = CLASSES[classId];
    const { pros, cons } = this.describeModifiers(classData.modifiers || {});
    this.prosText.setText(
      [
        t(this, "characterCreation.pros"),
        ...pros,
        `${t(this, "characterCreation.stats.armor")}: ${stats.armor}`,
        `${t(this, "characterCreation.stats.mres")}: ${stats.mres}`,
      ].join("\n")
    );
    this.consText.setText([t(this, "characterCreation.cons"), ...cons].join("\n"));
    this.updateAppearancePreview();
  }

  updateAppearancePreview() {
    if (!this.previewImage) return;
    const textureKey = this.getCurrentBaseTextureKey();
    if (!textureKey) return;
    const viewId = this.viewOptions[this.viewIndex]?.id;
    this.previewImage.setTexture(textureKey);
    const baseScale = this.previewTargetHeight / this.previewImage.height;
    const raceId = this.raceIds[this.raceIndex];
    const bodyRaceScale = this.bodyScaleByRace?.[raceId] ?? 1;
    const headRaceScale = this.headScaleByRace?.[raceId] ?? 1;
    const bodyScale = baseScale * this.previewBodyScale * bodyRaceScale;
    const bodyFactors = this.getBodyScaleFactors();
    this.previewImage.setScale(
      bodyScale * bodyFactors.x,
      bodyScale * bodyFactors.y
    );
    if (this.previewHead) {
      const headTexture = this.getCurrentHeadTextureKey();
      if (headTexture && this.textures.exists(headTexture)) {
        this.previewHead.setTexture(headTexture);
        const headScale =
          baseScale * this.getHeadScale(viewId) * headRaceScale;
        this.previewHead.setScale(headScale);
        const headVariantIds = this.getHeadVariantIds();
        const headVariantId =
          headVariantIds[this.headVariantIndex] || headVariantIds[0] || null;
        const raceId = this.raceIds[this.raceIndex];
        const genderId = this.genderIds[this.genderIndex];
        const variantOffsets =
          this.headOffsetByRaceGenderVariant?.[raceId]?.[genderId]?.[
            headVariantId
          ];
        const offset =
          variantOffsets?.[viewId] ||
          this.headOffsets?.[headVariantId]?.[viewId] ||
          this.headOffsets?.default?.[viewId] || { x: 0, y: -210 };
        const variantViewTint =
          this.headTintByVariantView?.[headVariantId]?.[viewId];
        const raceGenderViewTint =
          this.headTintByRaceGenderVariantView?.[raceId]?.[genderId]?.[
            headVariantId
          ]?.[viewId];
        const tint =
          raceGenderViewTint ??
          variantViewTint ??
          this.headTintByVariant?.[headVariantId] ??
          this.headTintByVariant?.default ??
          null;
        if (tint) {
          this.previewHead.setTint(tint);
        } else {
          this.previewHead.clearTint();
        }
        this.previewHead.setPosition(
          this.previewImage.x + offset.x * bodyScale,
          this.previewImage.y + offset.y * bodyScale
        );
        this.previewHead.setVisible(true);
      } else {
        this.previewHead.setVisible(false);
      }
    }
  }

  getCurrentBaseTextureKey() {
    const raceId = this.raceIds[this.raceIndex];
    const genderId = this.genderIds[this.genderIndex];
    const viewId = this.viewOptions[this.viewIndex]?.id;
    const fallback = ASSETS.HUMAN_BASE_FRONT;
    if (!raceId || !genderId || !viewId) return fallback;
    const bodyKey = `body_${raceId}_${genderId}_${viewId}`;
    if (this.textures.exists(bodyKey)) {
      return bodyKey;
    }
    return this.baseAppearance?.[raceId]?.[genderId]?.[viewId] || fallback;
  }

  getCurrentHeadTextureKey() {
    const raceId = this.raceIds[this.raceIndex];
    const genderId = this.genderIds[this.genderIndex];
    const viewId = this.viewOptions[this.viewIndex]?.id;
    const variantIds = this.getHeadVariantIds();
    const variantId =
      variantIds[this.headVariantIndex] || variantIds[0] || null;
    if (!raceId || !genderId || !variantId || !viewId) return null;
    return `head_${raceId}_${genderId}_${variantId}_${viewId}`;
  }

  getBodyScaleFactors() {
    const raceId = this.raceIds[this.raceIndex];
    const genderId = this.genderIds[this.genderIndex];
    return (
      this.bodyScaleFactorsByRaceGender?.[raceId]?.[genderId] || {
        x: 1,
        y: 1,
      }
    );
  }

  getHeadScale(viewId) {
    const baseScale = this.previewHeadScale;
    const headVariantIds = this.getHeadVariantIds();
    const headVariantId =
      headVariantIds[this.headVariantIndex] || headVariantIds[0] || null;
    if (!headVariantId || !viewId) return baseScale;
    const raceId = this.raceIds[this.raceIndex];
    const genderId = this.genderIds[this.genderIndex];
    const globalMultiplier = this.headScaleGlobalMultiplier ?? 1;
    const multiplier =
      (this.headScaleMultiplierByRaceGenderVariant?.[raceId]?.[genderId]?.[
        headVariantId
      ] ?? 1) * globalMultiplier;
    const viewMultiplier =
      this.headScaleMultiplierByRaceGenderVariantView?.[raceId]?.[genderId]?.[
        headVariantId
      ]?.[viewId] ?? 1;
    const variantViewScale =
      this.headScaleByRaceGenderVariantView?.[raceId]?.[genderId]?.[
        headVariantId
      ]?.[viewId];
    if (variantViewScale) {
      return variantViewScale * multiplier * viewMultiplier;
    }
    const variantScale =
      this.headScaleByRaceGenderVariant?.[raceId]?.[genderId]?.[
        headVariantId
      ];
    if (variantScale) {
      return variantScale * multiplier * viewMultiplier;
    }
    const genderScale =
      this.headScaleByRaceGenderVariant?.[raceId]?.[genderId]?.["*"];
    if (genderScale) {
      const baseViewScale =
        this.headScaleByView?.[headVariantId]?.[viewId] ?? baseScale;
      return baseViewScale * genderScale * multiplier * viewMultiplier;
    }
    return (
      (this.headScaleByView?.[headVariantId]?.[viewId] ?? baseScale) *
      multiplier *
      viewMultiplier
    );
  }

  rotateView(direction) {
    const total = this.viewOptions.length;
    this.viewIndex = (this.viewIndex + direction + total) % total;
    this.updateAppearancePreview();
  }

  updateStatBars() {
    if (!this.statBars || !this.currentStats) return;
    const maxes = this.statMax || {};
    const avgs = this.statAvg || {};
    this.statBars.forEach((bar, index) => {
      const key = this.statKeys[index];
      const value = this.currentStats[key] ?? 0;
      const max = maxes[key] ?? 1;
      const avg = avgs[key] ?? 0;
      const ratio = Math.max(0, Math.min(value / max, 1));
      const blocks = this.statBarLayout.blocks;
      const filled = Math.round(ratio * blocks);
      const width = this.statBarLayout.width;
      const height = this.statBarLayout.height;
      const gap = this.statBarLayout.gap;
      const blockWidth = (width - gap * (blocks - 1)) / blocks;
      const isHigh = value >= avg;
      const isLow = value < avg * 0.7;
      const alpha = isHigh ? 1 : isLow ? 0.35 : 0.65;
      const color = this.statColors[key] ?? 0xffffff;
      bar.clear();
      for (let i = 0; i < blocks; i += 1) {
        const x = i * (blockWidth + gap);
        const filledBlock = i < filled;
        const blockAlpha = filledBlock ? alpha : 0.2;
        bar.fillStyle(color, blockAlpha);
        bar.fillRoundedRect(x, 0, blockWidth, height, 2);
      }
    });
  }

  describeModifiers(modifiers) {
    const entries = Object.entries(modifiers).filter(
      ([key]) => !key.endsWith("Bonus")
    );
    const positives = entries.filter(([, value]) => value > 0);
    const negatives = entries.filter(([, value]) => value < 0);

    const format = ([key, value]) => {
      const label = t(this, `characterCreation.stats.${key}`);
      return `${label} ${Math.round(value * 100)}%`;
    };

    const pros = positives.slice(0, 3).map(format);
    const cons = negatives.slice(0, 2).map(format);

    const extra = [];
    if (modifiers.critChanceBonus) {
      extra.push(
        t(this, "characterCreation.modifier.critBonus", {
          value: Math.round(modifiers.critChanceBonus * 100),
        })
      );
    }
    if (modifiers.magicCritChanceBonus) {
      extra.push(
        t(this, "characterCreation.modifier.magicCritBonus", {
          value: Math.round(modifiers.magicCritChanceBonus * 100),
        })
      );
    }
    return { pros: [...pros, ...extra], cons };
  }

  startGame() {
    const raceId = this.raceIds[this.raceIndex];
    const classId = this.classIds[this.classIndex];
    const factionId = this.factionIds[this.factionIndex];
    const rawName = this.nameInputReal?.value || "";
    const nameResult = this.validateName(rawName);
    if (!nameResult.valid) {
      this.setNameError(nameResult.reason);
      if (this.nameInputReal) this.nameInputReal.focus();
      return;
    }
    const name = nameResult.value;
    const view = this.viewOptions[this.viewIndex];
    const genderId = this.genderIds[this.genderIndex];
    const textureKey = this.getCurrentBaseTextureKey();
    const headTextureKey = this.getCurrentHeadTextureKey();
    const headVariantIds = this.getHeadVariantIds();
    const headVariantId =
      headVariantIds[this.headVariantIndex] || headVariantIds[0] || null;

    this.registry.set("playerConfig", {
      raceId,
      classId,
      factionId,
      level: 1,
      equipmentIds: [],
      name,
      appearance: {
        base: raceId || "human",
        gender: genderId || "male",
        view: view?.id || "front",
        textureKey: textureKey || ASSETS.HUMAN_BASE_FRONT,
        headVariant: headVariantId,
        headTextureKey,
      },
    });

    this.scene.start(SCENES.GAME);
  }
}
