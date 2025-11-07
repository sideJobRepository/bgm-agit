import Modal from './Modal.tsx';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { MdClose } from 'react-icons/md';
import modalLogo from '/favicon.ico';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { myPageState } from '../recoil/state/userState.ts';
import { useMyPageFetch, useUpdatePost } from '../recoil/fetch.ts';
import { showConfirmModal } from './confirmAlert.tsx';
import { toast } from 'react-toastify';

type Props = {
  onClose: () => void;
};

export default function MyPageModal({ onClose }: Props) {
  const { update } = useUpdatePost();

  const fetchMyPage = useMyPageFetch();
  const items = useRecoilValue(myPageState);
  console.log('myppageItems', items);

  const [nickName, setNickName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  //업데이트
  async function updateData() {
    const param = {
      id: items?.id,
      nickName: nickName,
      phoneNo: phoneNumber,
      nickNameUseStatus: 'Y',
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

  useEffect(() => {
    fetchMyPage();
  }, []);

  useEffect(() => {
    setNickName(items?.nickName);
    setPhoneNumber(items?.phoneNo);
  }, [items]);

  return (
    <Modal onClose={onClose}>
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
            <label htmlFor="email">EMAIL</label>
            <input
              id="email"
              className="readonly-input"
              type="text"
              placeholder="이메일을 입력해주세요."
              value={items?.mail}
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
        </BottomModalBox>
      </ModalWrapper>
    </Modal>
  );
}

const ModalWrapper = styled.div<WithTheme>`
  display: flex;
  width: 300px;
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
  gap: 8px;
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
  }

  .readonly-input {
    background-color: transparent;
    border: none;
  }
`;
