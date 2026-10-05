// 없는 주소로 들어왔을 때(라우트에 안 걸린 모든 주소). 예전에는 머리·푸터만 있고 본문이 빈 화면이었다.
// nginx 는 어느 주소든 index.html 을 200 으로 주므로, 검색엔진이 빈 페이지를 담지 않게 noindex 를 건다
import { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import type { WithTheme } from '../styles/styled-props.ts';

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]');
    const prev = robots?.getAttribute('content');
    robots?.setAttribute('content', 'noindex, follow');
    document.title = '페이지를 찾을 수 없습니다 | BGM 아지트';
    return () => {
      if (prev) robots?.setAttribute('content', prev);
    };
  }, []);

  return (
    <Wrapper>
      <Box>
        <Code>404</Code>
        <Title>페이지를 찾을 수 없습니다</Title>
        <Message>
          주소가 잘못되었거나 삭제·이동된 페이지입니다.
          <br />
          주소를 다시 확인해 주세요.
        </Message>
        <Buttons>
          <SubButton type="button" onClick={() => navigate(-1)}>
            이전 페이지
          </SubButton>
          <MainButton type="button" onClick={() => navigate('/', { replace: true })}>
            메인으로
          </MainButton>
        </Buttons>
      </Box>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 0;
`;

const Box = styled.div<WithTheme>`
  width: 100%;
  max-width: 440px;
  padding: 40px 32px 32px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.topBg};
  border: 1px solid ${({ theme }) => theme.colors.subTextBoxColor};
  text-align: center;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 32px 20px 20px;
  }
`;

const Code = styled.div<WithTheme>`
  font-size: 72px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.bottomBg};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 56px;
  }
`;

const Title = styled.h1<WithTheme>`
  margin-top: 16px;
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.activeMenuColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.menu};
  }
`;

const Message = styled.p<WithTheme>`
  margin-top: 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.subColor};
  word-break: keep-all;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 28px;
`;

const BaseButton = styled.button<WithTheme>`
  flex: 1;
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
`;

const SubButton = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.colors.bottomBg};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.activeMenuColor};
`;

const MainButton = styled(BaseButton)`
  border: none;
  background-color: ${({ theme }) => theme.colors.greenColor};
  color: ${({ theme }) => theme.colors.white};
`;
