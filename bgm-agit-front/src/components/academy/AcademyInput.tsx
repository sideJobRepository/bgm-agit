import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { IoChevronBackSharp, IoChevronForwardSharp } from 'react-icons/io5';
import type { WithTheme } from '../../styles/styled-props';
import type { ClassKey } from '../../pages/Academy';
import { showConfirmModal } from '../confirmAlert.tsx';

type ProgressItem = {
  id: string;
  classKey: ClassKey;
  date: string; // YYYY-MM-DD

  teacher: string;
  book: string;

  unit: string; // 단원
  pages: string; // 페이지

  subject: string;
  content: string;
  test: string;
  homework: string;
};

type ProgressInputState = {
  rows: ProgressItem[];
};

type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type CurriculumRow = {
  id: string;
  bookName: string;
  months: Record<Month, string>;
  merges: any;
};

type CurriculumState = {
  byClass: Record<ClassKey, CurriculumRow[]>;
  titleByClass: Record<ClassKey, string>;
};

function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function AcademyInput({
  classKey,
  onChangeClassKey,
  value,
  onChange,
  onSave,
  curriculumState,
}: {
  classKey: ClassKey;
  onChangeClassKey: (v: ClassKey) => void;
  value: ProgressInputState;
  onChange: React.Dispatch<React.SetStateAction<ProgressInputState>>;
  onSave: () => void;
  curriculumState: CurriculumState;
}) {
  const today = useMemo(() => new Date(), []);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const dateStr = fmtDate(selectedDate);

  const month = (selectedDate.getMonth() + 1) as Month;

  // 커리큘럼에서 교재 옵션 뽑기(반+월 기준)
  const bookOptions = useMemo(() => {
    const rows = curriculumState.byClass[classKey] ?? [];
    const vals = rows.map(r => (r.months?.[month] ?? '').trim()).filter(Boolean);
    return Array.from(new Set(vals));
  }, [curriculumState.byClass, classKey, month]);

  /**
   * 이제 폼은 (반+날짜)만이 아니라 (반+날짜+교재) 기준으로 로드해야 하므로
   * 교재 선택값을 "명시적으로" 상태로 둔다.
   */
  const [selectedBook, setSelectedBook] = useState<string>('');

  // bookOptions가 바뀌거나, 반/날짜가 바뀌면 selectedBook 기본값 보정
  useEffect(() => {
    // 현재 선택된 교재가 옵션에 없으면 첫 옵션으로
    if (selectedBook && bookOptions.includes(selectedBook)) return;
    setSelectedBook(bookOptions[0] ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classKey, dateStr, bookOptions.join('|')]);

  // 현재 (반+날짜+교재) 저장된 데이터 찾기
  const currentSaved = useMemo(() => {
    const book = (selectedBook ?? '').trim();
    if (!book) return null;
    return (
      (value.rows ?? []).find(
        r => r.classKey === classKey && r.date === dateStr && r.book === book
      ) ?? null
    );
  }, [value.rows, classKey, dateStr, selectedBook]);

  // form (한 날짜 + 한 교재 = 1건)
  const [form, setForm] = useState<Omit<ProgressItem, 'id' | 'classKey' | 'date'>>({
    teacher: '',
    book: '',
    unit: '',
    pages: '',
    subject: '수학',
    content: '',
    test: '',
    homework: '',
  });

  const setField = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  // 반/날짜/교재 변경 시 자동 로드
  useEffect(() => {
    if (!selectedBook) {
      // 교재가 없으면 전체 초기화
      setForm({
        teacher: '',
        book: '',
        unit: '',
        pages: '',
        subject: '수학',
        content: '',
        test: '',
        homework: '',
      });
      return;
    }

    if (currentSaved) {
      const { id, classKey: ck, date, ...rest } = currentSaved;
      setForm(rest);
    } else {
      // 새 교재(또는 저장 안 된 조합)면 초기화하되 book은 고정
      setForm({
        teacher: '',
        book: selectedBook,
        unit: '',
        pages: '',
        subject: '수학',
        content: '',
        test: '',
        homework: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classKey, dateStr, selectedBook]);

  const moveDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    setSelectedDate(next);
  };

  // 저장 = upsert (반+날짜+교재 1건)
  const upsert = () => {
    const book = (selectedBook ?? '').trim();
    if (!book) return;

    const nextItem: ProgressItem = {
      id: currentSaved?.id ?? crypto.randomUUID(),
      classKey,
      date: dateStr,
      ...form,
      book, // 선택된 교재로 강제(폼/상태 불일치 방지)
    };

    onChange(prev => {
      const rows = prev.rows ?? [];
      const idx = rows.findIndex(
        r => r.classKey === classKey && r.date === dateStr && r.book === book
      );

      if (idx >= 0) {
        const copy = rows.slice();
        copy[idx] = nextItem;
        return { ...prev, rows: copy };
      }
      return { ...prev, rows: [nextItem, ...rows] };
    });
  };

  const submitSave = () => {
    showConfirmModal({
      message: '진도표를 저장하시겠습니까?',
      onConfirm: () => {
        upsert();
        onSave();
      },
    });
  };

  return (
    <Wrap>
      <TopBar>
        <DateNav>
          <IconBtn type="button" onClick={() => moveDay(-1)}>
            ◀
          </IconBtn>
          <DateText onClick={() => setCalendarOpen(v => !v)}>{dateStr}</DateText>
          <IconBtn type="button" onClick={() => moveDay(1)}>
            ▶
          </IconBtn>

          {calendarOpen && (
            <CalendarPopover>
              <Calendar
                value={selectedDate}
                onChange={(v: any) => {
                  const d = Array.isArray(v) ? v[0] : v;
                  setSelectedDate(d);
                  setCalendarOpen(false);
                }}
              />
            </CalendarPopover>
          )}
        </DateNav>

        <PrimaryBtn  color="#222" onClick={submitSave}>
          저장
        </PrimaryBtn>
      </TopBar>

      <Body>
        <LeftPane>
          <ClassList>
            {(['3g', '3k', '4g1'] as ClassKey[]).map(k => (
              <ClassRow key={k}>
                <input
                  type="radio"
                  name="classKey"
                  checked={classKey === k}
                  onChange={() => onChangeClassKey(k)}
                />
                <span>{k.toUpperCase()}</span>
              </ClassRow>
            ))}
          </ClassList>
        </LeftPane>

        {/* 우측: 입력 폼 */}
        <RightPane>
          <Grid2>
            <FieldBox>
              <Field>
                <Label>반목록</Label>
                <ReadOnly>{classKey.toUpperCase()}</ReadOnly>
              </Field>
              <Field>
                <Label>수업일</Label>
                <ReadOnly>{dateStr}</ReadOnly>
              </Field>
            </FieldBox>

            <FieldBox>
              <Field>
                <Label>강사</Label>
                <Input value={form.teacher} onChange={e => setField('teacher', e.target.value)} />
              </Field>
              <Field>
                <Label>과목</Label>
                <Input value={form.teacher} onChange={e => setField('teacher', e.target.value)} />
              </Field>
              <Field>
                <Label>진도구분</Label>
                <Select value={form.teacher} onChange={e => setField('teacher', e.target.value)} />
              </Field>
            </FieldBox>

            <FieldBox>
              <Field>
                <Label>교재명</Label>
                <Input value={form.teacher} onChange={e => setField('teacher', e.target.value)} />
              </Field>
              <Field>
                <Label>단원</Label>
                <Input value={form.teacher} onChange={e => setField('teacher', e.target.value)} />
              </Field>
              <Field>
                <Label>페이지</Label>
                <Input value={form.teacher} onChange={e => setField('teacher', e.target.value)} />
              </Field>
            </FieldBox>

            <AddbtnBox>
              <AddBtn  color="#2E2E2E" onClick={submitSave}>
                + 새로운 행 추가
              </AddBtn>
            </AddbtnBox>

            <FieldBox>
              <Field>
                <Label>진도</Label>
                <Textarea value={form.content} onChange={e => setField('content', e.target.value)} />
              </Field>
            </FieldBox>

            <FieldBox>
              <Field>
                <Label>테스트</Label>
                <Textarea value={form.test} onChange={e => setField('test', e.target.value)} />
              </Field>
            </FieldBox>

            <FieldBox>
              <Field>
                <Label>과제</Label>
                <Textarea
                    value={form.homework}
                    onChange={e => setField('homework', e.target.value)}
                />
              </Field>
            </FieldBox>

       
          </Grid2>
        </RightPane>
      </Body>
    </Wrap>
  );
}

/* styles */

const Wrap = styled.div`
  margin-top: 16px;
  display: grid;
  gap: 12px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DateNav = styled.div<WithTheme>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
`;

const DateText = styled.div`
  font-weight: 700;
  cursor: pointer;
`;

const IconBtn = styled.button<WithTheme>`
  border: none;
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.xxsmall};
`;

const CalendarPopover = styled.div`
  position: absolute;
  top: 44px;
  left: 0;
  z-index: 50;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
`;

const PrimaryBtn = styled.button<WithTheme & { color: string }>`
  padding: 4px 8px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const AddbtnBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const AddBtn = styled.button<WithTheme & { color: string }>`
  padding: 6px 12px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  border: none;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    opacity: 0.8;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
`;

const LeftPane = styled.div<WithTheme>`
  border: 1px solid  ${({ theme }) => theme.colors.lineColor};
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.softColor};
  font-size: ${({ theme }) => theme.sizes.small};
`;

const RightPane = styled.div<WithTheme>`
  border: 1px solid  ${({ theme }) => theme.colors.lineColor};
  padding: 12px 24px;
  font-size: ${({ theme }) => theme.sizes.small};
`;


const ClassList = styled.div`
  display: grid;
  gap: 8px;
`;

const ClassRow = styled.label<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  background-color: white;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  border: 1px solid  ${({ theme }) => theme.colors.lineColor};
`;

const Grid2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  //display: grid;
  //grid-template-columns: 1fr 1fr;
  //gap: 10px 12px;
`;

const FieldBox = styled.div`
    display: flex;
    gap: 16px;
`

const Field = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
`;

const Label = styled.div<WithTheme>`
  font-weight: 600;
  width: 60px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.menuColor};
`;

const ReadOnly = styled.div<WithTheme>`
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.subColor};
  border: 1px solid  ${({theme}) => theme.colors.lineColor};
  background: ${({theme}) => theme.colors.border};
  flex: 1;
`;

const Input = styled.input<WithTheme>`

  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.subColor};
  border: 1px solid  ${({theme}) => theme.colors.lineColor};
  flex: 1;
`;

const Select = styled.select<WithTheme>`
  height: 32px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.subColor};
  border: 1px solid  ${({theme}) => theme.colors.lineColor};
  flex: 1;
  border-radius: 4px;
  padding: 0 10px;
`;

const Textarea = styled.textarea<WithTheme>`
  min-height: 32px;
  border: 1px solid  ${({theme}) => theme.colors.lineColor};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.subColor};
  border-radius: 4px;
  padding: 10px;
  resize: vertical;
  flex: 1;
`;
