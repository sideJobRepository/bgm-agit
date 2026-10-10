import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, cardStyle, focusRing, inputStyle, type ButtonVariant } from '../styles/mixins.ts';

const c = theme.colors;

export const Box = styled.div`
  max-width: 760px;
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

// $fill 이 있으면 개편 전처럼 그 색으로 꽉 채운 버튼 + 흰 글씨(수정 남색·삭제 빨강·저장 초록·목록/취소 갈색)
export const Button = styled.button<{ $variant?: ButtonVariant; $fill?: string } & WithTheme>`
  ${({ $variant }) => buttonStyle($variant ?? 'primary', 'md')};

  ${({ $fill }) =>
    $fill &&
    `
    background: ${$fill};
    border-color: ${$fill};
    color: ${c.white};

    &:hover:not(:disabled) {
      background: ${$fill};
      border-color: ${$fill};
      color: ${c.white};
      opacity: 0.9;
    }
  `}
`;

// 상세: 포스터 + 정보 카드
export const DetailCard = styled.div`
  ${cardStyle};
  display: flex;
  gap: ${theme.space.xl};
  padding: ${theme.space.xl};

  @media ${theme.device.mobile} {
    flex-direction: column;
    align-items: center;
    gap: ${theme.space.lg};
    padding: ${theme.space.lg};
  }
`;

export const DetailInfo = styled.div`
  flex: 1;
  min-width: 0;

  @media ${theme.device.mobile} {
    width: 100%;
  }
`;

export const Cover = styled.div`
  flex: 0 0 auto;
  width: 100%;
  max-width: 280px;
  aspect-ratio: 3 / 4;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${c.surfaceAlt};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media ${theme.device.mobile} {
    max-width: 220px;
  }
`;

export const NoImage = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${c.navColor};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
`;

export const DetailTitle = styled.h2<WithTheme>`
  margin: 0;
  color: ${c.subColor};
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.3;
  word-break: keep-all;

  @media ${theme.device.mobile} {
    font-size: 22px;
  }
`;

export const DetailMeta = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
  margin-top: ${theme.space.lg};

  span {
    ${badgeStyle('neutral')};
    padding: 6px 12px;
    font-size: 14px;
  }

  span:first-child {
    ${badgeStyle('primary')};
    padding: 6px 12px;
    font-size: 14px;
  }
`;

export const FormTitle = styled.h2<WithTheme>`
  margin: 0 0 ${theme.space.xl};
  padding-bottom: ${theme.space.lg};
  border-bottom: 2px solid ${c.primary};
  color: ${c.subColor};
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;

  @media ${theme.device.mobile} {
    font-size: 22px;
  }
`;

export const Row = styled.div`
  display: flex;
  gap: ${theme.space.md};

  @media ${theme.device.mobile} {
    flex-wrap: wrap;
  }
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 140px;
  margin-bottom: ${theme.space.lg};

  > label {
    color: ${c.subColor};
    font-size: 14px;
    font-weight: 700;
  }

  input[type='text'],
  input[type='number'] {
    ${inputStyle};

    &:focus {
      border-color: ${c.info};
    }
  }
`;

export const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.space.md};
  min-width: 0;
`;

// 개편 전: 남색 채운 버튼 + 흰 글씨
export const FileButton = styled.label<WithTheme>`
  ${buttonStyle('secondary', 'md')};
  flex-shrink: 0;
  background: ${c.info};
  border-color: ${c.info};
  color: ${c.white};

  &:hover:not(:disabled) {
    background: ${c.info};
    opacity: 0.9;
  }
`;

export const FileName = styled.span<WithTheme>`
  min-width: 0;
  color: ${c.navColor};
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PreviewBox = styled.div`
  margin-top: ${theme.space.sm};

  img {
    display: block;
    width: 100%;
    max-width: 220px;
    border: 1px solid ${c.border};
    border-radius: ${theme.radius.md};
  }
`;

export const CheckLine = styled.label<WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.space.sm};
  min-height: 44px;
  margin-top: ${theme.space.xs};
  color: ${c.navColor};
  font-size: 14px;
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    accent-color: ${c.primary};
    ${focusRing};
  }
`;
