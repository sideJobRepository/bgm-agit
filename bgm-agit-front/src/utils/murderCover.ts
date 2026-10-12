// 머더 게임 표지 넣기 공용(게임 상세·등록 폼·표지 정리 화면)
import api from './axiosInstance';
import type { MurderCoverCandidate } from '../types/murder.ts';

// 머미로그 후보에 없을 때 직접 찾는 곳. 게임명 검색 화면만 열어 준다(표지 고르기는 사람이 한다)
export const COVER_SEARCH_SITES = [
  { label: '텀블벅', url: (q: string) => `https://tumblbug.com/search?query=${q}` },
  { label: '구글 이미지', url: (q: string) => `https://www.google.com/search?tbm=isch&q=${q}` },
];

// 클립보드·드래그로 들어온 것 중 첫 이미지 파일. 클립보드 이미지는 이름이 비어 있어 붙여 준다
export function firstImageFile(items: DataTransferItemList | undefined): File | null {
  if (!items) return null;
  for (const item of Array.from(items)) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (!file) return null;
      return file.name ? file : new File([file], `cover.${file.type.split('/')[1] ?? 'png'}`, { type: file.type });
    }
  }
  return null;
}

// 드래그로 들어온 주소(다른 탭의 이미지를 끌어오면 파일이 아니라 주소만 올 때가 있다)
export function droppedUrl(data: DataTransfer | null): string | null {
  const text = (data?.getData('text/uri-list') || data?.getData('text/plain'))?.trim();
  return text && /^https?:\/\//.test(text) ? text : null;
}

export type CoverSource = { file: File } | { url: string; candidate?: MurderCoverCandidate };

/**
 * 표지 하나를 바로 저장한다(PUT /murder-games/{id}/cover). 확인 모달 없이 쓰는 곳에서 부른다.
 * renameToo 면 후보 제목으로 게임명을 바꾸고 인원·시간은 빈 칸만 채운다(서버가 판단)
 */
export async function putCover(gameId: number, source: CoverSource, renameToo = false) {
  const form = new FormData();
  if ('file' in source) {
    form.append('image', source.file);
  } else {
    form.append('imageSourceUrl', source.url);
    const c = source.candidate;
    if (c && renameToo) {
      form.append('name', c.title);
      if (c.minPlayers) form.append('minPlayers', String(c.minPlayers));
      if (c.maxPlayers) form.append('maxPlayers', String(c.maxPlayers));
      if (c.playMinutes) form.append('playMinutes', String(c.playMinutes));
    }
  }
  await api.put(`/bgm-agit/murder-games/${gameId}/cover`, form);
}

export function fetchCoverCandidates(name: string) {
  return api
    .get<MurderCoverCandidate[]>('/bgm-agit/murder-games/cover-candidates', { params: { name } })
    .then(res => res.data ?? []);
}

export function errorMessage(err: unknown, fallback: string) {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}
