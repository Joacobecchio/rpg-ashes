import { CLASSES } from "./ClassSystem.js";
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

export const EVOLUTION_LEVEL = 20;

export const HUMAN_MASTER_TALENT = {
  id: "humanMaster",
  name: "Talento Maestro Humano",
  unlockLevel: EVOLUTION_LEVEL,
  bonusStatPointsPerLevel: 1,
  description: "Punto extra por nivel y acceso a skills hibridas.",
};

export const EVOLUTION_QUESTS = {
  warrior: {
    quest: "El Juicio del Acero",
    location: "La Fortaleza del Primer Juramento",
    boss: "El Guardian del Juramento",
  },
  barbarian: {
    quest: "La Prueba de la Sangre",
    location: "El Crater de los Ancestros",
    boss: "El Devorador de Corazones",
  },
  paladin: {
    quest: "El Fuego del Credo",
    location: "La Catedral en Ruinas",
    boss: "El Angel Caido",
  },
  mage: {
    quest: "El Concilio de los Elementos",
    location: "El Nexo del Caos",
    boss: "El Avatar Elemental",
  },
  warlock: {
    quest: "El Pacto Prohibido",
    location: "El Abismo Susurrante",
    boss: "El Heraldo del Vacio",
  },
  necromancer: {
    quest: "El Trono de Huesos",
    location: "La Ciudad Muerta",
    boss: "El Liche Eterno",
  },
  rogue: {
    quest: "La Sombra del Silencio",
    location: "El Santuario del Olvido",
    boss: "El Maestro de las Mil Cuchillas",
  },
  archer: {
    quest: "El Juramento del Cazador",
    location: "El Bosque de las Bestias Antiguas",
    boss: "El Gran Depredador",
  },
  druid: {
    quest: "El Corazon del Bosque",
    location: "El Arbol del Mundo",
    boss: "El Espiritu Primordial",
  },
};

export const EVOLUTIONS = {
  warrior: [
    {
      id: "knight",
      name: "Caballero",
      modifiers: { vit: 0.35, armor: 0.5, hp: 0.2 },
      passives: {},
      skills: [],
    },
    {
      id: "weaponMaster",
      name: "Maestro de Armas",
      modifiers: { str: 0.4, dex: 0.3, critChanceBonus: 0.1 },
      passives: {},
      skills: [],
    },
  ],
  barbarian: [
    {
      id: "berserker",
      name: "Berserker",
      modifiers: { str: 0.5, dex: 0.2, hp: -0.1 },
      passives: { lowHpDamageBonus: 0.2 },
      skills: [],
    },
    {
      id: "breaker",
      name: "Rompe-lineas",
      modifiers: { vit: 0.4, str: 0.25, armor: 0.2 },
      passives: {},
      skills: [],
    },
  ],
  paladin: [
    {
      id: "templar",
      name: "Templario",
      modifiers: { armor: 0.35, mres: 0.35, hp: 0.2 },
      passives: {},
      skills: [],
    },
    {
      id: "inquisitor",
      name: "Inquisidor",
      modifiers: { str: 0.3, int: 0.3, mres: 0.2 },
      passives: {},
      skills: [],
    },
  ],
  mage: [
    {
      id: "elementalist",
      name: "Elementalista",
      modifiers: { int: 0.4, mp: 0.3 },
      passives: {},
      skills: ["magicBolt"],
    },
    {
      id: "chronomancer",
      name: "Cronomante",
      modifiers: { int: 0.25, dex: 0.2, mres: 0.2 },
      passives: {},
      skills: ["magicBolt"],
    },
  ],
  warlock: [
    {
      id: "voidWarlock",
      name: "Brujo del Vacio",
      modifiers: { int: 0.35, mres: 0.2 },
      passives: {},
      skills: ["magicBolt"],
    },
    {
      id: "demonSummoner",
      name: "Invocador Demonico",
      modifiers: { int: 0.3, vit: 0.2 },
      passives: {},
      skills: ["magicBolt"],
    },
  ],
  necromancer: [
    {
      id: "lordOfDead",
      name: "Senor de los Muertos",
      modifiers: { int: 0.25, vit: 0.2 },
      passives: { lifeStealPct: 0.1 },
      skills: ["magicBolt"],
    },
    {
      id: "lich",
      name: "Lich",
      modifiers: { int: 0.6, hp: -0.2, mres: 0.3 },
      passives: { lifeStealPct: 0.2 },
      skills: ["magicBolt"],
    },
  ],
  rogue: [
    {
      id: "assassin",
      name: "Asesino",
      modifiers: { dex: 0.4, str: 0.2, critChanceBonus: 0.15 },
      passives: {},
      skills: [],
    },
    {
      id: "shadow",
      name: "Sombra",
      modifiers: { dex: 0.3, mres: 0.2 },
      passives: {},
      skills: [],
    },
  ],
  archer: [
    {
      id: "sniper",
      name: "Francotirador",
      modifiers: { dex: 0.5, str: 0.2, critChanceBonus: 0.1 },
      passives: {},
      skills: [],
    },
    {
      id: "beastmaster",
      name: "Maestro de Bestias",
      modifiers: { dex: 0.2, vit: 0.2 },
      passives: {},
      skills: [],
    },
  ],
  druid: [
    {
      id: "shapeshifter",
      name: "Cambiaformas",
      modifiers: { vit: 0.3, str: 0.2 },
      passives: {},
      skills: [],
    },
    {
      id: "ancestralShaman",
      name: "Chaman Ancestral",
      modifiers: { int: 0.3, mres: 0.2 },
      passives: {},
      skills: ["magicBolt"],
    },
  ],
};

