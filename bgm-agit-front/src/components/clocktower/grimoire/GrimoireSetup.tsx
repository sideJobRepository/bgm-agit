import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from '../../../recoil/state/userState.ts';
import api from '../../../utils/axiosInstance.ts';
import { toast } from '../../../utils/toast';
import type { ClockTowerGame, GrimoireData, GrimoireSeat, GrimoireState, MemberOption } from '../../../types/clocktower.ts';
import { createSeat, createState } from './useGrimoire.ts';
import {
  Btn,
  Dropdown,
  Hint,
  PlayerItem,
  PlayerList,
  Row,
  SelectBox,
  SetupBox,
  SetupCard,
  TextInput,
} from './grimoire.styles.ts';

interface Player {
  memberId: number | null;
  name: string;
}

// 최근 참가자(이 기기·이야기꾼별). 매장 단골은 판마다 같은 사람이라 닉네임을 다시 검색하지 않게 한다
const RECENT_LIMIT = 30;
type RecentStore = { last: Player[]; recent: Player[] };
const recentKey = (ownerId: number) => `clocktowerRecentPlayers_m${ownerId}`;

function loadRecent(ownerId: number | null): RecentStore {
  if (ownerId == null) return { last: [], recent: [] };
  try {
    const raw = localStorage.getItem(recentKey(ownerId));
    const parsed = raw ? (JSON.parse(raw) as Partial<RecentStore>) : {};
    return { last: parsed.last ?? [], recent: parsed.recent ?? [] };
  } catch {
    return { last: [], recent: [] };
  }
}

/** 시작할 때 회원 참가자만 남긴다(테스트 손님은 다음 판에 의미가 없다). 최근 목록은 이번 판 사람이 앞으로 온다 */
function saveRecent(ownerId: number | null, players: Player[]) {
  if (ownerId == null) return;
  const members = players.filter(p => p.memberId != null);
  if (members.length === 0) return;
  const prev = loadRecent(ownerId).recent.filter(p => !members.some(m => m.memberId === p.memberId));
  try {
    localStorage.setItem(recentKey(ownerId), JSON.stringify({ last: members, recent: [...members, ...prev].slice(0, RECENT_LIMIT) }));
  } catch {
    // 저장이 안 되는 브라우저(개인 정보 보호 모드)는 그냥 넘어간다
  }
}

