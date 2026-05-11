'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Check, Flag, MagnifyingGlass, PencilSimple, Stop, X } from 'phosphor-react';
import api from '@/lib/axiosInstance';
import { alertDialog, confirmDialog } from '@/utils/alert';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';

type TournamentStatus = 'READY' | 'ACTIVE' | 'CLOSED';

interface Tournament {
  tournamentId: number;
  tournamentSettingId: number;
  tournamentSettingName: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  progressStatus: TournamentStatus;
}

/** "2026-05-11" + "10:00" -> "2026-05-11T10:00" (datetime-local 입력 호환) */
function combineDateTime(date: string | null, time: string | null): string {
  if (!date || !time) return '';
  const hhmm = time.length >= 5 ? time.substring(0, 5) : time;
  return `${date}T${hhmm}`;
}

/** "2026-05-11T10:00" -> { date: "2026-05-11", time: "10:00:00" } */
function splitDateTime(value: string): { date: string | null; time: string | null } {
  if (!value) return { date: null, time: null };
  const [date, rawTime = ''] = value.split('T');
  if (!date || !rawTime) return { date: null, time: null };
  const time = rawTime.length === 5 ? `${rawTime}:00` : rawTime;
  return { date, time };
}

/** "2026-05-11 10:00 ~ 2026-05-13 22:00" 같은 형식으로 표시 */
function formatSchedule(t: Pick<Tournament, 'startDate' | 'endDate' | 'startTime' | 'endTime'>): string {
  if (!t.startDate || !t.endDate) return '-';
  const startT = t.startTime?.substring(0, 5) ?? '';
  const endT = t.endTime?.substring(0, 5) ?? '';
  return `${t.startDate} ${startT} ~ ${t.endDate} ${endT}`;
}

interface TournamentSetting {
  tournamentSettingId: number;
  label: string;
}

interface ApiResponse {
  message: string;
}

const STATUS_LABEL: Record<TournamentStatus, string> = {
  READY: '준비',
  ACTIVE: '진행중',
  CLOSED: '종료',
};

