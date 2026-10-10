import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props';

export const Wrapper = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  gap: 16px;
  flex-direction: column;
  align-items: center;
`;

export const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.subColor};
  width: 50%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }

  .count-box {
    display: flex;
    margin-top: 10px;
    gap: 3px;
    align-items: center;

    .title {
      color: ${({ theme }) => theme.colors.blueColor};
      margin-right: 6px;
    }

    input {
      flex: 1;
      border: none;
      width: 100%;
      padding: 4px 4px;
      text-align: center;
      font-size: ${({ theme }) => theme.sizes.small};
      outline: none;
      color: ${({ theme }) => theme.colors.subColor};
      background: transparent;
    }
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;

    h2 {
      color: ${({ theme }) => theme.colors.menuColor};
      font-size: ${({ theme }) => theme.sizes.bigLarge};
      font-weight: ${({ theme }) => theme.weight.bold};
      margin-right: 10px;
      white-space: nowrap;
    }

    svg {
      margin: 3px 4px 0 0;
      font-size: ${({ theme }) => theme.sizes.medium};
    }

    span {
      margin-top: 3px;
      font-size: ${({ theme }) => theme.sizes.medium};
    }

    p {
      padding: 4px 0;
      color: ${({ theme }) => theme.colors.redColor};
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

export const TimeTitle = styled.div<WithTheme>`
  width: 50%;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.menuColor};

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const TimeBox = styled.div<WithTheme>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); // 너비 반응형
  gap: 10px;
  width: 50%;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: repeat(2, 1fr); // 모바일에서는 2열 고정 (선택사항)
    width: 100%;
  }
`;

export const TimeSlotButton = styled.button<WithTheme & { selected: boolean }>`
  -webkit-tap-highlight-color: transparent;
  padding: 10px 14px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ selected, theme }) => (selected ? theme.colors.white : theme.colors.subColor)};
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: ${({ selected, theme }) => (selected ? theme.colors.blueColor : 'white')};
  cursor: pointer;
  transition: all 0.2s;

  /* 일반 룸은 13슬롯이 모바일 2열 = 7행으로 붙는다. 터치 타겟이 작으면 인접 시간대 오탭이 곧 오예약이 된다. */
  @media ${({ theme }) => theme.device.mobile} {
    min-height: 44px;
  }

  &:hover {
    background-color: ${({ selected, theme }) =>
      selected ? theme.colors.blueColor : theme.colors.softColor};
    color: ${({ selected, theme }) => (selected ? theme.colors.white : theme.colors.subColor)};
  }

  &:disabled {
    cursor: not-allowed;
    /* 캘린더 비활성 타일과 같은 시각 언어. opacity 0.3 만으로는 "없는 시간"과 "찬 시간"이 구분되지 않았다. */
    opacity: 0.45;
    text-decoration: line-through;
  }
`;

export const OptionBox = styled.div<WithTheme>`
  width: 50%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const OptionTitle = styled.div<WithTheme>`
  margin-bottom: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const ToggleGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ToggleButton = styled.button<WithTheme & { $active: boolean }>`
  -webkit-tap-highlight-color: transparent;
  flex: 1 1 auto;
  min-width: 120px;
  padding: 10px 14px;
  font-size: ${({ theme }) => theme.sizes.small};
  border-radius: 8px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.blueColor : '#ccc')};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.blueColor : 'white')};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.subColor)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

export const Button = styled.button<WithTheme>`
  padding: 12px 0;
  width: 50%;
  background-color: ${({ theme }) => theme.colors.blueColor};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  margin-top: 10px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover {
    opacity: 0.8;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const MessageBox = styled.div`
  flex-direction: column;
`;
