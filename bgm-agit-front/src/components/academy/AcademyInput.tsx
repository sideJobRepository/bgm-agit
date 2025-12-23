import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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
            ‹
          </IconBtn>
          <DateText>{dateStr}</DateText>
          <IconBtn type="button" onClick={() => moveDay(1)}>
            ›
          </IconBtn>
          <IconBtn type="button" onClick={() => setCalendarOpen(v => !v)}>
            📅
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

        <PrimaryBtn type="button" onClick={submitSave}>
          저장
        </PrimaryBtn>
      </TopBar>

      <Body>
        {/* 좌측: 반 목록(형태만) */}
        <LeftPane>
          <PaneTitle>반목록</PaneTitle>
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
          <PaneTitle>진도 추가</PaneTitle>

          <Grid2>
            <Field>
              <Label>반목록</Label>
              <ReadOnly>{classKey.toUpperCase()}</ReadOnly>
            </Field>

            <Field>
              <Label>수업일</Label>
              <ReadOnly>{dateStr}</ReadOnly>
            </Field>

            <Field>
              <Label>강사</Label>
              <Input value={form.teacher} onChange={e => setField('teacher', e.target.value)} />
            </Field>

            <Field>
              <Label>과목</Label>
              <Select value={form.subject} onChange={e => setField('subject', e.target.value)}>
                <option value="수학">수학</option>
                <option value="영어">영어</option>
                <option value="국어">국어</option>
              </Select>
            </Field>

            <Field>
              <Label>교재</Label>
              <Select
                value={selectedBook}
                onChange={e => {
                  const next = e.target.value;
                  setSelectedBook(next);
                  // book 필드도 동기화(저장시 book 강제하지만 UX상 즉시 반영)
                  setField('book', next);
                }}
              >
                <option value="">선택</option>
                {bookOptions.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </Field>

            <Field>
              <Label>단원</Label>
              <Input
                value={form.unit}
                onChange={e => setField('unit', e.target.value)}
                placeholder="예) 2단원"
              />
            </Field>

            <Field>
              <Label>페이지</Label>
              <Input
                value={form.pages}
                onChange={e => setField('pages', e.target.value)}
                placeholder="예) p.70~73"
              />
            </Field>

            <Field $span2>
              <Label>진도</Label>
              <Textarea value={form.content} onChange={e => setField('content', e.target.value)} />
            </Field>

            <Field $span2>
              <Label>테스트</Label>
              <Textarea value={form.test} onChange={e => setField('test', e.target.value)} />
            </Field>

            <Field $span2>
              <Label>과제</Label>
              <Textarea
                value={form.homework}
                onChange={e => setField('homework', e.target.value)}
              />
            </Field>
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

const DateNav = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateText = styled.div`
  font-weight: 700;
`;

const IconBtn = styled.button<WithTheme>`
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  padding: 6px 10px;
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

const PrimaryBtn = styled.button<WithTheme>`
  border: none;
  background: ${({ theme }) => theme.colors.greenColor};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  padding: 8px;
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
  min-height: 520px;
`;

const LeftPane = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
`;

const RightPane = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
`;

const PaneTitle = styled.div`
  font-weight: 800;
  margin-bottom: 10px;
`;

const ClassList = styled.div`
  display: grid;
  gap: 8px;
`;

const ClassRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #eef2f7;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;
`;

const Field = styled.div<{ $span2?: boolean }>`
  display: grid;
  gap: 6px;
  grid-column: ${({ $span2 }) => ($span2 ? '1 / span 2' : 'auto')};
`;

const Label = styled.div`
  font-weight: 700;
`;

const ReadOnly = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;
`;

const Input = styled.input<WithTheme>`
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  border-radius: 10px;
  padding: 0 10px;
`;

const Select = styled.select<WithTheme>`
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  border-radius: 10px;
  padding: 0 10px;
`;

const Textarea = styled.textarea<WithTheme>`
  min-height: 72px;
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  border-radius: 10px;
  padding: 10px;
  resize: vertical;
`;
