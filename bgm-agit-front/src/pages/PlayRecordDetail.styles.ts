import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, cardStyle, inputStyle, type ButtonVariant } from '../styles/mixins.ts';

const c = theme.colors;

export const Box = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: ${theme.space.xl} ${theme.space.lg} ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} ${theme.space.lg} ${theme.space.xl};
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
  margin-bottom: ${theme.space.lg};

  @media ${theme.device.mobile} {
    > button {
      flex: 1;
    }
  }
`;

export const Button = styled.button<{ $variant?: ButtonVariant } & WithTheme>`
  ${({ $variant }) => buttonStyle($variant ?? 'primary', 'md')};
`;

export const DetailHead = styled.div`
  ${cardStyle};
  display: flex;
  gap: ${theme.space.lg};
  align-items: center;
  padding: ${theme.space.xl};

  > div:last-child {
    min-width: 0;
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

export const Thumb = styled.div`
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${c.surfaceAlt};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const NoImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${c.textSubtle};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
`;

export const DetailTitle = styled.h2<WithTheme>`
  margin: 0 0 ${theme.space.sm};
  color: ${c.textStrong};
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.3;
  word-break: keep-all;

  @media ${theme.device.mobile} {
    font-size: 20px;
  }
`;

export const DetailMeta = styled.div<WithTheme>`
  margin-top: ${theme.space.xs};
  color: ${c.textMuted};
  font-size: 14px;
`;

export const SectionTitle = styled.h3<WithTheme>`
  margin: ${theme.space.xl} 0 ${theme.space.md};
  color: ${c.textStrong};
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
`;

export const ViewChip = styled.span<WithTheme>`
  ${badgeStyle('primary')};
  padding: 6px 12px;
  font-size: 14px;
`;

export const Memo = styled.div<WithTheme>`
  ${cardStyle};
  padding: ${theme.space.lg};
  color: ${c.textBody};
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-line;
`;

export const FormTitle = styled.h2<WithTheme>`
  margin: 0 0 ${theme.space.xl};
  padding-bottom: ${theme.space.lg};
  border-bottom: 2px solid ${c.primary};
  color: ${c.textStrong};
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;

  @media ${theme.device.mobile} {
    font-size: 22px;
  }
`;

// 참가자 중 이미 플레이한 사람 안내. 정보성 강조라 골드 계열
export const NoticeBox = styled.div`
  margin-top: ${theme.space.sm};
  display: flex;
  flex-direction: column;
  gap: ${theme.space.xs};
  padding: ${theme.space.md} ${theme.space.lg};
  background: ${c.accentSoft};
  border: 1px solid ${c.accent};
  border-radius: ${theme.radius.md};
`;

export const NoticeLine = styled.div<WithTheme>`
  color: ${c.accentText};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: ${theme.space.lg};

  label {
    color: ${c.textStrong};
    font-size: 14px;
    font-weight: 700;
  }

  select,
  input[type='date'],
  textarea {
    ${inputStyle};
  }

  textarea {
    resize: vertical;
    line-height: 1.5;
  }
`;
