import { Wrapper } from '../styles';
import { Box, ButtonRow, Button, DetailHead, Thumb, NoImage, DetailTitle, DetailMeta, BigResult, DraftBadge, SectionTitle, PartViewList, PartViewItem, PartLeft, PartNick, PartChar, TypeTag, WinTag, Memo, FormTitle, ResultToggle, ToggleBtn, SearchBox, Dropdown, Option, EmptyOption, PartEditList, PartEditRow, PartNickEdit, MeTag, RemovePart, Hint, LabelRow, LoadButton, LoadPanel, LoadPanelHead, LoadClose, LoadItem, LoadItemTop, LoadItemNicks, LoadEmpty, PickerWrap, PickerControl, PickerDropdown, PickerSearch, FilterRow, FilterChip, PickerList, PickerOption, PickerEmpty, Field } from './ClockTowerRecordDetail.styles.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { toast } from '../utils/toast';
import { MdClose } from 'react-icons/md';
import api from '../utils/axiosInstance';
import { clockTowerRecordDetailState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerRecordDetailFetch } from '../recoil/clocktowerFetch.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import GameSelect from '../components/GameSelect.tsx';
import type {
  ClockTowerCharacter,
  ClockTowerCharacterType,
  ClockTowerGame,
  ClockTowerRecordDetail as ClockTowerRecordDetailType,
  ClockTowerRecordListItem,
  ClockTowerResultType,
  MemberOption,
} from '../types/clocktower.ts';

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const TYPE_COLOR: Record<ClockTowerCharacterType, string> = {
  TOWNSFOLK: '#1565C0',
  OUTSIDER: '#0097A7',
  MINION: '#C62828',
  DEMON: '#6A1B9A',
};

const STORYTELLER_NAME = '이야기꾼';

/** 검색형 캐릭터 선택 (BML 입력처럼 검색 + 선택). value: 'ST'=이야기꾼, ''=미선택, 숫자=캐릭터 id */
function CharacterSelect({
  roster,
  storyteller,
  characterId,
  disabled,
  onPick,
}: {
  roster: ClockTowerCharacter[];
  storyteller: boolean;
  characterId: number | '';
  disabled: boolean;
  onPick: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<ClockTowerCharacterType | 'ALL'>('ALL');
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const selected = useMemo(
    () => (characterId === '' ? null : roster.find(c => c.id === characterId) ?? null),
    [roster, characterId]
  );

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return roster.filter(
      c =>
        (typeFilter === 'ALL' || c.type === typeFilter) &&
        (k === '' || c.name.toLowerCase().includes(k))
    );
  }, [roster, keyword, typeFilter]);

  const label = storyteller
    ? '이야기꾼 (진행자)'
    : selected
      ? `${selected.name} (${selected.typeName})`
      : '';

  const pick = (value: string) => {
    onPick(value);
    setKeyword('');
    setTypeFilter('ALL');
    setOpen(false);
  };

  const TYPE_FILTERS: { value: ClockTowerCharacterType | 'ALL'; label: string }[] = [
    { value: 'ALL', label: '전체' },
    { value: 'TOWNSFOLK', label: '마을주민' },
    { value: 'OUTSIDER', label: '외부인' },
    { value: 'MINION', label: '하수인' },
    { value: 'DEMON', label: '악마' },
  ];

  return (
    <PickerWrap ref={wrapRef}>
      <PickerControl
        type="button"
        $placeholder={!label}
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        {label || '캐릭터 선택'}
      </PickerControl>
      {open && !disabled && (
        <PickerDropdown>
          <PickerSearch
            type="text"
            autoFocus
            placeholder="캐릭터명 검색"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <FilterRow>
            {TYPE_FILTERS.map(f => (
              <FilterChip
                key={f.value}
                type="button"
                $active={typeFilter === f.value}
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </FilterChip>
            ))}
          </FilterRow>
          <PickerList>
            <PickerOption type="button" onClick={() => pick('ST')}>
              <strong>이야기꾼</strong>
              <span>진행자</span>
            </PickerOption>
            {selected && (
              <PickerOption type="button" onClick={() => pick('')}>
                선택 해제
              </PickerOption>
            )}
            {filtered.map(c => (
              <PickerOption key={c.id} type="button" onClick={() => pick(String(c.id))}>
                <strong>{c.name}</strong>
                <span>{c.typeName}</span>
              </PickerOption>
            ))}
            {filtered.length === 0 && <PickerEmpty>검색 결과가 없습니다.</PickerEmpty>}
          </PickerList>
        </PickerDropdown>
      )}
    </PickerWrap>
  );
}

