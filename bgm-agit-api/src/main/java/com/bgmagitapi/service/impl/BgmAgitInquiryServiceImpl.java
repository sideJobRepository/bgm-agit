package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitInquiryPostRequest;
import com.bgmagitapi.controller.request.BgmAgitInquiryPutRequest;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetResponse;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.BgmAgitInquiry;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.event.dto.InquiryEvent;
import com.bgmagitapi.event.dto.TalkAction;
import com.bgmagitapi.repository.BgmAgitCommonFileRepository;
import com.bgmagitapi.repository.BgmAgitInquiryRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitInquiryService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitInquiryServiceImpl implements BgmAgitInquiryService {
    
    private final BgmAgitMemberRepository memberRepository;
    
    private final BgmAgitInquiryRepository inquiryRepository;
    
    private final BgmAgitCommonFileRepository commonFileRepository;
    
    private final ApplicationEventPublisher eventPublisher;
    
    private final S3FileUtils s3FileUtils;
    private final BgmAgitInquiryRepository bgmAgitInquiryRepository;
    
    
    @Override
    public Page<BgmAgitInquiryGetResponse> getInquiry(Long memberId, String role, Pageable pageable) {
        boolean isUser = "ROLE_USER".equals(role) || "ROLE_MENTOR".equals(role);
        Page<BgmAgitInquiry> inquiry = inquiryRepository.findByInquirys(memberId, isUser, pageable);
        return inquiry.map(item -> {
            return BgmAgitInquiryGetResponse
                    .builder()
                    .id(item.getBgmAgitInquiryId())
                    .title(item.getBgmAgitInquiryTitle())
                    .answerStatus(item.getBgmAgitInquiryAnswerStatus())
                    .memberName(item.getBgmAgitMember().getBgmAgitMemberName())
                    .memberId(item.getBgmAgitMember().getBgmAgitMemberId())
                    .registDate(item.getRegistDate())
                    .build();
        });
    }
    
    @Override
    public BgmAgitInquiryGetDetailResponse getDetailInquiry(Long inquiryId) {
        List<BgmAgitInquiry> byDetailInquiry = inquiryRepository.findByDetailInquiry(inquiryId);
     
         // 부모 문의 (HIERARCHY_ID가 NULL이거나 inquiryId와 동일한 경우)
         BgmAgitInquiry parent = byDetailInquiry.stream()
                 .filter(i -> i.getBgmAgitInquiryHierarchyId() == null
                           || i.getBgmAgitInquiryId().equals(inquiryId))
                 .findFirst()
                 .orElseThrow(() -> new RuntimeException("문의글을 찾을 수 없습니다."));
     
         // 답글 (부모 문의의 ID를 HIERARCHY_ID로 가진 항목)
         BgmAgitInquiry replyEntity = byDetailInquiry.stream()
                 .filter(i -> Objects.equals(i.getBgmAgitInquiryHierarchyId(), parent.getBgmAgitInquiryId()))
                 .findFirst()
                 .orElse(null);
     
         // 부모/답글 둘 다 파일 조회 (공통 파일 테이블에서)
         List<Long> targetIds = Stream.of(parent, replyEntity)
                 .filter(Objects::nonNull)
                 .map(BgmAgitInquiry::getBgmAgitInquiryId)
                 .toList();
     
         List<BgmAgitCommonFile> files = commonFileRepository.findAllByTargetIdsAndType(
                 targetIds, BgmAgitCommonType.INQUIRY
         );
     
         // ID별로 그룹핑
         Map<Long, List<BgmAgitCommonFile>> filesByTargetId = files.stream()
                 .collect(Collectors.groupingBy(BgmAgitCommonFile::getBgmAgitCommonFileTargetId));
     
         // 부모 파일 목록 매핑
         List<BgmAgitInquiryGetDetailResponse.Files> parentFiles =
                 filesByTargetId.getOrDefault(parent.getBgmAgitInquiryId(), List.of())
                         .stream()
                         .map(f -> BgmAgitInquiryGetDetailResponse.Files.builder()
                                 .id(f.getBgmAgitCommonFileId())
                                 .fileName(f.getBgmAgitCommonFileName())
                                 .fileUrl(f.getBgmAgitCommonFileUrl())
                                 .uuid(f.getBgmAgitCommonFileUuidName() + "." + FilenameUtils.getExtension(f.getBgmAgitCommonFileName()))
                                 .build())
                         .toList();
     
         // 답글 파일 목록 매핑
         List<BgmAgitInquiryGetDetailResponse.Files> replyFiles =
                 replyEntity == null ? List.of() :
                         filesByTargetId.getOrDefault(replyEntity.getBgmAgitInquiryId(), List.of())
                                 .stream()
                                 .map(f -> BgmAgitInquiryGetDetailResponse.Files.builder()
                                         .id(f.getBgmAgitCommonFileId())
                                         .fileName(f.getBgmAgitCommonFileName())
                                         .fileUrl(f.getBgmAgitCommonFileUrl())
                                         .uuid(f.getBgmAgitCommonFileUuidName()  + "." + FilenameUtils.getExtension(f.getBgmAgitCommonFileName()))
                                         .build())
                                 .toList();
     
         // 답글 DTO 생성
         BgmAgitInquiryGetDetailResponse.Reply reply = Optional.ofNullable(replyEntity)
                 .map(r -> BgmAgitInquiryGetDetailResponse.Reply.builder()
                         .id(String.valueOf(r.getBgmAgitInquiryId()))
                         .memberId(String.valueOf(r.getBgmAgitMember().getBgmAgitMemberId()))
                         .title(r.getBgmAgitInquiryTitle())
                         .cont(r.getBgmAgitInquiryCont())
                         .answerStatus(r.getBgmAgitInquiryAnswerStatus())
                         .memberName("관리자")
                         .registDate(r.getRegistDate())
                         .files(replyFiles)
                         .build())
                 .orElse(null);
     
         // 최종 DTO 조립
         return BgmAgitInquiryGetDetailResponse.builder()
                 .id(String.valueOf(parent.getBgmAgitInquiryId()))
                 .memberId(String.valueOf(parent.getBgmAgitMember().getBgmAgitMemberId()))
                 .title(parent.getBgmAgitInquiryTitle())
                 .cont(parent.getBgmAgitInquiryCont())
                 .answerStatus(parent.getBgmAgitInquiryAnswerStatus())
                 .memberName(parent.getBgmAgitMember().getBgmAgitMemberName())
                 .registDate(parent.getRegistDate())
                 .files(parentFiles)
                 .reply(reply)
                 .build();
    }
    
    @Override
    public ApiResponse createInquiry(BgmAgitInquiryPostRequest request) {
        
        Long memberId = request.getMemberId();
        BgmAgitMember bgmAgitMember = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("존재하지 않은 회원입니다."));
        
        BgmAgitInquiry result = BgmAgitInquiry
                .builder()
                .bgmAgitInquiryHierarchyId(request.getParentId())
                .bgmAgitInquiryTitle(request.getTitle())
                .bgmAgitInquiryCont(request.getCont())
                .bgmAgitInquiryAnswerStatus(request.getParentId() != null ? "Y" : "N")
                .bgmAgitMember(bgmAgitMember)
                .build();
        BgmAgitInquiry saveInquiry = inquiryRepository.save(result);
        
        List<MultipartFile> files = request.getFiles();
        
        List<UploadResult> inquiryFile = s3FileUtils.storeFiles(files, "inquiry");
        
        for (UploadResult uploadResult : inquiryFile) {
            BgmAgitCommonFile commonFile = BgmAgitCommonFile.builder()
                    .bgmAgitCommonFileTargetId(saveInquiry.getBgmAgitInquiryId())
                    .bgmAgitCommonFileType(BgmAgitCommonType.INQUIRY)
                    .bgmAgitCommonFileName(uploadResult.getOriginalFilename())
                    .bgmAgitCommonFileUuidName(uploadResult.getUuid())
                    .bgmAgitCommonFileUrl(uploadResult.getUrl())
                    .build();
            commonFileRepository.save(commonFile);
        }
        
        
        TalkAction talkAction = TalkAction.NONE;
        if (request.getParentId() != null) {
            talkAction = TalkAction.COMPLETE;
            Long parentId = request.getParentId();
            BgmAgitInquiry bgmAgitInquiry = inquiryRepository.findById(parentId).orElseThrow(() -> new RuntimeException("존재하지 않는 문의글 입니다."));
            bgmAgitInquiry.modifyAnswerStatus("Y");
        }
        if (request.getParentId() != null) {
            Long parentId = request.getParentId();
            BgmAgitInquiry bgmAgitInquiry = inquiryRepository.findById(parentId).orElseThrow(() -> new RuntimeException("존재하지 않는 문의글 입니다."));
            String memberName = bgmAgitInquiry.getBgmAgitMember().getBgmAgitMemberName();
            String memberPhoneNo = bgmAgitInquiry.getBgmAgitMember().getBgmAgitMemberPhoneNo();
            eventPublisher.publishEvent(new InquiryEvent(request.getParentId() != null ? request.getParentId() : saveInquiry.getBgmAgitInquiryId(), memberName, request.getTitle(), saveInquiry.getRegistDate() ,memberPhoneNo,talkAction));
        }else {
            eventPublisher.publishEvent(new InquiryEvent(saveInquiry.getBgmAgitInquiryId(), bgmAgitMember.getBgmAgitMemberName(), request.getTitle(), saveInquiry.getRegistDate() ,bgmAgitMember.getBgmAgitMemberPhoneNo(),talkAction));
        }
        
        return new ApiResponse(200, true, "1:1 문의가 접수되었습니다.");
    }
    
    @Override
    public ApiResponse modifyInquiry(BgmAgitInquiryPutRequest request) {
        Long id = request.getId();
        BgmAgitInquiry inquiry = inquiryRepository.findById(id).orElseThrow(() -> new RuntimeException("존재 하지 않는 문의입니다."));
        
        inquiry.modify(request);
        
        List<Long> deletedFiles = request.getDeletedFiles();
        if (!deletedFiles.isEmpty()) {
            List<BgmAgitCommonFile> byUUID = commonFileRepository.findByIds(deletedFiles);
            
            for (BgmAgitCommonFile file : byUUID) {
                
                s3FileUtils.deleteFile(file.getBgmAgitCommonFileUrl());
            }
            commonFileRepository.removeFiles(deletedFiles);
        }
        
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            List<UploadResult> uploadResults = s3FileUtils.storeFiles(request.getFiles(), "inquiry");
            
            List<BgmAgitCommonFile> commonFiles = uploadResults.stream()
                    .map(item -> {
                        return BgmAgitCommonFile
                                .builder()
                                .bgmAgitCommonFileTargetId(id)
                                .bgmAgitCommonFileType(BgmAgitCommonType.INQUIRY)
                                .bgmAgitCommonFileUrl(item.getUrl())
                                .bgmAgitCommonFileUuidName(item.getUuid())
                                .bgmAgitCommonFileName(item.getOriginalFilename())
                                .build();
                    })
                    .toList();
            commonFileRepository.saveAll(commonFiles);
        }
        
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
    
    @Override
    public ApiResponse deleteInquiry(Long id) {
        List<BgmAgitInquiry> byDetailInquiry = inquiryRepository.findByDetailInquiry(id);
        
        for (BgmAgitInquiry bgmAgitInquiry : byDetailInquiry) {
            Long bgmAgitInquiryId = bgmAgitInquiry.getBgmAgitInquiryId();
            List<BgmAgitCommonFile> byDeleteFile = commonFileRepository.findByDeleteFile(bgmAgitInquiryId, BgmAgitCommonType.INQUIRY);
            for (BgmAgitCommonFile bgmAgitCommonFile : byDeleteFile) {
                s3FileUtils.deleteFile(bgmAgitCommonFile.getBgmAgitCommonFileUrl());
            }
            commonFileRepository.deleteAll(byDeleteFile);
        }
        
        inquiryRepository.deleteByInquiry(id);
        return new ApiResponse(200,true,"삭제 되었습니다.");
    }
    
}
