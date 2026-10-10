import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
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
} from '../../utils/pwa.ts';
import { Banner, Icon, Text, InstallButton, CloseButton } from './InstallBanner.styles.ts';

export default function InstallBanner() {
  const [canPrompt, setCanPrompt] = useState(canPromptInstall);
  // ✕ 로 닫으면 일주일 동안 안 띄운다(snoozeInstallBanner)
  const [closed, setClosed] = useState(isInstallBannerSnoozed);

  useEffect(() => subscribeInstallPrompt(() => setCanPrompt(canPromptInstall())), []);

  if (!import.meta.env.PROD || !isMobile || closed || isStandalone()) return null;

  // 안드로이드는 브라우저가 설치 가능하다고 알려 온 뒤에만 띄운다(HTTPS·manifest 조건을 브라우저가 판정).
  // 아이폰은 설치 창을 띄우는 방법이 없어 메뉴 안내만 한다
  const iosGuide = isIos && !isInAppBrowser;
  if (!canPrompt && !iosGuide) return null;

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
      <CloseButton onClick={dismiss} aria-label="닫기">
        <FiX size={18} aria-hidden="true" />
      </CloseButton>
    </Banner>
  );
}
