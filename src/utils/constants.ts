// strong typing the scene ids
export const Scenes = ['splash', 'aceOfShadows', 'magicWords', 'phoenixFlame'] as const;

export type SceneID = (typeof Scenes)[number];

// background colors
export const Colors = {
  TEAL: 0x43d6dc,
  BLUE: 0xc7e8f3,
  YELLOW: 0xf1dc62,
  DARK_GREEN: 0x006e1b,
};
