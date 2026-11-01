import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/axiosInstance.ts';
import type { MemberOption } from '../../types/clocktower.ts';

interface Props {
  // 이미 넣은 회원 id — 결과에 "추가됨"으로 보이고 다시 못 넣는다
  addedIds: number[];
  onAdd: (member: MemberOption) => void;
  onClose: () => void;
  title?: string;
}

/**
 * 시계탑 참가자 검색 창. 닉네임(초성 포함)으로 찾아 한 명씩 [추가]하고, 다 넣으면 [완료]로 닫는다.
 * 넣을 때마다 검색어를 비우고 입력칸에 포커스를 돌려 다음 사람을 바로 찾게 한다.
 *
 * 마도서(어두운 테마) 안과 일반 화면 양쪽에서 쓰므로 색은 마도서 변수(--ct-*)를 쓰고, 없으면 밝은 색으로 떨어진다.
 */
export default function MemberSearchModal({ addedIds, onAdd, onClose, title = '참가자 추가' }: Props) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<MemberOption[]>([]);
  const [searching, setSearching] = useState(false);
  // 이 창에서 넣은 순서(맨 아래 안내용)
  const [addedNow, setAddedNow] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const q = keyword.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => {
      api
        // 시계탑 전용 검색: 메인 사이트로 가입한 회원(마작 이용 N)·소셜 회원도 찾는다
        .get<MemberOption[]>('/bgm-agit/clocktower-members', { params: { keyword: q } })
        .then(res => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const added = new Set(addedIds);

  const add = (m: MemberOption) => {
    if (added.has(m.id)) return;
    onAdd(m);
    setAddedNow(prev => [...prev, m.nickname || `#${m.id}`]);
    setKeyword('');
    inputRef.current?.focus();
  };

  // Enter: 아직 안 넣은 첫 결과를 넣는다
  const firstAvailable = results.find(m => !added.has(m.id));

  return (
    <Overlay onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <Panel role="dialog" aria-modal="true" aria-label={title}>
        <Header>
          <h3>{title}</h3>
          <span>{addedIds.length}명</span>
        </Header>
        <SearchInput
          ref={inputRef}
          type="text"
          value={keyword}
          placeholder="닉네임 검색 (초성도 됩니다: ㅎㄱㄷ)"
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && firstAvailable) add(firstAvailable);
          }}
        />
        <Results>
          {!keyword.trim() && <Info>닉네임을 입력하면 회원이 나옵니다. 한 명씩 [추가]를 누르세요.</Info>}
          {keyword.trim() && !searching && results.length === 0 && <Info>검색 결과가 없습니다.</Info>}
          {results.slice(0, 30).map(m => {
            const isAdded = added.has(m.id);
            return (
              <ResultRow key={m.id}>
                <span>
                  {m.nickname || `#${m.id}`}
                  {m.loginType && <small> · {m.loginType}</small>}
                </span>
                <AddButton type="button" disabled={isAdded} $added={isAdded} onClick={() => add(m)}>
                  {isAdded ? '추가됨' : '추가'}
                </AddButton>
              </ResultRow>
            );
          })}
        </Results>
        {addedNow.length > 0 && <Recent>방금 추가: {addedNow.join(', ')}</Recent>}
        <DoneButton type="button" onClick={onClose}>
          완료
        </DoneButton>
      </Panel>
    </Overlay>
  );
}

const BG = 'var(--ct-surface, #fff)';
const BG2 = 'var(--ct-surface-2, #f6f4fa)';
const TEXT = 'var(--ct-text, #222)';
const MUTED = 'var(--ct-muted, #888)';
const LINE = 'var(--ct-line, #ddd)';
const ACCENT = 'var(--ct-accent, #4A2C82)';
const ON_ACCENT = 'var(--ct-ink, #fff)';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 8vh 16px 16px;

  @media (max-width: 600px) {
    padding: 0;
    align-items: stretch;
  }
`;

const Panel = styled.div`
  width: min(440px, 100%);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${LINE};
  background: ${BG};
  color: ${TEXT};

  @media (max-width: 600px) {
    max-height: none;
    height: 100%;
    border-radius: 0;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 17px;
  }

  span {
    color: ${MUTED};
    font-size: 13px;
  }
`;

const SearchInput = styled.input`
  height: 44px;
  padding: 0 12px;
  border: 1px solid ${LINE};
  border-radius: 8px;
  background: ${BG2};
  color: ${TEXT};
  /* iOS Safari 는 16px 미만이면 포커스 시 화면을 확대한다 */
  font-size: 16px;
`;

const Results = styled.div`
  flex: 1;
  min-height: 120px;
  overflow-y: auto;
  border: 1px solid ${LINE};
  border-radius: 8px;
`;

const Info = styled.div`
  padding: 16px 12px;
  color: ${MUTED};
  font-size: 14px;
  text-align: center;
`;

const ResultRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px 8px 12px;
  border-bottom: 1px solid ${LINE};
  font-size: 15px;

  small {
    color: ${MUTED};
  }
`;

const AddButton = styled.button<{ $added: boolean }>`
  flex-shrink: 0;
  min-width: 64px;
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ $added }) => ($added ? LINE : ACCENT)};
  background: ${({ $added }) => ($added ? 'transparent' : ACCENT)};
  color: ${({ $added }) => ($added ? MUTED : ON_ACCENT)};
  font-weight: 700;
  cursor: ${({ $added }) => ($added ? 'default' : 'pointer')};
`;

const Recent = styled.div`
  font-size: 13px;
  color: ${MUTED};
`;

const DoneButton = styled.button`
  min-height: 46px;
  border-radius: 8px;
  border: 1px solid ${LINE};
  background: ${BG2};
  color: ${TEXT};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`;
