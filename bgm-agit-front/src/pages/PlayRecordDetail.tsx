import { Wrapper } from '../styles';
import { Box, ButtonRow, Button, DetailHead, Thumb, NoImage, DetailTitle, DetailMeta, SectionTitle, ChipRow, ViewChip, Memo, FormTitle, NoticeBox, NoticeLine, Field } from './PlayRecordDetail.styles.ts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { toast } from '../utils/toast';
import api from '../utils/axiosInstance';
import { playRecordDetailState } from '../recoil/state/murderState.ts';
import { usePlayRecordDetailFetch } from '../recoil/murderFetch.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import MemberMultiSelect from '../components/MemberMultiSelect.tsx';
import GameSelect from '../components/GameSelect.tsx';
import type { ExperiencedMember, MemberOption, MurderGame } from '../types/murder.ts';
import { theme } from '../styles/theme.ts';

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
  const [experienced, setExperienced] = useState<ExperiencedMember[]>([]);

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

  const gameName = useMemo(() => games.find(g => g.id === gameId)?.name ?? '', [games, gameId]);

  // 선택한 게임을 참가자 중 누가 전에 플레이했는지 안내
  useEffect(() => {
    if (!gameId || memberIds.length === 0) {
      setExperienced([]);
      return;
    }
    const t = setTimeout(() => {
      api
        .get('/bgm-agit/play-records/experienced', {
          params: {
            gameId,
            memberIds: memberIds.join(','),
            ...(id ? { excludeRecordId: Number(id) } : {}),
          },
        })
        .then(res => setExperienced(res.data as ExperiencedMember[]))
        .catch(() => setExperienced([]));
    }, 200);
    return () => clearTimeout(t);
  }, [gameId, memberIds, id]);

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
            <Button color={theme.colors.primary} onClick={() => navigate('/play-records')}>목록</Button>
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
          <GameSelect games={games} value={gameId} onChange={setGameId} />
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
          {experienced.length > 0 && (
            <NoticeBox>
              {experienced.map(m => (
                <NoticeLine key={m.memberId}>
                  {m.nickname}님은 {gameName} 게임을 플레이한 경험이 있습니다.
                  {m.playCount > 1 ? ` (${m.playCount}회)` : ''}
                </NoticeLine>
              ))}
            </NoticeBox>
          )}
        </Field>

        <Field>
          <label>메모 (선택)</label>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="간단한 메모" />
        </Field>

        <ButtonRow>
          <Button color="#1A7D55" onClick={onSubmit}>저장</Button>
          <Button color={theme.colors.primary} onClick={() => (id ? setEditMode(false) : navigate('/play-records'))}>취소</Button>
        </ButtonRow>
      </Box>
    </Wrapper>
  );
}
