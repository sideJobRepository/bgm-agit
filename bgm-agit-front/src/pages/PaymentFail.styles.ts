import styled from 'styled-components';
import { theme } from '../styles/theme.ts';
import { buttonStyle, cardStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const ResultBox = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 360px;
  align-items: center;
  justify-content: center;
  padding: 40px ${theme.space.lg};
`;

export const ResultCard = styled.div`
  ${cardStyle}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.space.md};
  width: min(440px, 100%);
  padding: 40px ${theme.space.xl} ${theme.space.xxl};
  text-align: center;

  h2 {
    margin: 0;
    color: ${c.textStrong};
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  p {
    color: ${c.textMuted};
    font-size: 15px;
    line-height: 1.6;
    word-break: keep-all;
  }

  /* 첫 문단은 실패 사유라 본문색으로 한 단계 올린다 */
  h2 + p {
    color: ${c.textBody};
    font-weight: 600;
  }

  /* 예전 색: 남색 채움·흰 글씨 */
  button {
    ${buttonStyle('primary', 'md')}
    width: 100%;
    margin-top: ${theme.space.md};
    background: ${c.blueColor};
    border-color: ${c.blueColor};
    color: ${c.white};

    &:hover:not(:disabled) {
      background: ${c.blueColor};
      border-color: ${c.blueColor};
      opacity: 0.9;
    }
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.xxl} 20px;

    h2 {
      font-size: 20px;
    }
  }
`;

export const IconCircle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: ${theme.space.xs};
  border-radius: ${theme.radius.pill};
  background: ${c.surfaceAlt};
  color: ${c.textMuted};
  font-size: 26px;
`;
