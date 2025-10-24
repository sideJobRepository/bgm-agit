//로그인 modal
import Modal from './Modal.tsx';
import styled from 'styled-components';
import modalLogo from '/favicon.ico';
import naver from '/naver.png';
import kakao from '/kakao.png';
import { MdClose } from 'react-icons/md';
import type { WithTheme } from '../styles/styled-props.ts';

type Props = {
  onClose: () => void;
};

export default function LoginMoadl({ onClose }: Props) {
  function login(name: string) {
    const CLIENT_ID = import.meta.env[`VITE_${name}_CLIENT_ID`];
    const REDIRECT_URL = import.meta.env[`VITE_${name}_REDIRECT_URL`];

    let authUrl;

    if (name === 'KAKAO') {
      authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&response_type=code`;
    } else if (name === 'NAVER') {
      const STATE = crypto.randomUUID();
      authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&state=${STATE}`;
    }

    if (authUrl) window.location.href = authUrl;
  }

  return (
    <>
      <Modal onClose={onClose}>
        <LoginModalWrapper>
          <TopModalBox>
            <MdClose onClick={onClose} />
          </TopModalBox>
          <CenterModalBox>
            <img src={modalLogo} alt="로고" />
            <h2>간편 로그인</h2>
          </CenterModalBox>
          <BottomModalBox>
            <button onClick={() => login('KAKAO')}>
              <img src={kakao} alt="카카오 로그인 로고" />
              카카오로 계속하기
            </button>
            <button onClick={() => login('NAVER')}>
              <img src={naver} alt="네이버 로그인 로고" />
              네이버로 계속하기
            </button>
          </BottomModalBox>
        </LoginModalWrapper>
      </Modal>
    </>
  );
}

const LoginModalWrapper = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding-bottom: 36px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.topBg};
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
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
  padding: 20px 30px 30px 30px;

  button {
    display: flex;
    align-items: center;
    max-width: 310px;
    width: 100%;
    padding: 12px 60px;
    gap: 16px;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.menuColor};
    border: 1px solid rgba(225, 225, 225, 1);
    border-radius: 80px;
    font-family: 'Jua', sans-serif;
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: 500;
    cursor: pointer;

    img {
      width: 24px;
      height: 24px;
    }
  }
`;
