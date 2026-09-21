import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/state/userState.ts';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { todayYmd } from '../utils/date.ts';

type HolidayType = 'ADD' | 'EXCLUDE';

type Holiday = {
  /** 수동 지정이면 id, 법정공휴일 자동 계산이면 null */
  holidayId: number | null;
  date: string;
  name: string;
  type: HolidayType | null;
  holiday: boolean;
};

/** 오늘부터 N개월 뒤 (조회 기본 범위) */
function monthsLater(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatWithWeekday(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${ymd} (${WEEKDAYS[date.getDay()]})`;
}

/**
 * 공휴일 설정 화면 (관리자 전용).
 *
 * 법정공휴일은 서버가 계산하므로 여기서 등록할 필요가 없다. 계산으로 알 수 없는
 * 선거일·임시공휴일만 추가하고, 반대로 "공휴일이지만 정상 영업"하는 날은 제외로 등록한다.
 * 공휴일이면 그날 예약은 주말 단가(11,000원)를 받는다.
 */
export default function HolidayManage() {
  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles.includes('ROLE_ADMIN');

  const [from, setFrom] = useState(todayYmd());
  const [to, setTo] = useState(monthsLater(6));
  const [items, setItems] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);

  // 등록 폼
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<HolidayType>('ADD');

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Holiday[]>('/bgm-agit/holidays', { params: { from, to } });
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error('공휴일 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  async function save() {
    if (!date) {
      toast.error('날짜를 선택해 주세요.');
      return;
    }
    try {
      const { data } = await api.post<{ message?: string }>('/bgm-agit/holidays', {
        date,
        name: name.trim() || null,
        type,
      });
      toast.success(data?.message ?? '저장되었습니다.');
      setDate('');
      setName('');
      fetchHolidays();
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? '저장하지 못했습니다.');
    }
  }

  function remove(item: Holiday) {
    if (item.holidayId == null) {
      return;
    }
    showConfirmModal({
      message: (
        <>
          {formatWithWeekday(item.date)} 설정을 삭제할까요?
          <br />
          삭제하면 이 날짜는 다시 법정공휴일 기준으로 돌아갑니다.
        </>
      ),
      onConfirm: async () => {
        try {
          const { data } = await api.delete<{ message?: string }>(
            `/bgm-agit/holidays/${item.holidayId}`
          );
          toast.success(data?.message ?? '삭제되었습니다.');
          fetchHolidays();
        } catch (e) {
          const message = (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message;
          toast.error(message ?? '삭제하지 못했습니다.');
        }
      },
    });
  }

  if (!isAdmin) {
    return (
      <Wrapper>
        <Empty>관리자만 사용할 수 있는 화면입니다.</Empty>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header>
        <h2>공휴일 설정</h2>
        <p>공휴일로 지정된 날은 예약 요금이 주말 단가(1인 11,000원)로 계산됩니다.</p>
      </Header>

      <NoticeBox>
        ※ 설날·추석·대체공휴일 같은 <strong>법정공휴일은 자동으로 잡히므로 등록할 필요가 없습니다.</strong>
        <br />※ 선거일·임시공휴일처럼 자동으로 알 수 없는 날만 <strong>공휴일 추가</strong>로 등록해
        주세요.
        <br />※ 반대로 공휴일이지만 정상 영업해서 평일 요금을 받으실 날은 <strong>정상 영업(제외)</strong>
        으로 등록하시면 됩니다.
      </NoticeBox>

      <FormBox>
        <Field>
          <label htmlFor="holiday-date">날짜</label>
          <input
            id="holiday-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </Field>
        <Field>
          <label htmlFor="holiday-name">이름</label>
          <input
            id="holiday-name"
            type="text"
            placeholder="예: 제22대 대선 (비워도 됩니다)"
            maxLength={100}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </Field>
        <Field>
          <label htmlFor="holiday-type">구분</label>
          <select
            id="holiday-type"
            value={type}
            onChange={e => setType(e.target.value as HolidayType)}
          >
            <option value="ADD">공휴일 추가 (주말 요금)</option>
            <option value="EXCLUDE">정상 영업 (평일 요금)</option>
          </select>
        </Field>
        <SaveButton type="button" onClick={save}>
          저장
        </SaveButton>
      </FormBox>

      <RangeBox>
        <label>
          조회 기간
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <span>~</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} />
      </RangeBox>

      {loading ? (
        <Empty>불러오는 중입니다.</Empty>
      ) : items.length === 0 ? (
        <Empty>해당 기간에 공휴일이 없습니다.</Empty>
      ) : (
        <List>
          {items.map(item => (
            <Row key={item.date} $excluded={!item.holiday}>
              <RowDate>{formatWithWeekday(item.date)}</RowDate>
              <RowName>{item.name}</RowName>
              <Badge $tone={item.holidayId == null ? 'auto' : item.holiday ? 'add' : 'exclude'}>
                {item.holidayId == null ? '법정(자동)' : item.holiday ? '공휴일 추가' : '정상 영업'}
              </Badge>
              <RowPrice>{item.holiday ? '주말 요금' : '평일 요금'}</RowPrice>
              {item.holidayId == null ? (
                <RowHint>자동 계산이라 삭제할 수 없습니다. 영업하시려면 정상 영업으로 등록하세요.</RowHint>
              ) : (
                <DeleteButton type="button" onClick={() => remove(item)}>
                  삭제
                </DeleteButton>
              )}
            </Row>
          ))}
        </List>
      )}
    </Wrapper>
  );
}

const Header = styled.div<WithTheme>`
  margin-bottom: 16px;

  h2 {
    font-size: ${({ theme }) => theme.sizes.large};
    font-weight: ${({ theme }) => theme.weight.bold};
    color: ${({ theme }) => theme.colors.menuColor};
  }

  p {
    margin-top: 6px;
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.subColor};
  }
`;

const NoticeBox = styled.div<WithTheme>`
  padding: 12px 14px;
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.softColor};
  font-size: ${({ theme }) => theme.sizes.small};
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.subColor};
`;

const FormBox = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
`;

