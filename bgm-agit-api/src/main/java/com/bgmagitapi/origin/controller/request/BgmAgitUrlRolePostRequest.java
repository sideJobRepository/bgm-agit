package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BgmAgitUrlRolePostRequest {

    @NotBlank(message = "URL 경로는 필수입니다.")
    private String path;

    @NotBlank(message = "HTTP 메서드는 필수입니다.")
    private String httpMethod;

    @NotNull(message = "역할은 필수입니다.")
    private Long roleId;
}
