'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Check, MagnifyingGlass } from 'phosphor-react';
import { withBasePath } from '@/lib/path';
import api from '@/lib/axiosInstance';
import { alertDialog } from '@/utils/alert';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface UrlRole {
  urlRoleId: number;
  roleId: number;
  roleName: string;
  resourceId: number;
  path: string;
  httpMethod: HttpMethod;
}

interface RoleOption {
  roleId: number;
  roleName: string;
}

const METHOD_OPTIONS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];

export default function UrlRolePage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');

  const [items, setItems] = useState<UrlRole[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [path, setPath] = useState('/bgm-agit/');
  const [httpMethod, setHttpMethod] = useState<HttpMethod>('GET');
  const [roleId, setRoleId] = useState<number>(1);
  const [keyword, setKeyword] = useState('');

  const fetchUrlRoles = async () => {
    const { data } = await api.get<UrlRole[]>('/bgm-agit/url-roles');
    setItems(data);
  };

  const fetchRoles = async () => {
    const { data } = await api.get<RoleOption[]>('/bgm-agit/url-roles/roles');
    setRoles(data);
    const adminRole = data.find((role) => role.roleName === 'ADMIN');
    if (adminRole) {
      setRoleId(adminRole.roleId);
    } else if (data[0]) {
      setRoleId(data[0].roleId);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUrlRoles();
    fetchRoles();
  }, [user, isAdmin]);

  const filteredItems = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return items;
    return items.filter((item) =>
      [item.path, item.httpMethod, item.roleName].some((value) =>
        value.toLowerCase().includes(trimmed)
      )
    );
  }, [items, keyword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      await alertDialog('로그인이 필요합니다.', 'error');
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      await alertDialog('관리자만 사용할 수 있습니다.', 'error');
      return;
    }

    const trimmedPath = path.trim();
    if (!trimmedPath || trimmedPath === '/bgm-agit/') {
      await alertDialog('허용할 API URL을 입력해주세요.', 'error');
      return;
    }

    await api.post('/bgm-agit/url-roles', {
      path: trimmedPath,
      httpMethod,
      roleId,
    });

    await alertDialog('URL 권한이 저장되었습니다.', 'success');
    setPath('/bgm-agit/');
    await fetchUrlRoles();
  };

  if (user && !isAdmin) {
    return (
      <Wrapper>
        <EmptyBox>관리자만 접근할 수 있습니다.</EmptyBox>
      </Wrapper>
    );
  }

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
          <h1>URL Permission</h1>
          <span>API URL과 역할 권한을 등록합니다.</span>
        </HeroContent>
      </Hero>

      <Content>
        <FormPanel onSubmit={handleSubmit}>
          <Field className="path">
            <label>API URL</label>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/bgm-agit/tournament-settings"
            />
          </Field>
          <Field>
            <label>Method</label>
            <select value={httpMethod} onChange={(e) => setHttpMethod(e.target.value as HttpMethod)}>
              {METHOD_OPTIONS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <label>Role</label>
            <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))}>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>
          </Field>
          <SaveButton type="submit">
            <Check weight="bold" />
          </SaveButton>
        </FormPanel>

        <TopLine>
          <SearchBox>
            <MagnifyingGlass weight="bold" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="URL, Method, Role 검색"
            />
          </SearchBox>
        </TopLine>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>번호</Th>
                <Th>Method</Th>
                <Th>URL</Th>
                <Th>Role</Th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.urlRoleId}>
                  <Td>{index + 1}</Td>
                  <Td>
                    <MethodBadge data-method={item.httpMethod}>{item.httpMethod}</MethodBadge>
                  </Td>
                  <Td className="path">{item.path}</Td>
                  <Td>{item.roleName}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredItems.length === 0 && <EmptyBox>등록된 URL 권한이 없습니다.</EmptyBox>}
        </TableWrapper>
      </Content>
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

const Content = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 8px;
`;

const FormPanel = styled.form`
  display: grid;
  grid-template-columns: minmax(360px, 1fr) 150px 180px 40px;
  gap: 12px;
  align-items: end;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  border-radius: 4px;

  @media ${({ theme }) => theme.device.tablet} {
    grid-template-columns: 1fr 1fr;
  }

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
    padding: 16px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.grayColor};
    font-weight: 600;
  }

  input,
  select {
    width: 100%;
    height: 38px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.whiteColor};
    color: ${({ theme }) => theme.colors.inputColor};
    padding: 0 10px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
    }
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
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

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    border-radius: 4px;
  }
`;

const TopLine = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SearchBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 320px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.whiteColor};

  input {
    width: 100%;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
    }
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.grayColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  min-width: 760px;
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

  td.path {
    text-align: left;
    font-family: Consolas, Monaco, monospace;
  }
`;

const Th = styled.th`
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  font-weight: 600;
`;

const Td = styled.td``;

const MethodBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.blackColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  font-weight: 700;

  &[data-method='POST'] {
    background: #4a90e2;
  }

  &[data-method='PUT'] {
    background: #7d6abf;
  }

  &[data-method='DELETE'] {
    background: #d9625e;
  }
`;

const EmptyBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 160px;
  padding: 40px 0;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  color: ${({ theme }) => theme.colors.grayColor};
`;
