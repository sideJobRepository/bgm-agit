import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { toast } from 'react-toastify';
import { murderGameDetailState } from '../recoil/state/murderState.ts';
import { useMurderGameDetailFetch } from '../recoil/murderFetch.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { playersLabel } from './MurderGames.tsx';

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
            {user && (
              <>
                <Button color="#093A6E" onClick={() => setEditMode(true)}>수정</Button>
                <Button color="#FF5E57" onClick={onDelete}>삭제</Button>
              </>
            )}
            <Button color="#988271" onClick={() => navigate('/murder-games')}>목록</Button>
          </ButtonRow>

          <Cover>
            {detail?.imageUrl ? <img src={detail.imageUrl} alt={detail.name} /> : <NoImage>NO IMAGE</NoImage>}
          </Cover>
          <DetailTitle>{detail?.name}</DetailTitle>
          <DetailMeta>
            <span>👥 {playersLabel(detail?.minPlayers, detail?.maxPlayers)}</span>
            {detail?.playMinutes ? <span>⏱ 약 {detail.playMinutes}분</span> : null}
          </DetailMeta>
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
          <input type="file" accept="image/*" onChange={e => onPickImage(e.target.files?.[0] ?? null)} />
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
          <Button color="#1A7D55" onClick={onSubmit}>저장</Button>
          <Button
            color="#988271"
            onClick={() => (id ? setEditMode(false) : navigate('/murder-games'))}
          >
            취소
          </Button>
        </ButtonRow>
      </Box>
    </Wrapper>
  );
}

const Box = styled.div`
  padding: 16px;
  max-width: 760px;
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

const Cover = styled.div`
  width: 100%;
  max-height: 360px;
  aspect-ratio: 16 / 9;
  background: #f1efe9;
  border-radius: 10px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NoImage = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.navColor};
`;

const DetailTitle = styled.h2<WithTheme>`
  margin-top: 16px;
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const DetailMeta = styled.div<WithTheme>`
  display: flex;
  gap: 14px;
  margin-top: 10px;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.navColor};
`;

const FormTitle = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 18px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: 844px) {
    flex-wrap: wrap;
  }
`;

const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 140px;
  margin-bottom: 16px;

  label {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.subColor};
  }
  input[type='text'],
  input[type='number'] {
    height: 42px;
    padding: 0 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
    &:focus {
      outline: none;
      border-color: #093a6e;
    }
  }
`;

const PreviewBox = styled.div`
  margin-top: 8px;
  img {
    max-width: 220px;
    width: 100%;
    border-radius: 8px;
  }
`;

const CheckLine = styled.label<WithTheme>`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  cursor: pointer;
`;
