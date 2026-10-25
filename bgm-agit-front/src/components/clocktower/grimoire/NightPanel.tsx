import { useMemo, useState } from 'react';
import type { GrimoireState, NightTab } from '../../../types/clocktower.ts';
import { renderNightText } from '../../../utils/clocktowerText.tsx';
import { nightItems, type NightItem } from './grimoireRules.ts';
import {
  Btn,
  Muted,
  NightBody,
  NightCard,
  NightNav,
  NightRow,
  NightStepNo,
  NightText,
  NightTitle,
  NightWho,
  Overlay,
  Row,
  Sheet,
  SheetHead,
  Tab,
} from './grimoire.styles.ts';

function whoLabel(item: NightItem) {
  if (item.seats.length === 0) return '';
  return item.seats.map(s => `${s.name}${s.dead ? '(사망)' : ''}`).join(', ');
}

/** 밤 순서 체크리스트: 지금 게임에 있는 캐릭터만, 죽은 캐릭터는 흐리게 */
export function NightList({
  state,
  onTab,
  onToggle,
  onClear,
  onOpenMode,
}: {
  state: GrimoireState;
  onTab: (tab: NightTab) => void;
  onToggle: (key: string) => void;
  onClear: () => void;
  onOpenMode: () => void;
}) {
  const items = useMemo(() => nightItems(state, state.nightTab), [state]);
  const checked = new Set(state.nightChecked);

  return (
    <>
      <Row style={{ marginBottom: 8 }}>
        <Tab type="button" $active={state.nightTab === 'first'} onClick={() => onTab('first')}>
          첫날 밤
        </Tab>
        <Tab type="button" $active={state.nightTab === 'other'} onClick={() => onTab('other')}>
          그 외 밤
        </Tab>
        <Btn type="button" $tone="primary" onClick={onOpenMode} disabled={!items.length} style={{ marginLeft: 'auto' }}>
          밤 진행
        </Btn>
        <Btn type="button" onClick={onClear}>
          체크 비우기
        </Btn>
      </Row>
      {items.length === 0 ? (
        <Muted>캐릭터를 배정하면 깨울 순서가 나옵니다.</Muted>
      ) : (
        items.map(item => (
          <NightRow key={item.key} $done={checked.has(item.key)} $muted={item.allDead}>
            <input type="checkbox" checked={checked.has(item.key)} onChange={() => onToggle(item.key)} />
            <NightBody>
              <b>{item.role.name}</b>
              {item.seats.length > 0 && <small>{whoLabel(item)}</small>}
              {item.text && <div>{renderNightText(item.text)}</div>}
            </NightBody>
          </NightRow>
        ))
      )}
    </>
  );
}

/** 밤 진행 모드: 한 장씩 크게 보여주고 넘길 때마다 체크한다 */
export function NightMode({
  state,
  onCheck,
  onClose,
}: {
  state: GrimoireState;
  onCheck: (key: string) => void;
  onClose: () => void;
}) {
  const items = useMemo(() => nightItems(state, state.nightTab), [state]);
  const checked = new Set(state.nightChecked);
  const firstOpen = Math.max(
    0,
    items.findIndex(i => !checked.has(i.key))
  );
  const [index, setIndex] = useState(firstOpen);
  const item = items[Math.min(index, items.length - 1)];

  if (!item) return null;

  const next = () => {
    if (!checked.has(item.key)) onCheck(item.key);
    if (index >= items.length - 1) onClose();
    else setIndex(index + 1);
  };

  return (
    <Overlay>
      <Sheet $wide>
        <SheetHead>
          <h3>{state.nightTab === 'first' ? '첫날 밤' : `${state.day}번째 밤`}</h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>
        <NightCard>
          <NightStepNo>
            {index + 1} / {items.length}
            {checked.has(item.key) ? ' · 완료' : ''}
          </NightStepNo>
          <NightTitle>{item.role.name}</NightTitle>
          {item.seats.length > 0 && (
            <NightWho>
              {whoLabel(item)}
              {item.allDead ? ' — 죽은 캐릭터는 보통 깨우지 않습니다' : ''}
            </NightWho>
          )}
          <NightText>{renderNightText(item.text)}</NightText>
          <NightNav>
            <Btn type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
              ◀ 이전
            </Btn>
            <Btn type="button" $tone="primary" onClick={next}>
              {/* 낮으로 넘기는 건 도구막대 [밤 끝내기]다. 여기서는 창만 닫는다 */}
              {index >= items.length - 1 ? '완료 · 닫기' : '완료 · 다음 ▶'}
            </Btn>
          </NightNav>
        </NightCard>
      </Sheet>
    </Overlay>
  );
}
