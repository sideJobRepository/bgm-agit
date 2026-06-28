import { Wrapper } from '../styles';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { gatheringListState } from '../recoil/state/gatheringState.ts';
import { useGatheringListFetch } from '../recoil/gatheringFetch.ts';
import { userState } from '../recoil/state/userState.ts';
import Pagination from '../components/Pagination.tsx';
import type { GatheringListItem, GatheringType } from '../types/gathering.ts';

type Filter = 'ALL' | GatheringType;

function formatTime(t?: string | null) {
  if (!t) return '';
  return t.slice(0, 5);
}

export default function Gatherings() {
  const navigate = useNavigate();
  const fetchGatherings = useGatheringListFetch();
  const data = useRecoilValue(gatheringListState);
  const user = useRecoilValue(userState);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchGatherings(page, filter === 'ALL' ? undefined : filter);
  }, [filter, page]);

  // 크로스 호환 힌트: 모집중인 머미·시계탑이 동시에 있고 유연 신청자가 있으면 안내
  const crossHint = useMemo(() => {
    const recruiting = data.content.filter(g => g.gatheringStatus === 'RECRUITING');
    const mm = recruiting.filter(g => g.gatheringType === 'MURDER_MYSTERY');
    const ct = recruiting.filter(g => g.gatheringType === 'CLOCK_TOWER');
    const flexTotal = recruiting.reduce((sum, g) => sum + (g.flexibleCount ?? 0), 0);
    if (mm.length > 0 && ct.length > 0 && flexTotal > 0) {
      return `양쪽(머더미스터리·시계탑) 모집이 열려 있고, 다른 장르도 가능한 신청자가 ${flexTotal}명 있어요. 어느 쪽이든 채울 수 있습니다.`;
    }
    return null;
  }, [data.content]);

  return (
    <Wrapper>
      <Box>
        <Header bgColor="#482768">
          <TitleBox>
            <h2>Gathering</h2>
            <p>머더미스터리 · 시계탑 모임에 참가해보세요.</p>
          </TitleBox>
          {user && (
            <CreateButton onClick={() => navigate('/gatheringDetail')}>모임 만들기</CreateButton>
          )}
        </Header>

        <FilterRow>
          <FilterButton $active={filter === 'ALL'} onClick={() => { setPage(0); setFilter('ALL'); }}>
            전체
          </FilterButton>
          <FilterButton $active={filter === 'MURDER_MYSTERY'} onClick={() => { setPage(0); setFilter('MURDER_MYSTERY'); }}>
            머더미스터리
          </FilterButton>
          <FilterButton $active={filter === 'CLOCK_TOWER'} onClick={() => { setPage(0); setFilter('CLOCK_TOWER'); }}>
            시계탑
          </FilterButton>
        </FilterRow>

        {crossHint && <CrossHint>{crossHint}</CrossHint>}

        <CardList>
          {data.content.map(g => (
            <GatheringCard key={g.gatheringId} item={g} onClick={() => navigate(`/gatheringDetail?id=${g.gatheringId}`)} />
          ))}
          {data.content.length === 0 && <Empty>모집 중인 모임이 없습니다.</Empty>}
        </CardList>

        <PaginationWrapper>
          <Pagination current={page} totalPages={data.totalPages} onChange={setPage} />
        </PaginationWrapper>
      </Box>
    </Wrapper>
  );
}

function GatheringCard({ item, onClick }: { item: GatheringListItem; onClick: () => void }) {
  const isMM = item.gatheringType === 'MURDER_MYSTERY';
  return (
    <Card onClick={onClick}>
      <CardTop>
        <TypeBadge $mm={isMM}>{item.gatheringTypeName}</TypeBadge>
        <StatusBadge $status={item.gatheringStatus}>{item.gatheringStatusName}</StatusBadge>
      </CardTop>
      <CardTitle>{item.title}</CardTitle>
      {item.scenarioName && <Scenario>시나리오: {item.scenarioName}</Scenario>}
      <Meta>
        <span>일시 {item.gatheringDate} {formatTime(item.startTime)}{item.endTime ? ` ~ ${formatTime(item.endTime)}` : ''}</span>
        {item.place && <span>장소 {item.place}</span>}
        {item.hostNickname && <span>주최 {item.hostNickname}</span>}
      </Meta>
      <SeatRow>
        <Seat>
          참가 {item.confirmedCount} / {item.maxPeople}
        </Seat>
        {item.gatheringStatus === 'RECRUITING' && item.neededToConfirm > 0 && (
          <Needed>성사까지 {item.neededToConfirm}명</Needed>
        )}
        {item.waitingCount > 0 && <SubInfo>대기 {item.waitingCount}</SubInfo>}
        {item.flexibleCount > 0 && <FlexInfo>유연 {item.flexibleCount}</FlexInfo>}
      </SeatRow>
    </Card>
  );
}

const Box = styled.div`
  padding: 10px;
`;

const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ bgColor }) => bgColor};
  color: #fff;
  padding: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }
`;

const TitleBox = styled.div<WithTheme>`
  h2 {
    font-family: 'Bungee', sans-serif;
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: 6px;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

const CreateButton = styled.button<WithTheme>`
  padding: 8px 16px;
  background: #fff;
  color: #482768;
  border: none;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin: 18px 0;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean } & WithTheme>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  background: ${({ $active }) => ($active ? '#482768' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#424548')};
  font-size: ${({ theme }) => theme.sizes.small};
  cursor: pointer;
`;

const CrossHint = styled.div<WithTheme>`
  background: #f1e7ce;
  border: 1px dashed #988271;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  color: #5c3a21;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  @media (max-width: 844px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<WithTheme>`
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.15s;
  background: #fff;

  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const TypeBadge = styled.span<{ $mm: boolean } & WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.bold};
  padding: 3px 10px;
  border-radius: 12px;
  color: #fff;
  background: ${({ $mm }) => ($mm ? '#093A6E' : '#1A7D55')};
`;

const StatusBadge = styled.span<{ $status: string } & WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  padding: 3px 10px;
  border-radius: 12px;
  color: #fff;
  background: ${({ $status }) =>
    $status === 'CONFIRMED'
      ? '#1A7D55'
      : $status === 'RECRUITING'
        ? '#988271'
        : $status === 'CANCELLED'
          ? '#FF5E57'
          : '#757575'};
`;

const CardTitle = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 4px;
`;

const Scenario = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  margin-bottom: 8px;
`;

const Meta = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 12px;
`;

const SeatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Seat = styled.span<WithTheme>`
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

const Needed = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: #fff;
  background: #482768;
  padding: 2px 8px;
  border-radius: 10px;
`;

const SubInfo = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.navColor};
`;

const FlexInfo = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: #5c3a21;
  background: #f1e7ce;
  padding: 2px 8px;
  border-radius: 10px;
`;

const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 24px;
`;
