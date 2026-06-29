import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance';
import { useRequest } from '../recoil/useRequest.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { mainMenuState } from '../recoil/state/mainState.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';

interface MenuOption {
  menuId: number;
  parentMenuId: number | null;
  menuName: string;
  menuLink: string | null;
  areaId: number | null;
  useStatus: boolean;
  roleIds: number[];
}
interface RoleOption {
  roleId: number;
  roleName: string;
}
interface OptionsResponse {
  menus: MenuOption[];
  roles: RoleOption[];
}
interface ApiResponse {
  code: number;
  success: boolean;
  message: string;
}

interface FormState {
  parentMenuId: number | null;
  menuName: string;
  menuLink: string;
  areaId: number;
  useStatus: boolean;
  roleIds: number[];
}

const EMPTY: FormState = {
  parentMenuId: null,
  menuName: '',
  menuLink: '',
  areaId: 1,
  useStatus: true,
  roleIds: [],
};

export default function MenuManage() {
  const { request } = useRequest();
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');
  const setMainMenu = useSetRecoilState(mainMenuState);

  const [options, setOptions] = useState<OptionsResponse>({ menus: [], roles: [] });
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);

  const loadOptions = () => {
    request(() => api.get('/bgm-agit/main-menu/options').then(res => res.data), setOptions, {
      ignoreHttpError: true,
    });
  };

  const refreshHeaderMenu = () => {
    request(() => api.get('/bgm-agit/main-menu').then(res => res.data), setMainMenu, {
      ignoreHttpError: true,
    });
  };

  useEffect(() => {
    if (isAdmin) loadOptions();
  }, [isAdmin]);

  const resetForm = () => {
    setForm(EMPTY);
    setEditId(null);
  };

  const toggleRole = (roleId: number) => {
    setForm(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const startEdit = (m: MenuOption) => {
    setEditId(m.menuId);
    setForm({
      parentMenuId: m.parentMenuId,
      menuName: m.menuName,
      menuLink: m.menuLink ?? '',
      areaId: m.areaId ?? 1,
      useStatus: m.useStatus ?? true,
      roleIds: m.roleIds ?? [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSave = () => {
    if (!form.menuName.trim()) {
      toast.error('메뉴명을 입력하세요.');
      return;
    }
    if (form.roleIds.length === 0) {
      toast.error('권한을 한 개 이상 선택하세요.');
      return;
    }
    const body = {
      parentMenuId: form.parentMenuId,
      menuName: form.menuName.trim(),
      menuLink: form.menuLink.trim() || null,
      areaId: form.areaId,
      useStatus: form.useStatus,
      roleIds: form.roleIds,
    };

    const after = (data: unknown) => {
      const res = data as unknown as ApiResponse;
      toast.success(res?.message ?? '저장되었습니다.');
      resetForm();
      loadOptions();
      refreshHeaderMenu();
    };

    if (editId != null) {
      update({ url: `/bgm-agit/main-menu/${editId}`, body, ignoreHttpError: true, onSuccess: after });
    } else {
      insert({ url: '/bgm-agit/main-menu', body, ignoreHttpError: true, onSuccess: after });
    }
  };

  const onDelete = (menuId: number) => {
    showConfirmModal({
      message: '이 메뉴를 삭제하시겠습니까?',
      onConfirm: () =>
        remove({
          url: `/bgm-agit/main-menu/${menuId}`,
          ignoreHttpError: true,
          onSuccess: data => {
            const res = data as unknown as ApiResponse;
            toast.success(res?.message ?? '삭제되었습니다.');
            if (editId === menuId) resetForm();
            loadOptions();
            refreshHeaderMenu();
          },
        }),
    });
  };

  const menuName = (id: number | null) =>
    id == null ? '-' : options.menus.find(m => m.menuId === id)?.menuName ?? '-';

  if (!isAdmin) {
    return (
      <Wrapper>
        <Box>
          <Notice>접근 권한이 없습니다.</Notice>
        </Box>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Box>
        <Header bgColor="#093A6E">
          <h2>Menu</h2>
          <p>헤더 메뉴를 추가·수정·삭제합니다.</p>
        </Header>

        <FormCard>
          <FormTitle>{editId != null ? '메뉴 수정' : '메뉴 추가'}</FormTitle>
          <Field>
            <label>상위 메뉴</label>
            <select
              value={form.parentMenuId ?? ''}
              onChange={e => setForm({ ...form, parentMenuId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">없음 (최상위)</option>
              {options.menus
                .filter(m => m.menuId !== editId)
                .map(m => (
                  <option key={m.menuId} value={m.menuId}>
                    {m.menuName}
                  </option>
                ))}
            </select>
          </Field>
          <Field>
            <label>메뉴명</label>
            <input value={form.menuName} onChange={e => setForm({ ...form, menuName: e.target.value })} />
          </Field>
          <Field>
            <label>링크 (비우면 상위 메뉴 전용)</label>
            <input
              value={form.menuLink}
              placeholder="/murder-games"
              onChange={e => setForm({ ...form, menuLink: e.target.value })}
            />
          </Field>
          <RowFields>
            <Field>
              <label>영역/순서</label>
              <input
                type="number"
                value={form.areaId}
                onChange={e => setForm({ ...form, areaId: Number(e.target.value) })}
              />
            </Field>
            <Field>
              <label>사용 여부</label>
              <ToggleLabel>
                <input
                  type="checkbox"
                  checked={form.useStatus}
                  onChange={e => setForm({ ...form, useStatus: e.target.checked })}
                />
                {form.useStatus ? '사용' : '미사용'}
              </ToggleLabel>
            </Field>
          </RowFields>
          <Field>
            <label>권한</label>
            <RoleChips>
              {options.roles.map(r => (
                <RoleChip key={r.roleId} $checked={form.roleIds.includes(r.roleId)}>
                  <input
                    type="checkbox"
                    checked={form.roleIds.includes(r.roleId)}
                    onChange={() => toggleRole(r.roleId)}
                  />
                  {r.roleName}
                </RoleChip>
              ))}
            </RoleChips>
          </Field>
          <FormButtons>
            {editId != null && <GhostButton onClick={resetForm}>취소</GhostButton>}
            <PrimaryButton onClick={onSave}>{editId != null ? '수정 저장' : '추가'}</PrimaryButton>
          </FormButtons>
        </FormCard>

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>상위</th>
                <th>메뉴명</th>
                <th>링크</th>
                <th>순서</th>
                <th>사용</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {options.menus.map(m => (
                <tr key={m.menuId}>
                  <td>{m.menuId}</td>
                  <td>{menuName(m.parentMenuId)}</td>
                  <td>{m.menuName}</td>
                  <td>{m.menuLink ?? '-'}</td>
                  <td>{m.areaId ?? '-'}</td>
                  <td>{m.useStatus ? 'O' : 'X'}</td>
                  <td>
                    <RowButton onClick={() => startEdit(m)}>수정</RowButton>
                    <RowButton $danger onClick={() => onDelete(m.menuId)}>
                      삭제
                    </RowButton>
                  </td>
                </tr>
              ))}
              {options.menus.length === 0 && (
                <tr>
                  <td colSpan={7}>등록된 메뉴가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>
      </Box>
    </Wrapper>
  );
}

const Box = styled.div`
  padding: 10px;
`;

const Notice = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #757575;
`;

const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  background: ${({ bgColor }) => bgColor};
  color: #fff;
  padding: 20px;
  h2 {
    font-family: 'Bungee', sans-serif;
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: 6px;
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const FormCard = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  padding: 18px;
  margin: 20px 0;
`;

const FormTitle = styled.h3<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  label {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: ${({ theme }) => theme.weight.semiBold};
    color: ${({ theme }) => theme.colors.navColor};
  }
  input,
  select {
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 6px;
    font-size: 16px;
    width: 100%;
  }
`;

const RowFields = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: 844px) {
    flex-direction: column;
  }
`;

const ToggleLabel = styled.label<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  padding: 8px 0;
  input {
    width: auto;
    accent-color: #093a6e;
  }
`;

const RoleChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const RoleChip = styled.label<{ $checked: boolean } & WithTheme>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.small};
  border: 1px solid ${({ $checked }) => ($checked ? '#093A6E' : '#D9D9D9')};
  background: ${({ $checked }) => ($checked ? '#093A6E' : '#fff')};
  color: ${({ $checked }) => ($checked ? '#fff' : '#424548')};
  input {
    accent-color: #fff;
  }
`;

const FormButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const PrimaryButton = styled.button<WithTheme>`
  padding: 10px 22px;
  background: #093a6e;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;
`;

const GhostButton = styled.button<WithTheme>`
  padding: 10px 22px;
  background: #fff;
  color: #424548;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  cursor: pointer;
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table<WithTheme>`
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.small};
  th,
  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
    padding: 12px;
    text-align: center;
  }
  th {
    background: ${({ theme }) => theme.colors.basicColor};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;

const RowButton = styled.button<{ $danger?: boolean } & WithTheme>`
  margin: 0 3px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  background: ${({ $danger }) => ($danger ? '#FF5E57' : '#988271')};
`;
