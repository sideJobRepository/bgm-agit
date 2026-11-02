// 코드 분할 이후 이 CSS 를 쓰는 화면이 따로 import 하면 그 화면을 거치지 않은 경우 확인창이 오버레이 없이 깨진다
import 'react-confirm-alert/src/react-confirm-alert.css';
import { confirmAlert } from 'react-confirm-alert';
import { useRef, useState } from 'react';
import { MdAdd, MdRemove } from 'react-icons/md';
import { toast } from '../utils/toast';
import api from '../utils/axiosInstance.ts';
import type { ReservationChangeOptions } from '../types/reservation.ts';
import {
  AlertWrapper,
  Message,
  FieldLabel,
  ButtonGroup,
  ReservationHeader,
  FieldGroup,
  FieldTitle,
  Stepper,
  IconButton,
  CountValue,
  SummaryList,
  ReasonTextarea,
  HelperText,
  NoticeMessage,
  CancelButton,
  ConfirmButton,
  ReasonInput,
} from './confirmAlert.styles.ts';

interface Props {
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ReservationConfirmProps {
  label: string;
  initialCount: number;
  minPeople: number;
  // 서버 이미지 컬럼이 비어 있을 수 있어 없을 때를 허용한다(예전엔 non-null 단언이라 NaN 이 새어나왔다)
  maxPeople?: number;
  // 예약 요약에 함께 보여줄 부가 정보 (예: 이용 방식, 합쳐 예약한 항목)
  summary?: string[];
  /**
   * 정액 결제(마작 대탁)의 확정 금액. 룸 일무제한은 인원에 따라 달라지므로 unitPrice 를 쓴다.
   * 둘 다 없으면 금액을 아예 안내하지 않는다 — 임의 기본값을 쓰면 실제 청구액과 갈린다.
   */
  depositAmount?: number | null;
  /** 룸 일무제한 1인 단가. 인원을 조절할 때마다 총액이 따라 움직인다 */
  unitPrice?: number | null;
  /** 벙주 혜택가일 때의 정가(1인). 있으면 "벙주 혜택가 적용"과 정가 대비 금액을 보여 준다 */
  regularUnitPrice?: number | null;
  onConfirm: (values: { count: number; reason: string }) => void;
  onCancel?: () => void;
}

export function showConfirmModal({ message, onConfirm, onCancel }: Props) {
  confirmAlert({
    customUI: ({ onClose }) => (
      <AlertWrapper>
        <Message>{message}</Message>
        <ButtonGroup>
          <CancelButton
            onClick={() => {
              onCancel?.();
              onClose();
            }}
          >
            취소
          </CancelButton>
          <ConfirmButton
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            확인
          </ConfirmButton>
        </ButtonGroup>
      </AlertWrapper>
    ),
  });
}

// 예약 확정 모달 (인원수·요청사항 입력 포함)
function ReservationConfirmContent({
  label,
  initialCount,
  minPeople,
  maxPeople,
  summary = [],
  depositAmount,
  unitPrice,
  regularUnitPrice,
  onClose,
  onConfirm,
  onCancel,
}: ReservationConfirmProps & { onClose: () => void }) {
  const [count, setCount] = useState(initialCount);
  const [reason, setReason] = useState('');

  // 인원 상한이 없으면(컬럼 미설정) 스테퍼를 막지 않는다. 서버가 최종 검증한다
  const canIncrease = maxPeople == null || count < maxPeople;
  const totalAmount = unitPrice != null ? unitPrice * count : (depositAmount ?? null);

  return (
    <AlertWrapper $wide>
      <ReservationHeader>
        <span>예약 정보 확인</span>
        <strong>{label}</strong>
      </ReservationHeader>

      <FieldGroup>
        <FieldTitle>
          <span>예약 인원</span>
          <small>
            {minPeople}명{maxPeople != null ? ` - ${maxPeople}명` : ' 이상'}
          </small>
        </FieldTitle>
        <Stepper>
          <IconButton
            type="button"
            disabled={count <= minPeople}
            onClick={() => setCount(c => Math.max(minPeople, c - 1))}
            aria-label="인원 줄이기"
          >
            <MdRemove />
          </IconButton>
          <CountValue>
            <strong>{count}</strong>
            <span>명</span>
          </CountValue>
          <IconButton
            type="button"
            disabled={!canIncrease}
            onClick={() => setCount(c => (maxPeople == null ? c + 1 : Math.min(maxPeople, c + 1)))}
            aria-label="인원 늘리기"
          >
            <MdAdd />
          </IconButton>
        </Stepper>
      </FieldGroup>

      {summary.length > 0 && (
        <FieldGroup>
          <FieldTitle>
            <span>이용 정보</span>
          </FieldTitle>
          <SummaryList>
            {summary.map(item => (
              <li key={item}>{item}</li>
            ))}
          </SummaryList>
        </FieldGroup>
      )}

      <FieldGroup>
        <FieldTitle>
          <span>요청사항</span>
          <small>선택 입력</small>
        </FieldTitle>
        <ReasonTextarea
          placeholder="필요한 내용이 있으면 적어주세요."
          value={reason}
          maxLength={200}
          onChange={e => setReason(e.target.value)}
        />
        <HelperText>{reason.length}/200</HelperText>
      </FieldGroup>

      <NoticeMessage>
        {unitPrice != null ? (
          <>
            이용요금 {unitPrice.toLocaleString()}원 × {count}명 ={' '}
            <strong>{(totalAmount ?? 0).toLocaleString()}원</strong>
            <br />
            {regularUnitPrice != null && (
              <>
                <strong>벙주 혜택가 적용</strong> — 정가{' '}
                {(regularUnitPrice * count).toLocaleString()}원 대비{' '}
                {((regularUnitPrice - unitPrice) * count).toLocaleString()}원 할인
                <br />
              </>
            )}
            예약내역에서 전액 결제하시면 예약이 확정됩니다.
            <br />
            환불은 이용일 48시간 전까지 100%, 24시간 전까지 50%, 그 이후에는 불가합니다.
          </>
        ) : totalAmount != null ? (
          <>
            예약금은 {totalAmount.toLocaleString()}원입니다.
            <br />
            예약내역에서 예약금을 결제하면 예약이 확정되며, 잔여 이용요금은 현장에서 결제합니다.
          </>
        ) : (
          <>예약내역에서 결제하시면 예약이 확정됩니다.</>
        )}
      </NoticeMessage>
      <ButtonGroup>
        <CancelButton
          onClick={() => {
            onCancel?.();
            onClose();
          }}
        >
          취소
        </CancelButton>
        <ConfirmButton
          onClick={() => {
            onConfirm({ count, reason: reason.trim() });
            onClose();
          }}
        >
          예약 등록
        </ConfirmButton>
      </ButtonGroup>
    </AlertWrapper>
  );
}

export function showReservationConfirmModal(props: ReservationConfirmProps) {
  confirmAlert({
    customUI: ({ onClose }) => <ReservationConfirmContent {...props} onClose={onClose} />,
  });
}

interface ReservationChangeProps {
  label: string;
  /** 버튼을 누를 때 받아 둔 첫 조회 결과(현재 인원 기준) */
  initialOptions: ReservationChangeOptions;
  /**
   * 관리자 여부(마감 안내 문구용). react-confirm-alert 는 별도 React 루트에 그려서 recoil 을 읽을 수 없어 호출부가 넘긴다
   */
  isAdmin: boolean;
  onConfirm: (values: { people: number; roomIds: number[] }) => void;
}

const roomKey = (roomIds: number[]) => [...roomIds].sort((a, b) => a - b).join(',');

// 예약 변경(룸·인원) 모달. 후보 룸·금액은 전부 서버가 계산하고 여기서는 보여 주기만 한다
function ReservationChangeContent({
  label,
  initialOptions,
  isAdmin,
  onConfirm,
  onClose,
}: ReservationChangeProps & { onClose: () => void }) {
  const [people, setPeople] = useState(initialOptions.currentPeople);
  const [options, setOptions] = useState<ReservationChangeOptions>(initialOptions);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    roomKey(initialOptions.currentRoomIds)
  );
  // 스테퍼를 빠르게 누르면 응답 순서가 뒤바뀔 수 있어 마지막 요청 번호만 반영한다
  const requestSeq = useRef(0);
  // 마지막으로 성공한 응답. 재조회가 실패하면 화면 인원을 이 기준으로 되돌린다(안 그러면 '불러오는 중'에 멈춘다)
  const lastOptions = useRef(initialOptions);

