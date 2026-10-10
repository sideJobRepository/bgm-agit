import { css } from 'styled-components';
import { theme } from './theme.ts';

// 화면들이 같이 쓰는 스타일 조각. styled 템플릿 안에서 ${buttonStyle('primary')} 처럼 끼워 쓴다.
// 색·모서리·그림자는 전부 theme 에서 온다 — 여기에 hex 를 새로 박지 말 것

const c = theme.colors;

export const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${c.primary};
    outline-offset: 2px;
  }
`;

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background: ${c.primary};
    color: ${c.onPrimary};
    border-color: ${c.primary};
    &:hover:not(:disabled) {
      background: ${c.primaryHover};
      border-color: ${c.primaryHover};
    }
  `,
  secondary: css`
    background: ${c.surface};
    color: ${c.textStrong};
    border-color: ${c.borderStrong};
    &:hover:not(:disabled) {
      background: ${c.surfaceAlt};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${c.primary};
    border-color: transparent;
    &:hover:not(:disabled) {
      background: ${c.primarySoft};
    }
  `,
  danger: css`
    background: ${c.surface};
    color: ${c.danger};
    border-color: ${c.danger};
    &:hover:not(:disabled) {
      background: ${c.danger};
      color: ${c.onPrimary};
    }
  `,
  dark: css`
    background: ${c.textStrong};
    color: ${c.onPrimary};
    border-color: ${c.textStrong};
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  `,
};

const BUTTON_SIZES: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    height: 36px;
    padding: 0 14px;
    font-size: 14px;
  `,
  md: css`
    height: 44px;
    padding: 0 20px;
    font-size: 15px;
  `,
  lg: css`
    height: 52px;
    padding: 0 28px;
    font-size: 16px;
  `,
};

export const buttonStyle = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md') => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: ${theme.radius.md};
  font-family: inherit;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
  ${BUTTON_SIZES[size]}
  ${BUTTON_VARIANTS[variant]}
  ${focusRing}

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

export const cardStyle = css`
  background: ${c.surface};
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.sm};
`;

export type BadgeTone = 'primary' | 'accent' | 'neutral' | 'success' | 'danger';

const BADGE_TONES: Record<BadgeTone, ReturnType<typeof css>> = {
  primary: css`
    background: ${c.primarySoft};
    color: ${c.primary};
  `,
  accent: css`
    background: ${c.accentSoft};
    color: ${c.accentText};
  `,
  neutral: css`
    background: ${c.surfaceAlt};
    color: ${c.textMuted};
  `,
  success: css`
    background: ${c.success}1A;
    color: ${c.success};
  `,
  danger: css`
    background: ${c.danger}1A;
    color: ${c.danger};
  `,
};

export const badgeStyle = (tone: BadgeTone = 'primary') => css`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: ${theme.radius.pill};
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  ${BADGE_TONES[tone]}
`;

// input · select · textarea. 모바일은 16px(iOS 자동 줌 방지)
export const inputStyle = css`
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid ${c.borderStrong};
  border-radius: ${theme.radius.md};
  background: ${c.surface};
  color: ${c.textStrong};
  font-family: inherit;
  font-size: 15px;

  &::placeholder {
    color: ${c.textSubtle};
  }

  &:focus {
    outline: none;
    border-color: ${c.primary};
    box-shadow: 0 0 0 3px ${c.primarySoft};
  }

  @media ${theme.device.mobile} {
    font-size: 16px;
  }
`;

// 섹션 제목(h2) + 설명(p) 묶음
export const sectionTitleStyle = css`
  h2 {
    margin: 0;
    color: ${c.textStrong};
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  p {
    margin-top: 6px;
    color: ${c.textMuted};
    font-size: 15px;
  }

  @media ${theme.device.mobile} {
    h2 {
      font-size: 20px;
    }

    p {
      font-size: 14px;
    }
  }
`;

// 표. 감싸는 쪽에 overflow-x: auto 를 둘 것
export const tableStyle = css`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    padding: 12px;
    background: ${c.surfaceAlt};
    color: ${c.textMuted};
    font-weight: 700;
    text-align: center;
    border-bottom: 1px solid ${c.border};
  }

  td {
    padding: 12px;
    color: ${c.textBody};
    text-align: center;
    border-bottom: 1px solid ${c.border};
  }

  tbody tr:hover td {
    background: ${c.surfaceSunken};
  }
`;
