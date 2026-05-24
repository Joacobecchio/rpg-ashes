import Enemy from "../entities/Enemy.js";
import Player from "../entities/Player.js";

export function createPlayer(
  scene,
  x,
  y,
  {
    stats,
    attackType = "melee",
    race,
    faction,
    equipment = [],
    classId = null,
    baseClassId = null,
    passives = {},
    skills = [],
    evolutionId = null,
    evolutionQuestCompleted = false,
    humanMasterTalentUnlocked = false,
    humanBonusStatPointsPerLevel = 0,
  }
) {
  return new Player(scene, x, y, {
    stats,
    attackType,
    race,
    faction,
    equipment,
    classId,
    baseClassId,
    evolutionId,
    evolutionQuestCompleted,
    humanMasterTalentUnlocked,
    humanBonusStatPointsPerLevel,
    passives,
    skills,
  });
}

export function createEnemy(
  scene,
  x,
  y,
  {
    stats,
    attackType = "melee",
    race,
    faction,
    equipment = [],
    classId = null,
    baseClassId = null,
    passives = {},
    skills = [],
    evolutionId = null,
    evolutionQuestCompleted = false,
    humanMasterTalentUnlocked = false,
    humanBonusStatPointsPerLevel = 0,
  }
) {
  return new Enemy(scene, x, y, {
    stats,
    attackType,
    race,
    faction,
    equipment,
    classId,
    baseClassId,
    evolutionId,
    evolutionQuestCompleted,
    humanMasterTalentUnlocked,
    humanBonusStatPointsPerLevel,
    passives,
    skills,
  });
}