  const changePeople = (next: number) => {
    setPeople(next);
    const seq = ++requestSeq.current;
    setLoading(true);
    api
      .get<ReservationChangeOptions>('/bgm-agit/reservation/change-options', {
        params: { reservationId: initialOptions.reservationId, people: next },
      })
      .then(({ data }) => {
        if (seq !== requestSeq.current) return;
        lastOptions.current = data;
        setOptions(data);
        // 고른 룸이 새 인원으로도 비어 있으면 유지, 아니면 현재 룸, 그것도 없으면 직접 고르게 비운다
        // (다른 룸을 몰래 골라 두면 손님이 모르는 사이 룸이 바뀐다)
        setSelectedKey(prev => {
          const keys = data.rooms.map(r => roomKey(r.roomIds));
          if (prev && keys.includes(prev)) return prev;
          const current = data.rooms.find(r => r.current);
          return current ? roomKey(current.roomIds) : null;
        });
      })
      .catch(error => {
        if (seq !== requestSeq.current) return;
        const message = (error?.response?.data as { message?: string } | undefined)?.message;
        toast.error(message ?? '변경 가능한 룸을 불러오지 못했습니다.');
        setPeople(lastOptions.current.people);
      })
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false);
      });
  };

  // 지금 화면의 인원과 응답 기준 인원이 같을 때만 금액·룸 목록을 믿는다
  const synced = !loading && options.people === people;
  const selectedRoom = synced
    ? (options.rooms.find(r => roomKey(r.roomIds) === selectedKey) ?? null)
    : null;
  const diff = people - options.currentPeople;
  const roomChanged =
    selectedRoom != null && roomKey(selectedRoom.roomIds) !== roomKey(options.currentRoomIds);
  const nothingChanged = diff === 0 && !roomChanged;
  // 마작 대탁(정액)은 인원이 금액과 무관하다 — 서버도 결제·환불 없이 기록만 고친다
  const needsPayment = options.approved && !options.flat && diff > 0;
  const canSubmit = synced && options.changeable && selectedRoom != null && !nothingChanged;

  function amountNotice() {
    if (!synced) return <>변경 내용을 계산하고 있습니다.</>;
    if (options.flat) {
      return <>마작 대탁은 인원 기록만 정정됩니다. 금액 변동은 없습니다.</>;
    }
    if (diff > 0) {
      if (!options.approved) {
        return <>아직 결제 전이라 결제할 금액이 {people}명 기준으로 바뀝니다.</>;
      }
      return (
        <>
          추가결제 <strong>{options.addAmount.toLocaleString()}원</strong>
          {options.unitPrice != null &&
            ` (1인 ${options.unitPrice.toLocaleString()}원 × ${options.addPeople}명)`}
          <br />
          추가결제가 승인되는 순간 변경되며, 결제 전에는 기존 예약이 그대로입니다.
        </>
      );
    }
    if (diff < 0) {
      if (!options.approved) {
        return <>아직 결제 전이라 환불 없이 결제할 금액만 줄어듭니다.</>;
      }
      return (
        <>
          {options.refundPeople > 0 ? (
            options.refundAmount > 0 ? (
              <>
                환불 예상 <strong>{options.refundAmount.toLocaleString()}원</strong> (규정{' '}
                {options.refundRate}%)
              </>
            ) : (
              <>이용일 24시간 이내라 줄어든 인원에 대한 환불은 없습니다.</>
            )
          ) : (
            <>환불할 금액이 없습니다.</>
          )}
        </>
      );
    }
    if (roomChanged) return <>같은 인원으로 룸만 옮깁니다. 금액 변동은 없습니다.</>;
    return <>인원이나 룸을 바꾸면 변경 금액을 안내해 드립니다.</>;
  }

  return (
    <AlertWrapper $wide>
      <ReservationHeader>
        <span>예약 변경</span>
        <strong>{label}</strong>
      </ReservationHeader>

      <FieldGroup>
        <SummaryList>
          <li>
            {options.reservationDate} {options.startTime} ~ {options.endTime}
          </li>
          <li>
            현재 {options.currentRoomNames} · {options.currentPeople}명
          </li>
        </SummaryList>
        <HelperText style={{ textAlign: 'left' }}>
          이용 24시간 전({options.deadline})까지 변경할 수 있습니다.
          {isAdmin && ' 관리자는 이용 시작 전까지 변경할 수 있습니다.'}
        </HelperText>
      </FieldGroup>

      <FieldGroup>
        <FieldTitle>
          <span>변경할 인원</span>
          <small>
            {options.peopleMin}명 - {options.peopleMax}명
          </small>
        </FieldTitle>
        <Stepper>
          <IconButton
            type="button"
            disabled={people <= options.peopleMin}
            onClick={() => changePeople(Math.max(options.peopleMin, people - 1))}
            aria-label="인원 줄이기"
          >
            <MdRemove />
          </IconButton>
          <CountValue>
            <strong>{people}</strong>
            <span>명</span>
          </CountValue>
          <IconButton
            type="button"
            disabled={people >= options.peopleMax}
            onClick={() => changePeople(Math.min(options.peopleMax, people + 1))}
            aria-label="인원 늘리기"
          >
            <MdAdd />
          </IconButton>
        </Stepper>
      </FieldGroup>

      <FieldGroup>
        <FieldTitle>
          <span>룸</span>
          <small>{people}명이 이용 가능한 빈 룸</small>
        </FieldTitle>
        {!synced ? (
          <HelperText style={{ textAlign: 'left' }}>불러오는 중…</HelperText>
        ) : options.rooms.length === 0 ? (
          <HelperText style={{ textAlign: 'left' }}>
            이 인원으로 이용 가능한 빈 룸이 없습니다.
          </HelperText>
        ) : (
          <SummaryList>
            {options.rooms.map(room => {
              const key = roomKey(room.roomIds);
              return (
                <li key={key}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="reservation-change-room"
                      checked={selectedKey === key}
                      onChange={() => setSelectedKey(key)}
                    />
                    <span>
                      {room.label}
                      {room.minPeople != null &&
                        room.maxPeople != null &&
                        ` (${room.minPeople}~${room.maxPeople}명)`}
                      {room.current && ' · 현재'}
                    </span>
                  </label>
                </li>
              );
            })}
          </SummaryList>
        )}
      </FieldGroup>

      <NoticeMessage>
        {!options.changeable && options.message ? options.message : amountNotice()}
      </NoticeMessage>
      <ButtonGroup>
        <CancelButton onClick={onClose}>닫기</CancelButton>
        <ConfirmButton
          disabled={!canSubmit}
          onClick={() => {
            if (!selectedRoom) return;
            onConfirm({ people, roomIds: selectedRoom.roomIds });
            onClose();
          }}
        >
          {needsPayment ? '추가결제하기' : '변경하기'}
        </ConfirmButton>
      </ButtonGroup>
    </AlertWrapper>
  );
}

