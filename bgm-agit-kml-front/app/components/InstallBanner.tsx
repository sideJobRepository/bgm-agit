'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  canPromptInstall,
  isInAppBrowser,
  isIos,
  isMobile,
  isInstallBannerSnoozed,
  isStandalone,
  promptInstall,
  snoozeInstallBanner,
  subscribeInstallPrompt,
} from '@/lib/pwa';

type Mode = 'hidden' | 'prompt' | 'ios';

export default function InstallBanner() {
  // 서버 렌더와 첫 화면을 맞추려고 처음엔 숨겨 두고 마운트 뒤에 판정한다.
  // ✕ 로 닫으면 일주일 동안 안 띄운다(snoozeInstallBanner)
  const [mode, setMode] = useState<Mode>('hidden');
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !isMobile() ||
      isStandalone() ||
      isInstallBannerSnoozed()
    )
      return;
    // 안드로이드는 브라우저가 설치 가능하다고 알려 온 뒤에만 띄운다(HTTPS·manifest 조건을 브라우저가 판정).
    // 아이폰은 설치 창을 띄우는 방법이 없어 메뉴 안내만 한다
    const fallback: Mode = isIos() && !isInAppBrowser() ? 'ios' : 'hidden';
    const update = () => setMode(canPromptInstall() ? 'prompt' : fallback);
    update();
    return subscribeInstallPrompt(update);
  }, []);

  if (mode === 'hidden' || closed) return null;

  const close = () => setClosed(true);
  const dismiss = () => {
    snoozeInstallBanner();
    close();
  };

  // 설치하면 브라우저가 더는 설치 가능 신호를 보내지 않아 다음 방문부터 저절로 안 뜬다.
  // 설치 창에서 취소했으면 이번 화면에서만 거둔다
  const install = async () => {
    await promptInstall();
    close();
  };

  return (
    <Banner role="dialog" aria-label="앱 설치 안내">
      <Icon src="/record/pwa/icon-192.png" alt="" />
      <Text>
        <strong>BML 앱으로 보기</strong>
        {mode === 'prompt' ? (
          <span>홈 화면에 추가하면 앱처럼 바로 열려요</span>
        ) : (
          <span>공유 버튼을 누르고 &apos;홈 화면에 추가&apos;를 선택하세요</span>
        )}
      </Text>
      {mode === 'prompt' && <InstallButton onClick={install}>설치</InstallButton>}
      <CloseButton onClick={dismiss} aria-label="닫기">
        ✕
      </CloseButton>
    </Banner>
  );
}

const Banner = styled.div`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px 12px 12px;
  background-color: ${({ theme }) => theme.colors.whiteColor};
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  /* 사이드바(100)·모달(1000)보다 아래 — 메뉴나 모달이 열리면 배너가 가리지 않게 */
  z-index: 50;
`;

const Icon = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 2px;
  color: ${({ theme }) => theme.colors.inputColor};

  strong {
    font-size: 16px;
  }
  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.grayColor};
  }
`;

const InstallButton = styled.button`
  flex-shrink: 0;
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  background-color: #5b2bc4;
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  padding: 8px;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.grayColor};
  font-size: 16px;
  cursor: pointer;
`;
