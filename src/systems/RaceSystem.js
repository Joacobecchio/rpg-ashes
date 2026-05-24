export const RACES = {
  human: {
    nameKey: "race.human",
    base: { hp: 800, mp: 300, str: 10, dex: 10, int: 10, vit: 10, armor: 10, mres: 10 },
    canEvolve: false,
  },
  elf: {
    nameKey: "race.elf",
    base: { hp: 600, mp: 500, str: 6, dex: 12, int: 14, vit: 7, armor: 6, mres: 14 },
    canEvolve: true,
  },
  dwarf: {
    nameKey: "race.dwarf",
    base: { hp: 1000, mp: 200, str: 14, dex: 6, int: 6, vit: 14, armor: 16, mres: 8 },
    canEvolve: true,
  },
  orc: {
    nameKey: "race.orc",
    base: { hp: 1100, mp: 150, str: 16, dex: 8, int: 4, vit: 14, armor: 14, mres: 6 },
    canEvolve: true,
  },
  draconic: {
    nameKey: "race.draconic",
    base: { hp: 850, mp: 400, str: 12, dex: 8, int: 12, vit: 10, armor: 10, mres: 14 },
    canEvolve: true,
  },
  gnome: {
    nameKey: "race.gnome",
    base: { hp: 550, mp: 600, str: 4, dex: 12, int: 16, vit: 6, armor: 5, mres: 16 },
    canEvolve: true,
  },
};
