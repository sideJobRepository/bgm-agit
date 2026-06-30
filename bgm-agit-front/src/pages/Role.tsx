import { Wrapper } from '../styles';
import SearchBar from '../components/SearchBar.tsx';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useRoletFetch, useUpdatePost, useDeletePost } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { roleState } from '../recoil/state/roleState.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal, showInputModal } from '../components/confirmAlert.tsx';
import { toast } from 'react-toastify';
import { MdEdit } from 'react-icons/md';
import Pagination from '../components/Pagination.tsx';

type Tab = 'social' | 'mahjong';

// 로그인 타입 코드 → 한글 라벨
const LOGIN_TYPE_LABEL: Record<string, string> = {
  KAKAO: '카카오',
  NAVER: '네이버',
  GOOGLE: '구글',
  MAHJONG: '자체로그인',
};

export default function Role() {
  const fetchRole = useRoletFetch();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  // 소셜 / 자체로그인 탭
  const [tab, setTab] = useState<Tab>('social');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  // 체크된 memberId만 저장
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  // 전체 라디오 선택값 저장 (memberId → roleId)
  const [roleMap, setRoleMap] = useState<Record<number, number>>({});

  const items = useRecoilValue(roleState);
  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');

  const handlePageClick = (pageNum: number) => {
    setPage(pageNum);
  };

  // 탭 전환 시 페이지/선택 상태 초기화 (목록은 effect가 tab 변경을 감지해 재조회)
  const handleTabChange = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    setPage(0);
    setCheckedIds([]);
    setRoleMap({});
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

  // 닉네임 변경 (자체로그인 탭, 마작 회원 전용 엔드포인트 재사용)
  function changeNickname(memberId: number, currentNickname: string) {
    showInputModal({
      message: '닉네임 변경',
      label: '새 닉네임',
      initialValue: currentNickname,
      placeholder: '새 닉네임을 입력해 주세요.',
      onConfirm: nickname => {
        update({
          url: '/bgm-agit/mahjong-role/nickname',
          body: { memberId, nickname },
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('닉네임이 변경되었습니다.');
            fetchRole(page, searchKeyword, tab === 'mahjong');
          },
        });
      },
    });
  }

  // 비밀번호 변경 (자체로그인 탭)
  function changePassword(memberId: number) {
    showInputModal({
      message: '비밀번호 변경',
      label: '새 비밀번호 (4자 이상)',
      inputType: 'password',
      placeholder: '새 비밀번호',
      minLength: 4,
      onConfirm: password => {
        update({
          url: '/bgm-agit/mahjong-role/password',
          body: { memberId, password },
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('비밀번호가 변경되었습니다.');
          },
        });
      },
    });
  }

  // 마작 연동 토글 (자체로그인 탭, 관리자)
  function toggleMahjongUse(memberId: number, currentlyLinked: boolean, label: string) {
    const next = !currentlyLinked;
    showConfirmModal({
      message: next
        ? `${label} 회원을 마작 기록 연동하시겠습니까?`
        : `${label} 회원의 마작 기록 연동을 해제하시겠습니까?`,
      onConfirm: () => {
        update({
          url: '/bgm-agit/mahjong-role/mahjong-use',
          body: { memberId, use: next },
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success(next ? '마작 기록 연동되었습니다.' : '마작 기록 연동이 해제되었습니다.');
            fetchRole(page, searchKeyword, tab === 'mahjong');
          },
        });
      },
    });
  }

  // 소셜 회원 삭제 (소셜 탭)
  function deleteMember(memberId: number, label: string) {
    showConfirmModal({
      message: `${label} 회원을 삭제하시겠습니까? 되돌릴 수 없습니다.`,
      onConfirm: () => {
        remove({
          url: `/bgm-agit/role/${memberId}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('회원이 삭제되었습니다.');
            setCheckedIds([]);
            setRoleMap({});
            fetchRole(page, searchKeyword, tab === 'mahjong');
          },
        });
      },
    });
  }

  useEffect(() => {
    fetchRole(page, searchKeyword, tab === 'mahjong');
  }, [searchKeyword, page, tab]);

  return (
    <Wrapper>
      <NoticeBox>
        <SearchWrapper bgColor="#988271">
          <TitleBox textColor="#ffffff">
            <h2>Grant Permission</h2>
            <p>사용자 권한을 부여하세요.</p>
          </TitleBox>
          <SearchBox>
            <SearchBar<string>
              color="#988271"
              label="아이디,이름,연락처"
              onSearch={keyword => {
                setPage(0);
                setSearchKeyword(keyword);
              }}
            />
          </SearchBox>
        </SearchWrapper>
        <TabBar>
          <TabButton $active={tab === 'social'} onClick={() => handleTabChange('social')}>
            소셜 로그인
          </TabButton>
          <TabButton $active={tab === 'mahjong'} onClick={() => handleTabChange('mahjong')}>
            자체로그인
          </TabButton>
        </TabBar>
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
                  {tab === 'mahjong' && <Th>닉네임</Th>}
                  <Th>연락처</Th>
                  <Th>로그인 타입</Th>
                  {tab === 'mahjong' && <Th>마작 연동</Th>}
                  <Th>권한</Th>
                  {tab === 'mahjong' && <Th>비밀번호</Th>}
                  {tab === 'social' && <Th>삭제</Th>}
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
                    <Td>{item.memberEmail || '-'}</Td>
                    <Td>{item.memberName}</Td>
                    {tab === 'mahjong' && (
                      <Td>
                        <NicknameCell>
                          <span>{item.memberNickname}</span>
                          <IconButton
                            type="button"
                            title="닉네임 변경"
                            onClick={() => changeNickname(item.memberId, item.memberNickname)}
                          >
                            <MdEdit />
                          </IconButton>
                        </NicknameCell>
                      </Td>
                    )}
                    <Td>{item.memberPhoneNo}</Td>
                    <Td>{LOGIN_TYPE_LABEL[item.memberLoginType] ?? item.memberLoginType}</Td>
                    {tab === 'mahjong' && (
                      <Td>
                        <LinkBadge
                          as={isAdmin ? 'button' : 'span'}
                          type={isAdmin ? 'button' : undefined}
                          $linked={item.mahjongUseStatus === 'Y'}
                          $clickable={isAdmin}
                          title={isAdmin ? '클릭하여 연동/해제' : undefined}
                          onClick={
                            isAdmin
                              ? () =>
                                  toggleMahjongUse(
                                    item.memberId,
                                    item.mahjongUseStatus === 'Y',
                                    item.memberNickname
                                  )
                              : undefined
                          }
                        >
                          {item.mahjongUseStatus === 'Y' ? '연동' : '미연동'}
                        </LinkBadge>
                      </Td>
                    )}
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
                    {tab === 'mahjong' && (
                      <Td>
                        <ActionButton type="button" onClick={() => changePassword(item.memberId)}>
                          변경
                        </ActionButton>
                      </Td>
                    )}
                    {tab === 'social' && (
                      <Td>
                        <DeleteButton
                          type="button"
                          onClick={() =>
                            deleteMember(item.memberId, item.memberName || item.memberNickname)
                          }
                        >
                          삭제
                        </DeleteButton>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            {items?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
            <PaginationWrapper>
              <Pagination
                current={page}
                totalPages={items?.totalPages}
                onChange={handlePageClick}
              />
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

const LinkBadge = styled.span.withConfig({
  shouldForwardProp: prop => prop !== '$linked' && prop !== '$clickable',
})<{ $linked: boolean; $clickable?: boolean } & WithTheme>`
  display: inline-block;
  padding: 2px 10px;
  border: none;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ $linked }) => ($linked ? '#1a7d55' : '#999999')};
  background-color: ${({ $linked }) => ($linked ? 'rgba(26,125,85,0.12)' : '#f0f0f0')};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`;

const NicknameCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: none;
  background: transparent;
  color: #988271;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionButton = styled.button<WithTheme>`
  padding: 4px 12px;
  border: 1px solid #988271;
  border-radius: 4px;
  background: transparent;
  color: #988271;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;
  white-space: nowrap;
`;

const DeleteButton = styled.button<WithTheme>`
  padding: 4px 12px;
  border: 1px solid #ff5e57;
  border-radius: 4px;
  background: transparent;
  color: #ff5e57;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;
  white-space: nowrap;
`;

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const TabButton = styled.button.withConfig({
  shouldForwardProp: prop => prop !== '$active',
})<{ $active: boolean } & WithTheme>`
  padding: 8px 20px;
  border: 1px solid #988271;
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-size: ${({ theme }) => theme.sizes.small};
  background-color: ${({ $active }) => ($active ? '#988271' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#988271')};

  @media ${({ theme }) => theme.device.mobile} {
    flex: 1;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
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

  /* 모바일: 컬럼이 많아 가로 스크롤(TableBox overflow-x) 되도록 최소 너비 보장 */
  @media ${({ theme }) => theme.device.mobile} {
    min-width: 760px;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }

  th,
  td {
    padding: 14px;
    text-align: center;

    @media ${({ theme }) => theme.device.mobile} {
      padding: 10px 8px;
    }
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
