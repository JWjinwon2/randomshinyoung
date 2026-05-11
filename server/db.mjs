import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import { MOODS, RARITIES, TITLES, randomMood, todayKey } from './game.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultDbPath = resolve(root, 'random-shinyeong.sqlite');
const dbPath = resolve(process.env.DATABASE_PATH ?? defaultDbPath);
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec(readFileSync(resolve(root, 'docs/schema.sql'), 'utf8'));

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((item) => item.name);
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

ensureColumn('pets', 'daily_xp', 'INTEGER NOT NULL DEFAULT 0');
ensureColumn('pets', 'daily_xp_date', 'TEXT');
ensureColumn('pets', 'owner_message', "TEXT NOT NULL DEFAULT ''");
db.prepare('UPDATE pets SET daily_xp_date = ? WHERE daily_xp_date IS NULL').run(todayKey());

const iterations = Number(process.env.PBKDF2_ITERATIONS ?? 210000);

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, salt, expectedHash) {
  const actual = Buffer.from(hashPassword(password, salt).hash, 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function normalizePetName(name) {
  const compact = String(name ?? '').trim().replace(/\s+/g, '');
  if (!compact) return '';
  return compact.endsWith('시녕') ? compact : `${compact}시녕`;
}

export function rowToPet(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    xp: row.xp,
    dailyXp: row.daily_xp,
    dailyXpDate: row.daily_xp_date,
    ownerMessage: row.owner_message,
    title: row.title,
    rarity: row.rarity,
    titleRolls: row.title_rolls,
    rarityRolls: row.rarity_rolls,
    mood: row.mood,
    moodDate: row.mood_date,
    interactionCount: row.interaction_count,
    patCount: row.pat_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function getPetById(id) {
  refreshMood(id);
  return rowToPet(db.prepare('SELECT * FROM pets WHERE id = ?').get(id));
}

export function getPetByName(name) {
  return db.prepare('SELECT * FROM pets WHERE lower(name) = lower(?)').get(normalizePetName(name));
}

export function createPet(name, password, ownerMessage = '') {
  const cleanName = normalizePetName(name);
  const cleanOwnerMessage = String(ownerMessage ?? '').trim().slice(0, 80);
  if (cleanName.length < 2 || cleanName.length > 18) {
    throw new Error('이름은 2~18자로 입력해 주세요.');
  }
  if (password.length < 4) throw new Error('비밀번호는 4자 이상이어야 합니다.');
  if (getPetByName(cleanName)) throw new Error('이미 존재하는 이름입니다.');
  const { salt, hash } = hashPassword(password);
  const mood = randomMood();
  const result = db.prepare(`
    INSERT INTO pets (name, password_hash, password_salt, owner_message, mood, mood_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(cleanName, hash, salt, cleanOwnerMessage, mood.name, todayKey());
  const petId = Number(result.lastInsertRowid);
  addCollection(petId, null, '노멀');
  return getPetById(petId);
}

export function refreshMood(petId) {
  const row = db.prepare('SELECT mood_date, daily_xp_date FROM pets WHERE id = ?').get(petId);
  if (!row) return;
  const today = todayKey();
  if (row.mood_date !== today) {
    const mood = randomMood();
    db.prepare('UPDATE pets SET mood = ?, mood_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(mood.name, today, petId);
  }
  if (row.daily_xp_date !== today) {
    db.prepare('UPDATE pets SET daily_xp = 0, daily_xp_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(today, petId);
  }
}

export function updatePetProgress(id, patch) {
  db.prepare(`
    UPDATE pets
    SET level = ?, xp = ?, title_rolls = ?, rarity_rolls = ?,
        daily_xp = ?, daily_xp_date = ?,
        interaction_count = ?, pat_count = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    patch.level,
    patch.xp,
    patch.titleRolls,
    patch.rarityRolls,
    patch.dailyXp,
    patch.dailyXpDate,
    patch.interactionCount,
    patch.patCount,
    id
  );
  return getPetById(id);
}

export function updateOwnerMessage(id, ownerMessage) {
  const cleanOwnerMessage = String(ownerMessage ?? '').trim().slice(0, 80);
  db.prepare('UPDATE pets SET owner_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(cleanOwnerMessage, id);
  return getPetById(id);
}

export function setTitle(id, title) {
  if (!TITLES.includes(title)) throw new Error('지원하지 않는 칭호입니다.');
  const pet = getPetById(id);
  if (!pet || pet.titleRolls <= 0) throw new Error('칭호 변경 기회가 없습니다.');
  db.prepare('UPDATE pets SET title = ?, title_rolls = title_rolls - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(title, id);
  addCollection(id, title, null);
  return getPetById(id);
}

export function setRarity(id, rarity) {
  if (!RARITIES.includes(rarity)) throw new Error('지원하지 않는 희귀도입니다.');
  const pet = getPetById(id);
  if (!pet || pet.rarityRolls <= 0) throw new Error('희귀도 변경 기회가 없습니다.');
  db.prepare('UPDATE pets SET rarity = ?, rarity_rolls = rarity_rolls - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(rarity, id);
  addCollection(id, null, rarity);
  return getPetById(id);
}

export function addCollection(petId, title, rarity) {
  if (title) db.prepare('INSERT OR IGNORE INTO collection_titles (pet_id, title) VALUES (?, ?)').run(petId, title);
  if (rarity) db.prepare('INSERT OR IGNORE INTO collection_rarities (pet_id, rarity) VALUES (?, ?)').run(petId, rarity);
}

export function unlockAchievement(petId, code, label) {
  db.prepare('INSERT OR IGNORE INTO achievements (pet_id, code, label) VALUES (?, ?, ?)').run(petId, code, label);
}

export function getCollections(petId) {
  return {
    titles: db.prepare('SELECT title, acquired_at AS acquiredAt FROM collection_titles WHERE pet_id = ? ORDER BY acquired_at DESC').all(petId),
    rarities: db.prepare('SELECT rarity, acquired_at AS acquiredAt FROM collection_rarities WHERE pet_id = ? ORDER BY acquired_at DESC').all(petId),
    achievements: db.prepare('SELECT code, label, unlocked_at AS unlockedAt FROM achievements WHERE pet_id = ? ORDER BY unlocked_at DESC').all(petId)
  };
}

export function listPets({ search = '', rarity = '' }) {
  const rows = db.prepare(`
    SELECT id, name, level, title, rarity, owner_message, created_at
    FROM pets
    WHERE (? = '' OR lower(name) LIKE '%' || lower(?) || '%')
      AND (? = '' OR rarity = ?)
    ORDER BY level DESC, xp DESC, created_at ASC
  `).all(search, search, rarity, rarity);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    level: row.level,
    title: row.title,
    rarity: row.rarity,
    ownerMessage: row.owner_message,
    createdAt: row.created_at
  }));
}

export function createSession(petId) {
  const token = randomBytes(32).toString('hex');
  const days = Number(process.env.SESSION_DAYS ?? 14);
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (token, pet_id, expires_at) VALUES (?, ?, ?)').run(token, petId, expires);
  return { token, expiresAt: expires };
}

export function getSession(token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT sessions.pet_id AS petId
    FROM sessions
    WHERE token = ? AND datetime(expires_at) > datetime('now')
  `).get(token);
  return row ?? null;
}

export function deleteSession(token) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}
