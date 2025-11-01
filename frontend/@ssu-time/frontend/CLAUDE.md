# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (Vite) on localhost:5173
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint with TypeScript support

### Testing
No test framework is currently configured in this project.

## Project Overview

A React 18 + TypeScript + Vite application for PDF presentation and script management with Korean language support. Built with clean architecture principles and comprehensive design system.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router DOM v6
- **State**: Jotai (atomic state management)
- **PDF Processing**: PDF.js (pdfjs-dist)
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Styling**: Design system with TypeScript theme tokens

## Architecture

### Project Structure
```
src/
├── components/
│   ├── ui/              # Base reusable components (Button, Typography, etc.)
│   ├── ScriptModal/     # Compound modal components
│   ├── upload/          # File upload components
│   └── auth/            # Authentication components
├── pages/               # Route-level page components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions (PDF processing)
├── theme/               # Design system tokens
│   ├── colors.ts        # Color palette
│   ├── typography.ts    # Typography scales
│   └── spacing.ts       # Spacing/padding tokens
└── env.ts              # Environment configuration
```

### Design Patterns

#### 1. Compound Components Pattern
Used for complex UI components like `ScriptModal`:

```typescript
// Main orchestrator
<ScriptModal pdfFile={file} onClose={handleClose}>
  <ScriptModalOverlay />
  <ScriptModalContainer>
    <ScriptModalContent>
      <ScriptModalPreview />
      <ScriptModalDivider />
      <ScriptModalForm />
    </ScriptModalContent>
    <ScriptModalFooter />
  </ScriptModalContainer>
</ScriptModal>
```

Benefits:
- Single Responsibility Principle
- High composability and reusability
- Independent testing of sub-components
- Clean separation of concerns

#### 2. Design System Architecture
Centralized theme tokens with TypeScript support:

```typescript
// theme/colors.ts
export const colors = {
  primary: { normal: '#3282FF', strong: '#0A64FF' },
  label: { normal: '#171719', alternative: '#78787B' },
  semantic: { error: '#FF3742', success: '#00C851' }
} as const;

// Component usage
const buttonStyles = {
  backgroundColor: colors.primary.normal,
  color: colors.static.white
};
```

#### 3. Polymorphic Components
Typography component supports semantic HTML:

```typescript
<Typography variant="title1" component="h1">Title</Typography>
<Typography variant="body" component="p">Paragraph</Typography>
```

#### 4. Custom Hooks Pattern
Encapsulates reusable logic:

```typescript
const { currentPage, goToPage, canGoNext } = usePageNumber({
  totalPages: 10,
  initialPage: 1
});
```

### Clean Code Principles

#### 1. Single Responsibility
Each component has one clear purpose:
- `Button` - handles button interactions and styling
- `ScriptModalPreview` - displays PDF preview only
- `ScriptModalForm` - manages form inputs only

#### 2. Comprehensive TypeScript
All components use proper TypeScript interfaces:

```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### 3. Performance Optimizations
- `useCallback` for event handlers to prevent re-renders
- Conditional state updates to avoid unnecessary re-renders
- Efficient PDF parsing with multiple fallback strategies

#### 4. Error Handling
Defensive programming patterns:

```typescript
// Null safety
onSlideChange?.(slideNumber, content);

// Input validation
if (!file || file.type !== 'application/pdf') {
  reject(new Error('올바른 PDF 파일이 아닙니다.'));
}

// Error boundaries
catch (error) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'PDF 파일을 읽을 수 없습니다.';
  setError(errorMessage);
}
```

#### 5. Barrel Exports
Clean import/export patterns:

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Typography } from './Typography';

// Usage
import { Button, Typography } from '../ui';
```

### Component Guidelines

#### Creating New Components
1. **File Structure**: Use PascalCase for component files
2. **TypeScript**: Define comprehensive props interfaces
3. **Design Tokens**: Use theme tokens instead of hardcoded values
4. **Documentation**: Add JSDoc comments for complex props
5. **Error Handling**: Include proper error states and validation

#### Example Component Structure:
```typescript
// ComponentName.tsx
import React from 'react';
import { colors, typography } from '../../theme';

export interface ComponentNameProps {
  /** Required prop description */
  requiredProp: string;
  /** Optional prop with default */
  optionalProp?: boolean;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  requiredProp,
  optionalProp = false,
}) => {
  return (
    <div style={{
      color: colors.label.normal,
      ...typography.body.normal
    }}>
      {/* Component content */}
    </div>
  );
};
```

### State Management

#### Local State First
Use React's built-in state for component-specific data:
```typescript
const [currentPage, setCurrentPage] = useState<number>(1);
const [loading, setLoading] = useState<boolean>(false);
```

#### Jotai for Global State
Use atoms for app-wide state (when needed):
```typescript
// atoms/presentation.ts
export const currentSlideAtom = atom<number>(1);
export const slidesAtom = atom<SlideInput[]>([]);
```

### PDF Processing

The app includes sophisticated PDF handling:

1. **Page Count Extraction**: Multiple parsing strategies for reliability
2. **File Validation**: Comprehensive PDF format checking
3. **Error Recovery**: Graceful handling of corrupted files
4. **Performance**: Efficient binary analysis without full parsing

### Korean Language Support

- **Font**: Pretendard family for optimal Korean rendering
- **Content**: Korean UI text and error messages
- **Internationalization**: Ready for i18n expansion

### Development Workflow

1. **Linting**: Run `npm run lint` before commits
2. **Type Checking**: TypeScript strict mode enabled
3. **Component Testing**: Test components in isolation
4. **Design System**: Use theme tokens for all styling
5. **Clean Code**: Follow established patterns and principles