package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 예약 ↔ 방. 일반 예약은 1행, 합쳐 예약(M-1+M-2)은 방 수만큼.
 * UNIQUE(RESERVATION_ID, ROOM_ID) 는 DB 에 걸려 있다.
 */
@Entity
@Table(name = "BGM_AGIT_RESERVATION_ROOM")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitReservationRoom extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RESERVATION_ROOM_ID")
    private Long bgmAgitReservationRoomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_RESERVATION_ID")
    private BgmAgitReservation bgmAgitReservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_ROOM_ID")
    private BgmAgitRoom bgmAgitRoom;

    public BgmAgitReservationRoom(BgmAgitReservation reservation, BgmAgitRoom room) {
        this.bgmAgitReservation = reservation;
        this.bgmAgitRoom = room;
    }
}
