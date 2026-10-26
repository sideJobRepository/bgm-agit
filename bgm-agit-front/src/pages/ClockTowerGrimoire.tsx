import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/state/userState.ts';
import { toast } from '../utils/toast';
import api from '../utils/axiosInstance.ts';
import { showConfirmModal, showInputModal } from '../components/confirmAlert.tsx';
import { CT_TYPE_COLOR_DARK, CT_TYPE_LABEL } from '../config/clocktower.ts';
import { renderNightText } from '../utils/clocktowerText.tsx';
import GrimoireSetup from '../components/clocktower/grimoire/GrimoireSetup.tsx';
import SeatPanel from '../components/clocktower/grimoire/SeatPanel.tsx';
import EndGamePanel from '../components/clocktower/grimoire/EndGamePanel.tsx';
import DemonPassPanel from '../components/clocktower/grimoire/DemonPassPanel.tsx';
import { ExecutionPanel, ExilePanel } from '../components/clocktower/grimoire/ExecutionPanel.tsx';
import {
  BluffPanel,
  ScriptQrPanel,
  ShowCard,
  type ShowContent,
} from '../components/clocktower/grimoire/ShowPanels.tsx';
import { NightList, NightMode } from '../components/clocktower/grimoire/NightPanel.tsx';
import WinBanner from '../components/clocktower/grimoire/WinBanner.tsx';
import SetupWizard from '../components/clocktower/grimoire/SetupWizard.tsx';
import ReminderToken, { CurvedText, reminderSourceRole } from '../components/clocktower/grimoire/ReminderToken.tsx';
import { dealBag, isDealt, usedKeys } from '../components/clocktower/grimoire/bagRules.ts';
import RoleArt from '../components/clocktower/grimoire/RoleArt.tsx';
import { preloadGrimoireImages, tokenImageCandidates } from '../components/clocktower/grimoire/tokenImage.ts';
import { useImmersiveMode } from '../components/clocktower/grimoire/useImmersiveMode.ts';
import { buildEvilInfo, usePhoneSession } from '../components/clocktower/grimoire/usePhoneSession.ts';
import {
  checkGameEnd,
  type GameEvent,
  type SuccessionCause,
  type Team,
  type WinVerdict,
} from '../components/clocktower/grimoire/winCheck.ts';
import {
  createSeat,
  newSeatId,
  useGrimoire,
  useWakeLock,
} from '../components/clocktower/grimoire/useGrimoire.ts';
import {
  BASE_TEAMS,
  MAX_BASE_PLAYERS,
  MIN_PLAYERS_FOR_EVIL_INFO,
  activeJinxes,
  actualCounts,
  aliveAll,
  applyExecution,
  applyExile,
  baseSeatCount,
  changeSeatRole,
  demonSeats,
  expectedCounts,
  isEvilSeat,
  isUnderway,
  killSeat,
  phaseLabel,
  pickBluffs,
  randomAssignment,
  roleMap,
  runsEvilInfo,
  setTravellerAlignment,
  shownRole,
  totalPlayers,
  travellerNeedsAlignment,
  votesNeeded,
} from '../components/clocktower/grimoire/grimoireRules.ts';
import {
  Btn,
  Chip,
  Circle,
  CircleCenter,
  CountTable,
  GrimoireRoot,
  Layout,
  Mark,
  ReminderRow,
  Muted,
  NightBody,
  NightRow,
  NotesArea,
  Page,
  Panel,
  RoleTag,
  Row,
  SeatList,
  SeatMarks,
  SeatName,
  SeatNo,
  SeatRow,
  SeatRowBody,
  SeatSpot,
  Side,
  Stat,
  Tab,
  Tabs,
  Token,
  ToolTitle,
  Toolbar,
  Warn,
  type TokenShape,
} from '../components/clocktower/grimoire/grimoire.styles.ts';
import type {
  ClockTowerResultType,
  DeathCause,
  Execution,
  GrimoireData,
  GrimoireNoticeKind,
  GrimoireRole,
  GrimoireSeat,
  GrimoireState,
} from '../types/clocktower.ts';

type SideTab = 'night' | 'setup' | 'jinx' | 'fabled' | 'notes';

const SIDE_TABS: { value: SideTab; label: string }[] = [
  { value: 'night', label: '밤 순서' },
  { value: 'setup', label: '셋업 점검' },
  { value: 'jinx', label: '징크스' },
  { value: 'fabled', label: '전설' },
  { value: 'notes', label: '메모' },
];

const EMPTY_COLOR = 'var(--ct-muted)';

/** 첫날 밤을 시작하면(밤 체크·사망·처형) 셋업이 끝난다. 그 뒤 캐릭터 변경은 선악을 고정한다 */
function leaveSetup(s: GrimoireState): GrimoireState {
  return s.phase === 'SETUP' ? { ...s, phase: 'NIGHT' } : s;
}

/**
 * 진행판을 연 뒤 받은 최신 스크립트로 캐릭터 행 id 를 key 기준으로 맞춘다.
 * 공식 데이터를 다시 가져오거나 게임을 수정하면 캐릭터 행이 새로 만들어져, 들고 있던 id 로는 기록이 빈칸이 된다.
 */
function refreshCharacterIds(prev: GrimoireState, fresh: GrimoireData): GrimoireState {
  const byKey = new Map([...fresh.roles, ...fresh.nightSteps].map(r => [r.key, r]));
  // 캐릭터 id 와 함께 이미지 주소도 최신으로(이미지 복사 전에 연 판·이미지를 끈 경우)
  const fix = (r: GrimoireRole) => {
    const f = byKey.get(r.key);
    return f
      ? { ...r, characterId: f.characterId, image: f.image, imageGood: f.imageGood, imageEvil: f.imageEvil }
      : r;
  };
  return {
    ...prev,
    data: {
      ...prev.data,
      roles: prev.data.roles.map(fix),
      nightSteps: prev.data.nightSteps.map(fix),
      genericImages: fresh.genericImages ?? {},
    },
  };
}

/** 원형 배치 좌표(%). 0번이 12시 방향, 시계 방향 */
function seatPosition(i: number, total: number) {
  const angle = (2 * Math.PI * i) / total;
  const radius = 41;
  return { left: `${50 + radius * Math.sin(angle)}%`, top: `${50 - radius * Math.cos(angle)}%` };
}

