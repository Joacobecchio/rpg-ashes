export function createStats({
  level = 1,
  hp = 100,
  mp = 50,
  str = 5,
  dex = 5,
  int = 5,
  vit = 5,
  armor = 0,
  mres = 0,
} = {}) {
  const maxHp = Math.max(1, Math.floor(hp + (level - 1) * vit * 5));
  const maxMp = Math.max(0, Math.floor(mp + (level - 1) * int * 3));
  const critChance = Math.min(0.5, 0.05 + dex * 0.003);
  const magicCritChance = Math.min(0.5, 0.05 + int * 0.003);
  const critMultiplier = 1.5;

  return {
    level,
    str,
    dex,
    int,
    vit,
    maxHp,
    hp: maxHp,
    maxMp,
    mp: maxMp,
    armor,
    mres,
    critChance,
    magicCritChance,
    critMultiplier,
    xp: 0,
    xpToNext: getXpToNext(level),
  };
}

export function computeDamage(attacker, defender, attackType = "melee") {
  const atkPower =
    attackType === "magic"
      ? attacker.int * 2.2 + attacker.level * 1.5
      : attacker.str * 2.0 + attacker.dex * 0.6 + attacker.level * 1.2;

  const mitigation =
    attackType === "magic" ? defender.mres * 0.9 : defender.armor * 0.9;
  const variance = 0.85 + Math.random() * 0.3;
  const base = (atkPower - mitigation) * variance;
  const critChance =
    attackType === "magic" ? attacker.magicCritChance : attacker.critChance;
  const isCrit = Math.random() < critChance;
  const raw = isCrit ? base * attacker.critMultiplier : base;

  return { damage: Math.max(1, Math.floor(raw)), isCrit };
}

export function applyStatBonuses(base = {}, ...bonuses) {
  const result = { ...base };
  const keys = ["hp", "mp", "str", "dex", "int", "vit", "armor", "mres"];

  for (const bonus of bonuses) {
    if (!bonus) continue;
    for (const key of keys) {
      result[key] = (result[key] || 0) + (bonus[key] || 0);
    }
  }

  return result;
}

export function applyClassModifiers(base = {}, modifiers = {}) {
  const result = { ...base };
  const keys = ["hp", "mp", "str", "dex", "int", "vit", "armor", "mres"];
  for (const key of keys) {
    if (modifiers[key] == null) continue;
    result[key] = Math.floor(result[key] * (1 + modifiers[key]));
  }

  const derivedBonus = {};
  if (modifiers.critChanceBonus) {
    derivedBonus.critChance = modifiers.critChanceBonus;
  }
  if (modifiers.magicCritChanceBonus) {
    derivedBonus.magicCritChance = modifiers.magicCritChanceBonus;
  }

  return { base: result, derivedBonus };
}

export function applyDerivedBonuses(stats, bonus = {}) {
  const keys = [
    "critChance",
    "magicCritChance",
    "critMultiplier",
    "maxHp",
    "maxMp",
  ];
  for (const key of keys) {
    if (bonus[key] != null) {
      stats[key] += bonus[key];
    }
  }
  if (bonus.maxHp != null) {
    stats.hp = Math.min(stats.hp + bonus.maxHp, stats.maxHp);
  }
  if (bonus.maxMp != null) {
    stats.mp = Math.min(stats.mp + bonus.maxMp, stats.maxMp);
  }
}

export function getXpToNext(level) {
  return 40 + level * 25;
}

export function gainXp(stats, amount = 0) {
  let levelsGained = 0;
  stats.xp += amount;
  while (stats.xp >= stats.xpToNext) {
    stats.xp -= stats.xpToNext;
    stats.level += 1;
    stats.xpToNext = getXpToNext(stats.level);
    stats.maxHp += stats.vit * 5;
    stats.maxMp += stats.int * 3;
    stats.armor += Math.floor(stats.vit * 0.4);
    stats.mres += Math.floor(stats.int * 0.4);
    stats.critChance = Math.min(0.5, 0.05 + stats.dex * 0.003);
    stats.magicCritChance = Math.min(0.5, 0.05 + stats.int * 0.003);
    stats.hp = stats.maxHp;
    stats.mp = stats.maxMp;
    levelsGained += 1;
  }
  return levelsGained;
}
