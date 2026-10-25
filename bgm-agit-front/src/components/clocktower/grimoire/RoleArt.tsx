import { useState, type ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  // 쓸 순서대로의 이미지 주소(tokenImageCandidates)
  urls: string[];
  alt: string;
  size: number;
  dead?: boolean;
  // 이미지가 하나도 안 뜰 때 그릴 것(글자 토큰)
  fallback?: ReactNode;
  // 그림이 있을 때만 같이 그릴 것(토큰 위 이름 띠)
  overlay?: ReactNode;
}

/**
 * 캐릭터 토큰 그림. 주소가 안 뜨면 다음 후보로 넘어가고, 다 실패하면 fallback 을 그린다.
 * 후보 목록이 바뀌면(캐릭터·선악 변경) 처음부터 다시 시도한다 — 부모가 key 로 리마운트하지 않아도 되게 목록을 state 에 같이 둔다.
 */
export default function RoleArt({ urls, alt, size, dead, fallback = null, overlay = null }: Props) {
  const sig = urls.join('|');
  const [attempt, setAttempt] = useState({ sig, index: 0 });
  const index = attempt.sig === sig ? attempt.index : 0;
  const url = urls[index];
  if (!url) return <>{fallback}</>;
  return (
    <>
      <Img
        src={url}
        alt={alt}
        width={size}
        height={size}
        $size={size}
        $dead={!!dead}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setAttempt({ sig, index: index + 1 })}
      />
      {overlay}
    </>
  );
}

// 전역 img 규칙(max-width:100%; display:block)을 토큰에서는 덮어쓴다
const Img = styled.img<{ $size: number; $dead: boolean }>`
  display: inline-block;
  flex: none;
  width: ${({ $size }) => $size}px;
  max-width: none;
  height: ${({ $size }) => $size}px;
  object-fit: contain;
  vertical-align: middle;
  user-select: none;
  filter: ${({ $dead }) => ($dead ? 'grayscale(1) brightness(.6)' : 'none')};
`;
