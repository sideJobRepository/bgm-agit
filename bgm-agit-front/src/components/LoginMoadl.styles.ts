import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle, focusRing, inputStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const LoginModalWrapper = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.lg};
  width: 400px;
  max-width: 100%;
  padding: ${theme.space.xl};
  border-radius: ${theme.radius.lg};
  background-color: ${c.surface};

  @media ${theme.device.mobile} {
    width: 100%;
    padding: 20px ${theme.space.lg} ${theme.space.xl};
  }
`;

// 닫기 아이콘 줄. 아이콘 자체를 44px 터치 영역으로 키우고 위·오른쪽 여백으로 끌어 올린다
export const TopModalBox = styled.div<WithTheme>`
  display: flex;
  justify-content: flex-end;
  margin: -12px -12px -${theme.space.xl} 0;

  svg {
    width: 44px;
    height: 44px;
    padding: 11px;
    border-radius: ${theme.radius.md};
    color: ${c.textMuted};
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: ${c.surfaceAlt};
      color: ${c.textStrong};
    }
  }
`;

export const CenterModalBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.space.md};
  margin-bottom: ${theme.space.sm};

  img {
    height: 48px;
    border-radius: ${theme.radius.pill};
  }

  h2 {
    margin: 0;
    font-family: ${theme.fonts.body};
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${c.textStrong};
  }
`;

export const FormBox = styled.form<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Input = styled.input<WithTheme>`
  ${inputStyle}
`;

export const SubmitButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'lg')}
  width: 100%;
  margin-top: ${theme.space.sm};
`;

export const SwitchLine = styled.div<WithTheme>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${theme.space.xs};
  font-size: 14px;
  color: ${c.textMuted};

  button {
    min-height: 44px;
    padding: 0 ${theme.space.sm};
    border: none;
    border-radius: ${theme.radius.sm};
    background: transparent;
    color: ${c.primary};
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    ${focusRing}
  }
`;

export const Divider = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  gap: ${theme.space.md};
  color: ${c.textMuted};
  font-size: 13px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${c.border};
  }
`;

// 소셜 로그인 버튼. 브랜드 로고 이미지를 그대로 두고 버튼은 중립 테두리형으로 둔다
export const BottomModalBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 10px;

  button {
    ${buttonStyle('secondary', 'md')}
    position: relative;
    width: 100%;
    height: 48px;
    font-weight: 600;

    img {
      position: absolute;
      left: ${theme.space.lg};
      width: 24px;
      height: 24px;
    }
  }
`;
