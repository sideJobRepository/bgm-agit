'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, FloppyDisk, Bell } from 'phosphor-react';
import { useFetchMyPage, MyPageInfo } from '@/services/mypage.service';
import { useUpdatePost } from '@/services/main.service';
import { alertDialog, confirmDialog } from '@/utils/alert';
import { useMyPageStore } from '@/store/myPage';
import { useUserStore } from '@/store/user';

export default function MyPageModal() {
  const isOpen = useMyPageStore((state) => state.isOpen);
  const close = useMyPageStore((state) => state.close);
  const user = useUserStore((state) => state.user);

  const fetchMyPage = useFetchMyPage();
  const { update } = useUpdatePost();

  const [info, setInfo] = useState<MyPageInfo | null>(null);
  const [phoneNo, setPhoneNo] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    if (!isOpen || !user) return;
    fetchMyPage((data) => {
      setInfo(data);
      setPhoneNo(data.phoneNo ?? '');
    });
    setPw({ current: '', next: '', confirm: '' });
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const handleSavePhone = async () => {
    if (!info) return;
    if (!phoneNo.trim()) {
      await alertDialog('전화번호를 입력해주세요.', 'warning');
      return;
    }
    if (phoneNo.trim() === info.phoneNo) {
      await alertDialog('변경된 내용이 없습니다.', 'warning');
      return;
    }
    const result = await confirmDialog('전화번호를 변경하시겠습니까?', 'warning');
    if (!result.isConfirmed) return;

    update({
      url: '/bgm-agit/mypage',
      body: {
        nickName: info.nickName,
        phoneNo: phoneNo.trim(),
        nickNameUseStatus: info.nickNameUseStatus,
        mahjongUseStatus: info.mahjongUseStatus,
        alimtalkStatus: info.alimtalkStatus,
      },
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        await alertDialog('전화번호가 변경되었습니다.', 'success');
        setInfo({ ...info, phoneNo: phoneNo.trim() });
      },
    });
  };

  const handleToggleAlimtalk = async () => {
    if (!info) return;
    const next = info.alimtalkStatus === 'Y' ? 'N' : 'Y';
    const message =
      next === 'Y'
        ? '대국 기록 알림톡을 받으시겠습니까?'
        : '대국 기록 알림톡 수신을 끄시겠습니까?';
    const result = await confirmDialog(message, 'warning');
    if (!result.isConfirmed) return;

    update({
      url: '/bgm-agit/mypage',
      body: {
        nickName: info.nickName,
        phoneNo: info.phoneNo,
        nickNameUseStatus: info.nickNameUseStatus,
        mahjongUseStatus: info.mahjongUseStatus,
        alimtalkStatus: next,
      },
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        setInfo({ ...info, alimtalkStatus: next });
        await alertDialog(
          next === 'Y'
            ? '알림톡 수신을 켰습니다.'
            : '알림톡 수신을 껐습니다.',
          'success'
        );
      },
    });
  };

  const handleChangePassword = async () => {
    if (!pw.current) {
      await alertDialog('현재 비밀번호를 입력해주세요.', 'warning');
      return;
    }
    if (pw.next.length < 4) {
      await alertDialog('새 비밀번호는 최소 4자 이상이어야 합니다.', 'warning');
      return;
    }
    if (pw.next !== pw.confirm) {
      await alertDialog('새 비밀번호와 확인이 일치하지 않습니다.', 'warning');
      return;
    }
    const result = await confirmDialog('비밀번호를 변경하시겠습니까?', 'warning');
    if (!result.isConfirmed) return;

    update({
      url: '/bgm-agit/mypage/password',
      body: { currentPassword: pw.current, newPassword: pw.next },
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        await alertDialog('비밀번호가 변경되었습니다.', 'success');
        setPw({ current: '', next: '', confirm: '' });
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          onClick={close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Header>
              <h2>마이페이지</h2>
              <CloseButton onClick={close}>
                <X weight="bold" />
              </CloseButton>
            </Header>

            {!user ? (
              <Empty>로그인 후 이용해주세요.</Empty>
            ) : (
              <>
                <Section>
                  <SectionTitle>기본 정보</SectionTitle>
                  <Field>
                    <label>이름</label>
                    <ReadOnly>{info?.name ?? '-'}</ReadOnly>
                  </Field>
                  <Field>
                    <label>닉네임</label>
                    <ReadOnly>{info?.nickName ?? '-'}</ReadOnly>
                  </Field>
                  <Field>
                    <label>전화번호</label>
                    <Row>
                      <input
                        type="tel"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        placeholder="010-1234-5678 또는 01012345678"
                        autoComplete="tel"
                      />
                      <PrimaryButton type="button" onClick={handleSavePhone}>
                        <FloppyDisk weight="bold" />
                        저장
                      </PrimaryButton>
                    </Row>
                  </Field>
                </Section>

                <Divider />

                <Section>
                  <SectionTitle>알림 설정</SectionTitle>
                  <ToggleField>
                    <ToggleLabel>
                      <Bell weight="bold" />
                      <div>
                        <ToggleTitle>대국 기록 알림톡 수신</ToggleTitle>
                        <ToggleHint>
                          내가 참여한 대국의 점수가 등록되면 알림톡을 받습니다.
                        </ToggleHint>
                      </div>
                    </ToggleLabel>
                    <Toggle
                      type="button"
                      role="switch"
                      aria-checked={info?.alimtalkStatus === 'Y'}
                      $on={info?.alimtalkStatus === 'Y'}
                      onClick={handleToggleAlimtalk}
                    >
                      <ToggleThumb $on={info?.alimtalkStatus === 'Y'} />
                    </Toggle>
                  </ToggleField>
                </Section>

                <Divider />

                <Section>
                  <SectionTitle>비밀번호 변경</SectionTitle>
                  <Field>
                    <label>현재 비밀번호</label>
                    <input
                      type="password"
                      value={pw.current}
                      onChange={(e) => setPw({ ...pw, current: e.target.value })}
                      autoComplete="current-password"
                    />
                  </Field>
                  <Field>
                    <label>새 비밀번호 (4자 이상)</label>
                    <input
                      type="password"
                      value={pw.next}
                      onChange={(e) => setPw({ ...pw, next: e.target.value })}
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field>
                    <label>새 비밀번호 확인</label>
                    <input
                      type="password"
                      value={pw.confirm}
                      onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                      autoComplete="new-password"
                    />
                  </Field>
                  <ActionRow>
                    <PrimaryButton type="button" onClick={handleChangePassword}>
                      <Key weight="bold" />
                      비밀번호 변경
                    </PrimaryButton>
                  </ActionRow>
                </Section>
              </>
            )}
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 12px;
    align-items: flex-end;
  }
`;

const Card = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.whiteColor};
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 18px;
    gap: 14px;
    border-radius: 12px 12px 8px 8px;
    max-height: 92vh;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid ${({ theme }) => theme.colors.lineColor};
  padding-bottom: 12px;

  h2 {
    font-size: ${({ theme }) => theme.desktop.sizes.h5Size};
    font-weight: 700;
  }

  @media ${({ theme }) => theme.device.mobile} {
    h2 {
      font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
    }
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.grayColor};

  &:hover {
    color: ${({ theme }) => theme.colors.blackColor};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.blackColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.desktop.sizes.md};
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.grayColor};
    font-weight: 600;
  }

  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 4px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    background: ${({ theme }) => theme.colors.whiteColor};
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.colors.blackColor};
    }

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
      padding: 12px;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    label {
      font-size: ${({ theme }) => theme.desktop.sizes.xs};
    }
  }
`;

const ReadOnly = styled.div`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.recordBgColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.inputColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    padding: 12px;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: stretch;

  input {
    flex: 1;
    min-width: 0;
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-wrap: wrap;

    input {
      flex: 1 1 100%;
    }

    button {
      flex: 1 1 100%;
      justify-content: center;
    }
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;

  @media ${({ theme }) => theme.device.mobile} {
    button {
      flex: 1;
      justify-content: center;
    }
  }
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: ${({ theme }) => theme.colors.blackColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }

  svg {
    width: 14px;
    height: 14px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: 12px 16px;
    font-size: ${({ theme }) => theme.desktop.sizes.md};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.lineColor};
`;

const ToggleField = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.recordBgColor};
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.blackColor};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ToggleTitle = styled.div`
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.blackColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.desktop.sizes.md};
  }
`;

const ToggleHint = styled.div`
  font-size: ${({ theme }) => theme.desktop.sizes.xs};
  color: ${({ theme }) => theme.colors.grayColor};
  margin-top: 2px;
  line-height: 1.4;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
  }
`;

const Toggle = styled.button<{ $on: boolean }>`
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: none;
  background: ${({ $on, theme }) =>
    $on ? theme.colors.kakao : theme.colors.lineColor};
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.18s ease;
  padding: 0;

  &:hover {
    opacity: 0.9;
  }
`;

const ToggleThumb = styled.span<{ $on: boolean }>`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.whiteColor};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transform: translateX(${({ $on }) => ($on ? '20px' : '0')});
  transition: transform 0.18s ease;
`;

const Empty = styled.div`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.grayColor};
`;
