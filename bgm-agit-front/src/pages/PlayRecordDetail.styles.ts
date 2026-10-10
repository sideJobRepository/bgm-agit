import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export const Box = styled.div`
  padding: 16px;
  max-width: 720px;
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

export const DetailHead = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`;

export const Thumb = styled.div`
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  border-radius: 10px;
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
  font-size: 34px;
`;

export const DetailTitle = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const DetailMeta = styled.div<WithTheme>`
  margin-top: 4px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const SectionTitle = styled.h3<WithTheme>`
  margin: 22px 0 10px;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const ViewChip = styled.span<WithTheme>`
  padding: 5px 12px;
  border-radius: 16px;
  background: #f1efe9;
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.small};
`;

export const Memo = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};
  line-height: 1.6;
  white-space: pre-line;
`;

export const FormTitle = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 18px;
`;

export const NoticeBox = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
`;

export const NoticeLine = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.small};
  color: #8a5a00;
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;

  label {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.subColor};
  }
  select,
  input[type='date'],
  textarea {
    padding: 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
    &:focus {
      outline: none;
      border-color: #1a7d55;
    }
  }
  select,
  input[type='date'] {
    height: 42px;
  }
  textarea {
    resize: vertical;
    font-family: inherit;
  }
`;
