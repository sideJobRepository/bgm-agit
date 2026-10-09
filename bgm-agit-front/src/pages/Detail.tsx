import styled from 'styled-components';
import ImageGrid from '../components/grid/ImageGrid.tsx';
import { useMediaQuery } from 'react-responsive';
import { Wrapper } from '../styles';
import { useLocation } from 'react-router-dom';
import { useFetchDetailData, useRoomsFetch } from '../recoil/fetch.ts';
import { useRecoilValue } from 'recoil';
import { detailDataState } from '../recoil';
import { userState } from '../recoil/state/userState.ts';
import type { GridItem, PageItem } from '../types/main.ts';
import { useEffect, useState } from 'react';

export default function Detail() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const location = useLocation();

  const visibleGameCount = isMobile ? 2 : 4;
  const visibleFoodCount = isMobile ? 2 : 5;
  const visibleCountReserve = isMobile ? 1 : 1;

  const pageData = {
    game: {
      labelGb: 2,
      title: 'BEST GAME',
      subTitle: 'BGM 아지트에서 선별한 가장 사랑받는 게임들을 확인해보세요.',
      bgColor: '#1A7D55',
      textColor: '#ffffff',
      searchColor: '#1A7D55',
      columnCount: visibleGameCount,
      label: '게임 이름',
    },
    room: {
      labelGb: 3,
      title: 'Your Game Starts Here',
      subTitle: '지금 바로 원하는 방을 예약하고 특별한 아지트를 만나보세요.',
      bgColor: '#093A6E',
      textColor: '#ffffff',
      searchColor: '#093A6E',
      columnCount: visibleCountReserve,
      label: '방 이름',
    },
    mahjongRental: {
      labelGb: 3,
      title: 'Reserve Your Mahjong Table',
      subTitle: '지금 원하는 마작 테이블을 예약하고 특별한 시간을 즐겨보세요.',
      bgColor: '#093A6E',
      textColor: '#ffffff',
      searchColor: '#093A6E',
      columnCount: visibleCountReserve,
      label: '테이블 이름',
    },
    drink: {
      labelGb: 4,
      title: 'Pick Your Drink',
      subTitle: '당신의 취향에 맞는 음료를 골라보세요.',
      bgColor: '#F2EDEA',
      textColor: '#5C3A21',
      searchColor: '#5C3A21',
      columnCount: visibleFoodCount,
      label: '음료 이름',
    },
    food: {
      labelGb: 4,
      title: 'Tasty Dishes',
      subTitle: '하루를 채워줄 진짜 한 끼, 여기서 만나보세요.',
      bgColor: '#F2EDEA',
      textColor: '#5C3A21',
      searchColor: '#5C3A21',
      columnCount: visibleFoodCount,
      label: '음식 이름',
    },
  };

  const key = location.pathname.split('/').filter(Boolean).pop();
  const selectedData = pageData[key as keyof typeof pageData];

  const param = { labelGb: selectedData.labelGb, link: '/detail/' + key };

  // 방·마작 대탁(labelGb 3)은 BGM_AGIT_ROOM(/bgm-agit/rooms)에서 받는다. 이미지 API 에는 더 이상 방이 없다.
  const isRoomPage = selectedData.labelGb === 3;
  const user = useRecoilValue(userState);
  const isAdmin = !!user?.roles.includes('ROLE_ADMIN');

  useFetchDetailData(param, isRoomPage);
  // 관리자는 숨김 방까지 받아 흐리게 보여준다(서버가 관리자일 때만 includeHidden 을 받아준다)
  const rooms = useRoomsFetch(isRoomPage ? [param.link] : null, { includeHidden: isAdmin });

  const detailItems = useRecoilValue(detailDataState);

  const [fullPageData, setFullPageData] = useState<
    (typeof selectedData & { items: GridItem[]; pages: PageItem }) | null
  >(null);

  useEffect(() => {
    if (isRoomPage) {
      if (!rooms) return;
      setFullPageData({
        ...selectedData,
        items: rooms.map(room => ({
          image: room.imageUrl ?? '',
          category: '',
          imageId: room.roomId,
          labelGb: 3,
          label: room.name,
          group: room.guide,
          link: room.link,
          room,
        })),
        pages: {
          last: true,
          number: 0,
          size: rooms.length,
          totalElements: rooms.length,
          totalPages: 1,
        },
      });
      return;
    }
    if (!detailItems) return;

    setFullPageData({
      ...selectedData,
      items: detailItems[selectedData.labelGb],
      pages: detailItems.page,
    });
  }, [detailItems, rooms, isRoomPage]);

  return (
    <Wrapper>
      <GridBox>{fullPageData && <ImageGrid pageData={fullPageData} />}</GridBox>
    </Wrapper>
  );
}

const GridBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 1280px;
`;
