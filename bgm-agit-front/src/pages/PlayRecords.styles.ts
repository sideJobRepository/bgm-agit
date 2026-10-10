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
    gap: 10px;
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

export const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const CreateButton = styled.button<WithTheme>`
  padding: 8px 16px;
  background: #fff;
  color: #1a7d55;
  border: none;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;
`;

export const GhostButton = styled.button<WithTheme>`
  padding: 8px 16px;
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 18px;

  @media (max-width: 844px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div<WithTheme>`
  display: flex;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  background: #fff;
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
`;

export const Thumb = styled.div`
  flex: 0 0 84px;
  width: 84px;
  height: 84px;
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
  font-size: 30px;
`;

export const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CardTitle = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const Meta = styled.div<WithTheme>`
  display: flex;
  gap: 12px;
  margin: 4px 0;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const Participants = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Writer = styled.div<WithTheme>`
  margin-top: 4px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 24px;
`;
