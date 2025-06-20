export type Size = {
  width: number;
  height: number;
};

/**
 * Dialogue data
 */
export type DialogueData = {
  name: string;
  text: string;
};

export type EmojiData = {
  name: string;
  url: string;
};

export type AvatarData = {
  name: string;
  url: string;
  position: 'left' | 'right';
};

export type MagicWordsData = {
  dialogue: DialogueData[];
  emojies: EmojiData[];
  avatars: AvatarData[];
};
