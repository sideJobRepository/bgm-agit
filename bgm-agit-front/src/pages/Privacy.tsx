import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export default function Privacy() {
  return (
    <Container>
      <Title>개인정보 처리방침</Title>

      <Section>
        <SubTitle>1. 수집하는 개인정보 항목</SubTitle>
        <Text>BGM아지트는 회원가입을 위해 아래와 같은 개인정보를 수집합니다.</Text>
        <List>
          <li>이메일(카카오 계정): 회원 식별 및 로그인 처리</li>
          <li>이름: 회원 식별 및 본인 확인</li>
          <li>전화번호: 회원 식별 및 본인 확인</li>
        </List>
      </Section>

      <Section>
        <SubTitle>2. 개인정보 수집 및 이용 목적</SubTitle>
        <Text>
          수집된 개인정보는 다음의 목적에만 사용되며, 명시된 목적 외에는 사용되지 않습니다.
        </Text>
        <List>
          <li>회원가입 및 로그인 기능 제공</li>
          <li>회원 식별 및 본인 확인</li>
        </List>
      </Section>

      <Section>
        <SubTitle>3. 보유 및 이용 기간</SubTitle>
        <Text>
          수집된 개인정보는 회원 탈퇴 시 즉시 삭제되며, 관련 법령에 따라 일정 기간 보관이 필요한
          경우 해당 기간 동안 안전하게 보관 후 파기합니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>4. 동의 거부 시 불이익</SubTitle>
        <Text>
          이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 수 있으며, 이 경우 회원가입 및 로그인
          기능 이용이 제한될 수 있습니다.
        </Text>
      </Section>
    </Container>
  );
}

const Container = styled.div<WithTheme>`
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xxlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  margin-bottom: 32px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SubTitle = styled.h3<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.subColor};
`;

const Text = styled.p<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};
`;

const List = styled.ul<WithTheme>`
  margin-top: 12px;
  padding-left: 20px;
  list-style: disc;

  li {
    margin-bottom: 8px;
    font-size: ${({ theme }) => theme.sizes.medium};
    color: ${({ theme }) => theme.colors.subColor};
  }
`;
