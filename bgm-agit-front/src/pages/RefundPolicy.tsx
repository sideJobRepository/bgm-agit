import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export default function RefundPolicy() {
  return (
    <Container>
      <Title>취소 및 환불 정책</Title>

      <Section>
        <SubTitle>1. 룸 예약 결제 안내</SubTitle>
        <List>
          <li>룸 예약은 예약 시 인원수만큼 이용요금 전액을 결제합니다.</li>
          <li>이용요금은 1인 기준 평일 9,000원, 주말(토·일) 11,000원입니다.</li>
          <li>일무제한 요금제로, 당일 오전 10시부터 익일 오전 10시까지 이용하실 수 있습니다.</li>
          <li>세트(음료 + 과자) 이용을 원하시면 현장에서 3,000원만 추가 결제하시면 됩니다.</li>
        </List>
      </Section>

      <Section>
        <SubTitle>2. 마작 대탁 대여 안내</SubTitle>
        <List>
          <li>마작 대탁 대여는 예약금 10,000원을 먼저 결제하고 잔여 요금은 현장에서 결제합니다.</li>
          <li>마작 대탁 예약은 3시간 40,000원, 5시간 60,000원입니다.</li>
          <li>마작 대탁 1시간 추가 시 10,000원이 발생합니다.</li>
        </List>
      </Section>

      <Section>
        <SubTitle>3. 예약 가능 기간 및 서비스 제공</SubTitle>
        <List>
          <li>예약은 예약일 기준 당일 예약이 불가하며, 오늘부터 3개월 이내의 날짜만 가능합니다.</li>
          <li>서비스는 예약하신 날짜와 시간에 매장 현장에서 제공됩니다.</li>
          <li>수요일은 무인운영으로 예약이 불가합니다.</li>
        </List>
      </Section>

      <Section>
        <SubTitle>4. 취소 및 환불 기준</SubTitle>
        <List>
          <li>이용일 48시간 전까지 취소: 100% 환불</li>
          <li>이용일 48시간 이내 ~ 24시간 전까지 취소: 50% 환불</li>
          <li>이용일 24시간 이내 취소, 당일 취소 및 노쇼: 환불 불가</li>
        </List>
        <Text>
          환불 기준 시각은 예약하신 이용 시작 시각입니다. 24시간 이내에도 취소 자체는 가능하지만
          환불 금액은 발생하지 않습니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>5. 인원 축소에 대한 환불</SubTitle>
        <Text>
          예약 인원을 줄이시는 경우, 줄어든 인원 차액에 대해 위 4항과 같은 기준(48시간 전 100%,
          24시간 전 50%, 그 이후 환불 불가)으로 환불해 드립니다. 인원이 늘어나는 경우 추가 인원은
          현장에서 워크인 요금으로 결제해 주세요.
        </Text>
      </Section>

      <Section>
        <SubTitle>6. 지각 시 룸 배정</SubTitle>
        <Text>
          예약 시간 기준 30분 이상 지각(예약자를 포함한 일행 전원 미도착) 시 룸 배정이 해제되며 해당
          룸은 다른 손님께 배정될 수 있습니다. 이 경우 결제하신 금액은 당일 좌석(일무제한) 이용으로
          전환되며, 잔여 룸이 있을 경우 재배정해 드립니다. 미이용 시 환불은 불가합니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>7. 환불 처리</SubTitle>
        <Text>
          환불 금액은 결제수단 승인 취소 또는 별도 안내된 방식으로 처리됩니다. 카드사 또는 결제수단
          정책에 따라 실제 환불 완료까지 영업일 기준 일정 기간이 소요될 수 있습니다.
        </Text>
      </Section>

      <Section>
        <SubTitle>8. 문의</SubTitle>
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
