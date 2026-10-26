import api from '../../../utils/axiosInstance.ts';
import { toast } from '../../../utils/toast';
import type { GrimoireState } from '../../../types/clocktower.ts';
import { restoreSaved } from './useGrimoire.ts';

/** 마도서 임시저장 API(SavedGrimoires 화면과 마도서 [임시저장]이 같이 쓴다) */
export const BASE = '/bgm-agit/clocktower-grimoire-saves';

export interface SavedGrimoireItem {
  id: number;
  gameId: number | null;
  gameName: string | null;
  title: string;
  savedAt: string | null;
}

export function errorMessage(e: unknown, fallback: string) {
  return (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

/**
 * 마도서를 서버에 임시저장한다. 같은 판(serverSaveId)이면 덮어쓴다. 저장 id 를 돌려준다.
 * 휴대폰 세션은 빼고 올린다 — 다른 기기에서 이어서 하면 그 세션은 이미 이 기기 것이 아니다.
 */
export async function saveGrimoireToServer(state: GrimoireState, title: string): Promise<number | null> {
  try {
    const { data } = await api.post<{ id: number }>(BASE, {
      id: state.serverSaveId ?? null,
      gameId: state.data.gameId,
      title,
      state: JSON.stringify({ ...state, clocktowerSession: null }),
    });
    return data.id;
  } catch (e) {
    toast.error(errorMessage(e, '임시저장하지 못했습니다.'));
    return null;
  }
}

/** 저장된 마도서 하나를 받아 판으로 되살린다 */
export async function loadSavedGrimoire(id: number): Promise<GrimoireState | null> {
  try {
    const { data } = await api.get<{ state: string }>(`${BASE}/${id}`);
    const state = restoreSaved(data.state);
    if (!state) toast.error('저장된 마도서를 읽지 못했습니다.');
    return state ? { ...state, serverSaveId: id } : null;
  } catch (e) {
    toast.error(errorMessage(e, '저장된 마도서를 불러오지 못했습니다.'));
    return null;
  }
}

