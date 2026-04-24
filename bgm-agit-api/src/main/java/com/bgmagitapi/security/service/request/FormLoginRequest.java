package com.bgmagitapi.security.service.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FormLoginRequest {
    private String nickname;
    private String password;
}
