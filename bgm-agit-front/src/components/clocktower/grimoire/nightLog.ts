import type { GrimoireState, NightLogEntry } from '../../../types/clocktower.ts';
import type { ShowContent } from './ShowPanels.tsx';

/** 밤 진행 카드가 지금 보고 있는 단계. 그 위에 연 정보 카드에서 보여 줘도 이 단계로 묶는다 */
export interface NightStepContext {
  step: string;
  who: string | null;
}

/**
 * 보여 준 정보를 기록할지. 셋업 중 캐릭터 나눠 줄 때 보여 준 것은 남기지 않는다.
 * 첫날 밤은 첫 단계를 체크하기 전까지 아직 셋업 단계라 밤 진행 카드에서 보여 준 것만 남긴다.
 */
export function shouldLog(state: GrimoireState, step: NightStepContext | null) {
  return state.phase !== 'SETUP' || !!step;
}

export function makeLogEntry(state: GrimoireState, content: ShowContent, step: NightStepContext | null): NightLogEntry {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    day: state.day,
    phase: state.phase === 'SETUP' ? 'NIGHT' : state.phase,
    step: step?.step ?? null,
    who: step?.who ?? null,
    title: content.title,
    big: content.big,
    roles: content.roles.map(r => r.name),
    message: content.message,
    at: new Date().toISOString(),
  };
}

export function logLabel(day: number, phase: NightLogEntry['phase']) {
  if (phase === 'NIGHT') return day === 1 ? '첫날 밤' : `${day}번째 밤`;
  return `${day}일째 낮`;
}

/** 밤·낮 단위로 묶는다(기록 순서 그대로) */
export function groupLogs(logs: NightLogEntry[]) {
  const groups: { label: string; entries: NightLogEntry[] }[] = [];
  for (const e of logs) {
    const label = logLabel(e.day, e.phase);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.entries.push(e);
    else groups.push({ label, entries: [e] });
  }
  return groups;
}

/** 한 줄 요약: "이 중 한 명이 이 캐릭터입니다 — 세탁부 / 3. 철수, 5. 영희" */
export function logSummary(e: NightLogEntry) {
  const parts = [e.big, e.roles.join(', '), e.message].filter(Boolean);
  return parts.join(' / ');
}
