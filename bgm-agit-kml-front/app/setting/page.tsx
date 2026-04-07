'use client';

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';

import React, { useEffect, useState } from 'react';

import { Check } from 'phosphor-react';
import { useInsertPost, useUpdatePost } from '@/services/main.service';
import { alertDialog, confirmDialog } from '@/utils/alert';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFetchSetting } from '@/services/setting.service';
import { useSettingStore } from '@/store/setting';
import { useUserStore } from '@/store/user';

export default function Write() {
  const { insert } = useInsertPost();
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const fetchSetting = useFetchSetting();
  const settingData = useSettingStore((state) => state.setting);
  console.log('settingData', settingData);

  const [form, setForm] = useState({
    turning: 0,
    firstUma: 0,
    secondUma: 0,
    thirdUma: 0,
    fourthUma: 0,
  });

  const handleChange = (key: keyof typeof form, value: number) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      await alertDialog('유저 정보가 없습니다. \n 로그인 후 이용해주세요.', 'error');
      router.push('/login');
    }

    insert({
      url: '/bgm-agit/settings',
      body: {
        turning: form.turning,
        firstUma: form.firstUma,
        secondUma: form.secondUma,
        thirdUma: form.thirdUma,
        fourthUma: form.fourthUma,
      },
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        await alertDialog('설정이 저장되었습니다.', 'success');
      },
    });
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  useEffect(() => {
    if (settingData) {
      setForm({
        turning: settingData.turning,
        firstUma: settingData.firstUma,
        secondUma: settingData.secondUma,
        thirdUma: settingData.thirdUma,
        fourthUma: settingData.fourthUma,
      });
    }
  }, [settingData]);

  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/write.jpg')} alt="" />
        </HeroBg>
        <FixedDarkOverlay />
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 1.2,
            ease: [0.65, 0, 0.35, 1],
          }}
        />

        <HeroContent>
          <>
            <h1>Scoring Settings</h1>
            <span>변환점과 우마 값을 설정하세요.</span>
          </>
        </HeroContent>
      </Hero>
      <TableBox>
        <Top>
          <Button onClick={handleSubmit}>
            <Check weight="bold" />
          </Button>
        </Top>
        <Center>
          <WriteCroup>
            <FieldsWrapper>
              <Field className="score">
                <label>반환점</label>
                <input
                  type="number"
                  value={form.turning}
                  onChange={(e) => handleChange('turning', Number(e.target.value))}
                />
              </Field>
              <Field className="score">
                <label>1등 우마</label>
                <input
                  type="number"
                  value={form.firstUma}
                  onChange={(e) => handleChange('firstUma', Number(e.target.value))}
                />
              </Field>
              <Field className="score">
                <label>2등 우마</label>
                <input
                  type="number"
                  value={form.secondUma}
                  onChange={(e) => handleChange('secondUma', Number(e.target.value))}
                />
              </Field>
              <Field className="score">
                <label>3등 우마</label>
                <input
                  type="number"
                  value={form.thirdUma}
                  onChange={(e) => handleChange('thirdUma', Number(e.target.value))}
                />
              </Field>
              <Field className="score">
                <label>4등 우마</label>
                <input
                  type="number"
                  value={form.fourthUma}
                  onChange={(e) => handleChange('fourthUma', Number(e.target.value))}
                />
              </Field>
            </FieldsWrapper>
          </WriteCroup>
        </Center>
      </TableBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  gap: 36px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 120px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    filter: blur(3px);
    transform: scale(1);
  }
`;

const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 0;
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;

  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const TableBox = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 24px;
  padding: 24px 8px;
  max-width: 800px;
  margin: 0 auto;

  select {
    border: none;
    width: 100%;
    padding: 8px 4px;
    text-align: center;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: ${({ theme }) => theme.colors.whiteColor};
    border-radius: 4px;
    cursor: pointer;
  }
`;

const Top = styled.section`
  display: flex;
  width: 100%;
  position: relative;
  justify-content: right;
  align-items: center;
  padding: 24px 0;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.lineColor};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.colors.blackColor};
  }
`;

const Center = styled.section<>`
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  text-align: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  border-radius: 4px;

  button {
    background-color: #d9625e;
    margin: 24px 24px 24px auto;
  }

  h4 {
    display: inline-flex;
    font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.blackColor};
    padding: 20px 8px;
    border-radius: 50%;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
    }
  }
`;
const FieldsWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  flex-wrap: nowrap;
  overflow-y: hidden;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &.memo {
    width: 100%;
  }

  &.top {
    width: 100%;
  }

  &.search {
    flex: 2;
  }

  &.user {
    flex: 2;
  }

  &.score {
    flex: 1;
  }
`;

const WriteCroup = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 4px;
  flex-wrap: nowrap;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.grayColor};
    font-weight: 600;
    padding: 4px 4px;
    text-align: left;
  }

  input {
    border: none;
    width: 100%;
    padding: 8px 4px;
    text-align: center;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: ${({ theme }) => theme.colors.whiteColor};
    border-radius: 4px;

    &::placeholder {
      color: ${({ theme }) => theme.colors.softColor};
    }
  }

  textarea {
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    width: 100%;
    resize: none;
    padding: 8px 12px;
    text-align: left;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: ${({ theme }) => theme.colors.whiteColor};
    border-radius: 4px;

    &::placeholder {
      color: ${({ theme }) => theme.colors.grayColor};
    }
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  width: 32px;
  height: 32px;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;