function resolveSkills(list = []) {
  return list.map((id) => SKILLS[id]).filter(Boolean);
}

function getRace(entity) {
  return entity.race || RACES.human;
}

function getFaction(entity) {
  return entity.faction || FACTIONS.neutral;
}

function getBaseClass(entity) {
  return CLASSES[entity.baseClassId] || CLASSES.warrior;
}

export function canEvolve(entity) {
  const race = getRace(entity);
  if (race.canEvolve === false) return false;
  if (!entity.stats || entity.stats.level < EVOLUTION_LEVEL) return false;
  if (entity.evolutionId) return false;
  return !!entity.evolutionQuestCompleted;
}

export function getEvolutionOptions(entity) {
  const baseClassId = entity.baseClassId;
  return EVOLUTIONS[baseClassId] || [];
}

export function getEvolutionQuest(entity) {
  const baseClassId = entity.baseClassId;
  return EVOLUTION_QUESTS[baseClassId] || null;
}

export function tryUnlockEvolution(entity) {
  if (!canEvolve(entity)) return [];
  entity.evolutionReady = true;
  return getEvolutionOptions(entity);
}

export function tryUnlockHumanTalent(entity) {
  const race = getRace(entity);
  if (race.canEvolve !== false) return null;
  if (!entity.stats || entity.stats.level < HUMAN_MASTER_TALENT.unlockLevel) return null;
  if (entity.humanMasterTalentUnlocked) return null;

  entity.humanMasterTalentUnlocked = true;
  entity.humanBonusStatPointsPerLevel = HUMAN_MASTER_TALENT.bonusStatPointsPerLevel;
  return HUMAN_MASTER_TALENT;
}

export function applyEvolution(entity, evolutionId) {
  const options = getEvolutionOptions(entity);
  const evolution = options.find((opt) => opt.id === evolutionId);
  if (!evolution) return false;

  const baseClass = getBaseClass(entity);
  const race = getRace(entity);
  const faction = getFaction(entity);
  const equipmentList = Array.isArray(entity.equipment)
    ? entity.equipment
    : (entity.equipment || []).map((id) => EQUIPMENT[id]).filter(Boolean);
  const equipmentBonus = getEquipmentBonus(equipmentList);

  const baseApplied = applyClassModifiers(race.base, baseClass.modifiers);
  const evolvedApplied = applyClassModifiers(baseApplied.base, evolution.modifiers);

  const baseWithBonuses = applyStatBonuses(
    evolvedApplied.base,
    faction?.bonus,
    equipmentBonus
  );
  const stats = createStats({ level: entity.stats.level, ...baseWithBonuses });
  applyDerivedBonuses(stats, baseApplied.derivedBonus);
  applyDerivedBonuses(stats, evolvedApplied.derivedBonus);
  applyDerivedBonuses(stats, {
    critChance: equipmentBonus.critChance,
    magicCritChance: equipmentBonus.magicCritChance,
    critMultiplier: equipmentBonus.critMultiplier,
    maxHp: equipmentBonus.maxHp,
    maxMp: equipmentBonus.maxMp,
  });

  entity.stats = stats;
  entity.evolutionId = evolution.id;
  entity.evolutionReady = false;
  entity.passives = { ...baseClass.passives, ...evolution.passives };
  entity.skills = resolveSkills([...(baseClass.skills || []), ...(evolution.skills || [])]);
  entity.attackType = baseClass.attackType;

  return true;
}
