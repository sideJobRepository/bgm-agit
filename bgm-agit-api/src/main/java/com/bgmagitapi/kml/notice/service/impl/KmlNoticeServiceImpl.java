package com.bgmagitapi.kml.notice.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePostRequest;
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
        Page<KmlNoticeGetResponse> kmlNotices = kmlNoticeRepository.findByKmlNotice(pageable,titleAndCont);
        
        List<Long> kmlNoticeIds = kmlNotices.stream()
                .map(KmlNoticeGetResponse::getId)
                .toList();
        
        List<BgmAgitCommonFile> noticeFiles = kmlNoticeRepository.findByKmlNoticeFiles(kmlNoticeIds);
        
        Map<Long, List<KmlNoticeGetResponse.KmlNoticeFile>> fileMap = noticeFiles.stream()
                .collect(Collectors.groupingBy(
                        BgmAgitCommonFile::getBgmAgitCommonFileTargetId,
                        Collectors.mapping(
                                file -> KmlNoticeGetResponse.KmlNoticeFile.builder()
                                        .id(file.getBgmAgitCommonFileId())
                                        .fileName(file.getBgmAgitCommonFileName())
                                        .fileUrl(file.getBgmAgitCommonFileUrl())
                                        .build(),
                                Collectors.toList()
                        )
                ));
        
        
        for (KmlNoticeGetResponse kmlNotice : kmlNotices) {
            List<KmlNoticeGetResponse.KmlNoticeFile> kmlNoticeFiles = fileMap.get(kmlNotice.getId());
            if(kmlNoticeFiles != null) {
                kmlNotice.getFiles().addAll(kmlNoticeFiles);
            }
        }
        
        return kmlNotices;
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
    
}
