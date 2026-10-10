import styled, { css } from 'styled-components';
import { theme } from '../styles/theme.ts';
import { buttonStyle, cardStyle, focusRing, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

// 메인 = 대표 영역(Hero) + 아래 카드 섹션들. 바탕이 흰색이라 Hero 도 테두리로 영역을 나눈다

export const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 48px;
  align-items: center;
  width: 100%;
  margin: ${theme.space.lg} 0 ${theme.space.xl};
  padding: 40px 32px;
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.lg};
  background: ${c.surface};

  @media ${theme.device.mobile} {
    grid-template-columns: minmax(0, 1fr);
    gap: ${theme.space.xl};
    margin: 0 0 ${theme.space.lg};
    padding: ${theme.space.xl} ${theme.space.lg};
  }
`;

export const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;

  @media ${theme.device.mobile} {
    gap: ${theme.space.lg};
  }
`;

// 메인 색은 남색이 주인공, 베이지는 옅은 바탕에만(칩·안내 줄), 글씨 포인트는 갈색.
// 갈색·초록·남색을 다 채워 쓰면 색이 따로 놀아서 채움은 남색 하나로 정했다(2026-10-10)

// 위치·영업 한 줄
export const Eyebrow = styled.p`
  margin: 0;
  color: ${c.noticeColor};
  font-size: 14px;
  font-weight: 700;
`;

export const HeroTitle = styled.h2`
  margin: 0;
  color: ${c.textStrong};
  font-size: 44px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.03em;
  word-break: keep-all;

  @media ${theme.device.tablet} {
    font-size: 36px;
  }

  @media ${theme.device.mobile} {
    font-size: 28px;
  }
`;

export const HeroLead = styled.p`
  margin: 0;
  color: ${c.subColor};
  font-size: 17px;
  line-height: 1.7;
  word-break: keep-all;

  @media ${theme.device.mobile} {
    font-size: 15px;
  }
`;

export const FeatureList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
  margin: 0;
  padding: 0;

  li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid ${c.subTextBoxColor};
    border-radius: ${theme.radius.pill};
    background: ${c.subBgColor};
    color: ${c.bronzeColor};
    font-size: 14px;
    font-weight: 600;

    svg {
      color: ${c.bronzeColor};
      font-size: 14px;
    }
  }
`;

export const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.space.md};
  margin-top: ${theme.space.xs};

  @media ${theme.device.mobile} {
    button {
      flex: 1 1 auto;
    }
  }
`;

// 남색 채움. 룸 예약 화면의 예약 버튼과 같은 색이라 메인에서 넘어갈 때 이어진다
export const PrimaryAction = styled.button`
  ${buttonStyle('primary', 'lg')}
  background: ${c.blueColor};
  border-color: ${c.blueColor};

  &:hover:not(:disabled) {
    background: ${c.blueColor};
    border-color: ${c.blueColor};
    opacity: 0.9;
  }
`;

// 흰 바탕 + 옅은 남색 테두리 + 남색 글씨
export const SecondaryAction = styled.button`
  ${buttonStyle('secondary', 'lg')}
  background: ${c.white};
  border-color: ${c.blueColor}40;
  color: ${c.blueColor};

  &:hover:not(:disabled) {
    background: ${c.blueColor}0D;
  }
`;

// 흰 바탕 + 베이지 테두리 + 진갈색 글씨. 옆 '보유게임 보기'(남색 테두리)와 같은 모양, 색만 다르게
export const TextAction = styled.button`
  ${buttonStyle('secondary', 'lg')}
  background: ${c.white};
  border-color: ${c.subTextBoxColor};
  color: ${c.bronzeColor};

  &:hover:not(:disabled) {
    background: ${c.subBgColor};
  }
`;

export const HeroMedia = styled.div`
  min-width: 0;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadow.md};
`;

// 흰 카드 섹션
const sectionCard = css`
  ${cardStyle};
  width: 100%;
  min-width: 0;
  padding: 32px;

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

export const Section = styled.section`
  ${sectionCard};
`;

// 예전 메인 '실시간 예약하기' 영역과 같은 남색 바탕·흰 글씨
export const ReservationSection = styled.section`
  ${sectionCard};
  background: ${c.blueColor};
  border-color: ${c.blueColor};
  color: ${c.white};
  display: flex;
  flex-direction: column;
  gap: ${theme.space.xl};
  margin-bottom: ${theme.space.xl};

  @media ${theme.device.mobile} {
    gap: ${theme.space.lg};
    margin-bottom: ${theme.space.lg};
  }
`;

// 예전 메인: 게임찾기 = 옅은 회색 바탕·초록 글씨, 먹거리 = 베이지 회색 바탕·진갈색 글씨
export const PairRow = styled.div`
  & > ${Section}:first-child {
    background: ${c.softColor};
    border-color: ${c.border};
    color: ${c.greenColor};
  }

  & > ${Section}:last-child {
    background: ${c.basicColor};
    border-color: ${c.border};
    color: ${c.bronzeColor};
  }

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.space.xl};
  margin-bottom: ${theme.space.xl};

  @media ${theme.device.mobile} {
    grid-template-columns: minmax(0, 1fr);
    gap: ${theme.space.lg};
    margin-bottom: ${theme.space.lg};
  }
`;

export const SectionHead = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.lg};
  margin-bottom: ${theme.space.xl};

  ${ReservationSection} & {
    margin-bottom: 0;
  }

  @media ${theme.device.mobile} {
    margin-bottom: ${theme.space.lg};
  }
`;

export const TitleBox = styled.div`
  ${sectionTitleStyle};
  min-width: 0;

  h2 {
    font-family: ${theme.fonts.display};
  }

  /* 섹션 글자색(남색 띠의 흰색, 게임 초록, 먹거리 진갈색)을 제목·설명이 그대로 따른다 */
  ${ReservationSection} &,
  ${PairRow} & {
    h2,
    p {
      color: inherit;
    }
  }

  /* 공지사항은 예전처럼 본문 회색 */
  h2,
  p {
    color: ${c.subColor};
  }
`;

export const MoreLink = styled.button`
  ${buttonStyle('ghost', 'sm')}
  /* 예전 '더보기' 링크의 회색 */
  color: ${c.navColor};
  flex-shrink: 0;

  @media ${theme.device.mobile} {
    min-height: 44px;
  }
`;

export const RoomList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${theme.space.md};
  margin: 0;
  padding: 0;

  @media ${theme.device.mobile} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.space.sm};
  }
`;

export const RoomCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  min-height: 76px;
  padding: 14px 16px;
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.md};
  background: ${c.surface};
  color: ${c.textStrong};
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  strong {
    font-size: 16px;
    font-weight: 800;
  }

  span {
    color: ${c.textMuted};
    font-size: 13px;
  }

  &:hover {
    border-color: ${c.primarySoft};
    background: ${c.primarySoft};
  }

  ${focusRing}
`;

export const ReservationFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.lg};
  padding: 18px 22px;
  border-radius: ${theme.radius.md};
  background: ${c.subBgColor};

  span {
    color: ${c.bronzeColor};
    font-size: 15px;
    font-weight: 600;
  }

  @media ${theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    padding: ${theme.space.lg};

    button {
      width: 100%;
    }
  }
`;

export const SliderBox = styled.div`
  width: 100%;
  min-width: 0;
`;
