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

// 관리자에겐 표지 칸이 끌어놓기 자리도 된다($droppable). 끌고 있는 동안 테두리로 알려준다
export const Cover = styled.div<{ $droppable?: boolean; $active?: boolean }>`
  display: block;
  flex: 0 0 auto;
  width: 100%;
  max-width: 280px;
  aspect-ratio: 3 / 4;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${c.surfaceAlt};
  border: 2px ${({ $droppable }) => ($droppable ? 'dashed' : 'solid')} ${({ $active }) => ($active ? c.info : 'transparent')};
  cursor: ${({ $droppable }) => ($droppable ? 'pointer' : 'default')};

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
  white-space: pre-line;
  text-align: center;
  line-height: 1.6;
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

// 상세·등록 폼의 표지 후보 영역
export const CoverPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.sm};
  margin-top: ${theme.space.lg};
`;

export const CoverHint = styled.p<WithTheme>`
  margin: 0;
  color: ${c.textMuted};
  font-size: 14px;
`;

// 표지를 찾을 사이트 링크. 게임명으로 검색한 화면을 새 탭으로 연다
export const SearchLinks = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};

  a,
  button {
    ${buttonStyle('secondary', 'md')};
    text-decoration: none;
  }

  a[aria-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
  }
`;

// 머미로그 표지 후보. 상세에선 누르면 바로 저장, 등록 폼에선 고르기
export const CandidateGrid = styled.div<WithTheme>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: ${theme.space.sm};

  button {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    border: 1px solid ${c.border};
    border-radius: ${theme.radius.md};
    background: ${c.white};
    color: ${c.subColor};
    font-size: 12px;
    text-align: left;
    cursor: pointer;
    ${focusRing};
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  button[aria-pressed='true'] {
    border: 2px solid ${c.info};
  }

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
  }
`;
