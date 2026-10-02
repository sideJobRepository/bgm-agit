import { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import {
  canPromptInstall,
  isInAppBrowser,
  isIos,
  isMobile,
  isStandalone,
  promptInstall,
  subscribeInstallPrompt,
} from '../../utils/pwa.ts';

// 닫으면 한동안 다시 띄우지 않는다. 매번 뜨면 화면 아래를 계속 가린다
const DISMISS_KEY = 'bgm-pwa-banner-dismissed';
const DISMISS_DAYS = 30;

function isDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // 저장이 막혀 있으면 이번 화면에서만 닫힌다
  }
}

export default function InstallBanner() {
  const [canPrompt, setCanPrompt] = useState(canPromptInstall);
  const [closed, setClosed] = useState(isDismissed);

  useEffect(() => subscribeInstallPrompt(() => setCanPrompt(canPromptInstall())), []);

  if (!import.meta.env.PROD || !isMobile || closed || isStandalone()) return null;

  // 안드로이드는 브라우저가 설치 가능하다고 알려 온 뒤에만 띄운다(HTTPS·manifest 조건을 브라우저가 판정).
  // 아이폰은 설치 창을 띄우는 방법이 없어 메뉴 안내만 한다
  const iosGuide = isIos && !isInAppBrowser;
  if (!canPrompt && !iosGuide) return null;

  const close = () => {
    markDismissed();
    setClosed(true);
  };

  const install = async () => {
    await promptInstall();
    // 설치했든 설치 창에서 취소했든 배너는 거둔다. 취소한 사람에게 바로 다시 띄우지 않는다
    close();
  };

  return (
    <Banner role="dialog" aria-label="앱 설치 안내">
      <Icon src="/pwa/icon-192.png" alt="" />
      <Text>
        <strong>BGM 아지트 앱으로 보기</strong>
        {canPrompt ? (
          <span>홈 화면에 추가하면 앱처럼 바로 열려요</span>
        ) : (
          <span>공유 버튼을 누르고 '홈 화면에 추가'를 선택하세요</span>
        )}
      </Text>
      {canPrompt && <InstallButton onClick={install}>설치</InstallButton>}
      <CloseButton onClick={close} aria-label="닫기">
        ✕
      </CloseButton>
    </Banner>
  );
}

const Banner = styled.div<WithTheme>`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px 12px 12px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  /* 헤더·모달(3 이상)보다 아래 — 모달이 열리면 배너가 가리지 않게 */
  z-index: 2;
`;

const Icon = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
`;

const Text = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 2px;
  color: ${({ theme }) => theme.colors.text};

  strong {
    font-size: ${({ theme }) => theme.sizes.medium};
  }
  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.subColor};
  }
`;

const InstallButton = styled.button<WithTheme>`
  flex-shrink: 0;
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.purpleColor};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 600;
  cursor: pointer;
`;

const CloseButton = styled.button<WithTheme>`
  flex-shrink: 0;
  padding: 8px;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.navColor};
  font-size: ${({ theme }) => theme.sizes.medium};
  cursor: pointer;
`;
