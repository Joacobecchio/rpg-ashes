import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { ASSETS, ENEMY } from "../constants.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y, ASSETS.ENEMY);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(ENEMY.SCALE);
    this.setTint(0xff0000);
    this.setCollideWorldBounds(true);

    this.stats = options.stats || null;
    this.attackType = options.attackType || "melee";
    this.race = options.race || null;
    this.faction = options.faction || null;
    this.equipment = options.equipment || [];
    this.classId = options.classId || null;
    this.baseClassId = options.baseClassId || this.classId;
    this.evolutionId = options.evolutionId || null;
    this.evolutionQuestCompleted = options.evolutionQuestCompleted || false;
    this.humanMasterTalentUnlocked = options.humanMasterTalentUnlocked || false;
    this.humanBonusStatPointsPerLevel =
      options.humanBonusStatPointsPerLevel || 0;
    this.passives = options.passives || {};
    this.skills = options.skills || [];
  }
}
