import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { ASSETS, SCENES } from "../constants.js";
import {
  initLanguage,
  loadLanguage,
  LANGUAGES,
} from "../i18n/i18n.js";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload() {
    this.load.on("loaderror", (file) => {
      console.error("LOAD ERROR ->", file?.key, file?.src);
    });
    this.load.on("complete", () => {
      console.log("Textures loaded:", this.textures.getTextureKeys());
    });
    this.load.image(ASSETS.PLAYER, "assets/images/entities/player.png");
    this.load.image(ASSETS.ENEMY, "assets/images/entities/enemy.png");
    this.load.image(ASSETS.MENU, "assets/images/ui/menu/background.png");
    this.load.image(ASSETS.MENU_BG, "assets/images/ui/menu/background.png");
    const menuButtonFiles = {
      en: {
        newGame: "new-game.png",
        loadGame: "load-game.png",
        settings: "settings.png",
        exit: "exit.png",
      },
      es: {
        newGame: "nueva-partida.png",
        loadGame: "cargar-partida.png",
        settings: "ajustes.png",
        exit: "salir.png",
      },
    };
    LANGUAGES.forEach((lang) => {
      const files = menuButtonFiles[lang];
      if (!files) return;
      this.load.image(
        `${ASSETS.MENU_NEW}_${lang}`,
        `assets/images/ui/menu/buttons/${lang}/${files.newGame}`
      );
      this.load.image(
        `${ASSETS.MENU_LOAD}_${lang}`,
        `assets/images/ui/menu/buttons/${lang}/${files.loadGame}`
      );
      this.load.image(
        `${ASSETS.MENU_SETTINGS}_${lang}`,
        `assets/images/ui/menu/buttons/${lang}/${files.settings}`
      );
      this.load.image(
        `${ASSETS.MENU_EXIT}_${lang}`,
        `assets/images/ui/menu/buttons/${lang}/${files.exit}`
      );
    });
    this.load.image(ASSETS.MENU_LOGO, "assets/images/ui/menu/logo.png");
    this.load.image(ASSETS.MENU_KNIGHT, "assets/images/ui/menu/knight.png");
    this.load.image(ASSETS.TILESET_MAIN, "assets/tilesets/tileset.png");
    // Cargar todos los tilesets PNG (necesarios para que Phaser pueda cargarlos desde rutas relativas)
    this.load.image(ASSETS.TILESET_GRASS, "assets/tilesets/TX Tileset Grass.png");
    this.load.image(ASSETS.TILESET_STONE_GROUND, "assets/tilesets/TX Tileset Stone Ground.png");
    this.load.image(ASSETS.TILESET_WALL, "assets/tilesets/TX Tileset Wall.png");
    this.load.image(ASSETS.TILESET_PROPS, "assets/tilesets/TX Props.png");
    this.load.image(ASSETS.TILESET_STRUCT, "assets/tilesets/TX Struct.png");
    this.load.image(ASSETS.TILESET_PLANT, "assets/tilesets/TX Plant.png");
    this.load.image(ASSETS.TILESET_SHADOW, "assets/tilesets/TX Shadow.png");
    this.load.image(ASSETS.TILESET_SHADOW_PLANT, "assets/tilesets/TX Shadow Plant.png");
    this.load.image(ASSETS.TILESET_PLAYER, "assets/tilesets/TX Player.png");
    // Cargar el mapa usando el método nativo de Phaser para tilemaps de Tiled
    this.load.tilemapTiledJSON(ASSETS.MAP_V0, "assets/maps/mapv1.tmj");
    this.load.image(
      ASSETS.CHARACTER_CREATION_BG,
      "assets/images/ui/character-creation/bg_1920x1080.png"
    );
    this.load.image(
      ASSETS.CHARACTER_CREATION_FOG,
      "assets/images/ui/character-creation/fog_title.png"
    );
    this.load.image(
      ASSETS.CHARACTER_CREATION_ASH,
      "assets/images/ui/character-creation/ash_particle.png"
    );
    const ccButtonFiles = {
      en: {
        back: "back.png",
        start: "start-game.png",
        title: "create-your-character.png",
        boxLang: "en",
        boxLeft: "box-character.png",
        boxRight: "box-right.png",
        boxBonus: "box-bonuses.png",
        boxPreview: "box-preview.png",
      },
      es: {
        back: "volver.png",
        start: "comenzar.png",
        title: "crea-tu-personaje.png",
        boxLang: "es",
        boxLeft: "recuadro-left.png",
        boxRight: "recuadro-right.png",
        boxBonus: "recuadro-bonificaciones.png",
        boxPreview: "recuadro-vista-previa.png",
      },
    };
    LANGUAGES.forEach((lang) => {
      const files = ccButtonFiles[lang];
      if (!files) return;
      this.load.image(
        `${ASSETS.CHARACTER_CREATION_BACK}_${lang}`,
        `assets/images/ui/character-creation/buttons/${lang}/${files.back}`
      );
      this.load.image(
        `${ASSETS.CHARACTER_CREATION_START}_${lang}`,
        `assets/images/ui/character-creation/buttons/${lang}/${files.start}`
      );
      this.load.image(
        `${ASSETS.CHARACTER_CREATION_BOX_LEFT}_${lang}`,
        `assets/images/ui/character-creation/box/${files.boxLang}/${files.boxLeft}`
      );
      this.load.image(
        `${ASSETS.CHARACTER_CREATION_BOX_RIGHT}_${lang}`,
        `assets/images/ui/character-creation/box/${files.boxLang}/${files.boxRight}`
      );
      this.load.image(
        `${ASSETS.CHARACTER_CREATION_BOX_BONUS}_${lang}`,
        `assets/images/ui/character-creation/box/${files.boxLang}/${files.boxBonus}`
      );
      this.load.image(
        `${ASSETS.CHARACTER_CREATION_BOX_PREVIEW}_${lang}`,
        `assets/images/ui/character-creation/box/${files.boxLang}/${files.boxPreview}`
      );
      this.load.image(
        `${ASSETS.CHARACTER_CREATION_TITLE}_${lang}`,
        `assets/images/ui/character-creation/title/${lang}/${files.title}`
      );
    });
    this.load.image(
      ASSETS.CHARACTER_CREATION_ARROW_LEFT,
      "assets/images/ui/character-creation/buttons/arrows/arrow-left.png"
    );
    this.load.image(
      ASSETS.CHARACTER_CREATION_ARROW_RIGHT,
      "assets/images/ui/character-creation/buttons/arrows/arrow-right.png"
    );
    this.load.image(
      ASSETS.CHARACTER_CREATION_PREVIEW_ARROW_LEFT,
      "assets/images/ui/character-creation/buttons/arrows/arrows-preview-left.png"
    );
    this.load.image(
      ASSETS.CHARACTER_CREATION_PREVIEW_ARROW_RIGHT,
      "assets/images/ui/character-creation/buttons/arrows/arrows-preview-right.png"
    );
    this.load.image(
      ASSETS.HUMAN_BASE_FRONT,
      "assets/images/characters/human/male/base-front.png"
    );
    this.load.image(
      ASSETS.HUMAN_BASE_PROFILE_LEFT,
      "assets/images/characters/human/male/base-profile-left.png"
    );
    this.load.image(
      ASSETS.HUMAN_BASE_PROFILE_RIGHT,
      "assets/images/characters/human/male/base-profile-right.png"
    );
    this.load.image(
      ASSETS.HUMAN_BASE_BACK,
      "assets/images/characters/human/male/base-back.png"
    );
    this.load.image(
      ASSETS.HUMAN_FEMALE_BASE_FRONT,
      "assets/images/characters/human/female/base-front.png"
    );
    this.load.image(
      ASSETS.HUMAN_FEMALE_BASE_PROFILE_LEFT,
      "assets/images/characters/human/female/base-profile-left.png"
    );
    this.load.image(
      ASSETS.HUMAN_FEMALE_BASE_PROFILE_RIGHT,
      "assets/images/characters/human/female/base-profile-right.png"
    );
    this.load.image(
      ASSETS.HUMAN_FEMALE_BASE_BACK,
      "assets/images/characters/human/female/base-back.png"
    );
    this.load.image(
      ASSETS.ELF_BASE_FRONT,
      "assets/images/characters/elf/male/base-front.png"
    );
    this.load.image(
      ASSETS.ELF_BASE_PROFILE_LEFT,
      "assets/images/characters/elf/male/base-profile-left.png"
    );
    this.load.image(
      ASSETS.ELF_BASE_PROFILE_RIGHT,
      "assets/images/characters/elf/male/base-profile-right.png"
    );
    this.load.image(
      ASSETS.ELF_BASE_BACK,
      "assets/images/characters/elf/male/base-back.png"
    );
    this.load.image(
      ASSETS.ELF_FEMALE_BASE_FRONT,
      "assets/images/characters/elf/female/base-front.png"
    );
    this.load.image(
      ASSETS.ELF_FEMALE_BASE_PROFILE_LEFT,
      "assets/images/characters/elf/female/base-profile-left.png"
    );
    this.load.image(
      ASSETS.ELF_FEMALE_BASE_PROFILE_RIGHT,
      "assets/images/characters/elf/female/base-profile-right.png"
    );
    this.load.image(
      ASSETS.ELF_FEMALE_BASE_BACK,
      "assets/images/characters/elf/female/base-back.png"
    );
    const bodyViews = {
      front: "front",
      profileLeft: "profile-left",
      profileRight: "profile-right",
      back: "back",
    };
    ["male", "female"].forEach((gender) => {
      Object.entries(bodyViews).forEach(([viewId, fileView]) => {
        const key = `body_human_${gender}_${viewId}`;
        const path = `assets/images/characters/bodies/human/${gender}/body_human_${gender}_${fileView}.png`;
        this.load.image(key, path);
        const elfKey = `body_elf_${gender}_${viewId}`;
        this.load.image(elfKey, path);
      });
    });
    const headRaces = ["human", "elf"];
    const headGenders = ["male", "female"];
    const headVariants = ["head-1", "head-2"];
    const headViews = ["front", "profile-left", "profile-right", "back"];
    headRaces.forEach((race) => {
      headGenders.forEach((gender) => {
        headVariants.forEach((variant) => {
          headViews.forEach((view) => {
            const viewId =
              view === "profile-left"
                ? "profileLeft"
                : view === "profile-right"
                  ? "profileRight"
                  : view;
            const key = `head_${race}_${gender}_${variant}_${viewId}`;
            const fileName = `head_${race}_${gender}_${variant}_${view}.png`;
            const path = `assets/images/characters/heads/${race}/${gender}/${variant}/${fileName}`;
            this.load.image(key, path);
          });
        });
      });
    });
    this.load.json("characters", "assets/data/characters.json");
    this.load.json("default_names", "assets/data/default-names.json");
    LANGUAGES.forEach((lang) => loadLanguage(this, lang));
  }

  create() {
    initLanguage(this);
    this.scene.start(SCENES.SPLASH);
  }
}
