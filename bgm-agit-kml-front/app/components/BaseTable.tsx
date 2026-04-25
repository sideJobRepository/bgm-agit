// BaseTable.tsx
'use client';

import styled from 'styled-components';
import Pagination from '@/app/components/Pagination';
import { useUserStore } from '@/store/user';
import { PencilSimpleLine, MagnifyingGlass } from 'phosphor-react';
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
}

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
  rankType?: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  onRankTypeChange?: (value: 'WEEKLY' | 'MONTHLY' | 'CUSTOM') => void;
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
                        onRankTypeChange?.(e.target.value as 'WEEKLY' | 'MONTHLY' | 'CUSTOM')
                      }
                    >
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
                          selected={startDate}
                          onChange={(date) => onStartDateChange?.(date)}
                          dateFormat="yyyy.MM.dd"
                          showWeekNumbers
                          showWeekPicker
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
              {columns.map((col) => (
                <Th key={col.key} $width={col.width}>
                  {col.header}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <EmptyTd colSpan={columns.length}>{emptyMessage}</EmptyTd>
              </tr>
            ) : (
              data.map((row, index) => (
                <Tr
                  key={index}
                  className={getRowClassName?.(row, index)}
                  $clickable={!!onRowClick}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <Td
                      key={col.key}
                      className={getCellClassName?.(row, col, index)}
                      $align={col.align}
                      $nowrap={col.nowrap}
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
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.colors.blackColor};
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
}>`
  white-space: nowrap;
  font-weight: 600;
  text-align: center;
  width: ${({ $width }) => $width ?? 'auto'};
`;

const Td = styled.td<{
  $align?: 'left' | 'center' | 'right';
  $nowrap?: boolean;
}>`
  text-align: ${({ $align }) => $align ?? 'left'};
  white-space: ${({ $nowrap }) => ($nowrap ? 'nowrap' : 'normal')};
  word-break: break-word;
  overflow-wrap: anywhere;

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
