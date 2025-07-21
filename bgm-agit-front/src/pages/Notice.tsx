import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

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
  return (
    <Table>
      <thead>
        <tr>
          <Th>번호</Th>
          <Th>제목</Th>
          <Th>날짜</Th>
          <Th>분류</Th>
        </tr>
      </thead>
      <tbody>
        {items.map(notice => (
          <tr key={notice.id}>
            <Td>{notice.id}</Td>
            <Td>{notice.title}</Td>
            <Td>{notice.date}</Td>
            <Td>{notice.category}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

const Table = styled.table<WithTheme>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subMenuColor};

  th,
  td {
    padding: 16px;
    text-align: left;
  }

  tbody tr {
    cursor: pointer;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

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
