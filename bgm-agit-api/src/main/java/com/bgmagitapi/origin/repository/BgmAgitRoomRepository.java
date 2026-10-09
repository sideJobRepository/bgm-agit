package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BgmAgitRoomRepository extends JpaRepository<BgmAgitRoom, Long> {

    /**
     * 예약 화면에 노출되는 방(숨김 'N' 제외, null 은 노출 취급). 방 카드 목록·가용 배지가 같은 필터를 봐야
     * 카드에는 있는데 배지가 안 뜨는 방이 생기지 않는다.
     */
    @Query("select r from BgmAgitRoom r"
            + " where r.bgmAgitRoomLink = :link"
            + " and (r.bgmAgitRoomUseStatus is null or r.bgmAgitRoomUseStatus <> 'N')"
            + " order by r.bgmAgitRoomId asc")
    List<BgmAgitRoom> findVisibleByLink(@Param("link") String link);
}
