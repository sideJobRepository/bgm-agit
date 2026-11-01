import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/axiosInstance.ts';
import { toast } from '../../utils/toast';
import { CT_TYPE_COLOR, CT_TYPE_LABEL, CT_TYPE_OPTIONS } from '../../config/clocktower.ts';
import RoleArt from './grimoire/RoleArt.tsx';
import type { ClockTowerCharacterType, ClockTowerGame, ClockTowerRole } from '../../types/clocktower.ts';

const CT_PURPLE = '#4A2C82';

// 기본 3종 스크립트의 구성(마을주민·외지인·하수인·악마). 짤 때 기준으로 보여준다
const TYPICAL_COUNTS: Partial<Record<ClockTowerCharacterType, number>> = {
  TOWNSFOLK: 13,
  OUTSIDER: 4,
  MINION: 4,
  DEMON: 4,
};

function errorMessage(e: unknown, fallback: string) {
  return (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

/** 공식 캐릭터만(자작 캐릭터 `g{게임}:{id}`·밤 특수 단계 제외) — 스크립트 JSON 은 공식 id 로만 짠다 */
function isPickable(role: ClockTowerRole) {
  return !!role.team && !role.roleKey.includes(':');
}

function roleImages(role: ClockTowerRole): string[] {
  const evilSide = role.team === 'MINION' || role.team === 'DEMON';
  return [evilSide ? role.imageEvil : role.imageGood, role.image].filter((u): u is string => !!u);
}

interface Props {
  onClose: () => void;
  // 등록이 끝나면 부르는 콜백(목록 새로고침 등)
  onRegistered?: () => void;
}

/**
 * 스크립트 짜기(멘토 이상). 캐릭터 사전에서 캐릭터를 골라 스크립트를 만들고 게임으로 등록한다.
 *
 * 고른 캐릭터를 스크립트 도구와 같은 JSON(`[{"id":"_meta",…}, "washerwoman", …]`)으로 조립해
 * 기존 [스크립트 등록](`POST /clocktower-games/script`)에 보낸다 — 등록·사전 연결 규칙을 서버 한 곳에 두려는 것.
 * 그래서 공식 캐릭터만 고를 수 있고, 자작 캐릭터가 든 스크립트는 JSON 붙여넣기로 등록한다.
 */
export default function ScriptBuilderModal({ onClose, onRegistered }: Props) {
  const [roles, setRoles] = useState<ClockTowerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<ClockTowerCharacterType | ''>('');
  const [keyword, setKeyword] = useState('');
  // 고른 순서를 유지한다(같은 진영 안에서 고른 순서대로 보인다)
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [minPlayers, setMinPlayers] = useState('5');
  const [maxPlayers, setMaxPlayers] = useState('15');
  const [registering, setRegistering] = useState(false);
  const [games, setGames] = useState<ClockTowerGame[]>([]);
  const [baseGameId, setBaseGameId] = useState('');
  // 모바일에서 목록/고른 캐릭터 화면 전환
  const [mobileView, setMobileView] = useState<'list' | 'picked'>('list');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [{ data: roleData }, { data: gameData }] = await Promise.all([
          api.get<ClockTowerRole[]>('/bgm-agit/clocktower-roles'),
          api.get<ClockTowerGame[]>('/bgm-agit/clocktower-games/simple'),
        ]);
        if (!alive) return;
        setRoles(roleData.filter(isPickable));
        setGames(gameData);
      } catch (e) {
        toast.error(errorMessage(e, '캐릭터 사전을 불러오지 못했습니다.'));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 창이 떠 있는 동안 뒤 화면 스크롤을 막는다
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const roleByKey = useMemo(() => new Map(roles.map(r => [r.roleKey, r])), [roles]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return roles.filter(r => {
      if (team && r.team !== team) return false;
      if (!kw) return true;
      return (
        r.name.toLowerCase().includes(kw) ||
        (r.nameEn ?? '').toLowerCase().includes(kw) ||
        (r.ability ?? '').toLowerCase().includes(kw)
      );
    });
  }, [roles, team, keyword]);

  const pickedSet = useMemo(() => new Set(picked), [picked]);

  const pickedByTeam = useMemo(() => {
    const groups = new Map<ClockTowerCharacterType, ClockTowerRole[]>();
    for (const key of picked) {
      const role = roleByKey.get(key);
      if (!role?.team) continue;
      const list = groups.get(role.team) ?? [];
      list.push(role);
      groups.set(role.team, list);
    }
    return groups;
  }, [picked, roleByKey]);

  function toggle(key: string) {
    setPicked(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  }

  async function loadBaseGame(id: string) {
    setBaseGameId(id);
    if (!id) return;
    try {
      const { data } = await api.get<ClockTowerGame>(`/bgm-agit/clocktower-games/${id}`);
      const keys = (data.characters ?? []).map(c => c.roleKey).filter((k): k is string => !!k);
      const usable = keys.filter(k => roleByKey.has(k));
      const skipped = (data.characters ?? []).length - usable.length;
      setPicked(usable);
      setName(`${data.name} (수정본)`);
      setAuthor(data.author ?? '');
      if (data.minPlayers) setMinPlayers(String(data.minPlayers));
      if (data.maxPlayers) setMaxPlayers(String(data.maxPlayers));
      toast.success(
        skipped > 0
          ? `${usable.length}개를 불러왔습니다. 공식 캐릭터가 아닌 ${skipped}개는 뺐습니다.`
          : `${usable.length}개를 불러왔습니다.`
      );
    } catch (e) {
      toast.error(errorMessage(e, '게임을 불러오지 못했습니다.'));
    }
  }

  function buildJson() {
    // 진영 순서(마을주민 → … → 로릭), 같은 진영은 고른 순서
    const ordered = CT_TYPE_OPTIONS.flatMap(o => (pickedByTeam.get(o.value) ?? []).map(r => r.roleKey));
    const meta: Record<string, string> = { id: '_meta', name: name.trim() };
    if (author.trim()) meta.author = author.trim();
    return JSON.stringify([meta, ...ordered]);
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(buildJson());
      toast.success('스크립트 JSON 을 복사했습니다.');
    } catch {
      toast.error('복사하지 못했습니다.');
    }
  }

  async function register() {
    if (!name.trim()) {
      toast.error('스크립트 이름을 입력해 주세요.');
      return;
    }
    if (picked.length === 0) {
      toast.error('캐릭터를 골라 주세요.');
      return;
    }
    if (!pickedByTeam.get('DEMON')?.length) {
      toast.error('악마를 한 명 이상 골라 주세요.');
      return;
    }
    const min = minPlayers ? Number(minPlayers) : null;
    const max = maxPlayers ? Number(maxPlayers) : null;
    if (min != null && max != null && min > max) {
      toast.error('최소 인원이 최대 인원보다 큽니다.');
      return;
    }
    setRegistering(true);
    try {
      const { data } = await api.post<{ message?: string }>('/bgm-agit/clocktower-games/script', {
        json: buildJson(),
        name: name.trim(),
        minPlayers: min,
        maxPlayers: max,
      });
      toast.success(data?.message ?? '스크립트가 등록되었습니다.');
      onRegistered?.();
      onClose();
    } catch (e) {
      toast.error(errorMessage(e, '스크립트를 등록하지 못했습니다.'));
    } finally {
      setRegistering(false);
    }
  }

  return (
    <Overlay>
      <Panel role="dialog" aria-modal="true" aria-label="스크립트 짜기">
        <Header>
          <h2>스크립트 짜기</h2>
          <CloseButton type="button" onClick={onClose}>
            닫기
          </CloseButton>
        </Header>

        <MobileSwitch>
          <SwitchButton type="button" $active={mobileView === 'list'} onClick={() => setMobileView('list')}>
            캐릭터 고르기
          </SwitchButton>
          <SwitchButton type="button" $active={mobileView === 'picked'} onClick={() => setMobileView('picked')}>
            고른 캐릭터 ({picked.length})
          </SwitchButton>
        </MobileSwitch>

        <Body>
          <ListPane $hidden={mobileView !== 'list'}>
            <Filters>
              <Chips>
                <Chip type="button" $active={team === ''} $color={CT_PURPLE} onClick={() => setTeam('')}>
                  전체
                </Chip>
                {CT_TYPE_OPTIONS.map(o => (
                  <Chip
                    key={o.value}
                    type="button"
                    $active={team === o.value}
                    $color={CT_TYPE_COLOR[o.value]}
                    onClick={() => setTeam(o.value)}
                  >
                    {o.label}
                  </Chip>
                ))}
              </Chips>
              <FilterRow>
                <input
                  type="search"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="이름·능력 검색"
                />
              </FilterRow>
            </Filters>

            {loading ? (
              <Empty>불러오는 중…</Empty>
            ) : filtered.length === 0 ? (
              <Empty>조건에 맞는 캐릭터가 없습니다.</Empty>
            ) : (
              <RoleGrid>
                {filtered.map(role => {
                  const on = pickedSet.has(role.roleKey);
                  const color = role.team ? CT_TYPE_COLOR[role.team] : '#888';
                  return (
                    <RoleCard
                      key={role.roleKey}
                      type="button"
                      $on={on}
                      $color={color}
                      onClick={() => toggle(role.roleKey)}
                      aria-pressed={on}
                    >
                      <ArtBox>
                        <RoleArt urls={roleImages(role)} alt={role.name} size={44} fallback={<ArtFallback $color={color}>{role.name.slice(0, 1)}</ArtFallback>} />
                      </ArtBox>
                      <RoleText>
                        <RoleName>
                          {role.name}
                          <TeamTag $color={color}>{role.team ? CT_TYPE_LABEL[role.team] : ''}</TeamTag>
                        </RoleName>
                        <Ability>{role.ability}</Ability>
                      </RoleText>
                      <Check $on={on} $color={color}>
                        {on ? '✓' : '+'}
                      </Check>
                    </RoleCard>
                  );
                })}
              </RoleGrid>
            )}
          </ListPane>

          <PickedPane $hidden={mobileView !== 'picked'}>
            <Field>
              <label>기존 게임에서 시작 (선택)</label>
              <select value={baseGameId} onChange={e => loadBaseGame(e.target.value)}>
                <option value="">처음부터</option>
                {games.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </Field>

            <Counts>
              {CT_TYPE_OPTIONS.map(o => {
                const count = pickedByTeam.get(o.value)?.length ?? 0;
                const typical = TYPICAL_COUNTS[o.value];
                if (count === 0 && typical == null) return null;
                return (
                  <CountItem key={o.value} $color={CT_TYPE_COLOR[o.value]}>
                    <span>{o.label}</span>
                    <strong>{count}</strong>
                    {typical != null && <small>/ 보통 {typical}</small>}
                  </CountItem>
                );
              })}
            </Counts>

            <PickedList>
              {picked.length === 0 && <Empty>왼쪽에서 캐릭터를 눌러 추가하세요.</Empty>}
              {CT_TYPE_OPTIONS.map(o => {
                const list = pickedByTeam.get(o.value);
                if (!list?.length) return null;
                return (
                  <PickedGroup key={o.value}>
                    <GroupTitle $color={CT_TYPE_COLOR[o.value]}>
                      {o.label} {list.length}
                    </GroupTitle>
                    <PickedChips>
                      {list.map(r => (
                        <PickedChip
                          key={r.roleKey}
                          type="button"
                          $color={CT_TYPE_COLOR[o.value]}
                          onClick={() => toggle(r.roleKey)}
                          title="빼기"
                        >
                          {r.name} ✕
                        </PickedChip>
                      ))}
                    </PickedChips>
                  </PickedGroup>
                );
              })}
            </PickedList>

            <MetaForm>
              <Field>
                <label>스크립트 이름</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="예: 우리 매장 스크립트" />
              </Field>
              <Field>
                <label>작성자 (선택)</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="예: 홍길동" />
              </Field>
              <Inline>
                <Field>
                  <label>최소 인원</label>
                  <input type="number" value={minPlayers} onChange={e => setMinPlayers(e.target.value)} />
                </Field>
                <Field>
                  <label>최대 인원</label>
                  <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} />
                </Field>
              </Inline>
            </MetaForm>

            <Actions>
              <SubButton type="button" onClick={() => setPicked([])} disabled={picked.length === 0}>
                모두 빼기
              </SubButton>
              <SubButton type="button" onClick={copyJson} disabled={picked.length === 0}>
                JSON 복사
              </SubButton>
              <MainButton type="button" onClick={register} disabled={registering}>
                {registering ? '등록 중…' : '게임으로 등록'}
              </MainButton>
            </Actions>
          </PickedPane>
        </Body>
      </Panel>
    </Overlay>
  );
}

const MOBILE = '@media (max-width: 844px)';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;

  ${MOBILE} {
    padding: 0;
  }
`;

const Panel = styled.div`
  width: min(1200px, 100%);
  height: min(860px, 100%);
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${MOBILE} {
    border-radius: 0;
    height: 100%;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #eee;

  h2 {
    margin: 0;
    font-size: 18px;
    color: ${CT_PURPLE};
  }
`;

const CloseButton = styled.button`
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
`;

const MobileSwitch = styled.div`
  display: none;

  ${MOBILE} {
    display: flex;
    border-bottom: 1px solid #eee;
  }
`;

const SwitchButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  background: ${({ $active }) => ($active ? CT_PURPLE : '#f5f3fa')};
  color: ${({ $active }) => ($active ? '#fff' : '#333')};
  font-weight: 600;
  cursor: pointer;
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;

  ${MOBILE} {
    grid-template-columns: 1fr;
  }
`;

const ListPane = styled.div<{ $hidden: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid #eee;

  ${MOBILE} {
    display: ${({ $hidden }) => ($hidden ? 'none' : 'flex')};
    border-right: none;
  }
`;

const PickedPane = styled.div<{ $hidden: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  overflow-y: auto;
  min-height: 0;
  background: #faf9fc;

  ${MOBILE} {
    display: ${({ $hidden }) => ($hidden ? 'none' : 'flex')};
  }
`;

const Filters = styled.div`
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Chip = styled.button<{ $active: boolean; $color: string }>`
  border: 1px solid ${({ $color }) => $color};
  background: ${({ $active, $color }) => ($active ? $color : '#fff')};
  color: ${({ $active, $color }) => ($active ? '#fff' : $color)};
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    min-width: 0;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 14px;
  }

  ${MOBILE} {
    input {
      font-size: 16px;
    }
  }
`;

const RoleGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
  align-content: start;
`;

const RoleCard = styled.button<{ $on: boolean; $color: string }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  border: 2px solid ${({ $on, $color }) => ($on ? $color : '#e6e6e6')};
  background: ${({ $on }) => ($on ? '#f6f2ff' : '#fff')};
  cursor: pointer;
`;

const ArtBox = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ArtFallback = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const RoleText = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoleName = styled.div`
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TeamTag = styled.span<{ $color: string }>`
  font-size: 11px;
  font-weight: 500;
  color: ${({ $color }) => $color};
`;

const Ability = styled.div`
  font-size: 12px;
  color: #555;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Check = styled.span<{ $on: boolean; $color: string }>`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: ${({ $on, $color }) => ($on ? $color : '#eee')};
  color: ${({ $on }) => ($on ? '#fff' : '#666')};
`;

const Empty = styled.div`
  padding: 24px;
  text-align: center;
  color: #888;
  font-size: 14px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  label {
    font-size: 12px;
    color: #666;
  }

  input,
  select {
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 7px 8px;
    font-size: 14px;
    background: #fff;
  }

  ${MOBILE} {
    input,
    select {
      font-size: 16px;
    }
  }
`;

const Counts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const CountItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: #fff;
  border-left: 4px solid ${({ $color }) => $color};
  font-size: 13px;

  strong {
    color: ${({ $color }) => $color};
  }

  small {
    color: #999;
  }
`;

const PickedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PickedGroup = styled.div``;

const GroupTitle = styled.div<{ $color: string }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $color }) => $color};
  margin-bottom: 4px;
`;

const PickedChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const PickedChip = styled.button<{ $color: string }>`
  border: 1px solid ${({ $color }) => $color};
  color: ${({ $color }) => $color};
  background: #fff;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 12px;
  cursor: pointer;
`;

const MetaForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Inline = styled.div`
  display: flex;
  gap: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: auto;
  padding-top: 8px;
`;

const SubButton = styled.button`
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 6px;
  padding: 9px 10px;
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const MainButton = styled.button`
  flex: 1;
  border: none;
  background: ${CT_PURPLE};
  color: #fff;
  border-radius: 6px;
  padding: 9px 10px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
