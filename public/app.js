const rarities = ['노멀', '레어', '에픽', '유니크', '레전더리', '초초초'];
const achievementConditions = {
  first_touch: '상호작용을 1번 하면 달성',
  interact_5: '상호작용을 5번 하면 달성',
  interact_10: '상호작용을 10번 하면 달성',
  interact_25: '상호작용을 25번 하면 달성',
  pat_1: '쓰다듬기를 1번 하면 달성',
  pat_10: '쓰다듬기를 10번 하면 달성',
  daily_100: '하루에 XP를 100 이상 얻으면 달성',
  level_2: '레벨 2에 도달하면 달성',
  level_5: '레벨 5에 도달하면 달성',
  level_10: '레벨 10에 도달하면 달성',
  interact_50: '상호작용을 50번 하면 달성',
  interact_75: '상호작용을 75번 하면 달성',
  interact_100: '상호작용을 100번 하면 달성',
  interact_150: '상호작용을 150번 하면 달성',
  interact_200: '상호작용을 200번 하면 달성',
  interact_300: '상호작용을 300번 하면 달성',
  interact_400: '상호작용을 400번 하면 달성',
  interact_500: '상호작용을 500번 하면 달성',
  interact_750: '상호작용을 750번 하면 달성',
  interact_1000: '상호작용을 1000번 하면 달성',
  pat_25: '쓰다듬기를 25번 하면 달성',
  pat_50: '쓰다듬기를 50번 하면 달성',
  pat_75: '쓰다듬기를 75번 하면 달성',
  pat100: '쓰다듬기를 100번 하면 달성',
  pat_150: '쓰다듬기를 150번 하면 달성',
  daily_250: '하루에 XP를 250 이상 얻으면 달성',
  daily_500: '하루에 XP를 500 이상 얻으면 달성',
  daily_1000: '하루에 XP를 1000 이상 얻으면 달성',
  daily_2000: '하루에 XP를 2000 이상 얻으면 달성',
  level_15: '레벨 15에 도달하면 달성',
  level_20: '레벨 20에 도달하면 달성',
  level_25: '레벨 25에 도달하면 달성',
  level_30: '레벨 30에 도달하면 달성',
  level_35: '레벨 35에 도달하면 달성',
  level_40: '레벨 40에 도달하면 달성',
  level_45: '레벨 45에 도달하면 달성',
  rarity_rare: '희귀도 레어 이상을 얻으면 달성',
  rarity_epic: '희귀도 에픽 이상을 얻으면 달성',
  rarity_unique: '희귀도 유니크 이상을 얻으면 달성',
  rarity_legendary: '희귀도 레전더리 이상을 얻으면 달성',
  level50: '레벨 50에 도달하면 달성',
  level_60: '레벨 60에 도달하면 달성',
  level_75: '레벨 75에 도달하면 달성',
  level_90: '레벨 90에 도달하면 달성',
  level_100: '레벨 100에 도달하면 달성',
  interact_1500: '상호작용을 1500번 하면 달성',
  interact_2000: '상호작용을 2000번 하면 달성',
  pat_200: '쓰다듬기를 200번 하면 달성',
  pat_300: '쓰다듬기를 300번 하면 달성',
  rarity_cho: '희귀도 초초초를 얻으면 달성'
};

const state = {
  view: 'loading',
  pet: null,
  collection: { titles: [], rarities: [], achievements: [] },
  pets: [],
  message: '랜덤시녕 서버에 접속 중...',
  mode: null,
  titleOptions: [],
  animation: '',
  faceMood: '',
  confetti: false,
  rarityBurst: false,
  loading: false,
  filters: { search: '', rarity: '' }
};

const $ = (selector) => document.querySelector(selector);
const app = $('#app');
const staticMode = location.hostname.endsWith('github.io') || location.protocol === 'file:';
const staticRapidActionWindows = new Map();
const staticRapidActionWindowMs = 3000;
const staticRapidActionLimit = 3;

