// 머더 게임 표지 넣기 공용(게임 등록 폼·표지 정리 화면)

// 머미로그 후보에 없을 때 직접 찾는 곳. 게임명 검색 화면만 열어 준다(표지 고르기는 사람이 한다)
export const COVER_SEARCH_SITES = [
  { label: '텀블벅에서 찾기', url: (q: string) => `https://tumblbug.com/search?query=${q}` },
  { label: '구글 이미지에서 찾기', url: (q: string) => `https://www.google.com/search?tbm=isch&q=${q}` },
];

// 클립보드·드래그로 들어온 것 중 첫 이미지 파일
export function firstImageFile(items: DataTransferItemList | undefined): File | null {
  if (!items) return null;
  for (const item of Array.from(items)) {
    if (item.kind === 'file' && item.type.startsWith('image/')) return item.getAsFile();
  }
  return null;
}
