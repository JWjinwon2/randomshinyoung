import type { CollectionState, Pet } from '../types/domain';

export interface GameState {
  view: 'loading' | 'menu' | 'login' | 'register' | 'archive' | 'play';
  pet: Pet | null;
  collection: CollectionState;
  message: string;
}

export const initialState: GameState = {
  view: 'loading',
  pet: null,
  collection: { titles: [], rarities: [], achievements: [] },
  message: '랜덤시녕 서버에 접속 중...'
};
