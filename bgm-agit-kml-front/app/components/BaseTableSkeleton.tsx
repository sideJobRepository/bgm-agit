'use client';

import styled, { keyframes } from 'styled-components';
import { BaseColumn } from '@/app/components/BaseTable';

interface BaseTableSkeletonProps<T = any> {
  columns: Pick<BaseColumn<T>, 'width'>[];
}

export default function BaseTableSkeleton<T>({
                                               columns,
                                             }: BaseTableSkeletonProps<T>) {
  return (
    <TableBox>
      {/* Top (Search 영역) */}
      <TopBox>
        <SearchSkeleton />
      </TopBox>

      {/* Table */}
      <Table>
        <thead>
        <tr>
          {columns.map((col, idx) => (
            <Th key={idx} $width={col.width}>
              <Skeleton width="100%" />
            </Th>
          ))}
        </tr>
        </thead>

        <tbody>
        {Array.from({ length: 5 }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            {columns.map((col, colIdx) => (
              <Td key={colIdx} $width={col.width}>
                <Skeleton />
              </Td>
            ))}
          </tr>
        ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <PaginationBox>
        <Skeleton width="24px" height="24px" />
      </PaginationBox>
    </TableBox>
  );
}
const TableBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 8px;
`;

const TopBox = styled.section`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 0;
  justify-content: space-between;
`;

const SearchSkeleton = styled.div`
  width: 260px;
  height: 36px;
  border-radius: 4px;
  background: #eee;
`;

const WriteButtonSkeleton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #e0e0e0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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
  th,
  td {
    padding: 14px;
    border-bottom: 1px solid #eee;
  }
`;

const Th = styled.th<{ $width?: string }>`
  width: ${({ $width }) => $width ?? 'auto'};
`;

const Td = styled.td<{ $width?: string }>`
  width: ${({ $width }) => $width ?? 'auto'};
`;

const PaginationBox = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 4px;
`;

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

const Skeleton = styled.div<{
  width?: string;
  height?: string;
}>`
  width: ${({ width }) => width ?? '100%'};
  height: ${({ height }) => height ?? '16px'};
  border-radius: 4px;

  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

