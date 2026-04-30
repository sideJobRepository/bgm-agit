'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';
import { useLoginPost } from '@/services/auth.service';

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { postUser } = useLoginPost();

  useEffect(() => setMounted(true), []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nickname.trim() || !password) return;

    const rawRedirect = new URLSearchParams(window.location.search).get('redirect') || '/';
    const redirectPath = rawRedirect.startsWith('/') ? rawRedirect : '/';

    postUser({ nickname: nickname.trim(), password }, () => {
      router.replace(redirectPath);
    });
  };

  if (!mounted) return null;

  return (
    <Wrapper>
      <Title
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1>Sign In to Continue</h1>
        <span>기록은 시작의 첫 걸음입니다.</span>
      </Title>
      <LoginBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
      >
        <Top>
          <img src={withBasePath('/kmlMain.png')} alt="로고" />
        </Top>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <SubmitButton type="submit">로그인</SubmitButton>
          <SignupLink href="/signup">회원가입</SignupLink>
        </Form>
      </LoginBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: auto;
  flex-direction: column;
  gap: 36px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const Title = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 90%;
  max-width: 800px;
  align-self: center;
  text-align: center;
  gap: 8px;
  margin-bottom: 24px;

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.grayColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.desktop.sizes.md};
    }
  }
`;

const LoginBox = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 80%;
  min-height: 420px;
  gap: 24px;
  max-width: 600px;
  padding: 24px 0;
  margin: auto;
  border: 8px solid #f3f3f3;
  background-color: #f3f3f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
`;

const Top = styled.section`
  display: flex;
  width: 100%;
  height: 200px;
  margin: 0;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;

  img {
    width: auto;
    height: 100%;
    object-fit: cover;
    object-position: top;
    display: block;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
`;

const Input = styled.input`
  width: 100%;
  max-width: 310px;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #d0d0d0;
  background-color: #ffffff;
  font-size: ${({ theme }) => theme.desktop.sizes.md};

  &:focus {
    outline: none;
    border-color: #2f250c;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  max-width: 310px;
  height: 52px;
  justify-content: center;
  width: 100%;
  border: none;
  background-color: #2f250c;
  color: #ffffff;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 600;
  cursor: pointer;
`;

const SignupLink = styled(Link)`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.grayColor};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  text-decoration: underline;
`;
