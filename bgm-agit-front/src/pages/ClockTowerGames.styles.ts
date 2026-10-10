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

export const CreateButton = styled.button<WithTheme>`
  padding: 8px 16px;
  background: #fff;
  color: #4a2c82;
  border: none;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;
`;

export const SearchRow = styled.div<WithTheme>`
  display: flex;
  gap: 8px;
  margin: 18px 0;

  input {
    flex: 1;
    height: 42px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 6px;
    font-size: 16px;
  }
  button {
    padding: 0 18px;
    background: #4a2c82;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 844px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

export const Card = styled.div<WithTheme>`
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
`;

export const Cover = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #f1efe9;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const NoImage = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.navColor};
  font-size: ${({ theme }) => theme.sizes.small};
  letter-spacing: 1px;
`;

export const CardBody = styled.div`
  padding: 12px 14px;

  @media (max-width: 844px) {
    padding: 10px;
  }
`;

export const CardTitle = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 6px;

  @media (max-width: 844px) {
    font-size: ${({ theme }) => theme.sizes.medium};
  }
`;

export const Meta = styled.div<WithTheme>`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};

  @media (max-width: 844px) {
    gap: 8px;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
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
