import { useId, type CSSProperties } from 'react';
import styled from 'styled-components';
import type { GrimoireData, GrimoireRole } from '../../../types/clocktower.ts';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';

/**
 * 토큰 테두리를 따라 휘어 쓰는 글자(포켓 그리모어·실물 토큰처럼).
 * bottom = 아래 테두리(캐릭터 이름·리마인더 문구), top = 위 테두리(리마인더의 캐릭터 이름).
 * 호 길이보다 길면 글자 폭을 줄여 호 안에 맞춘다 — 잘리거나 토큰 밖으로 나가지 않게.
 */
export function CurvedText({
  text,
  size,
  color,
  outline,
  fontScale = 0.17,
  edge = 'bottom',
}: {
  text: string;
  size: number;
  color: string;
  outline?: string; // 그림 위에 쓸 때 읽히게 글자 테두리
  fontScale?: number;
  edge?: 'top' | 'bottom';
}) {
  const id = useId().replace(/:/g, '');
  const font = Math.max(9, Math.round(size * fontScale));
  const c = size / 2;
  // 아래 호는 글자가 안쪽으로 서고, 위 호는 바깥쪽으로 선다. 둘 다 토큰 안에 들어오게 반지름을 다르게 잡는다(2 = 테두리)
  const r = edge === 'bottom' ? size / 2 - font * 0.55 - 2 : size / 2 - font * 1.1 - 2;
  const arc = Math.PI * r * (edge === 'bottom' ? 0.85 : 0.75);
  // 한글은 글자 폭이 글자 크기와 거의 같다. 넘치면 호 길이에 맞춰 줄인다
  const fits = text.length * font * 0.95 <= arc;
  // 아래 호: 왼쪽 → 아래 → 오른쪽(sweep 0), 위 호: 왼쪽 → 위 → 오른쪽(sweep 1). 둘 다 글자가 바로 선다
  const d =
    edge === 'bottom'
      ? `M ${c - r} ${c} A ${r} ${r} 0 0 0 ${c + r} ${c}`
      : `M ${c - r} ${c} A ${r} ${r} 0 0 1 ${c + r} ${c}`;
  return (
    <CurveSvg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <path id={id} d={d} fill="none" />
      <text
        fill={color}
        fontSize={font}
        fontWeight={700}
        stroke={outline}
        strokeWidth={outline ? Math.max(2, font * 0.28) : 0}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        <textPath
          href={`#${id}`}
          startOffset="50%"
          textAnchor="middle"
          {...(fits ? {} : { textLength: arc, lengthAdjust: 'spacingAndGlyphs' })}
        >
          {text}
        </textPath>
      </text>
    </CurveSvg>
  );
}

/**
 * 리마인더 토큰(포켓 그리모어식). 남색 원 위쪽에 준 캐릭터 이름, 가운데 그림, 아래쪽에 리마인더 문구.
 * 글자 띠(Mark)만 있을 때는 "주정뱅이입니다"·"중독"이 좌석 표시에 묻혀 눈에 안 띄었다.
 * 출처 캐릭터가 없는 것(처형 기록·직접 적은 문구)은 글자만 가운데에 넣는다.
 */
export default function ReminderToken({
  text,
  role,
  size,
  onClick,
  title,
  removable,
  style,
}: {
  text: string;
  role: GrimoireRole | null;
  size: number;
  onClick?: () => void;
  title?: string;
  removable?: boolean;
  style?: CSSProperties;
}) {
  const urls = tokenImageCandidates(role, null);
  const plain = urls.length === 0;
  return (
    <Disc
      as={onClick ? 'button' : 'span'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title ?? (role ? `${text} · ${role.name}` : text)}
      $size={size}
      style={style}
    >
      {plain ? (
        <Plain $size={size}>{text}</Plain>
      ) : (
        <>
          <Art>
            <RoleArt urls={urls} alt="" size={Math.round(size * 0.55)} />
          </Art>
          {role && <CurvedText text={role.name} size={size} color="#ffffff" fontScale={0.15} edge="top" />}
          <CurvedText text={text} size={size} color="#ffffff" fontScale={0.16} />
        </>
      )}
      {removable && <Remove>✕</Remove>}
    </Disc>
  );
}

/** 리마인더의 source 는 캐릭터 이름으로 저장돼 있다(예전 판 호환). 이름으로 스크립트 캐릭터를 찾는다 */
export function reminderSourceRole(source: string | null | undefined, data: GrimoireData): GrimoireRole | null {
  if (!source) return null;
  return data.roles.find(r => r.name === source) ?? null;
}

const Disc = styled.span<{ $size: number }>`
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  padding: 0;
  overflow: hidden;
  border: 2px solid rgba(201, 178, 122, 0.85);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #232a4d 0%, #10142a 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  color: #ffffff;
  cursor: ${({ as }) => (as === 'button' ? 'pointer' : 'default')};
`;

// 그림은 가운데. 위·아래 테두리에 글자가 들어간다
const Art = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 0;
`;

const Plain = styled.span<{ $size: number }>`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding: 0 3px;
  font-size: ${({ $size }) => Math.max(9, Math.round($size * 0.2))}px;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
  word-break: keep-all;
`;

const CurveSvg = styled.svg`
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
`;

const Remove = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 4px;
  border-radius: 6px;
  background: rgba(139, 29, 29, 0.85);
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
`;
