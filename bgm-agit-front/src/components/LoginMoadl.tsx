//로그인 / 회원가입 modal
import { useState } from 'react';
import Modal from './Modal.tsx';
import styled from 'styled-components';
import modalLogo from '/favicon.ico';
import naver from '/naver.png';
import kakao from '/kakao.png';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';
import type { WithTheme } from '../styles/styled-props.ts';
import { useFormLoginPost, useSignupPost, useRefetchMainMenu } from '../recoil/fetch.ts';

type Props = {
  onClose: () => void;
};

type Mode = 'login' | 'signup';

const PHONE_REGEX = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;

export default function LoginMoadl({ onClose }: Props) {
  const { postFormLogin } = useFormLoginPost();
  const { postSignup } = useSignupPost();
  const refetchMainMenu = useRefetchMainMenu();

  const [mode, setMode] = useState<Mode>('login');

  // 로그인 입력
  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 회원가입 입력
  const [name, setName] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  function socialLogin(name: string) {
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

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nickname = loginNickname.trim();
    if (!nickname || !loginPassword) {
      toast.error('닉네임과 비밀번호를 입력해 주세요.');
      return;
    }
    // 로그인 성공 시: 새로고침 없이 메뉴만 다시 받아오고(서버가 로그인 권한으로 필터링하는
    // 마이페이지 등 권한 메뉴 갱신) 모달을 닫는다. reload를 하지 않으므로 성공 토스트가 정상 노출됨.
    postFormLogin({ nickname, password: loginPassword }, () => {
      refetchMainMenu();
      onClose();
    });
  };

  const handleSignupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedNickname = signupNickname.trim();
    const trimmedPhone = phoneNo.trim();

    if (!trimmedName || !trimmedNickname || !trimmedPhone || !signupPassword) {
      toast.error('모든 항목을 입력해 주세요.');
      return;
    }
    if (!PHONE_REGEX.test(trimmedPhone)) {
      toast.error('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
      return;
    }
    if (signupPassword.length < 4) {
      toast.error('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    if (signupPassword !== passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    postSignup(
      {
        name: trimmedName,
        nickname: trimmedNickname,
        phoneNo: trimmedPhone,
        password: signupPassword,
      },
      () => {
        // 가입 성공 시 로그인 화면으로 전환하고 닉네임을 채워 둠
        setLoginNickname(trimmedNickname);
        setLoginPassword('');
        setName('');
        setSignupNickname('');
        setPhoneNo('');
        setSignupPassword('');
        setPasswordConfirm('');
        setMode('login');
      }
    );
  };

  return (
    <Modal onClose={onClose} closeOnBackdrop={false}>
      <LoginModalWrapper>
        <TopModalBox>
          <MdClose onClick={onClose} />
        </TopModalBox>
        <CenterModalBox>
          <img src={modalLogo} alt="로고" />
          <h2>{mode === 'login' ? '로그인' : '회원가입'}</h2>
        </CenterModalBox>

        {mode === 'login' ? (
          <>
            <FormBox onSubmit={handleLoginSubmit}>
              <Input
                type="text"
                placeholder="닉네임"
                value={loginNickname}
                onChange={e => setLoginNickname(e.target.value)}
                autoComplete="username"
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                autoComplete="current-password"
              />
              <SubmitButton type="submit">로그인</SubmitButton>
            </FormBox>

            <SwitchLine>
              아직 회원이 아니신가요?
              <button type="button" onClick={() => setMode('signup')}>
                회원가입
              </button>
            </SwitchLine>

            <Divider>
              <span>기존 소셜 회원 로그인</span>
            </Divider>

            <BottomModalBox>
              <button onClick={() => socialLogin('KAKAO')}>
                <img src={kakao} alt="카카오 로그인 로고" />
                카카오로 계속하기
              </button>
              <button onClick={() => socialLogin('NAVER')}>
                <img src={naver} alt="네이버 로그인 로고" />
                네이버로 계속하기
              </button>
            </BottomModalBox>
          </>
        ) : (
          <>
            <FormBox onSubmit={handleSignupSubmit}>
              <Input
                type="text"
                placeholder="이름"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
              <Input
                type="text"
                placeholder="닉네임"
                value={signupNickname}
                onChange={e => setSignupNickname(e.target.value)}
                autoComplete="username"
              />
              <Input
                type="tel"
                placeholder="전화번호 (예: 010-1234-5678)"
                value={phoneNo}
                onChange={e => setPhoneNo(e.target.value)}
                autoComplete="tel"
              />
              <Input
                type="password"
                placeholder="비밀번호 (4자 이상)"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                type="password"
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
              />
              <SubmitButton type="submit">회원가입</SubmitButton>
            </FormBox>

            <SwitchLine>
              이미 회원이신가요?
              <button type="button" onClick={() => setMode('login')}>
                로그인
              </button>
            </SwitchLine>
          </>
        )}
      </LoginModalWrapper>
    </Modal>
  );
}

const LoginModalWrapper = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 360px;
  max-width: 92vw;
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
  gap: 16px;
  padding: 4px 0;

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

const FormBox = styled.form<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 30px;
`;

const Input = styled.input<WithTheme>`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.inputColor};
  font-size: ${({ theme }) => theme.sizes.small};

  &::placeholder {
    color: ${({ theme }) => theme.colors.navColor};
  }

  /* iOS Safari 자동 줌 방지 */
  @media ${({ theme }) => theme.device.mobile} {
    font-size: 16px;
  }
`;

const SubmitButton = styled.button<WithTheme>`
  width: 100%;
  margin-top: 4px;
  padding: 12px;
  border: none;
  border-radius: 80px;
  background-color: ${({ theme }) => theme.colors.purpleColor};
  color: ${({ theme }) => theme.colors.white};
  font-family: 'Jua', sans-serif;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: 600;
  cursor: pointer;
`;

const SwitchLine = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 0 30px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};

  button {
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.purpleColor};
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const Divider = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 30px;
  color: ${({ theme }) => theme.colors.navColor};
  font-size: ${({ theme }) => theme.sizes.xsmall};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.lineColor};
  }
`;

const BottomModalBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 30px;

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