const staticInteractions = {
  wash: { label: '씻어주기', min: 8, max: 16, animation: 'splash' },
  play: { label: '놀아주기', min: 10, max: 22, animation: 'bounce' },
  snack: { label: '간식주기', min: 7, max: 18, animation: 'nom' },
  sleep: { label: '재워주기', min: 6, max: 15, animation: 'sleepy' },
  pat: { label: '쓰다듬기', min: 5, max: 14, animation: 'purr' },
  walk: { label: '산책가기', min: 12, max: 26, animation: 'walk' }
};
const staticSpecialRates = { wash: 0.12, play: 0.15, snack: 0.18, sleep: 0.1, pat: 0.2, walk: 0.14 };
const staticNormalLines = [
  '지금 완전 행복해진 것 같아요.',
  '랜덤시녕이 당신을 빤히 봅니다. 판단은 보류.',
  '꼬리가 물음표 모양으로 말렸어요.',
  '작은 발소리가 들리면 랜덤시녕이 통통 뛰어옵니다.',
  '기분이 좋아서 회색 털이 조금 더 반짝여요.',
  '랜덤시녕은 저장 버튼 없이도 마음속에 저장되고 싶어합니다.'
];
const staticSpecialLines = [
  '특별 반응! 랜덤시녕이 0.7초 동안 우주의 비밀을 이해했습니다.',
  '대박! 그 사이 세 줄무늬가 잠깐 반짝였습니다.',
  '특별 반응! 랜덤시녕이 이름 모를 반짝임을 생성했습니다.',
  '희귀한 순간! 랜덤시녕이 화면 밖으로 생각을 튕겼습니다.'
];

const staticMoods = [
  { name: '말랑함', bonus: 1.05, line: '오늘은 말랑한 기분이라 보너스 XP가 살짝 붙어요.' },
  { name: '하이텐션', bonus: 1.2, line: '랜덤시녕이 우다다 모드입니다. XP 보너스!' },
  { name: '졸림', bonus: 0.92, line: '눈꺼풀이 무거워요. 그래도 귀엽습니다.' },
  { name: '배고픔', bonus: 1.12, line: '간식 생각으로 집중력이 올라갔어요.' }
];
const staticAchievementRules = Object.entries(achievementConditions).map(([code, condition]) => ({
  code,
  label: {
    first_touch: '첫 인사', interact_5: '다섯 번의 관심', interact_10: '열 번의 손길', interact_25: '조금 친해짐',
    pat_1: '첫 쓰다듬', pat_10: '쓰담쓰담 입문', daily_100: '오늘도 시작이 좋아', level_2: '레벨 2 새싹',
    level_5: '레벨 5 이름표', level_10: '레벨 10 첫 전환점', pat100: '100번 쓰다듬기', level50: '레벨 50 달성',
    rarity_cho: '초초초 획득'
  }[code] ?? condition.replace(/(을|를|에| 이상을| 이상| 하면| 얻으면| 도달하면| 달성)/g, '').slice(0, 12),
  test: (pet) => {
    const n = Number(code.match(/\d+/)?.[0] ?? 0);
    if (code.startsWith('interact_')) return pet.interactionCount >= n;
    if (code.startsWith('pat_') || code === 'pat100') return pet.patCount >= (code === 'pat100' ? 100 : n);
    if (code.startsWith('daily_')) return pet.dailyXp >= n;
    if (code.startsWith('level_') || code === 'level50') return pet.level >= (code === 'level50' ? 50 : n);
    if (code === 'first_touch') return pet.interactionCount >= 1;
    if (code === 'rarity_cho') return pet.rarity === '초초초';
    if (code === 'rarity_rare') return ['레어', '에픽', '유니크', '레전더리', '초초초'].includes(pet.rarity);
    if (code === 'rarity_epic') return ['에픽', '유니크', '레전더리', '초초초'].includes(pet.rarity);
    if (code === 'rarity_unique') return ['유니크', '레전더리', '초초초'].includes(pet.rarity);
    if (code === 'rarity_legendary') return ['레전더리', '초초초'].includes(pet.rarity);
    return false;
  }
}));

async function request(path, options = {}) {
  if (staticMode) return staticRequest(path, options);
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    credentials: 'same-origin',
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? '알 수 없는 오류가 발생했습니다.');
  return payload;
}

function staticRead() {
  return JSON.parse(localStorage.getItem('randomshinyoung-data') ?? '{"pets":[],"session":null}');
}

function staticWrite(data) {
  localStorage.setItem('randomshinyoung-data', JSON.stringify(data));
}

function staticToday() {
  return new Date().toISOString().slice(0, 10);
}

function staticRequiredXp(level) {
  return 50 + level * 25;
}

function staticCollection(pet) {
  return {
    titles: pet.collectionTitles ?? [],
    rarities: pet.collectionRarities ?? [{ rarity: pet.rarity, acquiredAt: pet.createdAt }],
    achievements: pet.achievements ?? []
  };
}

