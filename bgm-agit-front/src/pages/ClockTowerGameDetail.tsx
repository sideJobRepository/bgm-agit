import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { toast } from 'react-toastify';
import { clockTowerGameDetailState } from '../recoil/state/clocktowerState.ts';
import { useClockTowerGameDetailFetch } from '../recoil/clocktowerFetch.ts';
import { useDeletePost, useInsertPost, useUpdatePost } from '../recoil/fetch.ts';
import { userState } from '../recoil/state/userState.ts';
import { showConfirmModal } from '../components/confirmAlert.tsx';
import { ctPlayersLabel } from './ClockTowerGames.tsx';
import type { ClockTowerCharacterType } from '../types/clocktower.ts';

const TYPE_OPTIONS: { value: ClockTowerCharacterType; label: string }[] = [
  { value: 'TOWNSFOLK', label: '마을주민' },
  { value: 'OUTSIDER', label: '외부인' },
  { value: 'MINION', label: '하수인' },
  { value: 'DEMON', label: '악마' },
];

const TYPE_COLOR: Record<ClockTowerCharacterType, string> = {
  TOWNSFOLK: '#1565C0',
  OUTSIDER: '#0097A7',
  MINION: '#C62828',
  DEMON: '#6A1B9A',
};

interface CharRow {
  name: string;
  type: ClockTowerCharacterType;
  description: string;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [chars, setChars] = useState<CharRow[]>([]);

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
      setChars(
        (detail.characters ?? []).map(c => ({
          name: c.name,
          type: c.type,
          description: c.description ?? '',
        }))
      );
    }
  }, [detail, id]);

  const onPickImage = (file: File | null) => {
    setImageFile(file);
    setRemoveImage(false);
    if (file) setPreview(URL.createObjectURL(file));
  };

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
      .map(c => ({ name: c.name.trim(), type: c.type, description: c.description.trim() }));

    const form = new FormData();
    form.append('name', name.trim());
    if (minPlayers) form.append('minPlayers', minPlayers);
    if (maxPlayers) form.append('maxPlayers', maxPlayers);
    if (playMinutes) form.append('playMinutes', playMinutes);
    if (imageFile) form.append('image', imageFile);
    form.append('characters', JSON.stringify(cleanChars));

    showConfirmModal({
      message: '저장하시겠습니까?',
      onConfirm: () => {
        if (id) {
          form.append('removeImage', String(removeImage));
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
                <Button color="#4A2C82" onClick={() => setEditMode(true)}>수정</Button>
                <Button color="#FF5E57" onClick={onDelete}>삭제</Button>
              </>
            )}
            <Button color="#988271" onClick={() => navigate('/clocktower-games')}>목록</Button>
          </ButtonRow>

          <Cover>
            {detail?.imageUrl ? <img src={detail.imageUrl} alt={detail.name} /> : <NoImage>NO IMAGE</NoImage>}
          </Cover>
          <DetailTitle>{detail?.name}</DetailTitle>
          <DetailMeta>
            <span>👥 {ctPlayersLabel(detail?.minPlayers, detail?.maxPlayers)}</span>
            {detail?.playMinutes ? <span>⏱ 약 {detail.playMinutes}분</span> : null}
          </DetailMeta>

          <SectionTitle>캐릭터 ({detail?.characters?.length ?? 0})</SectionTitle>
          {(detail?.characters?.length ?? 0) === 0 ? (
            <Empty>등록된 캐릭터가 없습니다.</Empty>
          ) : (
            <CharViewList>
              {detail?.characters?.map(c => (
                <CharViewItem key={c.id}>
                  <CharHead>
                    <CharName>{c.name}</CharName>
                    <TypeTag color={TYPE_COLOR[c.type]}>{c.typeName}</TypeTag>
                  </CharHead>
                  {c.description && <CharDesc>{c.description}</CharDesc>}
                </CharViewItem>
              ))}
            </CharViewList>
          )}
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
            <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} placeholder="예: 15" />
          </Field>
          <Field>
            <label>예상 플레이타임(분)</label>
            <input type="number" value={playMinutes} onChange={e => setPlayMinutes(e.target.value)} placeholder="예: 60" />
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
          <Button color="#1A7D55" onClick={onSubmit}>저장</Button>
          <Button color="#988271" onClick={() => (id ? setEditMode(false) : navigate('/clocktower-games'))}>취소</Button>
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
  max-width: 280px;
  aspect-ratio: 3 / 4;
  background: #f1efe9;
  border-radius: 10px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 844px) {
    max-width: 220px;
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

const SectionTitle = styled.h3<WithTheme>`
  margin: 26px 0 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const CharViewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CharViewItem = styled.div<WithTheme>`
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
  padding: 12px 14px;
  background: #fff;
`;

const CharHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CharName = styled.span<WithTheme>`
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const TypeTag = styled.span.withConfig({ shouldForwardProp: p => p !== 'color' })<{ color: string }>`
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  background: ${({ color }) => color};
`;

const CharDesc = styled.div<WithTheme>`
  margin-top: 6px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  line-height: 1.5;
  white-space: pre-line;
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

  > label {
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
      border-color: #4a2c82;
    }
  }
`;

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FileButton = styled.label<WithTheme>`
  display: inline-flex;
  align-items: center;
  padding: 9px 16px;
  background: #4a2c82;
  color: #fff;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    opacity: 0.9;
  }
`;

const FileName = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const CharEditList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CharEditRow = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
  padding: 10px;

  textarea {
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 16px;
    font-family: inherit;
    resize: vertical;
    &:focus {
      outline: none;
      border-color: #4a2c82;
    }
  }
`;

const CharLineTop = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    min-width: 0;
    height: 42px;
    padding: 0 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
  }
  select {
    flex: 0 0 110px;
    height: 42px;
    padding: 0 8px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
  }
`;

const RemoveBtn = styled.button`
  flex: 0 0 auto;
  padding: 0 12px;
  background: #fff;
  color: #ff5e57;
  border: 1px solid #ff5e57;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
`;

const AddBtn = styled.button<WithTheme>`
  margin-top: 10px;
  align-self: flex-start;
  padding: 9px 16px;
  background: #fff;
  color: #4a2c82;
  border: 1px dashed #4a2c82;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`;

const Empty = styled.div<WithTheme>`
  text-align: center;
  padding: 24px 0;
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;
