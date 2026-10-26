import { Wrapper } from '../styles';
import { SheetSummary, DistTable, SheetTotal, TeamSection, TeamHeader, SheetGrid, SheetCard, SheetIcon, SheetBody, Box, ButtonRow, Button, DetailTitle, DetailMeta, SectionTitle, FormTitle, Row, Field, CharEditList, CharEditRow, CharLineTop, RemoveBtn, AddBtn, Empty } from './ClockTowerGameDetail.styles.ts';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { toast } from '../utils/toast';
import api from '../utils/axiosInstance.ts';
import { clockTowerGameDetailState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerGameDetailFetch } from '../recoil/clocktowerFetch.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { ctPlayersLabel } from './ClockTowerGames.tsx';
import { BASE_TEAMS, MAX_BASE_PLAYERS, expectedCounts } from '../components/clocktower/grimoire/grimoireRules.ts';
import type { ClockTowerCharacterType } from '../types/clocktower.ts';
import { CT_TYPE_COLOR as TYPE_COLOR, CT_TYPE_OPTIONS as TYPE_OPTIONS } from '../config/clocktower.ts';

const SOURCE_LABEL: Record<string, string> = {
  OFFICIAL: '공식 기본 스크립트',
  CUSTOM: '커스텀 스크립트',
};

interface CharRow {
  name: string;
  type: ClockTowerCharacterType;
  description: string;
  // 캐릭터 사전에서 온 캐릭터면 그 키. 저장 때 돌려보내야 사전 연결이 유지된다
  roleKey?: string | null;
}

