import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import type { WithTheme } from '../styles/styled-props.ts';

export default function Error() {
  const navigate = useNavigate();

  return (
    <ErrorWrapper>
      <ErrorBox>
        <Title>⚠️ Error</Title>
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

const ErrorWrapper = styled.div<WithTheme>`
  width: 100%;
  height: 100vh;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.topBg};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ErrorBox = styled.div<WithTheme>`
  text-align: center;
  background-color: ${({ theme }) => theme.colors.white};
  border: 3px dashed red;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1<WithTheme>`
  font-family: 'Bungee', sans-serif;
  font-size: ${({ theme }) => theme.sizes.xxlarge};
  color: red;
  margin-bottom: 16px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.bigLarge};
  }
`;

const Message = styled.p<WithTheme>`
  font-family: 'Jua', sans-serif;
  font-size: ${({ theme }) => theme.sizes.bigLarge};
  color: ${({ theme }) => theme.colors.menuColor};
  line-height: 1.5;
  margin-bottom: 24px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.medium};
  }
`;

const RetryButton = styled.button<WithTheme>`
  font-family: 'Jua', sans-serif;
  background-color: ${({ theme }) => theme.colors.greenColor};
  color: ${({ theme }) => theme.colors.white};
  padding: 10px 24px 8px 24px;
  font-size: ${({ theme }) => theme.sizes.large};
  border: none;
  border-radius: 8px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
