package com.bgmagitapi.origin.controller.response;

import com.bgmagitapi.origin.entity.BgmAgitRoom;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BgmAgitRoomResponse {

    private Long roomId;
    private String name;
    private String link;
    private Integer minPeople;
    private Integer maxPeople;
    private String guide;
    private String imageUrl;
    private String useStatus;

    public static BgmAgitRoomResponse from(BgmAgitRoom room) {
        return new BgmAgitRoomResponse(
                room.getBgmAgitRoomId(),
                room.getBgmAgitRoomName(),
                room.getBgmAgitRoomLink(),
                room.getBgmAgitRoomMinPeople(),
                room.getBgmAgitRoomMaxPeople(),
                room.getBgmAgitRoomGuide(),
                room.getBgmAgitRoomImageUrl(),
                room.isHidden() ? "N" : "Y"
        );
    }
}
