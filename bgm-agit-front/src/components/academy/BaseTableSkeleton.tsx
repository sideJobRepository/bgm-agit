'use client';

import { TableBox, TopBox, SearchSkeleton, Table, Th, Td, PaginationBox, Skeleton } from './BaseTableSkeleton.styles.ts';
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
