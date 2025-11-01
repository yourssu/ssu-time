# Repository Guidelines

## Project Structure & Module Organization
- `frontend/@ssu-time/frontend`는 Vite 기반의 React 애플리케이션이며, Tailwind CSS가 기본 스타일 계층으로 설정되어 있습니다. 현재 `src/`에는 `App.tsx`, `main.tsx`, `index.css`만 존재하며, 도메인별 폴더는 필요할 때 직접 생성합니다.
- 정적 자산은 `public/`에 두고, 새 아이콘이나 이미지가 필요하면 이 디렉터리에 SVG/PNG를 추가하세요.
- 루트(`../..`)에는 모바일·백엔드 프로젝트용 디렉터리가 같이 존재합니다. 다른 영역은 건드리지 말고 프런트엔드 관련 변경만 이 폴더 안에서 진행합니다.
- 문서화는 `README.md`, `AGENTS.md`를 우선 갱신하고, 추가 지침은 루트 `.github/` 워크플로를 참고합니다.

## Build, Test, and Development Commands
- `cd frontend/@ssu-time/frontend && npm install`: 프런트엔드 의존성 설치. 새 패키지 추가 시 `package.json`과 `package-lock.json`을 커밋합니다.
- `npm run dev`: 로컬 개발 서버(포트 5173 기본값)를 실행합니다.
- `npm run build`: TypeScript 프로젝트 참조를 빌드한 뒤 Vite 프로덕션 번들을 생성합니다.
- `npm run lint`: ESLint 규칙을 실행해 코드 스타일과 잠재 버그를 점검합니다.
- `npm run preview`: 배포 번들을 로컬에서 확인할 때 사용합니다.

## Coding Style & Naming Conventions
- TypeScript + React를 기본으로 하며 ESLint(typescript-eslint, react-hooks, react-refresh)를 사용합니다. 모든 변경은 `npm run lint` 경고 상태를 유지하거나 줄이는 방향으로 진행하세요.
- Tailwind 클래스를 우선 사용하고, 반복되는 패턴은 컴포넌트화하거나 `clsx` 유틸을 활용합니다. 컴포넌트 파일은 PascalCase, 훅은 camelCase로 작성합니다.
- 전역 스타일은 `index.css`에서만 정의하고, 추가 CSS가 필요하면 Tailwind 플러그인 또는 `@layer`를 통해 선언하세요.

## Testing Guidelines
- 테스트 러너는 아직 연결돼 있지 않습니다. 테스트가 필요하면 Vitest + Testing Library를 도입하고 `src/__tests__/` 또는 기능 폴더 옆에 `*.test.tsx`로 배치하세요.
- 초기 단계에서는 핵심 로직(시간 계산, 협업 흐름 등)을 함수 단위로 분리해 단위 테스트를 추가하는 전략을 권장합니다.

## Commit & Pull Request Guidelines
- 커밋 메시지는 `type: summary` 형태의 컨벤셔널 커밋을 사용하며, 필요한 경우 한국어 설명을 붙여도 됩니다. 예: `feat: 추가 로그인 라우트`.
- 하나의 커밋에는 관련된 변경만 담고, PR 설명에는 변경 요약, 테스트 결과, 관련 이슈/티켓 링크를 포함하세요. UI 변경은 스크린샷이나 GIF를 첨부하면 리뷰가 수월해집니다.
- 민감한 `.env` 파일은 예시만 커밋하고 실제 값은 배포 채널을 통해 공유하세요.
