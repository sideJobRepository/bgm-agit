package com.bgmagitapi.kml.rule.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class RulePutRequest {

    @NotNull(message = "대회 룰 id는 필수입니다.")
    private Long id;
    @NotBlank(message = "룰 대회여부는 필수입니다.")
    private String tournamentStatus;
    private Long deleteFileId;
    private MultipartFile file;
    
}
