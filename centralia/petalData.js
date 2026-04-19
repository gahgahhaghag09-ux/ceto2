export const rarities = [
  "common", "unusual", "rare", "epic",
  "legendary", "mythic", "ultra", "super"
];

export const petals = {
  air: {
    common: {},
    unusual: {},
    rare: {},
    epic: {},
    legendary: {},
    mythic: {},
    ultra: {},
    super: {}
  },

  leaf: {
    common: { dmg: 16, hp: 12, heal: 1 },
    unusual: { dmg: 48, hp: 36, heal: 2 },
    rare: { dmg: 144, hp: 108, heal: 6 },
    epic: { dmg: 432, hp: 324, heal: 18 },
    legendary: { dmg: 1296, hp: 972, heal: 54 },
    mythic: { dmg: 3888, hp: 2916, heal: 162 },
    ultra: { dmg: 11664, hp: 8748, heal: 486 },
    super: { dmg: 34992, hp: 26244, heal: 1458 }
  },

  light: {
    common: { dmg: 13, hp: 5 },
    unusual: { dmg: 19.5, hp: 7.5, copies: 2 },
    rare: { dmg: 58.5, hp: 22.5, copies: 2 },
    epic: { dmg: 117, hp: 45, copies: 3 },
    legendary: { dmg: 351, hp: 135, copies: 3 },
    mythic: { dmg: 631.8, hp: 243, copies: 5 },
    ultra: { dmg: 1895.4, hp: 729, copies: 5 },
    super: { dmg: 5686.2, hp: 2187, copies: 5 }
  },

  rice: {
    common: { dmg: 4, hp: 1 },
    unusual: { dmg: 12, hp: 3 },
    rare: { dmg: 36, hp: 9 },
    epic: { dmg: 108, hp: 27 },
    legendary: { dmg: 324, hp: 81 },
    mythic: { dmg: 972, hp: 243 },
    ultra: { dmg: 2916, hp: 729 },
    super: { dmg: 8748, hp: 2187 }
  }
};
