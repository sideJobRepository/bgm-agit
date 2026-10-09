package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.repository.custom.BgmAgitRoomCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitRoomRepository extends JpaRepository<BgmAgitRoom, Long>, BgmAgitRoomCustomRepository {
}
