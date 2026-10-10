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

// 예전엔 bgColor 색 띠였다. 지금은 흰 바탕 제목 영역이라 bgColor 는 받기만 하고 쓰지 않는다(포인트 색 하나로 통일)
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.xl};
  padding-bottom: ${theme.space.xl};
  border-bottom: 2px solid ${c.primary};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding-bottom: ${theme.space.lg};
  }
`;

export const TitleBox = styled.div<WithTheme>`
  ${sectionTitleStyle};
  min-width: 0;

  h2 {
    font-size: 30px;
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

export const CreateButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'md')};
`;

export const GhostButton = styled.button<WithTheme>`
  ${buttonStyle('secondary', 'md')};
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
  color: ${c.textSubtle};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
`;

export const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CardTitle = styled.div<WithTheme>`
  color: ${c.textStrong};
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
  color: ${c.textBody};
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Writer = styled.div<WithTheme>`
  margin-top: ${theme.space.xs};
  color: ${c.textMuted};
  font-size: 13px;
`;

export const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  padding: 56px 0;
  text-align: center;
  color: ${c.textMuted};
  font-size: 15px;
  font-weight: 600;
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: ${theme.space.xl};
`;
