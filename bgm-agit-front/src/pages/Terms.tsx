import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export default function Terms() {
  return (
    <Container>
      <Title>이용약관</Title>

      <Section>
        <SubTitle>1. 목적</SubTitle>
        <Text>
          본 약관은 보드게임카페BGM(비지엠)아지트가 제공하는 공간 예약, 대탁 예약, 마작 강의 예약 및 관련
          서비스의 이용 조건과 절차를 정하는 것을 목적으로 합니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>2. 사업자 정보</SubTitle>
        <List>
          <li>상호: 보드게임카페BGM(비지엠)아지트</li>
          <li>대표자: 박범후</li>
          <li>사업자등록번호: 896-17-02241</li>
          <li>주소: 대전광역시 서구 문정로 62, 3층 (탄방동, 프라임빌딩)</li>
          <li>연락처: 0507-1445-3503</li>
        </List>
      </Section>

      <Section>
        <SubTitle>3. 서비스 이용</SubTitle>
        <Text>
          이용자는 사이트에서 예약 가능한 날짜, 시간, 인원 정보를 확인한 뒤 예약을 신청할 수 있습니다. 예약은
          예약금 결제가 완료된 시점에 확정됩니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>4. 결제 및 이용요금</SubTitle>
        <List>
          <li>예약금은 예약 확정을 위한 선결제 금액입니다.</li>
          <li>M Room 예약금은 30,000원, 그 외 예약금은 10,000원입니다.</li>
          <li>잔여 이용요금은 현장에서 결제합니다.</li>
          <li>마작 대탁 예약은 3시간 40,000원, 5시간 60,000원, 1시간 추가 시 10,000원이 발생합니다.</li>
        </List>
      </Section>

      <Section>
        <SubTitle>5. 예약 변경 및 취소</SubTitle>
        <Text>
          예약 변경, 취소 및 환불은 별도 취소/환불 정책에 따릅니다. 확정 후 취소 또는 환불 문의는
          0507-1445-3503으로 연락해 주세요.
        </Text>
      </Section>

      <Section>
        <SubTitle>6. 이용자 준수사항</SubTitle>
        <Text>
          이용자는 예약 정보와 연락처를 정확히 입력해야 하며, 다른 이용자의 이용을 방해하거나 시설을 훼손하는
          행위를 해서는 안 됩니다. 시설 훼손 또는 분실이 발생한 경우 실제 손해에 대한 배상을 요청할 수 있습니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>7. 약관 변경</SubTitle>
        <Text>
          본 약관은 서비스 운영 정책에 따라 변경될 수 있으며, 변경 시 사이트를 통해 안내합니다.
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
