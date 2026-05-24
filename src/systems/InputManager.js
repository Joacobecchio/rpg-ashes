import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { PLAYER } from "../constants.js";

export default class InputManager {
  constructor(scene) {
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });
    this.attackKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  getMovement() {
    const speed = this.keys.shift.isDown
      ? PLAYER.SPRINT_SPEED
      : PLAYER.BASE_SPEED;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.keys.left.isDown) vx = -speed;
    if (this.cursors.right.isDown || this.keys.right.isDown) vx = speed;
    if (this.cursors.up.isDown || this.keys.up.isDown) vy = -speed;
    if (this.cursors.down.isDown || this.keys.down.isDown) vy = speed;

    return { vx, vy, speed };
  }

  isAttackJustDown() {
    return Phaser.Input.Keyboard.JustDown(this.attackKey);
  }
}
