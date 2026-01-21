package com.bgmagitapi.kml.rule.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class RulePostRequest {

   
    @NotBlank(message = "룰 대회여부는 필수입니다.")
    private String tournamentStatus;
    private MultipartFile file;
    
}
