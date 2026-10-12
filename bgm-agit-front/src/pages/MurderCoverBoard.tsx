// 표지 정리 — 표지 없는 게임을 한 화면에 늘어놓고 그 자리에서 바로 넣는다.
// 예전엔 게임마다 상세 → 수정 → 검색 → 붙여넣기 → 저장 → 목록을 반복해야 했다.
// 후보(머미로그)를 누르거나, 줄을 고른 뒤 이미지·주소를 Ctrl+V 하면 확인 없이 저장되고 줄이 사라진다.
// 잘못 넣었으면 그 게임 상세에서 바꾸면 된다
import { Wrapper } from '../styles';
import { useCallback, useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/state/userState.ts';
import api from '../utils/axiosInstance';
import { toast } from '../utils/toast';
import type { MurderCoverCandidate, MurderGame } from '../types/murder.ts';
import { playersLabel } from './MurderGames.tsx';
import { COVER_SEARCH_SITES, firstImageFile } from '../utils/murderCover.ts';
import {
  Box,
  Toolbar,
  Help,
  Empty,
  Row,
  RowHead,
  RowLinks,
  Candidates,
  UrlInput,
} from './MurderCoverBoard.styles.ts';

type CandidateState = { status: 'loading' | 'done' | 'error'; list: MurderCoverCandidate[] };
type CoverSource = { file: File } | { url: string; candidate?: MurderCoverCandidate };

// 머미로그에 동시에 거는 검색 수. 후보마다 상세를 한 번씩 더 부르므로 남의 서버에 몰리지 않게 작게 둔다
const CANDIDATE_CONCURRENCY = 2;

export default function MurderCoverBoard() {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles.includes('ROLE_ADMIN');

  const [games, setGames] = useState<MurderGame[] | null>(null);
  const [candidates, setCandidates] = useState<Record<number, CandidateState>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [renameToo, setRenameToo] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    api
      .get<MurderGame[]>('/bgm-agit/murder-games/simple')
      .then(res => {
        const list = (res.data ?? []).filter(g => !g.imageUrl);
        setGames(list);
        setSelectedId(list[0]?.id ?? null);
      })
      .catch(() => toast.error('게임 목록을 불러오지 못했습니다.'));
  }, [isAdmin]);

  // 후보는 화면에 보이는 줄만 차례로 찾는다
  const queueRef = useRef<MurderGame[]>([]);
  const activeRef = useRef(0);
  const requestedRef = useRef(new Set<number>());

  const pump = useCallback(function run() {
    while (activeRef.current < CANDIDATE_CONCURRENCY && queueRef.current.length > 0) {
      const game = queueRef.current.shift()!;
      activeRef.current++;
      setCandidates(prev => ({ ...prev, [game.id]: { status: 'loading', list: [] } }));
      api
        .get<MurderCoverCandidate[]>('/bgm-agit/murder-games/cover-candidates', { params: { name: game.name } })
        .then(res => setCandidates(prev => ({ ...prev, [game.id]: { status: 'done', list: res.data ?? [] } })))
        .catch(() => setCandidates(prev => ({ ...prev, [game.id]: { status: 'error', list: [] } })))
        .finally(() => {
          activeRef.current--;
          run();
        });
    }
  }, []);

  const requestCandidates = useCallback(
    (game: MurderGame) => {
      if (requestedRef.current.has(game.id)) return;
      requestedRef.current.add(game.id);
      queueRef.current.push(game);
      pump();
    },
    [pump],
  );

  // 처리한 줄은 빼고 바로 다음 줄을 고른다
  const removeGame = (id: number) => {
    if (!games) return;
    const index = games.findIndex(g => g.id === id);
    const next = games.filter(g => g.id !== id);
    setGames(next);
    if (selectedId === id) setSelectedId((next[index] ?? next[index - 1])?.id ?? null);
  };

  const apply = async (game: MurderGame, source: CoverSource) => {
    if (savingId != null) return;
    const form = new FormData();
    if ('file' in source) {
      form.append('image', source.file);
    } else {
      form.append('imageSourceUrl', source.url);
      const c = source.candidate;
      if (c && renameToo) {
        form.append('name', c.title);
        if (c.minPlayers) form.append('minPlayers', String(c.minPlayers));
        if (c.maxPlayers) form.append('maxPlayers', String(c.maxPlayers));
        if (c.playMinutes) form.append('playMinutes', String(c.playMinutes));
      }
    }

    setSavingId(game.id);
    try {
      await api.put(`/bgm-agit/murder-games/${game.id}/cover`, form);
      toast.success(`"${game.name}" 표지를 넣었습니다.`);
      setDoneCount(n => n + 1);
      removeGame(game.id);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? '표지를 넣지 못했습니다.');
    } finally {
      setSavingId(null);
    }
  };

  // 고른 줄에 Ctrl+V. 이미지면 어디서든, 주소 글자는 입력칸 밖에서만 받는다(입력칸은 Enter 로 넣는다)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const game = games?.find(g => g.id === selectedId);
      if (!game) return;
      const file = firstImageFile(e.clipboardData?.items);
      if (file) {
        e.preventDefault();
        apply(game, { file: new File([file], file.name || `cover.${file.type.split('/')[1] ?? 'png'}`, { type: file.type }) });
        return;
      }
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;
      const text = e.clipboardData?.getData('text/plain')?.trim();
      if (text && /^https?:\/\//.test(text)) {
        e.preventDefault();
        apply(game, { url: text });
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  });

  if (!isAdmin) {
    return (
      <Wrapper>
        <Box>
          <Empty>관리자만 사용할 수 있습니다.</Empty>
        </Box>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Box>
        <Toolbar>
          <h2>표지 정리</h2>
          <span>{games ? `남은 ${games.length}개 · 이번에 ${doneCount}개 넣음` : '불러오는 중…'}</span>
          <label>
            <input type="checkbox" checked={renameToo} onChange={e => setRenameToo(e.target.checked)} />
            후보를 누르면 이름도 그 제목으로 바꾸기 (인원·시간은 빈 칸만 채움)
          </label>
          <button type="button" onClick={() => navigate('/murder-games')}>
            목록
          </button>
        </Toolbar>

        <Help>
          후보 그림을 누르면 바로 저장됩니다. 후보가 없거나 틀리면 [텀블벅]·[구글]에서 찾아, 그 줄을 누른 채로 이미지를
          복사해 Ctrl+V 하거나 주소를 붙여넣으세요. 확실한 게임은 목록의 "표지 자동 채우기"가 먼저 넣어 줍니다.
        </Help>

        {games && games.length === 0 && <Empty>표지가 없는 게임이 없습니다.</Empty>}

        {games?.map(game => (
          <CoverRow
            key={game.id}
            game={game}
            selected={game.id === selectedId}
            saving={game.id === savingId}
            candidates={candidates[game.id]}
            onVisible={requestCandidates}
            onSelect={() => setSelectedId(game.id)}
            onApply={source => apply(game, source)}
            onSkip={() => removeGame(game.id)}
          />
        ))}
      </Box>
    </Wrapper>
  );
}

