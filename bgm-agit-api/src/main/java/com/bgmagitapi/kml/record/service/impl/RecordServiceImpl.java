package com.bgmagitapi.kml.record.service.impl;

import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.history.service.MatchsAndRecordHistoryService;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
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
import com.bgmagitapi.kml.yakuman.entity.Yakuman;
import com.bgmagitapi.kml.yakuman.repository.YakumanRepository;
import com.bgmagitapi.repository.BgmAgitCommonFileRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.util.CalculateUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {
    
    private final RecordRepository recordRepository;
    
    private final MatchsRepository matchsRepository;
    
    private final BgmAgitMemberRepository memberRepository;
    
    private final SettingRepository settingRepository;
    
    private final YakumanRepository yakumanRepository;
    
    private final BgmAgitCommonFileRepository commonFileRepository;
    
    private final MatchsAndRecordHistoryService matchsAndRecordHistoryService;
    
    private final S3FileUtils s3FileUtils;
    
    private static final Map<Wind, Integer> WIND_ORDER = Map.of(
            Wind.EAST, 0,
            Wind.SOUTH, 1,
            Wind.WEST, 2,
            Wind.NORTH, 3
    );
    
    
    @Override
    public Page<RecordGetResponse> getRecords(Pageable pageable, String startDate, String endDate, String nickName) {
        Page<Record> records = recordRepository.findByRecords(pageable,startDate,endDate,nickName);
    
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
                    response.setRegistDate(group.get(0).getRegistDate());
    
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
    
        return new PageImpl<>(list, pageable, list.size());
    }
    
    @Override
    public RecordGetDetailResponse getRecordDetail(Long id) {
        
        Matchs matchs = matchsRepository.findById(id).orElseThrow(() -> new RuntimeException("존재 하지 않은 대국입니다."));
        
        List<RecordGetDetailResponse.RecordList> records = recordRepository.findByRecord(id);
        List<RecordGetDetailResponse.YakumanList> yakumanLists = yakumanRepository.findByMatchsYakuman(id);
        
        return new RecordGetDetailResponse(matchs.getId(), matchs.getWind(), records, yakumanLists);
    }
    
    @Override
    public ApiResponse createRecord(RecordPostRequest request, Long memberId) {
        
        Integer sum = request.getRecords()
                .stream()
                .mapToInt(RecordPostRequest.Records::getRecordScore).sum();
        Setting setting = settingRepository.findBySetting();
        Integer turning = setting.getTurning() * 4;
        if (!sum.equals(turning)) {
            String message = String.format("입력된 점수 합계(%d)가 기준 점수(%d)와 일치하지 않습니다.", sum, turning);
            throw new ValidException(message);
        }
        
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
        String tournamentStatus = request.getTournamentStatus();
        AtomicInteger rankCount = new AtomicInteger(1);
        BgmAgitMember bgmAgitMember = memberRepository.findById(memberId).orElseThrow(() -> new ValidException("다시 로그인 해주세요"));
        Matchs matchs = Matchs.builder()
                .wind(wind)
                .tournamentStatus(tournamentStatus)
                .setting(setting)
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
            Double recordPoint = CalculateUtil.calculatePlayerPoint(record, setting, multiplier);
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
            UploadResult result = s3FileUtils.storeFile(yakuman.getFiles(), "yakuman");
            if (result != null) {
                BgmAgitCommonFile commonFile = BgmAgitCommonFile
                        .builder()
                        .bgmAgitCommonFileTargetId(saveYakuman.getId())
                        .bgmAgitCommonFileType(BgmAgitCommonType.YAKUMAN)
                        .bgmAgitCommonFileUrl(result.getUrl())
                        .bgmAgitCommonFileUuidName(result.getUuid())
                        .bgmAgitCommonFileName(result.getOriginalFilename())
                        .build();
                commonFileRepository.save(commonFile);
            }
        }
        matchsAndRecordHistoryService.createMatchsAndRecordHistory(matchs, recordList);
        return new ApiResponse(200, true, "기록이 저장되었습니다.");
    }
    
    @Override
    public ApiResponse updateRecord(RecordPutRequest request, Long requestMemberId) {
        Long matchsId = request.getMatchsId();
        //  Match 조회
        Matchs matchs = matchsRepository.findById(matchsId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 경기입니다."));
        
        Long settingId = matchs.getSetting().getId();
        Setting setting = settingRepository.findById(settingId).orElseThrow(() -> new RuntimeException("존재하지않는 세팅값입니다."));
        
        Set<Long> recordMemberSet = request.getRecords().stream()
                .map(RecordPutRequest.Records::getMemberId)
                .collect(Collectors.toSet());
        
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
        
        Integer turning = setting.getTurning() * 4;
        
        if (!sum.equals(turning)) {
            throw new ValidException(String.format("입력된 점수 합계(%d)가 기준 점수(%d)와 일치하지 않습니다.", sum, turning));
        }
        
        // Match 기본 정보 수정
        matchs.modify(request.getWind(), request.getTournamentStatus());
        
        // Record 수정
        List<Record> records = recordRepository.findByRecordByMatchsId(matchsId);
        Map<Long, Record> recordMap = records.stream()
                .collect(Collectors.toMap(Record::getId, r -> r));
        
        // 정렬 + rank 재계산
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
            Double point = CalculateUtil.calculatePlayerPoint(dto, setting, multiplier);
            
            Long memberId = dto.getMemberId();
            BgmAgitMember bgmAgitMember = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("존재 하지 않은 사업자입니다."));
            
            record.modify(dto, point, bgmAgitMember);
            
            requestRecordIds.add(record.getId());
        }
        
        // 삭제 대상 Record
        records.stream()
                .filter(r -> !requestRecordIds.contains(r.getId()))
                .forEach(recordRepository::delete);
        
        // Yakuman 수정
        List<Yakuman> existingYakumans = yakumanRepository.findByYakumanMatchesId(matchsId);
        Map<Long, Yakuman> yakumanMap = existingYakumans.stream()
                .collect(Collectors.toMap(Yakuman::getId, y -> y));
        
        Set<Long> requestYakumanIds = new HashSet<>();
        
        for (RecordPutRequest.Yakumans dto : request.getYakumans()) {
            
            Yakuman yakuman = yakumanMap.get(dto.getYakumanId());
            if (yakuman == null) {
                throw new RuntimeException("존재하지 않는 Yakuman ID: " + dto.getYakumanId());
            }
            
            BgmAgitMember bgmAgitMember = memberRepository.findById(dto.getMemberId()).orElseThrow(() -> new RuntimeException("존재하지않는 회원입니다."));
            yakuman.modify(dto, bgmAgitMember);
            
            // 파일 교체 시
            if (dto.getFiles() != null && !dto.getFiles().isEmpty()) {
                
                // 기존 파일 삭제
                List<BgmAgitCommonFile> byDeleteFile = commonFileRepository.findByDeleteFile(
                        yakuman.getId(), BgmAgitCommonType.YAKUMAN
                );
                commonFileRepository.deleteAll(byDeleteFile);
                for (BgmAgitCommonFile bgmAgitCommonFile : byDeleteFile) {
                    s3FileUtils.deleteFile(bgmAgitCommonFile.getBgmAgitCommonFileUrl());
                }
                
                UploadResult result = s3FileUtils.storeFile(dto.getFiles(), "yakuman");
                if (result != null) {
                    commonFileRepository.save(
                            BgmAgitCommonFile.builder()
                                    .bgmAgitCommonFileTargetId(yakuman.getId())
                                    .bgmAgitCommonFileType(BgmAgitCommonType.YAKUMAN)
                                    .bgmAgitCommonFileUrl(result.getUrl())
                                    .bgmAgitCommonFileUuidName(result.getUuid())
                                    .bgmAgitCommonFileName(result.getOriginalFilename())
                                    .build()
                    );
                }
            }
            
            requestYakumanIds.add(yakuman.getId());
        }
        
        
        // 삭제 대상 Yakuman
        existingYakumans.stream()
                .filter(item -> !requestYakumanIds.contains(item.getId()))
                .forEach(item -> {
                    List<BgmAgitCommonFile> byDeleteFile = commonFileRepository.findByDeleteFile(item.getId(), BgmAgitCommonType.YAKUMAN);
                    yakumanRepository.delete(item);
                    commonFileRepository.deleteAll(byDeleteFile);
                    for (BgmAgitCommonFile bgmAgitCommonFile : byDeleteFile) {
                        s3FileUtils.deleteFile(bgmAgitCommonFile.getBgmAgitCommonFileUrl());
                    }
                });
        matchsAndRecordHistoryService.updateMatchsAndRecordHistory(matchs, records, request.getChangeReason(), requestMemberId);
        return new ApiResponse(200, true, "기록이 수정되었습니다.");
    }
    
    @Override
    public ApiResponse removeRecord(Long id, Long memberId) {
        Matchs matchs = matchsRepository.findById(id).orElseThrow(() -> new RuntimeException("존재하지 않은 대국입니다."));
        matchs.modifyDelStatus();
        List<Record> findRecord = recordRepository.findByRecordByMatchsId(matchs.getId());
        matchsAndRecordHistoryService.updateMatchsAndRecordHistory(matchs,findRecord,"삭제",memberId);
        return new ApiResponse(200,true,"삭제 되었습니다.");
    }
    
}
