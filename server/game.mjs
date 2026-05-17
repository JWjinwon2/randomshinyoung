export const TITLES = ['행복한', '불쌍한', '배고픈', '피곤한', '쾌활한', '멋진', '우주적인', '수상한', '반짝이는', '졸린'];
export const RARITIES = ['노멀', '레어', '에픽', '유니크', '레전더리', '초초초'];
export const MOODS = [
  { name: '말랑함', bonus: 1.05, line: '오늘은 말랑한 기분이라 보너스 XP가 살짝 붙어요.' },
  { name: '하이텐션', bonus: 1.2, line: '랜덤시녕이 우다다 모드입니다. XP 보너스!' },
  { name: '졸림', bonus: 0.92, line: '눈꺼풀이 무거워요. 그래도 귀엽습니다.' },
  { name: '배고픔', bonus: 1.12, line: '간식 생각으로 집중력이 올라갔어요.' },
  { name: '밈중독', bonus: 1.18, line: '오늘의 랜덤시녕은 인터넷 밈을 너무 많이 봤습니다.' }
];

export const INTERACTIONS = {
  wash: { label: '씻어주기', min: 8, max: 16, animation: 'splash', specialRate: 0.12, achievement: null },
  play: { label: '놀아주기', min: 10, max: 22, animation: 'bounce', specialRate: 0.15, achievement: null },
  snack: { label: '간식주기', min: 7, max: 18, animation: 'nom', specialRate: 0.18, achievement: null },
  sleep: { label: '재워주기', min: 6, max: 15, animation: 'sleepy', specialRate: 0.1, achievement: null },
  pat: { label: '쓰다듬기', min: 5, max: 14, animation: 'purr', specialRate: 0.2, achievement: 'pat100' },
  walk: { label: '산책가기', min: 12, max: 26, animation: 'walk', specialRate: 0.14, achievement: null }
};

const NORMAL_LINES = [
  '냥? 지금 완전 랜덤한 행복이 지나갔어요.',
  '랜덤시녕이 당신을 빤히 봅니다. 판단은 보류.',
  '꼬리가 물음표 모양이 됐어요.',
  '작은 발소리가 화면 안에서 통통 울립니다.',
  '기분이 좋아서 회색 털이 조금 더 반짝여요.',
  '랜덤시녕이 저장 버튼 없이도 마음속에 저장됐다고 합니다.'
];

const SPECIAL_LINES = [
  '특별 반응! 랜덤시녕이 0.7초 동안 우주의 비밀을 이해했습니다.',
  '대박! 귀 사이 세 줄이 잠깐 와이파이처럼 빛났어요.',
  '특별 반응! 랜덤시녕이 알 수 없는 밈을 생성했습니다.',
  '희귀한 순간! 랜덤시녕이 화면 밖으로 나갈 뻔했습니다.'
];

export function requiredXp(level) {
  return 50 + level * 25;
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function randomMood() {
  return MOODS[Math.floor(Math.random() * MOODS.length)];
}

export function getMood(name) {
  return MOODS.find((m) => m.name === name) ?? MOODS[0];
}

export function rarityWeights(level) {
  const boost = Math.min(level / 100, 0.55);
  return [
    Math.max(18, 50 - boost * 42),
    25 + boost * 5,
    13 + boost * 9,
    7 + boost * 10,
    4 + boost * 12,
    1 + boost * 6
  ];
}

export function rollRarity(level) {
  const weights = rarityWeights(level);
  const total = weights.reduce((sum, item) => sum + item, 0);
  let cursor = Math.random() * total;
  for (let i = 0; i < weights.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return RARITIES[i];
  }
  return RARITIES[0];
}

export function rollTitleOptions(count = 3) {
  const pool = [...TITLES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function rollInteraction(action, moodName) {
  const config = INTERACTIONS[action];
  if (!config) throw new Error('지원하지 않는 상호작용입니다.');
  const raw = config.min + Math.floor(Math.random() * (config.max - config.min + 1));
  const mood = getMood(moodName);
  const special = Math.random() < config.specialRate;
  const specialBonus = special ? 1.35 : 1;
  const xp = Math.max(1, Math.round(raw * mood.bonus * specialBonus));
  const lines = special ? SPECIAL_LINES : NORMAL_LINES;
  return {
    xp,
    special,
    label: config.label,
    animation: config.animation,
    message: lines[Math.floor(Math.random() * lines.length)]
  };
}

export function applyXp(pet, gainedXp) {
  let level = pet.level;
  let xp = pet.xp + gainedXp;
  let titleRolls = pet.title_rolls;
  let rarityRolls = pet.rarity_rolls;
  let leveled = false;
  const unlockedLevels = [];

  while (xp >= requiredXp(level)) {
    xp -= requiredXp(level);
    level += 1;
    leveled = true;
    unlockedLevels.push(level);
    if (level % 5 === 0) titleRolls += 1;
    if (level % 10 === 0) rarityRolls += 1;
  }

  return { level, xp, titleRolls, rarityRolls, leveled, unlockedLevels };
}

export function displayName(pet) {
  const title = pet.title ? `${pet.title} ` : '';
  return `[${pet.rarity}] ${title}${pet.name}`;
}
