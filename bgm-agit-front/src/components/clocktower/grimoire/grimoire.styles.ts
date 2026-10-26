import styled, { css } from 'styled-components';
import type { WithTheme } from '../../../styles/styled-props.ts';

// 마도서 색은 전부 GrimoireRoot 의 CSS 변수(--ct-*)로 쓴다. 다른 시계탑 화면(게임 목록·기록·사전)은 사이트 색 그대로다
const ACCENT = 'var(--ct-accent)';
const LINE = 'var(--ct-line)';
const DIM = 'var(--ct-muted)';
const TEXT = 'var(--ct-text)';
// 색을 채운 칩·버튼의 글자. 진영 색이 밝아서 흰 글자 대신 어두운 글자를 얹는다
const INK = 'var(--ct-ink)';

// 태블릿 가로를 기본으로 본다. 세로·휴대폰은 오른쪽 패널을 원 아래로 내린다(좌석은 어디서나 원형 — 사용자 결정 2026-10-26)
export const NARROW = '(max-width: 900px), (orientation: portrait) and (max-width: 1100px)';

/**
 * 마도서 루트. 공통 Wrapper(데스크톱 min-width 1280px)를 쓰면 iPad 가로(1133·1180)에서 가로 스크롤이 생겨 자체 전체 폭으로 둔다.
 * --ct-chrome = 루트 위에 남는 사이트 머리(헤더 80 + 메뉴 40). 몰입 모드면 0 이고 루트가 화면 높이(dvh)를 그대로 쓴다
 */
export const GrimoireRoot = styled.div<WithTheme & { $immersive: boolean }>`
  --ct-bg: #14101c;
  --ct-surface: #1e1828;
  --ct-surface-2: #2a2236;
  --ct-line: #3a3048;
  --ct-text: #ede6f5;
  --ct-muted: #a79fb5;
  --ct-accent: #f2c94c;
  --ct-good: #8ab4ff;
  --ct-evil: #ff7070;
  --ct-alive: #6fcf7f;
  --ct-ink: #14101c;
  --ct-warn-bg: rgba(242, 201, 76, 0.1);
  --ct-warn-text: #f5dfa0;
  --ct-chrome: ${({ $immersive }) => ($immersive ? '0px' : '120px')};

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  /* 사이트 본문 여백(MainArea padding)까지 덮어 어두운 바탕이 끝까지 차게 한다 */
  margin: ${({ $immersive }) => ($immersive ? '0' : '-20px')};
  padding: 12px 16px 24px;
  min-height: calc(100dvh - var(--ct-chrome));
  /* 은은한 촛불빛 — 위쪽만 살짝 밝게 */
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(242, 201, 76, 0.07), transparent 70%),
    radial-gradient(ellipse at 50% 30%, #221a30 0%, var(--ct-bg) 70%);
  color: var(--ct-text);
  color-scheme: dark;

  a {
    color: var(--ct-accent);
    text-decoration: underline;
  }

  ${({ $immersive }) =>
    $immersive &&
    css`
      height: 100dvh;
      overflow-x: hidden;
      overflow-y: auto;
    `}

  @media ${({ theme }) => theme.device.tablet} {
    margin: ${({ $immersive }) => ($immersive ? '0' : '-20px -16px')};
  }
`;

export const Page = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

