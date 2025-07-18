import styled from 'styled-components';

export default function MainPage() {
  return <MainPageWrapper>메인페이지</MainPageWrapper>;
}

const MainPageWrapper = styled.div`
  margin: 0 auto;
  height: 100%;
  padding: 20px 0;
  max-width: 1500px;
  min-width: 1023px;
  min-height: 600px;
  align-items: center;
  @media ${({ theme }) => theme.device.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;
