import { useEffect, useRef, useState } from 'react';
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

/** 진행판 시작: 스크립트 고르기 → 참가자(앉은 순서대로) 등록 → 시작 */
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
        .get<MemberOption[]>('/bgm-agit/all-members', { params: { keyword: keyword.trim() } })
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

  // 회원이 아닌 손님은 이름만 적어 넣는다(기록 저장 때는 빠진다)
  const addGuest = () => {
    const name = keyword.trim();
    if (!name) return;
    setPlayers(prev => [...prev, { memberId: null, name }]);
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

  // 테스트·급할 때: 손님 자리를 n명이 될 때까지 "손님1, 손님2…" 로 채운다
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
        <Hint>앉은 순서대로(시계 방향) 넣어 주세요. 회원이 아니면 이름을 적고 [손님 추가]를 누르면 됩니다.</Hint>
        <Row style={{ marginTop: 8 }}>
          <TextInput
            value={keyword}
            placeholder="닉네임 검색 또는 손님 이름"
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              if (candidates.length === 1) addMember(candidates[0]);
            }}
          />
          <Btn type="button" onClick={addGuest} disabled={!keyword.trim()}>
            손님 추가
          </Btn>
        </Row>
        <Row style={{ marginTop: 8 }}>
          <Hint>손님 자리 한 번에 채우기:</Hint>
          {[5, 7, 10, 12, 15].map(n => (
            <Btn key={n} type="button" onClick={() => fillGuests(n)} disabled={players.length >= n}>
              {n}명까지
            </Btn>
          ))}
        </Row>
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
                  {p.name} {p.memberId == null && <small>(손님)</small>}
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
        {starting ? '불러오는 중…' : '진행판 시작'}
      </Btn>
      <Hint>
        진행 상태는 이 기기에만 저장됩니다. 새로고침하거나 화면이 꺼져도 이어서 할 수 있고, 다른 사람이 서버에서 볼 수
        없습니다.
      </Hint>
    </SetupBox>
  );
}
