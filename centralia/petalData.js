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
    common: { dmg: 16, hp: 12, heal: 1, reload: 1.8 },
    unusual: { dmg: 48, hp: 36, heal: 2, reload: 1.8 },
    rare: { dmg: 144, hp: 108, heal: 6, reload: 1.8 },
    epic: { dmg: 432, hp: 324, heal: 18, reload: 1.8 },
    legendary: { dmg: 1296, hp: 972, heal: 54, reload: 1.8 },
    mythic: { dmg: 3888, hp: 2916, heal: 162, reload: 1.8 },
    ultra: { dmg: 11664, hp: 8748, heal: 486, reload: 1.8 },
    super: { dmg: 34992, hp: 26244, heal: 1458, reload: 1.8 }
  },

  light: {
    common: { dmg: 13, hp: 5 },
    unusual: { dmg: 19.5, hp: 7.5, copies: 2, reload: 0.8 },
    rare: { dmg: 58.5, hp: 22.5, copies: 2, reload: 0.8 },
    epic: { dmg: 117, hp: 45, copies: 3, reload: 0.8 },
    legendary: { dmg: 351, hp: 135, copies: 3, reload: 0.8 },
    mythic: { dmg: 631.8, hp: 243, copies: 5, reload: 0.8 },
    ultra: { dmg: 1895.4, hp: 729, copies: 5, reload: 0.8 },
    super: { dmg: 5686.2, hp: 2187, copies: 5, reload: 0.8 }
  },

  rice: {
    common: { dmg: 4, hp: 1, reload: 0.05 },
    unusual: { dmg: 12, hp: 3, reload: 0.05 },
    rare: { dmg: 36, hp: 9, reload: 0.05 },
    epic: { dmg: 108, hp: 27, reload: 0.05 },
    legendary: { dmg: 324, hp: 81, reload: 0.05 },
    mythic: { dmg: 972, hp: 243, reload: 0.05 },
    ultra: { dmg: 2916, hp: 729, reload: 0.05 },
    super: { dmg: 8748, hp: 2187, reload: 0.05 }
  }
};
