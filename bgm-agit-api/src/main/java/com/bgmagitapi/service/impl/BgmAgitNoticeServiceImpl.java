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
import com.bgmagitapi.entity.QBgmAgitNotice;
import com.bgmagitapi.entity.QBgmAgitNoticeFile;
import com.bgmagitapi.repository.BgmAgitNoticeFileRepository;
import com.bgmagitapi.repository.BgmAgitNoticeRepository;
import com.bgmagitapi.service.BgmAgitNoticeService;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
    public Page<BgmAgitNoticeResponse> getNotice(Pageable pageable) {
        // 전체 개수 쿼리
        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitNotice.count())
                .from(bgmAgitNotice);
        Long total = countQuery.fetchOne();
        if (total == null) {
            total = 0L;
        }
        
        // 데이터 쿼리
        QBgmAgitNotice bgmAgitNotice = QBgmAgitNotice.bgmAgitNotice;
        QBgmAgitNoticeFile bgmAgitNoticeFile = QBgmAgitNoticeFile.bgmAgitNoticeFile;
        
        List<BgmAgitNotice> result = queryFactory
                .selectFrom(bgmAgitNotice)
                .leftJoin(bgmAgitNotice.bgmAgitNoticeFiles, bgmAgitNoticeFile).fetchJoin()
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(bgmAgitNotice.bgmAgitNoticeId.desc())
                .fetch();
        // DTO 변환
        List<BgmAgitNoticeResponse> content = result.stream()
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
        
        // Page 반환
        return new PageImpl<>(content, pageable, total);
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
        List<UploadResult> uploadResults = s3FileUtils.storeFiles(files);

        // 3. 파일 테이블 저장
        List<BgmAgitNoticeFile> noticeFileEntities = new ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            MultipartFile multipartFile = files.get(i);
            UploadResult result = uploadResults.get(i);
            
            BgmAgitNoticeFile fileEntity = new BgmAgitNoticeFile(
                    notice,
                    multipartFile.getOriginalFilename(),
                    result.getUuid(),
                    result.getUrl()
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
        
        // 1. 기존 파일 삭제
        List<BgmAgitNoticeFile> oldFiles = notice.getBgmAgitNoticeFiles();
        for (BgmAgitNoticeFile file : oldFiles) {
            s3FileUtils.deleteFile(file.getBgmAgitNoticeFileUrl());
        }
        bgmAgitNoticeFileRepository.deleteAll(oldFiles);
        
        // 2. 공지사항 내용 수정
        notice.modifyNotice(request);
        
        // 3. 새 파일 처리
        List<MultipartFile> multipartFiles = request.getMultipartFiles();
        if (multipartFiles != null && !multipartFiles.isEmpty()) {
            List<UploadResult> uploadResults = s3FileUtils.storeFiles(multipartFiles);
            List<BgmAgitNoticeFile> newEntities = new ArrayList<>();
            
            for (int i = 0; i < multipartFiles.size(); i++) {
                MultipartFile multipartFile = multipartFiles.get(i);
                UploadResult result = uploadResults.get(i);
                
                BgmAgitNoticeFile entity = new BgmAgitNoticeFile(
                        notice,
                        multipartFile.getOriginalFilename(),
                        result.getUuid(),
                        result.getUrl()
                );
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