export function showReservationChangeModal(props: ReservationChangeProps) {
  confirmAlert({
    customUI: ({ onClose }) => <ReservationChangeContent {...props} onClose={onClose} />,
  });
}

interface MonthlyPassAddProps {
  label: string;
  onConfirm: (startMonth: string, months: number) => void;
}

// 'YYYY-MM' 로컬 기준(toISOString 은 UTC 라 월초에 한 달 밀린다)
function ymOf(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// 월간패스 기간 등록 모달 — 시작월 + 개월 수. 다음 달·1년치를 미리 산 손님도 여기서 넣는다
function MonthlyPassAddContent({
  label,
  onConfirm,
  onClose,
}: MonthlyPassAddProps & { onClose: () => void }) {
  const now = new Date();
  // 이번 달부터 12개월 뒤까지 고를 수 있다(서버는 지난 달 시작을 거절한다)
  const monthOptions = Array.from({ length: 13 }, (_, i) =>
    ymOf(new Date(now.getFullYear(), now.getMonth() + i, 1))
  );
  const [startMonth, setStartMonth] = useState(monthOptions[0]);
  const [months, setMonths] = useState(1);
  const [y, m] = startMonth.split('-').map(Number);
  const endMonth = ymOf(new Date(y, m - 1 + months - 1, 1));

  return (
    <AlertWrapper $wide>
      <ReservationHeader>
        <span>월간패스 등록</span>
        <strong>{label}</strong>
      </ReservationHeader>

      <FieldGroup>
        <FieldTitle>
          <span>시작월</span>
        </FieldTitle>
        <select
          value={startMonth}
          onChange={e => setStartMonth(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', fontSize: 16, borderRadius: 8 }}
        >
          {monthOptions.map(ym => (
            <option key={ym} value={ym}>
              {ym}
            </option>
          ))}
        </select>
      </FieldGroup>

      <FieldGroup>
        <FieldTitle>
          <span>개월 수</span>
          <small>1 ~ 12개월</small>
        </FieldTitle>
        <Stepper>
          <IconButton
            type="button"
            disabled={months <= 1}
            onClick={() => setMonths(v => Math.max(1, v - 1))}
            aria-label="개월 수 줄이기"
          >
            <MdRemove />
          </IconButton>
          <CountValue>
            <strong>{months}</strong>
            <span>개월</span>
          </CountValue>
          <IconButton
            type="button"
            disabled={months >= 12}
            onClick={() => setMonths(v => Math.min(12, v + 1))}
            aria-label="개월 수 늘리기"
          >
            <MdAdd />
          </IconButton>
        </Stepper>
      </FieldGroup>

      <NoticeMessage>
        <strong>
          {startMonth} ~ {endMonth}
        </strong>{' '}
        이용분 예약에 본인 1명분 할인이 적용됩니다.
      </NoticeMessage>
      <ButtonGroup>
        <CancelButton onClick={onClose}>닫기</CancelButton>
        <ConfirmButton
          onClick={() => {
            onConfirm(startMonth, months);
            onClose();
          }}
        >
          등록
        </ConfirmButton>
      </ButtonGroup>
    </AlertWrapper>
  );
}

export function showMonthlyPassAddModal(props: MonthlyPassAddProps) {
  confirmAlert({
    customUI: ({ onClose }) => <MonthlyPassAddContent {...props} onClose={onClose} />,
  });
}

// 텍스트/비밀번호 입력 모달 (닉네임·비밀번호 변경 등)
interface InputModalProps {
  message: React.ReactNode;
  label?: string;
  initialValue?: string;
  inputType?: 'text' | 'password';
  placeholder?: string;
  minLength?: number;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

function InputModalContent({
  message,
  label,
  initialValue,
  inputType = 'text',
  placeholder,
  minLength,
  onClose,
  onConfirm,
  onCancel,
}: InputModalProps & { onClose: () => void }) {
  const [value, setValue] = useState(initialValue ?? '');

  const handleConfirm = () => {
    const v = value.trim();
    if (!v) {
      toast.error('값을 입력해 주세요.');
      return;
    }
    if (minLength && v.length < minLength) {
      toast.error(`${minLength}자 이상 입력해 주세요.`);
      return;
    }
    onConfirm(v);
    onClose();
  };

  return (
    <AlertWrapper>
      <Message>{message}</Message>
      {label && <FieldLabel>{label}</FieldLabel>}
      <ReasonInput
        type={inputType}
        placeholder={placeholder}
        value={value}
        autoFocus
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleConfirm();
        }}
      />
      <ButtonGroup>
        <CancelButton
          onClick={() => {
            onCancel?.();
            onClose();
          }}
        >
          취소
        </CancelButton>
        <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
      </ButtonGroup>
    </AlertWrapper>
  );
}

export function showInputModal(props: InputModalProps) {
  confirmAlert({
    customUI: ({ onClose }) => <InputModalContent {...props} onClose={onClose} />,
  });
}
