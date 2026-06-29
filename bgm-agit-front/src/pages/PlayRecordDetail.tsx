import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance';
import { playRecordDetailState } from '../recoil/state/murderState.ts';
import { usePlayRecordDetailFetch } from '../recoil/murderFetch.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import MemberMultiSelect from '../components/MemberMultiSelect.tsx';
import type { MemberOption, MurderGame } from '../types/murder.ts';

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function PlayRecordDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const user = useRecoilValue(userState);
  const detail = useRecoilValue(playRecordDetailState);
  const fetchDetail = usePlayRecordDetailFetch();
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const [editMode, setEditMode] = useState(!id);
  const [games, setGames] = useState<MurderGame[]>([]);
  const [gameId, setGameId] = useState<number | ''>('');
  const [playDate, setPlayDate] = useState(todayStr());
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [memo, setMemo] = useState('');

  useEffect(() => {
    api.get('/bgm-agit/murder-games/simple').then(res => setGames(res.data)).catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (id) fetchDetail(Number(id));
  }, [id]);

  useEffect(() => {
    if (detail && id) {
      setGameId(detail.gameId ?? '');
      setPlayDate(detail.playDate ?? todayStr());
      setMemberIds(detail.participants.map(p => p.memberId));
      setMemo(detail.memo ?? '');
    }
  }, [detail, id]);

  const initialOptions: MemberOption[] = useMemo(
    () => (detail?.participants ?? []).map(p => ({ id: p.memberId, nickname: p.nickname })),
    [detail]
  );

  const onSubmit = () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (!gameId) {
      toast.error('게임을 선택해주세요.');
      return;
    }
    if (!playDate) {
      toast.error('플레이 날짜를 선택해주세요.');
      return;
    }

    const body = { gameId: Number(gameId), playDate, memberIds, memo };

    showConfirmModal({
      message: '저장하시겠습니까?',
      onConfirm: () => {
        if (id) {
          update({
            url: `/bgm-agit/play-records/${id}`,
            body,
            ignoreHttpError: true,
            onSuccess: () => {
              toast.success('기록이 수정되었습니다.');
              fetchDetail(Number(id));
              setEditMode(false);
            },
          });
        } else {
          insert({
            url: '/bgm-agit/play-records',
            body,
            ignoreHttpError: true,
            onSuccess: () => {
              toast.success('플레이 기록이 등록되었습니다.');
              navigate('/play-records');
            },
          });
        }
      },
    });
  };

  const onDelete = () => {
    if (!id) return;
    showConfirmModal({
      message: '이 기록을 삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/play-records/${id}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('삭제되었습니다.');
            navigate('/play-records');
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
            {detail?.canManage && (
              <>
                <Button color="#093A6E" onClick={() => setEditMode(true)}>수정</Button>
                <Button color="#FF5E57" onClick={onDelete}>삭제</Button>
              </>
            )}
            <Button color="#988271" onClick={() => navigate('/play-records')}>목록</Button>
          </ButtonRow>

          <DetailHead>
            <Thumb>
              {detail?.gameImageUrl ? <img src={detail.gameImageUrl} alt={detail.gameName} /> : <NoImage>🎭</NoImage>}
            </Thumb>
            <div>
              <DetailTitle>{detail?.gameName}</DetailTitle>
              <DetailMeta>📅 {detail?.playDate}</DetailMeta>
              <DetailMeta>기록 {detail?.writerNickname}</DetailMeta>
            </div>
          </DetailHead>

          <SectionTitle>참가자 ({detail?.participants.length ?? 0}명)</SectionTitle>
          <ChipRow>
            {detail?.participants.map(p => (
              <ViewChip key={p.memberId}>{p.nickname}</ViewChip>
            ))}
          </ChipRow>

          {detail?.memo && (
            <>
              <SectionTitle>메모</SectionTitle>
              <Memo>{detail.memo}</Memo>
            </>
          )}
        </Box>
      </Wrapper>
    );
  }

  // ---------- 등록 / 수정 ----------
  return (
    <Wrapper>
      <Box>
        <FormTitle>{id ? '기록 수정' : '플레이 기록'}</FormTitle>

        <Field>
          <label>게임 *</label>
          <select value={gameId} onChange={e => setGameId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">게임을 선택하세요</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </Field>

        <Field>
          <label>플레이 날짜 *</label>
          <input type="date" value={playDate} onChange={e => setPlayDate(e.target.value)} />
        </Field>

        <Field>
          <label>참가자</label>
          {user && (
            <MemberMultiSelect
              value={memberIds}
              onChange={setMemberIds}
              currentUserId={Number(user.id)}
              currentUserLabel={user.name}
              initialOptions={initialOptions}
              forceSelf={!id || detail?.writerId === Number(user.id)}
            />
          )}
        </Field>

        <Field>
          <label>메모 (선택)</label>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="간단한 메모" />
        </Field>

        <ButtonRow>
          <Button color="#1A7D55" onClick={onSubmit}>저장</Button>
          <Button color="#988271" onClick={() => (id ? setEditMode(false) : navigate('/play-records'))}>취소</Button>
        </ButtonRow>
      </Box>
    </Wrapper>
  );
}

const Box = styled.div`
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const Button = styled.button.withConfig({ shouldForwardProp: p => p !== 'color' })<{ color: string } & WithTheme>`
  padding: 8px 16px;
  background: ${({ color }) => color};
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.medium};
  &:hover {
    opacity: 0.9;
  }
`;

const DetailHead = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const Thumb = styled.div`
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  border-radius: 10px;
  overflow: hidden;
  background: #f1efe9;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NoImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
`;

const DetailTitle = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const DetailMeta = styled.div<WithTheme>`
  margin-top: 4px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;

const SectionTitle = styled.h3<WithTheme>`
  margin: 22px 0 10px;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ViewChip = styled.span<WithTheme>`
  padding: 5px 12px;
  border-radius: 16px;
  background: #f1efe9;
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.small};
`;

const Memo = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};
  line-height: 1.6;
  white-space: pre-line;
`;

const FormTitle = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 18px;
`;

const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;

  label {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.subColor};
  }
  select,
  input[type='date'],
  textarea {
    padding: 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
    &:focus {
      outline: none;
      border-color: #1a7d55;
    }
  }
  select,
  input[type='date'] {
    height: 42px;
  }
  textarea {
    resize: vertical;
    font-family: inherit;
  }
`;
