// 탭마다 1회 생성되는 식별자. BroadcastChannel 자기 메시지 필터링용.
export const TAB_ID = (() => {
  if (typeof window === 'undefined') return '';
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
})();
