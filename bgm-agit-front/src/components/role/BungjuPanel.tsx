import { useEffect, useRef, useState } from 'react';
import api from '../../utils/axiosInstance.ts';
import { useRequest } from '../../recoil/useRequest.ts';
import { useUpdatePost } from '../../recoil/fetch.ts';
import { toast } from '../../utils/toast';
import { todayYmd } from '../../utils/date.ts';
import type { BungjuBenefit, BungjuSetting } from '../../types/role.ts';
import {
  ActionButton,
  TableWrapper,
  Table,
  Th,
  Td,
  NoSearchBox,
  ButtonBox,
} from '../../pages/Role.styles.ts';

type ApiMessageResponse = { message?: string };

const fieldStyle = { padding: '8px 10px', fontSize: 16, border: '1px solid #ccc', borderRadius: 8 };
const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  gap: 8,
  margin: '6px 0',
};

/** "2026-11-02" 처럼 앞 10글자만 */
const ymd = (value?: string | null) => (value ?? '').slice(0, 10);

/** 하이픈 없이 저장된 휴대폰 번호는 엑셀이 숫자로 읽어 앞자리 0 을 지운다. 하이픈을 넣어 글자로 남긴다 */
const formatPhone = (phone?: string | null) => {
  const digits = (phone ?? '').replace(/\D/g, '');
  return /^01\d{8,9}$/.test(digits)
    ? digits.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3')
    : (phone ?? '');
};

/**
 * CSV 칸 하나. 이름·닉네임은 회원이 직접 정하는 값이라 =,+,-,@ 로 시작하면 엑셀이 수식으로 실행한다(CSV 수식 삽입).
 * 글자 칸은 그런 경우 앞에 작은따옴표를 붙여 글자로 읽게 한다. 숫자 칸(인원·금액)은 그대로 둔다
 */
const escape = (v: unknown) => {
  let text = String(v ?? '');
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
};

