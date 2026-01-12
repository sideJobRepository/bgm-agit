package com.bgmagitapi.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class InputsCheckGetResponse {
    
    private InputsCheckDateHeader header;   // 엑셀 맨 위
    private List<InputsCheckRowResponse> rows; // 진도 체크 데이터
    

}
