# 주요 컴포넌트 구조

현재 실행 버전은 설치 없이 동작하도록 `public/app.js`에 컴포넌트 렌더 함수를 담았습니다. React + TypeScript로 전환할 때는 아래 단위로 분리하면 됩니다.

- `App`: 라우팅 상태와 최초 세션 복구
- `StartMenu`: 시작 메뉴 3개 버튼
- `AuthForm`: 불러오기/새로 키우기 공용 폼
- `ArchiveGallery`: 검색, 희귀도 필터, 카드 목록
- `PlayScreen`: 상태 패널, 캐릭터 스테이지, 상호작용 패널
- `RandomShinyeongCat`: CSS 캐릭터와 애니메이션 상태
- `CollectionBook`: 칭호/희귀도 도감
- `AchievementPanel`: 업적 목록
- `TitlePickerModal`: 칭호 선택 UI

상태 관리는 `src/state/store.ts`의 `GameState` 형태를 기준으로 두고, API 응답 타입은 `src/types/domain.ts`를 사용합니다.
