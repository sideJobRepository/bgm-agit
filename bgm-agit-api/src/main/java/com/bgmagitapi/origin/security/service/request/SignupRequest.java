package com.bgmagitapi.origin.security.service.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequest {

    @NotBlank(message = "이름은 필수입니다.")
    private String name;

    @NotBlank(message = "닉네임은 필수입니다.")
    private String nickname;

    @NotBlank(message = "전화번호는 필수입니다.")
    private String phoneNo;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 4, message = "비밀번호는 최소 4자 이상이어야 합니다.")
    private String password;

    // 마작(BML) 이용 회원으로 가입할지 여부. 메인사이트(보드게임) 가입은 false(기본), BML(kml-front) 가입은 true.
    // true일 때만 가입 시점에 KML 등록을 수행한다.
    private boolean mahjongUse = false;
}
