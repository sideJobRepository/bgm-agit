import React, { useMemo } from 'react';
import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props';
import type { ClassKey } from '../../pages/Academy';

type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
const STICKY_LEFT_1 = 120;
type CurriculumRow = {
  id: string;
  bookName: string; // 구분
  months: Record<Month, string>; // 해당 월 교재(진도 입력의 book 값)
};

type ProgressRow = {
  id: string;
  classKey: ClassKey;
  date: string; // YYYY-MM-DD
  book: string; // 교재(=months[month])
  unit: string;
  pages: string;
};

type CurriculumState = {
  byClass: Record<ClassKey, CurriculumRow[]>;
  titleByClass: Record<ClassKey, string>;
};

type ProgressInputState = {
  rows: ProgressRow[];
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function ymd(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export default function AcademyView({
  classKey,
  onChangeClassKey,
  curriculumState,
  progressInputState,
  year,
  month,
}: {
  classKey: ClassKey;
  onChangeClassKey: (v: ClassKey) => void;
  curriculumState: CurriculumState;
  progressInputState: ProgressInputState;
  year: number;
  month: Month; // 12 고정 가능
}) {
  const dayCount = useMemo(() => daysInMonth(year, month), [year, month]);

  const dates = useMemo(() => {
    return Array.from({ length: dayCount }, (_, i) => {
      const d = i + 1;
      return {
        key: ymd(year, month, d),
        label: `${month}/${pad2(d)}`,
      };
    });
  }, [year, month, dayCount]);

  const leftRows = useMemo(() => {
    const rows = curriculumState.byClass[classKey] ?? [];
    const seen = new Set<string>();

    const mapped = rows
      .map(r => ({
        type: 'group' as const,
        groupLabel: (r.bookName ?? '').trim(),
        monthBook: (r.months?.[month] ?? '').trim(),
      }))
      .filter(x => x.groupLabel.length > 0);

    const unique = mapped.filter(x => {
      if (seen.has(x.groupLabel)) return false;
      seen.add(x.groupLabel);
      return true;
    });

    return [...unique];
  }, [curriculumState.byClass, classKey, month]);

  /**
   * key = date__book
   * value = [{ unit, pages }, ...]
   */
  const progressIndex = useMemo(() => {
    const map = new Map<string, Array<{ unit: string; pages: string }>>();
    const rows = progressInputState.rows ?? [];

    for (const r of rows) {
      if (r.classKey !== classKey) continue;
      if (!r.date.startsWith(`${year}-${pad2(month)}-`)) continue;

      const book = (r.book ?? '').trim();
      if (!book) continue;

      const key = `${r.date}__${book}`;

      const unit = (r.unit ?? '').trim();
      const pages = (r.pages ?? '').trim();
      if (!unit && !pages) continue;

      const prev = map.get(key) ?? [];
      prev.push({ unit, pages });
      map.set(key, prev);
    }

    return map;
  }, [progressInputState.rows, classKey, year, month]);

  return (
    <Wrap>
      <Header>
        <HLeft>
          <HTitle>
            {year}년 {month}월 {classKey.toUpperCase()} 진도표
          </HTitle>

          <Select value={classKey} onChange={e => onChangeClassKey(e.target.value as ClassKey)}>
            <option value="3g">3G</option>
            <option value="3k">3K</option>
            <option value="4g1">4G1</option>
          </Select>
        </HLeft>

        <Hint>셀: 상단=교재, 하단=단원/페이지</Hint>
      </Header>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th $stickyLeft $w={120}>
                반
              </Th>
              <Th $stickyLeft2 $w={240}>
                진도구분
              </Th>

              {dates.map(d => (
                <Th key={d.key} $w={140}>
                  {d.label}
                </Th>
              ))}
            </tr>
          </thead>

          <tbody>
            {leftRows.map((r, idx) => (
              <tr key={`${r.type}-${r.groupLabel}-${idx}`}>
                <Td $stickyLeft>{classKey.toUpperCase()}</Td>

                <Td $stickyLeft2 $bold={r.type !== 'note'}>
                  {r.groupLabel}
                </Td>

                {dates.map(d => {
                  if (r.type === 'note') return <Td key={d.key} />;

                  const monthBook = r.monthBook;
                  if (!monthBook) return <Td key={d.key} />;

                  const key = `${d.key}__${monthBook}`;
                  const items = progressIndex.get(key) ?? [];

                  if (items.length === 0) return <Td key={d.key} />;

                  return (
                    <Td key={d.key}>
                      <CellBox>
                        <BookBadge>{monthBook}</BookBadge>

                        <CellBody>
                          {items.map((it, i) => (
                            <Line key={i}>
                              {it.unit && <span>{it.unit}</span>}
                              {it.unit && it.pages && <Dot>·</Dot>}
                              {it.pages && <span>{it.pages}</span>}
                            </Line>
                          ))}
                        </CellBody>
                      </CellBox>
                    </Td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Wrap>
  );
}

/* styles */

const Wrap = styled.div`
  margin-top: 16px;
  display: grid;
  gap: 10px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
`;

const HLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HTitle = styled.h2<WithTheme>`
  margin: 0;
  font-size: ${({ theme }) => theme.sizes.large};
`;

const Hint = styled.div`
  font-size: 12px;
  opacity: 0.7;
`;

const Select = styled.select<WithTheme>`
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  border-radius: 8px;
  padding: 0 10px;
`;

const TableWrap = styled.div`
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  position: relative;
`;

const Table = styled.table`
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th<{ $stickyLeft?: boolean; $w?: number; $stickyLeft2?: boolean }>`
  position: ${({ $stickyLeft, $stickyLeft2 }) =>
    $stickyLeft || $stickyLeft2 ? 'sticky' : 'static'};
  left: ${({ $stickyLeft, $stickyLeft2 }) =>
    $stickyLeft ? 0 : $stickyLeft2 ? `${STICKY_LEFT_1}px` : 'auto'};
  z-index: ${({ $stickyLeft, $stickyLeft2 }) => ($stickyLeft ? 3 : $stickyLeft2 ? 2 : 1)};
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 10px 8px;
  text-align: center;
  font-weight: 700;
  width: ${({ $w }) => ($w ? `${$w}px` : 'auto')};
  white-space: nowrap;
`;

const Td = styled.td<{ $stickyLeft?: boolean; $stickyLeft2?: boolean; $bold?: boolean }>`
  position: ${({ $stickyLeft, $stickyLeft2 }) =>
    $stickyLeft || $stickyLeft2 ? 'sticky' : 'static'};
  left: ${({ $stickyLeft, $stickyLeft2 }) =>
    $stickyLeft ? 0 : $stickyLeft2 ? `${STICKY_LEFT_1}px` : 'auto'};
  z-index: ${({ $stickyLeft, $stickyLeft2 }) => ($stickyLeft ? 2 : $stickyLeft2 ? 1 : 0)};
  background: white;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
  padding: 8px;
  min-height: 44px;

  font-weight: ${({ $bold }) => ($bold ? 700 : 400)};
`;

const CellBox = styled.div`
  display: grid;
  gap: 6px;
`;

const BookBadge = styled.div<WithTheme>`
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: 4px 8px;
  border: none;
  font-size: 14px;
  color: white;
  background: ${({ theme }) => theme.colors.purpleColor};
`;

const CellBody = styled.div`
  display: grid;
  gap: 4px;
`;

const Line = styled.div`
  font-size: 12px;
  line-height: 1.25;
  white-space: pre-wrap;
`;

const Dot = styled.span`
  margin: 0 6px;
  opacity: 0.7;
`;
