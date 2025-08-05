import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export default function Privacy() {
  return (
    <Container>
      <Title>개인정보 처리방침</Title>

      <Section>
        <SubTitle>1. 수집하는 개인정보 항목</SubTitle>
        <Text>BGM아지트는 회원가입 및 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</Text>
        <List>
          <li>이메일: 소셜 로그인 및 회원 식별</li>
          <li>이름: 예약자 확인 및 카카오 알림톡 발송</li>
          <li>휴대폰 번호: 예약 알림톡 및 고객 응대 목적</li>
        </List>
      </Section>

      <Section>
        <SubTitle>2. 개인정보 수집 및 이용 목적</SubTitle>
        <Text>
          수집된 개인정보는 다음의 목적을 위해 활용되며, 명시된 목적 외로는 사용되지 않습니다.
        </Text>
        <List>
          <li>회원 식별 및 로그인 처리</li>
          <li>예약 관련 알림 발송 (카카오 알림톡 등)</li>
          <li>이용자 문의 및 불만 처리</li>
        </List>
      </Section>

      <Section>
        <SubTitle>3. 보유 및 이용 기간</SubTitle>
        <Text>
          수집된 개인정보는 회원 탈퇴 또는 서비스 종료 시 즉시 파기되며, 관계 법령에 따라 일정 기간
          보관이 필요한 경우 해당 기간 동안 안전하게 보관 후 파기합니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>4. 개인정보 제3자 제공</SubTitle>
        <Text>
          BGM아지트는 이용자의 동의 없이 개인정보를 외부에 제공하지 않으며, 외부 업체에 위탁
          처리하지 않습니다. 단, 법령에 따른 요청이 있는 경우는 예외로 합니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>5. 개인정보 수집에 대한 동의 및 거부 권리</SubTitle>
        <Text>
          이용자는 개인정보 수집 및 이용에 대해 동의를 거부할 수 있으며, 이 경우 소셜 로그인 및 예약
          알림 기능 사용에 제한이 있을 수 있습니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>6. 개인정보 처리방침 변경 안내</SubTitle>
        <Text>
          개인정보 처리방침이 변경되는 경우 웹사이트 또는 알림을 통해 사전 고지하며, 변경 내용은
          즉시 반영됩니다.
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
