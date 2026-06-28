import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { toast } from 'react-toastify';
import { gatheringDetailState } from '../recoil/state/gatheringState.ts';
import { useGatheringDetailFetch } from '../recoil/gatheringFetch.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import type {
  GatheringDetail as GatheringDetailType,
  GatheringFormBody,
  GatheringType,
  ParticipantStatus,
} from '../types/gathering.ts';

interface ApiResponse {
  code: number;
  success: boolean;
  message: string;
}

const EMPTY_FORM: GatheringFormBody = {
  gatheringType: 'MURDER_MYSTERY',
  title: '',
  scenarioName: '',
  place: '',
  description: '',
  gatheringDate: '',
  startTime: '',
  endTime: '',
  minPeople: 4,
  maxPeople: 6,
  recruitDeadline: '',
};

function formatTime(t?: string | null) {
  return t ? t.slice(0, 5) : '';
}

export default function GatheringDetail() {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const id = idParam ? Number(idParam) : null;
  const navigate = useNavigate();

  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');
  const detail = useRecoilValue(gatheringDetailState);

  const fetchDetail = useGatheringDetailFetch();
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<GatheringFormBody>(EMPTY_FORM);
  const [flexible, setFlexible] = useState(false);

  const isCreate = id == null;

  useEffect(() => {
    if (id != null) fetchDetail(id);
  }, [id]);

  // 수정 모드 진입 시 폼 프리필
  useEffect(() => {
    if (editMode && detail) {
      setForm({
        gatheringType: detail.gatheringType,
        title: detail.title,
        scenarioName: detail.scenarioName ?? '',
        place: detail.place ?? '',
        description: detail.description ?? '',
        gatheringDate: detail.gatheringDate,
        startTime: formatTime(detail.startTime),
        endTime: formatTime(detail.endTime),
        minPeople: detail.minPeople,
        maxPeople: detail.maxPeople,
        recruitDeadline: detail.recruitDeadline ? detail.recruitDeadline.slice(0, 16) : '',
      });
    }
  }, [editMode, detail]);

  const showForm = isCreate || editMode;

  if (isCreate && !user) {
    return (
      <Wrapper>
        <Box>
          <Notice>로그인 후 모임을 만들 수 있습니다.</Notice>
        </Box>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Box>
        {showForm ? (
          <GatheringForm
            form={form}
            setForm={setForm}
            submitLabel={isCreate ? '모임 생성' : '수정 저장'}
            onCancel={() => (isCreate ? navigate('/gatherings') : setEditMode(false))}
            onSubmit={() => {
              const body = buildBody(form);
              if (!body) return;
              if (isCreate) {
                insert({
                  url: '/bgm-agit/gatherings',
                  body,
                  ignoreHttpError: true,
                  onSuccess: data => {
                    const res = data as unknown as ApiResponse;
                    toast.success(res?.message ?? '모임이 생성되었습니다.');
                    navigate('/gatherings');
                  },
                });
              } else {
                update({
                  url: `/bgm-agit/gatherings/${id}`,
                  body,
                  ignoreHttpError: true,
                  onSuccess: data => {
                    const res = data as unknown as ApiResponse;
                    toast.success(res?.message ?? '수정되었습니다.');
                    setEditMode(false);
                    if (id != null) fetchDetail(id);
                  },
                });
              }
            }}
          />
        ) : (
          detail && (
            <DetailView
              detail={detail}
              canManage={isAdmin || (!!user && detail.hostMemberId === user.id)}
              loggedIn={!!user}
              flexible={flexible}
              setFlexible={setFlexible}
              onApply={() => {
                insert({
                  url: `/bgm-agit/gatherings/${id}/apply`,
                  body: { flexible },
                  ignoreHttpError: true,
                  onSuccess: data => {
                    const res = data as unknown as ApiResponse;
                    if (res?.success) toast.success(res.message);
                    else toast.error(res?.message ?? '신청에 실패했습니다.');
                    if (id != null) fetchDetail(id);
                  },
                });
              }}
              onCancelApply={() => {
                showConfirmModal({
                  message: '참가를 취소하시겠습니까?',
                  onConfirm: () =>
                    remove({
                      url: `/bgm-agit/gatherings/${id}/apply`,
                      ignoreHttpError: true,
                      onSuccess: data => {
                        const res = data as unknown as ApiResponse;
                        toast.success(res?.message ?? '취소되었습니다.');
                        if (id != null) fetchDetail(id);
                      },
                    }),
                });
              }}
              onEdit={() => setEditMode(true)}
              onDelete={() => {
                showConfirmModal({
                  message: '이 모임을 무산(취소) 처리하시겠습니까?',
                  onConfirm: () =>
                    remove({
                      url: `/bgm-agit/gatherings/${id}`,
                      ignoreHttpError: true,
                      onSuccess: data => {
                        const res = data as unknown as ApiResponse;
                        toast.success(res?.message ?? '처리되었습니다.');
                        if (id != null) fetchDetail(id);
                      },
                    }),
                });
              }}
              onUpdateParticipant={(pid, patch) => {
                update({
                  url: `/bgm-agit/gatherings/${id}/participants/${pid}`,
                  body: patch,
                  ignoreHttpError: true,
                  onSuccess: data => {
                    const res = data as unknown as ApiResponse;
                    toast.success(res?.message ?? '변경되었습니다.');
                    if (id != null) fetchDetail(id);
                  },
                });
              }}
            />
          )
        )}
      </Box>
    </Wrapper>
  );
}

function buildBody(form: GatheringFormBody): GatheringFormBody | null {
  if (!form.title.trim()) {
    toast.error('제목을 입력하세요.');
    return null;
  }
  if (!form.gatheringDate || !form.startTime || !form.recruitDeadline) {
    toast.error('일자/시작시간/마감시각을 입력하세요.');
    return null;
  }
  if (form.minPeople < 1 || form.maxPeople < 1 || form.minPeople > form.maxPeople) {
    toast.error('최소/최대 인원을 확인하세요.');
    return null;
  }
  return {
    ...form,
    scenarioName: form.scenarioName || null,
    place: form.place || null,
    description: form.description || null,
    endTime: form.endTime || null,
  };
}

/* ----------------------------- 상세 보기 ----------------------------- */

function DetailView({
  detail,
  canManage,
  loggedIn,
  flexible,
  setFlexible,
  onApply,
  onCancelApply,
  onEdit,
  onDelete,
  onUpdateParticipant,
}: {
  detail: GatheringDetailType;
  canManage: boolean;
  loggedIn: boolean;
  flexible: boolean;
  setFlexible: (v: boolean) => void;
  onApply: () => void;
  onCancelApply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateParticipant: (pid: number, patch: Record<string, unknown>) => void;
}) {
  // 모집중이거나 성사 상태(정원 미달이면 계속 모집)면 신청 가능. 무산/종료는 불가.
  const canApply =
    loggedIn &&
    (detail.gatheringStatus === 'RECRUITING' || detail.gatheringStatus === 'CONFIRMED') &&
    (!detail.myStatus || detail.myStatus === 'CANCELLED');
  const canCancel =
    loggedIn && (detail.myStatus === 'CONFIRMED' || detail.myStatus === 'WAITING');

  const myStatusText = useMemo(() => {
    switch (detail.myStatus) {
      case 'CONFIRMED':
        return '내 상태: 참가';
      case 'WAITING':
        return '내 상태: 대기';
      case 'NOSHOW':
        return '내 상태: 노쇼';
      default:
        return null;
    }
  }, [detail.myStatus]);

  return (
    <>
      <DetailHead>
        <Badges>
          <TypeBadge $mm={detail.gatheringType === 'MURDER_MYSTERY'}>{detail.gatheringTypeName}</TypeBadge>
          <StatusBadge $status={detail.gatheringStatus}>{detail.gatheringStatusName}</StatusBadge>
        </Badges>
        <h2>{detail.title}</h2>
      </DetailHead>

      <InfoGrid>
        {detail.scenarioName && <Info><b>시나리오</b><span>{detail.scenarioName}</span></Info>}
        <Info><b>일시</b><span>{detail.gatheringDate} {formatTime(detail.startTime)}{detail.endTime ? ` ~ ${formatTime(detail.endTime)}` : ''}</span></Info>
        {detail.place && <Info><b>장소</b><span>{detail.place}</span></Info>}
        <Info><b>인원</b><span>참가 {detail.confirmedCount} / 최대 {detail.maxPeople} (최소 {detail.minPeople})</span></Info>
        <Info><b>모집 마감</b><span>{detail.recruitDeadline?.replace('T', ' ').slice(0, 16)}</span></Info>
        {detail.hostNickname && <Info><b>주최</b><span>{detail.hostNickname}</span></Info>}
      </InfoGrid>

      {detail.gatheringStatus === 'RECRUITING' && detail.neededToConfirm > 0 && (
        <NeededLine>성사까지 {detail.neededToConfirm}명 남았어요{detail.flexibleCount > 0 ? ` · 다른 장르도 가능 신청자 ${detail.flexibleCount}명` : ''}</NeededLine>
      )}

      {detail.description && <Description>{detail.description}</Description>}

      {myStatusText && <MyStatus>{myStatusText}</MyStatus>}

      {(canApply || canCancel) && (
        <ApplyBox>
          {canApply && (
            <>
              <FlexLabel>
                <input type="checkbox" checked={flexible} onChange={e => setFlexible(e.target.checked)} />
                머더미스터리·시계탑 둘 다 참가 가능해요
              </FlexLabel>
              <PrimaryButton onClick={onApply}>참가 신청</PrimaryButton>
            </>
          )}
          {canCancel && <CancelButton onClick={onCancelApply}>참가 취소</CancelButton>}
        </ApplyBox>
      )}

      {/* 참가자 명단 (닉네임만 공개) */}
      <SectionTitle>참가자 ({detail.confirmed.length})</SectionTitle>
      <NameList>
        {detail.confirmed.map(p => (
          <NameChip key={p.participantId}>{p.nickname}</NameChip>
        ))}
        {detail.confirmed.length === 0 && <Muted>아직 없습니다.</Muted>}
      </NameList>

      {detail.waiting.length > 0 && (
        <>
          <SectionTitle>대기 ({detail.waiting.length})</SectionTitle>
          <NameList>
            {detail.waiting.map(p => (
              <NameChip key={p.participantId} $waiting>{p.nickname}</NameChip>
            ))}
          </NameList>
        </>
      )}

      {/* 주최자/관리자 패널 */}
      {canManage && (
        <AdminPanel>
          <AdminHead>
            <span>모임 관리</span>
            <AdminButtons>
              <SmallButton onClick={onEdit}>수정</SmallButton>
              <SmallButton $danger onClick={onDelete}>무산 처리</SmallButton>
            </AdminButtons>
          </AdminHead>

          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <th>닉네임</th>
                  <th>상태</th>
                  <th>다른장르 가능</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {(detail.adminParticipants ?? []).map(p => (
                  <tr key={p.participantId}>
                    <td>{p.nickname}</td>
                    <td>
                      <select
                        value={p.status}
                        onChange={e =>
                          onUpdateParticipant(p.participantId, { participantStatus: e.target.value as ParticipantStatus })
                        }
                      >
                        <option value="CONFIRMED">참가</option>
                        <option value="WAITING">대기</option>
                        <option value="NOSHOW">노쇼</option>
                        <option value="CANCELLED">취소</option>
                      </select>
                    </td>
                    <td>{p.flexible ? 'O' : '-'}</td>
                    <td>
                      <LinkButton onClick={() => onUpdateParticipant(p.participantId, { participantStatus: 'NOSHOW' })}>
                        노쇼
                      </LinkButton>
                    </td>
                  </tr>
                ))}
                {(detail.adminParticipants ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4}>참가자가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        </AdminPanel>
      )}
    </>
  );
}

/* ----------------------------- 생성/수정 폼 ----------------------------- */

function GatheringForm({
  form,
  setForm,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  form: GatheringFormBody;
  setForm: (f: GatheringFormBody) => void;
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const set = <K extends keyof GatheringFormBody>(key: K, value: GatheringFormBody[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <FormBox>
      <FormTitle>모임 정보</FormTitle>
      <Field>
        <label>종류</label>
        <select value={form.gatheringType} onChange={e => set('gatheringType', e.target.value as GatheringType)}>
          <option value="MURDER_MYSTERY">머더미스터리</option>
          <option value="CLOCK_TOWER">시계탑</option>
        </select>
      </Field>
      <Field>
        <label>제목</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} />
      </Field>
      <Field>
        <label>시나리오명</label>
        <input value={form.scenarioName ?? ''} onChange={e => set('scenarioName', e.target.value)} />
      </Field>
      <Field>
        <label>장소</label>
        <input value={form.place ?? ''} onChange={e => set('place', e.target.value)} />
      </Field>
      <Field>
        <label>일자</label>
        <input type="date" value={form.gatheringDate} onChange={e => set('gatheringDate', e.target.value)} />
      </Field>
      <Row>
        <Field>
          <label>시작 시간</label>
          <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
        </Field>
        <Field>
          <label>종료 시간</label>
          <input type="time" value={form.endTime ?? ''} onChange={e => set('endTime', e.target.value)} />
        </Field>
      </Row>
      <Row>
        <Field>
          <label>최소 인원</label>
          <input type="number" min={1} value={form.minPeople} onChange={e => set('minPeople', Number(e.target.value))} />
        </Field>
        <Field>
          <label>최대 인원</label>
          <input type="number" min={1} value={form.maxPeople} onChange={e => set('maxPeople', Number(e.target.value))} />
        </Field>
      </Row>
      <Field>
        <label>모집 마감</label>
        <input
          type="datetime-local"
          value={form.recruitDeadline}
          onChange={e => set('recruitDeadline', e.target.value)}
        />
      </Field>
      <Field>
        <label>상세 설명</label>
        <textarea
          rows={5}
          value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
        />
      </Field>
      <FormButtons>
        <CancelButton onClick={onCancel}>취소</CancelButton>
        <PrimaryButton onClick={onSubmit}>{submitLabel}</PrimaryButton>
      </FormButtons>
    </FormBox>
  );
}

/* ----------------------------- styles ----------------------------- */

const Box = styled.div`
  padding: 16px 10px;
  max-width: 880px;
  margin: 0 auto;
`;

const Notice = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #757575;
`;

const DetailHead = styled.div<WithTheme>`
  h2 {
    margin-top: 10px;
    font-size: ${({ theme }) => theme.sizes.xlarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    color: ${({ theme }) => theme.colors.subColor};
  }
`;

const Badges = styled.div`
  display: flex;
  gap: 8px;
`;

const TypeBadge = styled.span<{ $mm: boolean } & WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.bold};
  padding: 3px 10px;
  border-radius: 12px;
  color: #fff;
  background: ${({ $mm }) => ($mm ? '#093A6E' : '#1A7D55')};
`;

const StatusBadge = styled.span<{ $status: string } & WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  padding: 3px 10px;
  border-radius: 12px;
  color: #fff;
  background: ${({ $status }) =>
    $status === 'CONFIRMED'
      ? '#1A7D55'
      : $status === 'RECRUITING'
        ? '#988271'
        : $status === 'CANCELLED'
          ? '#FF5E57'
          : '#757575'};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 20px 0;

  @media (max-width: 844px) {
    grid-template-columns: 1fr;
  }
`;

const Info = styled.div<WithTheme>`
  display: flex;
  gap: 10px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  b {
    min-width: 70px;
    color: ${({ theme }) => theme.colors.navColor};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;

const NeededLine = styled.div<WithTheme>`
  background: #f1e7ce;
  color: #5c3a21;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-size: ${({ theme }) => theme.sizes.small};
  margin-bottom: 14px;
`;

const Description = styled.p<WithTheme>`
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 18px;
`;

const MyStatus = styled.div<WithTheme>`
  font-weight: ${({ theme }) => theme.weight.bold};
  color: #482768;
  margin-bottom: 12px;
`;

const ApplyBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const FlexLabel = styled.label<WithTheme>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  input {
    accent-color: #482768;
  }
`;

const PrimaryButton = styled.button<WithTheme>`
  padding: 10px 22px;
  background: #482768;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;
`;

const CancelButton = styled.button<WithTheme>`
  padding: 10px 22px;
  background: #fff;
  color: #424548;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  cursor: pointer;
`;

const SectionTitle = styled.h3<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin: 18px 0 10px;
`;

const NameList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const NameChip = styled.span<{ $waiting?: boolean } & WithTheme>`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: ${({ theme }) => theme.sizes.small};
  background: ${({ $waiting }) => ($waiting ? '#F2EDEA' : '#482768')};
  color: ${({ $waiting }) => ($waiting ? '#424548' : '#fff')};
`;

const Muted = styled.span<WithTheme>`
  color: ${({ theme }) => theme.colors.navColor};
  font-size: ${({ theme }) => theme.sizes.small};
`;

const AdminPanel = styled.div<WithTheme>`
  margin-top: 30px;
  border-top: 2px dashed ${({ theme }) => theme.colors.lineColor};
  padding-top: 18px;
`;

const AdminHead = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  > span {
    font-weight: ${({ theme }) => theme.weight.bold};
    color: #482768;
  }
`;

const AdminButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SmallButton = styled.button<{ $danger?: boolean } & WithTheme>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: #fff;
  background: ${({ $danger }) => ($danger ? '#FF5E57' : '#988271')};
`;

const AdminTableWrap = styled.div`
  overflow-x: auto;
`;

const AdminTable = styled.table<WithTheme>`
  width: 100%;
  min-width: 480px;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.small};

  th,
  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
    padding: 10px;
    text-align: center;
  }
  th {
    background: ${({ theme }) => theme.colors.basicColor};
  }
  select {
    font-size: 16px;
  }
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: #ff5e57;
  cursor: pointer;
  text-decoration: underline;
`;

const FormBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormTitle = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  label {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: ${({ theme }) => theme.weight.semiBold};
    color: ${({ theme }) => theme.colors.navColor};
  }
  input,
  select,
  textarea {
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 6px;
    font-size: 16px;
    width: 100%;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 844px) {
    flex-direction: column;
  }
`;

const FormButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;
