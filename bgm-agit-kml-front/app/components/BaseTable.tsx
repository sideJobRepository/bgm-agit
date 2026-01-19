// BaseTable.tsx
'use client';

import styled from 'styled-components';
import Pagination from '@/app/components/Pagination';
import { useUserStore } from '@/store/user';
import { PencilSimpleLine, MagnifyingGlass } from 'phosphor-react';

export interface BaseColumn<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
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
  searchLabel?: string;
  searchKeyword?: string;
  onSearchKeywordChange?: (value: string) => void;
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
                               onSearch
                             }: BaseTableProps<T>) {
  const user = useUserStore((state) =>state.user);
  console.log("user", user)

  return (
    <TableBox>
      <TopBox>
        <SearchGroup onSubmit={(e) => {
          e.preventDefault();
          onSearch?.();
        }}>
          <FieldsWrapper>
            <Field>
              <label>{searchLabel}</label>
              <input
                type="text"
                placeholder="검색어를 입력해주세요."
                value={searchKeyword ?? ''}
                onChange={(e) =>
                  onSearchKeywordChange?.(e.target.value)
                }
              />
            </Field>
          </FieldsWrapper>
          <SearchButton type="submit">
            <MagnifyingGlass weight="bold"/>
            검색
          </SearchButton>
        </SearchGroup>
        {user?.roles?.includes('ROLE_ADMIN') && (
          <Button
            color="#988271"
          >
            <PencilSimpleLine weight="bold" />
            작성
          </Button>
        )}
      </TopBox>
      <Table>
        <thead>
        <tr>
          {columns.map(col => (
            <Th key={col.key}>{col.header}</Th>
          ))}
        </tr>
        </thead>
        <tbody>
        {data.length === 0 ? (
          <tr>
            <EmptyTd colSpan={columns.length}>
              {emptyMessage}
            </EmptyTd>
          </tr>
        ) : (
          data.map((row, index) => (
            <Tr
              key={index}
              $clickable={!!onRowClick}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map(col => (
                <Td key={col.key} $wrap={col.key === 'registDate'}>
                  {col.render(row, index)}
                </Td>
              ))}
            </Tr>
          ))
        )}
        </tbody>
      </Table>
      <PaginationWrapper>
        <Pagination
          current={page}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      </PaginationWrapper>
    </TableBox>
  );
}

const TableBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 8px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    color: ${({ theme }) => theme.colors.inputColor};

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

const Th = styled.th`
    white-space: nowrap;
    border-top: 1px solid ${({ theme }) => theme.colors.grayColor};
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
    font-weight: 600;
`;

const Td = styled.td<{$wrap : boolean}>`
    white-space: ${({ $wrap }) => ($wrap ? 'nowrap' : 'normal')};
    word-break: break-word; 
    overflow-wrap: anywhere;
    
`;

const Tr = styled.tr<{ $clickable: boolean }>`
    cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

    &:nth-child(even) {
        background-color: rgb(253, 253, 255);


    }
`;

const EmptyTd = styled.td`
  padding: 40px 0;
  font-weight: 600;
`;

const PaginationWrapper = styled.div`
    text-align: center;
    margin-top: 20px;
`;

const TopBox = styled.section`
  display: flex;
    align-items: center;
    gap: 24px;
    padding: 12px 0;
    justify-content: space-between;
`

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
  padding: 0 16px;
    height: 32px;
  background-color: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: 4px;
  cursor: pointer;
    font-weight: 500;
    
    &:hover {
        opacity: 0.8;
    }
`;

const SearchGroup = styled.form`
  display: flex;
  background-color: ${({ theme }) => theme.colors.white};
  flex: 1;
  align-items: center;
  justify-content: space-between;
    padding: 2px 4px 2px 20px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 999px;
  flex-wrap: nowrap;
    max-width: 260px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
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
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.blackColor};
    font-weight: 600;
    text-align: left;
    margin-left: 6px;
  }

  input {
    border: none;
    width: 100%;
    padding: 4px 4px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: transparent;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
    gap: 6px;
  background: #6DAE81;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  border: none;
  color: white;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
`;