function staticPetPayload(pet) {
  const moodInfo = staticMoods.find((mood) => mood.name === pet.mood) ?? staticMoods[0];
  return {
    ...pet,
    displayName: `[${pet.rarity}] ${pet.title ? `${pet.title} ` : ''}${pet.name}`,
    requiredXp: staticRequiredXp(pet.level),
    dailyXpLimit: 5000,
    moodInfo,
    interactions: Object.entries(staticInteractions).map(([key, value]) => ({ key, label: value.label }))
  };
}

function staticUnlockAchievements(pet) {
  pet.achievements ??= [];
  for (const achievement of staticAchievementRules) {
    if (achievement.test(pet) && !pet.achievements.some((item) => item.code === achievement.code)) {
      pet.achievements.unshift({ code: achievement.code, label: achievement.label, unlockedAt: new Date().toISOString() });
    }
  }
}

function staticCurrentPet(data) {
  return data.pets.find((pet) => pet.id === data.session) ?? null;
}

function staticIsRapidRepeatedAction(petId, action) {
  const now = Date.now();
  const key = `${petId}:${action}`;
  const recent = (staticRapidActionWindows.get(key) ?? []).filter((time) => now - time <= staticRapidActionWindowMs);
  recent.push(now);
  staticRapidActionWindows.set(key, recent);
  return recent.length >= staticRapidActionLimit;
}