/** 마도서 시작: 스크립트 고르기 → 참가자(앉은 순서대로) 등록 → 시작 */
export default function GrimoireSetup({
  initialGameId,
  ownerId,
  onStart,
}: {
  initialGameId: number | null;
  ownerId: number | null;
  onStart: (state: GrimoireState) => void;
}) {
  const [games, setGames] = useState<ClockTowerGame[]>([]);
  const [gameId, setGameId] = useState<number | ''>(initialGameId ?? '');
  const [players, setPlayers] = useState<Player[]>([]);
  const [keyword, setKeyword] = useState('');
  const [candidates, setCandidates] = useState<MemberOption[]>([]);
  const [starting, setStarting] = useState(false);
  const debounce = useRef<number | null>(null);
  const [recentStore] = useState<RecentStore>(() => loadRecent(ownerId));
  const user = useRecoilValue(userState);
  const isAdmin = (user?.roles ?? []).some(r => r === 'ROLE_ADMIN' || r === 'ADMIN');

  useEffect(() => {
    api
      .get<ClockTowerGame[]>('/bgm-agit/clocktower-games/simple')
      .then(res => setGames(res.data))
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    if (!keyword.trim()) {
      setCandidates([]);
      return;
    }
    debounce.current = window.setTimeout(() => {
      api
        // 시계탑 전용 검색: 메인 사이트로 가입한 회원(마작 이용 N)도 찾는다
        .get<MemberOption[]>('/bgm-agit/clocktower-members', { params: { keyword: keyword.trim() } })
        .then(res => setCandidates(res.data))
        .catch(() => setCandidates([]));
    }, 250);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [keyword]);

  const addMember = (m: MemberOption) => {
    setPlayers(prev =>
      prev.some(p => p.memberId === m.id) ? prev : [...prev, { memberId: m.id, name: m.nickname || `#${m.id}` }]
    );
    setKeyword('');
  };

  const move = (idx: number, dir: -1 | 1) =>
    setPlayers(prev => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });

  const remove = (idx: number) => setPlayers(prev => prev.filter((_, i) => i !== idx));

  // 관리자 테스트용: 손님 자리를 n명이 될 때까지 "손님1, 손님2…" 로 채운다(휴대폰 배정·기록에서 빠진다)
  const fillGuests = (total: number) =>
    setPlayers(prev => {
      const next = [...prev];
      let n = 1;
      while (next.length < total) {
        const name = `손님${n++}`;
        if (!next.some(p => p.name === name)) next.push({ memberId: null, name });
      }
      return next;
    });

  const start = async () => {
    if (!gameId) {
      toast.error('스크립트를 골라 주세요.');
      return;
    }
    // 실제 게임은 5명 이상이지만, 혼자 테스트하거나 자리를 나중에 채울 수 있게 막지는 않는다
    if (players.length < 1) {
      toast.error('참가자를 1명 이상 넣어 주세요.');
      return;
    }
    setStarting(true);
    try {
      const { data } = await api.get<GrimoireData>(`/bgm-agit/clocktower-games/${gameId}/grimoire`);
      if (!data.roles.length) {
        toast.error('이 스크립트에 캐릭터가 없습니다.');
        return;
      }
      const seats: GrimoireSeat[] = players.map(p => createSeat(p.memberId, p.name));
      saveRecent(ownerId, players);
      onStart(createState(data, seats, ownerId));
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? '스크립트를 불러오지 못했습니다.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <SetupBox>
      <SetupCard>
        <h3>1. 스크립트</h3>
        <SelectBox value={gameId} onChange={e => setGameId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">스크립트를 고르세요</option>
          {games.map(g => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </SelectBox>
      </SetupCard>

      <SetupCard>
        <h3>2. 참가자 ({players.length}명)</h3>
        <Hint>
          앉은 순서대로(시계 방향) 닉네임으로 찾아 넣어 주세요. 참가자는 모두 회원이어야 합니다. 가입하지 않은 손님은
          사이트에서 회원가입 후 넣어 주세요(각자 휴대폰으로 로그인해 자기 캐릭터를 봅니다).
        </Hint>
        <Row style={{ marginTop: 8 }}>
          <TextInput
            value={keyword}
            placeholder="닉네임 검색"
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              if (candidates.length === 1) addMember(candidates[0]);
            }}
          />
        </Row>
        {recentStore.last.length > 0 && (
          <Row style={{ marginTop: 8 }}>
            <Btn
              type="button"
              onClick={() =>
                setPlayers(prev => [
                  ...prev,
                  ...recentStore.last.filter(p => !prev.some(x => x.memberId === p.memberId)),
                ])
              }
            >
              지난 판 참가자 그대로 넣기 ({recentStore.last.length}명)
            </Btn>
          </Row>
        )}
        {recentStore.recent.some(p => !players.some(x => x.memberId === p.memberId)) && (
          <div style={{ marginTop: 8 }}>
            <Hint>최근 함께한 사람 — 누르면 다음 자리에 넣습니다</Hint>
            <Row style={{ marginTop: 4 }}>
              {recentStore.recent
                .filter(p => !players.some(x => x.memberId === p.memberId))
                .map(p => (
                  <Btn key={p.memberId} type="button" onClick={() => setPlayers(prev => [...prev, p])} style={{ minHeight: 36 }}>
                    + {p.name}
                  </Btn>
                ))}
            </Row>
          </div>
        )}
        {isAdmin && (
          <Row style={{ marginTop: 8 }}>
            <Hint>테스트용(손님) 자리 채우기:</Hint>
            {[5, 7, 10, 12, 15].map(n => (
              <Btn key={n} type="button" onClick={() => fillGuests(n)} disabled={players.length >= n}>
                {n}명까지 채우기
              </Btn>
            ))}
          </Row>
        )}
        {players.length > 0 && players.length < 5 && (
          <Hint style={{ marginTop: 6 }}>공식 규칙은 5명 이상입니다. 그보다 적으면 셋업 점검·무작위 배정이 동작하지 않습니다.</Hint>
        )}
        {candidates.length > 0 && (
          <Dropdown>
            {candidates.slice(0, 20).map(m => (
              <button key={m.id} type="button" onClick={() => addMember(m)}>
                {m.nickname}
                {m.name ? ` (${m.name})` : ''}
              </button>
            ))}
          </Dropdown>
        )}
        {players.length > 0 && (
          <PlayerList>
            {players.map((p, i) => (
              <PlayerItem key={`${p.memberId ?? 'g'}-${p.name}-${i}`}>
                <small>{i + 1}</small>
                <span>
                  {p.name} {p.memberId == null && <small>(테스트 손님)</small>}
                </span>
                <button type="button" onClick={() => move(i, -1)} aria-label="위로">
                  ▲
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label="아래로">
                  ▼
                </button>
                <button type="button" onClick={() => remove(i)} aria-label="빼기">
                  ✕
                </button>
              </PlayerItem>
            ))}
          </PlayerList>
        )}
      </SetupCard>

      <Btn type="button" $tone="primary" onClick={start} disabled={starting} style={{ minHeight: 52, fontSize: 16 }}>
        {starting ? '불러오는 중…' : '마도서 시작'}
      </Btn>
      <Hint>
        진행 상태는 이 기기에만 저장됩니다. 새로고침하거나 화면이 꺼져도 이어서 할 수 있습니다. 서버에는 [휴대폰으로
        배정 보내기]를 누를 때 각자에게 보여줄 캐릭터만 올라갑니다.
      </Hint>
    </SetupBox>
  );
}
