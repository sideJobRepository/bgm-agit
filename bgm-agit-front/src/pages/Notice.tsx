import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useMediaQuery } from 'react-responsive';

interface NoticeIItem {
  id: number;
  title: string;
  date: string;
  category: string;
}

interface Props {
  items: NoticeIItem[];
}

export default function NoticeTable({ items }: Props) {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <Table>
      <thead>
        <tr>
          <Th>번호</Th>
          <Th>제목</Th>
          <Th>날짜</Th>
          {!isMobile && <Th>분류</Th>}
        </tr>
      </thead>
      <tbody>
        {items.map(notice => (
          <tr key={notice.id}>
            <Td>{notice.id}</Td>
            <Td>{notice.title}</Td>
            <Td>{notice.date}</Td>
            {!isMobile && <Td>{notice.category}</Td>}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

const Table = styled.table<WithTheme>`
  width: 100%;
  margin-top: 30px;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subMenuColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }

  th,
  td {
    padding: 14px;
    text-align: center;
  }

  tbody tr {
    cursor: pointer;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }

    &:hover {
      opacity: 0.6;
    }
  }
`;

const Th = styled.th<WithTheme>`
  background-color: ${({ theme }) => theme.colors.basicColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

const Td = styled.td``;
