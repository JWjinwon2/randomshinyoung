import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPet,
  createSession,
  deleteSession,
  getCollections,
  getPetById,
  getPetByName,
  getSession,
  listPets,
  setRarity,
  setTitle,
  updateOwnerMessage,
  updatePetProgress,
  verifyPassword,
  unlockAchievement
} from './db.mjs';
import { INTERACTIONS, applyXp, displayName, getMood, rollInteraction, rollRarity, rollTitleOptions } from './game.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicDir = join(root, 'public');
const port = Number(process.env.PORT ?? process.argv[2] ?? 3000);
const rapidActionWindows = new Map();
const rapidActionWindowMs = 3000;
const rapidActionLimit = 3;
const dailyXpLimit = Number(process.env.DAILY_XP_LIMIT ?? 5000);

const achievements = [
  { code: 'first_touch', label: '첫 인사', test: (pet) => pet.interactionCount >= 1 },
  { code: 'interact_5', label: '다섯 번의 관심', test: (pet) => pet.interactionCount >= 5 },
  { code: 'interact_10', label: '열 번의 손길', test: (pet) => pet.interactionCount >= 10 },
  { code: 'interact_25', label: '조금 친해짐', test: (pet) => pet.interactionCount >= 25 },
  { code: 'pat_1', label: '첫 쓰다듬', test: (pet) => pet.patCount >= 1 },
  { code: 'pat_10', label: '쓰담쓰담 입문', test: (pet) => pet.patCount >= 10 },
  { code: 'daily_100', label: '오늘도 시작이 좋아', test: (pet) => pet.dailyXp >= 100 },
  { code: 'level_2', label: '레벨 2 새싹', test: (pet) => pet.level >= 2 },
  { code: 'level_5', label: '레벨 5 이름표', test: (pet) => pet.level >= 5 },
  { code: 'level_10', label: '레벨 10 첫 전환점', test: (pet) => pet.level >= 10 },

  { code: 'interact_50', label: '익숙한 루틴', test: (pet) => pet.interactionCount >= 50 },
  { code: 'interact_75', label: '손길이 쌓이는 중', test: (pet) => pet.interactionCount >= 75 },
  { code: 'interact_100', label: '백 번 돌봄', test: (pet) => pet.interactionCount >= 100 },
  { code: 'interact_150', label: '매일 보는 사이', test: (pet) => pet.interactionCount >= 150 },
  { code: 'interact_200', label: '돌봄 장인 입문', test: (pet) => pet.interactionCount >= 200 },
  { code: 'interact_300', label: '익숙한 발소리', test: (pet) => pet.interactionCount >= 300 },
  { code: 'interact_400', label: '시녕 루틴 관리자', test: (pet) => pet.interactionCount >= 400 },
  { code: 'interact_500', label: '오백 번의 관심', test: (pet) => pet.interactionCount >= 500 },
  { code: 'interact_750', label: '끈기의 주인', test: (pet) => pet.interactionCount >= 750 },
  { code: 'interact_1000', label: '천 번의 돌봄', test: (pet) => pet.interactionCount >= 1000 },
  { code: 'pat_25', label: '부드러운 손길', test: (pet) => pet.patCount >= 25 },
  { code: 'pat_50', label: '쓰다듬기 숙련자', test: (pet) => pet.patCount >= 50 },
  { code: 'pat_75', label: '골골송 수집가', test: (pet) => pet.patCount >= 75 },
  { code: 'pat100', label: '100번 쓰다듬기', test: (pet) => pet.patCount >= 100 },
  { code: 'pat_150', label: '손바닥 단골', test: (pet) => pet.patCount >= 150 },
  { code: 'daily_250', label: '오늘의 예열', test: (pet) => pet.dailyXp >= 250 },
  { code: 'daily_500', label: '하루 500 XP', test: (pet) => pet.dailyXp >= 500 },
  { code: 'daily_1000', label: '천 XP의 하루', test: (pet) => pet.dailyXp >= 1000 },
  { code: 'daily_2000', label: '긴 하루의 성장', test: (pet) => pet.dailyXp >= 2000 },
  { code: 'level_15', label: '레벨 15 안정권', test: (pet) => pet.level >= 15 },
  { code: 'level_20', label: '레벨 20 산책길', test: (pet) => pet.level >= 20 },
  { code: 'level_25', label: '레벨 25 반짝임', test: (pet) => pet.level >= 25 },
  { code: 'level_30', label: '레벨 30 베테랑', test: (pet) => pet.level >= 30 },
  { code: 'level_35', label: '레벨 35 단골 주인', test: (pet) => pet.level >= 35 },
  { code: 'level_40', label: '레벨 40 깊은 유대', test: (pet) => pet.level >= 40 },
  { code: 'level_45', label: '레벨 45 거의 전설', test: (pet) => pet.level >= 45 },
  { code: 'rarity_rare', label: '레어 획득', test: (pet) => ['레어', '에픽', '유니크', '레전더리', '초초초'].includes(pet.rarity) },
  { code: 'rarity_epic', label: '에픽 획득', test: (pet) => ['에픽', '유니크', '레전더리', '초초초'].includes(pet.rarity) },
  { code: 'rarity_unique', label: '유니크 획득', test: (pet) => ['유니크', '레전더리', '초초초'].includes(pet.rarity) },
  { code: 'rarity_legendary', label: '레전더리 획득', test: (pet) => ['레전더리', '초초초'].includes(pet.rarity) },

  { code: 'level50', label: '레벨 50 달성', test: (pet) => pet.level >= 50 },
  { code: 'level_60', label: '레벨 60 고수', test: (pet) => pet.level >= 60 },
  { code: 'level_75', label: '레벨 75 장인', test: (pet) => pet.level >= 75 },
  { code: 'level_90', label: '레벨 90 신화권', test: (pet) => pet.level >= 90 },
  { code: 'level_100', label: '레벨 100 전설의 주인', test: (pet) => pet.level >= 100 },
  { code: 'interact_1500', label: '천오백 번의 약속', test: (pet) => pet.interactionCount >= 1500 },
  { code: 'interact_2000', label: '이천 번의 동행', test: (pet) => pet.interactionCount >= 2000 },
  { code: 'pat_200', label: '끝없는 쓰다듬', test: (pet) => pet.patCount >= 200 },
  { code: 'pat_300', label: '삼백 번 골골', test: (pet) => pet.patCount >= 300 },
  { code: 'rarity_cho', label: '초초초 획득', test: (pet) => pet.rarity === '초초초' }
];

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }));
}