function CoverRow({
  game,
  selected,
  saving,
  candidates,
  onVisible,
  onSelect,
  onApply,
  onSkip,
}: {
  game: MurderGame;
  selected: boolean;
  saving: boolean;
  candidates?: CandidateState;
  onVisible: (game: MurderGame) => void;
  onSelect: () => void;
  onApply: (source: CoverSource) => void;
  onSkip: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          onVisible(game);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [game, onVisible]);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    onSelect();
    const file = firstImageFile(e.dataTransfer?.items);
    if (file) {
      onApply({ file });
      return;
    }
    const dropped = (e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain'))?.trim();
    if (dropped && /^https?:\/\//.test(dropped)) onApply({ url: dropped });
  };

  const onUrlKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && /^https?:\/\//.test(url.trim())) onApply({ url: url.trim() });
  };

  const query = encodeURIComponent(game.name);

  return (
    <Row ref={ref} $selected={selected} $saving={saving} onClick={onSelect} onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <RowHead>
        <strong>{game.name}</strong>
        <span>
          {playersLabel(game.minPlayers, game.maxPlayers)}
          {game.playMinutes ? ` · 약 ${game.playMinutes}분` : ''}
        </span>
        <RowLinks onClick={e => e.stopPropagation()}>
          {COVER_SEARCH_SITES.map(site => (
            <a key={site.label} href={site.url(query)} target="_blank" rel="noopener noreferrer" onClick={onSelect}>
              {site.label.replace(/에서 찾기$/, '')}
            </a>
          ))}
          <button type="button" onClick={onSkip}>
            건너뛰기
          </button>
        </RowLinks>
      </RowHead>

      <Candidates>
        {!candidates || candidates.status === 'loading' ? (
          <p>머미로그에서 찾는 중…</p>
        ) : candidates.status === 'error' ? (
          <p>후보를 찾지 못했습니다. 텀블벅·구글에서 찾아 붙여넣어 주세요.</p>
        ) : candidates.list.length === 0 ? (
          <p>머미로그에 없습니다. 텀블벅·구글에서 찾아 붙여넣어 주세요.</p>
        ) : (
          candidates.list.map(c => (
            <button
              key={c.imageUrl}
              type="button"
              title={c.title}
              onClick={e => {
                e.stopPropagation();
                onApply({ url: c.imageUrl, candidate: c });
              }}
            >
              <img src={c.thumbnailUrl} alt={c.title} loading="lazy" />
              {c.title}
              {(c.minPlayers || c.playMinutes) && (
                <small>
                  {playersLabel(c.minPlayers, c.maxPlayers)}
                  {c.playMinutes ? ` · ${c.playMinutes}분` : ''}
                </small>
              )}
            </button>
          ))
        )}
      </Candidates>

      <UrlInput
        type="text"
        value={url}
        onFocus={onSelect}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={onUrlKeyDown}
        placeholder="텀블벅 프로젝트·판매 페이지·이미지 주소를 붙여넣고 Enter"
      />
    </Row>
  );
}
