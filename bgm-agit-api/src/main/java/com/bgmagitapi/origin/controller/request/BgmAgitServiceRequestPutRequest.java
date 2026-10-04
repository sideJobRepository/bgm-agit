package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BgmAgitServiceRequestPutRequest {

    @NotNull
    private Long id;
    @NotBlank(message = "제목은 필수입니다.")
    private String title;
    @NotBlank(message = "내용은 필수입니다.")
    private String cont;

    private List<Long> deletedFiles;

    private List<MultipartFile> files;

    public List<Long> getDeletedFiles() {
        if (deletedFiles == null) {
            deletedFiles = new ArrayList<>();
        }
        return this.deletedFiles;
    }

    public List<MultipartFile> getFiles() {
        if (this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }
}