async function bodyJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function json(res, status, payload, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(payload));
}

function error(res, status, message) {
  json(res, status, { error: message });
}

function authPet(req) {
  const cookies = parseCookies(req.headers.cookie);
  const session = getSession(cookies.rs_session);
  if (!session) return null;
  return getPetById(session.petId);
}

function petPayload(pet) {
  return {
    ...pet,
    displayName: displayName(pet),
    requiredXp: 50 + pet.level * 25,
    dailyXpLimit,
    moodInfo: getMood(pet.mood),
    interactions: Object.entries(INTERACTIONS).map(([key, value]) => ({ key, label: value.label }))
  };
}

function isRapidRepeatedAction(petId, action) {
  const now = Date.now();
  const key = `${petId}:${action}`;
  const recent = (rapidActionWindows.get(key) ?? []).filter((time) => now - time <= rapidActionWindowMs);
  recent.push(now);
  rapidActionWindows.set(key, recent);
  return recent.length >= rapidActionLimit;
}

function unlockMatchingAchievements(pet) {
  for (const achievement of achievements) {
    if (achievement.test(pet)) {
      unlockAchievement(pet.id, achievement.code, achievement.label);
    }
  }
}

async function api(req, res, path) {
  try {
    if (req.method === 'POST' && path === '/api/register') {
      const { name = '', password = '' } = await bodyJson(req);
      const pet = createPet(name, password);
      const session = createSession(pet.id);
      return json(res, 201, { pet: petPayload(pet), collection: getCollections(pet.id) }, {
        'Set-Cookie': `rs_session=${session.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1209600`
      });
    }

    if (req.method === 'POST' && path === '/api/login') {
      const { name = '', password = '' } = await bodyJson(req);
      const row = getPetByName(name);
      if (!row || !verifyPassword(password, row.password_salt, row.password_hash)) {
        return error(res, 401, '이름 또는 비밀번호가 맞지 않습니다.');
      }
      const session = createSession(row.id);
      return json(res, 200, { pet: petPayload(getPetById(row.id)) }, {
        'Set-Cookie': `rs_session=${session.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1209600`
      });
    }

    if (req.method === 'POST' && path === '/api/logout') {
      const cookies = parseCookies(req.headers.cookie);
      if (cookies.rs_session) deleteSession(cookies.rs_session);
      return json(res, 200, { ok: true }, { 'Set-Cookie': 'rs_session=; Path=/; Max-Age=0' });
    }

    if (req.method === 'GET' && path === '/api/me') {
      const pet = authPet(req);
      if (!pet) return json(res, 200, { pet: null, collection: { titles: [], rarities: [], achievements: [] } });
      unlockMatchingAchievements(pet);
      return json(res, 200, { pet: petPayload(pet), collection: getCollections(pet.id) });
    }

    if (req.method === 'GET' && path === '/api/pets') {
      const url = new URL(req.url, 'http://localhost');
      return json(res, 200, {
        pets: listPets({ search: url.searchParams.get('search') ?? '', rarity: url.searchParams.get('rarity') ?? '' })
      });
    }

    if (req.method === 'POST' && path === '/api/owner-message') {
      const pet = authPet(req);
      if (!pet) return error(res, 401, '로그인이 필요합니다.');
      const { ownerMessage = '' } = await bodyJson(req);
      const updated = updateOwnerMessage(pet.id, ownerMessage);
      return json(res, 200, {
        pet: petPayload(updated),
        collection: getCollections(updated.id),
        message: ownerMessage.trim() ? '주인 메시지를 남겼습니다.' : '주인 메시지를 비웠습니다.'
      });
    }

    if (req.method === 'POST' && path === '/api/interact') {
      const pet = authPet(req);
      if (!pet) return error(res, 401, '로그인이 필요합니다.');
      const { action } = await bodyJson(req);
      if (!INTERACTIONS[action]) return error(res, 400, '지원하지 않는 상호작용입니다.');
      if (isRapidRepeatedAction(pet.id, action)) {
        return json(res, 200, {
          pet: petPayload(pet),
          collection: getCollections(pet.id),
          result: {
            xp: 0,
            special: false,
            blocked: true,
            label: INTERACTIONS[action].label,
            animation: 'annoyed',
            message: '너무 빠르게 반복해서 랜덤시녕의 입이 M이 됐습니다. 잠깐만 쉬어가요.',
            leveled: false,
            unlockedLevels: []
          }
        });
      }
      const result = rollInteraction(action, pet.mood);
      const remainingDailyXp = Math.max(0, dailyXpLimit - pet.dailyXp);
      const grantedXp = Math.min(result.xp, remainingDailyXp);
      const dailyCapReached = grantedXp <= 0;
      const partiallyCapped = grantedXp > 0 && grantedXp < result.xp;
      const next = applyXp({ level: pet.level, xp: pet.xp, title_rolls: pet.titleRolls, rarity_rolls: pet.rarityRolls }, grantedXp);
      const updated = updatePetProgress(pet.id, {
        ...next,
        dailyXp: pet.dailyXp + grantedXp,
        dailyXpDate: pet.dailyXpDate,
        interactionCount: pet.interactionCount + 1,
        patCount: pet.patCount + (action === 'pat' ? 1 : 0)
      });

      unlockMatchingAchievements(updated);

      return json(res, 200, {
        pet: petPayload(updated),
        collection: getCollections(pet.id),
        result: {
          ...result,
          xp: grantedXp,
          dailyCapReached,
          partiallyCapped,
          message: dailyCapReached
            ? '오늘 얻을 수 있는 경험치를 모두 채웠습니다. 내일 다시 성장할 수 있어요.'
            : partiallyCapped
              ? `${result.message} 오늘 한도에 닿아서 일부 XP만 받았습니다.`
              : result.message,
          leveled: next.leveled,
          unlockedLevels: next.unlockedLevels
        }
      });
    }

    if (req.method === 'POST' && path === '/api/title-options') {
      const pet = authPet(req);
      if (!pet) return error(res, 401, '로그인이 필요합니다.');
      if (pet.titleRolls <= 0) return error(res, 400, '칭호 변경 기회가 없습니다.');
      return json(res, 200, { options: rollTitleOptions(3) });
    }

    if (req.method === 'POST' && path === '/api/choose-title') {
      const pet = authPet(req);
      if (!pet) return error(res, 401, '로그인이 필요합니다.');
      const { title } = await bodyJson(req);
      const updated = setTitle(pet.id, title);
      return json(res, 200, { pet: petPayload(updated), collection: getCollections(pet.id), message: `${title} 칭호를 장착했습니다.` });
    }

    if (req.method === 'POST' && path === '/api/roll-rarity') {
      const pet = authPet(req);
      if (!pet) return error(res, 401, '로그인이 필요합니다.');
      if (pet.rarityRolls <= 0) return error(res, 400, '희귀도 변경 기회가 없습니다.');
      const rarity = rollRarity(pet.level);
      const updated = setRarity(pet.id, rarity);
      unlockMatchingAchievements(updated);
      return json(res, 200, { pet: petPayload(updated), collection: getCollections(pet.id), rarity, message: `${rarity} 희귀도가 등장했습니다!` });
    }

    return error(res, 404, 'API를 찾을 수 없습니다.');
  } catch (err) {
    return error(res, 400, err.message || '요청 처리 중 오류가 발생했습니다.');
  }
}

async function serveStatic(req, res, path) {
  const target = path === '/' ? '/index.html' : path;
  const file = resolve(publicDir, `.${target}`);
  if (!file.startsWith(publicDir) || !existsSync(file)) {
    const index = await readFile(join(publicDir, 'index.html'));
    res.writeHead(200, { 'Content-Type': mime['.html'] });
    return res.end(index);
  }
  const data = await readFile(file);
  res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' });
  res.end(data);
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) return api(req, res, url.pathname);
  return serveStatic(req, res, url.pathname);
}).listen(port, () => {
  console.log(`랜덤시녕 키우기 실행 중: http://localhost:${port}`);
});