interface PartRow {
  memberId: number;
  nickname: string;
  characterId: number | '';
  storyteller: boolean;
  characterName?: string | null; // 수정 진입 시 스냅샷 이름 (roster 도착 후 id 매칭용)
}

export default function ClockTowerRecordDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const user = useRecoilValue(userState);
  // 자체로그인(MAHJONG) 회원만 등록·수정·삭제 가능. 소셜 회원은 socialId 보유. 관리자는 모더레이션 예외.
  const isSelfLogin = !!user && !user.socialId;
  const isAdmin = !!user && (user.roles ?? []).some(r => r === 'ROLE_ADMIN' || r === 'ADMIN');
  const canWrite = isSelfLogin || isAdmin;
  const detail = useRecoilValue(clockTowerRecordDetailState);
  const fetchDetail = useClockTowerRecordDetailFetch();
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const [editMode, setEditMode] = useState(!id);
  const [games, setGames] = useState<ClockTowerGame[]>([]);
  const [gameId, setGameId] = useState<number | ''>('');
  const [roster, setRoster] = useState<ClockTowerCharacter[]>([]);
  const [playDate, setPlayDate] = useState(todayStr());
  const [result, setResult] = useState<ClockTowerResultType | ''>('');
  const [parts, setParts] = useState<PartRow[]>([]);
  const [memo, setMemo] = useState('');

  // 참가자 검색
  const [keyword, setKeyword] = useState('');
  const [candidates, setCandidates] = useState<MemberOption[]>([]);
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const debounce = useRef<number | null>(null);

  // 지난 기록 불러오기 패널
  const [loadOpen, setLoadOpen] = useState(false);
  const [loadList, setLoadList] = useState<ClockTowerRecordListItem[]>([]);
  const [loadLoading, setLoadLoading] = useState(false);

  const writerId = useMemo(() => (user ? Number(user.id) : null), [user]);
  const canEditSelf = !id || detail?.writerId === writerId;

  // simple 게임 목록
  useEffect(() => {
    api.get('/bgm-agit/clocktower-games/simple').then(res => setGames(res.data)).catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (id) fetchDetail(Number(id));
  }, [id]);

  // 수정 진입: 상세값 주입
  useEffect(() => {
    if (detail && id) {
      setGameId(detail.gameId ?? '');
      setPlayDate(detail.playDate ?? todayStr());
      setResult(detail.result ?? '');
      setMemo(detail.memo ?? '');
      setParts(
        detail.participants.map(p => ({
          memberId: p.memberId,
          nickname: p.nickname,
          characterId: '',
          storyteller: p.characterName === STORYTELLER_NAME,
          characterName: p.characterName,
        }))
      );
    }
  }, [detail, id]);

  // 등록 모드: 작성자 자동 포함
  useEffect(() => {
    if (!id && user) {
      setParts(prev =>
        prev.some(p => p.memberId === Number(user.id))
          ? prev
          : [{ memberId: Number(user.id), nickname: user.name, characterId: '', storyteller: false }, ...prev]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  // 게임 선택 시 캐릭터 로스터 로드
  useEffect(() => {
    if (!gameId) {
      setRoster([]);
      return;
    }
    api
      .get(`/bgm-agit/clocktower-games/${gameId}`)
      .then(res => setRoster((res.data as ClockTowerGame).characters ?? []))
      .catch(() => setRoster([]));
  }, [gameId]);

  // 로스터 도착 후, 수정 진입 스냅샷 이름 → characterId 매칭 (진행자 제외)
  useEffect(() => {
    if (roster.length === 0) return;
    setParts(prev =>
      prev.map(p => {
        if (p.storyteller || p.characterId !== '' || !p.characterName) return p;
        const found = roster.find(c => c.name === p.characterName);
        return found ? { ...p, characterId: found.id } : p;
      })
    );
  }, [roster]);

  // 회원 검색 디바운스
  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      api
        .get('/bgm-agit/all-members', { params: { keyword } })
        .then(res => setCandidates(res.data as MemberOption[]))
        .catch(() => setCandidates([]));
    }, 250);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [keyword]);

  // 바깥 클릭 시 검색 닫기
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const addPart = (m: MemberOption) => {
    setParts(prev =>
      prev.some(p => p.memberId === m.id)
        ? prev
        : [...prev, { memberId: m.id, nickname: m.nickname || `#${m.id}`, characterId: '', storyteller: false }]
    );
    // 연속 추가: 검색창을 닫지 않고 비운 뒤 포커스 유지 → 이름만 연달아 입력
    setKeyword('');
    setOpen(true);
    searchInputRef.current?.focus();
  };

  // 멤버 명단을 폼에 적용(캐릭터·진행자는 비움). 작성자는 항상 포함.
  const applyRoster = (members: { memberId: number; nickname: string }[]) => {
    const next: PartRow[] = members.map(m => ({
      memberId: m.memberId,
      nickname: m.nickname,
      characterId: '',
      storyteller: false,
    }));
    if (writerId != null && !next.some(p => p.memberId === writerId)) {
      next.unshift({ memberId: writerId, nickname: user?.name ?? `#${writerId}`, characterId: '', storyteller: false });
    }
    setParts(next);
  };

  // 지난 기록 패널 열기: 내 최근 시계탑 기록 목록 로드
  const openLoadPanel = () => {
    if (!writerId) return;
    setLoadOpen(true);
    setLoadLoading(true);
    api
      .get('/bgm-agit/clocktower-records', { params: { memberId: writerId, page: 0, size: 10 } })
      .then(res => setLoadList((res.data?.content ?? []) as ClockTowerRecordListItem[]))
      .catch(() => setLoadList([]))
      .finally(() => setLoadLoading(false));
  };

  // 지난 기록 선택 → 참가자 명단 prefill (게임도 함께 불러옴, 캐릭터·결과는 비움)
  const pickPrevious = (recordId: number) => {
    api
      .get(`/bgm-agit/clocktower-records/${recordId}`)
      .then(res => {
        const d = res.data as ClockTowerRecordDetailType;
        if (d.gameId) setGameId(d.gameId);
        applyRoster((d.participants ?? []).map(p => ({ memberId: p.memberId, nickname: p.nickname })));
        setLoadOpen(false);
        toast.success('참가자 명단을 불러왔습니다.');
      })
      .catch(() => toast.error('기록을 불러오지 못했습니다.'));
  };

  const removePart = (memberId: number) => {
    if (!id && writerId === memberId) return; // 등록 시 본인 제거 불가
    setParts(prev => prev.filter(p => p.memberId !== memberId));
  };

  // 캐릭터 select 변경: 'ST'=이야기꾼, ''=미선택, 숫자=캐릭터 id
  const setPartChar = (memberId: number, value: string) =>
    setParts(prev =>
      prev.map(p =>
        p.memberId === memberId
          ? value === 'ST'
            ? { ...p, storyteller: true, characterId: '' }
            : { ...p, storyteller: false, characterId: value === '' ? '' : Number(value) }
          : p
      )
    );

  const visibleCandidates = useMemo(
    () => candidates.filter(c => !parts.some(p => p.memberId === c.id)),
    [candidates, parts]
  );

  const onSubmit = (opts: { draft?: boolean } = {}) => {
    const draft = opts.draft ?? false;

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (!canWrite) {
      toast.error('자체로그인(마작) 회원만 시계탑 기록을 작성할 수 있습니다.');
      return;
    }
    if (!gameId) {
      toast.error('게임을 선택해주세요.');
      return;
    }
    if (!playDate) {
      toast.error('플레이 날짜를 선택해주세요.');
      return;
    }
    // 완료 저장만 엄격 검증(임시저장은 미완성 허용)
    if (!draft) {
      if (!result) {
        toast.error('결과(선인승/악마승)를 선택해주세요.');
        return;
      }
      const unassigned = parts.filter(p => !p.storyteller && p.characterId === '');
      if (unassigned.length > 0) {
        const names = unassigned.map(p => p.nickname).slice(0, 5).join(', ');
        const more = unassigned.length > 5 ? ` 외 ${unassigned.length - 5}명` : '';
        toast.error(`${names}${more} 님의 캐릭터(또는 이야기꾼)를 선택해주세요.`);
        return;
      }
      // 결과 ↔ 진영 정합성: 이긴 진영의 캐릭터가 최소 1명 있어야 함
      const playerTypes = parts
        .filter(p => !p.storyteller && p.characterId !== '')
        .map(p => roster.find(c => c.id === p.characterId)?.type)
        .filter((t): t is ClockTowerCharacterType => !!t);
      const hasEvil = playerTypes.some(t => t === 'MINION' || t === 'DEMON');
      const hasGood = playerTypes.some(t => t === 'TOWNSFOLK' || t === 'OUTSIDER');
      if (result === 'EVIL_WIN' && !hasEvil) {
        toast.error('악 진영(하수인/악마) 캐릭터가 한 명도 없어 악마승으로 저장할 수 없습니다.');
        return;
      }
      if (result === 'GOOD_WIN' && !hasGood) {
        toast.error('선 진영(마을주민/외부인) 캐릭터가 한 명도 없어 선인승으로 저장할 수 없습니다.');
        return;
      }
    }

    const body = {
      gameId: Number(gameId),
      playDate,
      result: result || null,
      memo,
      draft,
      participants: parts.map(p => ({
        memberId: p.memberId,
        characterId: p.storyteller || p.characterId === '' ? null : Number(p.characterId),
        storyteller: p.storyteller,
      })),
    };

    showConfirmModal({
      message: draft ? '임시저장하시겠습니까?' : '저장하시겠습니까?',
      onConfirm: () => {
        if (id) {
          update({
            url: `/bgm-agit/clocktower-records/${id}`,
            body,
            ignoreHttpError: true,
            onSuccess: () => {
              toast.success(draft ? '임시저장되었습니다.' : '기록이 수정되었습니다.');
              fetchDetail(Number(id));
              setEditMode(false);
            },
          });
        } else {
          insert({
            url: '/bgm-agit/clocktower-records',
            body,
            ignoreHttpError: true,
            onSuccess: () => {
              toast.success(draft ? '임시저장되었습니다.' : '플레이 기록이 등록되었습니다.');
              navigate('/clocktower-records');
            },
          });
        }
      },
    });
  };

  const onDelete = () => {
    if (!id) return;
    showConfirmModal({
      message: '이 기록을 삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/clocktower-records/${id}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('삭제되었습니다.');
            navigate('/clocktower-records');
          },
        });
      },
    });
  };

  // ---------- 상세 보기 ----------
  if (id && !editMode) {
    return (
      <Wrapper>
        <Box>
          <ButtonRow>
            {detail?.canManage && canWrite && (
              <>
                <Button $variant="primary" color="#4A2C82" onClick={() => setEditMode(true)}>수정</Button>
                <Button $variant="danger" color="#FF5E57" onClick={onDelete}>삭제</Button>
              </>
            )}
            <Button $variant="secondary" color="#988271" onClick={() => navigate('/clocktower-records')}>목록</Button>
          </ButtonRow>

          <DetailHead>
            <Thumb>
              {detail?.gameImageUrl ? <img src={detail.gameImageUrl} alt={detail.gameName} /> : <NoImage>NO IMAGE</NoImage>}
            </Thumb>
            <div>
              <DetailTitle>{detail?.gameName}</DetailTitle>
              <DetailMeta>{detail?.playDate}</DetailMeta>
              <DetailMeta>기록 {detail?.writerNickname}</DetailMeta>
              {detail?.draft ? (
                <DraftBadge>임시저장</DraftBadge>
              ) : (
                detail?.result && <BigResult $evil={detail.result === 'EVIL_WIN'}>{detail.resultName}</BigResult>
              )}
            </div>
          </DetailHead>

          <SectionTitle>참가자 ({detail?.participants.length ?? 0}명)</SectionTitle>
          <PartViewList>
            {detail?.participants.map(p => (
              <PartViewItem key={p.memberId}>
                <PartLeft>
                  <PartNick>{p.nickname}</PartNick>
                  {p.characterName && (
                    <PartChar>
                      {p.characterName}
                      {p.typeName && (
                        <TypeTag color={p.type ? TYPE_COLOR[p.type] : '#888'}>{p.typeName}</TypeTag>
                      )}
                    </PartChar>
                  )}
                </PartLeft>
                {p.win != null && <WinTag $win={p.win}>{p.win ? '승' : '패'}</WinTag>}
              </PartViewItem>
            ))}
          </PartViewList>

          {detail?.memo && (
            <>
              <SectionTitle>메모</SectionTitle>
              <Memo>{detail.memo}</Memo>
            </>
          )}
        </Box>
      </Wrapper>
    );
  }

  // ---------- 등록 / 수정 ----------
  return (
    <Wrapper>
      <Box>
        <FormTitle>{id ? '기록 수정' : '시계탑 기록'}</FormTitle>

        <Field>
          <label>게임 *</label>
          <GameSelect games={games} value={gameId} onChange={setGameId} />
        </Field>

        <Field>
          <label>플레이 날짜 *</label>
          <input type="date" value={playDate} onChange={e => setPlayDate(e.target.value)} />
        </Field>

        <Field>
          <label>결과 *</label>
          <ResultToggle>
            <ToggleBtn
              type="button"
              $active={result === 'GOOD_WIN'}
              $color="#1565C0"
              onClick={() => setResult('GOOD_WIN')}
            >
              선인승
            </ToggleBtn>
            <ToggleBtn
              type="button"
              $active={result === 'EVIL_WIN'}
              $color="#6A1B9A"
              onClick={() => setResult('EVIL_WIN')}
            >
              악마승
            </ToggleBtn>
          </ResultToggle>
        </Field>

        <Field>
          <LabelRow>
            <label>참가자 / 캐릭터</label>
            {!id && (
              <LoadButton type="button" onClick={openLoadPanel}>지난 기록 불러오기</LoadButton>
            )}
          </LabelRow>

          {loadOpen && (
            <LoadPanel>
              <LoadPanelHead>
                <span>지난 기록에서 참가자 불러오기</span>
                <LoadClose type="button" onClick={() => setLoadOpen(false)}><MdClose /></LoadClose>
              </LoadPanelHead>
              {loadLoading ? (
                <LoadEmpty>불러오는 중...</LoadEmpty>
              ) : loadList.length === 0 ? (
                <LoadEmpty>불러올 지난 기록이 없습니다.</LoadEmpty>
              ) : (
                loadList.map(r => (
                  <LoadItem key={r.id} type="button" onClick={() => pickPrevious(r.id)}>
                    <LoadItemTop>
                      <strong>{r.gameName}</strong>
                      <span>{r.playDate} · {r.participantCount}명</span>
                    </LoadItemTop>
                    <LoadItemNicks>{r.participantNicknames.join(', ')}</LoadItemNicks>
                  </LoadItem>
                ))
              )}
            </LoadPanel>
          )}

          <SearchBox ref={searchRef}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="닉네임으로 참가자 검색"
              value={keyword}
              onChange={e => {
                setKeyword(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
            {open && (visibleCandidates.length > 0 || keyword.trim()) && (
              <Dropdown>
                {visibleCandidates.map(c => (
                  <Option key={c.id} type="button" onClick={() => addPart(c)}>
                    {c.nickname || `#${c.id}`}
                  </Option>
                ))}
                {visibleCandidates.length === 0 && keyword.trim() && (
                  <EmptyOption>검색 결과가 없습니다.</EmptyOption>
                )}
              </Dropdown>
            )}
          </SearchBox>

          <PartEditList>
            {parts.map(p => (
              <PartEditRow key={p.memberId}>
                <PartNickEdit>
                  {p.nickname}
                  {writerId === p.memberId && <MeTag>(나)</MeTag>}
                </PartNickEdit>
                <CharacterSelect
                  roster={roster}
                  storyteller={p.storyteller}
                  characterId={p.characterId}
                  disabled={!gameId}
                  onPick={value => setPartChar(p.memberId, value)}
                />
                {!(!id && writerId === p.memberId) && (
                  <RemovePart type="button" onClick={() => removePart(p.memberId)}>
                    <MdClose />
                  </RemovePart>
                )}
              </PartEditRow>
            ))}
          </PartEditList>
          {!gameId && <Hint>게임을 먼저 선택하면 캐릭터를 고를 수 있습니다.</Hint>}
          {!canEditSelf && id && <Hint>본인이 작성한 기록이 아닙니다. 관리자 권한으로 수정 중입니다.</Hint>}
        </Field>

        <Field>
          <label>메모 (선택)</label>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="간단한 메모" />
        </Field>

        <ButtonRow>
          <Button $variant="primary" color="#1A7D55" onClick={() => onSubmit()}>저장</Button>
          <Button $variant="secondary" color="#B5651D" onClick={() => onSubmit({ draft: true })}>임시저장</Button>
          <Button $variant="ghost" color="#988271" onClick={() => (id ? setEditMode(false) : navigate('/clocktower-records'))}>취소</Button>
        </ButtonRow>
      </Box>
    </Wrapper>
  );
}
