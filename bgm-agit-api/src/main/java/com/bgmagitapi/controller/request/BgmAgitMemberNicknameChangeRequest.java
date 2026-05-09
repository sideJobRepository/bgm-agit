package com.bgmagitapi.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitMemberNicknameChangeRequest {

    @NotNull(message = "멤버 ID를 넣어주세요")
    private Long memberId;

    @NotBlank(message = "닉네임을 넣어주세요")
    private String nickname;
}