/**
 * 이야기꾼 진행판(그리모어). 좌석은 어디서나 원형이고, 세로·좁은 화면은 오른쪽 패널이 원 아래로 내려간다.
 * 진행 상태는 이 기기 localStorage 에만 둔다(서버에 두면 누가 악마인지 조회될 수 있다).
 */
export default function ClockTowerGrimoire() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useRecoilValue(userState);
  const userId = user ? Number(user.id) : null;
  const {
    state,
    update,
    updateSilently,
    updateSeat,
    undo,
    canUndo,
    start,
    reset,
    reload,
    loadNotice,
    externalChange,
  } = useGrimoire(userId);

  const [openSeatId, setOpenSeatId] = useState<string | null>(null);
  const [sideTab, setSideTab] = useState<SideTab>('night');
  const [nightMode, setNightMode] = useState(false);
  // 낮 화면: 플레이어에게 보여줄 때 캐릭터·리마인더를 가린다
  const [dayView, setDayView] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  // 승패 제안 배너에서 연 게임 종료 창은 그 진영을 골라 둔다
  const [endResult, setEndResult] = useState<ClockTowerResultType | undefined>(undefined);
  // 승패 제안(확정 아님). 판을 바꾸는 조작 직후 다시 계산하고, 이야기꾼이 [계속]을 누르면 닫는다
  const [verdict, setVerdict] = useState<WinVerdict | null>(null);
  const [bluffOpen, setBluffOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [showContent, setShowContent] = useState<ShowContent | null>(null);
  // 악마 넘기기 창(악마가 죽으면 자동으로 열린다)
  const [demonSeatId, setDemonSeatId] = useState<string | null>(null);
  // 처형 결과 창을 연 좌석(사망/생존을 거기서 고른다)
  const [executeSeatId, setExecuteSeatId] = useState<string | null>(null);
  const [exileSeatId, setExileSeatId] = useState<string | null>(null);
  // 진행 중 합류한 자리. 좌석 메뉴를 여행자 탭으로 연다
  const [joinedSeatId, setJoinedSeatId] = useState<string | null>(null);
  // 자리 바꾸기: 켜 두고 두 자리를 차례로 누르면 맞바꾼다(좌석 메뉴의 한 칸 이동보다 빠르다)
  const [swapMode, setSwapMode] = useState(false);
  const [swapFrom, setSwapFrom] = useState<string | null>(null);

  useWakeLock(!!state);
  // 플레이어 휴대폰(/clocktower-my)으로 보낸 배정: 바뀐 좌석 자동 재전송 + 확인 여부
  const phone = usePhoneSession(state, updateSilently);
  // 몰입 모드(사이트 머리·푸터 숨김 + 전체 화면)는 진행 중인 판에서만
  const { immersive, fullscreen, canFullscreen, enter, exit, requestFullscreen } = useImmersiveMode(
    !!user && !!state
  );

  const roles = useMemo(
    () => (state ? roleMap(state.data) : new Map<string, GrimoireRole>()),
    [state]
  );

  // 저장본을 열 때 한 번, 최신 스크립트로 캐릭터 id 를 맞춘다(실패하면 들고 있던 값 그대로)
  const refreshedGameId = useRef<number | null>(null);
  const openGameId = state?.data.gameId ?? null;
  useEffect(() => {
    if (openGameId == null || refreshedGameId.current === openGameId) return;
    refreshedGameId.current = openGameId;
    api
      .get<GrimoireData>(`/bgm-agit/clocktower-games/${openGameId}/grimoire`)
      .then(res =>
        updateSilently(prev =>
          prev.data.gameId === openGameId ? refreshCharacterIds(prev, res.data) : prev
        )
      )
      .catch(() => {});
  }, [openGameId, updateSilently]);

  // 스크립트 이미지는 진입 때 미리 받아 둔다(주소 목록이 바뀔 때만)
  const imageSig = state
    ? [
        ...state.data.roles.map(r => `${r.image}|${r.imageGood}|${r.imageEvil}`),
        ...Object.values(state.data.genericImages ?? {}),
      ].join(',')
    : '';
  const dataForPreload = useRef<GrimoireData | null>(null);
  dataForPreload.current = state?.data ?? null;
  useEffect(() => {
    if (imageSig && dataForPreload.current) preloadGrimoireImages(dataForPreload.current);
  }, [imageSig]);

  useEffect(() => {
    if (loadNotice) toast.error(loadNotice);
  }, [loadNotice]);

  if (!user) {
    return (
      <GrimoireRoot $immersive={false}>
        <Muted>로그인 후 사용할 수 있습니다.</Muted>
      </GrimoireRoot>
    );
  }

  if (!state) {
    const gameId = Number(params.get('gameId'));
    return (
      <GrimoireRoot $immersive={false}>
        <Page>
          <Toolbar>
            <ToolTitle>
              <strong>이야기꾼 진행판</strong>
              <span>스크립트와 참가자를 정하면 시작합니다.</span>
            </ToolTitle>
            <Btn type="button" onClick={() => navigate('/clocktower-games')}>
              게임 목록
            </Btn>
          </Toolbar>
          <GrimoireSetup
            initialGameId={Number.isFinite(gameId) && gameId > 0 ? gameId : null}
            ownerId={userId}
            onStart={start}
          />
        </Page>
      </GrimoireRoot>
    );
  }

  const seats = state.seats;
  const openIndex = seats.findIndex(s => s.id === openSeatId);
  const openSeat = openIndex >= 0 ? seats[openIndex] : null;
  const alive = aliveAll(seats);
  const total = totalPlayers(seats);
  const needed = votesNeeded(seats);
  const jinxes = activeJinxes(state);
  const players = baseSeatCount(seats, roles);
  const expected = expectedCounts(players);
  const actual = actualCounts(seats, roles);
  const setupRoles = seats
    .map(s => roles.get(s.roleKey ?? ''))
    .filter((r): r is GrimoireRole => !!r && r.setup);
  const fabledOptions = state.data.roles.filter(r => r.team === 'FABLED' || r.team === 'LORIC');

  // 바뀐 판으로 승패 제안을 다시 계산한다. 설정에서 끄면 띄우지 않는다
  const suggest = (next: GrimoireState | null, ev: GameEvent) => {
    if (!next || !next.settings.suggestionsEnabled) return;
    const v = checkGameEnd(next, ev);
    setVerdict(v.status === 'CONTINUE' ? null : v);
  };

  const openEnd = (winner?: Team) => {
    setEndResult(winner ? (winner === 'GOOD' ? 'GOOD_WIN' : 'EVIL_WIN') : undefined);
    setVerdict(null);
    setEndOpen(true);
  };

  const moveSeat = (seatId: string, dir: -1 | 1) =>
    update(prev => {
      const list = [...prev.seats];
      const i = list.findIndex(s => s.id === seatId);
      const to = (i + dir + list.length) % list.length;
      [list[i], list[to]] = [list[to], list[i]];
      return { ...prev, seats: list };
    });

  // 자리(사람)를 통째로 맞바꾼다. 캐릭터·사망·리마인더도 그 사람을 따라간다
  const swapSeats = (a: string, b: string) =>
    update(prev => {
      const list = [...prev.seats];
      const i = list.findIndex(s => s.id === a);
      const j = list.findIndex(s => s.id === b);
      if (i < 0 || j < 0) return prev;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...prev, seats: list };
    });

  // 셋업 중에만 동작한다. 첫날 밤을 시작하면 버튼이 사라지므로 켜 둔 채 남지 않게 여기서도 막는다
  const swapping = swapMode && state.phase === 'SETUP';

  const onSeatClick = (seatId: string) => {
    if (dayView) return;
    if (!swapping) {
      setOpenSeatId(seatId);
      return;
    }
    if (!swapFrom) setSwapFrom(seatId);
    else if (swapFrom === seatId) setSwapFrom(null);
    else {
      swapSeats(swapFrom, seatId);
      setSwapFrom(null);
    }
  };

  const toggleSwapMode = () => {
    setSwapMode(v => !v);
    setSwapFrom(null);
  };

  const removeSeat = (seat: GrimoireSeat) =>
    showConfirmModal({
      message: `${seat.name} 자리를 뺄까요?`,
      onConfirm: () => {
        setOpenSeatId(null);
        update(prev => ({
          ...prev,
          seats: prev.seats.filter(s => s.id !== seat.id),
          pendingNotices: prev.pendingNotices.filter(n => n.seatId !== seat.id),
        }));
      },
    });

  const runRandom = () => {
    const result = randomAssignment(seats, state.data);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    const { assigned, setupRoles: picked } = result;
    const doIt = () => {
      // 셋업 단계의 배정이라 선악은 캐릭터 진영대로(null) 둔다
      update(prev => ({
        ...prev,
        seats: prev.seats.map(s =>
          assigned[s.id] ? { ...s, roleKey: assigned[s.id], believedRoleKey: null, evil: null } : s
        ),
      }));
      if (picked.length > 0) {
        toast.error(
          `${picked.map(r => r.name).join(', ')}: 셋업을 바꾸는 캐릭터인데 반영하지 않았습니다. 셋업 점검을 보고 직접 조정하거나 다시 뽑으세요.`
        );
      }
      if (Object.values(assigned).includes('lunatic')) {
        toast.error('미치광이가 뽑혔습니다. 좌석 메뉴에서 미치광이가 믿을 악마를 정해 주세요.');
      }
    };
    if (seats.some(s => s.roleKey)) {
      showConfirmModal({
        message: isUnderway(state)
          ? '게임이 이미 시작되었습니다. 지금 캐릭터를 모두 덮어쓰고 무작위로 다시 나눌까요?'
          : '이미 정한 캐릭터를 덮어쓰고 무작위로 다시 나눌까요?',
        onConfirm: doIt,
      });
    } else {
      doIt();
    }
  };

  // 악마를 다른 플레이어에게 넘긴다. 원래 캐릭터는 리마인더로 남기고, 탕녀면 공식 "악마입니다" 리마인더를 붙인다.
  // 선악은 넘겨받는 사람 것을 그대로 둔다(선한 사람이 악마가 되어도 선 — changeSeatRole)
  // 팡 구 이동은 예외로 넘겨받는 사람이 악이 된다(W/Fang_Gu)
  const passDemon = (fromSeatId: string, toSeatId: string, cause: SuccessionCause) => {
    const from = seats.find(s => s.id === fromSeatId);
    const demon = roles.get(from?.roleKey ?? '');
    if (!from || !demon) return;
    const next = update(prev => {
      const target = prev.seats.find(s => s.id === toSeatId);
      if (!target) return prev;
      const before = roles.get(target.roleKey ?? '');
      const isScarlet = target.roleKey === 'scarletwoman';
      const label: Record<SuccessionCause, string> = {
        SCARLET_WOMAN: '탕녀 승계',
        IMP_STARPASS: '임프 자결 승계',
        FANG_GU: '팡 구 이동',
        OTHER: '악마 넘기기',
      };
      const changed = changeSeatRole(prev, toSeatId, demon.key, roles, label[cause]);
      const reminders = [
        {
          id: newSeatId(),
          text: `${prev.day}일째 ${before?.name ?? '?'}→${demon.name}`,
          source: null,
        },
        ...(isScarlet
          ? [{ id: newSeatId(), text: '악마입니다', source: before?.name ?? '탕녀' }]
          : []),
      ];
      return {
        ...changed,
        seats: changed.seats.map(s =>
          s.id === toSeatId
            ? {
                ...s,
                reminders: [...s.reminders, ...reminders],
                ...(cause === 'FANG_GU' ? { evil: true } : {}),
              }
            : s
        ),
      };
    });
    setDemonSeatId(null);
    suggest(next, { kind: 'CHARACTER_CHANGE', seatIds: [toSeatId] });
    toast.success(
      `${seats.find(s => s.id === toSeatId)?.name}님이 ${demon.name}(이)가 되었습니다. 밤에 본인에게 알려 주세요.`
    );
  };

  // N번째 밤 → N일째 낮 → (N+1)번째 밤. 셋업에서 시작하면 첫날 밤이다
  // 해 질 녘(밤 시작 직전)에 시장·보르톡스·레비아탄 5일째를 판정한다 — 그날 낮의 처형 기록으로 본다
  const startNight = () => {
    if (state.phase === 'DAY') suggest(state, { kind: 'DUSK' });
    update(prev =>
      prev.phase === 'SETUP'
        ? { ...prev, phase: 'NIGHT', nightTab: 'first' }
        : { ...prev, day: prev.day + 1, phase: 'NIGHT', nightTab: 'other', nightChecked: [] }
    );
    setSideTab('night');
  };

  // 새벽: 밤 사망을 모두 반영한 뒤 한 번에 판정한다
  const endNight = () =>
    suggest(
      update(prev => ({ ...prev, phase: 'DAY' })),
      { kind: 'DAWN' }
    );

  // 살아 있던 악마가 죽으면 넘기기 창을 띄운다(탕녀·임프 자결 등)
  const openDemonPassIfDemon = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat && !seat.dead && roles.get(seat.roleKey ?? '')?.team === 'DEMON') {
      setOpenSeatId(null);
      setDemonSeatId(seatId);
    }
  };

  // 처형·추방이 아닌 사망. 누가 죽었으면 게임이 시작된 것이다
  const recordDeath = (seatId: string, cause: DeathCause) => {
    const next = update(prev => killSeat(leaveSetup(prev), seatId, cause));
    suggest(next, { kind: 'DEATH', seatId, cause });
    openDemonPassIfDemon(seatId);
  };

  const confirmExecution = (opts: {
    died: boolean;
    survivedReason: string | null;
    route: Execution['route'];
  }) => {
    const seatId = executeSeatId;
    if (!seatId) return;
    const next = update(prev => applyExecution(leaveSetup(prev), seatId, opts));
    setExecuteSeatId(null);
    suggest(next, { kind: 'EXECUTION', seatId });
    if (opts.died) openDemonPassIfDemon(seatId);
  };

  const confirmExile = (opts: { supporters: number; survived: boolean }) => {
    const seatId = exileSeatId;
    if (!seatId) return;
    const next = update(prev => applyExile(leaveSetup(prev), seatId, opts));
    setExileSeatId(null);
    suggest(next, { kind: 'EXILE', seatId });
  };

  // 떠난 여행자는 자리를 지우지 않고 모든 셈에서 뺀다(RB p.18)
  const toggleLeft = (seat: GrimoireSeat) =>
    showConfirmModal({
      message: seat.left
        ? `${seat.name}님이 다시 게임에 들어온 것으로 할까요?`
        : `${seat.name}님이 게임을 떠난 것으로 할까요? 인원 셈에서 빠집니다.`,
      onConfirm: () => {
        setOpenSeatId(null);
        update(prev => ({
          ...prev,
          seats: prev.seats.map(s => (s.id === seat.id ? { ...s, left: !s.left } : s)),
        }));
      },
    });

  const setTravellerEvil = (seatId: string, evil: boolean) => {
    update(prev => setTravellerAlignment(prev, seatId, evil));
    if (evil)
      toast.success(
        '악한 여행자에게는 악마가 누구인지 알려 주세요. 밤 순서 탭 위 알림에서 보여 줄 수 있습니다.'
      );
  };

  // 진행 중 합류(여행자). 셋업 중이면 그냥 자리 추가다
  const addSeat = () => {
    const underway = isUnderway(state);
    showInputModal({
      message: underway
        ? `합류할 여행자 이름을 적어 주세요.${
            aliveAll(seats) < 7
              ? ' 생존자가 7명 미만일 때 여행자 합류는 권장하지 않습니다(RB p.18).'
              : ''
          }`
        : '추가할 플레이어 이름을 적어 주세요.',
      label: '이름',
      onConfirm: name => {
        const seat = createSeat(null, name);
        update(prev => ({ ...prev, seats: [...prev.seats, seat] }));
        setJoinedSeatId(underway ? seat.id : null);
        setOpenSeatId(seat.id);
      },
    });
  };

  // 게임 도중 캐릭터가 바뀐 좌석·악한 여행자: 본인에게 보여주고 알림 목록에서 지운다
  const showNotice = (seatId: string, kind: GrimoireNoticeKind) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;
    if (kind === 'EVIL_TRAVELLER_DEMON') {
      // 악마만 알려 준다. 하수인은 알려 주지 않는다(RB p.18)
      const demons = demonSeats(state, roles);
      if (demons.length === 0) {
        toast.error('살아 있는 악마 자리가 없습니다. 좌석 캐릭터를 먼저 정해 주세요.');
        return;
      }
      setShowContent({
        title: '이 사람이 악마입니다',
        roles: [],
        message: demons.map(d => d.name).join(', '),
      });
    } else {
      const shown = shownRole(seat, roles);
      if (!shown) {
        toast.error(
          '보여줄 캐릭터가 없습니다. 좌석 메뉴에서 캐릭터(주정뱅이 등은 믿는 캐릭터)를 정해 주세요.'
        );
        return;
      }
      setShowContent({ title: '당신의 캐릭터', roles: [shown] });
    }
    updateSilently(prev => ({
      ...prev,
      pendingNotices: prev.pendingNotices.filter(n => !(n.seatId === seatId && n.kind === kind)),
    }));
  };

  const newGame = () =>
    showConfirmModal({
      message: '진행 중인 게임을 지우고 새로 시작할까요? 되돌릴 수 없습니다.',
      onConfirm: async () => {
        setOpenSeatId(null);
        // 플레이어 휴대폰에 지난 게임 캐릭터가 남지 않게 먼저 닫는다
        await phone.close();
        reset();
      },
    });

  // 회원 좌석마다 보여줄 캐릭터(주정뱅이 등은 믿는 캐릭터)를 휴대폰으로 보낸다
  const sendToPhones = () => {
    const memberSeats = seats.filter(s => s.memberId != null);
    if (memberSeats.length === 0) {
      toast.error('회원 자리가 없어 휴대폰으로 보낼 수 없습니다.');
      return;
    }
    const guests = seats.length - memberSeats.length;
    const go = async () => {
      if (await phone.send())
        toast.success(
          `회원 ${memberSeats.length}명에게 보냈습니다. 각자 휴대폰으로 스크립트 QR 을 찍고 로그인하면 볼 수 있습니다.${
            guests ? ` 회원이 아닌 ${guests}자리는 빠졌습니다.` : ''
          }`
        );
    };
    const missing = memberSeats.filter(s => !shownRole(s, roles));
    const notes: string[] = [];
    if (missing.length)
      notes.push(
        `캐릭터(주정뱅이 등은 믿는 캐릭터)가 정해지지 않은 자리가 ${missing.length}개 있습니다(${missing
          .map(s => s.name)
          .join(', ')}). 정하면 자동으로 다시 보냅니다.`
      );
    if (phone.session) notes.push('새로 보내면 플레이어 확인 표시가 처음부터 다시 시작됩니다.');
    if (notes.length) showConfirmModal({ message: `${notes.join(' ')} 보낼까요?`, onConfirm: go });
    else go();
  };

  // 첫날 밤 악 팀 정보(악마: 하수인+악마의 속임수, 하수인: 악마+다른 하수인)를 해당 좌석 휴대폰으로
  const sendEvilInfo = () => {
    const result = buildEvilInfo(state);
    if (!result.ok) {
      toast.error(result.message);
      if (!(state.bluffs ?? []).length && runsEvilInfo(state, roles)) setBluffOpen(true);
      return;
    }
    const count = Object.keys(result.infos).length;
    if (count === 0) toast.error('휴대폰으로 받을 악 팀 회원 자리가 없습니다.');
    else {
      phone.setInfos(result.infos);
      toast.success(`악 팀 ${count}명에게 정보를 보냅니다.`);
    }
    result.warnings.forEach(w => toast.error(w));
  };
  const evilInfoAvailable = runsEvilInfo(state, roles);

  // 셋업 단계 안내(주머니 → 악마의 속임수 → 캐릭터 나눠 주기). 아직 아무도 앉지 않았을 때만
  const showWizard = state.phase === 'SETUP' && !isDealt(state, roles);

  // 셋업 3단계: 자리는 그대로 두고 주머니 캐릭터를 무작위로 나눠 주고, 회원 자리에는 캐릭터 + 악 팀 정보를 한 번에 보낸다
  const dealAndSend = async () => {
    const dealt = dealBag(state, roles);
    if (!dealt.ok) {
      toast.error(dealt.message);
      return;
    }
    const next = update(() => dealt.state);
    if (!next) return;
    dealt.warnings.forEach(w => toast.error(w));
    const guests = next.seats.filter(s => s.memberId == null && s.roleKey);
    const guestNote = guests.length
      ? ` 손님 ${guests.length}자리(${guests.map(s => s.name).join(', ')})는 좌석 메뉴의 [본인에게 보여주기]로 알려 주세요.`
      : '';
    if (!next.seats.some(s => s.memberId != null)) {
      toast.success(`캐릭터를 나눠 줬습니다.${guestNote}`);
      return;
    }
    let infos = {};
    if (runsEvilInfo(next, roles)) {
      const evil = buildEvilInfo(next);
      if (evil.ok) {
        infos = evil.infos;
        evil.warnings.forEach(w => toast.error(w));
      } else toast.error(evil.message);
    }
    if (await phone.send({ state: next, infos }))
      toast.success(`캐릭터를 나눠 주고 회원에게 보냈습니다.${guestNote}`);
  };

  const tokenOf = (seat: GrimoireSeat, i: number) => {
    const role = roles.get(seat.roleKey ?? '');
    const color = role?.team ? CT_TYPE_COLOR_DARK[role.team] : EMPTY_COLOR;
    // 진영을 색만으로 가르지 않게 테두리 모양도 다르게(낮 화면은 진영을 드러내지 않는다)
    const shape: TokenShape | undefined =
      dayView ? undefined : role?.team === 'DEMON' ? 'double' : role?.team === 'MINION' ? 'dashed' : undefined;
    const label = dayView ? `${i + 1}` : (role?.name ?? '미정');
    // 낮 화면(플레이어가 보는 화면)에는 그림을 그리지 않는다
    const images = dayView ? [] : tokenImageCandidates(role, isEvilSeat(seat, roles), state.data.genericImages);
    return { role, color, shape, label, images };
  };

  const marksOf = (seat: GrimoireSeat) => {
    // 떠남·사망·유령 투표는 모두가 아는 공개 정보다
    if (dayView) {
      if (seat.left) return [<Mark key="l">떠남</Mark>];
      return seat.dead
        ? [
            <Mark key="v" $tone="vote">
              {seat.ghostVoteUsed ? '투표 끝' : '유령 투표'}
            </Mark>,
          ]
        : [];
    }
    const evil = isEvilSeat(seat, roles);
    const role = roles.get(seat.roleKey ?? '');
    const marks = [];
    if (swapping && swapFrom === seat.id)
      marks.push(
        <Mark key="swap" $tone="vote">
          바꿀 자리
        </Mark>
      );
    if (seat.left) marks.push(<Mark key="l">떠남</Mark>);
    if (travellerNeedsAlignment(seat, roles))
      marks.push(
        <Mark key="na" $tone="evil">
          선악 미정
        </Mark>
      );
    // 진영이 캐릭터와 다르게 바뀐 경우(또는 여행자)에만 선악 표시
    if (seat.evil != null || role?.team === 'TRAVELLER') {
      if (evil != null)
        marks.push(
          <Mark key="a" $tone={evil ? 'evil' : 'good'}>
            {evil ? '악' : '선'}
          </Mark>
        );
    }
    if (seat.dead)
      marks.push(
        <Mark key="v" $tone="vote">
          {seat.ghostVoteUsed ? '투표 끝' : '유령'}
        </Mark>
      );
    // 휴대폰으로 보낸 캐릭터(정보)를 본인이 눌러 봤는지
    const viewed = phone.viewStatusOf(seat.memberId);
    if (viewed)
      marks.unshift(
        <Mark key="phone" $tone={viewed === 'viewed' ? 'good' : 'vote'}>
          {viewed === 'viewed' ? '✓ 확인' : '미확인'}
        </Mark>
      );
    return marks;
  };

  // 리마인더는 글자 띠가 아니라 그림 토큰으로(낮 화면에는 안 보인다)
  // 주정뱅이 등이 믿는 캐릭터도 같은 모양의 토큰으로 맨 앞에 둔다
  const remindersOf = (seat: GrimoireSeat, size: number) => {
    if (dayView) return null;
    const believed = roles.get(seat.believedRoleKey ?? '');
    if (!believed && seat.reminders.length === 0) return null;
    return (
      <ReminderRow>
        {believed && <ReminderToken text="믿는 캐릭터" role={believed} size={size} />}
        {seat.reminders.map(m => (
          <ReminderToken key={m.id} text={m.text} role={reminderSourceRole(m.source, state.data)} size={size} />
        ))}
      </ReminderRow>
    );
  };

  return (
    <GrimoireRoot $immersive={immersive}>
      <Page>
        <Toolbar $sticky={immersive}>
          <ToolTitle>
            <strong>{state.data.gameName}</strong>
            <span>
              {phaseLabel(state)} · 생존 {alive}/{total}
            </span>
          </ToolTitle>
          <Stat>처형 {needed}표 이상</Stat>
          {/* 몰입 종료는 낮 화면에서도 늘 보이게 둔다 */}
          {immersive ? (
            <>
              {canFullscreen && !fullscreen && (
                <Btn type="button" onClick={requestFullscreen}>
                  전체 화면
                </Btn>
              )}
              <Btn type="button" onClick={exit}>
                몰입 종료
              </Btn>
            </>
          ) : (
            <Btn type="button" onClick={enter}>
              몰입 모드
            </Btn>
          )}
          <Btn type="button" $active={dayView} onClick={() => setDayView(v => !v)}>
            {dayView ? '이야기꾼 화면' : '낮 화면(가리기)'}
          </Btn>
          {/* 낮 화면은 플레이어가 본다. 악마의 속임수·배정·되돌리기 같은 이야기꾼 버튼은 숨긴다 */}
          {!dayView && (
            <>
              <Btn
                type="button"
                onClick={() => {
                  undo();
                  setVerdict(null);
                }}
                disabled={!canUndo}
              >
                되돌리기
              </Btn>
              {/* 셋업 안내가 떠 있는 동안은 안내의 3단계가 배정·보내기를 맡는다 */}
              {!showWizard && (
                <Btn type="button" onClick={runRandom}>
                  무작위 배정
                </Btn>
              )}
              <Btn type="button" onClick={() => setBluffOpen(true)}>
                악마의 속임수
              </Btn>
              <Btn type="button" onClick={() => setQrOpen(true)}>
                스크립트 QR
              </Btn>
              {!showWizard && (
                <Btn type="button" $active={!!phone.session} onClick={sendToPhones} disabled={phone.sending}>
                  {phone.sending ? '보내는 중…' : phone.session ? '휴대폰으로 다시 보내기' : '휴대폰으로 배정 보내기'}
                </Btn>
              )}
              {phone.session && state.day === 1 && state.phase !== 'DAY' && (
                <Btn
                  type="button"
                  onClick={sendEvilInfo}
                  disabled={!evilInfoAvailable}
                  title={
                    evilInfoAvailable
                      ? undefined
                      : `${MIN_PLAYERS_FOR_EVIL_INFO}명 미만이라 첫날 밤 하수인·악마 정보 단계가 없습니다`
                  }
                >
                  {evilInfoAvailable
                    ? '첫날 밤 악 팀 정보 보내기'
                    : `악 팀 정보 없음(${MIN_PLAYERS_FOR_EVIL_INFO}명 미만)`}
                </Btn>
              )}
              {state.phase === 'SETUP' && (
                <Btn type="button" $active={swapping} onClick={toggleSwapMode}>
                  {swapping ? '자리 바꾸기 끝' : '자리 바꾸기'}
                </Btn>
              )}
              <Btn type="button" onClick={addSeat}>
                {isUnderway(state) ? '여행자 합류' : '자리 추가'}
              </Btn>
              {state.phase === 'NIGHT' ? (
                <Btn type="button" onClick={endNight}>
                  밤 끝내기
                </Btn>
              ) : (
                // 셋업이 끝나면 선악이 고정된다(밤 체크·사망으로도 자동 전환)
                <Btn type="button" onClick={startNight}>
                  {state.phase === 'SETUP' ? '첫날 밤 시작' : '밤 시작'}
                </Btn>
              )}
              <Btn type="button" $tone="primary" onClick={() => openEnd()}>
                게임 종료
              </Btn>
              <Btn type="button" $tone="danger" onClick={newGame}>
                새 게임
              </Btn>
            </>
          )}
        </Toolbar>

        {externalChange && (
          <Warn>
            다른 탭(창)에서 이 진행판이 저장되었습니다. 여기서 계속 진행하면 그쪽 내용을 덮어씁니다.
            <Row style={{ marginTop: 8 }}>
              <Btn type="button" onClick={reload}>
                그쪽 내용으로 다시 불러오기
              </Btn>
            </Row>
          </Warn>
        )}

        {/* 판정 제안은 이야기꾼만 본다(낮 화면에서 숨김) */}
        {!dayView && verdict && (
          <WinBanner verdict={verdict} onEnd={openEnd} onContinue={() => setVerdict(null)} />
        )}

        {swapping && !dayView && (
          <Warn>
            {swapFrom
              ? `${seats.find(s => s.id === swapFrom)?.name ?? ''}님과 바꿀 자리를 누르세요. 같은 자리를 다시 누르면 취소됩니다.`
              : '바꿀 두 자리를 차례로 누르세요. 사람이 통째로 맞바뀝니다(캐릭터를 나눠 준 뒤라면 캐릭터도 같이 움직입니다).'}
          </Warn>
        )}

        {showWizard && !dayView && (
          <SetupWizard
            state={state}
            roles={roles}
            sending={phone.sending}
            onBag={bag =>
              update(prev => {
                // 주머니에 들어간 캐릭터는 악마의 속임수가 될 수 없다
                const used = usedKeys(bag);
                return { ...prev, bag, bluffs: (prev.bluffs ?? []).filter(k => !used.has(k)) };
              })
            }
            onBluffs={bluffs => update(prev => ({ ...prev, bluffs }))}
            onDeal={dealAndSend}
          />
        )}

        <Layout>
          <div>
            <Circle>
              {seats.map((seat, i) => {
                const { color, shape, label, role, images } = tokenOf(seat, i);
                const dead = seat.dead || seat.left;
                return (
                  <SeatSpot
                    key={seat.id}
                    type="button"
                    style={seatPosition(i, seats.length)}
                    onClick={() => onSeatClick(seat.id)}
                  >
                    <Token
                      $color={dayView ? CT_TYPE_COLOR_DARK.TOWNSFOLK : color}
                      $shape={shape}
                      $dead={dead}
                      $empty={!dayView && !role}
                      $art={images.length > 0}
                    >
                      {images.length > 0 ? (
                        <RoleArt
                          urls={images}
                          alt=""
                          size={70}
                          dead={dead}
                          fallback={label}
                          overlay={<CurvedText text={label} size={70} color="#ffffff" outline="rgba(10, 8, 14, 0.92)" fontScale={0.16} />}
                        />
                      ) : (
                        label
                      )}
                    </Token>
                    <SeatName $dead={seat.dead}>{seat.name}</SeatName>
                    <SeatMarks>{marksOf(seat)}</SeatMarks>
                    {remindersOf(seat, 42)}
                  </SeatSpot>
                );
              })}
              <CircleCenter>
                <strong>{dayView ? phaseLabel(state) : state.data.gameName}</strong>
                <span>
                  생존 {alive}명 · 처형 {needed}표
                </span>
              </CircleCenter>
            </Circle>

            <SeatList>
              {seats.map((seat, i) => {
                const { color, role } = tokenOf(seat, i);
                return (
                  <SeatRow
                    key={seat.id}
                    type="button"
                    $dead={seat.dead}
                    onClick={() => onSeatClick(seat.id)}
                  >
                    <SeatNo>{i + 1}</SeatNo>
                    {!dayView && role && (
                      <RoleArt
                        urls={tokenImageCandidates(role, isEvilSeat(seat, roles), state.data.genericImages)}
                        alt=""
                        size={44}
                        dead={seat.dead || seat.left}
                      />
                    )}
                    <SeatRowBody>
                      <SeatName $dead={seat.dead}>{seat.name}</SeatName>
                      {!dayView && (
                        <RoleTag $color={role ? color : EMPTY_COLOR}>
                          {role
                            ? `${role.name} · ${role.team ? CT_TYPE_LABEL[role.team] : ''}${
                                seat.believedRoleKey
                                  ? ` (믿음 ${roles.get(seat.believedRoleKey)?.name ?? '?'})`
                                  : ''
                              }`
                            : '캐릭터 미정'}
                        </RoleTag>
                      )}
                      <SeatMarks style={{ justifyContent: 'flex-start', maxWidth: 'none' }}>
                        {marksOf(seat)}
                      </SeatMarks>
                      {remindersOf(seat, 46)}
                    </SeatRowBody>
                  </SeatRow>
                );
              })}
            </SeatList>
          </div>

          {!dayView && (
            <Side>
              <Tabs>
                {SIDE_TABS.map(t => (
                  <Tab
                    key={t.value}
                    type="button"
                    $active={sideTab === t.value}
                    onClick={() => setSideTab(t.value)}
                  >
                    {t.label}
                    {t.value === 'jinx' && jinxes.length > 0 ? ` ${jinxes.length}` : ''}
                  </Tab>
                ))}
              </Tabs>
              <Panel>
                {sideTab === 'night' && state.pendingNotices.length > 0 && (
                  <Warn>
                    본인에게 몰래 알려 줄 것이 있습니다(캐릭터가 바뀐 사람은 가장 빠른 기회에, 악한
                    여행자는 악마가 누구인지).
                    <Row style={{ marginTop: 8 }}>
                      {state.pendingNotices.map(n => {
                        const seat = seats.find(s => s.id === n.seatId);
                        if (!seat) return null;
                        return (
                          <Btn
                            key={`${n.seatId}-${n.kind}`}
                            type="button"
                            onClick={() => showNotice(n.seatId, n.kind)}
                          >
                            {n.kind === 'EVIL_TRAVELLER_DEMON'
                              ? `${seat.name}에게 악마 알려 주기`
                              : `${seat.name}에게 보여주기`}
                          </Btn>
                        );
                      })}
                    </Row>
                  </Warn>
                )}
                {sideTab === 'night' && (
                  <NightList
                    state={state}
                    onTab={tab => update(prev => ({ ...prev, nightTab: tab }))}
                    // 밤 체크는 되돌리기 기록에 넣지 않는다(30칸을 체크가 다 차지해 사망 같은 조작을 못 되돌리게 된다)
                    onToggle={key =>
                      updateSilently(prev =>
                        leaveSetup({
                          ...prev,
                          nightChecked: prev.nightChecked.includes(key)
                            ? prev.nightChecked.filter(k => k !== key)
                            : [...prev.nightChecked, key],
                        })
                      )
                    }
                    onClear={() =>
                      showConfirmModal({
                        message: '밤 체크를 모두 비울까요?',
                        onConfirm: () => updateSilently(prev => ({ ...prev, nightChecked: [] })),
                      })
                    }
                    onOpenMode={() => setNightMode(true)}
                  />
                )}

                {sideTab === 'setup' && (
                  <>
                    {!expected ? (
                      <Muted>
                        {players > MAX_BASE_PLAYERS
                          ? `여행자를 뺀 인원이 ${players}명입니다. ${MAX_BASE_PLAYERS}명을 넘는 인원은 여행자여야 합니다.`
                          : '여행자를 뺀 인원이 5명 이상이어야 합니다.'}
                      </Muted>
                    ) : (
                      <CountTable>
                        <thead>
                          <tr>
                            <th>진영</th>
                            <th>기준({players}인)</th>
                            <th>지금</th>
                          </tr>
                        </thead>
                        <tbody>
                          {BASE_TEAMS.map(t => (
                            <tr key={t}>
                              <td style={{ color: CT_TYPE_COLOR_DARK[t] }}>{CT_TYPE_LABEL[t]}</td>
                              <td>{expected[t]}</td>
                              <td className={actual[t] !== expected[t] ? 'bad' : ''}>
                                {actual[t]}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </CountTable>
                    )}
                    {setupRoles.length > 0 && (
                      <Warn>
                        셋업을 바꾸는 캐릭터가 있습니다. 능력대로 진영 수를 조정하세요.
                        {setupRoles.map(r => (
                          <div key={r.key}>
                            <b>{r.name}</b> — {r.ability}
                          </div>
                        ))}
                      </Warn>
                    )}
                    {seats.some(s => !s.roleKey) && (
                      <Warn>
                        캐릭터가 정해지지 않은 자리가 {seats.filter(s => !s.roleKey).length}개
                        있습니다.
                      </Warn>
                    )}
                    <Row style={{ marginTop: 12 }}>
                      <Chip
                        type="button"
                        $active={state.settings.suggestionsEnabled}
                        onClick={() => {
                          setVerdict(null);
                          update(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              suggestionsEnabled: !prev.settings.suggestionsEnabled,
                            },
                          }));
                        }}
                      >
                        승패·승계 제안 {state.settings.suggestionsEnabled ? '켜짐' : '꺼짐'}
                      </Chip>
                    </Row>
                  </>
                )}

                {sideTab === 'jinx' &&
                  (jinxes.length === 0 ? (
                    <Muted>이 게임에 걸린 징크스가 없습니다.</Muted>
                  ) : (
                    jinxes.map(j => (
                      <NightRow key={`${j.roleA}-${j.roleB}`} $done={false} $muted={false}>
                        <NightBody>
                          <Row style={{ gap: 6 }}>
                            <RoleArt urls={tokenImageCandidates(roles.get(j.roleA), null)} alt="" size={36} />
                            <b>{roles.get(j.roleA)?.name}</b>×
                            <RoleArt urls={tokenImageCandidates(roles.get(j.roleB), null)} alt="" size={36} />
                            <b>{roles.get(j.roleB)?.name}</b>
                          </Row>
                          <div>{renderNightText(j.reason)}</div>
                        </NightBody>
                      </NightRow>
                    ))
                  ))}

                {sideTab === 'fabled' &&
                  (fabledOptions.length === 0 ? (
                    <Muted>이 스크립트에 전설·로릭 캐릭터가 없습니다.</Muted>
                  ) : (
                    fabledOptions.map(r => {
                      const on = state.fabled.includes(r.key);
                      return (
                        <NightRow key={r.key} $done={false} $muted={!on}>
                          <NightBody>
                            <Row>
                              <RoleArt urls={tokenImageCandidates(r, null)} alt="" size={40} />
                              <b>{r.name}</b>
                              <Chip
                                type="button"
                                $color={r.team ? CT_TYPE_COLOR_DARK[r.team] : undefined}
                                $active={on}
                                onClick={() =>
                                  update(prev => ({
                                    ...prev,
                                    fabled: on
                                      ? prev.fabled.filter(k => k !== r.key)
                                      : [...prev.fabled, r.key],
                                  }))
                                }
                              >
                                {on ? '사용 중' : '사용'}
                              </Chip>
                            </Row>
                            {r.ability && <div>{r.ability}</div>}
                          </NightBody>
                        </NightRow>
                      );
                    })
                  ))}

                {sideTab === 'notes' && (
                  <NotesArea
                    value={state.notes}
                    placeholder="이야기꾼 메모 (이 기기에만 저장됩니다)"
                    onChange={e => updateSilently(prev => ({ ...prev, notes: e.target.value }))}
                  />
                )}
              </Panel>
            </Side>
          )}
        </Layout>

        {openSeat && (
          <SeatPanel
            state={state}
            seat={openSeat}
            index={openIndex}
            defaultTeam={joinedSeatId === openSeat.id ? 'TRAVELLER' : undefined}
            onPatch={(patch, silent) =>
              silent
                ? updateSilently(prev => ({
                    ...prev,
                    seats: prev.seats.map(s => (s.id === openSeat.id ? { ...s, ...patch } : s)),
                  }))
                : 'evil' in patch
                  ? // 선악을 바꾸면 승패가 달라질 수 있다(쌍둥이·성자 등)
                    suggest(updateSeat(openSeat.id, patch), {
                      kind: 'CHARACTER_CHANGE',
                      seatIds: [openSeat.id],
                    })
                  : updateSeat(openSeat.id, patch)
            }
            onExecute={() => {
              setOpenSeatId(null);
              setExecuteSeatId(openSeat.id);
            }}
            onDeath={cause => recordDeath(openSeat.id, cause)}
            onRevive={() =>
              updateSeat(openSeat.id, { dead: false, death: null, ghostVoteUsed: false })
            }
            onExile={() => {
              setOpenSeatId(null);
              setExileSeatId(openSeat.id);
            }}
            onToggleLeft={() => toggleLeft(openSeat)}
            onTravellerAlignment={evil => setTravellerEvil(openSeat.id, evil)}
            onChangeRole={key =>
              suggest(
                update(prev => changeSeatRole(prev, openSeat.id, key, roles, '이야기꾼 변경')),
                {
                  kind: 'CHARACTER_CHANGE',
                  seatIds: [openSeat.id],
                }
              )
            }
            onMove={dir => moveSeat(openSeat.id, dir)}
            onRemove={() => removeSeat(openSeat)}
            onShow={role => setShowContent({ title: '당신의 캐릭터', roles: [role] })}
            onPassDemon={() => {
              setDemonSeatId(openSeat.id);
              setOpenSeatId(null);
            }}
            onClose={() => {
              setOpenSeatId(null);
              setJoinedSeatId(null);
            }}
          />
        )}

        {executeSeatId && (
          <ExecutionPanel
            // 다른 좌석으로 열면 고른 값(사망·사유·방식)을 새로 시작한다
            key={executeSeatId}
            state={state}
            seatId={executeSeatId}
            onConfirm={confirmExecution}
            onClose={() => setExecuteSeatId(null)}
          />
        )}

        {exileSeatId && (
          <ExilePanel
            state={state}
            seatId={exileSeatId}
            onConfirm={confirmExile}
            onClose={() => setExileSeatId(null)}
          />
        )}

        {demonSeatId && (
          <DemonPassPanel
            state={state}
            demonSeatId={demonSeatId}
            onPass={(to, cause) => passDemon(demonSeatId, to, cause)}
            onEndGame={winner => {
              setDemonSeatId(null);
              openEnd(winner);
            }}
            onClose={() => setDemonSeatId(null)}
          />
        )}

        {bluffOpen && (
          <BluffPanel
            state={state}
            onReroll={() => update(prev => ({ ...prev, bluffs: pickBluffs(prev) }))}
            onShow={content => setShowContent(content)}
            onClose={() => setBluffOpen(false)}
          />
        )}

        {qrOpen && <ScriptQrPanel state={state} onClose={() => setQrOpen(false)} />}

        {showContent && <ShowCard content={showContent} onClose={() => setShowContent(null)} />}

        {endOpen && (
          <EndGamePanel
            state={state}
            writerId={Number(user.id)}
            initialResult={endResult}
            // 자체로그인(소셜 아님) 또는 관리자만 시계탑 기록을 쓸 수 있다(서버 규칙과 같음)
            canWrite={
              !user.socialId || (user.roles ?? []).some(r => r === 'ROLE_ADMIN' || r === 'ADMIN')
            }
            onClose={() => setEndOpen(false)}
            onSaved={() => {
              setEndOpen(false);
              // 게임이 끝났으니 플레이어 휴대폰 배정을 닫는다
              phone.close();
              showConfirmModal({
                message: '기록을 남겼습니다. 진행판을 비우고 기록 목록으로 갈까요?',
                onConfirm: () => {
                  reset();
                  navigate('/clocktower-records');
                },
              });
            }}
          />
        )}

        {nightMode && (
          <NightMode
            state={state}
            onCheck={key =>
              updateSilently(prev =>
                leaveSetup({ ...prev, nightChecked: [...prev.nightChecked, key] })
              )
            }
            onClose={() => setNightMode(false)}
          />
        )}
      </Page>
    </GrimoireRoot>
  );
}
