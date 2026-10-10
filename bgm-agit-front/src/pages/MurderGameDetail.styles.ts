import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export const Box = styled.div`
  padding: 16px;
  max-width: 760px;
  margin: 0 auto;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

export const Button = styled.button.withConfig({ shouldForwardProp: p => p !== 'color' })<{ color: string } & WithTheme>`
  padding: 8px 16px;
  background: ${({ color }) => color};
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.medium};
  &:hover {
    opacity: 0.9;
  }
`;

export const Cover = styled.div`
  width: 100%;
  max-width: 280px;
  aspect-ratio: 3 / 4;
  background: #f1efe9;
  border-radius: 10px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 844px) {
    max-width: 220px;
  }
`;

export const NoImage = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.navColor};
`;

export const DetailTitle = styled.h2<WithTheme>`
  margin-top: 16px;
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const DetailMeta = styled.div<WithTheme>`
  display: flex;
  gap: 14px;
  margin-top: 10px;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const FormTitle = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 18px;
`;

export const Row = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: 844px) {
    flex-wrap: wrap;
  }
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 140px;
  margin-bottom: 16px;

  > label {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.subColor};
  }
  input[type='text'],
  input[type='number'] {
    height: 42px;
    padding: 0 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
    &:focus {
      outline: none;
      border-color: #093a6e;
    }
  }
`;

export const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const FileButton = styled.label<WithTheme>`
  display: inline-flex;
  align-items: center;
  padding: 9px 16px;
  background: #093a6e;
  color: #fff;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    opacity: 0.9;
  }
`;

export const FileName = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PreviewBox = styled.div`
  margin-top: 8px;
  img {
    max-width: 220px;
    width: 100%;
    border-radius: 8px;
  }
`;

export const CheckLine = styled.label<WithTheme>`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  cursor: pointer;
`;