/** 엑셀에서 바로 열리도록 UTF-8 BOM 을 붙인 CSV 로 내려받는다(엑셀 라이브러리를 들이지 않으려고) */
function downloadCsv(rows: BungjuBenefit[], from: string, to: string) {
  const header = [
    '이용일',
    '시간',
    '룸',
    '예약자',
    '닉네임',
    '연락처',
    '인원',
    '1인 혜택가',
    '결제 금액',
    '상태',
  ];
  const lines = rows.map(r =>
    [
      r.date,
      r.time,
      r.roomNames,
      r.memberName,
      r.memberNickname,
      formatPhone(r.phoneNo),
      r.people,
      r.unitPrice,
      r.paidAmount ?? '',
      r.status,
    ]
      .map(escape)
      .join(',')
  );
  const csv = '﻿' + [header.map(escape).join(','), ...lines].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `벙주혜택내역_${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 권한관리 "벙주 혜택" 탭 (관리자 전용).
 *
 * 벙주 지정·해제는 자체로그인/소셜 탭의 권한 "벙주"로 한다. 여기서는 혜택 설정(기간·1인 요금·사용 여부)과
 * 혜택가로 들어온 예약 내역을 본다. 혜택 판정은 예약을 등록할 때 이 설정으로 하고 예약에 단가를 박아 두므로,
 * 설정을 바꿔도 이미 받은 예약 금액은 그대로다.
 */
export default function BungjuPanel() {
  const { request } = useRequest();
  const { update } = useUpdatePost();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [use, setUse] = useState(true);

  const [from, setFrom] = useState(todayYmd());
  const [to, setTo] = useState(todayYmd());
  const [rows, setRows] = useState<BungjuBenefit[]>([]);
  // 조회 기간을 혜택 기간으로 맞추는 건 처음 들어올 때 한 번만(설정 저장 뒤에 관리자가 고른 기간을 덮지 않게)
  const rangeInitialized = useRef(false);

  const fetchSetting = () => {
    request(
      () => api.get<BungjuSetting>('/bgm-agit/bungju/setting').then(res => res.data),
      data => {
        setStartDate(ymd(data.startDate));
        setEndDate(ymd(data.endDate));
        setUnitPrice(data.unitPrice != null ? String(data.unitPrice) : '');
        setUse(data.use);
        // 내역 조회 기간 기본값 = 혜택 기간(첫 진입 때만)
        if (!rangeInitialized.current && data.startDate && data.endDate) {
          rangeInitialized.current = true;
          setFrom(ymd(data.startDate));
          setTo(ymd(data.endDate));
          fetchRows(ymd(data.startDate), ymd(data.endDate));
        }
      },
      { ignoreHttpError: true }
    ).catch(() => {});
  };

  const fetchRows = (f = from, t = to) => {
    request(
      () =>
        api
          .get<BungjuBenefit[]>('/bgm-agit/bungju/reservations', { params: { from: f, to: t } })
          .then(res => res.data),
      setRows,
      { ignoreHttpError: true }
    ).catch(() => {});
  };

  useEffect(() => {
    fetchSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveSetting() {
    const price = Number(unitPrice);
    if (!startDate || !endDate || !price) {
      toast.error('기간과 1인 요금을 입력해 주세요.');
      return;
    }
    update<
      { startDate: string; endDate: string; unitPrice: number; use: boolean },
      ApiMessageResponse
    >({
      url: '/bgm-agit/bungju/setting',
      body: { startDate, endDate, unitPrice: price, use },
      ignoreHttpError: true,
      onSuccess: res => {
        toast.success(res?.message ?? '저장되었습니다.');
        fetchSetting();
      },
    });
  }

  const activeRows = rows.filter(r => r.status !== '취소');
  const paidTotal = activeRows.reduce((sum, r) => sum + (r.paidAmount ?? 0), 0);

  return (
    // 안내문·입력칸은 줄바꿈되는 일반 블록에 두고, 가로 스크롤(nowrap) 상자는 내역 표에만 쓴다
    <div style={{ width: '100%', whiteSpace: 'normal', wordBreak: 'keep-all' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>혜택 설정</h3>
      <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.6 }}>
        ※ 권한이 '벙주'인 회원이 기간 안의 <strong>평일</strong> 룸을 예약하면 예약 인원 전원에게
        아래 1인 요금이 적용됩니다. 주말·공휴일·마작 대탁은 정가입니다.
        <br />※ 벙주 지정·해제는 '자체로그인'·'소셜 로그인' 탭의 권한에서 '벙주'를 고르고
        저장하세요.
        <br />※ 설정을 바꿔도 이미 받은 예약의 금액은 바뀌지 않습니다.
      </p>
      <div style={rowStyle}>
        <span>기간</span>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={fieldStyle}
        />
        <span>~</span>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          style={fieldStyle}
        />
      </div>
      <div style={rowStyle}>
        <span>1인 요금</span>
        <input
          type="number"
          inputMode="numeric"
          min={1000}
          step={500}
          value={unitPrice}
          onChange={e => setUnitPrice(e.target.value)}
          style={{ ...fieldStyle, width: 120 }}
        />
        <span>원</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
          <input type="checkbox" checked={use} onChange={e => setUse(e.target.checked)} />
          사용
        </label>
        <ActionButton type="button" onClick={saveSetting}>
          설정 저장
        </ActionButton>
      </div>

      <h3 style={{ margin: '24px 0 8px', fontSize: 17 }}>혜택 적용 내역</h3>
      <ButtonBox>
        <div style={rowStyle}>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            style={fieldStyle}
          />
          <span>~</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={fieldStyle} />
          <ActionButton type="button" onClick={() => fetchRows()}>
            조회
          </ActionButton>
          <ActionButton
            type="button"
            disabled={rows.length === 0}
            onClick={() => downloadCsv(rows, from, to)}
          >
            엑셀 내려받기
          </ActionButton>
        </div>
      </ButtonBox>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>
        취소 제외 {activeRows.length}건 · 결제 금액 합계 {paidTotal.toLocaleString()}원
      </p>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>이용일</Th>
              <Th>시간</Th>
              <Th>룸</Th>
              <Th>예약자</Th>
              <Th>연락처</Th>
              <Th>인원</Th>
              <Th>1인 혜택가</Th>
              <Th>결제 금액</Th>
              <Th>상태</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.reservationId}>
                <Td>{r.date}</Td>
                <Td>{r.time}</Td>
                <Td>{r.roomNames}</Td>
                <Td>
                  {r.memberName}
                  {r.memberNickname && r.memberNickname !== r.memberName
                    ? ` (${r.memberNickname})`
                    : ''}
                </Td>
                <Td>{r.phoneNo || '-'}</Td>
                <Td>{r.people}명</Td>
                <Td>{r.unitPrice.toLocaleString()}원</Td>
                <Td>{r.paidAmount != null ? `${r.paidAmount.toLocaleString()}원` : '미결제'}</Td>
                <Td>{r.status}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
      {rows.length === 0 && <NoSearchBox>혜택가로 들어온 예약이 없습니다.</NoSearchBox>}
    </div>
  );
}
