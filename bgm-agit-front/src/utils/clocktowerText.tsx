import { Fragment, type ReactNode } from 'react';

/**
 * 공식 밤 안내 문구 표기를 화면용으로 바꾼다.
 * - `*문구*` : 이야기꾼이 보여주는 토큰·정보 → 굵게
 * - `:reminder:` : 리마인더 토큰 조작 지점 → 줄을 바꿔 "▸" 로 시작
 */
export function renderNightText(text?: string | null): ReactNode {
  if (!text) return null;
  return text.split(':reminder:').map((part, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <>
          <br />▸{' '}
        </>
      )}
      {part.split(/(\*[^*]+\*)/g).map((seg, j) =>
        seg.startsWith('*') && seg.endsWith('*') && seg.length > 2 ? (
          <strong key={j}>{seg.slice(1, -1)}</strong>
        ) : (
          <Fragment key={j}>{seg}</Fragment>
        )
      )}
    </Fragment>
  ));
}
