import Modal from './Modal.tsx';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { MdClose } from 'react-icons/md';
import modalLogo from '/favicon.ico';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { myPageState, userState } from '../recoil/state/userState.ts';
import {
  useMyPageFetch,
  useUpdatePost,
  useInsertPost,
  useDeletePost,
  useChangeMyPasswordPost,
} from '../recoil/fetch.ts';
import { showConfirmModal } from './confirmAlert.tsx';
import { toast } from 'react-toastify';

type Props = {
  onClose: () => void;
};

export default function MyPageModal({ onClose }: Props) {
  const { update } = useUpdatePost();
  const { insert } = useInsertPost();
  const { remove } = useDeletePost();
  const { changeMyPassword: postChangePassword } = useChangeMyPasswordPost();

  const fetchMyPage = useMyPageFetch();
  const items = useRecoilValue(myPageState);
  const user = useRecoilValue(userState);

  // 자체로그인 회원이면 마작 이용 신청/해지 영역 노출, 상태에 따라 버튼 전환
  const isSelfLogin = !!user && !user.socialId;
  const isMahjongUser = items?.mahjongUseStatus === 'Y';

  const [nickName, setNickName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // 비밀번호 변경 입력
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  //휴대폰 정규식
  const PHONE_REGEX = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/;

  //업데이트
  async function updateData() {
    if (!nickName) {
      toast.error('닉네임을 입력해주세요.');
      return;
    } else if (!PHONE_REGEX.test(phoneNumber)) {
      toast.error(
        <>
          휴대폰 번호 형식이 올바르지 않습니다. <br />
          (예: 010-1234-5678)
        </>
      );
      return;
    }

    const param = {
      id: items?.id,
      nickName: nickName,
      phoneNo: phoneNumber,
      nickNameUseStatus: 'Y',
      // 메인 마이페이지엔 알림톡 토글이 없으므로 기존 값을 그대로 보내 NULL 덮어쓰기 방지
      alimtalkStatus: items?.alimtalkStatus,
    };

    showConfirmModal({
      message: '내정보를 수정하시겠습니까?',
      onConfirm: () => {
        update({
          url: '/bgm-agit/mypage',
          body: param,
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('내정보를 수정하였습니다.');
            fetchMyPage();
          },
        });
      },
    });
  }

  // 마작 기록 이용 신청 (KML 등록 + 마작 검색 노출 전환)
  function applyMahjongUse() {
    showConfirmModal({
      message: '마작 기록 이용을 신청하시겠습니까? 신청 시 마작 기록 시스템(BML)에 회원으로 등록됩니다.',
      onConfirm: () => {
        insert({
          url: '/bgm-agit/mahjong-use',
          body: {},
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('마작 기록 이용 신청이 완료되었습니다.');
            fetchMyPage();
          },
        });
      },
    });
  }

  // 마작 기록 이용 해지 (실수로 신청한 경우)
  function cancelMahjongUse() {
    showConfirmModal({
      message: '마작 기록 이용을 해지하시겠습니까? 해지 시 마작 기록 입력 대상에서 제외됩니다.',
      onConfirm: () => {
        remove({
          url: '/bgm-agit/mahjong-use',
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success('마작 기록 이용이 해지되었습니다.');
            fetchMyPage();
          },
        });
      },
    });
  }

  // 비밀번호 변경 (자체로그인 회원 전용)
  function changeMyPassword() {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      toast.error('비밀번호를 모두 입력해 주세요.');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('새 비밀번호는 4자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    showConfirmModal({
      message: '비밀번호를 변경하시겠습니까?',
      onConfirm: () => {
        // 실패 시 백엔드 메시지("현재 비밀번호가 일치하지 않습니다." 등)를 그대로 노출
        postChangePassword({ currentPassword, newPassword }, () => {
          setCurrentPassword('');
          setNewPassword('');
          setNewPasswordConfirm('');
        });
      },
    });
  }

  useEffect(() => {
    fetchMyPage();
  }, []);

  useEffect(() => {
    setNickName(items?.nickName);
    setPhoneNumber(items?.phoneNo);
  }, [items]);

  return (
    <Modal onClose={onClose} closeOnBackdrop={false}>
      <ModalWrapper>
        <TopModalBox>
          <MdClose onClick={onClose} />
        </TopModalBox>
        <CenterModalBox>
          <img src={modalLogo} alt="로고" />
          <h2>회원정보</h2>
        </CenterModalBox>
        <BottomModalBox>
          <InputBox>
            <label htmlFor="registDate">가입일자</label>
            <input
              id="registDate"
              className="readonly-input"
              type="text"
              placeholder="가입입자를 입력해주세요."
              value={items?.registDate}
              readOnly
            />
          </InputBox>
          <InputBox>
            <label htmlFor="name">이름</label>
            <input
              id="name"
              className="readonly-input"
              type="text"
              placeholder="이름을 입력해주세요."
              value={items?.name}
              readOnly
            />
          </InputBox>
          <InputBox>
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              maxLength={8}
              placeholder="닉네임을 입력해주세요."
              value={nickName}
              onChange={e => setNickName(e.target.value)}
            />
          </InputBox>
          <InputBox>
            <label htmlFor="phoneNumber">휴대폰번호</label>
            <input
              id="phoneNumber"
              type="text"
              placeholder="휴대폰번호를 입력해주세요."
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </InputBox>
          <button onClick={() => updateData()}>수정하기</button>

          {isSelfLogin &&
            (isMahjongUser ? (
              <MahjongBox>
                <p>마작 기록(BML)을 이용 중입니다.</p>
                <button type="button" className="cancel" onClick={() => cancelMahjongUse()}>
                  마작 기록 이용 해지
                </button>
              </MahjongBox>
            ) : (
              <MahjongBox>
                <p>마작 기록(BML)을 이용하시려면 신청이 필요합니다.</p>
                <button type="button" onClick={() => applyMahjongUse()}>
                  마작 기록 이용 신청
                </button>
              </MahjongBox>
            ))}

          {isSelfLogin && (
            <PasswordBox>
              <h3>비밀번호 변경</h3>
              <InputBox>
                <label htmlFor="currentPassword">현재 비밀번호</label>
                <input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="현재 비밀번호"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </InputBox>
              <InputBox>
                <label htmlFor="newPassword">새 비밀번호 (4자 이상)</label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </InputBox>
              <InputBox>
                <label htmlFor="newPasswordConfirm">새 비밀번호 확인</label>
                <input
                  id="newPasswordConfirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="새 비밀번호 확인"
                  value={newPasswordConfirm}
                  onChange={e => setNewPasswordConfirm(e.target.value)}
                />
              </InputBox>
              <button type="button" onClick={() => changeMyPassword()}>
                비밀번호 변경
              </button>
            </PasswordBox>
          )}
        </BottomModalBox>
      </ModalWrapper>
    </Modal>
  );
}

