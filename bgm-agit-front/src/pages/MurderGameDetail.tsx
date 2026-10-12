import { Wrapper } from '../styles';
import { useEffect, useState, type ClipboardEvent, type DragEvent } from 'react';
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
  FileRow,
  FileButton,
  FileName,
  PreviewBox,
  CheckLine,
  SearchLinks,
  DropZone,
  CandidateGrid,
} from './MurderGameDetail.styles.ts';
import api from '../utils/axiosInstance';
import type { MurderCoverCandidate } from '../types/murder.ts';

// 표지를 찾는 곳. 크롤링 대신 게임명 검색 화면만 열어 준다(표지 고르기는 사람이 한다)
const COVER_SEARCH_SITES = [
  { label: '텀블벅에서 찾기', url: (q: string) => `https://tumblbug.com/search?query=${q}` },
  { label: '보드라이프에서 찾기', url: (q: string) => `https://boardlife.co.kr/search.php?query=${q}&page=game` },
];

// 클립보드·드래그로 들어온 것 중 첫 이미지 파일
function firstImageFile(items: DataTransferItemList | undefined): File | null {
  if (!items) return null;
  for (const item of Array.from(items)) {
    if (item.kind === 'file' && item.type.startsWith('image/')) return item.getAsFile();
  }
  return null;
}

