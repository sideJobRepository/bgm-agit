import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../../../utils/axiosInstance.ts';
import { toast } from '../../../utils/toast';
import { showConfirmModal } from '../../confirmAlert.tsx';
import type { GrimoireState } from '../../../types/clocktower.ts';
import { Btn, Hint, Muted, Overlay, Row, Sheet, SheetHead } from './grimoire.styles.ts';
import { BASE, errorMessage, loadSavedGrimoire, type SavedGrimoireItem } from './grimoireSaves.ts';

function formatSavedAt(v: string | null) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * 내 임시저장 목록. [보기](읽기 전용) / [이어서 하기](이 기기 판으로) / [삭제].
 * 마도서 [더보기]와 시작 화면이 같이 쓴다. inline 이면 창이 아니라 그 자리에 목록만 그린다.
 */
export function SavedGrimoireList({
  onView,
  onResume,
  inline,
}: {
  onView: (state: GrimoireState, title: string) => void;
  onResume: (state: GrimoireState) => void;
  inline?: boolean;
}) {
  const [items, setItems] = useState<SavedGrimoireItem[] | null>(null);

  const load = useCallback(() => {
    api
      .get<SavedGrimoireItem[]>(BASE)
      .then(res => setItems(res.data))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = (item: SavedGrimoireItem) =>
    showConfirmModal({
      message: `'${item.title}' 임시저장을 지울까요?`,
      onConfirm: async () => {
        try {
          await api.delete(`${BASE}/${item.id}`);
          load();
        } catch (e) {
          toast.error(errorMessage(e, '지우지 못했습니다.'));
        }
      },
    });

  const open = async (item: SavedGrimoireItem, mode: 'view' | 'resume') => {
    const state = await loadSavedGrimoire(item.id);
    if (!state) return;
    if (mode === 'view') onView(state, item.title);
    else onResume(state);
  };

  if (items == null) return <Muted>불러오는 중…</Muted>;
  if (items.length === 0) return inline ? null : <Muted>임시저장한 마도서가 없습니다.</Muted>;

  return (
    <List>
      {items.map(item => (
        <Item key={item.id}>
          <div>
            <strong>{item.title}</strong>
            <span>
              {item.gameName ?? ''} · {formatSavedAt(item.savedAt)}
            </span>
          </div>
          <Row style={{ gap: 6 }}>
            <Btn type="button" onClick={() => open(item, 'view')}>
              보기
            </Btn>
            <Btn type="button" $tone="primary" onClick={() => open(item, 'resume')}>
              이어서 하기
            </Btn>
            <Btn type="button" $tone="danger" onClick={() => remove(item)}>
              삭제
            </Btn>
          </Row>
        </Item>
      ))}
    </List>
  );
}

/** [더보기] → [저장된 마도서] 창 */
export function SavedGrimoirePanel({
  onView,
  onResume,
  onClose,
}: {
  onView: (state: GrimoireState, title: string) => void;
  onResume: (state: GrimoireState) => void;
  onClose: () => void;
}) {
  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={e => e.stopPropagation()}>
        <SheetHead>
          <h3>저장된 마도서</h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>
        <Hint>[이어서 하기]는 이 기기의 지금 판을 저장된 판으로 바꿉니다. 지금 판도 남기려면 먼저 [임시저장] 하세요.</Hint>
        <SavedGrimoireList onView={onView} onResume={onResume} />
      </Sheet>
    </Overlay>
  );
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const Item = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--ct-line);
  border-radius: 10px;

  > div:first-child {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  strong {
    color: var(--ct-text);
  }
  span {
    font-size: 13px;
    color: var(--ct-muted);
  }
`;
