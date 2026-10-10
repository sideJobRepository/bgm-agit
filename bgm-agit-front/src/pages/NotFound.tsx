// 없는 주소로 들어왔을 때(라우트에 안 걸린 모든 주소). 예전에는 머리·푸터만 있고 본문이 빈 화면이었다.
// nginx 는 어느 주소든 index.html 을 200 으로 주므로, 검색엔진이 빈 페이지를 담지 않게 noindex 를 건다
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrapper, Box, Code, Title, Message, Buttons, SubButton, MainButton } from './NotFound.styles.ts';

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
