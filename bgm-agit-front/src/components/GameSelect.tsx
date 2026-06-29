import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { MdClose } from 'react-icons/md';
import type { WithTheme } from '../styles/styled-props.ts';
import type { MurderGame } from '../types/murder.ts';

interface Props {
  games: MurderGame[];
  value: number | '';
  onChange: (id: number | '') => void;
}

/** 게임 검색형 단일 선택 (게임이 많아져도 드롭다운 대신 검색으로) */
export default function GameSelect({ games, value, onChange }: Props) {
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

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

  const selected = useMemo(() => games.find(g => g.id === value) ?? null, [games, value]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const list = k ? games.filter(g => g.name.toLowerCase().includes(k)) : games;
    return list.slice(0, 50);
  }, [games, keyword]);

  const sub = (g: MurderGame) => {
    const players =
      g.minPlayers != null && g.maxPlayers != null ? `${g.minPlayers}~${g.maxPlayers}명` : '';
    const time = g.playMinutes != null ? `${g.playMinutes}분` : '';
    return [players, time].filter(Boolean).join(' · ');
  };

  if (selected) {
    return (
      <Wrap>
        <SelectedChip>
          {selected.name}
          <MdClose onClick={() => onChange('')} />
        </SelectedChip>
      </Wrap>
    );
  }

  return (
    <Wrap ref={wrapRef}>
      <SearchBox>
        <input
          type="text"
          placeholder="게임명으로 검색"
          value={keyword}
          onChange={e => {
            setKeyword(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {open && filtered.length > 0 && (
          <Dropdown>
            {filtered.map(g => (
              <Option
                key={g.id}
                type="button"
                onClick={() => {
                  onChange(g.id);
                  setKeyword('');
                  setOpen(false);
                }}
              >
                <strong>{g.name}</strong>
                {sub(g) && <span>{sub(g)}</span>}
              </Option>
            ))}
          </Dropdown>
        )}
        {open && keyword.trim() && filtered.length === 0 && (
          <Dropdown>
            <Empty>검색 결과가 없습니다.</Empty>
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

const SelectedChip = styled.span<WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: #fff;
  background: #1a7d55;

  svg {
    cursor: pointer;
    font-size: 18px;
  }
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
      border-color: #1a7d55;
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

const Option = styled.button<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: #fff;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  cursor: pointer;

  strong {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.subColor};
  }
  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.navColor};
  }
  &:hover {
    background: #f7f4ef;
  }
`;

const Empty = styled.div<WithTheme>`
  padding: 12px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  text-align: center;
`;
