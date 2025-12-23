import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import type { ClassKey } from '../../pages/Academy';
import { showConfirmModal } from '../confirmAlert.tsx';
import { toast } from 'react-toastify';

/* =======================
   Types
======================= */

type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type MonthMerge = {
  start: Month;
  end: Month;
  value: string;
};

type CurriculumRow = {
  id: string;
  bookName: string;
  months: Record<Month, string>;
  merges: MonthMerge[];
};

type CurriculumState = {
  byClass: Record<ClassKey, CurriculumRow[]>;
  titleByClass: Record<ClassKey, string>;
};

/* =======================
   Constants / Utils
======================= */

const MONTHS: Month[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function createEmptyRow(): CurriculumRow {
  const months = MONTHS.reduce(
    (acc, m) => {
      acc[m] = '';
      return acc;
    },
    {} as Record<Month, string>
  );

  return {
    id: crypto.randomUUID(),
    bookName: '',
    months,
    merges: [],
  };
}

/* =======================
   Component
======================= */

export default function Curriculum({
  classKey,
  onChangeClassKey,
  value,
  onChange,
  onSave,
}: {
  classKey: ClassKey;
  onChangeClassKey: (v: ClassKey) => void;
  value: CurriculumState;
  onChange: React.Dispatch<React.SetStateAction<CurriculumState>>;
  onSave: () => void;
}) {
  const rows = value.byClass[classKey] ?? [];

  /* 드래그 상태 */
  const [drag, setDrag] = useState<null | {
    rowId: string;
    start: Month;
    end: Month;
    moved: boolean;
  }>(null);

  const title = value.titleByClass[classKey] ?? '';

  const updateTitle = (v: string) => {
    onChange(prev => ({
      ...prev,
      titleByClass: {
        ...prev.titleByClass,
        [classKey]: v,
      },
    }));
  };

  /* 최초 1행 보장 */
  useEffect(() => {
    if (rows.length === 0) {
      setRows([createEmptyRow()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classKey]);

  /* =======================
     State helpers
  ======================= */

  const setRows = (nextRows: CurriculumRow[]) => {
    onChange(prev => ({
      ...prev,
      byClass: {
        ...prev.byClass,
        [classKey]: nextRows,
      },
    }));
  };

  const addRow = () => setRows([...rows, createEmptyRow()]);
  const removeRow = (id: string) => setRows(rows.filter(r => r.id !== id));

  const updateBookName = (id: string, v: string) => {
    setRows(rows.map(r => (r.id === id ? { ...r, bookName: v } : r)));
  };

  const updateMonthValue = (id: string, month: Month, v: string) => {
    setRows(rows.map(r => (r.id === id ? { ...r, months: { ...r.months, [month]: v } } : r)));
  };

  /* =======================
     Merge helpers
  ======================= */

  const addMerge = (rowId: string, start: Month, end: Month) => {
    const s = Math.min(start, end) as Month;
    const e = Math.max(start, end) as Month;

    setRows(
      rows.map(r => {
        if (r.id !== rowId) return r;

        const overlap = r.merges.some(m => !(e < m.start || s > m.end));
        if (overlap) {
          toast.error('이미 병합된 구간과 겹칩니다.');
          return r;
        }

        const nextMonths = { ...r.months };
        for (let m = s; m <= e; m++) nextMonths[m as Month] = '';

        return {
          ...r,
          months: nextMonths,
          merges: [...r.merges, { start: s, end: e, value: '' }],
        };
      })
    );
  };

  const removeMerge = (rowId: string, start: Month) => {
    setRows(
      rows.map(r =>
        r.id === rowId ? { ...r, merges: r.merges.filter(m => m.start !== start) } : r
      )
    );
  };

  const updateMergeValue = (rowId: string, start: Month, value: string) => {
    setRows(
      rows.map(r =>
        r.id === rowId
          ? {
              ...r,
              merges: r.merges.map(m => (m.start === start ? { ...m, value } : m)),
            }
          : r
      )
    );
  };

  const getMergeStart = (row: CurriculumRow, m: Month) => row.merges.find(x => x.start === m);

  const isCoveredByMerge = (row: CurriculumRow, m: Month) =>
    row.merges.some(x => m > x.start && m <= x.end);

  /* =======================
     Submit
  ======================= */

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showConfirmModal({
      message: '커리큘럼을 저장하시겠습니까?',
      onConfirm: onSave,
    });
  };

  /* =======================
     Render
  ======================= */

  return (
    <Form onSubmit={onSubmit}>
      <HeaderRow>
        <LeftHeader>
          <Title>커리큘럼 12월 예시</Title>
          <Select value={classKey} onChange={e => onChangeClassKey(e.target.value as ClassKey)}>
            <option value="3g">3G</option>
            <option value="3k">3K</option>
            <option value="4g1">4G1</option>
          </Select>
          <TitleInput
            value={title}
            onChange={e => updateTitle(e.target.value)}
            placeholder="커리큘럼 타이틀 입력"
          />
        </LeftHeader>

        <Actions>
          <Button type="button" onClick={addRow}>
            + 행 추가
          </Button>
          <Button type="submit" $variant="primary">
            저장
          </Button>
        </Actions>
      </HeaderRow>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th $stickyLeft $w={220}>
                진도구분
              </Th>
              {MONTHS.map(m => (
                <Th key={m} $w={90}>
                  {m}월
                </Th>
              ))}
              <Th $w={50}></Th>
            </tr>
          </thead>

          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <Td $stickyLeft>
                  <TextInput
                    value={row.bookName}
                    onChange={e => updateBookName(row.id, e.target.value)}
                  />
                </Td>

                {MONTHS.map(m => {
                  if (isCoveredByMerge(row, m)) return null;

                  const merge = getMergeStart(row, m);
                  const isSelected =
                    drag?.rowId === row.id &&
                    m >= Math.min(drag.start, drag.end) &&
                    m <= Math.max(drag.start, drag.end);

                  if (merge) {
                    const span = merge.end - merge.start + 1;
                    return (
                      <Td
                        key={m}
                        colSpan={span}
                        $selected={isSelected}
                        onContextMenu={e => {
                          e.preventDefault();

                          showConfirmModal({
                            message: `${merge.start}~${merge.end}월 병합을 해제하시겠습니까?`,
                            onConfirm: () => removeMerge(row.id, merge.start),
                          });
                        }}
                      >
                        <CellInput
                          value={merge.value}
                          onChange={e => updateMergeValue(row.id, merge.start, e.target.value)}
                        />
                      </Td>
                    );
                  }

                  return (
                    <Td
                      key={m}
                      $selected={isSelected}
                      onMouseDown={() =>
                        setDrag({
                          rowId: row.id,
                          start: m,
                          end: m,
                          moved: false,
                        })
                      }
                      onMouseEnter={() => {
                        if (!drag || drag.rowId !== row.id) return;

                        setDrag(prev =>
                          prev
                            ? {
                                ...prev,
                                end: m,
                                moved: true, // 실제 이동 발생
                              }
                            : prev
                        );
                      }}
                      onMouseUp={() => {
                        if (!drag || drag.rowId !== row.id) return;

                        const { start, end, moved } = drag;
                        setDrag(null);

                        // 클릭은 무시
                        if (!moved) return;

                        if (start === end) return;

                        showConfirmModal({
                          message: `${Math.min(start, end)}~${Math.max(start, end)}월을 병합하시겠습니까?`,
                          onConfirm: () => addMerge(row.id, start, end),
                        });
                      }}
                    >
                      <CellInput
                        value={row.months[m]}
                        onChange={e => updateMonthValue(row.id, m, e.target.value)}
                      />
                    </Td>
                  );
                })}

                <Td>
                  <DangerButton type="button" onClick={() => removeRow(row.id)}>
                    삭제
                  </DangerButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Form>
  );
}

const Form = styled.form<WithTheme>`
  display: grid;
  gap: 12px;
  margin-top: 24px;

  tr {
    margin-bottom: 24px;
  }

  button {
    cursor: pointer;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const LeftHeader = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Title = styled.h2<WithTheme>`
  margin: 0;
`;

const Select = styled.select<WithTheme>`
  height: 36px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ $variant?: 'primary' } & WithTheme>`
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  background-color: ${({ $variant, theme }) =>
    $variant === 'primary' ? theme.colors.greenColor : theme.colors.lineColor};
  color: ${({ $variant, theme }) =>
    $variant === 'primary' ? theme.colors.white : theme.colors.text};
`;

const DangerButton = styled.button<WithTheme>`
  background: ${({ theme }) => theme.colors.redColor};
  margin-left: 8px;
  padding: 8px 8px;
  border-radius: 4px;
  border: none;
  color: white;
`;

const TableWrap = styled.div`
  overflow: auto;
`;

const Table = styled.table`
  border-collapse: separate;
`;

const Th = styled.th<{ $stickyLeft?: boolean; $w?: number }>`
  width: ${({ $w }) => ($w ? `${$w}px` : 'auto')};
`;

const Td = styled.td<{ $stickyLeft?: boolean; $selected?: boolean }>`
  height: 16px;
  margin: 0 auto;
  background: ${({ $selected }) => ($selected ? '#e0f2fe' : 'white')};
`;

const TextInput = styled.input<WithTheme>`
  width: 100%;
  height: 100%;
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.sizes.medium};
  text-align: center;
`;

const CellInput = styled.input<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  width: 100%;
  height: 100%;
  padding: 4px 8px;
  text-align: center;
`;

const TitleInput = styled.input<WithTheme>`
  height: 36px;
  width: 240px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  border-radius: 6px;
  font-size: ${({ theme }) => theme.sizes.medium};
`;
