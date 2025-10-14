package com.bgmagitapi.controller.request;

import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitReservationCreateRequest {
    
    // 이미지 ID
    @NotNull(message = "이미지 ID는 필수입니다.")
    private Long bgmAgitImageId ;
    //예약타입
    @NotBlank(message = "예약 타입을 정해주세요")
    private String bgmAgitReservationType;
    // 시작일
    @NotEmpty(message = "예약 시작일은 필수입니다.")
    private String bgmAgitReservationStartDate; //
    
    // 시작 시간
    private LocalTime bgmAgitReservationStartTime;
    
    // 종료 시간
    private LocalTime bgmAgitReservationEndTime;
    
    //예약인원
    @NotNull(message = "예약 인원은 필수 입니다.")
    private Integer bgmAgitReservationPeople;
    
    //요청 사항
    private String bgmAgitReservationRequest;
    
    @NotNull(message = "예약 시작 시간은 필수입니다.")
    private List<String> startTimeEndTime;
    
    private String recipient;
    
    /**
     * 요청된 시간 문자열 리스트로부터 1시간 단위 슬롯을 생성하는 유틸 메서드
     */
    public List<String> getReservationExpandedTimeSlots(BgmAgitImageCategory bgmAgitImageCategory , String imageLabel) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        List<String> result = new ArrayList<>();
        
        for (String timeStr : startTimeEndTime) {
            LocalTime start = LocalTime.parse(timeStr, formatter);
            boolean mahjongRental = isMahjong(bgmAgitImageCategory);
            boolean groom = isGroom(bgmAgitImageCategory, imageLabel);
            long hoursToAdd = groom ? 5 : mahjongRental ? 3 : 1;
            LocalTime end = start.plusHours(hoursToAdd);
            result.add(start.format(formatter) + " ~ " + end.format(formatter));
        }
        return result;
    }
    
    private  boolean isMahjong(BgmAgitImageCategory bgmAgitImageCategory) {
        return bgmAgitImageCategory == BgmAgitImageCategory.MAHJONG;
    }
    private  boolean isGroom(BgmAgitImageCategory bgmAgitImageCategory, String imageLabel) {
        return bgmAgitImageCategory == BgmAgitImageCategory.ROOM && "G Room".equals(imageLabel);
    }
}
