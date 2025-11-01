# SSU Time Frontend

Landing 페이지와 향후 대시보드 UI를 위한 React + Vite 기반 프로젝트입니다. Tailwind CSS를 기본 스타일 레이어로 사용하며, 최소한의 구조만을 남겨 새로운 기능을 빠르게 확장할 수 있도록 구성했습니다.

## 개발 환경

- Node.js 18+
- npm (또는 pnpm, yarn)
- React 18 / TypeScript / Vite 5
- Tailwind CSS 3

## 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하면 개발 서버가 제공합니다.

## 프로젝트 구조

```
src/
├── App.tsx         # 메인 화면 구성
├── index.css       # Tailwind 엔트리 + 글로벌 스타일
└── main.tsx        # React 진입점
```

필요한 도메인 모듈(페이지, 컴포넌트, API 등)은 `src/` 하위에 자유롭게 추가하세요.

## 품질 관리

- `npm run lint` : ESLint 검사
- Tailwind 클래스를 기본으로 사용하고, 불가피한 경우에만 인라인 스타일을 추가합니다.

## 배포 메모

- 정적 파일은 `public/` 디렉터리에 배치합니다.
- 환경 변수는 Vite 규칙에 따라 `VITE_` prefix를 사용해 정의하세요.
