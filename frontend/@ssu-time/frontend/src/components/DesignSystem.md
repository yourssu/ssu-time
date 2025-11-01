# 디자인 시스템 컴포넌트 설계

HTML 파일 `component.html`을 분석하여 다음과 같은 디자인 시스템을 설계했습니다.

## 1. Design Tokens

### Colors (theme/colors.ts)
```typescript
export const colors = {
  primary: {
    normal: '#3282FF',
    hover: '#2768E3', 
    pressed: '#1F57C7',
    disabled: '#A6C6FF',
  },
  neutral: {
    white: '#FFFFFF',
    gray50: '#F1F2F5',
    gray100: '#EEEEEE', 
    gray300: '#A6A6A6',
    gray500: '#78787B',
    gray900: '#171719',
    black: '#000000',
  },
  semantic: {
    error: '#FF3742',
    warning: '#FF8F00',
    success: '#00C851',
    info: '#17A2B8',
  },
}
```

### Typography (theme/typography.ts)
```typescript
export const typography = {
  title: {
    1: { // 22px, 600 weight - 섹션 주제용
      fontFamily: 'Pretendard',
      fontWeight: 600,
      fontSize: '22px',
      lineHeight: '26px',
      letterSpacing: '-0.02em',
    },
    2: { // 20px, 600 weight
      fontFamily: 'Pretendard', 
      fontWeight: 600,
      fontSize: '20px',
      lineHeight: '24px',
    },
    3: { // 18px, 500 weight
      fontFamily: 'Pretendard',
      fontWeight: 500, 
      fontSize: '18px',
      lineHeight: '21px',
    },
  },
  body: {
    1: { // 16px - 기본 본문
      fontFamily: 'Pretendard',
      fontWeight: 400,
      fontSize: '16px', 
      lineHeight: '19px',
    },
    2: { // 14px - 작은 본문
      fontFamily: 'Pretendard',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '17px', 
    },
  },
  label: { // 13px - 참고내용
    fontFamily: 'Pretendard',
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: '16px',
  },
  caption: { // 12px - 내부 콘텐츠 참고내용
    fontFamily: 'Pretendard',
    fontWeight: 400,
    fontSize: '12px', 
    lineHeight: '14px',
  },
  button: {
    1: { // 16px - 큰 버튼
      fontFamily: 'Pretendard',
      fontWeight: 500,
      fontSize: '16px',
      lineHeight: '19px',
    },
    2: { // 13px - 작은 버튼  
      fontFamily: 'Pretendard',
      fontWeight: 500,
      fontSize: '13px',
      lineHeight: '16px',
    },
  },
}
```

### Spacing (theme/spacing.ts)
```typescript
export const spacing = {
  xs: '4px',
  sm: '8px', 
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '64px',
}

export const padding = {
  xs: '4px 8px',
  sm: '7px 15px', // 작은 버튼
  md: '10px 20px', // 중간 버튼  
  lg: '15px 30px', // 큰 버튼
  xl: '20px 40px',
}
```

## 2. Component Specifications

### Button Component
HTML에서 발견된 버튼 variants:
- **Size**: small (30px), medium (36px), large (48px)
- **Type**: Primary (파란색), Secondary (회색), Outline, Ghost
- **States**: Default, Hover, Active, Disabled, Loading

**사용 예시:**
```jsx
<Button variant="primary" size="medium">
  확인
</Button>

<Button variant="outline" size="small" icon={<AlarmIcon />}>
  알림
</Button>

<Button variant="primary" loading>
  처리중...
</Button>
```

### Input Component  
HTML에서 발견된 입력 필드 특징:
- **Label**: 입력 필드 설명
- **Placeholder**: "설명을 입력하세요" 스타일
- **States**: Default, Focus, Error, Disabled
- **Icons**: 좌측/우측 아이콘 지원

**사용 예시:**
```jsx
<Input 
  label="제목"
  placeholder="제목을 입력하세요"
  leftIcon={<SearchIcon />}
/>

<Input 
  label="설명" 
  error="필수 입력 항목입니다"
  helperText="최대 100자까지 입력 가능합니다"
/>
```

### Typography Component
HTML에서 발견된 텍스트 스타일들:
- **Titles**: 3가지 크기 (22px, 20px, 18px)
- **Body**: 2가지 크기 (16px, 14px) 
- **Label**: 13px - 참고내용용
- **Caption**: 12px - 내부 콘텐츠 참고내용용

**사용 예시:**
```jsx
<Typography variant="title1" color="black">
  섹션에서 주제를 나타낼 때
</Typography>

<Typography variant="label" color="gray500">  
  참고내용을 나타낼 때
</Typography>

<Typography variant="caption" color="gray500">
  내부 콘텐츠의 참고내용을 나타낼 때  
</Typography>
```

## 3. Layout Components

### Modal/Dialog
HTML에서 발견된 모달 특징:
- **Background**: #F1F2F5 (회색 배경)
- **Border Radius**: 12px
- **Max Width**: 340px
- **Padding**: 10px

### Container/Frame
HTML에서 발견된 컨테이너 특징:
- **Auto Layout**: Flexbox 기반
- **Gap**: 10px, 20px 등 일정한 간격
- **Padding**: 다양한 크기 (0px, 15px, 20px 등)
- **Border Radius**: 8px, 12px, 32px

## 4. Interactive States

### Hover Effects
- **Button Primary**: #3282FF → #2768E3
- **Button Secondary**: #F1F2F5 → #EEEEEE  
- **Button Outline**: transparent → #3282FF

### Focus States
- **Input**: Border color 변경 + Box Shadow
- **Button**: Focus ring 표시

### Disabled States  
- **Opacity**: 0.6
- **Cursor**: not-allowed
- **Color**: 비활성화된 색상 사용

## 5. Animation & Transitions
- **Transition Duration**: 0.2s ease
- **Loading Spinner**: 1s linear infinite rotation
- **Hover**: 부드러운 색상 전환

## 6. Usage Guidelines

### 색상 사용법
- **Primary Blue**: 주요 액션, 링크, 활성 상태
- **Neutral Gray**: 텍스트, 배경, 테두리
- **Semantic Colors**: 에러, 경고, 성공 메시지

### 타이포그래피 사용법  
- **Title 1**: 섹션 제목, 페이지 헤더
- **Title 2**: 서브 섹션 제목
- **Title 3**: 카드 제목, 작은 섹션 제목
- **Body 1**: 기본 본문 텍스트
- **Body 2**: 보조 본문 텍스트
- **Label**: 폼 라벨, 참고 정보
- **Caption**: 도움말, 메타 정보

### 간격 사용법
- **Component 내부**: 8px, 12px
- **Component 간**: 16px, 20px  
- **Section 간**: 32px, 40px
- **Page 간**: 64px

이 디자인 시스템을 통해 일관성 있고 확장 가능한 UI 컴포넌트를 구축할 수 있습니다. 