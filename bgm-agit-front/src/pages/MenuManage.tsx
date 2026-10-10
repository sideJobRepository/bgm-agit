import { Wrapper } from '../styles';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { toast } from '../utils/toast';
import api from '../utils/axiosInstance';
import { useRequest } from '../recoil/useRequest.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { mainMenuState } from '../recoil/state/mainState.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { theme } from '../styles/theme.ts';
import { Box, Notice, Header, FormCard, FormTitle, Field, RowFields, ToggleLabel, RoleChips, RoleChip, FormButtons, PrimaryButton, GhostButton, TreeHeader, TreeTitle, TreeTools, TreeHint, TreeWrap, TreeRow, RowMain, Indent, ToggleButton, LeafMark, NameArea, NameLine, MenuTitle, CountBadge, OffBadge, MetaLine, LinkText, MetaDim, RowActions, RowButton } from './MenuManage.styles.ts';

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

// select > option 안에서는 일반 공백이 접히므로 들여쓰기는 nbsp로 넣는다
const NBSP = String.fromCharCode(160);

interface MenuNode extends MenuOption {
  children: MenuNode[];
  depth: number;
}

/** 같은 depth는 영역/순서(areaId) → ID 순으로 정렬한다 (헤더 노출 순서와 동일) */
function sortNodes(nodes: MenuNode[]) {
  nodes.sort((a, b) => (a.areaId ?? 0) - (b.areaId ?? 0) || a.menuId - b.menuId);
}

/** 평면 목록을 부모-자식 트리로 조립. 부모가 목록에 없는 메뉴는 최상위로 올린다. */
function buildTree(menus: MenuOption[]): MenuNode[] {
  const byId = new Map<number, MenuNode>(
    menus.map(menu => [menu.menuId, { ...menu, children: [], depth: 0 }])
  );

  const roots: MenuNode[] = [];
  byId.forEach(node => {
    const parent = node.parentMenuId != null ? byId.get(node.parentMenuId) : undefined;
    if (parent && parent.menuId !== node.menuId) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const seen = new Set<number>();
  const walk = (nodes: MenuNode[], depth: number) => {
    sortNodes(nodes);
    nodes.forEach(node => {
      node.depth = depth;
      seen.add(node.menuId);
      walk(node.children, depth + 1);
    });
  };
  walk(roots, 0);

  // 부모 참조가 순환하면 어느 root에서도 닿지 않는다. 누락되지 않게 최상위로 끌어올린다.
  byId.forEach(node => {
    if (!seen.has(node.menuId)) {
      node.depth = 0;
      node.children = [];
      roots.push(node);
    }
  });
  sortNodes(roots);

  return roots;
}

/** 자기 자신 + 모든 하위 메뉴 ID (상위 메뉴 선택지에서 제외하는 용도) */
function collectSubtreeIds(node: MenuNode, acc: Set<number> = new Set()): Set<number> {
  acc.add(node.menuId);
  node.children.forEach(child => collectSubtreeIds(child, acc));
  return acc;
}

function flatten(nodes: MenuNode[], collapsed?: Set<number>): MenuNode[] {
  const rows: MenuNode[] = [];
  const walk = (list: MenuNode[]) => {
    list.forEach(node => {
      rows.push(node);
      if (node.children.length > 0 && !collapsed?.has(node.menuId)) {
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return rows;
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
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const tree = useMemo(() => buildTree(options.menus), [options.menus]);
  const rows = useMemo(() => flatten(tree, collapsed), [tree, collapsed]);

  // 상위 메뉴 선택지. 자기 자신과 하위 메뉴를 고르면 트리가 끊기므로 제외한다.
  const parentOptions = useMemo(() => {
    if (editId == null) return flatten(tree);
    const editing = flatten(tree).find(node => node.menuId === editId);
    const banned = editing ? collectSubtreeIds(editing) : new Set<number>([editId]);
    return flatten(tree).filter(node => !banned.has(node.menuId));
  }, [tree, editId]);

  const toggleCollapse = (menuId: number) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const collapseAll = () => setCollapsed(new Set(tree.map(node => node.menuId)));
  const expandAll = () => setCollapsed(new Set());

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

  /** 해당 메뉴를 상위로 잡고 추가 폼을 연다 */
  const startAddChild = (parent: MenuNode) => {
    setEditId(null);
    setForm({ ...EMPTY, parentMenuId: parent.menuId, areaId: parent.children.length + 1 });
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
        <Header bgColor={theme.colors.blueColor}>
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
              {parentOptions.map(node => (
                <option key={node.menuId} value={node.menuId}>
                  {node.depth > 0 ? NBSP.repeat(node.depth * 4) + '\u2514 ' : ''}
                  {node.menuName}
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

        <TreeHeader>
          <TreeTitle>메뉴 구조</TreeTitle>
          <TreeTools>
            <GhostButton type="button" onClick={expandAll}>
              모두 펼치기
            </GhostButton>
            <GhostButton type="button" onClick={collapseAll}>
              모두 접기
            </GhostButton>
          </TreeTools>
        </TreeHeader>

        <TreeHint>
          상위 메뉴는 <strong>하위 메뉴가 하나 이상 있어야</strong> 헤더에 노출됩니다. 같은 단계에서는
          순서(영역/순서 값)가 작은 것부터 표시됩니다.
        </TreeHint>

        <TreeWrap>
          {rows.map(node => {
            const hasChildren = node.children.length > 0;
            const isCollapsed = collapsed.has(node.menuId);

            return (
              <TreeRow key={node.menuId} $depth={node.depth} $editing={editId === node.menuId}>
                <RowMain>
                  <Indent $depth={node.depth}>
                    {hasChildren ? (
                      <ToggleButton
                        type="button"
                        aria-label={isCollapsed ? '펼치기' : '접기'}
                        onClick={() => toggleCollapse(node.menuId)}
                      >
                        {isCollapsed ? '▸' : '▾'}
                      </ToggleButton>
                    ) : (
                      <LeafMark>·</LeafMark>
                    )}
                  </Indent>

                  <NameArea>
                    <NameLine>
                      <MenuTitle $muted={!node.useStatus}>{node.menuName}</MenuTitle>
                      {hasChildren && <CountBadge>하위 {node.children.length}</CountBadge>}
                      {!node.useStatus && <OffBadge>미사용</OffBadge>}
                    </NameLine>
                    <MetaLine>
                      <LinkText $empty={!node.menuLink}>
                        {node.menuLink ?? '링크 없음 (상위 메뉴 전용)'}
                      </LinkText>
                      <MetaDim>
                        순서 {node.areaId ?? '-'} · ID {node.menuId}
                      </MetaDim>
                    </MetaLine>
                  </NameArea>
                </RowMain>

                <RowActions>
                  <RowButton type="button" onClick={() => startAddChild(node)}>
                    하위 추가
                  </RowButton>
                  <RowButton type="button" onClick={() => startEdit(node)}>
                    수정
                  </RowButton>
                  <RowButton type="button" $danger onClick={() => onDelete(node.menuId)}>
                    삭제
                  </RowButton>
                </RowActions>
              </TreeRow>
            );
          })}
          {rows.length === 0 && <Notice>등록된 메뉴가 없습니다.</Notice>}
        </TreeWrap>
      </Box>
    </Wrapper>
  );
}
