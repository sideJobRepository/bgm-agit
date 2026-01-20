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
public class RulePostRequest {

    @NotBlank(message = "룰 제목은 필수입니다.")
    private String title;
    @NotNull(message = "룰 대회여부는 필수입니다.")
    private Boolean tournamentStatus;
    private List<MultipartFile> files;
    
    public List<MultipartFile> getFiles() {
        if (this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }
}
