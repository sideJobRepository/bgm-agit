package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.util.StringUtils;

/**
 * 예약 대상(룸·마작 대탁). 예전엔 BGM_AGIT_IMAGE 행에 얹혀 있었다.
 * ROOM_ID 값 = 이관 전 IMAGE_ID. 카테고리 컬럼은 없고 링크로 룸/마작을 가른다({@link #isMahjong()}).
 */
@Entity
@Table(name = "BGM_AGIT_ROOM")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DynamicUpdate
public class BgmAgitRoom extends DateSuperClass {

    public static final String LINK_ROOM = "/detail/room";
    public static final String LINK_MAHJONG = "/detail/mahjongRental";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_ROOM_ID")
    private Long bgmAgitRoomId;

    // 방 이름(구 IMAGE_LABEL). 프론트 코멘트 맵·G Room 판정이 이 값을 키로 쓴다
    @Column(name = "BGM_AGIT_ROOM_NAME")
    private String bgmAgitRoomName;

    // /detail/room | /detail/mahjongRental
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

    // Y: 노출 / N: 숨김. 예약 이력이 FK(RESTRICT)로 물려 있으면 삭제 대신 숨긴다
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

    /**
     * 관리자 수정. 인원·안내는 비우는 것도 수정이라 그대로 덮는다. imageUrl 은 새로 올린 경우에만 넘긴다(null 이면 유지).
     */
    public void modify(String name, String link, Integer minPeople, Integer maxPeople,
                       String guide, String useStatus, String imageUrl) {
        if (StringUtils.hasText(name)) {
            this.bgmAgitRoomName = name;
        }
        if (StringUtils.hasText(link)) {
            this.bgmAgitRoomLink = link;
        }
        this.bgmAgitRoomMinPeople = minPeople;
        this.bgmAgitRoomMaxPeople = maxPeople;
        this.bgmAgitRoomGuide = guide;
        if (StringUtils.hasText(useStatus)) {
            this.bgmAgitRoomUseStatus = "N".equals(useStatus) ? "N" : "Y";
        }
        if (StringUtils.hasText(imageUrl)) {
            this.bgmAgitRoomImageUrl = imageUrl;
        }
    }

    public void hide() {
        this.bgmAgitRoomUseStatus = "N";
    }

    public boolean isHidden() {
        return "N".equals(this.bgmAgitRoomUseStatus);
    }

    public boolean isMahjong() {
        return LINK_MAHJONG.equals(this.bgmAgitRoomLink);
    }
}
