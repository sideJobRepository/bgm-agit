import styled, { css } from 'styled-components';
import { theme } from '../styles/theme.ts';
import { buttonStyle, cardStyle, focusRing, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

// 메인 = 카드 없이 바탕 위에 놓인 대표 영역(Hero) + 아래 흰 카드 섹션들

export const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 48px;
  align-items: center;
  width: 100%;
  padding: 56px 0 48px;

  @media ${theme.device.mobile} {
    grid-template-columns: minmax(0, 1fr);
    gap: ${theme.space.xl};
    padding: ${theme.space.xl} 0;
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

// 위치·영업 한 줄. 골드는 여기에만(대비를 위해 accentText)
export const Eyebrow = styled.p`
  margin: 0;
  color: ${c.accentText};
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
  color: ${c.textMuted};
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
    border: 1px solid ${c.border};
    border-radius: ${theme.radius.pill};
    background: ${c.surface};
    color: ${c.textBody};
    font-size: 14px;
    font-weight: 600;

    svg {
      color: ${c.primary};
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

export const PrimaryAction = styled.button`
  ${buttonStyle('primary', 'lg')}
`;

export const SecondaryAction = styled.button`
  ${buttonStyle('secondary', 'lg')}
`;

export const TextAction = styled.button`
  ${buttonStyle('ghost', 'lg')}
  padding: 0 12px;
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

export const ReservationSection = styled.section`
  ${sectionCard};
  display: flex;
  flex-direction: column;
  gap: ${theme.space.xl};
  margin-bottom: ${theme.space.xl};

  @media ${theme.device.mobile} {
    gap: ${theme.space.lg};
    margin-bottom: ${theme.space.lg};
  }
`;

export const PairRow = styled.div`
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
`;

export const MoreLink = styled.button`
  ${buttonStyle('ghost', 'sm')}
  flex-shrink: 0;

  @media ${theme.device.mobile} {
    min-height: 44px;
  }
`;

// 1 날짜 · 2 방 · 3 시간 — 예약 순서 안내(밑줄 탭 모양)
export const Steps = styled.ol`
  display: flex;
  gap: 20px;
  flex-shrink: 0;
  margin: 0;
  padding: 0;

  li {
    padding-bottom: 6px;
    border-bottom: 2px solid ${c.primary};
    color: ${c.primary};
    font-size: 14px;
    font-weight: 700;
  }

  @media ${theme.device.mobile} {
    display: none;
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
    border-color: ${c.primary};
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
  background: ${c.primarySoft};

  span {
    color: ${c.textBody};
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