export default function ClockTowerGameDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const user = useRecoilValue(userState);
  const detail = useRecoilValue(clockTowerGameDetailState);
  const fetchDetail = useClockTowerGameDetailFetch();
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const [editMode, setEditMode] = useState(!id);
  const [name, setName] = useState('');
  const [minPlayers, setMinPlayers] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [playMinutes, setPlayMinutes] = useState('');
  const [chars, setChars] = useState<CharRow[]>([]);
  // 커스텀 시계탑(botc.vnamu.com) 시트 주소로 바로 등록(캐릭터 사전과 연결되는 스크립트 등록 경로를 탄다)
  const [sheetUrl, setSheetUrl] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (id) fetchDetail(Number(id));
  }, [id]);

  useEffect(() => {
    if (detail && id) {
      setName(detail.name ?? '');
      setMinPlayers(detail.minPlayers != null ? String(detail.minPlayers) : '');
      setMaxPlayers(detail.maxPlayers != null ? String(detail.maxPlayers) : '');
      setPlayMinutes(detail.playMinutes != null ? String(detail.playMinutes) : '');
      setChars(
        (detail.characters ?? []).map(c => ({
          name: c.name,
          type: c.type,
          description: c.description ?? '',
          roleKey: c.roleKey ?? null,
        }))
      );
    }
  }, [detail, id]);

  const addChar = () => setChars(prev => [...prev, { name: '', type: 'TOWNSFOLK', description: '' }]);
  const updateChar = (idx: number, patch: Partial<CharRow>) =>
    setChars(prev => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  const removeChar = (idx: number) => setChars(prev => prev.filter((_, i) => i !== idx));

  const onSubmit = () => {
    if (!name.trim()) {
      toast.error('게임명을 입력해주세요.');
      return;
    }
    if (minPlayers && maxPlayers && Number(minPlayers) > Number(maxPlayers)) {
      toast.error('최소 인원이 최대 인원보다 클 수 없습니다.');
      return;
    }
    const cleanChars = chars
      .filter(c => c.name.trim())
      .map(c => ({ name: c.name.trim(), type: c.type, description: c.description.trim(), roleKey: c.roleKey ?? null }));

    const form = new FormData();
    form.append('name', name.trim());
    if (minPlayers) form.append('minPlayers', minPlayers);
    if (maxPlayers) form.append('maxPlayers', maxPlayers);
    if (playMinutes) form.append('playMinutes', playMinutes);
    form.append('characters', JSON.stringify(cleanChars));

    showConfirmModal({
      message: '저장하시겠습니까?',
      onConfirm: () => {
        if (id) {
          update({
            url: `/bgm-agit/clocktower-games/${id}`,
            body: form,
            ignoreHttpError: true,
            onSuccess: () => {
              toast.success('게임이 수정되었습니다.');
              fetchDetail(Number(id));
              setEditMode(false);
            },
          });
        } else {
          insert({
            url: '/bgm-agit/clocktower-games',
            body: form,
            ignoreHttpError: true,
            onSuccess: () => {
              toast.success('게임이 등록되었습니다.');
              navigate('/clocktower-games');
            },
          });
        }
      },
    });
  };

  const onDelete = () => {
    if (!id) return;
    showConfirmModal({
      message: '이 게임을 삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/clocktower-games/${id}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('삭제되었습니다.');
            navigate('/clocktower-games');
          },
        });
      },
    });
  };

  // ---------- 상세 보기 ----------
  if (id && !editMode) {
    return (
      <Wrapper>
        <Box>
          <ButtonRow>
            {user?.roles.includes('ROLE_ADMIN') && (
              <>
                <Button $variant="primary" color="#4A2C82" onClick={() => setEditMode(true)}>수정</Button>
                <Button $variant="danger" color="#FF5E57" onClick={onDelete}>삭제</Button>
              </>
            )}
            {user && (
              <Button $variant="primary" color="#4A2C82" onClick={() => navigate(`/clocktower-grimoire?gameId=${id}`)}>
                이 스크립트로 진행
              </Button>
            )}
            <Button $variant="secondary" color="#988271" onClick={() => navigate('/clocktower-games')}>목록</Button>
          </ButtonRow>

          {/* 스크립트 대표 이미지는 쓰지 않는다(사용자 결정 2026-10-26). 공식/커스텀은 아래 출처로 보인다 */}
          <DetailTitle>{detail?.name}</DetailTitle>
          <DetailMeta>
            <span>{ctPlayersLabel(detail?.minPlayers, detail?.maxPlayers)}</span>
            {detail?.playMinutes ? <span>약 {detail.playMinutes}분</span> : null}
            {detail?.source && SOURCE_LABEL[detail.source] ? <span>{SOURCE_LABEL[detail.source]}</span> : null}
            {detail?.author ? <span>작성 {detail.author}</span> : null}
          </DetailMeta>

          <SectionTitle style={{ display: 'flex', alignItems: 'baseline' }}>
            참여 캐릭터 <SheetTotal>총 {detail?.characters?.length ?? 0}명</SheetTotal>
          </SectionTitle>
          {(detail?.characters?.length ?? 0) > 0 && (
            <>
              {/* 이 스크립트에 든 진영별 캐릭터 수 */}
              <SheetSummary>
                {TYPE_OPTIONS.map(t => {
                  const n = (detail?.characters ?? []).filter(ch => ch.type === t.value).length;
                  return n ? (
                    <span key={t.value} style={{ color: TYPE_COLOR[t.value] }}>
                      {t.label} <b>{n}</b>
                    </span>
                  ) : null;
                })}
              </SheetSummary>
              {/* 인원별 배정(공식 분배표). 게임 인원 범위만, 없으면 5~15명 */}
              <DistTable>
                <thead>
                  <tr>
                    <th>인원</th>
                    {BASE_TEAMS.map(t => (
                      <th key={t} style={{ color: TYPE_COLOR[t] }}>
                        {TYPE_OPTIONS.find(o => o.value === t)?.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: MAX_BASE_PLAYERS - 4 }, (_, i) => i + 5)
                    .filter(n => n >= Math.max(5, detail?.minPlayers ?? 5) && n <= Math.min(MAX_BASE_PLAYERS, detail?.maxPlayers ?? MAX_BASE_PLAYERS))
                    .map(n => {
                      const cnt = expectedCounts(n);
                      return (
                        <tr key={n}>
                          <td>{n}명</td>
                          {BASE_TEAMS.map(t => (
                            <td key={t}>{cnt?.[t]}</td>
                          ))}
                        </tr>
                      );
                    })}
                </tbody>
              </DistTable>
            </>
          )}
          {(detail?.characters?.length ?? 0) === 0 ? (
            <Empty>등록된 캐릭터가 없습니다.</Empty>
          ) : (
            // 진영별로 묶어 여러 칸으로(진영 이름·색은 제목줄에 있어 카드에는 안 넣는다)
            TYPE_OPTIONS.map(t => {
              const list = (detail?.characters ?? []).filter(ch => ch.type === t.value);
              if (list.length === 0) return null;
              return (
                <TeamSection key={t.value}>
                  <TeamHeader color={TYPE_COLOR[t.value]}>
                    {t.label}
                    <small>{list.length}</small>
                  </TeamHeader>
                  <SheetGrid>
                    {list.map(ch => (
                      <SheetCard key={ch.id} color={TYPE_COLOR[ch.type]}>
                        <SheetIcon>{ch.image && <img src={ch.image} alt="" loading="lazy" decoding="async" />}</SheetIcon>
                        <SheetBody>
                          <strong>{ch.name}</strong>
                          {ch.description && <p>{ch.description}</p>}
                        </SheetBody>
                      </SheetCard>
                    ))}
                  </SheetGrid>
                </TeamSection>
              );
            })
          )}
        </Box>
      </Wrapper>
    );
  }

  // 시트 주소 → 제목·스크립트 JSON 받기 → 스크립트로 등록. 직접 입력한 게임명·인원이 있으면 그 값을 쓴다
  const importSheet = async () => {
    if (!sheetUrl.trim()) {
      toast.error('시트 주소를 입력해 주세요.');
      return;
    }
    setImporting(true);
    try {
      const { data: sheet } = await api.get<{ name: string | null; json: string }>(
        '/bgm-agit/clocktower-games/script/fetch',
        { params: { url: sheetUrl.trim() } }
      );
      const { data } = await api.post<{ success?: boolean; message?: string }>('/bgm-agit/clocktower-games/script', {
        json: sheet.json,
        name: name.trim() || sheet.name,
        minPlayers: minPlayers ? Number(minPlayers) : null,
        maxPlayers: maxPlayers ? Number(maxPlayers) : null,
      });
      if (data?.success === false) {
        toast.error(data.message ?? '등록하지 못했습니다.');
        return;
      }
      toast.success(data?.message ?? '스크립트가 등록되었습니다.');
      navigate('/clocktower-games');
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? '시트를 불러오지 못했습니다.');
    } finally {
      setImporting(false);
    }
  };

  // ---------- 등록 / 수정 ----------
  return (
    <Wrapper>
      <Box>
        <FormTitle>{id ? '게임 수정' : '게임 등록'}</FormTitle>

        {!id && (
          <Field>
            <label>커스텀 시계탑 시트 주소로 등록 (botc.vnamu.com)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={sheetUrl}
                onChange={e => setSheetUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && importSheet()}
                placeholder="https://botc.vnamu.com/sheets/12"
                style={{ flex: 1 }}
              />
              <Button $variant="primary" color="#4A2C82" onClick={importSheet} disabled={importing}>
                {importing ? '등록 중…' : '주소로 등록'}
              </Button>
            </div>
            <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: '#8a8398' }}>
              제목과 캐릭터를 가져와 바로 등록합니다(캐릭터 사전과 연결돼 마도서에서 밤 순서·그림이 나옵니다). 아래 게임명·인원을
              적어 두면 그 값을 씁니다. 사전이 비어 있으면 [캐릭터 사전·스크립트 등록]에서 공식 데이터를 먼저 가져오세요.
            </p>
          </Field>
        )}

        <Field>
          <label>게임명 *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="게임명" />
        </Field>

        <Row>
          <Field>
            <label>최소 인원</label>
            <input type="number" value={minPlayers} onChange={e => setMinPlayers(e.target.value)} placeholder="예: 5" />
          </Field>
          <Field>
            <label>최대 인원</label>
            <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} placeholder="예: 15" />
          </Field>
          <Field>
            <label>예상 플레이타임(분)</label>
            <input type="number" value={playMinutes} onChange={e => setPlayMinutes(e.target.value)} placeholder="예: 60" />
          </Field>
        </Row>

        <Field>
          <label>캐릭터 목록</label>
          <CharEditList>
            {chars.map((c, i) => (
              <CharEditRow key={i}>
                <CharLineTop>
                  <input
                    type="text"
                    value={c.name}
                    placeholder="캐릭터명"
                    onChange={e => updateChar(i, { name: e.target.value })}
                  />
                  <select
                    value={c.type}
                    onChange={e => updateChar(i, { type: e.target.value as ClockTowerCharacterType })}
                  >
                    {TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <RemoveBtn type="button" onClick={() => removeChar(i)}>삭제</RemoveBtn>
                </CharLineTop>
                <textarea
                  value={c.description}
                  rows={2}
                  placeholder="능력 설명 (선택)"
                  onChange={e => updateChar(i, { description: e.target.value })}
                />
              </CharEditRow>
            ))}
          </CharEditList>
          <AddBtn type="button" onClick={addChar}>+ 캐릭터 추가</AddBtn>
        </Field>

        <ButtonRow>
          <Button $variant="primary" color="#1A7D55" onClick={onSubmit}>저장</Button>
          <Button $variant="secondary" color="#988271" onClick={() => (id ? setEditMode(false) : navigate('/clocktower-games'))}>취소</Button>
        </ButtonRow>
      </Box>
    </Wrapper>
  );
}
