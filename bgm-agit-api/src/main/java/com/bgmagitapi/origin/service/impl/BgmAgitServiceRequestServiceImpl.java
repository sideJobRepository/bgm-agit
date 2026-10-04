package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.config.S3FileUtils;
import com.bgmagitapi.origin.config.UploadResult;
import com.bgmagitapi.origin.controller.request.BgmAgitServiceRequestPostRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitServiceRequestPutRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitServiceRequestGetDetailResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitServiceRequestGetResponse;
import com.bgmagitapi.origin.entity.BgmAgitCommonFile;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitServiceRequest;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.origin.repository.BgmAgitCommonFileRepository;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitServiceRequestRepository;
import com.bgmagitapi.origin.service.BgmAgitServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 서비스 요청(유지보수 요청) 게시판. 1:1 문의(BgmAgitInquiryServiceImpl)와 같은 구조이고,
 * 관리자끼리 쓰는 게시판이라 목록은 전체가 보이고 알림톡은 보내지 않는다.
 * 관리자 검사는 컨트롤러에서 한다.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitServiceRequestServiceImpl implements BgmAgitServiceRequestService {

    private static final String S3_FOLDER = "service-request";

    private final BgmAgitMemberRepository memberRepository;

    private final BgmAgitServiceRequestRepository serviceRequestRepository;

    private final BgmAgitCommonFileRepository commonFileRepository;

    private final S3FileUtils s3FileUtils;

    @Override
    @Transactional(readOnly = true)
    public Page<BgmAgitServiceRequestGetResponse> getServiceRequests(Pageable pageable, String titleOrCont) {
        return serviceRequestRepository.findServiceRequests(pageable, titleOrCont)
                .map(item -> BgmAgitServiceRequestGetResponse.builder()
                        .id(item.getBgmAgitServiceRequestId())
                        .title(item.getBgmAgitServiceRequestTitle())
                        .answerStatus(item.getBgmAgitServiceRequestAnswerStatus())
                        .memberName(item.getBgmAgitMember().getBgmAgitMemberName())
                        .memberId(item.getBgmAgitMember().getBgmAgitMemberId())
                        .registDate(item.getRegistDate())
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public BgmAgitServiceRequestGetDetailResponse getDetailServiceRequest(Long id) {
        List<BgmAgitServiceRequest> rows = serviceRequestRepository.findByDetailServiceRequest(id);

        BgmAgitServiceRequest parent = rows.stream()
                .filter(i -> i.getBgmAgitServiceRequestHierarchyId() == null)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("요청글을 찾을 수 없습니다."));

        BgmAgitServiceRequest replyEntity = rows.stream()
                .filter(i -> Objects.equals(i.getBgmAgitServiceRequestHierarchyId(), parent.getBgmAgitServiceRequestId()))
                .findFirst()
                .orElse(null);

        List<Long> targetIds = Stream.of(parent, replyEntity)
                .filter(Objects::nonNull)
                .map(BgmAgitServiceRequest::getBgmAgitServiceRequestId)
                .toList();

        Map<Long, List<BgmAgitCommonFile>> filesByTargetId = commonFileRepository
                .findAllByTargetIdsAndType(targetIds, BgmAgitCommonType.SERVICE_REQUEST)
                .stream()
                .collect(Collectors.groupingBy(BgmAgitCommonFile::getBgmAgitCommonFileTargetId));

        BgmAgitServiceRequestGetDetailResponse.Reply reply = replyEntity == null ? null :
                BgmAgitServiceRequestGetDetailResponse.Reply.builder()
                        .id(String.valueOf(replyEntity.getBgmAgitServiceRequestId()))
                        .memberId(String.valueOf(replyEntity.getBgmAgitMember().getBgmAgitMemberId()))
                        .title(replyEntity.getBgmAgitServiceRequestTitle())
                        .cont(replyEntity.getBgmAgitServiceRequestCont())
                        .answerStatus(replyEntity.getBgmAgitServiceRequestAnswerStatus())
                        // 관리자끼리 주고받는 글이라 "관리자" 대신 실제 작성자를 보여준다
                        .memberName(replyEntity.getBgmAgitMember().getBgmAgitMemberName())
                        .registDate(replyEntity.getRegistDate())
                        .files(toFiles(filesByTargetId.get(replyEntity.getBgmAgitServiceRequestId())))
                        .build();

        return BgmAgitServiceRequestGetDetailResponse.builder()
                .id(String.valueOf(parent.getBgmAgitServiceRequestId()))
                .memberId(String.valueOf(parent.getBgmAgitMember().getBgmAgitMemberId()))
                .title(parent.getBgmAgitServiceRequestTitle())
                .cont(parent.getBgmAgitServiceRequestCont())
                .answerStatus(parent.getBgmAgitServiceRequestAnswerStatus())
                .memberName(parent.getBgmAgitMember().getBgmAgitMemberName())
                .registDate(parent.getRegistDate())
                .files(toFiles(filesByTargetId.get(parent.getBgmAgitServiceRequestId())))
                .reply(reply)
                .build();
    }

    @Override
    public ApiResponse createServiceRequest(BgmAgitServiceRequestPostRequest request) {
        BgmAgitMember member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new RuntimeException("존재하지 않은 회원입니다."));

        Long parentId = request.getParentId();
        if (parentId != null) {
            BgmAgitServiceRequest parent = serviceRequestRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("존재하지 않는 요청글입니다."));
            if (parent.getBgmAgitServiceRequestHierarchyId() != null) {
                throw new RuntimeException("답변에는 답변을 달 수 없습니다.");
            }
            parent.modifyAnswerStatus("Y");
        }

        BgmAgitServiceRequest saved = serviceRequestRepository.save(BgmAgitServiceRequest.builder()
                .bgmAgitServiceRequestHierarchyId(parentId)
                .bgmAgitServiceRequestTitle(request.getTitle())
                .bgmAgitServiceRequestCont(request.getCont())
                .bgmAgitServiceRequestAnswerStatus(parentId != null ? "Y" : "N")
                .bgmAgitMember(member)
                .build());

        saveFiles(saved.getBgmAgitServiceRequestId(), request.getFiles());

        return new ApiResponse(200, true, parentId != null ? "답변이 등록되었습니다." : "서비스 요청이 접수되었습니다.");
    }

    @Override
    public ApiResponse modifyServiceRequest(BgmAgitServiceRequestPutRequest request) {
        Long id = request.getId();
        BgmAgitServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 요청글입니다."));

        serviceRequest.modify(request);

        List<Long> deletedFiles = request.getDeletedFiles();
        if (!deletedFiles.isEmpty()) {
            for (BgmAgitCommonFile file : commonFileRepository.findByIds(deletedFiles)) {
                s3FileUtils.deleteFile(file.getBgmAgitCommonFileUrl());
            }
            commonFileRepository.removeFiles(deletedFiles);
        }

        saveFiles(id, request.getFiles());

        return new ApiResponse(200, true, "수정 되었습니다.");
    }

    @Override
    public ApiResponse deleteServiceRequest(Long id) {
        BgmAgitServiceRequest target = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 요청글입니다."));

        // 답변만 지우면 원글은 다시 처리대기로
        Long parentId = target.getBgmAgitServiceRequestHierarchyId();
        if (parentId != null) {
            serviceRequestRepository.findById(parentId)
                    .ifPresent(parent -> parent.modifyAnswerStatus("N"));
        }

        for (BgmAgitServiceRequest row : serviceRequestRepository.findByDetailServiceRequest(id)) {
            List<BgmAgitCommonFile> files = commonFileRepository.findByDeleteFile(
                    row.getBgmAgitServiceRequestId(), BgmAgitCommonType.SERVICE_REQUEST);
            for (BgmAgitCommonFile file : files) {
                s3FileUtils.deleteFile(file.getBgmAgitCommonFileUrl());
            }
            commonFileRepository.deleteAll(files);
        }

        serviceRequestRepository.deleteByServiceRequest(id);
        return new ApiResponse(200, true, "삭제 되었습니다.");
    }

    private void saveFiles(Long targetId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return;

        List<UploadResult> uploadResults = s3FileUtils.storeFiles(files, S3_FOLDER);
        commonFileRepository.saveAll(uploadResults.stream()
                .map(item -> BgmAgitCommonFile.builder()
                        .bgmAgitCommonFileTargetId(targetId)
                        .bgmAgitCommonFileType(BgmAgitCommonType.SERVICE_REQUEST)
                        .bgmAgitCommonFileName(item.getOriginalFilename())
                        .bgmAgitCommonFileUuidName(item.getUuid())
                        .bgmAgitCommonFileUrl(item.getUrl())
                        .build())
                .toList());
    }

    private List<BgmAgitServiceRequestGetDetailResponse.Files> toFiles(List<BgmAgitCommonFile> files) {
        if (files == null) return List.of();
        return files.stream()
                .map(f -> BgmAgitServiceRequestGetDetailResponse.Files.builder()
                        .id(f.getBgmAgitCommonFileId())
                        .fileName(f.getBgmAgitCommonFileName())
                        .fileUrl(f.getBgmAgitCommonFileUrl())
                        .uuid(f.getBgmAgitCommonFileUuidName() + "." + FilenameUtils.getExtension(f.getBgmAgitCommonFileName()))
                        .build())
                .toList();
    }
}
