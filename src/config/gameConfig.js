import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { GAME } from "../constants.js";
import PreloadScene from "../scenes/PreloadScene.js";
import SplashScene from "../scenes/SplashScene.js";
import MainMenuScene from "../scenes/MainMenuScene.js";
import SettingsScene from "../scenes/SettingsScene.js";
import CharacterCreationScene from "../scenes/CharacterCreationScene.js";
import GameScene from "../scenes/GameScene.js";

const gameConfig = {
  type: Phaser.AUTO,
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    PreloadScene,
    SplashScene,
    MainMenuScene,
    SettingsScene,
    CharacterCreationScene,
    GameScene,
  ],
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
  },
  dom: {
    createContainer: true,
  },
};

export default gameConfig;