async function staticRequest(path, options = {}) {
  const data = staticRead();
  const body = options.body ? JSON.parse(options.body) : {};
  const [route, query = ''] = path.split('?');

  if (route === '/api/me') {
    const pet = staticCurrentPet(data);
    if (!pet) return { pet: null, collection: { titles: [], rarities: [], achievements: [] } };
    staticUnlockAchievements(pet);
    staticWrite(data);
    return { pet: staticPetPayload(pet), collection: staticCollection(pet) };
  }

  if (route === '/api/register') {
    const name = normalizePetNameInput(body.name);
    if (!name || String(body.password ?? '').length < 4) throw new Error('이름과 비밀번호를 확인해주세요.');
    if (data.pets.some((pet) => pet.name.toLowerCase() === name.toLowerCase())) throw new Error('이미 존재하는 이름입니다.');
    const now = new Date().toISOString();
    const mood = staticMoods[Math.floor(Math.random() * staticMoods.length)];
    const pet = {
      id: Date.now(),
      name,
      password: body.password,
      level: 1,
      xp: 0,
      dailyXp: 0,
      dailyXpDate: staticToday(),
      ownerMessage: '',
      title: null,
      rarity: '노멀',
      titleRolls: 0,
      rarityRolls: 0,
      mood: mood.name,
      moodDate: staticToday(),
      interactionCount: 0,
      patCount: 0,
      collectionTitles: [],
      collectionRarities: [{ rarity: '노멀', acquiredAt: now }],
      achievements: [],
      createdAt: now,
      updatedAt: now
    };
    data.pets.push(pet);
    data.session = pet.id;
    staticWrite(data);
    return { pet: staticPetPayload(pet), collection: staticCollection(pet) };
  }

  if (route === '/api/login') {
    const name = normalizePetNameInput(body.name);
    const pet = data.pets.find((item) => item.name.toLowerCase() === name.toLowerCase() && item.password === body.password);
    if (!pet) throw new Error('이름 또는 비밀번호가 맞지 않습니다.');
    data.session = pet.id;
    staticWrite(data);
    return { pet: staticPetPayload(pet) };
  }

  if (route === '/api/logout') {
    data.session = null;
    staticWrite(data);
    return { ok: true };
  }

  if (route === '/api/pets') {
    const params = new URLSearchParams(query);
    const search = params.get('search') ?? '';
    const rarity = params.get('rarity') ?? '';
    const pets = data.pets
      .filter((pet) => (!search || pet.name.includes(search)) && (!rarity || pet.rarity === rarity))
      .sort((a, b) => b.level - a.level || b.xp - a.xp)
      .map(({ id, name, level, title, rarity, ownerMessage, createdAt }) => ({ id, name, level, title, rarity, ownerMessage, createdAt }));
    return { pets };
  }

  const pet = staticCurrentPet(data);
  if (!pet) throw new Error('로그인이 필요합니다.');

  if (route === '/api/owner-message') {
    pet.ownerMessage = String(body.ownerMessage ?? '').trim().slice(0, 80);
    pet.updatedAt = new Date().toISOString();
    staticWrite(data);
    return { pet: staticPetPayload(pet), collection: staticCollection(pet), message: pet.ownerMessage ? '주인 메시지를 남겼습니다.' : '주인 메시지를 비웠습니다.' };
  }

  if (route === '/api/interact') {
    const config = staticInteractions[body.action];
    if (!config) throw new Error('지원하지 않는 상호작용입니다.');
    if (staticIsRapidRepeatedAction(pet.id, body.action)) {
      return {
        pet: staticPetPayload(pet),
        collection: staticCollection(pet),
        result: {
          xp: 0,
          special: false,
          blocked: true,
          label: config.label,
          animation: 'annoyed',
          message: '너무 빠르게 반복해서 랜덤시녕 입이 M이 되었습니다. 천천히만 해주세요.',
          leveled: false,
          unlockedLevels: []
        }
      };
    }
    if (pet.dailyXpDate !== staticToday()) {
      pet.dailyXp = 0;
      pet.dailyXpDate = staticToday();
    }
    const mood = staticMoods.find((item) => item.name === pet.mood) ?? staticMoods[0];
    const raw = config.min + Math.floor(Math.random() * (config.max - config.min + 1));
    const special = Math.random() < (staticSpecialRates[body.action] ?? 0);
    const specialBonus = special ? 1.35 : 1;
    const lines = special ? staticSpecialLines : staticNormalLines;
    const resultXp = Math.max(1, Math.round(raw * mood.bonus * specialBonus));
    const grantedXp = Math.min(resultXp, Math.max(0, 5000 - pet.dailyXp));
    pet.xp += grantedXp;
    pet.dailyXp += grantedXp;
    pet.interactionCount += 1;
    if (body.action === 'pat') pet.patCount += 1;
    const unlockedLevels = [];
    while (pet.xp >= staticRequiredXp(pet.level)) {
      pet.xp -= staticRequiredXp(pet.level);
      pet.level += 1;
      unlockedLevels.push(pet.level);
      if (pet.level % 5 === 0) pet.titleRolls += 1;
      if (pet.level % 10 === 0) pet.rarityRolls += 1;
    }
    staticUnlockAchievements(pet);
    pet.updatedAt = new Date().toISOString();
    staticWrite(data);
    return {
      pet: staticPetPayload(pet),
      collection: staticCollection(pet),
      result: {
        xp: grantedXp,
        special,
        dailyCapReached: grantedXp <= 0,
        partiallyCapped: grantedXp > 0 && grantedXp < resultXp,
        label: config.label,
        animation: config.animation,
        message: lines[Math.floor(Math.random() * lines.length)],
        leveled: unlockedLevels.length > 0,
        unlockedLevels
      }
    };
  }

  if (route === '/api/title-options') return { options: ['행복한', '멋진', '반짝이는'] };
  if (route === '/api/choose-title') {
    pet.title = body.title;
    pet.titleRolls = Math.max(0, pet.titleRolls - 1);
    pet.collectionTitles ??= [];
    if (!pet.collectionTitles.some((item) => item.title === body.title)) pet.collectionTitles.unshift({ title: body.title, acquiredAt: new Date().toISOString() });
    staticWrite(data);
    return { pet: staticPetPayload(pet), collection: staticCollection(pet), message: `${body.title} 칭호를 장착했습니다.` };
  }
  if (route === '/api/roll-rarity') {
    const options = ['노멀', '레어', '에픽', '유니크', '레전더리', '초초초'];
    pet.rarity = options[Math.min(options.length - 1, Math.floor(Math.random() * Math.max(2, pet.level / 8)))];
    pet.rarityRolls = Math.max(0, pet.rarityRolls - 1);
    pet.collectionRarities ??= [];
    if (!pet.collectionRarities.some((item) => item.rarity === pet.rarity)) pet.collectionRarities.unshift({ rarity: pet.rarity, acquiredAt: new Date().toISOString() });
    staticUnlockAchievements(pet);
    staticWrite(data);
    return { pet: staticPetPayload(pet), collection: staticCollection(pet), rarity: pet.rarity, message: `${pet.rarity} 희귀도가 등장했습니다!` };
  }

  throw new Error('API를 찾을 수 없습니다.');
}

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function normalizePetNameInput(value = '') {
  const compact = String(value).trim().replace(/\s+/g, '');
  if (!compact) return '';
  return compact.endsWith('시녕') ? compact : `${compact}시녕`;
}

