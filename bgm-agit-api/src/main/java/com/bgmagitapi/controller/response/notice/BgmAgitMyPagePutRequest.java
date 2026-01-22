package com.bgmagitapi.controller.response.notice;

import com.bgmagitapi.annotation.PhoneValid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitMyPagePutRequest {
    
    private Long id;
    private String nickName;
    @NotBlank(message = "휴대폰 번호는 필수입니다.")
    @PhoneValid(message = "휴대폰 번호 형식이 올바르지 않습니다. (예: 010-1234-5678)")
    private String phoneNo;
    private String nickNameUseStatus;
    private String mahjongUseStatus;
}
