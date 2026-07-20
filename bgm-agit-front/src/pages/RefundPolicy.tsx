import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export default function RefundPolicy() {
  return (
    <Container>
      <Title>취소 및 환불 정책</Title>

      <Section>
        <SubTitle>1. 예약금 안내</SubTitle>
        <List>
          <li>예약금은 예약 확정을 위한 선결제 금액입니다.</li>
          <li>M Room 예약금은 30,000원입니다.</li>
          <li>그 외 예약금은 10,000원입니다.</li>
          <li>잔여 이용요금은 현장에서 결제합니다.</li>
        </List>
      </Section>

      <Section>
        <SubTitle>2. 이용요금 안내</SubTitle>
        <List>
          <li>마작 대탁 예약은 3시간 40,000원, 5시간 60,000원입니다.</li>
          <li>마작 대탁 1시간 추가 시 10,000원이 발생합니다.</li>
          <li>그 외 공간 이용요금은 예약 시간, 인원, 이용 내용에 따라 현장에서 안내 후 결제합니다.</li>
        </List>
      </Section>

      <Section>
        <SubTitle>3. 취소 가능 기한</SubTitle>
        <Text>
          예약 취소는 예약일 전날까지 가능합니다. 예약일 당일 취소는 불가하며, 당일 취소 또는 노쇼 시 예약금은
          환불되지 않습니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>4. 환불 처리</SubTitle>
        <Text>
          환불이 가능한 예약금은 결제수단 승인 취소 또는 별도 안내된 방식으로 처리됩니다. 카드사 또는 결제수단
          정책에 따라 실제 환불 완료까지 영업일 기준 일정 기간이 소요될 수 있습니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>5. 문의</SubTitle>
        <Text>
          확정 후 예약 변경, 취소 또는 환불 문의는 0507-1445-3503으로 연락해 주세요.
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
