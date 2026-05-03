package com.bgmagitapi.kml.password.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BgmAgitPasswordRequest {

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;
}
