package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.config.S3FileUtils;
import com.bgmagitapi.origin.config.UploadResult;
import com.bgmagitapi.origin.controller.request.BgmAgitRoomCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitRoomModifyRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitRoomResponse;
import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.repository.BgmAgitRoomRepository;
import com.bgmagitapi.origin.service.BgmAgitRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitRoomServiceImpl implements BgmAgitRoomService {

    // 방 이미지가 IMAGE 테이블 시절 올라가 있던 폴더와 같다
    private static final String IMAGE_FOLDER = "images";

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private final BgmAgitRoomRepository bgmAgitRoomRepository;

    private final S3FileUtils s3FileUtils;

    @Override
    @Transactional(readOnly = true)
    public List<BgmAgitRoomResponse> getRooms(String link, boolean includeHidden, List<String> roles) {
        boolean withHidden = includeHidden && isAdmin(roles);
        return bgmAgitRoomRepository.findRooms(link, withHidden).stream()
                .map(BgmAgitRoomResponse::from)
                .toList();
    }

    @Override
    public ApiResponse createRoom(BgmAgitRoomCreateRequest request) {
        validatePeople(request.getMinPeople(), request.getMaxPeople());

        UploadResult image = upload(request.getImage());
        if (image == null) {
            throw new IllegalArgumentException("이미지를 넣어 주세요.");
        }

        BgmAgitRoom room = new BgmAgitRoom(
                request.getName().trim(),
                request.getLink(),
                request.getMinPeople(),
                request.getMaxPeople(),
                trimToNull(request.getGuide()),
                image.getUrl(),
                request.getUseStatus()
        );
        bgmAgitRoomRepository.save(room);

        return new ApiResponse(200, true, "저장 되었습니다.");
    }

    @Override
    public ApiResponse modifyRoom(BgmAgitRoomModifyRequest request) {
        BgmAgitRoom room = bgmAgitRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        validatePeople(request.getMinPeople(), request.getMaxPeople());

        // 룸 ↔ 마작 대탁 구분(링크)은 예약 이력이 생긴 뒤에는 못 바꾼다. 기존 예약의 결제 방식이
        // 링크로 정해져서(인원×단가 ↔ 정액), 바꾸면 대기 예약 결제 금액이 뒤집혀 승인 검증에서 막힌다
        if (StringUtils.hasText(request.getLink())
                && !request.getLink().equals(room.getBgmAgitRoomLink())
                && bgmAgitRoomRepository.existsReservationByRoomId(room.getBgmAgitRoomId())) {
            throw new IllegalArgumentException("예약 이력이 있는 방은 구분(룸/마작 대탁)을 바꿀 수 없습니다. 새 방으로 등록해 주세요.");
        }

        boolean hiding = "N".equals(request.getUseStatus()) && !room.isHidden();

        String oldImageUrl = room.getBgmAgitRoomImageUrl();
        UploadResult image = upload(request.getImage());

        room.modify(
                request.getName().trim(),
                request.getLink(),
                request.getMinPeople(),
                request.getMaxPeople(),
                trimToNull(request.getGuide()),
                request.getUseStatus(),
                image != null ? image.getUrl() : null
        );

        // 새 이미지가 올라갔을 때만 옛 파일을 지운다. 업로드가 먼저라 업로드가 실패해도 기존 이미지는 남는다
        if (image != null && StringUtils.hasText(oldImageUrl)) {
            deleteImageQuietly(oldImageUrl);
        }

        return new ApiResponse(200, true, "수정 되었습니다." + (hiding ? remainingReservationNotice(room) : ""));
    }

    @Override
    public ApiResponse deleteRoom(Long roomId) {
        BgmAgitRoom room = bgmAgitRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        // 예약 이력은 FK RESTRICT 로 방에 물려 있다. 지우지 않고 숨겨서 이력(예약내역·영수증)을 보존한다
        if (bgmAgitRoomRepository.existsReservationByRoomId(roomId)) {
            room.hide();
            return new ApiResponse(200, true,
                    "예약 이력이 있어 삭제하지 않고 숨김 처리했습니다." + remainingReservationNotice(room));
        }

        String imageUrl = room.getBgmAgitRoomImageUrl();
        bgmAgitRoomRepository.delete(room);
        bgmAgitRoomRepository.flush(); // DB 삭제가 확정된 뒤에 S3 파일을 지운다

        if (StringUtils.hasText(imageUrl)) {
            deleteImageQuietly(imageUrl);
        }

        return new ApiResponse(200, true, "삭제 되었습니다.");
    }

    /**
     * 숨긴 방에 아직 남아 있는 오늘 이후 미취소 예약 안내. 숨김은 신규 예약·결제만 막고(대기건은 결제 불가),
     * 이미 들어온 예약은 자동으로 정리하지 않으므로 관리자가 직접 연락·취소해야 한다.
     */
    private String remainingReservationNotice(BgmAgitRoom room) {
        long remaining = bgmAgitRoomRepository.countActiveReservationsFrom(room.getBgmAgitRoomId(), LocalDate.now(KST));
        if (remaining <= 0) {
            return "";
        }
        return " 오늘 이후 취소되지 않은 예약이 " + remaining + "건 남아 있습니다(대기 예약은 결제할 수 없습니다). 예약 현황에서 확인 후 정리해 주세요.";
    }

    private UploadResult upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        return s3FileUtils.storeFile(file, IMAGE_FOLDER);
    }

    private void deleteImageQuietly(String url) {
        try {
            s3FileUtils.deleteFile(url);
        } catch (Exception e) {
            log.warn("[room] 이미지 삭제 실패 url={}", url, e);
        }
    }

    private void validatePeople(Integer minPeople, Integer maxPeople) {
        if (minPeople != null && maxPeople != null && minPeople > maxPeople) {
            throw new IllegalArgumentException("최소 인원이 최대 인원보다 클 수 없습니다.");
        }
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private boolean isAdmin(List<String> roles) {
        if (roles == null) {
            return false;
        }
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN");
    }
}
