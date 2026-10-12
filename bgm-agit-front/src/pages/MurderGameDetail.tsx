import { Wrapper } from '../styles';
import { useEffect, useState, type DragEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { toast } from '../utils/toast';
import { murderGameDetailState } from '../recoil/state/murderState.ts';
import { useMurderGameDetailFetch } from '../recoil/murderFetch.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { playersLabel } from './MurderGames.tsx';
import { theme } from '../styles/theme.ts';
import {
  Box,
  ButtonRow,
  Button,
  DetailCard,
  DetailInfo,
  Cover,
  NoImage,
  DetailTitle,
  DetailMeta,
  FormTitle,
  Row,
  Field,
  CoverPanel,
  CoverHint,
  SearchLinks,
  CandidateGrid,
} from './MurderGameDetail.styles.ts';
import type { MurderCoverCandidate } from '../types/murder.ts';
import {
  COVER_SEARCH_SITES,
  droppedUrl,
  errorMessage,
  fetchCoverCandidates,
  firstImageFile,
  putCover,
  type CoverSource,
} from '../utils/murderCover.ts';

// 표지는 수정 폼이 아니라 상세 화면에서 바로 넣는다(관리자).
// 예전엔 수정 → 검색 → 붙여넣기 → 저장 → 확인을 거쳐야 했다. 지금은 후보를 누르거나 Ctrl+V·끌어놓기 하면 바로 저장된다.
// 등록할 때만 폼에서 표지를 같이 받는다(아직 게임이 없어 바로 저장할 곳이 없다)
export default function MurderGameDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles.includes('ROLE_ADMIN');
  const detail = useRecoilValue(murderGameDetailState);
  const fetchDetail = useMurderGameDetailFetch();
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const [editMode, setEditMode] = useState(!id); // id 없으면 등록 모드
  const [name, setName] = useState('');
  const [minPlayers, setMinPlayers] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [playMinutes, setPlayMinutes] = useState('');

  // 등록 폼에서 고른 표지(파일 또는 주소)와 미리보기
  const [newCover, setNewCover] = useState<CoverSource | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);

  // 상세 화면 표지 넣기
  const [savingCover, setSavingCover] = useState(false);
  const [candidates, setCandidates] = useState<MurderCoverCandidate[] | null>(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const showDetail = !!id && !editMode;
  const loaded = !!detail && String(detail.id) === id;

  useEffect(() => {
    if (id) fetchDetail(Number(id));
    setCandidates(null);
  }, [id]);

  useEffect(() => {
    if (detail && id) {
      setName(detail.name ?? '');
      setMinPlayers(detail.minPlayers != null ? String(detail.minPlayers) : '');
      setMaxPlayers(detail.maxPlayers != null ? String(detail.maxPlayers) : '');
      setPlayMinutes(detail.playMinutes != null ? String(detail.playMinutes) : '');
    }
  }, [detail, id]);

  const findCandidates = async (gameName: string) => {
    if (!gameName.trim()) {
      toast.error('게임명을 먼저 입력해주세요.');
      return;
    }
    setCandidateLoading(true);
    try {
      setCandidates(await fetchCoverCandidates(gameName.trim()));
    } catch {
      setCandidates([]);
      toast.error('표지 후보를 찾지 못했습니다.');
    } finally {
      setCandidateLoading(false);
    }
  };

  // 표지 없는 게임은 들어오자마자 후보를 띄운다. 표지가 있으면 [다른 표지 찾기]를 눌렀을 때만
  useEffect(() => {
    if (showDetail && isAdmin && loaded && !detail.imageUrl && candidates == null && !candidateLoading) {
      findCandidates(detail.name);
    }
  }, [showDetail, isAdmin, loaded, detail?.imageUrl]);

  // 상세 화면: 바로 저장
  const saveCover = async (source: CoverSource) => {
    if (!id || savingCover) return;
    setSavingCover(true);
    try {
      await putCover(Number(id), source);
      toast.success('표지를 넣었습니다.');
      setCandidates(null);
      fetchDetail(Number(id));
    } catch (err) {
      toast.error(errorMessage(err, '표지를 넣지 못했습니다.'));
    } finally {
      setSavingCover(false);
    }
  };

  // 등록 폼: 저장 때 같이 보낸다
  const pickNewCover = (source: CoverSource) => {
    setNewCover(source);
    setNewCoverPreview('file' in source ? URL.createObjectURL(source.file) : source.url);
  };

  const takeCover = (source: CoverSource) => (showDetail ? saveCover(source) : pickNewCover(source));

  // Ctrl+V: 이미지면 어디서든, 주소 글자는 입력칸 밖에서만(입력칸에는 글자 그대로 들어가게).
  // 수정 폼에서는 받지 않는다(표지는 상세에서)
  useEffect(() => {
    if (!isAdmin || (id && !showDetail)) return;
    const onPaste = (e: ClipboardEvent) => {
      const file = firstImageFile(e.clipboardData?.items);
      if (file) {
        e.preventDefault();
        takeCover({ file });
        return;
      }
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;
      const text = e.clipboardData?.getData('text/plain')?.trim();
      if (text && /^https?:\/\//.test(text)) {
        e.preventDefault();
        takeCover({ url: text });
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  });

  const dropHandlers = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = firstImageFile(e.dataTransfer?.items);
      if (file) {
        takeCover({ file });
        return;
      }
      const url = droppedUrl(e.dataTransfer);
      if (url) takeCover({ url });
    },
  };

  const onRemoveCover = () => {
    if (!id || !detail) return;
    showConfirmModal({
      message: '표지를 지우시겠습니까?',
      onConfirm: () => {
        const form = new FormData();
        form.append('name', detail.name);
        if (detail.minPlayers != null) form.append('minPlayers', String(detail.minPlayers));
        if (detail.maxPlayers != null) form.append('maxPlayers', String(detail.maxPlayers));
        if (detail.playMinutes != null) form.append('playMinutes', String(detail.playMinutes));
        form.append('removeImage', 'true');
        update({
          url: `/bgm-agit/murder-games/${id}`,
          body: form,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('표지를 지웠습니다.');
            fetchDetail(Number(id));
          },
        });
      },
    });
  };

  const onSubmit = () => {
    if (!name.trim()) {
      toast.error('게임명을 입력해주세요.');
      return;
    }
    if (minPlayers && maxPlayers && Number(minPlayers) > Number(maxPlayers)) {
      toast.error('최소 인원이 최대 인원보다 클 수 없습니다.');
      return;
    }

    const form = new FormData();
    form.append('name', name.trim());
    if (minPlayers) form.append('minPlayers', minPlayers);
    if (maxPlayers) form.append('maxPlayers', maxPlayers);
    if (playMinutes) form.append('playMinutes', playMinutes);

    if (id) {
      // 수정은 이름·인원·시간만. 표지는 상세 화면에서 바로 바꾼다
      update({
        url: `/bgm-agit/murder-games/${id}`,
        body: form,
        ignoreHttpError: true,
        onSuccess: () => {
          toast.success('게임이 수정되었습니다.');
          fetchDetail(Number(id));
          setEditMode(false);
        },
      });
      return;
    }

    if (newCover) {
      if ('file' in newCover) form.append('image', newCover.file);
      else form.append('imageSourceUrl', newCover.url);
    }
    insert({
      url: '/bgm-agit/murder-games',
      body: form,
      ignoreHttpError: true,
      onSuccess: () => {
        toast.success('게임이 등록되었습니다.');
        navigate('/murder-games');
      },
    });
  };

  const onDelete = () => {
    if (!id) return;
    showConfirmModal({
      message: '이 게임을 삭제하시겠습니까?',
      onConfirm: () => {
        remove({
          url: `/bgm-agit/murder-games/${id}`,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('삭제되었습니다.');
            navigate('/murder-games');
          },
        });
      },
    });
  };

  // 후보 + 직접 찾기 링크. 상세에선 누르면 바로 저장, 등록 폼에선 고르기만
  const coverPicker = (gameName: string) => (
    <CoverPanel>
      <SearchLinks>
        <button type="button" disabled={candidateLoading || savingCover} onClick={() => findCandidates(gameName)}>
          {candidateLoading ? '찾는 중…' : candidates ? '다시 찾기' : showDetail ? '다른 표지 찾기' : '표지 후보 찾기'}
        </button>
        {COVER_SEARCH_SITES.map(site => (
          <a
            key={site.label}
            href={gameName.trim() ? site.url(encodeURIComponent(gameName.trim())) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!gameName.trim()}
          >
            {site.label}
          </a>
        ))}
        {showDetail && detail?.imageUrl && (
          <button type="button" disabled={savingCover} onClick={onRemoveCover}>
            표지 지우기
          </button>
        )}
      </SearchLinks>
      {candidates && candidates.length === 0 && (
        <CoverHint>머미로그에 없습니다. 텀블벅·구글에서 이미지를 복사해 Ctrl+V 하세요.</CoverHint>
      )}
      {candidates && candidates.length > 0 && (
        <CandidateGrid>
          {candidates.map(c => (
            <button
              key={c.imageUrl}
              type="button"
              disabled={savingCover}
              aria-pressed={!showDetail && !!newCover && 'url' in newCover && newCover.url === c.imageUrl}
              onClick={() => takeCover({ url: c.imageUrl, candidate: c })}
              title={c.title}
            >
              <img src={c.thumbnailUrl} alt={c.title} loading="lazy" />
              {c.title}
            </button>
          ))}
        </CandidateGrid>
      )}
    </CoverPanel>
  );

  // ---------- 상세 보기 ----------
  if (showDetail) {
    return (
      <Wrapper>
        <Box>
          <ButtonRow>
            {isAdmin && (
              <>
                <Button $variant="primary" $fill={theme.colors.info} onClick={() => setEditMode(true)}>수정</Button>
                <Button $variant="danger" $fill={theme.colors.danger} onClick={onDelete}>삭제</Button>
              </>
            )}
            <Button $variant="secondary" $fill={theme.colors.primary} onClick={() => navigate('/murder-games')}>목록</Button>
          </ButtonRow>

          <DetailCard>
            <Cover $droppable={isAdmin} $active={dragging} {...(isAdmin ? dropHandlers : {})}>
              {savingCover ? (
                <NoImage>저장 중…</NoImage>
              ) : detail?.imageUrl ? (
                <img src={detail.imageUrl} alt={detail.name} />
              ) : (
                <NoImage>{isAdmin ? '아래 후보를 누르거나\nCtrl+V·끌어놓기' : 'NO IMAGE'}</NoImage>
              )}
            </Cover>
            <DetailInfo>
              <DetailTitle>{detail?.name}</DetailTitle>
              <DetailMeta>
                <span>{playersLabel(detail?.minPlayers, detail?.maxPlayers)}</span>
                {detail?.playMinutes ? <span>약 {detail.playMinutes}분</span> : null}
              </DetailMeta>
            </DetailInfo>
          </DetailCard>

          {isAdmin && loaded && coverPicker(detail.name)}
        </Box>
      </Wrapper>
    );
  }

  // ---------- 등록 / 수정 ----------
  return (
    <Wrapper>
      <Box>
        <FormTitle>{id ? '게임 수정' : '게임 등록'}</FormTitle>

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
            <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} placeholder="예: 7" />
          </Field>
          <Field>
            <label>예상 플레이타임(분)</label>
            <input type="number" value={playMinutes} onChange={e => setPlayMinutes(e.target.value)} placeholder="예: 120" />
          </Field>
        </Row>

        {!id && (
          <Field>
            <label>표지 (선택)</label>
            <Cover as="label" $droppable $active={dragging} {...dropHandlers}>
              {newCoverPreview ? (
                <img src={newCoverPreview} alt="표지 미리보기" />
              ) : (
                <NoImage>{'후보를 누르거나\nCtrl+V·끌어놓기·눌러서 선택'}</NoImage>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) pickNewCover({ file });
                }}
              />
            </Cover>
            {coverPicker(name)}
          </Field>
        )}

        <ButtonRow>
          <Button $variant="primary" $fill={theme.colors.success} onClick={onSubmit}>저장</Button>
          <Button
            $variant="secondary"
            $fill={theme.colors.primary}
            onClick={() => (id ? setEditMode(false) : navigate('/murder-games'))}
          >
            취소
          </Button>
        </ButtonRow>
      </Box>
    </Wrapper>
  );
}
