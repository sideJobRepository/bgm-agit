import { Wrapper } from '../styles';
import { useEffect, useState } from 'react';
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
} from './MurderGameDetail.styles.ts';

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
    }
  }, [detail, id]);

  const onPickImage = (file: File | null) => {
    setImageFile(file);
    setRemoveImage(false);
    if (file) setPreview(URL.createObjectURL(file));
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

        <Field>
          <label>커버 이미지 (선택)</label>
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
              {imageFile ? imageFile.name : preview && !removeImage ? '기존 이미지' : '선택된 파일 없음'}
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
