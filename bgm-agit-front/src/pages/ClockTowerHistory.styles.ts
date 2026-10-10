import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const Box = styled.div`
  padding: 10px;
`;

export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ bgColor }) => bgColor};
  color: #fff;
  padding: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 14px;
  }
`;

export const TitleBox = styled.div<WithTheme>`
  h2 {
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: 6px;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const Badges = styled.div`
  display: flex;
  gap: 12px;
`;

export const Badge = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;

  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
  strong {
    font-size: ${({ theme }) => theme.sizes.xlarge};
  }
`;

export const SectionTitle = styled.h3<WithTheme>`
  margin: 22px 0 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  @media (max-width: 844px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div<WithTheme>`
  display: flex;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  background: #fff;
  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
`;

export const Thumb = styled.div`
  flex: 0 0 72px;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  background: #f1efe9;
  img {
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
  font-size: 26px;
`;

export const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CardTitle = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
`;

export const Count = styled.span`
  font-size: 13px;
  color: #fff;
  background: #482768;
  padding: 2px 10px;
  border-radius: 10px;
`;

export const Last = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const MonthlyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const MonthlyItem = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;

  span {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.navColor};
  }
  strong {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.subColor};
  }
`;

export const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;
