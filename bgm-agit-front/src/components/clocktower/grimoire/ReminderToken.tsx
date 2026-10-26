import { useId } from 'react';
import styled from 'styled-components';
import type { GrimoireData, GrimoireRole } from '../../../types/clocktower.ts';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';

/**
 * 토큰 아래 테두리를 따라 휘어 쓰는 글자(포켓 그리모어·실물 토큰처럼).
 * 호 길이보다 길면 글자 폭을 줄여 호 안에 맞춘다 — 잘리거나 토큰 밖으로 나가지 않게.
 */
export function CurvedText({
  text,
  size,
  color,
  outline,
  fontScale = 0.17,
}: {
  text: string;
  size: number;
  color: string;
  outline?: string; // 그림 위에 쓸 때 읽히게 글자 테두리
  fontScale?: number;
}) {
  const id = useId().replace(/:/g, '');
  const font = Math.max(9, Math.round(size * fontScale));
  // 글자를 테두리 쪽에 붙여 가운데 그림과 덜 겹치게 한다(2 = 테두리 두께)
  const r = size / 2 - font * 0.55 - 2;
  const c = size / 2;
  const arc = Math.PI * r * 0.85; // 아래쪽 호에서 양 끝은 조금 비워 둔다
  // 한글은 글자 폭이 글자 크기와 거의 같다. 넘치면 호 길이에 맞춰 줄인다
  const fits = text.length * font * 0.95 <= arc;
  return (
    <CurveSvg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {/* 왼쪽에서 아래를 지나 오른쪽으로 가는 호(sweep 0) — 글자가 바로 선 채 아래에 놓인다 */}
      <path id={id} d={`M ${c - r} ${c} A ${r} ${r} 0 0 0 ${c + r} ${c}`} fill="none" />
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
 * 리마인더 토큰. 포켓 그리모어·실물처럼 밝은 원 안에 리마인더를 준 캐릭터 그림을 넣고 문구는 아래 테두리를 따라 쓴다.
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
}: {
  text: string;
  role: GrimoireRole | null;
  size: number;
  onClick?: () => void;
  title?: string;
  removable?: boolean;
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
    >
      {plain ? (
        <Plain $size={size}>{text}</Plain>
      ) : (
        <>
          <Art $size={size}>
            <RoleArt urls={urls} alt="" size={Math.round(size * 0.5)} />
          </Art>
          <CurvedText text={text} size={size} color="#2b2118" fontScale={0.21} />
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
  border: 2px solid #b9a77f;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 35%, #fbf6ea 0%, #ece0c4 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
  color: #2b2118;
  cursor: ${({ as }) => (as === 'button' ? 'pointer' : 'default')};
`;

// 그림은 위로 조금 올려 아래 글자 자리를 비운다
const Art = styled.span<{ $size: number }>`
  position: absolute;
  top: ${({ $size }) => Math.round($size * 0.08)}px;
  left: 50%;
  transform: translateX(-50%);
  line-height: 0;
`;

const Plain = styled.span<{ $size: number }>`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding: 0 3px;
  font-size: ${({ $size }) => Math.max(8, Math.round($size * 0.2))}px;
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
  top: 2px;
  right: 50%;
  transform: translateX(50%);
  font-size: 10px;
  font-weight: 700;
  color: #8b1d1d;
`;
