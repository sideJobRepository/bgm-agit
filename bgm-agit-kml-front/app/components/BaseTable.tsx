// BaseTable.tsx
'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import Pagination from '@/app/components/Pagination';
import { useUserStore } from '@/store/user';
import { CaretDown, CaretUp, MagnifyingGlass, PencilSimpleLine } from 'phosphor-react';
import { usePathname } from 'next/navigation';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

export interface BaseColumn<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  nowrap?: boolean;
  sticky?: boolean;
  sortable?: boolean;
  sortValue?: (row: T) => number | string | null | undefined;
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

interface BaseTableProps<T> {
  columns: BaseColumn<T>[];
  data: T[];

  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  onRowClick?: (row: T) => void;
  showWriteButton?: boolean;
  onWriteClick?: () => void;
  emptyMessage?: string;
  searchLabel?: string | null;
  searchKeyword?: string;
  onSearchKeywordChange?: (value: string) => void;
  rankType?: 'ALL' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  onRankTypeChange?: (value: 'ALL' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM') => void;
  startDate?: Date | null;
  onStartDateChange?: (value: Date | null) => void;
  endDate?: Date | null;
  onEndDateChange?: (value: Date | null) => void;
  getRowClassName?: (row: T, index: number) => string | undefined;
  getCellClassName?: (row: T, col: BaseColumn<T>, index: number) => string | undefined;
  onSearch?: () => void;
}

export function BaseTable<T>({
  columns,
  data,
  page,
  totalPages,
  onPageChange,
  onRowClick,
  showWriteButton = false,
  onWriteClick,
  emptyMessage = '검색된 결과가 없습니다.',
  searchLabel,
  searchKeyword,
  onSearchKeywordChange,
  rankType = 'MONTHLY',
  onRankTypeChange,
  startDate = null,
  onStartDateChange,
  endDate = null,
  onEndDateChange,
  getRowClassName,
  getCellClassName,
  onSearch,
}: BaseTableProps<T>) {
  const user = useUserStore((state) => state.user);
  const pathname = usePathname();
  const isRankPage = pathname === '/rank';

  const [sort, setSort] = useState<SortState>(null);

  const pad = (n: number) => String(n).padStart(2, '0');

  const formatDate = (date: Date) =>
    `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;

  const getMondayOfWeek = (date: Date | null) => {
    if (!date) return null;
    const monday = new Date(date);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const getSundayOfWeek = (date: Date | null) => {
    const monday = getMondayOfWeek(date);
    if (!monday) return null;
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return sunday;
  };

  const formatWeekRange = (date: Date | null) => {
    const monday = getMondayOfWeek(date);
    const sunday = getSundayOfWeek(date);
    if (!monday || !sunday) return '';
    return `${formatDate(monday)} ~ ${formatDate(sunday)}`;
  };

  // sticky 컬럼들의 누적 left offset (width는 px 형식이어야 함)
  const stickyOffsets = useMemo(() => {
    const offsets: (string | undefined)[] = [];
    let offsetPx = 0;
    columns.forEach((col) => {
      if (col.sticky) {
        offsets.push(`${offsetPx}px`);
        const w = parseInt(col.width ?? '0', 10);
        if (Number.isFinite(w)) offsetPx += w;
      } else {
        offsets.push(undefined);
      }
    });
    return offsets;
  }, [columns]);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    const getValue =
      col.sortValue ?? ((row: T) => (row as Record<string, unknown>)[sort.key] as number | string);
    const arr = [...data];
    arr.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      const aNullish = va === null || va === undefined || va === '';
      const bNullish = vb === null || vb === undefined || vb === '';
      if (aNullish && bNullish) return 0;
      if (aNullish) return 1;
      if (bNullish) return -1;
      let cmp: number;
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb), 'ko', { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [data, sort, columns]);

  const onHeaderClick = (col: BaseColumn<T>) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, dir: 'desc' };
      if (prev.dir === 'desc') return { key: col.key, dir: 'asc' };
      return null;
    });
  };

  return (
    <TableBox data-pathname={pathname}>
      {searchLabel && (
        <TopBox>
          <SearchGroup
            $isRankPage={isRankPage}
            onSubmit={(e) => {
              e.preventDefault();
              onSearch?.();
            }}
          >
            <FieldsWrapper>
              {!isRankPage ? (
                <Field $path={true}>
                  <label>{searchLabel}</label>
                  <input
                    type="text"
                    placeholder="검색어를 입력해주세요."
                    value={searchKeyword ?? ''}
                    onChange={(e) => onSearchKeywordChange?.(e.target.value)}
                  />
                </Field>
              ) : (
                <>
                  <Field $path={false}>
                    <label>구분</label>
                    <select
                      value={rankType}
                      onChange={(e) =>
                        onRankTypeChange?.(
                          e.target.value as 'ALL' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
                        )
                      }
                    >
                      <option value="ALL">전체</option>
                      <option value="WEEKLY">주간</option>
                      <option value="MONTHLY">월간</option>
                      <option value="CUSTOM">사용자설정</option>
                    </select>
                  </Field>
                  {rankType === 'WEEKLY' && (
                    <Field $path={false}>
                      <label>주 선택</label>
                      <DateRange>
                        <DatePicker
                          selected={getMondayOfWeek(startDate)}
                          onChange={(date) => onStartDateChange?.(getMondayOfWeek(date))}
                          dateFormat="yyyy.MM.dd"
                          value={formatWeekRange(startDate)}
                          showWeekNumbers
                          showWeekPicker
                          calendarStartDay={1}
                          locale={ko}
                          portalId="root-portal"
                        />
                      </DateRange>
                    </Field>
                  )}
                  {rankType === 'MONTHLY' && (
                    <Field $path={false}>
                      <label>년월</label>
                      <DateRange>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => onStartDateChange?.(date)}
                          dateFormat="yyyy.MM"
                          showMonthYearPicker
                          locale={ko}
                          portalId="root-portal"
                        />
                      </DateRange>
                    </Field>
                  )}
                  {rankType === 'CUSTOM' && (
                    <Field $path={false} $wide>
                      <label>기간(시간 포함)</label>
                      <DateRange>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => onStartDateChange?.(date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="yyyy.MM.dd HH:mm"
                          locale={ko}
                          portalId="root-portal"
                        />
                        <span>~</span>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => onEndDateChange?.(date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="yyyy.MM.dd HH:mm"
                          locale={ko}
                          portalId="root-portal"
                        />
                      </DateRange>
                    </Field>
                  )}
                </>
              )}
            </FieldsWrapper>
            <SearchButton type="submit">
              <MagnifyingGlass weight="bold" />
              검색
            </SearchButton>
          </SearchGroup>
          {user?.roles?.includes('ROLE_ADMIN') && !showWriteButton && (
            <Button onClick={onWriteClick ? () => onWriteClick() : undefined}>
              <PencilSimpleLine weight="bold" />
            </Button>
          )}
        </TopBox>
      )}

      <TableScroll>
        <Table>
          <thead>
            <tr>
              {columns.map((col, i) => {
                const isSorted = sort?.key === col.key;
                return (
                  <Th
                    key={col.key}
                    $width={col.width}
                    $sticky={!!col.sticky}
                    $sortable={!!col.sortable}
                    style={col.sticky ? { left: stickyOffsets[i] } : undefined}
                    onClick={col.sortable ? () => onHeaderClick(col) : undefined}
                  >
                    <ThInner>
                      {col.header}
                      {col.sortable && (
                        <SortIcons $active={isSorted}>
                          <CaretUp
                            weight={isSorted && sort?.dir === 'asc' ? 'fill' : 'regular'}
                          />
                          <CaretDown
                            weight={isSorted && sort?.dir === 'desc' ? 'fill' : 'regular'}
                          />
                        </SortIcons>
                      )}
                    </ThInner>
                  </Th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <EmptyTd colSpan={columns.length}>{emptyMessage}</EmptyTd>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <Tr
                  key={index}
                  className={getRowClassName?.(row, index)}
                  $clickable={!!onRowClick}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col, i) => (
                    <Td
                      key={col.key}
                      className={getCellClassName?.(row, col, index)}
                      $align={col.align}
                      $nowrap={col.nowrap}
                      $sticky={!!col.sticky}
                      style={col.sticky ? { left: stickyOffsets[i] } : undefined}
                    >
                      {col.render(row, index)}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </TableScroll>
      <PaginationWrapper>
        <Pagination current={page} totalPages={totalPages} onChange={onPageChange} />
      </PaginationWrapper>
    </TableBox>
  );
}

const TableBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 8px;
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
`;

const Table = styled.table`
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.inputColor};
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.lineColor};
    z-index: 4;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.colors.blackColor};
    z-index: 4;
  }

  thead {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }

  th,
  td {
    padding: 14px;
  }

  tbody tr:hover {
    opacity: 0.6;
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const Th = styled.th<{
  $width?: string;
  $align?: 'left' | 'center' | 'right';
  $sticky?: boolean;
  $sortable?: boolean;
}>`
  white-space: nowrap;
  font-weight: 600;
  text-align: center;
  width: ${({ $width }) => $width ?? 'auto'};
  cursor: ${({ $sortable }) => ($sortable ? 'pointer' : 'default')};
  user-select: ${({ $sortable }) => ($sortable ? 'none' : 'auto')};
  ${({ $sortable }) =>
    $sortable &&
    `
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `}
  ${({ $sticky }) =>
    $sticky &&
    `
    position: sticky;
    z-index: 3;
    background-color: #ffffff;
  `}
`;

const ThInner = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
`;

const SortIcons = styled.span<{ $active: boolean }>`
  display: inline-flex;
  flex-direction: column;
  line-height: 0;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.inputColor : theme.colors.lineColor};

  svg {
    width: 10px;
    height: 10px;
    margin: -1px 0;
  }
`;

const Td = styled.td<{
  $align?: 'left' | 'center' | 'right';
  $nowrap?: boolean;
  $sticky?: boolean;
}>`
  text-align: ${({ $align }) => $align ?? 'left'};
  white-space: ${({ $nowrap }) => ($nowrap ? 'nowrap' : 'normal')};
  word-break: break-word;
  overflow-wrap: anywhere;
  ${({ $sticky }) =>
    $sticky &&
    `
    position: sticky;
    z-index: 1;
    background-color: inherit;
  `}

  &.cell-blue {
    color: #2563eb;
    font-weight: 600;
  }

  &.cell-green {
    color: #15803d;
    font-weight: 600;
  }

  &.cell-red {
    color: #dc2626;
    font-weight: 600;
  }
`;

const Tr = styled.tr<{ $clickable: boolean }>`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  background-color: #ffffff;

  &:nth-child(even) {
    background-color: rgb(253, 253, 255);
  }

  &.rank-gold {
    background-color: #fff4cc !important;
  }

  &.rank-silver {
    background-color: #f3f4f6 !important;
  }

  &.rank-bronze {
    background-color: #fce7d6 !important;
  }
`;

const EmptyTd = styled.td`
  padding: 40px 0;
  font-weight: 600;
`;

const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 4px;
`;

const TopBox = styled.section`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 0;
  justify-content: space-between;

  @media ${({ theme }) => theme.device.mobile} {
    gap: 12px;
    flex-wrap: wrap;
    align-items: stretch;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SearchGroup = styled.form<{ $isRankPage?: boolean }>`
  display: flex;
  background-color: ${({ theme }) => theme.colors.white};
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 2px 20px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  flex-wrap: nowrap;
  max-width: ${({ $isRankPage }) => ($isRankPage ? '620px' : '260px')};

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    max-width: 100%;
    flex-wrap: wrap;
    padding: 8px 12px;
    gap: 8px;
  }
`;

const FieldsWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  flex-wrap: nowrap;
  overflow-y: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    flex-wrap: wrap;
    overflow-x: visible;
    gap: 8px;
  }
`;

const Field = styled.div<{ $path: boolean; $wide?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ $path, $wide }) =>
    $wide ? 'calc(100% - 100px)' : $path ? '100%' : 'calc(50% - 8px)'};
  flex-shrink: 0;

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.blackColor};
    font-weight: 600;
    text-align: left;
  }

  input {
    border: none;
    width: 100%;
    padding: 4px 0;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: transparent;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
      padding: 6px 0;
    }
  }

  select {
    border: none;
    width: 100%;
    padding: 4px 0;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: transparent;
    appearance: none;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
      padding: 6px 0;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #6dae81;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  border: none;
  color: white;
  font-weight: 500;
  padding: 0 16px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    opacity: 0.8;
  }
`;

const TableScroll = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
`;

const DateRange = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.inputColor};

  input {
    cursor: pointer;
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-wrap: wrap;
    gap: 4px;
  }
`;