export default function MurderGameDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const user = useRecoilValue(userState);
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageSourceUrl, setImageSourceUrl] = useState('');
  const [dragging, setDragging] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchDetail(Number(id));
  }, [id]);

  useEffect(() => {
    if (detail && id) {
      setName(detail.name ?? '');
      setMinPlayers(detail.minPlayers != null ? String(detail.minPlayers) : '');
      setMaxPlayers(detail.maxPlayers != null ? String(detail.maxPlayers) : '');
      setPlayMinutes(detail.playMinutes != null ? String(detail.playMinutes) : '');
      setPreview(detail.imageUrl ?? null);
      setRemoveImage(false);
      setImageFile(null);
      setImageSourceUrl('');
    }
  }, [detail, id]);

  const onPickImage = (file: File | null) => {
    setImageFile(file);
    setRemoveImage(false);
    if (file) {
      setPreview(URL.createObjectURL(file));
      setImageSourceUrl('');
    }
  };

  // 사이트에서 "이미지 복사" 후 폼 어디서든 Ctrl+V. 글자를 붙여넣을 때는 건드리지 않는다
  const onPaste = (e: ClipboardEvent) => {
    const file = firstImageFile(e.clipboardData?.items);
    if (!file) return;
    e.preventDefault();
    onPickImage(new File([file], file.name || `cover.${file.type.split('/')[1] ?? 'png'}`, { type: file.type }));
    toast.success('이미지를 붙여넣었습니다.');
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = firstImageFile(e.dataTransfer?.items);
    if (file) {
      onPickImage(file);
      return;
    }
    // 다른 탭의 이미지를 끌어오면 파일이 아니라 주소만 올 때가 있다
    const url = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain');
    if (url && /^https?:\/\//.test(url.trim())) onSourceUrlChange(url.trim());
  };

  const onSourceUrlChange = (value: string) => {
    setImageSourceUrl(value);
    setSourceError(null);
    if (value.trim()) {
      setImageFile(null);
      setRemoveImage(false);
      setPreview(null);
    }
  };

  // 주소를 넣으면 서버에 실제 이미지 주소를 물어 미리보기를 그린다. 텀블벅·판매 페이지 주소면 그 페이지의 대표 이미지가 온다.
  // 저장 때도 서버가 같은 규칙으로 받으므로 여기서 보이는 그림이 저장된다
  useEffect(() => {
    const url = imageSourceUrl.trim();
    if (!/^https?:\/\//.test(url)) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .get<{ imageUrl: string }>('/bgm-agit/murder-games/resolve-image', { params: { url } })
        .then(res => {
          if (!cancelled) setPreview(res.data.imageUrl);
        })
        .catch(err => {
          if (!cancelled) setSourceError(err?.response?.data?.message ?? '이미지를 가져올 수 없습니다.');
        });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [imageSourceUrl]);

  const searchQuery = encodeURIComponent(name.trim());

  // 보드라이프 표지 후보. 고르면 이미지 주소 칸에 넣어 저장 때 서버가 받아오게 한다
  const [candidates, setCandidates] = useState<MurderCoverCandidate[] | null>(null);
  const [candidateLoading, setCandidateLoading] = useState(false);

  const onFindCandidates = async () => {
    if (!name.trim()) {
      toast.error('게임명을 먼저 입력해주세요.');
      return;
    }
    setCandidateLoading(true);
    try {
      const res = await api.get<MurderCoverCandidate[]>('/bgm-agit/murder-games/cover-candidates', {
        params: { name: name.trim() },
      });
      setCandidates(res.data ?? []);
      if (!res.data?.length) toast.info('보드라이프에서 찾은 게임이 없습니다. 이름을 줄여서 다시 찾아보세요.');
    } catch {
      toast.error('보드라이프 검색에 실패했습니다.');
    } finally {
      setCandidateLoading(false);
    }
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
    if (imageFile) form.append('image', imageFile);
    else if (imageSourceUrl.trim()) form.append('imageSourceUrl', imageSourceUrl.trim());

    showConfirmModal({
      message: '저장하시겠습니까?',
      onConfirm: () => {
        if (id) {
          form.append('removeImage', String(removeImage));
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
        } else {
          insert({
            url: '/bgm-agit/murder-games',
            body: form,
            ignoreHttpError: true,
            onSuccess: () => {
              toast.success('게임이 등록되었습니다.');
              navigate('/murder-games');
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

  // ---------- 상세 보기 ----------
  if (id && !editMode) {
    return (
      <Wrapper>
        <Box>
          <ButtonRow>
            {user?.roles.includes('ROLE_ADMIN') && (
              <>
                <Button $variant="primary" $fill={theme.colors.info} onClick={() => setEditMode(true)}>수정</Button>
                <Button $variant="danger" $fill={theme.colors.danger} onClick={onDelete}>삭제</Button>
              </>
            )}
            <Button $variant="secondary" $fill={theme.colors.primary} onClick={() => navigate('/murder-games')}>목록</Button>
          </ButtonRow>

          <DetailCard>
            <Cover>
              {detail?.imageUrl ? <img src={detail.imageUrl} alt={detail.name} /> : <NoImage>NO IMAGE</NoImage>}
            </Cover>
            <DetailInfo>
              <DetailTitle>{detail?.name}</DetailTitle>
              <DetailMeta>
                <span>{playersLabel(detail?.minPlayers, detail?.maxPlayers)}</span>
                {detail?.playMinutes ? <span>약 {detail.playMinutes}분</span> : null}
              </DetailMeta>
            </DetailInfo>
          </DetailCard>
        </Box>
      </Wrapper>
    );
  }

  // ---------- 등록 / 수정 ----------
  return (
    <Wrapper>
      <Box onPaste={onPaste}>
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

        <Field>
          <label>커버 이미지 (선택)</label>
          <SearchLinks>
            <button type="button" disabled={!searchQuery || candidateLoading} onClick={onFindCandidates}>
              {candidateLoading ? '찾는 중…' : '보드라이프 후보 보기'}
            </button>
            {COVER_SEARCH_SITES.map(site => (
              <a
                key={site.label}
                href={searchQuery ? site.url(searchQuery) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!searchQuery}
              >
                {site.label}
              </a>
            ))}
          </SearchLinks>
          {candidates && candidates.length > 0 && (
            <CandidateGrid>
              {candidates.map(c => (
                <button
                  key={c.imageUrl}
                  type="button"
                  aria-pressed={imageSourceUrl === c.imageUrl}
                  onClick={() => onSourceUrlChange(c.imageUrl)}
                  title={c.title}
                >
                  <img src={c.thumbnailUrl} alt={c.title} loading="lazy" />
                  {c.title}
                </button>
              ))}
            </CandidateGrid>
          )}
          <DropZone
            $active={dragging}
            onDragOver={e => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            찾은 이미지를 우클릭 → "이미지 복사" 후 이 화면에서 Ctrl+V, 또는 여기로 끌어다 놓으세요
          </DropZone>
          <input
            type="text"
            value={imageSourceUrl}
            onChange={e => onSourceUrlChange(e.target.value)}
            placeholder="또는 주소 붙여넣기 — 텀블벅 프로젝트·판매 페이지 주소나 이미지 주소"
          />
          {sourceError && <FileName role="alert">{sourceError}</FileName>}
          <FileRow>
            <FileButton>
              {preview && !removeImage ? '이미지 변경' : '이미지 선택'}
              <input
                type="file"
                accept="image/*"
                onChange={e => onPickImage(e.target.files?.[0] ?? null)}
                hidden
              />
            </FileButton>
            <FileName>
              {imageFile
                ? imageFile.name
                : imageSourceUrl.trim()
                  ? '이미지 주소'
                  : preview && !removeImage
                    ? '기존 이미지'
                    : '선택된 파일 없음'}
            </FileName>
          </FileRow>
          {preview && !removeImage && (
            <PreviewBox>
              <img src={preview} alt="미리보기" />
            </PreviewBox>
          )}
          {id && detail?.imageUrl && (
            <CheckLine>
              <input
                type="checkbox"
                checked={removeImage}
                onChange={e => {
                  setRemoveImage(e.target.checked);
                  if (e.target.checked) {
                    setImageFile(null);
                    setImageSourceUrl('');
                    setPreview(null);
                  } else {
                    setPreview(detail.imageUrl ?? null);
                  }
                }}
              />
              기존 이미지 삭제
            </CheckLine>
          )}
        </Field>

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
