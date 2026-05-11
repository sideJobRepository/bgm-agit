package com.bgmagitapi.kml.record.service.impl;

import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.event.dto.KmlRecordModifyEvent;
import com.bgmagitapi.event.dto.KmlRecordSubmitEvent;
import com.bgmagitapi.event.dto.MatchRecordRegisteredEvent;
import com.bgmagitapi.file.entity.BgmAgitFile;
import com.bgmagitapi.file.enums.FileType;
import com.bgmagitapi.file.service.BgmAgitFileService;
import com.bgmagitapi.kml.history.service.MatchsAndRecordHistoryService;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.password.service.BgmAgitPasswordService;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.enums.Wind;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import com.bgmagitapi.kml.record.service.RecordService;
import com.bgmagitapi.kml.setting.entity.Setting;
import com.bgmagitapi.kml.setting.repository.SettingRepository;
import com.bgmagitapi.kml.tournament.entity.Tournament;
import com.bgmagitapi.kml.tournament.enums.TournamentProgressStatus;
import com.bgmagitapi.kml.tournament.repository.TournamentRepository;
import com.bgmagitapi.kml.tournamentsetting.entity.TournamentSetting;
import com.bgmagitapi.kml.yakuman.entity.Yakuman;
import com.bgmagitapi.kml.yakuman.repository.YakumanRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.util.CalculateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {

    private final RecordRepository recordRepository;

    private final MatchsRepository matchsRepository;

    private final BgmAgitMemberRepository memberRepository;

    private final SettingRepository settingRepository;

    private final TournamentRepository tournamentRepository;

    private final YakumanRepository yakumanRepository;

    private final MatchsAndRecordHistoryService matchsAndRecordHistoryService;

    private final BgmAgitFileService bgmAgitFileService;

    private final BgmAgitPasswordService bgmAgitPasswordService;

    private final ApplicationEventPublisher eventPublisher;
    
    private static final Map<Wind, Integer> WIND_ORDER = Map.of(
            Wind.EAST, 0,
            Wind.SOUTH, 1,
            Wind.WEST, 2,
            Wind.NORTH, 3
    );
    
    
    @Override
    public Page<RecordGetResponse> getRecords(Pageable pageable, String startDate, String endDate, String nickName, String tournamentStatus, List<String> roles) {
        boolean canSeeDeleted = canSeeDeleted(roles);
        Page<Record> records = recordRepository.findByRecords(pageable, startDate, endDate, nickName, tournamentStatus, canSeeDeleted);
    
        Map<Long, List<Record>> groupedByMatch = records.getContent().stream()
                        .filter(r -> r.getMatchs() != null)
                        .collect(Collectors.groupingBy(r -> r.getMatchs().getId()));
    
        List<RecordGetResponse> list = groupedByMatch.entrySet().stream()
                .map(entry -> {
    
                    List<Record> group = new ArrayList<>(entry.getValue());
                    if (group.isEmpty()) return null;
                    
                    // 1단계: 점수 기준 정렬 → rank 계산
                    group.sort(Comparator.comparing(Record::getRecordScore).reversed());
    
                    Map<Long, Integer> rankMap = new HashMap<>();
                    for (int i = 0; i < group.size(); i++) {
                        rankMap.put(group.get(i).getId(), i + 1);
                    }
                    
                    // 2단계: 동남서북 순 정렬 (enum 선언 순서)
                    group.sort(Comparator.comparing(r -> r.getRecordSeat().ordinal()));
    
                    RecordGetResponse response = new RecordGetResponse();
                    response.setMatchsId(entry.getKey());
                    response.setCreateNicname(group.get(0).getMatchs().getMember().getBgmAgitMemberNickname());
                    response.setRegistDate(group.get(0).getMatchs().getRegistDate());
                    response.setTournamentStatus(group.get(0).getMatchs().getTournamentStatus());
                    Tournament t = group.get(0).getMatchs().getTournament();
                    response.setTournamentName(t != null ? t.getName() : null);
                    response.setMatchsWind(group.get(0).getMatchs().getWind());
                    response.setDelStatus(group.get(0).getMatchs().getDelStatus());
                    for (Record rec : group) {
    
                        RecordGetResponse.Row row = new RecordGetResponse.Row();
    
                        // enum value
                        row.setSeat(rec.getRecordSeat().getValue());
    
                        row.setRank(rankMap.get(rec.getId()));
                        row.setNickname(rec.getMember() != null ? rec.getMember().getBgmAgitMemberNickname() : "");
                        row.setScore(rec.getRecordScore());
                        row.setPoint(rec.getRecordPoint());
                        row.setWinner(rankMap.get(rec.getId()) == 1);
    
                        response.getRows().add(row);
                    }
    
                    return response;
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(RecordGetResponse::getRegistDate).reversed())
                .toList();
        
        Long countQuery = recordRepository.countQuery(startDate, endDate, nickName, tournamentStatus, canSeeDeleted);
        return new PageImpl<>(list, pageable, countQuery == null ? 0 : countQuery);
    }

    private boolean canSeeDeleted(List<String> roles) {
        if (roles == null) return false;
        return roles.contains("ROLE_ADMIN") || roles.contains("ROLE_MENTOR");
    }
    
    @Override
    public RecordGetDetailResponse getRecordDetail(Long id) {

        Matchs matchs = matchsRepository.findById(id).orElseThrow(() -> new RuntimeException("존재 하지 않은 대국입니다."));

        List<RecordGetDetailResponse.RecordList> records = recordRepository.findByRecord(id);
        List<RecordGetDetailResponse.YakumanList> yakumanLists = yakumanRepository.findByMatchsYakuman(id);

        Tournament tournament = matchs.getTournament();
        TournamentSetting tournamentSetting = tournament != null ? tournament.getTournamentSetting() : null;
        Integer tournamentTurning = tournamentSetting != null ? tournamentSetting.getTurning() : null;
        String tournamentName = tournament != null ? tournament.getName() : null;

        return new RecordGetDetailResponse(
                matchs.getId(),
                matchs.getTournamentStatus(),
                tournamentTurning,
                tournamentName,
                matchs.getWind(),
                records,
                yakumanLists
        );
    }
    
    @Override
    public ApiResponse createRecord(RecordPostRequest request, Long memberId) {

        bgmAgitPasswordService.verify(request.getPassword());

        Set<Long> recordMemberSet = request.getRecords().stream()
                .map(RecordPostRequest.Records::getMemberId)
                .collect(Collectors.toSet());

        if (recordMemberSet.size() != 4) {
            throw new ValidException("동일 사용자가 기록에 포함되어 있습니다.");
        }

        List<Long> invalidMemberIds = request.getYakumans().stream()
                .map(RecordPostRequest.Yakumans::getMemberId)
                .filter(id -> !recordMemberSet.contains(id))
                .toList();

        if (!invalidMemberIds.isEmpty()) {
            throw new ValidException("대국 참가자가 아닌 회원이 역만 기록에 포함되어 있습니다.");
        }


        MatchsWind wind = request.getWind();
        String tournamentStatus = request.getTournamentStatus() != null ? request.getTournamentStatus() : "N";
        Setting setting = settingRepository.findBySetting();
        Tournament activeTournament = null;
        TournamentSetting tournamentSetting = null;
        if ("Y".equals(tournamentStatus)) {
            activeTournament = tournamentRepository.findFirstByProgressStatus(TournamentProgressStatus.ACTIVE)
                    .orElseThrow(() -> new ValidException("진행 중인 대회가 없습니다."));
            LocalDate startDate = activeTournament.getStartDate();
            LocalDate endDate = activeTournament.getEndDate();
            LocalTime startTime = activeTournament.getStartTime();
            LocalTime endTime = activeTournament.getEndTime();
            if (startDate == null || endDate == null || startTime == null || endTime == null) {
                throw new ValidException("대회 시작/종료 일시가 설정되지 않았습니다.");
            }
            LocalDateTime start = LocalDateTime.of(startDate, startTime);
            LocalDateTime end = LocalDateTime.of(endDate, endTime);
            LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
            if (now.isBefore(start) || now.isAfter(end)) {
                throw new ValidException(String.format(
                        "대회 시간(%s ~ %s) 외에는 기록할 수 없습니다. 현재 %s",
                        start, end, now));
            }
            tournamentSetting = activeTournament.getTournamentSetting();
            if (tournamentSetting == null) {
                throw new ValidException("대회 설정이 지정되지 않았습니다.");
            }
        }

        Integer sum = request.getRecords()
                .stream()
                .mapToInt(RecordPostRequest.Records::getRecordScore).sum();
        Integer turning = "Y".equals(tournamentStatus)
                ? tournamentSetting.getTurning() * 4
                : setting.getTurning() * 4;
        if (!sum.equals(turning)) {
            String message = String.format("입력된 점수 합계(%d)가 기준 점수(%d)와 일치하지 않습니다.", sum, turning);
            throw new ValidException(message);
        }

        AtomicInteger rankCount = new AtomicInteger(1);
        BgmAgitMember bgmAgitMember = memberRepository.findById(memberId).orElseThrow(() -> new ValidException("다시 로그인 해주세요"));
        Matchs matchs = Matchs.builder()
                .wind(wind)
                .tournamentStatus(tournamentStatus)
                .setting(setting)
                .tournament(activeTournament)
                .delStatus("N")
                .member(bgmAgitMember)
                .build();

        matchsRepository.save(matchs);

        List<RecordPostRequest.Records> records = request.getRecords();
        records.sort(
                Comparator.comparing(
                        RecordPostRequest.Records::getRecordScore,
                        Comparator.reverseOrder()
                ).thenComparing(r -> WIND_ORDER.get(r.getRecordSeat())));

        records.forEach(item -> item.setRecordRank(rankCount.getAndIncrement()));
        int multiplier = CalculateUtil.seatMultiplier(matchs.getWind());
        List<Record> recordList = new ArrayList<>();
        for (RecordPostRequest.Records record : records) {
            BgmAgitMember member = memberRepository.findById(record.getMemberId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
            Double recordPoint = tournamentSetting != null
                    ? CalculateUtil.calculatePlayerPoint(record, tournamentSetting, multiplier)
                    : CalculateUtil.calculatePlayerPoint(record, setting, multiplier);
            Record saveRecord = Record.builder()
                    .matchs(matchs)
                    .member(member)
                    .recordRank(record.getRecordRank())
                    .recordScore(record.getRecordScore())
                    .recordPoint(recordPoint)
                    .recordSeat(record.getRecordSeat())
                    .build();
            recordRepository.save(saveRecord);
            recordList.add(saveRecord);
        }
        List<RecordPostRequest.Yakumans> yakumans = request.getYakumans();
        for (RecordPostRequest.Yakumans yakuman : yakumans) {
            BgmAgitMember member = memberRepository.findById(yakuman.getMemberId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
            String yakumanName = yakuman.getYakumanName();
            Yakuman saveYakuman = Yakuman
                    .builder()
                    .member(member)
                    .matchs(matchs)
                    .yakumanName(yakumanName)
                    .yakumanCont(yakuman.getYakumanCont())
                    .build();
            yakumanRepository.save(saveYakuman);
            bgmAgitFileService.modifyFileStatus(yakuman.getFiles(), saveYakuman.getId());
        }
        matchsAndRecordHistoryService.createMatchsAndRecordHistory(matchs, recordList);

        publishKmlSubmitEvent(matchs, recordList);

        eventPublisher.publishEvent(new MatchRecordRegisteredEvent(matchs.getId()));

        return new ApiResponse(200, true, "기록이 저장되었습니다.");
    }

    private void publishKmlSubmitEvent(Matchs matchs, List<Record> recordList) {
        if (recordList.size() != 4) {
            log.info("[KML] record_submit 송신 생략 — 참가자 수가 4명이 아님 size={}", recordList.size());
            return;
        }

        List<KmlRecordSubmitEvent.Player> players = new ArrayList<>();
        for (Record rec : recordList) {
            BgmAgitMember member = rec.getMember();
            Long kmlId = member != null ? member.getBgmAgitMemberKmlId() : null;
            if (kmlId == null) {
                log.info("[KML] record_submit 송신 생략 — KML 미연동 회원 포함 memberId={}",
                        member != null ? member.getBgmAgitMemberId() : null);
                return;
            }
            players.add(new KmlRecordSubmitEvent.Player(
                    kmlId,
                    rec.getRecordScore(),
                    rec.getRecordSeat().ordinal()
            ));
        }

        eventPublisher.publishEvent(new KmlRecordSubmitEvent(
                matchs.getId(),
                matchs.getWind().ordinal(),
                0,
                players
        ));
    }

    private void publishKmlModifyEvent(Matchs matchs, List<Record> recordList) {
        if (matchs.getMatchsKmlId() == null) {
            log.info("[KML] record_modify 송신 생략 — matchsKmlId 없음 (등록 미송신 게임) matchsId={}", matchs.getId());
            return;
        }
        if (recordList.size() != 4) {
            log.info("[KML] record_modify 송신 생략 — 참가자 수가 4명이 아님 size={}", recordList.size());
            return;
        }

        List<KmlRecordSubmitEvent.Player> players = new ArrayList<>();
        for (Record rec : recordList) {
            BgmAgitMember member = rec.getMember();
            Long kmlId = member != null ? member.getBgmAgitMemberKmlId() : null;
            if (kmlId == null) {
                log.info("[KML] record_modify 송신 생략 — KML 미연동 회원 포함 memberId={}",
                        member != null ? member.getBgmAgitMemberId() : null);
                return;
            }
            players.add(new KmlRecordSubmitEvent.Player(
                    kmlId,
                    rec.getRecordScore(),
                    rec.getRecordSeat().ordinal()
            ));
        }

        eventPublisher.publishEvent(new KmlRecordModifyEvent(
                matchs.getMatchsKmlId(),
                matchs.getWind().ordinal(),
                0,
                players
        ));
    }
    
    @Override
    public ApiResponse updateRecord(RecordPutRequest request, Long requestMemberId) {

        bgmAgitPasswordService.verify(request.getPassword());

        Long matchsId = request.getMatchsId();
        
        // Match 조회
        Matchs matchs = matchsRepository.findById(matchsId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 경기입니다."));
        
        Long settingId = matchs.getSetting().getId();

        Setting setting = settingRepository.findById(settingId)
                .orElseThrow(() -> new RuntimeException("존재하지않는 세팅값입니다."));

        // 대회 기록이면 그 대회의 setting을 사용 (sum 검증 + 점수 재계산 모두)
        TournamentSetting tournamentSetting = matchs.getTournament() != null
                ? matchs.getTournament().getTournamentSetting()
                : null;

        // 참가자 검증
        Set<Long> recordMemberSet = request.getRecords().stream()
                .map(RecordPutRequest.Records::getMemberId)
                .collect(Collectors.toSet());

        if (recordMemberSet.size() != 4) {
            throw new ValidException("동일 사용자가 기록에 포함되어 있습니다.");
        }

        List<Long> invalidMemberIds = request.getYakumans().stream()
                .map(RecordPutRequest.Yakumans::getMemberId)
                .filter(id -> !recordMemberSet.contains(id))
                .toList();

        if (!invalidMemberIds.isEmpty()) {
            throw new ValidException("대국 참가자가 아닌 회원이 역만 기록에 포함되어 있습니다.");
        }

        // 점수 합 검증
        Integer sum = request.getRecords().stream()
                .mapToInt(RecordPutRequest.Records::getRecordScore)
                .sum();

        Integer turning = tournamentSetting != null
                ? tournamentSetting.getTurning() * 4
                : setting.getTurning() * 4;

        if (!sum.equals(turning)) {
            throw new ValidException(
                    String.format("입력된 점수 합계(%d)가 기준 점수(%d)와 일치하지 않습니다.", sum, turning)
            );
        }
        
        // Match 수정
        matchs.modify(request.getWind(), request.getTournamentStatus());
        
        // ------------------------
        // Record 수정
        // ------------------------
        
        List<Record> records = recordRepository.findByRecordByMatchsId(matchsId);
        
        Map<Long, Record> recordMap = records.stream()
                .collect(Collectors.toMap(Record::getId, r -> r));
        
        List<RecordPutRequest.Records> sorted = new ArrayList<>(request.getRecords());
        
        sorted.sort(
                Comparator.comparing(
                        RecordPutRequest.Records::getRecordScore,
                        Comparator.reverseOrder()
                ).thenComparing(r -> WIND_ORDER.get(r.getRecordSeat()))
        );
        
        AtomicInteger rankCounter = new AtomicInteger(1);
        
        int multiplier = CalculateUtil.seatMultiplier(matchs.getWind());
        
        Set<Long> requestRecordIds = new HashSet<>();
        
        for (RecordPutRequest.Records dto : sorted) {
            
            dto.setRecordRank(rankCounter.getAndIncrement());
            
            Record record = recordMap.get(dto.getRecordId());
            
            if (record == null) {
                throw new RuntimeException("존재하지 않는 Record ID: " + dto.getRecordId());
            }
            
            Double point = tournamentSetting != null
                    ? CalculateUtil.calculatePlayerPoint(dto, tournamentSetting, multiplier)
                    : CalculateUtil.calculatePlayerPoint(dto, setting, multiplier);
            
            Long memberId = dto.getMemberId();
            
            BgmAgitMember member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("존재 하지 않은 회원입니다."));
            
            record.modify(dto, point, member);
            
            requestRecordIds.add(record.getId());
        }
        
        // 삭제 대상 Record
        records.stream()
                .filter(r -> !requestRecordIds.contains(r.getId()))
                .forEach(recordRepository::delete);
        
        // ------------------------
        // Yakuman 수정
        // ------------------------
        
        List<Yakuman> existingYakumans = yakumanRepository.findByYakumanMatchesId(matchsId);
        
        Map<Long, Yakuman> yakumanMap = existingYakumans.stream()
                .collect(Collectors.toMap(Yakuman::getId, y -> y));
        
         Set<Long> requestYakumanIds = new HashSet<>();
        
        for (RecordPutRequest.Yakumans dto : request.getYakumans()) {
            
            BgmAgitMember member = memberRepository.findById(dto.getMemberId())
                    .orElseThrow(() -> new RuntimeException("존재하지않는 회원입니다."));
            
            Yakuman yakuman;
            
            // 신규 생성
            if (dto.getYakumanId() == null) {
                
                yakuman = Yakuman.builder()
                        .matchs(matchs)
                        .member(member)
                        .yakumanName(dto.getYakumanName())
                        .yakumanCont(dto.getYakumanCont())
                        .build();
                
                yakumanRepository.save(yakuman);
                
            }
            // 기존 수정
            else {
                
                yakuman = yakumanMap.get(dto.getYakumanId());
                
                if (yakuman == null) {
                    throw new RuntimeException("존재하지 않는 Yakuman ID: " + dto.getYakumanId());
                }
                
                yakuman.modify(dto, member);
            }
            
            // 파일 처리: CREATE/DELETE/NORMAL 의도를 그대로 위임
            bgmAgitFileService.modifyFileStatus(dto.getFiles(), yakuman.getId());

            requestYakumanIds.add(yakuman.getId());
        }

        // 삭제 대상 Yakuman: 도메인 + 연결된 BgmAgitFile 모두 분리
        // (행 자체를 삭제했으므로 클라이언트가 별도 DELETE 신호를 보낼 수 없음 — 서버가 책임)
        List<Yakuman> deletedYakumans = existingYakumans.stream()
                .filter(item -> !requestYakumanIds.contains(item.getId()))
                .toList();

        if (!deletedYakumans.isEmpty()) {
            List<Long> deletedYakumanIds = deletedYakumans.stream().map(Yakuman::getId).toList();
            List<BgmAgitFile> orphanFiles =
                    bgmAgitFileService.findCompletedByTargets(deletedYakumanIds, FileType.YAKUMAN);
            orphanFiles.forEach(BgmAgitFile::modifyTemporaryFileStatus);
        }
        yakumanRepository.deleteAll(deletedYakumans);
        
        // 히스토리 기록
        matchsAndRecordHistoryService.updateMatchsAndRecordHistory(
                matchs,
                records,
                request.getChangeReason(),
                requestMemberId
        );

        List<Record> currentRecords = records.stream()
                .filter(r -> requestRecordIds.contains(r.getId()))
                .toList();
        publishKmlModifyEvent(matchs, currentRecords);

        return new ApiResponse(200, true, "기록이 수정되었습니다.");
    }
    
    @Override
    public ApiResponse removeRecord(Long id, Long memberId) {
        Matchs matchs = matchsRepository.findById(id).orElseThrow(() -> new RuntimeException("존재하지 않은 대국입니다."));
        matchs.modifyDelStatus();
        List<Record> findRecord = recordRepository.findByRecordByMatchsId(matchs.getId());

        // 대국에 묶인 yakuman 첨부 파일을 TEMPORARY 로 되돌려 일일 배치가 정리하도록
        List<Yakuman> yakumans = yakumanRepository.findByYakumanMatchesId(matchs.getId());
        if (!yakumans.isEmpty()) {
            List<Long> yakumanIds = yakumans.stream().map(Yakuman::getId).toList();
            List<BgmAgitFile> files = bgmAgitFileService.findCompletedByTargets(yakumanIds, FileType.YAKUMAN);
            files.forEach(BgmAgitFile::modifyTemporaryFileStatus);
        }

        matchsAndRecordHistoryService.updateMatchsAndRecordHistory(matchs,findRecord,"삭제",memberId);
        return new ApiResponse(200,true,"삭제 되었습니다.");
    }

    @Override
    public ApiResponse restoreRecord(Long id, List<String> roles) {
        if (!canSeeDeleted(roles)) {
            throw new ValidException("멘토 이상만 복구할 수 있습니다.");
        }

        Matchs matchs = matchsRepository.findById(id).orElseThrow(() -> new RuntimeException("존재하지 않은 대국입니다."));
        if (!"Y".equals(matchs.getDelStatus())) {
            throw new ValidException("이미 복구된 대국입니다.");
        }

        matchs.restoreDelStatus();

        // 묶인 yakuman 의 TEMPORARY 파일들을 다시 COMPLETE 로 (배치가 아직 안 지웠다면)
        List<Yakuman> yakumans = yakumanRepository.findByYakumanMatchesId(matchs.getId());
        if (!yakumans.isEmpty()) {
            List<Long> yakumanIds = yakumans.stream().map(Yakuman::getId).toList();
            List<BgmAgitFile> tempFiles = bgmAgitFileService.findTemporaryByTargets(yakumanIds, FileType.YAKUMAN);
            tempFiles.forEach(BgmAgitFile::restoreCompleteFileStatus);
        }

        return new ApiResponse(200, true, "기록이 복구되었습니다.");
    }

}
