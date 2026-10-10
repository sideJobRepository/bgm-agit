import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, cardStyle, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const Box = styled.div`
  padding: ${theme.space.xl} ${theme.space.lg} ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} ${theme.space.lg} ${theme.space.xl};
  }
`;

// 개편 전처럼 bgColor 색 띠 + 흰 글씨. 색 띠라 안쪽 여백(예전 값 20px/14px)을 같이 준다
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.xl};
  padding: 20px;
  background-color: ${({ bgColor }) => bgColor};
  color: ${c.white};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding: 14px;
  }
`;

export const TitleBox = styled.div<WithTheme>`
  ${sectionTitleStyle};
  min-width: 0;

  h2 {
    font-family: ${({ theme }) => theme.fonts.displayEn};
    color: ${c.white};
    font-size: 30px;
  }

  p {
    color: ${c.white};
  }

  @media ${({ theme }) => theme.device.mobile} {
    h2 {
      font-size: 24px;
    }
  }
`;

export const HeaderButtons = styled.div`
  display: flex;
  gap: ${theme.space.sm};
  flex-shrink: 0;

  @media ${theme.device.mobile} {
    > button {
      flex: 1;
    }
  }
`;

// 개편 전: 색 띠 위 흰 버튼 + 초록 글씨
export const CreateButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'md')};
  background: ${c.white};
  border-color: ${c.white};
  color: ${c.success};

  &:hover:not(:disabled) {
    background: ${c.white};
    border-color: ${c.white};
    opacity: 0.9;
  }
`;

// 개편 전: 투명 바탕 + 흰 테두리·흰 글씨
export const GhostButton = styled.button<WithTheme>`
  ${buttonStyle('secondary', 'md')};
  background: transparent;
  border-color: ${c.white};
  color: ${c.white};

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.space.lg};
  margin-top: ${theme.space.xl};

  @media ${theme.device.mobile} {
    grid-template-columns: minmax(0, 1fr);
    gap: ${theme.space.md};
    margin-top: ${theme.space.lg};
  }
`;

export const Card = styled.div<WithTheme>`
  ${cardStyle};
  display: flex;
  gap: ${theme.space.lg};
  min-width: 0;
  padding: ${theme.space.lg};
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    border-color: ${c.borderStrong};
    box-shadow: ${theme.shadow.md};
  }

  @media ${theme.device.mobile} {
    gap: ${theme.space.md};
    padding: ${theme.space.md};
  }
`;

export const Thumb = styled.div`
  flex: 0 0 84px;
  width: 84px;
  height: 84px;
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
  color: ${c.navColor};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
`;

export const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CardTitle = styled.div<WithTheme>`
  color: ${c.subColor};
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Meta = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: ${theme.space.sm} 0;

  span {
    ${badgeStyle('neutral')};
  }

  span:last-child {
    ${badgeStyle('primary')};
  }
`;

export const Participants = styled.div<WithTheme>`
  color: ${c.subColor};
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Writer = styled.div<WithTheme>`
  margin-top: ${theme.space.xs};
  color: ${c.navColor};
  font-size: 13px;
`;

export const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  padding: 56px 0;
  text-align: center;
  color: ${c.navColor};
  font-size: 15px;
  font-weight: 600;
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: ${theme.space.xl};
`;