const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.subColor};
  }

  input,
  select {
    height: 40px;
    padding: 0 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    /* iOS Safari 는 16px 미만이면 포커스 시 화면을 확대한다 */
    font-size: 16px;
  }

  input[type='text'] {
    min-width: 240px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;

    input[type='text'] {
      min-width: 0;
      width: 100%;
    }
  }
`;

const SaveButton = styled.button<WithTheme>`
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.menuColor};
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const RangeBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};

  input {
    height: 36px;
    padding: 0 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.div<WithTheme & { $excluded: boolean }>`
  display: grid;
  grid-template-columns: 150px 1fr 110px 90px auto;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background-color: ${({ $excluded }) => ($excluded ? '#fafafa' : '#fff')};
  font-size: ${({ theme }) => theme.sizes.small};

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr auto;
    row-gap: 6px;
  }
`;

const RowDate = styled.span<WithTheme>`
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.menuColor};
`;

const RowName = styled.span<WithTheme>`
  color: ${({ theme }) => theme.colors.subColor};
`;

const Badge = styled.span<WithTheme & { $tone: 'auto' | 'add' | 'exclude' }>`
  justify-self: start;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ $tone }) =>
    $tone === 'auto' ? '#6B6B6B' : $tone === 'add' ? '#1A7D55' : '#E08700'};
`;

const RowPrice = styled.span<WithTheme>`
  color: ${({ theme }) => theme.colors.subColor};
`;

const RowHint = styled.span<WithTheme>`
  font-size: 12px;
  color: #999;

  @media ${({ theme }) => theme.device.mobile} {
    grid-column: 1 / -1;
  }
`;

const DeleteButton = styled.button<WithTheme>`
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 6px;
  background-color: #ff5e57;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
`;

const Empty = styled.div<WithTheme>`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.small};
`;
