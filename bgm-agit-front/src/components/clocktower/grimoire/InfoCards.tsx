import { useMemo, useState } from 'react';
import styled from 'styled-components';
import type { GrimoireRole, GrimoireState } from '../../../types/clocktower.ts';
import { CT_TYPE_COLOR_DARK, CT_TYPE_LABEL } from '../../../config/clocktower.ts';
import { Btn, Chip, Hint, Overlay, PickGrid, PickItem, Row, Sheet, SheetHead, SheetSection, TextInput } from './grimoire.styles.ts';
import { roleMap } from './grimoireRules.ts';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';
import type { ShowContent } from './ShowPanels.tsx';

/**
 * 정보 카드(포켓 그리모어의 info token). 밤에 플레이어에게 문장 + 캐릭터·플레이어를 전체 화면으로 보여준다.
 * 이야기꾼이 손짓·귓속말로 하던 것을 화면 한 장으로 대신한다. 문장은 공식 정보 토큰을 옮긴 것.
 * roles = 캐릭터를 같이 고르는 카드, players = 플레이어를 같이 고르는 카드.
 */
const CARDS: { text: string; roles?: boolean; players?: boolean }[] = [
  { text: '당신의 캐릭터입니다', roles: true },
  { text: '이 사람이 악마입니다', players: true },
  { text: '당신의 하수인들입니다', players: true },
  { text: '이 캐릭터들은 게임에 없습니다', roles: true },
  { text: '이 캐릭터가 당신을 선택했습니다', roles: true },
  { text: '이 플레이어의 캐릭터는', players: true, roles: true },
  { text: '당신은 선한 팀입니다' },
  { text: '당신은 악한 팀입니다' },
  { text: '능력을 사용하시겠습니까?' },
  { text: '플레이어를 고르세요' },
  { text: '캐릭터를 고르세요' },
  { text: '오늘 투표하셨습니까?' },
  { text: '오늘 지명하셨습니까?' },
];

const TEAMS = ['TOWNSFOLK', 'OUTSIDER', 'MINION', 'DEMON', 'TRAVELLER', 'FABLED'] as const;

export function InfoCardPanel({
  state,
  onShow,
  onClose,
}: {
  state: GrimoireState;
  onShow: (content: ShowContent) => void;
  onClose: () => void;
}) {
  const roles = useMemo(() => roleMap(state.data), [state.data]);
  const [text, setText] = useState(CARDS[0].text);
  const [custom, setCustom] = useState('');
  const [team, setTeam] = useState<(typeof TEAMS)[number]>('TOWNSFOLK');
  const [roleKeys, setRoleKeys] = useState<string[]>([]);
  const [seatIds, setSeatIds] = useState<string[]>([]);
  const card = CARDS.find(c => c.text === text);
  const wantsRoles = !card || !!card.roles;
  const wantsPlayers = !card || !!card.players;

  const toggle = (list: string[], key: string) => (list.includes(key) ? list.filter(k => k !== key) : [...list, key]);

  const show = () => {
    const title = card ? text : custom.trim();
    if (!title) return;
    const picked = roleKeys.map(k => roles.get(k)).filter((r): r is GrimoireRole => !!r);
    const names = state.seats.filter(s => seatIds.includes(s.id)).map(s => s.name);
    onShow({ title, roles: wantsRoles ? picked : [], message: wantsPlayers && names.length ? names.join(', ') : undefined });
  };

  const pickCard = (t: string) => {
    setText(t);
    // 다른 카드로 바꾸면 고른 것을 비운다(앞 카드에 고른 캐릭터가 엉뚱하게 같이 나가지 않게)
    setRoleKeys([]);
    setSeatIds([]);
  };

  return (
    <Overlay onClick={onClose}>
      <Sheet $wide onClick={e => e.stopPropagation()}>
        <SheetHead>
          <h3>정보 카드</h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>
        <Hint>문장을 고르고 필요하면 캐릭터·플레이어를 고른 뒤 [보여주기]. 화면 전체로 크게 보이고, 누르면 닫힙니다.</Hint>

        <SheetSection>
          <label>문장</label>
          <Row>
            {CARDS.map(c => (
              <Chip key={c.text} type="button" $active={text === c.text} onClick={() => pickCard(c.text)}>
                {c.text}
              </Chip>
            ))}
            <Chip type="button" $active={!card} onClick={() => pickCard('')}>
              직접 쓰기
            </Chip>
          </Row>
          {!card && (
            <Row style={{ marginTop: 8 }}>
              <TextInput value={custom} placeholder="보여줄 문장" onChange={e => setCustom(e.target.value)} />
            </Row>
          )}
        </SheetSection>

        {wantsPlayers && (
          <SheetSection>
            <label>플레이어 {seatIds.length > 0 && `(${seatIds.length})`}</label>
            <Row>
              {state.seats
                .filter(s => !s.left)
                .map((s, i) => (
                  <Chip key={s.id} type="button" $active={seatIds.includes(s.id)} onClick={() => setSeatIds(v => toggle(v, s.id))}>
                    {i + 1}. {s.name}
                  </Chip>
                ))}
            </Row>
          </SheetSection>
        )}

        {wantsRoles && (
          <SheetSection>
            <label>캐릭터 {roleKeys.length > 0 && `(${roleKeys.map(k => roles.get(k)?.name).join(', ')})`}</label>
            <Row style={{ marginBottom: 8 }}>
              {TEAMS.map(t => (
                <Chip key={t} type="button" $color={CT_TYPE_COLOR_DARK[t]} $active={team === t} onClick={() => setTeam(t)}>
                  {CT_TYPE_LABEL[t]}
                </Chip>
              ))}
            </Row>
            <PickGrid>
              {state.data.roles
                .filter(r => r.team === team)
                .map(r => (
                  <PickItem
                    key={r.key}
                    type="button"
                    $color={CT_TYPE_COLOR_DARK[team]}
                    $active={roleKeys.includes(r.key)}
                    $taken={false}
                    onClick={() => setRoleKeys(v => toggle(v, r.key))}
                  >
                    <RoleArt urls={tokenImageCandidates(r, null)} alt="" size={28} />
                    {r.name}
                  </PickItem>
                ))}
            </PickGrid>
          </SheetSection>
        )}

        <Footer>
          <Btn type="button" $tone="primary" onClick={show} disabled={!card && !custom.trim()} style={{ minHeight: 52, fontSize: 17 }}>
            보여주기
          </Btn>
        </Footer>
      </Sheet>
    </Overlay>
  );
}

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  background: var(--ct-surface);
`;
