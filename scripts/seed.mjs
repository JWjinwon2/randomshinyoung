import { createPet, db, hashPassword } from '../server/db.mjs';
import { addCollection, unlockAchievement } from '../server/db.mjs';

const seeds = [
  { name: '회색밈냥', password: '1234', level: 8, xp: 42, title: '수상한', rarity: '레어', title_rolls: 1, rarity_rolls: 0 },
  { name: '우다다시녕', password: '1234', level: 18, xp: 91, title: '쾌활한', rarity: '에픽', title_rolls: 0, rarity_rolls: 1 },
  { name: '초코아님', password: '1234', level: 33, xp: 140, title: '우주적인', rarity: '유니크', title_rolls: 2, rarity_rolls: 0 }
];

for (const seed of seeds) {
  const existing = db.prepare('SELECT id FROM pets WHERE name = ?').get(seed.name);
  if (existing) continue;
  const { salt, hash } = hashPassword(seed.password);
  const result = db.prepare(`
    INSERT INTO pets
      (name, password_hash, password_salt, level, xp, title, rarity, title_rolls, rarity_rolls, mood, mood_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '밈중독', date('now'))
  `).run(seed.name, hash, salt, seed.level, seed.xp, seed.title, seed.rarity, seed.title_rolls, seed.rarity_rolls);
  const id = Number(result.lastInsertRowid);
  addCollection(id, seed.title, seed.rarity);
  addCollection(id, '행복한', '노멀');
  if (seed.level >= 18) unlockAchievement(id, 'seed_veteran', '시드 베테랑');
}

console.log('초기 랜덤시녕 데이터가 준비되었습니다. 기본 비밀번호는 모두 1234 입니다.');
