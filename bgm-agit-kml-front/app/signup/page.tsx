'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';
import { useSignupPost } from '@/services/auth.service';
import { alertDialog } from '@/utils/alert';

export default function Signup() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    phoneNo: '',
    password: '',
    passwordConfirm: '',
  });
  const router = useRouter();
  const { postSignup } = useSignupPost();

  useEffect(() => setMounted(true), []);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.nickname.trim() || !form.phoneNo.trim() || !form.password) {
      alertDialog('모든 항목을 입력해 주세요.', 'warning');
      return;
    }
    if (form.password.length < 8) {
      alertDialog('비밀번호는 최소 8자 이상이어야 합니다.', 'warning');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      alertDialog('비밀번호가 일치하지 않습니다.', 'warning');
      return;
    }

    postSignup(
      {
        name: form.name.trim(),
        nickname: form.nickname.trim(),
        phoneNo: form.phoneNo.trim(),
        password: form.password,
      },
      () => router.replace('/login')
    );
  };

  if (!mounted) return null;

  return (
    <Wrapper>
      <Title
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1>Create an Account</h1>
        <span>기록을 시작할 준비를 합니다.</span>
      </Title>
      <SignupBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
      >
        <Top>
          <img src={withBasePath('/kmlMain.png')} alt="로고" />
        </Top>
        <Form onSubmit={handleSubmit}>
          <Input type="text" placeholder="이름" value={form.name} onChange={handleChange('name')} autoComplete="name" />
          <Input
            type="text"
            placeholder="닉네임"
            value={form.nickname}
            onChange={handleChange('nickname')}
            autoComplete="username"
          />
          <Input
            type="tel"
            placeholder="전화번호 (예: 010-1234-5678)"
            value={form.phoneNo}
            onChange={handleChange('phoneNo')}
            autoComplete="tel"
          />
          <Input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={form.password}
            onChange={handleChange('password')}
            autoComplete="new-password"
          />
          <Input
            type="password"
            placeholder="비밀번호 확인"
            value={form.passwordConfirm}
            onChange={handleChange('passwordConfirm')}
            autoComplete="new-password"
          />
          <SubmitButton type="submit">가입하기</SubmitButton>
          <BackLink href="/login">로그인으로 돌아가기</BackLink>
        </Form>
      </SignupBox>
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
  }
`;

const SignupBox = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 80%;
  min-height: 520px;
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
  height: 140px;
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
  gap: 10px;
  padding: 0 16px;
`;

const Input = styled.input`
  width: 100%;
  max-width: 310px;
  height: 44px;
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
  height: 48px;
  justify-content: center;
  width: 100%;
  margin-top: 4px;
  border: none;
  background-color: #2f250c;
  color: #ffffff;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 600;
  cursor: pointer;
`;

const BackLink = styled(Link)`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.grayColor};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  text-decoration: underline;
`;
