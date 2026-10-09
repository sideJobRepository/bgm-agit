package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

// multipart/form-data
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BgmAgitRoomCreateRequest {

    @NotBlank(message = "방 이름을 입력해 주세요.")
    private String name;

    @NotBlank(message = "방 구분(링크)을 선택해 주세요.")
    @Pattern(regexp = "^/detail/(room|mahjongRental)$", message = "방 구분은 /detail/room 또는 /detail/mahjongRental 이어야 합니다.")
    private String link;

    @Min(value = 1, message = "최소 인원은 1명 이상이어야 합니다.")
    private Integer minPeople;

    @Min(value = 1, message = "최대 인원은 1명 이상이어야 합니다.")
    private Integer maxPeople;

    private String guide;

    @Pattern(regexp = "^[YN]$", message = "사용 여부는 Y 또는 N 이어야 합니다.")
    private String useStatus;

    @NotNull(message = "이미지를 넣어 주세요.")
    private MultipartFile image;
}
