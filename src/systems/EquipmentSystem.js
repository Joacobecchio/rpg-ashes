export const EQUIPMENT = {
  woodenSword: {
    name: "Espada de madera",
    bonus: { str: 1 },
  },
  leatherArmor: {
    name: "Armadura de cuero",
    bonus: { vit: 1, armor: 2 },
  },
  wardAmulet: {
    name: "Amuleto de protección",
    bonus: { int: 1, mres: 2 },
  },
};

export function getEquipmentBonus(items = []) {
  const total = {
    hp: 0,
    mp: 0,
    str: 0,
    dex: 0,
    int: 0,
    vit: 0,
    armor: 0,
    mres: 0,
    critChance: 0,
    magicCritChance: 0,
    critMultiplier: 0,
    maxHp: 0,
    maxMp: 0,
  };

  for (const item of items) {
    if (!item || !item.bonus) continue;
    for (const key of Object.keys(total)) {
      total[key] += item.bonus[key] || 0;
    }
  }

  return total;
}
