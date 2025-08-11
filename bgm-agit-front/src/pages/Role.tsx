import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useRoletFetch, useUpdatePost } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { roleState } from '../recoil/state/roleState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { toast } from 'react-toastify';

export default function Role() {
  const fetchRole = useRoletFetch();
  const { update } = useUpdatePost();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  // 체크된 memberId만 저장
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  // 전체 라디오 선택값 저장 (memberId → roleId)
  const [roleMap, setRoleMap] = useState<Record<number, number>>({});

  const items = useRecoilValue(roleState);

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  //업데이트
  async function updateData() {
    const selected = checkedIds.map(id => ({
      memberId: id,
      roleId: roleMap[id] ?? items.content.find(i => i.memberId === id)?.roleId,
    }));

    if (selected.length === 0) {
      toast.error('선택된 행이 없습니다.');
      return;
    }

    showConfirmModal({
      message: '권한을 변경하시겠습니까?',
      onConfirm: () => {
        update({
          url: 'bgm-agit/role',
          body: selected,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('권한이 변경되었습니다.');
            setCheckedIds([]);
            setRoleMap([]);

            fetchRole(page, searchKeyword);
          },
        });
      },
    });
  }

  useEffect(() => {
    fetchRole(page, searchKeyword);
  }, [searchKeyword, page]);

  return (
    <Wrapper>
      <NoticeBox>
        <SearchWrapper bgColor="#988271">
          <TitleBox textColor="#ffffff">
            <h2>Grant Permission</h2>
            <p>사용자 권한을 부여하세요.</p>
          </TitleBox>
          <SearchBox>
            <SearchBar<string> color="#988271" label="아이디" onSearch={setSearchKeyword} />
          </SearchBox>
        </SearchWrapper>
        <TableBox>
          <TableWrapper>
            <ButtonBox>
              <Button color="#988271" onClick={() => updateData()}>
                저장
              </Button>
            </ButtonBox>
            <Table>
              <thead>
                <tr>
                  <Th> </Th>
                  <Th>번호</Th>
                  <Th>아이디</Th>
                  <Th>이름</Th>
                  <Th>권한</Th>
                </tr>
              </thead>
              <tbody>
                {items?.content.map((item, index) => (
                  <tr key={item.memberId}>
                    <Td>
                      <input
                        type="checkbox"
                        checked={checkedIds.includes(item.memberId)}
                        onChange={e => {
                          const isChecked = e.target.checked;
                          setCheckedIds(prev =>
                            isChecked
                              ? [...prev, item.memberId]
                              : prev.filter(id => id !== item.memberId)
                          );
                        }}
                      />
                    </Td>
                    <Td>{index + 1}</Td>
                    <Td>{item.memberEmail}</Td>
                    <Td>{item.memberName}</Td>
                    <Td>
                      <div>
                        <label>
                          <input
                            type="radio"
                            name={`role-${item.memberId}`}
                            value="1"
                            checked={(roleMap[item.memberId] ?? item.roleId) === 1}
                            onChange={() => setRoleMap(prev => ({ ...prev, [item.memberId]: 1 }))}
                          />
                          관리자
                        </label>
                        <label style={{ marginLeft: '12px' }}>
                          <input
                            type="radio"
                            name={`role-${item.memberId}`}
                            value="4"
                            checked={(roleMap[item.memberId] ?? item.roleId) === 4}
                            onChange={() => setRoleMap(prev => ({ ...prev, [item.memberId]: 4 }))}
                          />
                          멘토
                        </label>
                        <label style={{ marginLeft: '12px' }}>
                          <input
                            type="radio"
                            name={`role-${item.memberId}`}
                            value="2"
                            checked={(roleMap[item.memberId] ?? item.roleId) === 2}
                            onChange={() => setRoleMap(prev => ({ ...prev, [item.memberId]: 2 }))}
                          />
                          일반
                        </label>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
            <PaginationWrapper>
              {[...Array(items?.totalPages ?? 0)].map((_, idx) => (
                <PageButton key={idx} active={idx === page} onClick={() => handlePageClick(idx)}>
                  {idx + 1}
                </PageButton>
              ))}
            </PaginationWrapper>
          </TableWrapper>
        </TableBox>
      </NoticeBox>
    </Wrapper>
  );
}

const NoticeBox = styled.div`
  padding: 10px;
`;

const TableBox = styled.div`
  padding: 40px 0;
  overflow-x: auto;
  width: 100%;
  white-space: nowrap;
`;

const TableWrapper = styled.div<WithTheme>`
  display: inline-block;
  width: 100%;
  @media ${({ theme }) => theme.device.mobile} {
    width: unset;
    min-width: 100%;
  }
`;

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
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }
`;

const Th = styled.th<WithTheme>`
  background-color: ${({ theme }) => theme.colors.basicColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

const Td = styled.td<WithTheme>`
  input[type='checkbox'] {
    accent-color: ${({ theme }) => theme.colors.noticeColor};
    cursor: pointer;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    label {
      display: flex;
      gap: 4px;

      input {
        margin-right: 6px;
        accent-color: ${({ theme }) => theme.colors.noticeColor};
        cursor: pointer;
      }
    }
  }
`;

const SearchWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'bgColor',
})<{ bgColor: string } & WithTheme>`
  display: flex;
  width: 100%;
  background-color: ${({ bgColor }) => bgColor};
  padding: 20px;
  align-items: center;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: 10px;
  }
`;

const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  width: 60%;
  height: 60px;
  color: ${({ textColor }) => textColor};

  h2 {
    font-family: 'Bungee', sans-serif;
    font-weight: ${({ theme }) => theme.weight.bold};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: auto;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 40px;
    text-align: center;
    margin-bottom: 10px;

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
    p {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;

const SearchBox = styled.div<WithTheme>`
  width: 40%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const PageButton = styled.button.withConfig({
  shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean } & WithTheme>`
  margin: 0 5px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.basicColor};
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.noticeColor : theme.colors.white};
  color: ${({ active, theme }) => (active ? theme.colors.white : theme.colors.subColor)};

  &:hover {
    opacity: 0.8;
  }
`;

const NoSearchBox = styled.div<WithTheme>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-family: 'Jua', sans-serif;\
    margin-top: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const ButtonBox = styled.div`
  display: flex;
  width: 100%;
  justify-content: right;
  margin-bottom: 10px;
`;

const Button = styled.button<WithTheme & { color: string }>`
  padding: 6px 16px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
