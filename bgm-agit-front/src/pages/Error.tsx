import { useNavigate } from 'react-router-dom';
import { ErrorWrapper, ErrorBox, Title, Message, RetryButton } from './Error.styles.ts';

export default function Error() {
  const navigate = useNavigate();

  return (
    <ErrorWrapper>
      <ErrorBox>
        <Title>Error</Title>
        <Message>
          페이지를 불러오는 중 문제가 발생했습니다.
          <br />
          잠시 후 다시 시도하거나 메인으로 돌아가주세요.
        </Message>
        <RetryButton onClick={() => navigate('/')}>메인으로 돌아가기</RetryButton>
      </ErrorBox>
    </ErrorWrapper>
  );
}