export const Toolbar = styled.div<{ $sticky?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  ${({ $sticky }) =>
    $sticky &&
    css`
      /* 몰입 모드에서 좁은 화면은 루트가 스크롤된다 — [몰입 종료]가 늘 보이게 위에 붙인다 */
      position: sticky;
      top: -12px;
      z-index: 5;
      padding: 8px 0;
      background: var(--ct-bg);
    `}
`;

export const ToolTitle = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: auto;

  strong {
    font-size: 18px;
    color: ${ACCENT};
  }

  span {
    font-size: 13px;
    color: ${DIM};
  }
`;

export const Btn = styled.button<{ $tone?: 'primary' | 'ghost' | 'danger'; $active?: boolean }>`
  min-height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  ${({ $tone = 'ghost', $active }) =>
    $tone === 'primary' || $active
      ? css`
          border: 1px solid ${ACCENT};
          background: ${ACCENT};
          color: ${INK};
          font-weight: 700;
        `
      : $tone === 'danger'
        ? css`
            border: 1px solid var(--ct-evil);
            background: transparent;
            color: var(--ct-evil);
          `
        : css`
            border: 1px solid ${LINE};
            background: var(--ct-surface-2);
            color: ${TEXT};
          `}

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const Stat = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${LINE};
  background: var(--ct-surface);
  font-size: 13px;
  color: ${ACCENT};
`;

export const Layout = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: stretch;
  min-height: 0;

  > div:first-child {
    min-width: 0;
    min-height: 0;
  }

  @media ${NARROW} {
    grid-template-columns: 1fr;
    align-items: start;
  }
`;

// ---------- 원형 좌석 ----------

export const Circle = styled.div`
  position: relative;
  /* 높이에 맞춘다 — 화면 높이에서 사이트 머리·툴바를 뺀 만큼(세로 스크롤 없이 원 전체가 보이게) */
  width: min(100%, 760px, max(420px, calc(100dvh - var(--ct-chrome) - 130px)));
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  border: 1px solid ${LINE};
  border-radius: 50%;
  background: radial-gradient(circle, #2a2236 0%, #1e1828 62%, #17121f 100%);
  box-shadow:
    inset 0 0 80px rgba(242, 201, 76, 0.06),
    0 0 0 6px rgba(242, 201, 76, 0.04);

  /* 세로·좁은 화면은 패널이 원 아래로 내려가 세로 스크롤이 생기므로 높이에 맞추지 않고 폭을 다 쓴다 */
  @media ${NARROW} {
    width: min(100%, 760px);
  }
`;

/** 원 가운데 낮 토론 타이머(낮 화면에서도 보여서 플레이어도 남은 시간을 본다) */
export const CenterTimer = styled.div<{ $done: boolean }>`
  margin-top: 6px;
  font-size: clamp(28px, 6vw, 56px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  color: ${({ $done }) => ($done ? 'var(--ct-evil)' : 'var(--ct-text)')};
`;

export const CircleCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: ${ACCENT};

  strong {
    display: block;
    font-size: 20px;
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: 14px;
    color: ${DIM};
  }
`;

export const SeatSpot = styled.button`
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 104px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`;

/** 진영을 색만으로 가르지 않게(WCAG 1.4.1) 테두리 모양도 다르게 — 악마 이중선, 하수인 점선 */
export type TokenShape = 'double' | 'dashed';

export const Token = styled.div<{
  $color: string;
  $dead: boolean;
  $empty: boolean;
  $art?: boolean;
  $shape?: TokenShape;
  $size?: number;
}>`
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: ${({ $size = 76 }) => $size}px;
  height: ${({ $size = 76 }) => $size}px;
  padding: 6px;
  border-radius: 50%;
  border: ${({ $shape }) => ($shape === 'double' ? '5px double' : $shape === 'dashed' ? '3px dashed' : '3px solid')}
    ${({ $color, $empty }) => ($empty ? LINE : $color)};
  /* 그림이 있는 토큰은 실물·포켓 그리모어처럼 양피지색. 그림이 없으면(미정·글자 토큰) 어두운 바탕 */
  background: ${({ $dead, $art }) =>
    $art
      ? $dead
        ? 'radial-gradient(circle at 50% 40%, #9b9588 0%, #6e695f 100%)'
        : 'radial-gradient(circle at 50% 40%, #fbf6ea 0%, #e8d9b6 100%)'
      : $dead
        ? '#221c2b'
        : 'var(--ct-surface)'};
  color: ${({ $color, $dead, $empty }) => ($empty || $dead ? DIM : $color)};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  word-break: keep-all;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
  ${({ $art }) =>
    $art &&
    css`
      padding: 0;
    `}
  ${({ $dead }) =>
    $dead &&
    css`
      /* 사망 수의(포켓 그리모어처럼 토큰 위에 검은 띠를 덮는다). 흑백 그림만으로는 멀리서 구분이 잘 안 됐다 */
      &::after {
        content: '✝';
        position: absolute;
        top: -3px;
        left: 50%;
        z-index: 1;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        width: 40%;
        height: 58%;
        padding-top: 6%;
        transform: translateX(-50%);
        clip-path: polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%);
        background: linear-gradient(180deg, #2b2533 0%, #0d0b12 100%);
        color: #d8d0e2;
        font-size: 18px;
        line-height: 1;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15);
      }
    `}
`;

// 그림 토큰 아래쪽에 겹쳐 그리는 캐릭터 이름 띠
/** 토큰 + 그 위에 겹치는 리마인더·자리 번호의 기준 상자 */
export const TokenWrap = styled.div`
  position: relative;
  flex: none;
`;

/** 토큰 그림. 아래 휜 이름 자리를 비우려고 조금 위로 올린다 */
export const TokenArt = styled.span`
  position: absolute;
  top: 44%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 0;
`;

/** 자리 번호 배지(토큰 왼쪽 위) */
export const SeatBadge = styled.span<{ $size: number }>`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: #1a237e;
  color: #ffffff;
  font-size: ${({ $size }) => Math.round($size * 0.55)}px;
  font-weight: 800;
`;

export const SeatName = styled.span<{ $dead?: boolean }>`
  max-width: 104px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $dead }) => ($dead ? DIM : TEXT)};
  white-space: nowrap;
  text-overflow: ellipsis;
  text-decoration: ${({ $dead }) => ($dead ? 'line-through' : 'none')};
`;

export const SeatMarks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;
  max-width: 120px;
`;

/** 좌석 아래 리마인더 토큰 줄 */
export const ReminderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3px;
  max-width: 136px;

  @media ${NARROW} {
    justify-content: flex-start;
    max-width: none;
  }
`;

export const Mark = styled.span<{ $tone?: 'evil' | 'good' | 'vote' | 'reminder' }>`
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.5;
  ${({ $tone = 'reminder' }) =>
    $tone === 'evil'
      ? css`
          background: var(--ct-evil);
          color: ${INK};
          font-weight: 700;
        `
      : $tone === 'good'
        ? css`
            background: var(--ct-good);
            color: ${INK};
            font-weight: 700;
          `
        : $tone === 'vote'
          ? css`
              border: 1px solid ${LINE};
              background: var(--ct-surface-2);
              color: ${TEXT};
            `
          : css`
              border: 1px dashed rgba(242, 201, 76, 0.6);
              background: var(--ct-warn-bg);
              color: var(--ct-warn-text);
            `}
`;

// ---------- 좁은 화면: 좌석 목록 ----------

// 예전 좁은 화면용 좌석 목록. 지금은 어디서나 원형이라 그리지 않는다(되돌릴 때 display 만 바꾸면 된다)
export const SeatList = styled.div`
  display: none;
`;

export const SeatRow = styled.button<{ $dead: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${LINE};
  border-radius: 10px;
  background: ${({ $dead }) => ($dead ? '#18131f' : 'var(--ct-surface)')};
  color: ${TEXT};
  text-align: left;
  cursor: pointer;
`;

export const SeatNo = styled.span`
  width: 24px;
  font-size: 13px;
  color: ${DIM};
`;

export const SeatRowBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const RoleTag = styled.span<{ $color: string }>`
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  color: ${INK};
  font-size: 12px;
  font-weight: 600;
`;

// ---------- 오른쪽 패널 ----------

// 오른쪽 패널은 sticky 에 기대지 않고 자체 스크롤한다(사이트 머리 아래 남는 높이까지만)
export const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  max-height: calc(100dvh - var(--ct-chrome) - 24px);
  overflow: hidden;

  @media ${NARROW} {
    position: static;
    max-height: none;
  }
`;

export const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const Tab = styled.button<{ $active: boolean }>`
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid ${({ $active }) => ($active ? ACCENT : LINE)};
  border-radius: 999px;
  background: ${({ $active }) => ($active ? ACCENT : 'var(--ct-surface)')};
  color: ${({ $active }) => ($active ? INK : TEXT)};
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  font-size: 13px;
  cursor: pointer;
`;

export const Panel = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid ${LINE};
  border-radius: 12px;
  background: var(--ct-surface);
`;

export const NightRow = styled.div<{ $done: boolean; $muted: boolean }>`
  display: flex;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid ${LINE};
  opacity: ${({ $done, $muted }) => ($done ? 0.4 : $muted ? 0.6 : 1)};

  input {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    margin-top: 2px;
  }
`;

export const NightBody = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.55;
  color: ${TEXT};

  b {
    color: ${ACCENT};
  }

  small {
    display: block;
    color: ${DIM};
  }
`;

export const Muted = styled.p`
  padding: 16px 0;
  font-size: 14px;
  color: ${DIM};
  text-align: center;
`;

export const CountTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 6px;
    border-bottom: 1px solid ${LINE};
    text-align: center;
  }

  td.bad {
    color: var(--ct-evil);
    font-weight: 700;
  }
`;

export const Warn = styled.div`
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(242, 201, 76, 0.35);
  border-radius: 8px;
  background: var(--ct-warn-bg);
  font-size: 13px;
  line-height: 1.6;
  color: var(--ct-warn-text);
`;

export const NotesArea = styled.textarea`
  width: 100%;
  min-height: 220px;
  padding: 10px;
  border: 1px solid ${LINE};
  border-radius: 8px;
  background: var(--ct-surface-2);
  color: ${TEXT};
  font-size: 16px;
  resize: vertical;
`;

// ---------- 모달(좌석 메뉴·밤 진행) ----------

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(8, 6, 12, 0.72);
`;

export const Sheet = styled.div<WithTheme & { $wide?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '720px' : '560px')};
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 18px;
  border: 1px solid ${LINE};
  border-radius: 16px;
  background: var(--ct-surface);
  color: ${TEXT};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
`;

export const SheetHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;

  h3 {
    font-size: 18px;
    color: ${ACCENT};
  }
`;

export const SheetSection = styled.div`
  padding: 10px 0;
  border-top: 1px solid ${LINE};

  > label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: ${DIM};
  }
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

export const TextInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 10px;
  border: 1px solid ${LINE};
  border-radius: 8px;
  background: var(--ct-surface-2);
  color: ${TEXT};
  /* iOS Safari 는 16px 미만이면 포커스 시 화면을 확대한다 */
  font-size: 16px;
`;

export const Chip = styled.button<{ $color?: string; $active?: boolean }>`
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid ${({ $color }) => $color ?? LINE};
  border-radius: 999px;
  background: ${({ $active, $color }) => ($active ? ($color ?? ACCENT) : 'transparent')};
  color: ${({ $active, $color }) => ($active ? INK : ($color ?? TEXT))};
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  font-size: 13px;
  cursor: pointer;
`;

export const PickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
`;

export const PickItem = styled.button<{ $color: string; $active: boolean; $taken: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 44px;
  padding: 4px 8px;
  border: 2px solid ${({ $color }) => $color};
  border-radius: 8px;
  background: ${({ $active, $color }) => ($active ? $color : 'var(--ct-surface-2)')};
  color: ${({ $active, $color }) => ($active ? INK : $color)};
  font-size: 13px;
  font-weight: 600;
  opacity: ${({ $taken, $active }) => ($taken && !$active ? 0.45 : 1)};
  cursor: pointer;
`;

export const Ability = styled.p`
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: ${DIM};
`;

// ---------- 밤 진행 모드 ----------

export const NightCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 320px;
`;

export const NightStepNo = styled.div`
  font-size: 14px;
  color: ${DIM};
`;

export const NightTitle = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${ACCENT};
`;

export const NightWho = styled.div`
  font-size: 16px;
  color: ${TEXT};
`;

export const NightText = styled.div`
  flex: 1;
  font-size: 20px;
  line-height: 1.7;
  color: ${TEXT};
`;

export const NightNav = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  button {
    min-height: 56px;
    font-size: 18px;
  }
`;

// ---------- 시작 화면 ----------

export const SetupBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
`;

export const SetupCard = styled.div`
  padding: 16px;
  border: 1px solid ${LINE};
  border-radius: 12px;
  background: var(--ct-surface);

  h3 {
    margin-bottom: 10px;
    font-size: 16px;
    color: ${ACCENT};
  }
`;

export const SelectBox = styled.select`
  width: 100%;
  height: 44px;
  padding: 0 10px;
  border: 1px solid ${LINE};
  border-radius: 8px;
  background: var(--ct-surface-2);
  color: ${TEXT};
  font-size: 16px;
`;

export const Dropdown = styled.div`
  margin-top: 4px;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid ${LINE};
  border-radius: 8px;

  button {
    display: block;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-bottom: 1px solid ${LINE};
    background: var(--ct-surface-2);
    color: ${TEXT};
    text-align: left;
    font-size: 15px;
    cursor: pointer;
  }
`;

export const PlayerList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  padding: 0;
  list-style: none;
`;

export const PlayerItem = styled.li`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid ${LINE};
  border-radius: 8px;

  span {
    flex: 1;
    font-size: 15px;
  }

  small {
    color: ${DIM};
  }

  button {
    min-width: 36px;
    min-height: 36px;
    border: 1px solid ${LINE};
    border-radius: 6px;
    background: var(--ct-surface-2);
    color: ${TEXT};
    cursor: pointer;
  }
`;

export const Hint = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${DIM};
`;
