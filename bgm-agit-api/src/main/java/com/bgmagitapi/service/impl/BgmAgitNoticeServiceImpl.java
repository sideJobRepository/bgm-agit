package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.controller.response.notice.BgmAgitNoticeFileResponse;
import com.bgmagitapi.controller.response.notice.BgmAgitNoticeResponse;
import com.bgmagitapi.entity.BgmAgitNotice;
import com.bgmagitapi.entity.BgmAgitNoticeFile;
import com.bgmagitapi.repository.BgmAgitNoticeFileRepository;
import com.bgmagitapi.repository.BgmAgitNoticeRepository;
import com.bgmagitapi.service.BgmAgitNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitNoticeServiceImpl implements BgmAgitNoticeService {
    
    private final BgmAgitNoticeRepository bgmAgitNoticeRepository;
    
    private final BgmAgitNoticeFileRepository bgmAgitNoticeFileRepository;
    
    private final S3FileUtils s3FileUtils;
    
    
    @Override
    @Transactional(readOnly = true)
    public Page<BgmAgitNoticeResponse> getNotice(Pageable pageable, String titleOrCont) {

        
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Page<BgmAgitNotice> result = bgmAgitNoticeRepository.getNotices(pageable, titleOrCont);
        
        return result.map(n ->
                new BgmAgitNoticeResponse(
                        n.getBgmAgitNoticeId(),
                        n.getBgmAgitNoticeTitle(),
                        n.getBgmAgitNoticeCont(),
                        n.getRegistDate().format(dateFormatter),
                        n.getBgmAgitNoticeType().name(),
                        n.getBgmAgitNoticeFiles().stream()
                                .map(f -> new BgmAgitNoticeFileResponse(
                                        f.getBgmAgitNoticeFileId(),
                                        f.getBgmAgitNoticeFileName(),
                                        f.getBgmAgitNoticeFileUuidName(),
                                        f.getBgmAgitNoticeFileUrl()))
                                .toList()
                )
        );
    }
    
 
    
    @Override
    public ApiResponse createNotice(BgmAgitNoticeCreateRequest request) {
        
        // 1. 공지 저장
        BgmAgitNotice notice = new BgmAgitNotice(
                request.getBgmAgitNoticeTitle(),
                request.getBgmAgitNoticeContent(),
                request.getBgmAgitNoticeType(),
                request.getPopupUseStatus()
        );
        bgmAgitNoticeRepository.save(notice);
        
        // 2. S3 업로드
        List<UploadResult> uploadResults = s3FileUtils.storeFiles(request.getFiles(), "notice");
        
        // 3. 파일 테이블 저장
        List<BgmAgitNoticeFile> noticeFiles = uploadResults.stream()
                .map(item -> new BgmAgitNoticeFile(notice, item.getOriginalFilename(), item.getUuid(), item.getUrl()))
                .toList();
        
        bgmAgitNoticeFileRepository.saveAll(noticeFiles);
        
        return new ApiResponse(200, true, "공지사항 저장이 성공했습니다.");
    }
    
    @Override
    public ApiResponse modifyNotice(BgmAgitNoticeModifyRequest request) {
        Long bgmAgitNoticeId = request.getBgmAgitNoticeId();
        
        BgmAgitNotice notice = bgmAgitNoticeRepository.findById(bgmAgitNoticeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공지사항 ID 입니다."));
        
        //  공지사항 내용 수정
        notice.modifyNotice(request);
        
        List<String> deletedFileNames = request.getDeletedFiles();
        if (!deletedFileNames.isEmpty()) {
            List<BgmAgitNoticeFile> byUUID = bgmAgitNoticeFileRepository.findByUUID(deletedFileNames);
            //  기존 파일 삭제
            for (BgmAgitNoticeFile file : byUUID) {
                s3FileUtils.deleteFile(file.getBgmAgitNoticeFileUrl());
            }
            bgmAgitNoticeFileRepository.removeFiles(deletedFileNames);
        }
        
        // 새 파일 처리
        if (request.getMultipartFiles() != null && !request.getMultipartFiles().isEmpty()) {
            List<UploadResult> uploadResults = s3FileUtils.storeFiles(request.getMultipartFiles(), "notice");
            
            List<BgmAgitNoticeFile> noticeFiles = uploadResults.stream()
                    .map(item -> new BgmAgitNoticeFile(notice, item.getOriginalFilename(), item.getUuid(), item.getUrl()))
                    .toList();
            bgmAgitNoticeFileRepository.saveAll(noticeFiles);
        }
        
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
    
    @Override
    public ApiResponse deleteNotice(Long noticeId) {
        BgmAgitNotice notice = bgmAgitNoticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공지사항 ID 입니다."));
        
        // S3 파일 삭제
        List<BgmAgitNoticeFile> files = notice.getBgmAgitNoticeFiles();
        for (BgmAgitNoticeFile file : files) {
            s3FileUtils.deleteFile(file.getBgmAgitNoticeFileUrl());
        }
        
        // DB 파일 삭제
        bgmAgitNoticeFileRepository.deleteAll(files);
        
        // 공지사항 삭제
        bgmAgitNoticeRepository.deleteById(noticeId);
        
        return new ApiResponse(200, true, "삭제 되었습니다.");
    }
    
    
}
