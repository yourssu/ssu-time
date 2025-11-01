# Repository Guidelines

## Project Structure & Module Organization
- `frontend/@ssu-time/frontend`는 Vite 기반의 React 애플리케이션으로, 환경 변수(`.env`), 빌드 설정(`vite.config.ts`), 워크플로(`.github/workflows/`)가 함께 들어 있습니다. 실제 화면 코드는 `src/` 아래에 있으며 페이지, 컴포넌트, 훅, 서비스(`lib/`)로 모듈화되어 있습니다.
- `frontend/@ssu-time/frontend/public`에는 정적 자산과 아이콘이 위치합니다. 에셋을 추가할 때는 동일한 디렉터리에 보관하고 경로에는 상대 경로를 사용합니다.
- 루트에는 `android`, `ios`, `backend` 디렉터리가 있으며, 모바일과 서버 관련 리소스를 위한 자리입니다. 변경 사항이 없을 경우 구조만 유지하세요.
- 공용 자동화나 문서화는 루트 `.github/`나 각 하위 모듈의 `README.md`를 참고해 정비합니다.

## Build, Test, and Development Commands
- `cd frontend/@ssu-time/frontend && npm install`: 프런트엔드 의존성 설치. 새 패키지 추가 시 `package.json`과 `package-lock.json`을 커밋합니다.
- `npm run dev`: 로컬 개발 서버(포트 5173 기본값)를 실행합니다.
- `npm run build`: TypeScript 프로젝트 참조를 빌드한 뒤 Vite 프로덕션 번들을 생성합니다.
- `npm run lint`: ESLint 규칙을 실행해 코드 스타일과 잠재 버그를 점검합니다.
- `npm run preview`: 배포 번들을 로컬에서 확인할 때 사용합니다.

## Coding Style & Naming Conventions
- TypeScript + React 조합을 기본으로 하며 ESLint(typescript-eslint, react-hooks, react-refresh 플러그인)를 사용합니다. 새 코드는 `npm run lint`를 통과해야 합니다.
- 들여쓰기는 2칸 스페이스를 유지하고, 컴포넌트/훅은 각각 PascalCase, camelCase 이름을 사용합니다. 파일 이름도 컴포넌트 기준으로 PascalCase(`ResultReport.tsx`)를 따릅니다.
- `src/lib`의 유틸, 서비스는 기능 단위로 분리하고 `index.ts`를 통해 모듈 경로를 노출합니다. 환경 값 접근은 `src/env.ts`를 통해 관리하세요.

## Testing Guidelines
- 현재 프런트엔드에는 공식 테스트 러너가 설정되어 있지 않습니다. 새 테스트를 도입할 때는 Vitest + Testing Library 조합을 권장하며, `src/__tests__/` 또는 각 모듈 폴더 옆에 배치하고 `*.test.ts(x)` 네이밍을 사용하세요.
- 기능 추가 시 주요 유스케이스와 회귀 위험이 큰 영역부터 스냅샷보다 동작 검증 위주로 커버리지를 확보합니다.

## Commit & Pull Request Guidelines
- 커밋 메시지는 `type: summary` 형태의 컨벤셔널 커밋을 사용하며, 필요한 경우 한국어 설명을 붙여도 됩니다. 예: `feat: 추가 로그인 라우트`.
- 하나의 커밋에는 관련된 변경만 담고, PR 설명에는 변경 요약, 테스트 결과, 관련 이슈/티켓 링크를 포함하세요. UI 변경은 스크린샷이나 GIF를 첨부하면 리뷰가 수월해집니다.
- 민감한 `.env` 파일은 예시만 커밋하고 실제 값은 배포 채널을 통해 공유하세요.