const ModalWrapper = styled.div<WithTheme>`
  display: flex;
  width: 400px;
  margin: 0 auto;
  flex-direction: column;
  gap: 30px;
  padding-bottom: 36px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.topBg};
  @media ${({ theme }) => theme.device.mobile} {
    width: calc(100vw - 40px);
  }
`;

const TopModalBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  padding: 20px;
  border-radius: 12px 12px 0 0;

  svg {
    color: ${({ theme }) => theme.colors.menuColor};
    margin-left: auto;
    width: 22px;
    height: 22px;
    cursor: pointer;
  }
`;

const CenterModalBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 10px 0;

  img {
    border-radius: 999px;
    height: 48px;
  }

  h2 {
    font-family: 'Jua', sans-serif;
    font-size: ${({ theme }) => theme.sizes.bigLarge};
    color: ${({ theme }) => theme.colors.purpleColor};
    font-weight: 600;
  }
`;

const BottomModalBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 28px;

  button {
    margin-top: 8px;
    width: 100%;
    padding: 12px 60px;
    gap: 16px;
    background-color: ${({ theme }) => theme.colors.purpleColor};
    color: #ffffff;
    border: 1px solid rgba(225, 225, 225, 1);
    border-radius: 80px;
    font-family: 'Jua', sans-serif;
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: 500;
    cursor: pointer;
  }
`;

const MahjongBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.lineColor};

  p {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.subColor};
    text-align: center;
  }

  /* BottomModalBox의 기본 버튼(보라) 대신 보조 스타일로 오버라이드 */
  button {
    margin-top: 0;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.bronzeColor};
    border: 1px solid ${({ theme }) => theme.colors.bronzeColor};
  }

  button.cancel {
    color: #ff5e57;
    border-color: #ff5e57;
  }
`;

const PasswordBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.lineColor};

  h3 {
    font-family: 'Jua', sans-serif;
    font-size: ${({ theme }) => theme.sizes.medium};
    color: ${({ theme }) => theme.colors.purpleColor};
    font-weight: 600;
    text-align: left;
  }
`;

const InputBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 4px;

  label {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    text-align: left;
    color: ${({ theme }) => theme.colors.bronzeColor};
    font-weight: 600;
    padding: 0 8px;
    white-space: nowrap;
  }

  input {
    height: 40px;
    width: 100%;
    padding: 0 8px;
    border: 1px solid #c4c4c4; /* CKEditor 기본 테두리 색상 */
    border-radius: 4px;
    box-shadow: none;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.noticeColor};
    }

    /* iOS Safari 자동 줌 방지 */
    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
    }
  }

  .readonly-input {
    background-color: transparent;
    border: none;
  }
`;
