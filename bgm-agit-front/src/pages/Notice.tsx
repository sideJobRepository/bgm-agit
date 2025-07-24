import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';

interface NoticeProps {
  mainGb: boolean;
}

export default function Notice({ mainGb }: NoticeProps) {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const items = [
    { id: 1, title: 'BGM 아지트 여름 휴가 안내', date: '2025.08.30', category: '공지' },
    { id: 2, title: '멤버십 이벤트 안내', date: '2025.08.29', category: '이벤트' },
    { id: 3, title: '여름맞이 음료 추가 안내', date: '2025.08.24', category: '공지' },
    {
      id: 4,
      title: '동호회 가입하고 무료 포인트 받자!',
      date: '2025.08.01',
      category: '이벤트',
    },
    {
      id: 5,
      title: 'BGM 아지트 홈페이지 오픈 이벤트!',
      date: '2025.07.29',
      category: '이벤트',
    },
    {
      id: 6,
      title: 'BGM 아지트 홈페이지 오픈',
      date: '2025.07.22',
      category: '공지',
    },
  ];

  return (
    <>
      {mainGb ? (
        <Wrapper>
          <Table>
            <thead>
              <tr>
                <Th>번호</Th>
                <Th>제목</Th>
                {!isMobile && <Th>날짜</Th>}
                <Th>분류</Th>
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
        </Wrapper>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>번호</Th>
              <Th>제목</Th>
              {!isMobile && <Th>날짜</Th>}
              <Th>분류</Th>
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
      )}
    </>
  );
}

const Table = styled.table<WithTheme>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};

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

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }

    &:hover {
      opacity: 0.6;
    }
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }
`;

const Th = styled.th<WithTheme>`
  background-color: ${({ theme }) => theme.colors.basicColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

const Td = styled.td``;
