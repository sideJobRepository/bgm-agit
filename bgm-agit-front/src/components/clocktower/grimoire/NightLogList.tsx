import styled from 'styled-components';
import type { NightLogEntry } from '../../../types/clocktower.ts';
import { Muted } from './grimoire.styles.ts';
import { groupLogs, logSummary } from './nightLog.ts';

/**
 * 보여 준 정보 기록. 진행 화면 사이드 탭과 읽기 전용 마도서(임시저장·끝난 기록)가 같이 쓴다.
 * onDelete 를 주면 줄마다 지우기 — 잘못 누른 보여주기를 걷어낸다.
 */
export default function NightLogList({
  logs,
  onDelete,
}: {
  logs: NightLogEntry[];
  onDelete?: (id: string) => void;
}) {
  if (logs.length === 0) {
    return <Muted>밤 진행이나 정보 카드에서 [보여주기]를 누르면 여기에 남습니다.</Muted>;
  }
  return (
    <>
      {groupLogs(logs).map(g => (
        <Group key={g.label + g.entries[0].id}>
          <h4>{g.label}</h4>
          {g.entries.map(e => (
            <Entry key={e.id}>
              <div>
                {e.step && (
                  <b>
                    {e.step}
                    {e.who ? ` · ${e.who}` : ''}
                  </b>
                )}
                {e.title && <span>{e.title}</span>}
                {logSummary(e) && <strong>{logSummary(e)}</strong>}
              </div>
              {onDelete && (
                <button type="button" aria-label="이 기록 지우기" onClick={() => onDelete(e.id)}>
                  ✕
                </button>
              )}
            </Entry>
          ))}
        </Group>
      ))}
    </>
  );
}

const Group = styled.section`
  margin-bottom: 14px;

  h4 {
    margin: 0 0 6px;
    font-size: 14px;
    color: var(--ct-accent);
  }
`;

const Entry = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 10px;
  margin-bottom: 6px;
  border: 1px solid var(--ct-line);
  border-radius: 8px;
  background: var(--ct-surface-2);

  > div {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  b {
    font-size: 13px;
    color: var(--ct-muted);
  }
  span {
    font-size: 13px;
  }
  strong {
    font-size: 15px;
    word-break: keep-all;
  }
  button {
    flex: none;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--ct-muted);
    cursor: pointer;
  }
`;
