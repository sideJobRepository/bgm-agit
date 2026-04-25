'use client';

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';

import React, { useEffect, useState } from 'react';

import { Check, MagnifyingGlass, Key } from 'phosphor-react';
import { useUpdatePost } from '@/services/main.service';
import { alertDialog, confirmDialog } from '@/utils/alert';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { useFetchMahjongRoles } from '@/services/role.service';
import { useRoleStore } from '@/store/role';
import Pagination from '@/app/components/Pagination';

const ROLE_OPTIONS = [
  { id: 1, label: '관리자' },
  { id: 4, label: '멘토' },
  { id: 2, label: '유저' },
];

export default function Role() {
  const { update } = useUpdatePost();
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const fetchRoles = useFetchMahjongRoles();
  const roleData = useRoleStore((state) => state.role);

  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [roleMap, setRoleMap] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchRoles(page, searchKeyword);
  }, [page, searchKeyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearchKeyword(searchInput);
  };

  const handleChangePassword = async (memberId: number, memberNickname: string) => {
    const result = await Swal.fire({
      title: `${memberNickname} 비밀번호 변경`,
      input: 'password',
      inputLabel: '새 비밀번호 (8자 이상)',
      inputAttributes: {
        autocomplete: 'new-password',
        minlength: '8',
      },
      showCancelButton: true,
      confirmButtonText: '변경',
      cancelButtonText: '취소',
      reverseButtons: true,
      confirmButtonColor: '#4A90E2',
      cancelButtonColor: '#757575',
      inputValidator: (value) => {
        if (!value) return '비밀번호를 입력해주세요.';
        if (value.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';
        return null;
      },
    });

    if (!result.isConfirmed || !result.value) return;

    update({
      url: '/bgm-agit/mahjong-role/password',
      body: { memberId, password: result.value },
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        await alertDialog('비밀번호가 변경되었습니다.', 'success');
      },
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      await alertDialog('유저 정보가 없습니다. \n 로그인 후 이용해주세요.', 'error');
      router.push('/login');
      return;
    }

    if (checkedIds.length === 0) {
      await alertDialog('선택된 행이 없습니다.', 'error');
      return;
    }

    const result = await confirmDialog('권한을 변경하시겠습니까?', 'warning');
    if (!result.isConfirmed) return;

    const body = checkedIds.map((memberId) => ({
      memberId,
      roleId:
        roleMap[memberId] ??
        roleData?.content.find((i) => i.memberId === memberId)?.roleId,
    }));

    update({
      url: '/bgm-agit/role',
      body,
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        await alertDialog('권한이 변경되었습니다.', 'success');
        setCheckedIds([]);
        setRoleMap({});
        fetchRoles(page, searchKeyword);
      },
    });
  };

  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/write.jpg')} alt="" />
        </HeroBg>
        <FixedDarkOverlay />
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
        />
        <HeroContent>
          <h1>Grant Permission</h1>
          <span>마작 회원의 사이트 권한을 부여하세요.</span>
        </HeroContent>
      </Hero>

      <TableBox>
        <Top>
          <SearchGroup onSubmit={handleSearch}>
            <Field>
              <label>닉네임 / 이름 / 연락처</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="검색어를 입력해주세요."
              />
            </Field>
            <SearchButton type="submit">
              <MagnifyingGlass weight="bold" />
              검색
            </SearchButton>
          </SearchGroup>
          <SaveButton type="button" onClick={handleSubmit}>
            <Check weight="bold" />
          </SaveButton>
        </Top>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th> </Th>
                <Th>번호</Th>
                <Th>이름</Th>
                <Th>닉네임</Th>
                <Th>연락처</Th>
                <Th>권한</Th>
                <Th>비밀번호</Th>
              </tr>
            </thead>
            <tbody>
              {roleData?.content.map((item, idx) => (
                <tr key={item.memberId}>
                  <Td>
                    <input
                      type="checkbox"
                      checked={checkedIds.includes(item.memberId)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setCheckedIds((prev) =>
                          isChecked
                            ? [...prev, item.memberId]
                            : prev.filter((id) => id !== item.memberId)
                        );
                      }}
                    />
                  </Td>
                  <Td>{page * (roleData?.size ?? 10) + idx + 1}</Td>
                  <Td>{item.memberName}</Td>
                  <Td>{item.memberNickname}</Td>
                  <Td>{item.memberPhoneNo}</Td>
                  <Td>
                    <RadioGroup>
                      {ROLE_OPTIONS.map((opt) => (
                        <label key={opt.id}>
                          <input
                            type="radio"
                            name={`role-${item.memberId}`}
                            value={opt.id}
                            checked={(roleMap[item.memberId] ?? item.roleId) === opt.id}
                            onChange={() =>
                              setRoleMap((prev) => ({ ...prev, [item.memberId]: opt.id }))
                            }
                          />
                          {opt.label}
                        </label>
                      ))}
                    </RadioGroup>
                  </Td>
                  <Td>
                    <PasswordButton
                      type="button"
                      onClick={() => handleChangePassword(item.memberId, item.memberNickname)}
                    >
                      <Key weight="bold" />
                      변경
                    </PasswordButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {roleData?.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
        </TableWrapper>

        <PaginationWrapper>
          <Pagination
            current={page}
            totalPages={roleData?.totalPages ?? 0}
            onChange={setPage}
          />
        </PaginationWrapper>
      </TableBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  gap: 36px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 120px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(3px);
    transform: scale(1);
  }
`;

const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 0;
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const TableBox = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 24px;
  padding: 24px 8px;
  max-width: 1100px;
  margin: 0 auto;

  @media ${({ theme }) => theme.device.mobile} {
    gap: 16px;
    padding: 16px 4px;
  }
`;

const Top = styled.section`
  display: flex;
  width: 100%;
  position: relative;
  justify-content: space-between;
  align-items: flex-end;
  padding: 24px 0;
  gap: 12px;
  flex-wrap: wrap;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 12px 4px;
    align-items: stretch;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.lineColor};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.colors.blackColor};
  }
`;

const SearchGroup = styled.form`
  display: flex;
  flex: 1;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    flex: 1 1 100%;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.grayColor};
    font-weight: 600;
    padding: 4px;
  }

  input {
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    width: 100%;
    padding: 8px 12px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: ${({ theme }) => theme.colors.whiteColor};
    border-radius: 4px;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
      padding: 10px 12px;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    min-width: 0;
    flex: 1 1 100%;
  }
`;

const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background-color: ${({ theme }) => theme.colors.blackColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.inputColor};

  th,
  td {
    padding: 12px 8px;
    text-align: center;
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    th,
    td {
      padding: 10px 6px;
    }
  }
`;

const Th = styled.th`
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  font-weight: 600;
`;

const Td = styled.td`
  input[type='checkbox'] {
    cursor: pointer;
  }
`;

const RadioGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;

  label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    white-space: nowrap;
  }

  input[type='radio'] {
    cursor: pointer;
  }

  @media ${({ theme }) => theme.device.mobile} {
    gap: 8px;
  }
`;

const PasswordButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: ${({ theme }) => theme.colors.whiteColor};
  color: ${({ theme }) => theme.colors.blackColor};
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.recordBgColor};
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const NoSearchBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 0;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  color: ${({ theme }) => theme.colors.grayColor};
`;

const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 12px;
`;
