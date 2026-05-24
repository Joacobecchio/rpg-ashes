import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { ASSETS, PLAYER } from "../constants.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y, ASSETS.PLAYER);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(PLAYER.SCALE);
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
    this.displayName = options.name || "Heroe";
    this.humanMasterTalentUnlocked = options.humanMasterTalentUnlocked || false;
    this.humanBonusStatPointsPerLevel =
      options.humanBonusStatPointsPerLevel || 0;
    this.passives = options.passives || {};
    this.skills = options.skills || [];
  }

  setMovement(vx, vy, speed) {
    this.setVelocity(vx, vy);
    if (vx !== 0 || vy !== 0) {
      this.body.velocity.normalize().scale(speed);
    }
  }
}
