import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { MdClose } from 'react-icons/md';
import api from '../utils/axiosInstance';
import type { WithTheme } from '../styles/styled-props.ts';
import type { MemberOption } from '../types/murder.ts';

interface Props {
  value: number[];
  onChange: (ids: number[]) => void;
  currentUserId: number;
  currentUserLabel: string;
  // 수정 시 알고 있는 참가자(id→닉네임) 라벨 시드
  initialOptions?: MemberOption[];
  // 본인 자동 포함 + 제거 불가 (등록 시 true, 관리자가 타인 기록 수정 시 false)
  forceSelf?: boolean;
}

export default function MemberMultiSelect({
  value,
  onChange,
  currentUserId,
  currentUserLabel,
  initialOptions,
  forceSelf = true,
}: Props) {
  const [keyword, setKeyword] = useState('');
  const [candidates, setCandidates] = useState<MemberOption[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  // id → 표시 라벨 캐시
  const [labels, setLabels] = useState<Record<number, string>>({});

  const wrapRef = useRef<HTMLDivElement | null>(null);

  // 본인 + initialOptions 라벨 시드, 본인은 항상 선택에 포함
  useEffect(() => {
    setLabels(prev => {
      const next = { ...prev, [currentUserId]: currentUserLabel };
      (initialOptions ?? []).forEach(o => {
        next[o.id] = o.nickname || o.name || `#${o.id}`;
      });
      return next;
    });
    if (forceSelf && !value.includes(currentUserId)) {
      onChange([currentUserId, ...value]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 검색 디바운스
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      api
        .get('/bgm-agit/all-members', { params: { keyword } })
        .then(res => setCandidates(res.data as MemberOption[]))
        .catch(() => setCandidates([]));
    }, 250);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [keyword]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const labelOf = (id: number) => labels[id] ?? `#${id}`;

  const addMember = (m: MemberOption) => {
    setLabels(prev => ({ ...prev, [m.id]: m.nickname || `#${m.id}` }));
    if (!value.includes(m.id)) onChange([...value, m.id]);
    setKeyword('');
    setOpen(false);
  };

  const removeMember = (id: number) => {
    if (forceSelf && id === currentUserId) return; // 등록 시 본인은 제거 불가
    onChange(value.filter(v => v !== id));
  };

  const visibleCandidates = useMemo(
    () => candidates.filter(c => !value.includes(c.id)),
    [candidates, value]
  );

  // 후보 바뀌면 활성 인덱스 리셋
  useEffect(() => setActiveIdx(0), [visibleCandidates.length, keyword]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || visibleCandidates.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, visibleCandidates.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const m = visibleCandidates[activeIdx];
      if (m) addMember(m);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // 매칭 부분 하이라이트
  const highlight = (text: string) => {
    const k = keyword.trim();
    if (!k) return text;
    const idx = text.toLowerCase().indexOf(k.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <Mark>{text.slice(idx, idx + k.length)}</Mark>
        {text.slice(idx + k.length)}
      </>
    );
  };

  return (
    <Wrap ref={wrapRef}>
      <ChipBox>
        {value.map(id => (
          <Chip key={id} $me={id === currentUserId}>
            {labelOf(id)}
            {id === currentUserId && <MeTag>(나)</MeTag>}
            {!(forceSelf && id === currentUserId) && (
              <MdClose onClick={() => removeMember(id)} />
            )}
          </Chip>
        ))}
      </ChipBox>

      <SearchBox>
        <input
          type="text"
          placeholder="닉네임으로 참가자 검색"
          value={keyword}
          onChange={e => {
            setKeyword(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {open && (visibleCandidates.length > 0 || keyword.trim()) && (
          <Dropdown>
            {visibleCandidates.map((c, i) => (
              <Option
                key={c.id}
                type="button"
                $active={i === activeIdx}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => addMember(c)}
              >
                {highlight(c.nickname || `#${c.id}`)}
              </Option>
            ))}
            {visibleCandidates.length === 0 && keyword.trim() && (
              <EmptyOption>검색 결과가 없습니다.</EmptyOption>
            )}
          </Dropdown>
        )}
      </SearchBox>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChipBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Chip = styled.span<{ $me: boolean } & WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: #fff;
  background: ${({ $me }) => ($me ? '#093A6E' : '#988271')};

  svg {
    cursor: pointer;
    font-size: 16px;
  }
`;

const MeTag = styled.span`
  font-size: 11px;
  opacity: 0.85;
`;

const SearchBox = styled.div`
  position: relative;

  input {
    width: 100%;
    height: 42px;
    padding: 0 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px; /* iOS 자동 줌 방지 */
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #093a6e;
    }
  }
`;

const Dropdown = styled.div<WithTheme>`
  position: absolute;
  z-index: 20;
  top: 46px;
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
`;

const Option = styled.button<{ $active: boolean } & WithTheme>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 11px 12px;
  background: ${({ $active }) => ($active ? '#f1efe9' : '#fff')};
  border: none;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
`;

const Mark = styled.mark`
  background: #fff1a8;
  color: inherit;
  padding: 0;
`;

const EmptyOption = styled.div<WithTheme>`
  padding: 12px;
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;
