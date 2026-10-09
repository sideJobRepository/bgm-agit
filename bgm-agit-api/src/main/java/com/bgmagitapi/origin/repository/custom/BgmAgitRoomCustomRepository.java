package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.entity.BgmAgitRoom;

import java.util.List;

public interface BgmAgitRoomCustomRepository {

    /**
     * 방 목록(roomId 오름차순). link 가 비면 전체, includeHidden=false 면 숨김(N) 제외.
     */
    List<BgmAgitRoom> findRooms(String link, boolean includeHidden);

    /**
     * 예약 가능한(숨김 아닌) 방. 방 카드 목록(GET /rooms)과 같은 필터라야
     * 카드에는 있는데 가용 현황에는 없는 방이 생기지 않는다.
     */
    List<BgmAgitRoom> findReservableRooms(String link);

    /**
     * 이 방에 걸린 예약이 하나라도 있는지(취소건 포함). 있으면 FK RESTRICT 라 삭제할 수 없다.
     */
    boolean existsReservationByRoomId(Long roomId);
}
