// BaseTable.tsx
'use client';

import styled from 'styled-components';
import Pagination from '@/app/components/Pagination';
import { useUserStore } from '@/store/user';
import { PencilSimpleLine } from 'phosphor-react';

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
                             }: BaseTableProps<T>) {
  const user = useUserStore((state) =>state.user);
  console.log("user", user)

  return (
    <TableBox>
      <TopBox>
        <SearchGroup>
          <FieldsWrapper>
            <Field>
              <label>{searchLabel}</label>
              <input
                type="text"
                placeholder="검색어를 입력해주세요."
                // value={keyword}
                // onChange={e => setKeyword(e.target.value)}
              />
            </Field>
          </FieldsWrapper>
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
                <Td key={col.key}>
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
    display: inline-flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 8px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    color: ${({ theme }) => theme.colors.inputColor};

    th,
    td {
        padding: 14px;
        text-align: center;
    }

    tbody tr:hover {
        opacity: 0.6;
    }

    td {
        border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
    }
`;

const Th = styled.th`
    white-space: nowrap;
    border-top: 1px solid ${({ theme }) => theme.colors.blackColor};
    border-bottom: 1px solid ${({ theme }) => theme.colors.grayColor};
    font-weight: 600;
`;

const Td = styled.td`
    white-space: normal;
    word-break: break-word; 
    overflow-wrap: anywhere;
`;

const Tr = styled.tr<{ $clickable: boolean }>`
    cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
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
    // border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
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
  padding: 2px 16px;
  border: 2px solid rgb(244 244 245);
  border-radius: 999px;
  flex-wrap: nowrap;
    max-width: 240px;

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