function playTone(type = 'tap') {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const table = { tap: 520, level: 880, rare: 260, error: 150 };
  osc.frequency.value = table[type] ?? 520;
  osc.type = type === 'rare' ? 'sawtooth' : 'triangle';
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

function catMarkup() {
  return `
    <div class="cat ${state.animation}" aria-label="회색 고양이 랜덤시녕">
      <div class="ear left"></div>
      <div class="ear right"></div>
      <div class="head">
        <div class="stripe s1"></div><div class="stripe s2"></div><div class="stripe s3"></div>
        <div class="kawaii-face" aria-hidden="true"><span class="eye-mark">^</span><span class="mouth-w ${state.faceMood === 'annoyed' ? 'annoyed' : ''}">${state.faceMood === 'annoyed' ? 'M' : 'W'}</span><span class="eye-mark">^</span></div>
        <div class="whisker w1"></div><div class="whisker w2"></div><div class="whisker w3"></div>
        <div class="whisker w4"></div><div class="whisker w5"></div><div class="whisker w6"></div>
      </div>
      <div class="tail"></div>
      <div class="body"><div class="paw left"></div><div class="paw right"></div></div>
      <div class="shadow"></div>
    </div>
  `;
}

function menuView() {
  return `
    <main class="screen menu-screen">
      <section class="hero">
        <div class="brand-badge">online tamagotchi.exe</div>
        <h1>랜덤시녕 키우기</h1>
        <p>회색 고양이, 세 줄 무늬, 약간 이상한 귀여움. 오늘도 저장되는 랜덤한 성장.</p>
        <div class="menu-cat">${catMarkup()}</div>
        <div class="menu-actions">
          <button data-view="login" class="primary">랜덤시녕 불러오기</button>
          <button data-view="register" class="secondary">새로운 랜덤시녕 키우기</button>
          <button data-view="archive" class="ghost">역대 랜덤시녕 둘러보기</button>
        </div>
      </section>
    </main>
  `;
}

function authView(type) {
  const isLogin = type === 'login';
  return `
    <main class="screen auth-screen">
      <button class="back" data-view="menu">←</button>
      <section class="auth-panel">
        <h1>${isLogin ? '랜덤시녕 불러오기' : '새로운 랜덤시녕 키우기'}</h1>
        <form id="authForm" class="stack">
          <label>이름<div class="name-field"><input name="name" maxlength="16" autocomplete="username" placeholder="예: 멋진" required /><span>시녕</span></div></label>
          <label>비밀번호<input name="password" type="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" placeholder="비밀은 해시로 보관" required /></label>
          <button class="primary" type="submit">${isLogin ? '로그인' : '생성'}</button>
        </form>
        <p class="status">${escapeHtml(state.message)}</p>
      </section>
    </main>
  `;
}

function archiveView() {
  const cards = state.pets.map((pet) => `
    <article class="pet-card rarity-${pet.rarity}">
      <div class="card-top"><strong>${escapeHtml(pet.name)}</strong><span>${escapeHtml(pet.rarity)}</span></div>
      <p>Lv. ${pet.level}</p>
      <p>${pet.title ? escapeHtml(pet.title) : '칭호 없음'}</p>
      ${pet.ownerMessage ? `<p class="owner-message">${escapeHtml(pet.ownerMessage)}</p>` : ''}
      <time>${new Date(pet.createdAt).toLocaleDateString('ko-KR')}</time>
    </article>
  `).join('');
  return `
    <main class="screen archive-screen">
      <header class="topbar">
        <button class="back" data-view="menu">←</button>
        <h1>역대 랜덤시녕</h1>
      </header>
      <section class="filters">
        <input id="searchInput" placeholder="이름 검색" value="${escapeHtml(state.filters.search)}" />
        <select id="rarityFilter">
          <option value="">전체 희귀도</option>
          ${rarities.map((r) => `<option value="${r}" ${state.filters.rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </section>
      <section class="card-grid">${cards || '<p class="empty">아직 저장된 랜덤시녕이 없습니다.</p>'}</section>
    </main>
  `;
}

function achievementButton(achievement) {
  return `<button class="achievement-chip" data-achievement-code="${escapeHtml(achievement.code)}" type="button">${escapeHtml(achievement.label)}</button>`;
}

function playView() {
  const pet = state.pet;
  const xpPercent = Math.min(100, Math.round((pet.xp / pet.requiredXp) * 100));
  const dailyXpPercent = Math.min(100, Math.round((pet.dailyXp / pet.dailyXpLimit) * 100));
  const interactionButtons = pet.interactions.map((item) => `
    <button class="action-btn" data-action="${item.key}">${item.label}</button>
  `).join('');

  return `
    <main class="screen play-screen rarity-bg-${pet.rarity}">
      ${state.confetti ? '<div class="confetti"></div><div class="confetti c2"></div><div class="confetti c3"></div>' : ''}
      ${state.rarityBurst ? '<div class="rarity-burst">RARE DROP</div>' : ''}
      <header class="game-top">
        <button class="back" data-logout="true">끝내기</button>
        <div>
          <p class="eyebrow">오늘의 기분: ${escapeHtml(pet.mood)} · XP x${pet.moodInfo.bonus}</p>
          <h1>${escapeHtml(pet.displayName)}</h1>
        </div>
      </header>
      <section class="game-layout">
        <aside class="stat-panel">
          <div class="stat"><span>레벨</span><strong>${pet.level}</strong></div>
          <div class="stat"><span>희귀도</span><strong>${pet.rarity}</strong></div>
          <div class="stat"><span>칭호</span><strong>${pet.title || '없음'}</strong></div>
          <div class="xp-wrap"><div class="xp-label"><span>EXP</span><span>${pet.xp}/${pet.requiredXp}</span></div><div class="xp"><i style="width:${xpPercent}%"></i></div></div>
          <div class="xp-wrap daily"><div class="xp-label"><span>오늘 XP</span><span>${pet.dailyXp}/${pet.dailyXpLimit}</span></div><div class="xp"><i style="width:${dailyXpPercent}%"></i></div></div>
          <p class="mood-line">${escapeHtml(pet.moodInfo.line)}</p>
        </aside>
        <section class="pet-stage">
          ${catMarkup()}
          <div class="speech">${escapeHtml(state.message)}</div>
        </section>
        <aside class="control-panel">
          <div class="actions">${interactionButtons}</div>
          <form id="ownerMessageForm" class="owner-message-form">
            <label>주인 메시지<input name="ownerMessage" maxlength="80" value="${escapeHtml(pet.ownerMessage ?? '')}" placeholder="짧은 메시지를 남겨주세요" /></label>
            <button class="ghost save-message" type="submit">저장</button>
          </form>
          <button class="roll title-roll" ${pet.titleRolls ? '' : 'disabled'}>칭호 바꾸기 (${pet.titleRolls})</button>
          <button class="roll rarity-roll" ${pet.rarityRolls ? '' : 'disabled'}>희귀도 바꾸기 (${pet.rarityRolls})</button>
        </aside>
      </section>
      <section class="tabs">
        <details open>
          <summary>도감</summary>
          <div class="chips">
            ${state.collection.titles.map((x) => `<span>${escapeHtml(x.title)}</span>`).join('') || '<em>획득한 칭호 없음</em>'}
            ${state.collection.rarities.map((x) => `<span class="rarity-chip">${escapeHtml(x.rarity)}</span>`).join('')}
          </div>
        </details>
        <details open>
          <summary>업적</summary>
          <div class="chips">${state.collection.achievements.map(achievementButton).join('') || '<em>업적을 기다리는 중</em>'}</div>
        </details>
      </section>
      ${state.titleOptions.length ? titleModal() : ''}
    </main>
  `;
}

function titleModal() {
  return `
    <div class="modal-backdrop">
      <section class="modal">
        <h2>칭호 선택</h2>
        <div class="title-options">
          ${state.titleOptions.map((title) => `<button data-title="${title}">${title}</button>`).join('')}
        </div>
      </section>
    </div>
  `;
}

function loadingView() {
  return `
    <main class="screen loading-screen">
      <div class="runner">${catMarkup()}</div>
      <p>${escapeHtml(state.message)}</p>
    </main>
  `;
}

function render() {
  if (state.view === 'loading') app.innerHTML = loadingView();
  if (state.view === 'menu') app.innerHTML = menuView();
  if (state.view === 'login') app.innerHTML = authView('login');
  if (state.view === 'register') app.innerHTML = authView('register');
  if (state.view === 'archive') app.innerHTML = archiveView();
  if (state.view === 'play') app.innerHTML = playView();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', async () => {
      const view = button.dataset.view;
      playTone('tap');
      if (view === 'archive') await loadArchive();
      setState({ view, message: '' });
    });
  });

  const form = $('#authForm');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      formData.set('name', normalizePetNameInput(formData.get('name')));
      const path = state.view === 'login' ? '/api/login' : '/api/register';
      try {
        setState({ loading: true, message: '랜덤시녕을 깨우는 중...' });
        const data = await request(path, { method: 'POST', body: JSON.stringify(Object.fromEntries(formData)) });
        playTone('level');
        setState({ pet: data.pet, collection: data.collection ?? state.collection, view: 'play', message: `${data.pet.name} 등장!` });
      } catch (error) {
        playTone('error');
        setState({ message: error.message });
      }
    });
  }

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => interact(button.dataset.action));
  });

  $('.title-roll')?.addEventListener('click', getTitleOptions);
  $('.rarity-roll')?.addEventListener('click', rollRarity);
  $('#ownerMessageForm')?.addEventListener('submit', saveOwnerMessage);
  document.querySelectorAll('[data-achievement-code]').forEach((button) => {
    button.addEventListener('click', showAchievementCondition);
  });
  $('[data-logout]')?.addEventListener('click', logout);
  $('#searchInput')?.addEventListener('input', debounce((event) => {
    state.filters.search = event.target.value;
    loadArchive();
  }, 200));
  $('#rarityFilter')?.addEventListener('change', (event) => {
    state.filters.rarity = event.target.value;
    loadArchive();
  });
  document.querySelectorAll('[data-title]').forEach((button) => {
    button.addEventListener('click', () => chooseTitle(button.dataset.title));
  });
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

async function loadArchive() {
  const params = new URLSearchParams(state.filters);
  const data = await request(`/api/pets?${params}`);
  state.pets = data.pets;
}

async function interact(action) {
  try {
    const data = await request('/api/interact', { method: 'POST', body: JSON.stringify({ action }) });
    playTone(data.result.leveled ? 'level' : 'tap');
    setState({
      pet: data.pet,
      collection: data.collection,
      message: `${data.result.label}: +${data.result.xp} XP · ${data.result.message}`,
      animation: data.result.animation,
      confetti: data.result.leveled,
      faceMood: data.result.blocked ? 'annoyed' : ''
    });
    setTimeout(() => setState({ animation: '', confetti: false, faceMood: '' }), data.result.blocked ? 1300 : 950);
  } catch (error) {
    setState({ message: error.message });
  }
}

async function saveOwnerMessage(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = await request('/api/owner-message', { method: 'POST', body: JSON.stringify(Object.fromEntries(formData)) });
  setState({ pet: data.pet, collection: data.collection, message: data.message });
}

function showAchievementCondition(event) {
  const code = event.currentTarget.dataset.achievementCode;
  const label = event.currentTarget.textContent;
  const condition = achievementConditions[code] ?? '달성 조건을 불러올 수 없습니다.';
  setState({ message: `${label}: ${condition}` });
}

async function getTitleOptions() {
  const data = await request('/api/title-options', { method: 'POST' });
  setState({ titleOptions: data.options });
}

async function chooseTitle(title) {
  const data = await request('/api/choose-title', { method: 'POST', body: JSON.stringify({ title }) });
  playTone('level');
  setState({ pet: data.pet, collection: data.collection, titleOptions: [], message: data.message, animation: 'spark' });
  setTimeout(() => setState({ animation: '' }), 800);
}

async function rollRarity() {
  const data = await request('/api/roll-rarity', { method: 'POST' });
  playTone('rare');
  setState({ pet: data.pet, collection: data.collection, message: data.message, rarityBurst: true, animation: 'spark' });
  setTimeout(() => setState({ rarityBurst: false, animation: '' }), 1200);
}

async function logout() {
  await request('/api/logout', { method: 'POST' });
  setState({ view: 'menu', pet: null, message: '' });
}

async function boot() {
  render();
  await new Promise((resolve) => setTimeout(resolve, 700));
  try {
    const data = await request('/api/me');
    if (data.pet) {
      setState({ view: 'play', pet: data.pet, collection: data.collection, message: `${data.pet.name}이 다시 접속했습니다.` });
    } else {
      setState({ view: 'menu', message: '' });
    }
  } catch {
    setState({ view: 'menu', message: '' });
  }
}

boot();
