package com.bgmagitapi.kml.notice.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.notice.dto.enums.FileStatus;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePostRequest;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePutRequest;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetDetailResponse;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetResponse;
import com.bgmagitapi.kml.notice.entity.KmlNotice;
import com.bgmagitapi.kml.notice.repository.KmlNoticeRepository;
import com.bgmagitapi.kml.notice.service.KmlNoticeService;
import com.bgmagitapi.repository.BgmAgitCommonFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@Transactional
@RequiredArgsConstructor
public class KmlNoticeServiceImpl implements KmlNoticeService {
    
    private final KmlNoticeRepository kmlNoticeRepository;
    private final BgmAgitCommonFileRepository commonFileRepository;
    private final S3FileUtils s3FileUtils;
    
    
    @Override
    public Page<KmlNoticeGetResponse> getKmlNotice(Pageable pageable, String titleAndCont) {
         return kmlNoticeRepository.findByKmlNotice(pageable, titleAndCont);
    }
    
    @Override
    public KmlNoticeGetDetailResponse getDetailKmlNotice(Long id) {
        KmlNotice kmlNotice = kmlNoticeRepository.findById(id).orElseThrow(() -> new RuntimeException("존재하지 않는 공지사항 입니다."));
        List<BgmAgitCommonFile> noticeFiles = kmlNoticeRepository.findByKmlNoticeFiles(List.of(id));
        
        KmlNoticeGetDetailResponse result = KmlNoticeGetDetailResponse
                .builder()
                .id(kmlNotice.getId())
                .title(kmlNotice.getNoticeTitle())
                .cont(kmlNotice.getNoticeTitle())
                .build();
        
        Map<Long, List<KmlNoticeGetDetailResponse.KmlNoticeFile>> files = noticeFiles.stream()
                .collect(Collectors.groupingBy(
                        BgmAgitCommonFile::getBgmAgitCommonFileTargetId,
                        Collectors.mapping(item ->
                                        KmlNoticeGetDetailResponse.KmlNoticeFile
                                                .builder()
                                                .id(item.getBgmAgitCommonFileId())
                                                .fileName(item.getBgmAgitCommonFileName())
                                                .fileUrl(item.getBgmAgitCommonFileUrl())
                                                .fileFolder("kml-notice")
                                                .build(),
                                Collectors.toList()
                        )
                ));
        List<KmlNoticeGetDetailResponse.KmlNoticeFile> kmlNoticeFiles = files.get(kmlNotice.getId());
        if (kmlNoticeFiles != null) {
            result.getFiles().addAll(kmlNoticeFiles);
        }
        return result;
    }
    
    @Override
    public ApiResponse createKmlNotice(KmlNoticePostRequest request) {
        
        KmlNotice kmlNotice = KmlNotice
                .builder()
                .noticeTitle(request.getTitle())
                .noticeCont(request.getCont())
                .build();
        
        kmlNoticeRepository.save(kmlNotice);
        
        List<MultipartFile> files = request.getFiles();
        
        List<UploadResult> uploadResults = s3FileUtils.storeFiles(files, "kml-notice");
        
        for (UploadResult result : uploadResults) {
            BgmAgitCommonFile commonFile = BgmAgitCommonFile
                    .builder()
                    .bgmAgitCommonFileTargetId(kmlNotice.getId())
                    .bgmAgitCommonFileName(result.getOriginalFilename())
                    .bgmAgitCommonFileUuidName(result.getUuid())
                    .bgmAgitCommonFileUrl(result.getUrl())
                    .bgmAgitCommonFileType(BgmAgitCommonType.KML_NOTICE)
                    .build();
            commonFileRepository.save(commonFile);
        }
        return new ApiResponse(200, true, "저장 되었습니다.");
    }
    
    @Override
    public ApiResponse modifyKmlNotice(KmlNoticePutRequest request) {
        Long kmlNoticeId = request.getId();
        KmlNotice kmlNotice = kmlNoticeRepository.findById(kmlNoticeId).orElseThrow(() -> new RuntimeException("존재 하지 않는 공지사항 입니다."));
        kmlNotice.modify(request);
        
        List<MultipartFile> files = request.getFiles();
        List<KmlNoticePutRequest.KmlNoticeFilePutRequest> existingFiles = request.getExistingFiles();
        List<UploadResult> uploadResults = s3FileUtils.storeFiles(files, "kml-notice");
        for (UploadResult result : uploadResults) {
            BgmAgitCommonFile commonFile = BgmAgitCommonFile
                    .builder()
                    .bgmAgitCommonFileTargetId(kmlNotice.getId())
                    .bgmAgitCommonFileName(result.getOriginalFilename())
                    .bgmAgitCommonFileUuidName(result.getUuid())
                    .bgmAgitCommonFileUrl(result.getUrl())
                    .bgmAgitCommonFileType(BgmAgitCommonType.KML_NOTICE)
                    .build();
            commonFileRepository.save(commonFile);
        }
        for (KmlNoticePutRequest.KmlNoticeFilePutRequest existingFile : existingFiles) {
            if (existingFile.getStatus() == FileStatus.DELETED) {
                BgmAgitCommonFile deleteFile = commonFileRepository.findById(existingFile.getId()).orElseThrow(() -> new RuntimeException("존재하지 않는 파일입니다."));
                s3FileUtils.deleteFile(deleteFile.getBgmAgitCommonFileUrl());
                commonFileRepository.delete(deleteFile);
            }
        }
        return new ApiResponse(200,true,"수정 되었습니다.");
    }
    
    @Override
    public ApiResponse removeKmlNotice(Long id) {
        
        List<BgmAgitCommonFile> noticeFiles = kmlNoticeRepository.findByKmlNoticeFiles(List.of(id));
        
        for (BgmAgitCommonFile noticeFile : noticeFiles) {
            s3FileUtils.deleteFile(noticeFile.getBgmAgitCommonFileUrl());
        }
        commonFileRepository.deleteAll(noticeFiles);
        
        kmlNoticeRepository.deleteById(id);
        
        return new ApiResponse(200, true, "삭제 되었습니다.");
    }
    
}
