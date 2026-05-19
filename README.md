# 랜덤시녕 키우기

회색 고양이 “랜덤시녕”을 키우는 온라인 다마고치 웹앱입니다. 로그인/생성, SQLite 저장, 레벨/경험치, 칭호/희귀도 변경권, 도감, 업적, 오늘의 기분, 랜덤 대사, 사운드와 애니메이션을 포함합니다.

사이트는 https://randomshinyoung-api.onrender.com/ 입니다.

## 폴더 구조

```text
.
├─ server/              # Node REST API, SQLite 접근, 게임 규칙
├─ public/              # 실행 가능한 웹 클라이언트
├─ src/                 # React+TypeScript 전환용 타입/상태/컴포넌트 구조 문서
├─ docs/schema.sql      # DB 스키마
├─ scripts/seed.mjs     # 초기 데이터 시드
├─ .env.example
└─ package.json
```

## 실행 방법

Node.js 24 이상이 필요합니다. 이 프로젝트는 외부 패키지 설치 없이 실행됩니다.

```bash
node --experimental-sqlite scripts/seed.mjs
node --experimental-sqlite server/index.mjs
```

브라우저에서 `http://localhost:3000`을 엽니다.

시드 계정 비밀번호는 모두 `1234`입니다.

## 환경 변수

`.env.example`을 참고하세요.

```text
PORT=3000
DATABASE_PATH=./random-shinyeong.sqlite
SESSION_DAYS=14
PBKDF2_ITERATIONS=210000
DAILY_XP_LIMIT=5000
```

## API 구조

- `POST /api/register`: 이름/비밀번호로 새 랜덤시녕 생성
- `POST /api/login`: 이름/비밀번호 로그인
- `POST /api/logout`: 세션 종료
- `GET /api/me`: 현재 랜덤시녕, 도감, 업적 조회
- `GET /api/pets?search=&rarity=`: 역대 랜덤시녕 목록
- `POST /api/interact`: 씻기/놀기/간식/잠/쓰다듬기/산책 상호작용
- `POST /api/title-options`: 칭호 선택지 생성
- `POST /api/choose-title`: 칭호 확정
- `POST /api/roll-rarity`: 레벨 보정 확률로 희귀도 변경

## DB 스키마

`docs/schema.sql`에 전체 스키마가 있습니다.

- `pets`: 이름, 비밀번호 해시/솔트, 레벨, 경험치, 칭호, 희귀도, 변경권, 오늘의 기분
- `collection_titles`: 획득한 칭호 도감
- `collection_rarities`: 획득한 희귀도 도감
- `achievements`: 업적
- `sessions`: HttpOnly 쿠키 기반 세션

## 보안

비밀번호는 평문 저장하지 않고 `crypto.pbkdf2Sync`와 랜덤 솔트로 해시합니다. 로그인 세션은 HttpOnly 쿠키로 유지됩니다.

## 게임 규칙

- 필요 경험치: `requiredXp = 50 + level * 25`
- 5레벨마다 칭호 변경권 1개 지급
- 10레벨마다 희귀도 변경권 1개 지급
- 희귀도 확률은 기본 가중치에서 레벨이 오를수록 상위 희귀도 비중이 증가합니다.
- 오늘의 기분은 하루 단위로 갱신되고 경험치 보너스를 줍니다.
- 하루에 올릴 수 있는 경험치는 기본 5000 XP이며, `DAILY_XP_LIMIT`으로 조정할 수 있습니다.
