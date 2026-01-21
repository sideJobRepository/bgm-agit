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

   
    @NotNull(message = "룰 대회여부는 필수입니다.")
    private Boolean tournamentStatus;
    private MultipartFile file;
    
}
