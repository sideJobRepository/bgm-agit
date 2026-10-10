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

export const SectionTitle = styled.h3<WithTheme>`
  margin: 26px 0 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const CharViewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CharViewItem = styled.div<WithTheme>`
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
  padding: 12px 14px;
  background: #fff;
`;

export const CharHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CharName = styled.span<WithTheme>`
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const TypeTag = styled.span.withConfig({ shouldForwardProp: p => p !== 'color' })<{ color: string }>`
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  background: ${({ color }) => color};
`;

export const CharDesc = styled.div<WithTheme>`
  margin-top: 6px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  line-height: 1.5;
  white-space: pre-line;
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
      border-color: #4a2c82;
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
  background: #4a2c82;
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

export const CharEditList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CharEditRow = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
  padding: 10px;

  textarea {
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 16px;
    font-family: inherit;
    resize: vertical;
    &:focus {
      outline: none;
      border-color: #4a2c82;
    }
  }
`;

export const CharLineTop = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    min-width: 0;
    height: 42px;
    padding: 0 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
  }
  select {
    flex: 0 0 110px;
    height: 42px;
    padding: 0 8px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
  }
`;

export const RemoveBtn = styled.button`
  flex: 0 0 auto;
  padding: 0 12px;
  background: #fff;
  color: #ff5e57;
  border: 1px solid #ff5e57;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
`;

export const AddBtn = styled.button<WithTheme>`
  margin-top: 10px;
  align-self: flex-start;
  padding: 9px 16px;
  background: #fff;
  color: #4a2c82;
  border: 1px dashed #4a2c82;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`;

export const Empty = styled.div<WithTheme>`
  text-align: center;
  padding: 24px 0;
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;
