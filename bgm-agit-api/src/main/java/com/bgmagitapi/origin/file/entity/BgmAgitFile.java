package com.bgmagitapi.origin.file.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import com.bgmagitapi.origin.file.enums.FileStatus;
import com.bgmagitapi.origin.file.enums.FileType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "BGM_AGIT_FILE")
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BgmAgitFile extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_FILE_ID")
    private Long id;

    @Column(name = "BGM_AGIT_TARGET_ID")
    private Long targetId;

    @Column(name = "BGM_AGIT_FILE_NAME")
    private String fileName;

    @Column(name = "BGM_AGIT_FILE_SIZE")
    private Integer fileSize;

    @Column(name = "BGM_AGIT_FILE_CONTENT_TYPE")
    private String fileContentType;

    @Column(name = "BGM_AGIT_FILE_PATH")
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_FILE_TYPE")
    private FileType fileType;

    @Column(name = "BGM_AGIT_FILE_BUCKET_NAME")
    private String bucketName;

    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_FILE_STATUS")
    private FileStatus fileStatus;

    public void createTargetIdAndModifyCompleteFileStatus(Long targetId) {
        this.targetId = targetId;
        this.fileStatus = FileStatus.COMPLETE;
    }

    public void modifyTemporaryFileStatus() {
        this.fileStatus = FileStatus.TEMPORARY;
    }

    public void restoreCompleteFileStatus() {
        this.fileStatus = FileStatus.COMPLETE;
    }
}
