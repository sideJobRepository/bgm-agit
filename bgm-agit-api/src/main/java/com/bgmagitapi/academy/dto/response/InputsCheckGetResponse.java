package com.bgmagitapi.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class InputsCheckGetResponse {
    
    private InputsCheckDateHeader header;   // 엑셀 맨 위
    

}
