import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/state/userState.ts';
import { toast } from '../utils/toast';
import api from '../utils/axiosInstance.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { CT_TYPE_COLOR, CT_TYPE_OPTIONS } from '../config/clocktower.ts';
import { renderNightText } from '../utils/clocktowerText.tsx';
import RoleArt from '../components/clocktower/grimoire/RoleArt.tsx';
import type {
  ClockTowerCharacterType,
  ClockTowerImageStatus,
  ClockTowerImageSyncResult,
  ClockTowerImportResult,
  ClockTowerRole,
} from '../types/clocktower.ts';

const CT_PURPLE = '#4A2C82';
// 이미지 복사 한 번에 보내는 개수(서버 상한 30 — nginx 타임아웃 안에 끝나게)
const IMAGE_BATCH = 30;

interface ImageRun {
  done: number;
  total: number;
  copied: number;
  skipped: number;
  failed: ClockTowerImageSyncResult[];
}

function errorMessage(e: unknown, fallback: string) {
  return (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

interface EditForm {
  name: string;
  ability: string;
  firstNightText: string;
  otherNightText: string;
}

/**
 * 시계탑 캐릭터 사전·스크립트 관리 (관리자 전용).
 *
 * 공식 데이터(캐릭터·밤 순서·징크스·공식 한국어 번역)를 받아 사전을 채우고, 기본 3종 스크립트를 만든다.
 * 커스텀 스크립트는 스크립트 도구 JSON 을 붙여넣어 등록한다. 원작 문구라 공개 화면에는 내리지 않는다.
 */
export default function ClockTowerRoles() {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles.includes('ROLE_ADMIN');

  const [roles, setRoles] = useState<ClockTowerRole[]>([]);
  const [team, setTeam] = useState<ClockTowerCharacterType | ''>('');
  const [keyword, setKeyword] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ClockTowerImportResult | null>(null);

  // 캐릭터 이미지 S3 복사
  const [imageStatus, setImageStatus] = useState<ClockTowerImageStatus | null>(null);
  const [imageRun, setImageRun] = useState<ImageRun | null>(null);
  const [imageRunning, setImageRunning] = useState(false);

  // 펼친(수정 중) 캐릭터
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EditForm>({ name: '', ability: '', firstNightText: '', otherNightText: '' });

  // 스크립트 등록
  const [scriptJson, setScriptJson] = useState('');
  const [scriptName, setScriptName] = useState('');
  // 커스텀 시계탑(botc.vnamu.com) 시트 주소로 이름·JSON 채우기
  const [sheetUrl, setSheetUrl] = useState('');
  const [fetchingSheet, setFetchingSheet] = useState(false);
  const [scriptMin, setScriptMin] = useState('');
  const [scriptMax, setScriptMax] = useState('');
  const [registering, setRegistering] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ClockTowerRole[]>('/bgm-agit/clocktower-roles', {
        params: { team: team || undefined, keyword: keyword || undefined },
      });
      setRoles(data);
    } catch (e) {
      toast.error(errorMessage(e, '캐릭터 사전을 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [team, keyword]);

  useEffect(() => {
    if (isAdmin) fetchRoles();
  }, [isAdmin, fetchRoles]);

  const fetchImageStatus = useCallback(async () => {
    try {
      const { data } = await api.get<ClockTowerImageStatus>('/bgm-agit/clocktower-roles/images/status');
      setImageStatus(data);
      return data;
    } catch (e) {
      toast.error(errorMessage(e, '이미지 복사 현황을 불러오지 못했습니다.'));
      return null;
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchImageStatus();
  }, [isAdmin, fetchImageStatus]);

  // 30개씩 순서대로 보낸다(머더 표지 자동 채우기와 같은 방식). 시간이 모자라 못 한 것(NOT_RUN)은 다음 묶음 앞에 다시 넣는다
  async function runImageSync(paths: string[], force: boolean) {
    if (paths.length === 0) {
      toast.success('복사할 이미지가 없습니다.');
      return;
    }
    setImageRunning(true);
    const run: ImageRun = { done: 0, total: paths.length, copied: 0, skipped: 0, failed: [] };
    setImageRun({ ...run });
    const queue = [...paths];
    try {
      while (queue.length > 0) {
        const batch = queue.splice(0, IMAGE_BATCH);
        let results: ClockTowerImageSyncResult[];
        try {
          const { data } = await api.post<ClockTowerImageSyncResult[]>('/bgm-agit/clocktower-roles/images/sync', {
            paths: batch,
            force,
          });
          results = data;
        } catch (e) {
          // 묶음 전체 실패(권한·네트워크)면 남은 것도 같은 결과일 가능성이 높아 멈춘다
          toast.error(errorMessage(e, '이미지 복사가 중단되었습니다.'));
          run.failed.push(
            ...[...batch, ...queue].map(path => ({ path, status: 'FAILED' as const, message: '요청 실패' }))
          );
          queue.length = 0;
          break;
        }
        const notRun = results.filter(r => r.status === 'NOT_RUN').map(r => r.path);
        if (notRun.length === batch.length) {
          // 한 장도 못 했으면 같은 묶음을 계속 돌게 된다 — 실패로 남기고 넘어간다
          run.failed.push(...results.map(r => ({ ...r, status: 'FAILED' as const })));
          run.done += batch.length;
        } else {
          queue.unshift(...notRun);
          for (const r of results) {
            if (r.status === 'COPIED') run.copied++;
            else if (r.status === 'SKIPPED') run.skipped++;
            else if (r.status === 'FAILED') run.failed.push(r);
          }
          run.done += results.length - notRun.length;
        }
        setImageRun({ ...run, failed: [...run.failed] });
      }
    } finally {
      setImageRunning(false);
      fetchImageStatus();
    }
    if (run.failed.length > 0) toast.error(`이미지 ${run.failed.length}장을 복사하지 못했습니다.`);
    else toast.success('이미지 복사를 마쳤습니다.');
  }

  function forceAllImages() {
    if (!imageStatus) return;
    showConfirmModal({
      message: (
        <>
          이미지 {imageStatus.total}장을 모두 다시 받을까요?
          <br />
          공식 그림이 바뀌었을 때만 쓰세요. 몇 분 걸립니다.
        </>
      ),
      onConfirm: () => runImageSync(imageStatus.paths, true),
    });
  }

  function runImport() {
    showConfirmModal({
      message: (
        <>
          공식 데이터를 받아 캐릭터 사전을 갱신할까요?
          <br />
          직접 고친 한글 문구는 그대로 둡니다. 기본 스크립트 3종도 함께 만들거나 갱신합니다.
        </>
      ),
      onConfirm: async () => {
        setImporting(true);
        try {
          const { data } = await api.post<ClockTowerImportResult>('/bgm-agit/clocktower-roles/import');
          setImportResult(data);
          toast.success('공식 데이터를 가져왔습니다.');
          fetchRoles();
        } catch (e) {
          toast.error(errorMessage(e, '공식 데이터를 가져오지 못했습니다.'));
        } finally {
          setImporting(false);
        }
      },
    });
  }

  function openEdit(role: ClockTowerRole) {
    if (editingId === role.id) {
      setEditingId(null);
      return;
    }
    setEditingId(role.id);
    setForm({
      name: role.name ?? '',
      ability: role.ability ?? '',
      firstNightText: role.firstNightText ?? '',
      otherNightText: role.otherNightText ?? '',
    });
  }

  async function saveEdit(role: ClockTowerRole) {
    if (!form.name.trim()) {
      toast.error('이름을 입력해 주세요.');
      return;
    }
    try {
      const { data } = await api.put<{ message?: string }>(`/bgm-agit/clocktower-roles/${role.id}`, form);
      toast.success(data?.message ?? '수정되었습니다.');
      setEditingId(null);
      fetchRoles();
    } catch (e) {
      toast.error(errorMessage(e, '수정하지 못했습니다.'));
    }
  }

  function resetEdit(role: ClockTowerRole) {
    showConfirmModal({
      message: '고친 표시를 풀까요? 다음 공식 데이터 가져오기 때 공식 문구로 돌아갑니다.',
      onConfirm: async () => {
        try {
          const { data } = await api.put<{ message?: string }>(`/bgm-agit/clocktower-roles/${role.id}/reset`);
          toast.success(data?.message ?? '처리되었습니다.');
          fetchRoles();
        } catch (e) {
          toast.error(errorMessage(e, '처리하지 못했습니다.'));
        }
      },
    });
  }

  // 서버가 시트 주소에서 표준 스크립트 JSON 을 받아 온다. 등록은 하지 않고 입력칸만 채운다(확인 후 [스크립트 등록])
  async function fetchSheet() {
    if (!sheetUrl.trim()) {
      toast.error('시트 주소를 입력해 주세요.');
      return;
    }
    setFetchingSheet(true);
    try {
      const { data } = await api.get<{ name: string | null; author: string | null; json: string }>(
        '/bgm-agit/clocktower-games/script/fetch',
        { params: { url: sheetUrl.trim() } }
      );
      setScriptJson(data.json);
      setScriptName(data.name ?? '');
      toast.success(`${data.name ?? '시트'}를 불러왔습니다. 확인 후 [스크립트 등록]을 눌러 주세요.`);
    } catch (e) {
      toast.error(errorMessage(e, '시트를 불러오지 못했습니다.'));
    } finally {
      setFetchingSheet(false);
    }
  }

  async function registerScript() {
    if (!scriptJson.trim()) {
      toast.error('스크립트 JSON 을 붙여넣어 주세요.');
      return;
    }
    setRegistering(true);
    try {
      const { data } = await api.post<{ message?: string }>('/bgm-agit/clocktower-games/script', {
        json: scriptJson,
        name: scriptName.trim() || null,
        minPlayers: scriptMin ? Number(scriptMin) : null,
        maxPlayers: scriptMax ? Number(scriptMax) : null,
      });
      toast.success(data?.message ?? '스크립트가 등록되었습니다.');
      setScriptJson('');
      setScriptName('');
      setScriptMin('');
      setScriptMax('');
    } catch (e) {
      toast.error(errorMessage(e, '스크립트를 등록하지 못했습니다.'));
    } finally {
      setRegistering(false);
    }
  }

  if (!isAdmin) {
    return (
      <Wrapper>
        <Empty>관리자만 사용할 수 있는 화면입니다.</Empty>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header>
        <div>
          <h2>시계탑 캐릭터 사전</h2>
          <p>공식 캐릭터·밤 순서·징크스를 받아 두고, 커스텀 스크립트를 JSON 으로 등록합니다.</p>
        </div>
        <LinkButton type="button" onClick={() => navigate('/clocktower-games')}>
          게임 목록
        </LinkButton>
      </Header>

      <Section>
        <SectionHead>
          <h3>공식 데이터 가져오기</h3>
          <PrimaryButton type="button" onClick={runImport} disabled={importing}>
            {importing ? '가져오는 중…' : '공식 데이터 가져오기'}
          </PrimaryButton>
        </SectionHead>
        <NoticeBox>
          원작사(The Pandemonium Institute)가 공개 배포하는 캐릭터·밤 순서·징크스와 공식 한국어 번역을 받습니다.
          <br />
          새 캐릭터가 나오면 다시 누르면 됩니다. 아래에서 직접 고친 한글 문구는 덮어쓰지 않습니다.
        </NoticeBox>
        {importResult && (
          <ResultBox>
            캐릭터 {importResult.total}개 (새로 추가 {importResult.added}개)
            {importResult.keptEdited > 0 && ` · 고친 문구 유지 ${importResult.keptEdited}개`} · 징크스{' '}
            {importResult.jinxes}건
            {importResult.scripts.length > 0 && (
              <>
                <br />
                기본 스크립트: {importResult.scripts.join(', ')}
              </>
            )}
          </ResultBox>
        )}
      </Section>

      <Section>
        <SectionHead>
          <h3>캐릭터 이미지 복사</h3>
          <ButtonRow>
            <PrimaryButton
              type="button"
              onClick={() => imageStatus && runImageSync(imageStatus.missing, false)}
              disabled={imageRunning || !imageStatus || imageStatus.missing.length === 0}
            >
              {imageRunning && imageRun ? `복사 중 ${imageRun.done}/${imageRun.total}` : '이미지 복사'}
            </PrimaryButton>
            <GhostButton
              type="button"
              onClick={() => imageRun && runImageSync(imageRun.failed.map(f => f.path), false)}
              disabled={imageRunning || !imageRun || imageRun.failed.length === 0}
            >
              실패만 다시
            </GhostButton>
            <GhostButton type="button" onClick={forceAllImages} disabled={imageRunning || !imageStatus}>
              전체 다시 받기
            </GhostButton>
          </ButtonRow>
        </SectionHead>
        <NoticeBox>
          진행판 토큰에 쓰는 공식 캐릭터 그림을 우리 저장소로 복사합니다. 공식 데이터를 가져온 뒤에 누르세요.
          <br />
          새 캐릭터가 추가되면 빠진 것만 다시 복사하면 됩니다.
        </NoticeBox>
        {imageStatus && (
          <ResultBox>
            복사됨 {imageStatus.done}/{imageStatus.total}장
            {imageStatus.missing.length > 0 && ` · 남은 것 ${imageStatus.missing.length}장`}
            {imageRun && (
              <>
                <br />
                {imageRunning ? '진행 중' : '마지막 실행'} — {imageRun.done}/{imageRun.total}장 처리, 복사{' '}
                {imageRun.copied}장 · 건너뜀 {imageRun.skipped}장 · 실패 {imageRun.failed.length}장
              </>
            )}
            {imageRun && imageRun.failed.length > 0 && (
              <FailList>
                {imageRun.failed.slice(0, 20).map(f => (
                  <li key={f.path}>
                    {f.path} {f.message && `— ${f.message}`}
                  </li>
                ))}
                {imageRun.failed.length > 20 && <li>외 {imageRun.failed.length - 20}장</li>}
              </FailList>
            )}
          </ResultBox>
        )}
      </Section>

      <Section>
        <SectionHead>
          <h3>커스텀 스크립트 등록</h3>
        </SectionHead>
        <NoticeBox>
          커스텀 시계탑 시트 주소를 넣고 [주소로 불러오기]를 누르거나, 스크립트 도구·커뮤니티에서 받은 JSON 을 그대로 붙여넣으세요.
          <br />
          JSON 에 이름이 없으면 아래 이름 칸을 채워야 합니다. 등록된 스크립트는 게임 목록에 나타납니다.
        </NoticeBox>
        <ScriptForm>
          <FormRow>
            <Field style={{ flex: 1 }}>
              <label>커스텀 시계탑 시트 주소 (botc.vnamu.com)</label>
              <input
                type="text"
                value={sheetUrl}
                onChange={e => setSheetUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchSheet()}
                placeholder="https://botc.vnamu.com/sheets/12"
              />
            </Field>
            <PrimaryButton type="button" onClick={fetchSheet} disabled={fetchingSheet}>
              {fetchingSheet ? '불러오는 중…' : '주소로 불러오기'}
            </PrimaryButton>
          </FormRow>
          <textarea
            value={scriptJson}
            onChange={e => setScriptJson(e.target.value)}
            placeholder='[{"id":"_meta","name":"스크립트명","author":"작성자"},"chef","investigator",...]'
            rows={6}
          />
          <FormRow>
            <Field>
              <label>이름 (선택)</label>
              <input
                type="text"
                value={scriptName}
                onChange={e => setScriptName(e.target.value)}
                placeholder="JSON 이름 대신 쓸 이름"
              />
            </Field>
            <Field>
              <label>최소 인원</label>
              <input type="number" value={scriptMin} onChange={e => setScriptMin(e.target.value)} placeholder="예: 5" />
            </Field>
            <Field>
              <label>최대 인원</label>
              <input type="number" value={scriptMax} onChange={e => setScriptMax(e.target.value)} placeholder="예: 15" />
            </Field>
            <PrimaryButton type="button" onClick={registerScript} disabled={registering}>
              {registering ? '등록 중…' : '스크립트 등록'}
            </PrimaryButton>
          </FormRow>
        </ScriptForm>
      </Section>

      <Section>
        <SectionHead>
          <h3>캐릭터 사전 ({roles.length})</h3>
        </SectionHead>
        <Tabs>
          <Tab type="button" $active={team === ''} $color={CT_PURPLE} onClick={() => setTeam('')}>
            전체
          </Tab>
          {CT_TYPE_OPTIONS.map(o => (
            <Tab
              key={o.value}
              type="button"
              $active={team === o.value}
              $color={CT_TYPE_COLOR[o.value]}
              onClick={() => setTeam(o.value)}
            >
              {o.label}
            </Tab>
          ))}
        </Tabs>
        <SearchRow>
          <input
            type="text"
            placeholder="이름 검색 (한글·영문)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setKeyword(input.trim())}
          />
          <button type="button" onClick={() => setKeyword(input.trim())}>
            검색
          </button>
        </SearchRow>

        {loading ? (
          <Empty>불러오는 중…</Empty>
        ) : roles.length === 0 ? (
          <Empty>캐릭터가 없습니다. 먼저 공식 데이터를 가져와 주세요.</Empty>
        ) : (
          <List>
            {roles.map(r => (
              <Item key={r.id}>
                <ItemHead type="button" onClick={() => openEdit(r)}>
                  {/* 캐릭터 기본 진영 그림(악마·하수인은 악, 나머지는 선/무진영). 복사 전이면 안 그린다 */}
                  <RoleArt
                    urls={[
                      ...(r.team === 'DEMON' || r.team === 'MINION' ? [r.imageEvil] : [r.imageGood]),
                      r.image,
                      r.imageGood,
                      r.imageEvil,
                    ].filter((u): u is string => !!u)}
                    alt={r.name}
                    size={40}
                  />
                  {r.team && <TypeTag $color={CT_TYPE_COLOR[r.team]}>{r.teamName}</TypeTag>}
                  <ItemName>{r.name}</ItemName>
                  <ItemEn>{r.nameEn}</ItemEn>
                  {r.setup && <SmallTag>셋업 변경</SmallTag>}
                  {r.customEdited && <SmallTag $tone="edited">직접 고침</SmallTag>}
                </ItemHead>
                {editingId !== r.id ? (
                  <ItemBody>
                    {r.ability && <p>{r.ability}</p>}
                    {(r.firstNightOrder != null || r.otherNightOrder != null) && (
                      <NightLine>
                        {r.firstNightOrder != null && <span>첫날 밤 {r.firstNightOrder}번째</span>}
                        {r.otherNightOrder != null && <span>그 외 밤 {r.otherNightOrder}번째</span>}
                      </NightLine>
                    )}
                    {r.firstNightText && (
                      <NightText>
                        <b>첫날 밤</b> {renderNightText(r.firstNightText)}
                      </NightText>
                    )}
                    {r.otherNightText && (
                      <NightText>
                        <b>그 외 밤</b> {renderNightText(r.otherNightText)}
                      </NightText>
                    )}
                    {r.reminders.length + r.remindersGlobal.length > 0 && (
                      <Reminders>
                        {[...r.reminders, ...r.remindersGlobal].map((m, i) => (
                          <span key={i}>{m}</span>
                        ))}
                      </Reminders>
                    )}
                  </ItemBody>
                ) : (
                  <EditBox>
                    <Field>
                      <label>이름</label>
                      <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </Field>
                    <Field>
                      <label>능력</label>
                      <textarea
                        rows={3}
                        value={form.ability}
                        onChange={e => setForm({ ...form, ability: e.target.value })}
                      />
                    </Field>
                    <Field>
                      <label>첫날 밤 안내</label>
                      <textarea
                        rows={3}
                        value={form.firstNightText}
                        onChange={e => setForm({ ...form, firstNightText: e.target.value })}
                      />
                    </Field>
                    <Field>
                      <label>그 외 밤 안내</label>
                      <textarea
                        rows={3}
                        value={form.otherNightText}
                        onChange={e => setForm({ ...form, otherNightText: e.target.value })}
                      />
                    </Field>
                    <EditHint>
                      *굵게* 표시와 :reminder: 표시는 공식 문구 형식입니다. 그대로 두면 화면에서 굵은 글씨·줄바꿈으로
                      보입니다.
                    </EditHint>
                    <EditButtons>
                      <PrimaryButton type="button" onClick={() => saveEdit(r)}>
                        저장
                      </PrimaryButton>
                      {r.customEdited && (
                        <GhostButton type="button" onClick={() => resetEdit(r)}>
                          공식 문구로 되돌리기
                        </GhostButton>
                      )}
                      <GhostButton type="button" onClick={() => setEditingId(null)}>
                        닫기
                      </GhostButton>
                    </EditButtons>
                  </EditBox>
                )}
              </Item>
            ))}
          </List>
        )}
      </Section>
    </Wrapper>
  );
}

const Header = styled.div<WithTheme>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;

  h2 {
    font-size: ${({ theme }) => theme.sizes.large};
    font-weight: ${({ theme }) => theme.weight.bold};
    color: ${({ theme }) => theme.colors.menuColor};
  }

  p {
    margin-top: 6px;
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.subColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Section = styled.section`
  margin-bottom: 32px;
`;

const SectionHead = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;

  h3 {
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: ${({ theme }) => theme.weight.bold};
    color: ${({ theme }) => theme.colors.menuColor};
  }
`;

const NoticeBox = styled.div<WithTheme>`
  padding: 12px 14px;
  margin-bottom: 12px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.softColor};
  font-size: ${({ theme }) => theme.sizes.small};
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.subColor};
`;

const ResultBox = styled.div<WithTheme>`
  padding: 12px 14px;
  border: 1px solid ${CT_PURPLE};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  line-height: 1.7;
  color: ${CT_PURPLE};
`;

const PrimaryButton = styled.button<WithTheme>`
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: 6px;
  background-color: ${CT_PURPLE};
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const GhostButton = styled.button<WithTheme>`
  height: 40px;
  padding: 0 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.subColor};
  cursor: pointer;
`;

const LinkButton = styled(GhostButton)``;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FailList = styled.ul`
  margin: 6px 0 0;
  padding-left: 18px;
  font-size: 13px;
  list-style: disc;
`;

const ScriptForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-family: monospace;
    font-size: 14px;
    resize: vertical;
  }
`;

const FormRow = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    button {
      width: 100%;
    }
  }
`;

const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.subColor};
  }

  input,
  textarea {
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    /* iOS Safari 는 16px 미만이면 포커스 시 화면을 확대한다 */
    font-size: 16px;
  }

  input {
    height: 40px;
  }

  input[type='number'] {
    width: 110px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;

    input[type='number'] {
      width: 100%;
    }
  }
`;

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
`;

const Tab = styled.button<{ $active: boolean; $color: string }>`
  height: 32px;
  padding: 0 14px;
  border: 1px solid ${({ $color }) => $color};
  border-radius: 999px;
  background-color: ${({ $active, $color }) => ($active ? $color : '#fff')};
  color: ${({ $active, $color }) => ($active ? '#fff' : $color)};
  font-size: 13px;
  cursor: pointer;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  input {
    flex: 1;
    height: 40px;
    padding: 0 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
  }

  button {
    height: 40px;
    padding: 0 16px;
    border: none;
    border-radius: 6px;
    background-color: ${CT_PURPLE};
    color: #fff;
    cursor: pointer;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.div`
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background-color: #fff;
  overflow: hidden;
`;

const ItemHead = styled.button`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
`;

const TypeTag = styled.span<{ $color: string }>`
  padding: 2px 8px;
  border-radius: 999px;
  background-color: ${({ $color }) => $color};
  color: #fff;
  font-size: 12px;
`;

const ItemName = styled.span<WithTheme>`
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.menuColor};
`;

const ItemEn = styled.span`
  font-size: 12px;
  color: #999;
`;

const SmallTag = styled.span<{ $tone?: 'edited' }>`
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${({ $tone }) => ($tone === 'edited' ? '#FFF3E0' : '#F1F1F1')};
  color: ${({ $tone }) => ($tone === 'edited' ? '#E08700' : '#666')};
  font-size: 11px;
`;

const ItemBody = styled.div<WithTheme>`
  padding: 0 14px 12px;
  font-size: ${({ theme }) => theme.sizes.small};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.subColor};

  p + * {
    margin-top: 6px;
  }
`;

const NightLine = styled.div`
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: ${CT_PURPLE};
`;

const NightText = styled.div`
  margin-top: 4px;

  b {
    margin-right: 4px;
    color: ${CT_PURPLE};
  }
`;

const Reminders = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;

  span {
    padding: 2px 8px;
    border: 1px dashed #bbb;
    border-radius: 999px;
    font-size: 12px;
  }
`;

const EditBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 14px 14px;

  textarea {
    width: 100%;
    resize: vertical;
  }
`;

const EditHint = styled.div`
  font-size: 12px;
  color: #999;
`;

const EditButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Empty = styled.div<WithTheme>`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.small};
`;