export default function TournamentPage() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [settings, setSettings] = useState<TournamentSetting[]>([]);
  const [editTournamentId, setEditTournamentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [tournamentSettingId, setTournamentSettingId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTournaments = useCallback(async () => {
    const { data } = await api.get<Tournament[]>('/bgm-agit/tournaments');
    setTournaments(data);
  }, []);

  const fetchSettings = useCallback(async () => {
    const { data } = await api.get<TournamentSetting[]>('/bgm-agit/tournaments/settings');
    setSettings(data);
    setTournamentSettingId((prev) => prev || (data[0] ? String(data[0].tournamentSettingId) : ''));
  }, []);

  const resetForm = useCallback(() => {
    setEditTournamentId(null);
    setName('');
    setStartAt('');
    setEndAt('');
    setTournamentSettingId(settings[0] ? String(settings[0].tournamentSettingId) : '');
  }, [settings]);

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) return;
    fetchTournaments();
    fetchSettings();
  }, [user, isAdmin, fetchTournaments, fetchSettings]);

  const activeTournament = tournaments.find((item) => item.progressStatus === 'ACTIVE');

  const filteredTournaments = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return tournaments;
    return tournaments.filter((item) =>
      [item.name, item.tournamentSettingName ?? '', STATUS_LABEL[item.progressStatus]].some((value) =>
        value.toLowerCase().includes(trimmed)
      )
    );
  }, [tournaments, keyword]);

  const startEdit = (tournament: Tournament) => {
    setEditTournamentId(tournament.tournamentId);
    setName(tournament.name);
    setStartAt(combineDateTime(tournament.startDate, tournament.startTime));
    setEndAt(combineDateTime(tournament.endDate, tournament.endTime));
    setTournamentSettingId(String(tournament.tournamentSettingId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      await alertDialog('로그인이 필요합니다.', 'error');
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      await alertDialog('관리자만 사용할 수 있습니다.', 'error');
      return;
    }

    if (!name.trim()) {
      await alertDialog('대회명을 입력해주세요.', 'error');
      return;
    }

    if (!tournamentSettingId) {
      await alertDialog('대회 설정을 선택해주세요.', 'error');
      return;
    }

    if (!startAt || !endAt) {
      await alertDialog('시작/종료 일시를 모두 입력해주세요.', 'error');
      return;
    }

    if (new Date(endAt) <= new Date(startAt)) {
      await alertDialog('종료 일시는 시작 일시보다 이후여야 합니다.', 'error');
      return;
    }

    const start = splitDateTime(startAt);
    const end = splitDateTime(endAt);

    const payload = {
      name: name.trim(),
      startDate: start.date,
      endDate: end.date,
      startTime: start.time,
      endTime: end.time,
      tournamentSettingId: Number(tournamentSettingId),
    };

    setSaving(true);
    try {
      const request = editTournamentId
        ? api.put<ApiResponse>(`/bgm-agit/tournaments/${editTournamentId}`, payload)
        : api.post<ApiResponse>('/bgm-agit/tournaments', payload);
      const { data } = await request;

      await alertDialog(data.message || '대회가 저장되었습니다.', 'success');
      resetForm();
      await fetchTournaments();
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async (tournament: Tournament) => {
    const result = await confirmDialog(`${tournament.name} 대회를 시작할까요?`, 'warning');
    if (!result.isConfirmed) return;

    const { data } = await api.put<ApiResponse>(`/bgm-agit/tournaments/${tournament.tournamentId}/start`);
    await alertDialog(data.message || '대회가 시작되었습니다.', 'success');
    await fetchTournaments();
  };

  const handleClose = async (tournament: Tournament) => {
    const result = await confirmDialog(`${tournament.name} 대회를 종료할까요?`, 'warning');
    if (!result.isConfirmed) return;

    const { data } = await api.put<ApiResponse>(`/bgm-agit/tournaments/${tournament.tournamentId}/close`);
    await alertDialog(data.message || '대회가 종료되었습니다.', 'success');
    await fetchTournaments();
  };

  if (user && !isAdmin) {
    return (
      <Wrapper>
        <EmptyBox>관리자만 접근할 수 있습니다.</EmptyBox>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Hero>
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
        />
        <HeroContent>
          <h1>Tournament</h1>
          <span>대회를 등록하고 진행 상태를 관리합니다.</span>
        </HeroContent>
      </Hero>

      <Content>
        <ActivePanel $active={!!activeTournament}>
          <div>
            <span>현재 진행 대회</span>
            <strong>{activeTournament ? activeTournament.name : '진행 중인 대회 없음'}</strong>
          </div>
          {activeTournament && (
            <ActiveMeta>
              <span>{formatSchedule(activeTournament)}</span>
              <span>{activeTournament.tournamentSettingName}</span>
            </ActiveMeta>
          )}
        </ActivePanel>

        <EditorPanel onSubmit={handleSubmit}>
          <PanelHeader>
            <div>
              <strong>{editTournamentId ? '대회 수정' : '대회 등록'}</strong>
              <span>시작 버튼을 누른 대회만 대회 대국에 연결됩니다.</span>
            </div>
            <HeaderActions>
              {editTournamentId && (
                <SecondaryButton type="button" onClick={resetForm}>
                  <X weight="bold" />
                  취소
                </SecondaryButton>
              )}
              <PrimaryButton type="submit" disabled={saving}>
                <Check weight="bold" />
                {editTournamentId ? '수정 저장' : '대회 저장'}
              </PrimaryButton>
            </HeaderActions>
          </PanelHeader>

          <FieldGrid>
            <Field className="wide">
              <label>대회명</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="BGM 리치마작 정기전"
              />
            </Field>
            <Field>
              <label>시작 일시</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </Field>
            <Field>
              <label>종료 일시</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </Field>
            <Field className="wide">
              <label>대회 설정</label>
              <select value={tournamentSettingId} onChange={(e) => setTournamentSettingId(e.target.value)}>
                <option value="">설정 선택</option>
                {settings.map((setting) => (
                  <option key={setting.tournamentSettingId} value={setting.tournamentSettingId}>
                    {setting.label}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGrid>
        </EditorPanel>

        <TopLine>
          <ResultText>총 {filteredTournaments.length}개 대회</ResultText>
          <SearchBox>
            <MagnifyingGlass weight="bold" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="대회명, 설정, 상태 검색"
            />
          </SearchBox>
        </TopLine>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>번호</Th>
                <Th>상태</Th>
                <Th>대회명</Th>
                <Th>일정</Th>
                <Th>설정</Th>
                <Th>관리</Th>
              </tr>
            </thead>
            <tbody>
              {filteredTournaments.map((tournament, index) => (
                <tr key={tournament.tournamentId}>
                  <Td data-label="번호">{index + 1}</Td>
                  <Td data-label="상태">
                    <StatusBadge data-status={tournament.progressStatus}>
                      {STATUS_LABEL[tournament.progressStatus]}
                    </StatusBadge>
                  </Td>
                  <Td data-label="대회명">{tournament.name}</Td>
                  <Td data-label="일정">{formatSchedule(tournament)}</Td>
                  <Td data-label="설정" className="setting">
                    {tournament.tournamentSettingName ?? '-'}
                  </Td>
                  <Td data-label="관리">
                    <RowActions>
                      <RowButton type="button" onClick={() => startEdit(tournament)} aria-label="대회 수정">
                        <PencilSimple weight="bold" />
                      </RowButton>
                      {tournament.progressStatus === 'READY' && (
                        <StartButton type="button" onClick={() => handleStart(tournament)} aria-label="대회 시작">
                          <Flag weight="bold" />
                        </StartButton>
                      )}
                      {tournament.progressStatus === 'ACTIVE' && (
                        <CloseButton type="button" onClick={() => handleClose(tournament)} aria-label="대회 종료">
                          <Stop weight="bold" />
                        </CloseButton>
                      )}
                    </RowActions>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredTournaments.length === 0 && <EmptyBox>등록된 대회가 없습니다.</EmptyBox>}
        </TableWrapper>
      </Content>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  gap: 32px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
    gap: 20px;
  }
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(24, 26, 32, 0.92), rgba(88, 57, 28, 0.72)),
    url('/record/write.jpg') center / cover;

  @media ${({ theme }) => theme.device.mobile} {
    height: 112px;
  }
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.lg};
    font-weight: 600;
    opacity: 0.86;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.md};
    }
  }
`;

const Content = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 8px 32px;

  @media ${({ theme }) => theme.device.tablet} {
    padding: 0 14px 32px;
  }
`;

const ActivePanel = styled.div<{ $active: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? '#1f4e5b' : '#f4f4f5')};
  color: ${({ $active, theme }) => ($active ? theme.colors.whiteColor : theme.colors.inputColor)};

  span {
    display: block;
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    opacity: 0.72;
    font-weight: 700;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 900;
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ActiveMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  @media ${({ theme }) => theme.device.mobile} {
    align-items: flex-start;
  }
`;

const EditorPanel = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  border-radius: 6px;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.inputColor};
    font-size: ${({ theme }) => theme.desktop.sizes.lg};
    font-weight: 800;
  }

  span {
    display: block;
    margin-top: 4px;
    color: ${({ theme }) => theme.colors.grayColor};
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  @media ${({ theme }) => theme.device.mobile} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  .wide {
    grid-column: 1 / -1;
  }

  @media ${({ theme }) => theme.device.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    .wide {
      grid-column: 1 / -1;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;

    .wide {
      grid-column: auto;
    }
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.grayColor};
    font-weight: 700;
  }

  input,
  select {
    width: 100%;
    height: 40px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.whiteColor};
    color: ${({ theme }) => theme.colors.inputColor};
    padding: 0 10px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;

    @media ${({ theme }) => theme.device.mobile} {
      height: 42px;
      font-size: 16px;
    }
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  font-weight: 800;
  cursor: pointer;

  svg {
    width: 15px;
    height: 15px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`;

const PrimaryButton = styled(ActionButton)`
  border: none;
  background-color: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
`;

const SecondaryButton = styled(ActionButton)`
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  background-color: ${({ theme }) => theme.colors.whiteColor};
  color: ${({ theme }) => theme.colors.inputColor};
`;

const TopLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ResultText = styled.div`
  color: ${({ theme }) => theme.colors.grayColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  font-weight: 700;
`;

const SearchBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 320px;
  height: 40px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.whiteColor};

  input {
    width: 100%;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
    }
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.grayColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.inputColor};

  th,
  td {
    padding: 12px 8px;
    text-align: center;
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }

  td.setting {
    text-align: left;
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
  }

  @media ${({ theme }) => theme.device.mobile} {
    min-width: 0;

    thead {
      display: none;
    }

    tbody {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    tr {
      display: grid;
      grid-template-columns: 1fr;
      padding: 12px;
      border: 1px solid ${({ theme }) => theme.colors.lineColor};
      border-radius: 4px;
      background: ${({ theme }) => theme.colors.whiteColor};
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
      text-align: right;
      word-break: break-word;
    }

    td:last-child {
      border-bottom: none;
    }

    td::before {
      content: attr(data-label);
      flex: 0 0 64px;
      text-align: left;
      color: ${({ theme }) => theme.colors.grayColor};
      font-weight: 700;
    }

    td.setting {
      text-align: right;
    }
  }
`;

const Th = styled.th`
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  font-weight: 700;
`;

const Td = styled.td``;

const StatusBadge = styled.span`
  display: inline-flex;
  justify-content: center;
  min-width: 58px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #757575;
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  font-weight: 800;

  &[data-status='READY'] {
    background: #4a90e2;
  }

  &[data-status='ACTIVE'] {
    background: #1f4e5b;
  }

  &[data-status='CLOSED'] {
    background: #757575;
  }
`;

const RowActions = styled.div`
  display: inline-flex;
  justify-content: center;
  gap: 6px;
`;

const RowButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.whiteColor};
  color: ${({ theme }) => theme.colors.inputColor};
  cursor: pointer;

  svg {
    width: 15px;
    height: 15px;
  }
`;

const StartButton = styled(RowButton)`
  color: #1f4e5b;
`;

const CloseButton = styled(RowButton)`
  color: #d9625e;
`;

const EmptyBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 160px;
  padding: 40px 0;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  color: ${({ theme }) => theme.colors.grayColor};
`;
