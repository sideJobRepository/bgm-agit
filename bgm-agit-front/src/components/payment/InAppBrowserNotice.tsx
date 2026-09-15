import styled from 'styled-components';
import { toast } from 'react-toastify';
import {
  copyCurrentUrl,
  detectInAppBrowser,
  openInExternalBrowser,
  type InAppBrowser,
} from '../../utils/inAppBrowser.ts';

type InAppBrowserNoticeProps = {
  /** 감지 결과를 이미 들고 있으면 넘긴다. 없으면 여기서 다시 감지한다. */
  info?: InAppBrowser;
};

/**
 * 인앱 웹뷰 결제 경고 배너 (차단이 아니다).
 *
 * 카드사 앱 인증을 마치고 돌아올 때 인앱 웹뷰가 파기돼 결제가 완료되지 않는 경우가 있다.
 * 다만 자동 복귀되는 카드사(신한 등)는 인앱에서도 정상 결제되는 것이 확인됐으므로,
 * 결제를 막지 않고 기본 브라우저를 권장만 한다. 막아버리면 되는 조합까지 이탈시킨다.
 */
export default function InAppBrowserNotice({ info }: InAppBrowserNoticeProps) {
  const detected = info ?? detectInAppBrowser();
  const appName = detected.name ?? '인앱 브라우저';

  async function handleCopy() {
    const copied = await copyCurrentUrl();
    if (copied) {
      toast.success('주소를 복사했습니다. 사파리에 붙여넣어 결제해 주세요.');
      return;
    }
    toast.error('주소 복사에 실패했습니다. 주소창을 길게 눌러 직접 복사해 주세요.');
  }

  return (
    <Panel>
      <PanelTitle>기본 브라우저를 권장합니다</PanelTitle>
      <PanelText>
        {appName}에서는 카드사 앱 인증을 마치고 돌아올 때 결제가 완료되지 않는 경우가 있습니다.
        <br />
        그대로 진행하셔도 되지만, 결제가 끝나지 않으면 크롬·사파리로 다시 시도해 주세요.
      </PanelText>
      <ButtonRow>
        {detected.isAndroid ? (
          <PrimaryButton type="button" onClick={openInExternalBrowser}>
            기본 브라우저로 열기
          </PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={handleCopy}>
            주소 복사
          </PrimaryButton>
        )}
      </ButtonRow>
    </Panel>
  );
}

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e0d6cc;
  border-radius: 8px;
  background: #fdf8f3;
`;

const PanelTitle = styled.strong`
  color: #5c3a21;
  font-size: 16px;
`;

const PanelText = styled.p`
  margin: 0;
  color: #4a4a4a;
  font-size: 14px;
  line-height: 1.6;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PrimaryButton = styled.button`
  flex: 1 1 140px;
  padding: 12px 16px;
  border: 0;
  border-radius: 6px;
  background: #1a7d55;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
`;
