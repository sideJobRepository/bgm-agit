package com.bgmagitapi.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitRoleModifyRequest {
    
    @NotNull(message = "멤버 ID를 넣어주세요")
    private Long memberId;
    @NotNull(message = "권한 ID를 넣어주세요")
    private Long roleId;
}
