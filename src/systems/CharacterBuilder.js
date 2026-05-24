import { CLASSES } from "./ClassSystem.js";
import { createEnemy, createPlayer } from "./CharacterFactory.js";
import { EQUIPMENT, getEquipmentBonus } from "./EquipmentSystem.js";
import { FACTIONS } from "./FactionSystem.js";
import { RACES } from "./RaceSystem.js";
import { SKILLS } from "./SkillsSystem.js";
import {
  applyClassModifiers,
  applyDerivedBonuses,
  applyStatBonuses,
  createStats,
} from "./StatsSystem.js";

const DEFAULT_ENEMY_BASE = {
  hp: 500,
  mp: 100,
  str: 5,
  dex: 4,
  int: 2,
  vit: 5,
  armor: 5,
  mres: 5,
};

export default class CharacterBuilder {
  constructor(scene, dataKey = "characters") {
    this.scene = scene;
    this.dataKey = dataKey;
  }

  getData() {
    return this.scene.cache.json.get(this.dataKey) || {};
  }

  getTemplate(section, id) {
    const data = this.getData();
    const group = data[section] || {};
    return group[id] || null;
  }

  resolveClass(id) {
    return CLASSES[id] || CLASSES.warrior;
  }

  resolveRace(id) {
    return RACES[id] || RACES.human;
  }

  resolveFaction(id) {
    return FACTIONS[id] || FACTIONS.neutral;
  }

  resolveEquipment(list = []) {
    return list.map((id) => EQUIPMENT[id]).filter(Boolean);
  }

  resolveSkills(list = []) {
    return list.map((id) => SKILLS[id]).filter(Boolean);
  }

  getPreviewStats({ raceId, classId, factionId, level = 1, equipmentIds = [] }) {
    const race = this.resolveRace(raceId);
    const faction = this.resolveFaction(factionId);
    const playerClass = this.resolveClass(classId);
    const equipment = this.resolveEquipment(equipmentIds);

    return this.buildStats({
      level,
      race,
      faction,
      classModifiers: playerClass.modifiers,
      equipment,
    });
  }

  buildPlayerFromConfig(config, x, y) {
    const raceId = config.raceId || "human";
    const classId = config.classId || "warrior";
    const factionId = config.factionId || "neutral";
    const level = config.level || 1;
    const equipmentIds = config.equipmentIds || [];
    const name = config.name || "Heroe";

    const race = this.resolveRace(raceId);
    const faction = this.resolveFaction(factionId);
    const playerClass = this.resolveClass(classId);
    const equipment = this.resolveEquipment(equipmentIds);
    const skills = this.resolveSkills(playerClass.skills || []);
    const stats = this.buildStats({
      level,
      race,
      faction,
      classModifiers: playerClass.modifiers,
      equipment,
    });

    return createPlayer(this.scene, x, y, {
      stats,
      race,
      faction,
      equipment,
      attackType: playerClass.attackType,
      classId,
      baseClassId: classId,
      passives: playerClass.passives || {},
      skills,
      evolutionQuestCompleted: false,
      name,
    });
  }

  buildStats({ level, race, faction, classModifiers, equipment }) {
    const { base, derivedBonus } = applyClassModifiers(
      race.base,
      classModifiers
    );
    const equipmentBonus = getEquipmentBonus(equipment);
    const baseWithBonuses = applyStatBonuses(
      base,
      faction?.bonus,
      equipmentBonus
    );
    const stats = createStats({ level, ...baseWithBonuses });

    const derivedFromEquipment = {
      critChance: equipmentBonus.critChance,
      magicCritChance: equipmentBonus.magicCritChance,
      critMultiplier: equipmentBonus.critMultiplier,
      maxHp: equipmentBonus.maxHp,
      maxMp: equipmentBonus.maxMp,
    };
    applyDerivedBonuses(stats, derivedBonus);
    applyDerivedBonuses(stats, derivedFromEquipment);

    return stats;
  }

  buildPlayer(id, x, y) {
    const template = this.getTemplate("players", id) || {};
    const classId = template.class;
    const playerClass = this.resolveClass(classId);
    const race = this.resolveRace(template.race);
    const faction = this.resolveFaction(template.faction);
    const level = template.level || 1;
    const equipment = this.resolveEquipment(template.equipment);
    const skills = this.resolveSkills(playerClass.skills || []);
    const stats = this.buildStats({
      level,
      race,
      faction,
      classModifiers: playerClass.modifiers,
      equipment,
    });

    return createPlayer(this.scene, x, y, {
      stats,
      race,
      faction,
      equipment,
      attackType: playerClass.attackType,
      classId,
      baseClassId: classId,
      passives: playerClass.passives || {},
      skills,
      evolutionQuestCompleted: false,
    });
  }

  buildEnemy(id, x, y) {
    const template = this.getTemplate("enemies", id) || {};
    const race = this.resolveRace(template.race);
    const faction = this.resolveFaction(template.faction);
    const level = template.level || 1;
    const equipment = this.resolveEquipment(template.equipment);
    const classId = template.class || null;
    const enemyClass = classId ? this.resolveClass(classId) : null;
    const attackType = template.attackType || enemyClass?.attackType || "melee";
    const skills = enemyClass ? this.resolveSkills(enemyClass.skills || []) : [];
    const stats = enemyClass
      ? this.buildStats({
          level,
          race,
          faction,
          classModifiers: enemyClass.modifiers,
          equipment,
        })
      : (() => {
          const equipmentBonus = getEquipmentBonus(equipment);
          const base = applyStatBonuses(
            template.base || DEFAULT_ENEMY_BASE,
            faction?.bonus,
            equipmentBonus
          );
          const stats = createStats({ level, ...base });
          const derivedFromEquipment = {
            critChance: equipmentBonus.critChance,
            magicCritChance: equipmentBonus.magicCritChance,
            critMultiplier: equipmentBonus.critMultiplier,
            maxHp: equipmentBonus.maxHp,
            maxMp: equipmentBonus.maxMp,
          };
          applyDerivedBonuses(stats, derivedFromEquipment);
          return stats;
        })();

    return createEnemy(this.scene, x, y, {
      stats,
      race,
      faction,
      equipment,
      attackType,
      classId,
      baseClassId: classId,
      passives: enemyClass?.passives || {},
      skills,
      evolutionQuestCompleted: false,
    });
  }
}
