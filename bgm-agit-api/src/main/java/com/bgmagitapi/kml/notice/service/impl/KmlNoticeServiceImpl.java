package com.bgmagitapi.kml.notice.service.impl;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.entity.BgmAgitCommonFile;
import com.bgmagitapi.origin.file.entity.BgmAgitFile;
import com.bgmagitapi.origin.file.enums.FileType;
import com.bgmagitapi.origin.file.service.BgmAgitFileService;
import com.bgmagitapi.origin.file.service.InlineFileTracker;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePostRequest;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePutRequest;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetDetailResponse;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetResponse;
import com.bgmagitapi.kml.notice.entity.KmlNotice;
import com.bgmagitapi.kml.notice.repository.KmlNoticeRepository;
import com.bgmagitapi.kml.notice.service.KmlNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
public class KmlNoticeServiceImpl implements KmlNoticeService {

    private final KmlNoticeRepository kmlNoticeRepository;
    private final BgmAgitFileService bgmAgitFileService;
    private final InlineFileTracker inlineFileTracker;


    @Override
    public Page<KmlNoticeGetResponse> getKmlNotice(Pageable pageable, String titleAndCont) {
        return kmlNoticeRepository.findByKmlNotice(pageable, titleAndCont);
    }

    @Override
    public KmlNoticeGetDetailResponse getDetailKmlNotice(Long id) {
        KmlNotice kmlNotice = kmlNoticeRepository.findById(id).orElseThrow(() -> new RuntimeException("존재하지 않는 공지사항 입니다."));

        LocalDate localDate = kmlNotice.getRegistDate().toLocalDate();
        KmlNoticeGetDetailResponse result = KmlNoticeGetDetailResponse
                .builder()
                .id(kmlNotice.getId())
                .title(kmlNotice.getNoticeTitle())
                .cont(kmlNotice.getNoticeCont())
                .registDate(localDate)
                .build();

        List<KmlNoticeGetDetailResponse.KmlNoticeFile> merged = new ArrayList<>();

        // legacy: 옛 BgmAgitCommonFile(KML_NOTICE) 그대로 노출 — 기존 데이터 호환
        List<BgmAgitCommonFile> legacyFiles = kmlNoticeRepository.findByKmlNoticeFiles(List.of(id));
        for (BgmAgitCommonFile legacy : legacyFiles) {
            merged.add(
                    KmlNoticeGetDetailResponse.KmlNoticeFile.builder()
                            .id(legacy.getBgmAgitCommonFileId())
                            .fileName(legacy.getBgmAgitCommonFileName())
                            .fileUrl(legacy.getBgmAgitCommonFileUrl())
                            .fileFolder("kml-notice")
                            .legacy(true)
                            .build()
            );
        }

        // new: BgmAgitFile(MAHJONG_NOTICE) — fileId 만 내려보내고 프론트가 /file-view 로 presigned URL 가져감
        List<BgmAgitFile> newFiles = bgmAgitFileService.findCompletedByTargets(List.of(id), FileType.MAHJONG_NOTICE);
        for (BgmAgitFile file : newFiles) {
            merged.add(
                    KmlNoticeGetDetailResponse.KmlNoticeFile.builder()
                            .id(file.getId())
                            .fileName(file.getFileName())
                            .fileUrl(null)
                            .fileFolder("kml-notice")
                            .legacy(false)
                            .build()
            );
        }

        result.getFiles().addAll(merged);
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

        // 첨부 파일 TEMPORARY → COMPLETE 승격 + targetId 세팅
        bgmAgitFileService.modifyFileStatus(request.getFiles(), kmlNotice.getId());

        // 본문 인라인 이미지 동기화 (CK Editor 가 박은 img src ↔ BgmAgitFile)
        inlineFileTracker.syncInlineFiles(kmlNotice.getNoticeCont(), FileType.MAHJONG_NOTICE_INLINE, kmlNotice.getId());

        return new ApiResponse(200, true, "저장 되었습니다.");
    }

    @Override
    public ApiResponse modifyKmlNotice(KmlNoticePutRequest request) {
        Long kmlNoticeId = request.getId();
        KmlNotice kmlNotice = kmlNoticeRepository.findById(kmlNoticeId).orElseThrow(() -> new RuntimeException("존재 하지 않는 공지사항 입니다."));
        kmlNotice.modify(request);

        // CREATE/DELETE/NORMAL 의도 그대로 위임
        bgmAgitFileService.modifyFileStatus(request.getFiles(), kmlNoticeId);

        // 본문 인라인 이미지: 본문에 있는 건 COMPLETE 유지/승격, 빠진 건 TEMPORARY 로 되돌림
        inlineFileTracker.syncInlineFiles(kmlNotice.getNoticeCont(), FileType.MAHJONG_NOTICE_INLINE, kmlNoticeId);

        return new ApiResponse(200, true, "수정 되었습니다.");
    }

    @Override
    public ApiResponse removeKmlNotice(Long id) {

        // 첨부 + 인라인 모두 TEMPORARY 로 되돌려 배치가 정리
        List<BgmAgitFile> attachments = bgmAgitFileService.findCompletedByTargets(List.of(id), FileType.MAHJONG_NOTICE);
        attachments.forEach(BgmAgitFile::modifyTemporaryFileStatus);
        inlineFileTracker.releaseInlineFiles(FileType.MAHJONG_NOTICE_INLINE, id);

        kmlNoticeRepository.deleteById(id);

        return new ApiResponse(200, true, "삭제 되었습니다.");
    }

}
