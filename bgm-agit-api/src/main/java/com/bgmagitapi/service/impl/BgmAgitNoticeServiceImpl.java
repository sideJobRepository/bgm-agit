package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.controller.response.notice.BgmAgitNoticeFileResponse;
import com.bgmagitapi.controller.response.notice.BgmAgitNoticeResponse;
import com.bgmagitapi.entity.BgmAgitNotice;
import com.bgmagitapi.entity.BgmAgitNoticeFile;
import com.bgmagitapi.repository.BgmAgitNoticeFileRepository;
import com.bgmagitapi.repository.BgmAgitNoticeRepository;
import com.bgmagitapi.service.BgmAgitNoticeService;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitNotice.bgmAgitNotice;
import static com.bgmagitapi.entity.QBgmAgitNoticeFile.bgmAgitNoticeFile;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitNoticeServiceImpl implements BgmAgitNoticeService {
    
    private final BgmAgitNoticeRepository bgmAgitNoticeRepository;
    
    private final BgmAgitNoticeFileRepository bgmAgitNoticeFileRepository;
    
    private final S3FileUtils s3FileUtils;
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    @Transactional(readOnly = true)
    public List<BgmAgitNoticeResponse> getNotice() {
        List<BgmAgitNotice> result = queryFactory
                .selectFrom(bgmAgitNotice)
                .leftJoin(bgmAgitNotice.bgmAgitNoticeFiles, bgmAgitNoticeFile).fetchJoin()
                .fetch();
        
        return result.stream()
                .map(n -> new BgmAgitNoticeResponse(
                        n.getBgmAgitNoticeId(),
                        n.getBgmAgitNoticeTitle(),
                        n.getBgmAgitNoticeCont(),
                        n.getBgmAgitNoticeType().name(),
                        n.getBgmAgitNoticeFiles().stream()
                                .map(f -> new BgmAgitNoticeFileResponse(
                                        f.getBgmAgitNoticeFileId(),
                                        f.getBgmAgitNoticeFileName(),
                                        f.getBgmAgitNoticeFileUuidName(),
                                        f.getBgmAgitNoticeFileUrl()
                                ))
                                .toList()
                ))
                .toList();
    }
    
    @Override
    public ApiResponse createNotice(BgmAgitNoticeCreateRequest request) {
        
        // 1. 공지 저장
        BgmAgitNotice notice = new BgmAgitNotice(
                request.getBgmAgitNoticeTitle(),
                request.getBgmAgitNoticeContent(),
                request.getBgmAgitNoticeType()
        );
        bgmAgitNoticeRepository.save(notice);
        
        // 2. S3 업로드
        List<MultipartFile> files = request.getFiles();
        List<String> fileUrls = s3FileUtils.storeFiles(files);
        
        // 3. 파일 테이블 저장
        List<BgmAgitNoticeFile> noticeFileEntities = new ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            MultipartFile multipartFile = files.get(i);
            String fileUrl = fileUrls.get(i);
            
            String originalFilename = multipartFile.getOriginalFilename();
            String uuidName = s3FileUtils.getFileNameFromUrl(fileUrl);
            
            BgmAgitNoticeFile fileEntity = new BgmAgitNoticeFile(
                    notice, originalFilename, uuidName, fileUrl
            );
            noticeFileEntities.add(fileEntity);
        }
        bgmAgitNoticeFileRepository.saveAll(noticeFileEntities);
        
        return new ApiResponse(200, true, "공지사항 저장이 성공했습니다.");
    }
    
    @Override
    public ApiResponse modifyNotice(BgmAgitNoticeModifyRequest request) {
        Long bgmAgitNoticeId = request.getBgmAgitNoticeId();
        
        BgmAgitNotice notice = bgmAgitNoticeRepository.findById(bgmAgitNoticeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공지사항 ID 입니다."));
        
        // 기존 파일 삭제
        List<BgmAgitNoticeFile> oldFiles = notice.getBgmAgitNoticeFiles();
        for (BgmAgitNoticeFile file : oldFiles) {
            s3FileUtils.deleteFile(file.getBgmAgitNoticeFileUrl());
        }
        bgmAgitNoticeFileRepository.deleteAll(oldFiles);
        
        // 공지사항 내용 수정
        notice.modifyNotice(request);
        
        // 새 파일 처리
        List<MultipartFile> multipartFiles = request.getMultipartFiles();
        if (multipartFiles != null && !multipartFiles.isEmpty()) {
            List<String> fileUrls = s3FileUtils.storeFiles(multipartFiles);
            List<BgmAgitNoticeFile> newEntities = new ArrayList<>();
            
            for (int i = 0; i < multipartFiles.size(); i++) {
                MultipartFile multipartFile = multipartFiles.get(i);
                String url = fileUrls.get(i);
                String originalFilename = multipartFile.getOriginalFilename();
                String uuid = s3FileUtils.getFileNameFromUrl(url);
                
                BgmAgitNoticeFile entity = new BgmAgitNoticeFile(notice, originalFilename, uuid, url);
                newEntities.add(entity);
            }
            bgmAgitNoticeFileRepository.saveAll(newEntities);
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
