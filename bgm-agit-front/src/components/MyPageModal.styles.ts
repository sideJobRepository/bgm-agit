import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle, inputStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const ModalWrapper = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.lg};
  width: 420px;
  max-width: 100%;
  margin: 0 auto;
  padding: ${theme.space.xl};
  border-radius: ${theme.radius.lg};
  background-color: ${c.surface};

  @media ${theme.device.mobile} {
    width: calc(100vw - 32px);
    padding: 20px ${theme.space.lg} ${theme.space.xl};
  }
`;

// 닫기 아이콘 줄. 아이콘을 44px 터치 영역으로 키운다
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
  margin-bottom: ${theme.space.xs};

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

export const BottomModalBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 14px;

  /* 수정하기·비밀번호 변경 같은 주 동작 */
  button {
    ${buttonStyle('primary', 'md')}
    width: 100%;
    margin-top: ${theme.space.xs};
  }
`;

export const MahjongBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  margin-top: ${theme.space.xs};
  padding-top: ${theme.space.lg};
  border-top: 1px solid ${c.border};

  p {
    font-size: 13px;
    color: ${c.textMuted};
    text-align: center;
  }

  /* BottomModalBox의 기본 버튼(보라) 대신 보조 스타일로 오버라이드 */
  button {
    ${buttonStyle('secondary', 'md')}
    width: 100%;
    margin-top: 0;
  }

  button.cancel {
    ${buttonStyle('danger', 'md')}
    width: 100%;
    margin-top: 0;
  }
`;

export const PasswordBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: ${theme.space.xs};
  padding-top: 20px;
  border-top: 1px solid ${c.border};

  h3 {
    margin: 0;
    font-family: ${theme.fonts.body};
    font-size: 16px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${c.textStrong};
    text-align: left;
  }
`;

export const InputBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;

  label {
    font-size: 13px;
    font-weight: 700;
    color: ${c.textBody};
    white-space: nowrap;
  }

  input {
    ${inputStyle}
  }

  /* 읽기 전용 값(가입일자·이름)은 입력칸이 아니라 값처럼 보이게 */
  .readonly-input {
    min-height: 0;
    padding: 2px 0;
    border: none;
    background-color: transparent;
    color: ${c.textStrong};
    font-weight: 600;

    &:focus {
      box-shadow: none;
    }
  }
`;
