import { useMemo, useState } from 'react';
import api from '../../../utils/axiosInstance.ts';
import { toast } from '../../../utils/toast';
import { todayYmd } from '../../../utils/date.ts';
import type { ClockTowerResultType, GrimoireState } from '../../../types/clocktower.ts';
import { isEvilSeat, roleMap } from './grimoireRules.ts';
import {
  Btn,
  Chip,
  Hint,
  Overlay,
  Row,
  Sheet,
  SheetHead,
  SheetSection,
  TextInput,
  Warn,
} from './grimoire.styles.ts';

/** 기록 메모 상한(서버 @Size·DB TEXT 와 같은 값) */
const MEMO_MAX = 5000;
/** 직접 입력한 캐릭터 키("c{캐릭터ID}")는 사전 키가 아니라 서버가 다시 찾을 수 없다 */
const CUSTOM_KEY = /^c\d+$/;

interface Props {
  state: GrimoireState;
  writerId: number;
  canWrite: boolean;
  // 승패 제안 배너에서 [선/악 승리로 종료]를 눌러 열면 그 진영이 골라진 채로 연다(바꿀 수 있다)
  initialResult?: ClockTowerResultType;
  onSaved: () => void;
  onClose: () => void;
}

/**
 * 게임 종료 → 시계탑 플레이 기록을 임시저장으로 만든다.
 * 참가자·캐릭터·최종 선악·승패를 진행판 그대로 넘기고, 이야기꾼(작성자)은 진행자로 들어간다.
 * 임시저장이라 랭킹·통계에는 아직 안 잡힌다. 기록 화면에서 확인하고 완료 저장한다.
 */
export default function EndGamePanel({
  state,
  writerId,
  canWrite,
  initialResult,
  onSaved,
  onClose,
}: Props) {
  const roles = useMemo(() => roleMap(state.data), [state.data]);
  const [result, setResult] = useState<ClockTowerResultType | ''>(initialResult ?? '');
  const [playDate, setPlayDate] = useState(todayYmd());
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const memberSeats = state.seats.filter(s => s.memberId != null && s.memberId !== writerId);
  const guests = state.seats.filter(s => s.memberId == null);
  const writerSeated = state.seats.some(s => s.memberId === writerId);
  const noRole = state.seats.filter(s => !s.roleKey);
  const unknownSide = state.seats.filter(s => s.roleKey && isEvilSeat(s, roles) == null);
  // 한 줄 메모 + 이야기꾼 메모를 합친 것이 기록 메모가 된다
  const fullMemo = [memo.trim(), state.notes.trim() ? `[이야기꾼 메모]\n${state.notes.trim()}` : '']
    .filter(Boolean)
    .join('\n\n');
  const memoLeft = MEMO_MAX - fullMemo.length;

  const save = async () => {
    if (!result) {
      toast.error('어느 쪽이 이겼는지 골라 주세요.');
      return;
    }
    if (memoLeft < 0) {
      toast.error(
        `메모가 ${MEMO_MAX}자를 넘습니다(이야기꾼 메모 포함). ${-memoLeft}자를 줄여 주세요.`
      );
      return;
    }
    const participants = [
      // 이야기꾼 = 지금 로그인한 사람(기록 작성자)
      { memberId: writerId, characterId: null, storyteller: true, evil: null },
      ...memberSeats.map(s => ({
        memberId: s.memberId,
        characterId: roles.get(s.roleKey ?? '')?.characterId ?? null,
        // 캐릭터 행 id 가 바뀌었어도 서버가 (게임, 키)로 다시 찾게 키를 같이 보낸다
        roleKey: s.roleKey && !CUSTOM_KEY.test(s.roleKey) ? s.roleKey : null,
        storyteller: false,
        evil: s.evil,
      })),
    ];
    setSaving(true);
    try {
      const { data } = await api.post<{ code?: number; success?: boolean; message?: string }>(
        '/bgm-agit/clocktower-records',
        {
          gameId: state.data.gameId,
          playDate,
          result,
          memo: fullMemo,
          draft: true,
          participants,
        }
      );
      // ApiResponse 의 403 은 HTTP 200 으로 온다
      if (data?.success === false) {
        toast.error(data.message ?? '기록을 저장하지 못했습니다.');
        return;
      }
      toast.success('기록을 임시저장했습니다. 기록 화면에서 확인 후 완료 저장해 주세요.');
      onSaved();
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast.error(message ?? '기록을 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={e => e.stopPropagation()}>
        <SheetHead>
          <h3>게임 종료 · 기록 남기기</h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>

        {!canWrite ? (
          <Warn>
            시계탑 기록은 자체로그인 회원만 남길 수 있습니다. 소셜 로그인으로 들어왔다면 기록
            화면에서 다른 회원이 입력해 주세요.
          </Warn>
        ) : (
          <>
            <SheetSection>
              <label>승리</label>
              <Row>
                <Chip
                  type="button"
                  $color="var(--ct-good)"
                  $active={result === 'GOOD_WIN'}
                  onClick={() => setResult('GOOD_WIN')}
                >
                  선인승
                </Chip>
                <Chip
                  type="button"
                  $color="var(--ct-evil)"
                  $active={result === 'EVIL_WIN'}
                  onClick={() => setResult('EVIL_WIN')}
                >
                  악마승
                </Chip>
              </Row>
            </SheetSection>

            <SheetSection>
              <label>플레이 날짜</label>
              <TextInput type="date" value={playDate} onChange={e => setPlayDate(e.target.value)} />
            </SheetSection>

            <SheetSection>
              <label>메모 (선택)</label>
              <TextInput
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="한 줄 남기기"
                maxLength={MEMO_MAX}
              />
              <Hint style={{ marginTop: 6, color: memoLeft < 0 ? 'var(--ct-evil)' : undefined }}>
                {state.notes.trim() ? '이야기꾼 메모도 같이 붙습니다. ' : ''}
                {memoLeft >= 0 ? `${memoLeft}자 남음` : `${-memoLeft}자 넘침 — 줄여야 저장됩니다`}
              </Hint>
            </SheetSection>

            <SheetSection>
              <label>기록에 들어가는 사람</label>
              <Hint>
                이야기꾼(나) + 회원 {memberSeats.length}명
                {guests.length > 0 &&
                  ` · 손님 ${guests.length}명(${guests.map(g => g.name).join(', ')})은 빠집니다`}
              </Hint>
              {writerSeated && <Warn>내가 좌석에도 있어 이야기꾼으로만 기록됩니다.</Warn>}
              {noRole.length > 0 && (
                <Warn>캐릭터가 없는 자리: {noRole.map(s => s.name).join(', ')}</Warn>
              )}
              {unknownSide.length > 0 && (
                <Warn>
                  선악이 정해지지 않은 자리(여행자 등): {unknownSide.map(s => s.name).join(', ')} —
                  좌석 메뉴에서 선/악을 지정하면 승패가 계산됩니다.
                </Warn>
              )}
            </SheetSection>

            <Btn
              type="button"
              $tone="primary"
              onClick={save}
              disabled={saving}
              style={{ minHeight: 52, marginTop: 8 }}
            >
              {saving ? '저장 중…' : '임시저장으로 기록 남기기'}
            </Btn>
          </>
        )}
      </Sheet>
    </Overlay>
  );
}
