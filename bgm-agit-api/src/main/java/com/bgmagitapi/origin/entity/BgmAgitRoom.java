package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

/**
 * 예약 대상(룸·마작 대탁). 예전에는 BGM_AGIT_IMAGE 행에 얹혀 있었다.
 *
 * 카테고리 컬럼은 두지 않는다 — 룸/마작은 메뉴 링크로 갈린다(isMahjong).
 * ROOM_ID 는 이관 시 기존 IMAGE_ID 값을 그대로 넣었으므로 예약·결제 이력과 값이 이어진다.
 */
@Entity
@Table(name = "BGM_AGIT_ROOM")
@Getter
@DynamicUpdate
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitRoom extends DateSuperClass {

    public static final String LINK_ROOM = "/detail/room";
    public static final String LINK_MAHJONG = "/detail/mahjongRental";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_ROOM_ID")
    private Long bgmAgitRoomId;

    // 방 이름(구 IMAGE_LABEL). 프론트 코멘트·옵션 맵과 합쳐 예약 화이트리스트가 이 값을 키로 쓴다
    @Column(name = "BGM_AGIT_ROOM_NAME")
    private String bgmAgitRoomName;

    // '/detail/room' | '/detail/mahjongRental'
    @Column(name = "BGM_AGIT_ROOM_LINK")
    private String bgmAgitRoomLink;

    @Column(name = "BGM_AGIT_ROOM_MIN_PEOPLE")
    private Integer bgmAgitRoomMinPeople;

    @Column(name = "BGM_AGIT_ROOM_MAX_PEOPLE")
    private Integer bgmAgitRoomMaxPeople;

    // 카드에 나오는 인원 안내 문구(구 IMAGE_GROUPS)
    @Column(name = "BGM_AGIT_ROOM_GUIDE")
    private String bgmAgitRoomGuide;

    @Column(name = "BGM_AGIT_ROOM_IMAGE_URL")
    private String bgmAgitRoomImageUrl;

    // Y: 노출 / N: 숨김. 예약 이력이 FK 로 물려 있어 운영 종료된 방은 삭제 대신 숨긴다
    @Column(name = "BGM_AGIT_ROOM_USE_STATUS")
    private String bgmAgitRoomUseStatus;

    public BgmAgitRoom(String name, String link, Integer minPeople, Integer maxPeople,
                       String guide, String imageUrl, String useStatus) {
        this.bgmAgitRoomName = name;
        this.bgmAgitRoomLink = link;
        this.bgmAgitRoomMinPeople = minPeople;
        this.bgmAgitRoomMaxPeople = maxPeople;
        this.bgmAgitRoomGuide = guide;
        this.bgmAgitRoomImageUrl = imageUrl;
        this.bgmAgitRoomUseStatus = "N".equals(useStatus) ? "N" : "Y";
    }

    /** 마작 대탁 대여인지. 카테고리 컬럼이 없어 메뉴 링크로 판정한다. */
    public boolean isMahjong() {
        return LINK_MAHJONG.equals(this.bgmAgitRoomLink);
    }

    /** null 은 과거 행 호환으로 노출 취급. */
    public boolean isHidden() {
        return "N".equals(this.bgmAgitRoomUseStatus);
    }

    public void modify(String name, String link, Integer minPeople, Integer maxPeople,
                       String guide, String imageUrl, String useStatus) {
        this.bgmAgitRoomName = name;
        this.bgmAgitRoomLink = link;
        this.bgmAgitRoomMinPeople = minPeople;
        this.bgmAgitRoomMaxPeople = maxPeople;
        this.bgmAgitRoomGuide = guide;
        if (imageUrl != null && !imageUrl.isBlank()) {
            this.bgmAgitRoomImageUrl = imageUrl;
        }
        this.bgmAgitRoomUseStatus = "N".equals(useStatus) ? "N" : "Y";
    }

    public void hide() {
        this.bgmAgitRoomUseStatus = "N";
    }
}
