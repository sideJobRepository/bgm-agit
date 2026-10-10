import styled, { keyframes } from 'styled-components';

export const TableBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 8px;
`;

export const TopBox = styled.section`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 0;
  justify-content: space-between;
`;

export const SearchSkeleton = styled.div`
  width: 260px;
  height: 36px;
  border-radius: 4px;
  background: #eee;
`;

export const WriteButtonSkeleton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #e0e0e0;
`;

export const Table = styled.table`
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

export const Th = styled.th<{ $width?: string }>`
  width: ${({ $width }) => $width ?? 'auto'};
`;

export const Td = styled.td<{ $width?: string }>`
  width: ${({ $width }) => $width ?? 'auto'};
`;

export const PaginationBox = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 4px;
`;

export const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

export const Skeleton = styled.div<{
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
