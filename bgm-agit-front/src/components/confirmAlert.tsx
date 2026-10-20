// 코드 분할 이후 이 CSS 를 쓰는 화면이 따로 import 하면 그 화면을 거치지 않은 경우 확인창이 오버레이 없이 깨진다
import 'react-confirm-alert/src/react-confirm-alert.css';
import { confirmAlert } from 'react-confirm-alert';
import { useState } from 'react';
import { MdAdd, MdRemove } from 'react-icons/md';
import { toast } from '../utils/toast';
import { AlertWrapper, Message, FieldLabel, ButtonGroup, ReservationHeader, FieldGroup, FieldTitle, Stepper, IconButton, CountValue, SummaryList, ReasonTextarea, HelperText, NoticeMessage, CancelButton, ConfirmButton, ReasonInput } from './confirmAlert.styles.ts';

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

interface PeopleReduceProps {
  label: string;
  currentPeople: number;
  minPeople: number;
  /** 결제 당시 1인 단가. 미결제면 null — 환불 없이 결제할 금액만 줄어든다 */
  unitPrice?: number | null;
  /** 지금 줄이면 적용될 환불 비율(%) */
  refundRate?: number | null;
  /** 아직 남아 있는 결제 금액. 예상 환불액은 이 값을 넘지 않는다 */
  paidAmount?: number | null;
  onConfirm: (people: number) => void;
}

// 예약 인원 줄이기 모달. 늘리기는 현장 워크인 결제라 받지 않는다
function PeopleReduceContent({
  label,
  currentPeople,
  minPeople,
  unitPrice,
  refundRate,
  paidAmount,
  onConfirm,
  onClose,
}: PeopleReduceProps & { onClose: () => void }) {
  const maxNext = currentPeople - 1;
  const [count, setCount] = useState(Math.max(minPeople, maxNext));
  const reduced = currentPeople - count;
  const paid = (paidAmount ?? 0) > 0 && unitPrice != null;
  const rate = refundRate ?? 0;
  // 서버(PaymentServiceImpl.refundPeopleReduction → doRefund)와 같은 순서:
  // 줄인 인원 × 결제 당시 단가를 결제 잔액으로 자른 뒤 비율을 적용하고 원 단위 내림
  const base = paid ? Math.min(reduced * (unitPrice as number), paidAmount ?? 0) : 0;
  const expected = Math.floor((base * rate) / 100);

  return (
    <AlertWrapper $wide>
      <ReservationHeader>
        <span>예약 인원 변경</span>
        <strong>{label}</strong>
      </ReservationHeader>

      <FieldGroup>
        <FieldTitle>
          <span>변경할 인원</span>
          <small>
            현재 {currentPeople}명 · 최소 {minPeople}명
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
            disabled={count >= maxNext}
            onClick={() => setCount(c => Math.min(maxNext, c + 1))}
            aria-label="인원 늘리기"
          >
            <MdAdd />
          </IconButton>
        </Stepper>
      </FieldGroup>

      <NoticeMessage>
        {paid ? (
          rate > 0 ? (
            <>
              {reduced}명 × {(unitPrice as number).toLocaleString()}원의 {rate}% ={' '}
              <strong>{expected.toLocaleString()}원</strong> 환불 예정
            </>
          ) : (
            <>이용일 24시간 이내라 줄어든 인원에 대한 환불은 없습니다.</>
          )
        ) : (
          <>아직 결제 전이라 환불 없이 결제할 금액만 줄어듭니다.</>
        )}
        <br />
        인원을 늘리시려면 현장에서 워크인 요금으로 결제해 주세요.
      </NoticeMessage>
      <ButtonGroup>
        <CancelButton onClick={onClose}>닫기</CancelButton>
        <ConfirmButton
          onClick={() => {
            onConfirm(count);
            onClose();
          }}
        >
          {count}명으로 변경
        </ConfirmButton>
      </ButtonGroup>
    </AlertWrapper>
  );
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

export function showPeopleReduceModal(props: PeopleReduceProps) {
  confirmAlert({
    customUI: ({ onClose }) => <PeopleReduceContent {...props} onClose={onClose} />,
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
