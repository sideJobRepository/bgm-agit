import { ModalWrapper, ModalTitle, ImageUploadWrapper, UploadLabel, HiddenInput, PreviewImage, Row, Field, Input, Select, ButtonBox, Button } from './RoomEditModal.styles.ts';
import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import Modal from '../Modal.tsx';
import { toast } from '../../utils/toast';
import { showConfirmModal } from '../confirmAlert.tsx';
import { useDeletePost, useInsertPost, useUpdatePost } from '../../recoil/fetch.ts';
import { ROOM_LINKS, type Room } from '../../types/reservation.ts';
import { theme } from '../../styles/theme.ts';

// 서버 ApiResponse. 권한 거부(403)도 HTTP 200 으로 오므로 success 를 직접 봐야 한다
type ApiResult = { code?: number; success?: boolean; message?: string } | null | undefined;

/**
 * 관리자 방 등록·수정 모달 (BGM_AGIT_ROOM).
 *
 * 예전엔 방이 BGM_AGIT_IMAGE 행이라 이 자리에 이미지 폼(타이틀·그룹)이 있었고 인원·사용여부는 SQL 로만 바꿀 수 있었다.
 * - POST/PUT /bgm-agit/rooms (multipart). 수정 때 이미지는 바꿀 때만 보낸다
 * - DELETE /bgm-agit/rooms/{roomId}. 예약 이력이 있으면 서버가 삭제 대신 숨김 처리하고 그 사실을 메시지로 준다
 */
export default function RoomEditModal({
  room,
  defaultLink,
  onClose,
  onSaved,
}: {
  // null 이면 신규 등록
  room: Room | null;
  // 신규 등록 시 링크 기본값(지금 보고 있는 페이지)
  defaultLink: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();

  const isEdit = !!room;

  const [name, setName] = useState(room?.name ?? '');
  const [link, setLink] = useState(room?.link ?? defaultLink);
  const [minPeople, setMinPeople] = useState(room?.minPeople?.toString() ?? '');
  const [maxPeople, setMaxPeople] = useState(room?.maxPeople?.toString() ?? '');
  const [guide, setGuide] = useState(room?.guide ?? '');
  const [useStatus, setUseStatus] = useState<'Y' | 'N'>(room?.useStatus === 'N' ? 'N' : 'Y');
  const [preview, setPreview] = useState<string | null>(room?.imageUrl ?? null);
  const [file, setFile] = useState<File | null>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(picked);
  }

  // 서버 응답이 실패(403 등)면 메시지를 띄우고 false
  function handleResult(data: ApiResult, fallback: string) {
    if (data && data.success === false) {
      toast.error(data.message ?? '처리하지 못했습니다.');
      return false;
    }
    toast.success(data?.message || fallback);
    onSaved();
    onClose();
    return true;
  }

  function validate() {
    if (!name.trim()) {
      toast.error('방 이름을 입력해주세요.');
      return false;
    }
    if (!isEdit && !file) {
      toast.error('이미지를 등록해주세요.');
      return false;
    }
    const min = Number(minPeople);
    const max = Number(maxPeople);
    if (!minPeople || !maxPeople || !Number.isInteger(min) || !Number.isInteger(max)) {
      toast.error('최소·최대 인원을 숫자로 입력해주세요.');
      return false;
    }
    if (min < 1 || max < min) {
      toast.error('최대 인원은 최소 인원 이상이어야 합니다.');
      return false;
    }
    return true;
  }

  function save() {
    if (!validate()) return;

    const formData = new FormData();
    if (isEdit) formData.append('roomId', room!.roomId.toString());
    formData.append('name', name.trim());
    formData.append('link', link);
    formData.append('minPeople', minPeople);
    formData.append('maxPeople', maxPeople);
    formData.append('guide', guide.trim());
    formData.append('useStatus', useStatus);
    if (file) formData.append('image', file);

    const requestFn = isEdit ? update : insert;

    showConfirmModal({
      message: isEdit ? '수정하시겠습니까?' : '등록하시겠습니까?',
      onConfirm: () => {
        requestFn<ApiResult | FormData>({
          url: '/bgm-agit/rooms',
          body: formData,
          ignoreHttpError: true,
          onSuccess: data =>
            handleResult(
              data as ApiResult,
              isEdit ? '수정이 완료되었습니다.' : '신규 등록이 완료되었습니다.'
            ),
        });
      },
    });
  }

  function deleteRoom() {
    if (!room) return;
    showConfirmModal({
      message: (
        <>
          삭제하시겠습니까?
          <br />
          예약 이력이 있는 방은 삭제 대신 숨김 처리됩니다.
        </>
      ),
      onConfirm: () => {
        remove<ApiResult>({
          url: `/bgm-agit/rooms/${room.roomId}`,
          ignoreHttpError: true,
          onSuccess: data => handleResult(data, '삭제되었습니다.'),
        });
      },
    });
  }

  return (
    <Modal onClose={onClose} closeOnBackdrop={false}>
      <ModalWrapper>
        <ModalTitle>{isEdit ? '방 수정' : '방 등록'}</ModalTitle>
        <ImageUploadWrapper>
          {preview && <PreviewImage src={preview} alt="preview" />}
          <UploadLabel htmlFor="roomImageUpload" $empty={!preview}>
            <FiPlus />
          </UploadLabel>
          <HiddenInput
            type="file"
            accept="image/*"
            id="roomImageUpload"
            onChange={handleImageUpload}
          />
        </ImageUploadWrapper>

        <Field>
          <span>방 이름</span>
          <Input placeholder="예: F Room" value={name} onChange={e => setName(e.target.value)} />
        </Field>

        <Field>
          <span>예약 메뉴</span>
          <Select value={link} onChange={e => setLink(e.target.value)}>
            {ROOM_LINKS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </Field>

        <Row>
          <Field>
            <span>최소 인원</span>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={minPeople}
              onChange={e => setMinPeople(e.target.value)}
            />
          </Field>
          <Field>
            <span>최대 인원</span>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={maxPeople}
              onChange={e => setMaxPeople(e.target.value)}
            />
          </Field>
        </Row>

        <Field>
          <span>인원 안내 문구 (카드에 표시)</span>
          <Input placeholder="예: 2~4인" value={guide} onChange={e => setGuide(e.target.value)} />
        </Field>

        <Field>
          <span>사용 여부</span>
          <Select value={useStatus} onChange={e => setUseStatus(e.target.value as 'Y' | 'N')}>
            <option value="Y">사용 (손님에게 노출)</option>
            <option value="N">숨김 (예약 불가)</option>
          </Select>
        </Field>

        <ButtonBox>
          <Button color="#1A7D55" onClick={save}>
            저장
          </Button>
          {isEdit && (
            <Button color="#FF5E57" onClick={deleteRoom}>
              삭제
            </Button>
          )}
          <Button color={theme.colors.primary} onClick={onClose}>
            닫기
          </Button>
        </ButtonBox>
      </ModalWrapper>
    </Modal>
  );
}
