import type { WinDecision, WinVerdict, Team } from './winCheck.ts';
import { Btn, Row, Warn } from './grimoire.styles.ts';

const DECISION_LABEL: Record<WinDecision, string> = {
  SCARLET_WOMAN: '탕녀 승계 여부',
  IMP_STARPASS: '임프 자결 승계 대상',
  MASTERMIND_DAY: '주모자 하루 더',
  IMPAIRED_UNKNOWN: '취함·중독 여부',
};

const CONFIDENCE_LABEL = { high: '확실', medium: '확인 필요', low: '불확실' } as const;

/**
 * 승패 제안 배너(이야기꾼 화면 전용 — 낮 화면에서는 그리지 않는다).
 * 게임을 끝내지 않는다. 근거를 보여 주고 이야기꾼이 [종료]나 [계속]을 고른다.
 */
export default function WinBanner({
  verdict,
  onEnd,
  onContinue,
}: {
  verdict: WinVerdict;
  onEnd: (team: Team) => void;
  onContinue: () => void;
}) {
  const { winner, winnerBeforeHeretic, reasons, blockedBy, decisions } = verdict;
  return (
    <Warn>
      <b>
        {winner
          ? `확인 필요: ${winner === 'GOOD' ? '선한 팀' : '악한 팀'} 승리일 수 있습니다`
          : '확인 필요: 이야기꾼이 정할 것이 있습니다'}
      </b>
      {winner && winnerBeforeHeretic && winner !== winnerBeforeHeretic && (
        <div>배교자 반전 적용 전: {winnerBeforeHeretic === 'GOOD' ? '선' : '악'} 승리</div>
      )}
      <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
        {reasons.map((r, i) => (
          <li key={`${r.ruleKey}-${i}`}>
            {r.text} <i>“{r.quote}”</i>{' '}
            <a href={r.sourceUrl} target="_blank" rel="noreferrer">
              근거
            </a>{' '}
            ({CONFIDENCE_LABEL[r.confidence]})
          </li>
        ))}
        {blockedBy.map(b => (
          <li key={`block-${b.ruleKey}`}>막힘: {b.text}</li>
        ))}
      </ul>
      {decisions.length > 0 && (
        <div>이야기꾼이 정할 것: {decisions.map(d => DECISION_LABEL[d]).join(', ')}</div>
      )}
      <Row style={{ marginTop: 8 }}>
        <Btn
          type="button"
          $tone={winner === 'GOOD' ? 'primary' : undefined}
          onClick={() => onEnd('GOOD')}
        >
          선한 팀 승리로 종료
        </Btn>
        <Btn
          type="button"
          $tone={winner === 'EVIL' ? 'primary' : undefined}
          onClick={() => onEnd('EVIL')}
        >
          악한 팀 승리로 종료
        </Btn>
        <Btn type="button" onClick={onContinue}>
          계속
        </Btn>
      </Row>
    </Warn>
  );
}
