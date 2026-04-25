package com.bgmagitapi.controller.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitMemberPasswordChangeRequest {

    @NotNull(message = "멤버 ID를 넣어주세요")
    private Long memberId;

    @NotNull(message = "비밀번호를 넣어주세요")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
    private String password;
}
