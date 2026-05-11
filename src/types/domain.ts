export type Rarity = '노멀' | '레어' | '에픽' | '유니크' | '레전더리' | '초초초';

export interface Pet {
  id: number;
  name: string;
  displayName: string;
  level: number;
  xp: number;
  requiredXp: number;
  dailyXp: number;
  dailyXpDate: string;
  dailyXpLimit: number;
  ownerMessage: string;
  title: string | null;
  rarity: Rarity;
  titleRolls: number;
  rarityRolls: number;
  mood: string;
  moodInfo: {
    name: string;
    bonus: number;
    line: string;
  };
  interactionCount: number;
  patCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionState {
  titles: Array<{ title: string; acquiredAt: string }>;
  rarities: Array<{ rarity: Rarity; acquiredAt: string }>;
  achievements: Array<{ code: string; label: string; unlockedAt: string }>;
}
