'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Check, MagnifyingGlass, PencilSimple, Plus, Trash, X } from 'phosphor-react';
import api from '@/lib/axiosInstance';
import { alertDialog, confirmDialog } from '@/utils/alert';
import { useUserStore } from '@/store/user';
import { useKmlMenuStore } from '@/store/menu';
import { useRouter } from 'next/navigation';

interface MenuOption {
  menuId: number;
  parentMenuId: number | null;
  menuName: string;
  menuLink: string | null;
  menuOrders: number;
  icon: string;
  roleIds: number[];
}

interface RoleOption {
  roleId: number;
  roleName: string;
}

interface MenuCreateOptions {
  menus: MenuOption[];
  roles: RoleOption[];
}

interface ApiResponse {
  message: string;
}

const ICON_OPTIONS = [
  'Gear',
  'Bell',
  'BookOpen',
  'CalendarBlank',
  'Crown',
  'ChartLineUp',
  'SlidersHorizontal',
  'PencilSimple',
  'List',
  'GraduationCap',
  'Compass',
  'Student',
  'Handshake',
  'ChatsCircle',
  'Trophy',
];

export default function MenuCreatePage() {
  const user = useUserStore((state) => state.user);
  const setMenu = useKmlMenuStore((state) => state.setMenu);
  const router = useRouter();
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');

  const [menus, setMenus] = useState<MenuOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [editMenuId, setEditMenuId] = useState<number | null>(null);
  const [parentMenuId, setParentMenuId] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuLink, setMenuLink] = useState('');
  const [menuOrders, setMenuOrders] = useState(1);
  const [icon, setIcon] = useState('Gear');
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback((defaultRoles: RoleOption[] = roles) => {
    const adminRole = defaultRoles.find((role) => role.roleName === 'ADMIN');
    setEditMenuId(null);
    setParentMenuId('');
    setMenuName('');
    setMenuLink('');
    setMenuOrders(1);
    setIcon('Gear');
    setRoleIds(adminRole ? [adminRole.roleId] : []);
  }, [roles]);

  const fetchOptions = useCallback(async () => {
    const { data } = await api.get<MenuCreateOptions>('/bgm-agit/menu-create/options');
    const visibleRoles = data.roles.filter((role) => !role.roleName.toUpperCase().includes('TEMP'));
    setMenus(data.menus);
    setRoles(visibleRoles);
    setRoleIds((prev) => {
      if (prev.length > 0) return prev.filter((id) => visibleRoles.some((role) => role.roleId === id));
      const adminRole = visibleRoles.find((role) => role.roleName === 'ADMIN');
      return adminRole ? [adminRole.roleId] : [];
    });
  }, []);

  const refreshSidebarMenu = async () => {
    const { data } = await api.get('/bgm-agit/kml-menu');
    setMenu(data);
  };

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) return;
    fetchOptions();
  }, [user, isAdmin, fetchOptions]);

  const filteredMenus = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return menus;
    return menus.filter((menu) =>
      [menu.menuName, menu.menuLink ?? '', menu.icon].some((value) =>
        value.toLowerCase().includes(trimmed)
      )
    );
  }, [menus, keyword]);

  const parentMenuOptions = useMemo(
    () => menus.filter((menu) => menu.menuId !== editMenuId),
    [menus, editMenuId]
  );

  const toggleRole = (roleId: number) => {
    setRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const startEdit = (menu: MenuOption) => {
    setEditMenuId(menu.menuId);
    setParentMenuId(menu.parentMenuId ? String(menu.parentMenuId) : '');
    setMenuName(menu.menuName);
    setMenuLink(menu.menuLink ?? '');
    setMenuOrders(menu.menuOrders);
    setIcon(menu.icon || 'Gear');
    setRoleIds(menu.roleIds.filter((id) => roles.some((role) => role.roleId === id)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reloadAfterChange = async () => {
    await fetchOptions();
    await refreshSidebarMenu();
  };

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

    if (!menuName.trim()) {
      await alertDialog('메뉴명을 입력해주세요.', 'error');
      return;
    }

    if (roleIds.length === 0) {
      await alertDialog('메뉴 권한을 선택해주세요.', 'error');
      return;
    }

    const payload = {
      parentMenuId: parentMenuId ? Number(parentMenuId) : null,
      menuName: menuName.trim(),
      menuLink: menuLink.trim() || null,
      menuOrders,
      icon,
      roleIds,
    };

    setSaving(true);
    try {
      const request = editMenuId
        ? api.put<ApiResponse>(`/bgm-agit/menu-create/${editMenuId}`, payload)
        : api.post<ApiResponse>('/bgm-agit/menu-create', payload);
      const { data } = await request;

      await alertDialog(data.message || '메뉴가 저장되었습니다.', 'success');
      resetForm();
      await reloadAfterChange();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menu: MenuOption) => {
    const result = await confirmDialog(`${menu.menuName} 메뉴를 삭제할까요?`, 'warning');
    if (!result.isConfirmed) return;

    const { data } = await api.delete<ApiResponse>(`/bgm-agit/menu-create/${menu.menuId}`);
    await alertDialog(data.message || '메뉴가 삭제되었습니다.', 'success');
    if (editMenuId === menu.menuId) resetForm();
    await reloadAfterChange();
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
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
        />
        <HeroContent>
          <h1>Menu Manager</h1>
          <span>BML 메뉴와 노출 권한을 관리합니다.</span>
        </HeroContent>
      </Hero>

      <Content>
        <EditorPanel onSubmit={handleSubmit}>
          <PanelHeader>
            <div>
              <strong>{editMenuId ? '메뉴 수정' : '메뉴 등록'}</strong>
              <span>{editMenuId ? `${menuName} 수정 중` : '링크를 비우면 상위 메뉴로 저장됩니다.'}</span>
            </div>
            <HeaderActions>
              {editMenuId && (
                <SecondaryButton type="button" onClick={() => resetForm()}>
                  <X weight="bold" />
                  취소
                </SecondaryButton>
              )}
              <PrimaryButton type="submit" disabled={saving}>
                {editMenuId ? <Check weight="bold" /> : <Plus weight="bold" />}
                {editMenuId ? '수정 저장' : '메뉴 저장'}
              </PrimaryButton>
            </HeaderActions>
          </PanelHeader>

          <FieldGrid>
            <Field>
              <label>상위 메뉴</label>
              <select value={parentMenuId} onChange={(e) => setParentMenuId(e.target.value)}>
                <option value="">없음</option>
                {parentMenuOptions.map((menu) => (
                  <option key={menu.menuId} value={menu.menuId}>
                    {menu.menuName} ({menu.menuLink ?? '링크 없음'})
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <label>메뉴명</label>
              <input
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="메뉴 생성"
              />
            </Field>
            <Field>
              <label>링크</label>
              <input
                value={menuLink}
                onChange={(e) => setMenuLink(e.target.value)}
                placeholder="상위 메뉴면 비워두기"
              />
            </Field>
            <Field className="short">
              <label>순서</label>
              <input
                type="number"
                min="0"
                value={menuOrders}
                onChange={(e) => setMenuOrders(Number(e.target.value))}
              />
            </Field>
            <Field>
              <label>아이콘</label>
              <select value={icon} onChange={(e) => setIcon(e.target.value)}>
                {ICON_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGrid>

          <RoleBlock>
            <RoleTitle>권한</RoleTitle>
            <RoleList>
              {roles.map((role) => (
                <RoleChip key={role.roleId} $checked={roleIds.includes(role.roleId)}>
                  <input
                    type="checkbox"
                    checked={roleIds.includes(role.roleId)}
                    onChange={() => toggleRole(role.roleId)}
                  />
                  {role.roleName}
                </RoleChip>
              ))}
            </RoleList>
          </RoleBlock>
        </EditorPanel>

        <TopLine>
          <ResultText>총 {filteredMenus.length}개 메뉴</ResultText>
          <SearchBox>
            <MagnifyingGlass weight="bold" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="메뉴명, 링크, 아이콘 검색"
            />
          </SearchBox>
        </TopLine>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>번호</Th>
                <Th>상위</Th>
                <Th>메뉴명</Th>
                <Th>링크</Th>
                <Th>순서</Th>
                <Th>아이콘</Th>
                <Th>관리</Th>
              </tr>
            </thead>
            <tbody>
              {filteredMenus.map((menu, index) => (
                <tr key={menu.menuId}>
                  <Td data-label="번호">{index + 1}</Td>
                  <Td data-label="상위">
                    {menus.find((item) => item.menuId === menu.parentMenuId)?.menuName ?? '-'}
                  </Td>
                  <Td data-label="메뉴명">{menu.menuName}</Td>
                  <Td data-label="링크" className="path">
                    {menu.menuLink ?? '-'}
                  </Td>
                  <Td data-label="순서">{menu.menuOrders}</Td>
                  <Td data-label="아이콘">{menu.icon}</Td>
                  <Td data-label="관리">
                    <RowActions>
                      <RowButton type="button" onClick={() => startEdit(menu)} aria-label="메뉴 수정">
                        <PencilSimple weight="bold" />
                      </RowButton>
                      <DangerRowButton type="button" onClick={() => handleDelete(menu)} aria-label="메뉴 삭제">
                        <Trash weight="bold" />
                      </DangerRowButton>
                    </RowActions>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredMenus.length === 0 && <EmptyBox>등록된 메뉴가 없습니다.</EmptyBox>}
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
  gap: 32px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
    gap: 20px;
  }
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(24, 26, 32, 0.92), rgba(31, 78, 91, 0.82)),
    url('/record/write.jpg') center / cover;

  @media ${({ theme }) => theme.device.mobile} {
    height: 112px;
  }
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
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
    font-size: ${({ theme }) => theme.desktop.sizes.lg};
    font-weight: 600;
    opacity: 0.86;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.md};
    }
  }
`;

const Content = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 8px 32px;

  @media ${({ theme }) => theme.device.tablet} {
    padding: 0 14px 32px;
  }
`;

const EditorPanel = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  border-radius: 6px;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.inputColor};
    font-size: ${({ theme }) => theme.desktop.sizes.lg};
    font-weight: 800;
  }

  span {
    display: block;
    margin-top: 4px;
    color: ${({ theme }) => theme.colors.grayColor};
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  @media ${({ theme }) => theme.device.mobile} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 1fr) minmax(160px, 1fr) minmax(220px, 1.4fr) 90px minmax(150px, 1fr);
  gap: 12px;

  @media ${({ theme }) => theme.device.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.grayColor};
    font-weight: 700;
  }

  input,
  select {
    width: 100%;
    height: 40px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.whiteColor};
    color: ${({ theme }) => theme.colors.inputColor};
    padding: 0 10px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;

    @media ${({ theme }) => theme.device.mobile} {
      height: 42px;
      font-size: 16px;
    }
  }
`;

const RoleBlock = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: start;
  padding: 14px;
  background: ${({ theme }) => theme.colors.whiteColor};
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const RoleTitle = styled.div`
  color: ${({ theme }) => theme.colors.grayColor};
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  font-weight: 800;
  line-height: 30px;
`;

const RoleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const RoleChip = styled.label<{ $checked: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid ${({ $checked, theme }) => ($checked ? theme.colors.inputColor : theme.colors.lineColor)};
  border-radius: 4px;
  background: ${({ $checked, theme }) => ($checked ? theme.colors.inputColor : theme.colors.whiteColor)};
  color: ${({ $checked, theme }) => ($checked ? theme.colors.whiteColor : theme.colors.inputColor)};
  white-space: nowrap;
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  cursor: pointer;

  input {
    accent-color: ${({ theme }) => theme.colors.inputColor};
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  font-weight: 800;
  cursor: pointer;

  svg {
    width: 15px;
    height: 15px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`;

const PrimaryButton = styled(ActionButton)`
  border: none;
  background-color: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
`;

const SecondaryButton = styled(ActionButton)`
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  background-color: ${({ theme }) => theme.colors.whiteColor};
  color: ${({ theme }) => theme.colors.inputColor};
`;

const TopLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ResultText = styled.div`
  color: ${({ theme }) => theme.colors.grayColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  font-weight: 700;
`;

const SearchBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 320px;
  height: 40px;
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
  min-width: 860px;
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

  @media ${({ theme }) => theme.device.mobile} {
    min-width: 0;

    thead {
      display: none;
    }

    tbody {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    tr {
      display: grid;
      grid-template-columns: 1fr;
      padding: 12px;
      border: 1px solid ${({ theme }) => theme.colors.lineColor};
      border-radius: 4px;
      background: ${({ theme }) => theme.colors.whiteColor};
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
      text-align: right;
      word-break: break-word;
    }

    td:last-child {
      border-bottom: none;
    }

    td::before {
      content: attr(data-label);
      flex: 0 0 64px;
      text-align: left;
      color: ${({ theme }) => theme.colors.grayColor};
      font-weight: 700;
    }

    td.path {
      text-align: right;
      font-size: ${({ theme }) => theme.desktop.sizes.xs};
    }
  }
`;

const Th = styled.th`
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  font-weight: 700;
`;

const Td = styled.td``;

const RowActions = styled.div`
  display: inline-flex;
  justify-content: center;
  gap: 6px;
`;

const RowButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.whiteColor};
  color: ${({ theme }) => theme.colors.inputColor};
  cursor: pointer;

  svg {
    width: 15px;
    height: 15px;
  }
`;

const DangerRowButton = styled(RowButton)`
  color: #d9625e;
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
