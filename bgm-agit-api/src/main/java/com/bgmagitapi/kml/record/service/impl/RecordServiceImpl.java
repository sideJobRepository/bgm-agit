package com.bgmagitapi.kml.record.service.impl;

import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
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
    
    private final S3FileUtils s3FileUtils;
    
    private static final Map<Wind, Integer> WIND_ORDER = Map.of(
            Wind.EAST, 0,
            Wind.SOUTH, 1,
            Wind.WEST, 2,
            Wind.NORTH, 3
    );
    
    
    @Override
    public Page<RecordGetResponse> getRecords(Pageable pageable) {
        Page<Record> records = recordRepository.findByRecords(pageable);
        
        Map<Long, List<Record>> groupedByMatch = records.getContent().stream()
                .filter(r -> r.getMatchs() != null) // 방어
                .collect(Collectors.groupingBy(r -> r.getMatchs().getId()));
        
        List<RecordGetResponse> list = groupedByMatch.entrySet().stream()
                .map(entry -> {
                    Long matchId = entry.getKey();
                    List<Record> group = new ArrayList<>(entry.getValue()); // 정렬용 복사(안전)
                    
                    // 점수 내림차순
                    group.sort(Comparator.comparing(Record::getRecordScore).reversed());
                    
                    // group 비면 응답 만들 이유 없음
                    if (group.isEmpty()) {
                        return null;
                    }
                    
                    Record first = group.get(0);
                    
                    RecordGetResponse response = new RecordGetResponse();
                    response.setMatchsId(matchId);
                    
                    MatchsWind wind = first.getMatchs().getWind();
                    LocalDateTime registDate = first.getRegistDate();
                    
                    response.setWind(wind != null ? wind.getValue() : null);
                    response.setRegistDate(registDate);
                    
                    for (int i = 0; i < group.size() && i < 4; i++) {
                        Record rec = group.get(i);
                        String nickname = rec.getMember() != null ? rec.getMember().getBgmAgitMemberNickname() : "";
                        String data = rec.toFormattedString(nickname);
                        
                        switch (i) {
                            case 0 -> response.setFirst(data);
                            case 1 -> response.setSecond(data);
                            case 2 -> response.setThird(data);
                            case 3 -> response.setFourth(data);
                        }
                    }
                    
                    return response;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        // 최신순 정렬 (null 방어)
        list.sort(Comparator.comparing(
                RecordGetResponse::getRegistDate,
                Comparator.nullsLast(Comparator.naturalOrder())
        ).reversed());
        
        return new PageImpl<>(list, pageable, list.size());
    }
    
    @Override
    public RecordGetDetailResponse getRecordDetail(Long id) {
        
        Matchs matchs = recordRepository.findByMatchs(id);
        
        List<RecordGetDetailResponse.RecordList> records = recordRepository.findByRecord(id);
        List<RecordGetDetailResponse.YakumanList> yakumanLists =  yakumanRepository.findByMatchsYakuman(id);
        
        return new RecordGetDetailResponse(matchs.getId(), matchs.getWind(), records,yakumanLists);
    }
    
    @Override
    public ApiResponse createRecord(RecordPostRequest request) {
        
        Integer sum = request.getRecords()
                .stream()
                .mapToInt(RecordPostRequest.Records::getRecordScore).sum();
        Setting setting = settingRepository.findBySetting();
        Integer turning = setting.getTurning() * 4;
        if(!sum.equals(turning)){
            String message = String.format("입력된 점수 합계(%d)가 기준 점수(%d)와 일치하지 않습니다.", sum, turning);
            throw new ValidException(message);
        }
        
        
        MatchsWind wind = request.getWind();
        String tournamentStatus = request.getTournamentStatus();
        AtomicInteger rankCount = new AtomicInteger(1);
        Matchs matchs = Matchs.builder()
                .wind(wind)
                .tournamentStatus(tournamentStatus)
                .build();
        
        matchsRepository.save(matchs);
        
        
        
        List<RecordPostRequest.Records> records = request.getRecords();
        records.sort(
                Comparator.comparing(
                        RecordPostRequest.Records::getRecordScore,
                        Comparator.reverseOrder()
                ).thenComparing(r -> WIND_ORDER.get(r.getRecordSeat())));
        
        records.forEach(item ->
                item.setRecordRank(rankCount.getAndIncrement())
        );
        int multiplier = CalculateUtil.seatMultiplier(matchs.getWind());
        for (RecordPostRequest.Records record : records) {
            BgmAgitMember member = memberRepository.findById(record.getMemberId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
            Double recordPoint = CalculateUtil.calculatePlayerPoint(record, setting, multiplier);
            Record saveRecord = Record.builder()
                    .matchs(matchs)
                    .member(member)
                    .setting(setting)
                    .recordRank(record.getRecordRank())
                    .recordScore(record.getRecordScore())
                    .recordPoint(recordPoint)
                    .recordSeat(record.getRecordSeat())
                    .build();
            recordRepository.save(saveRecord);
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
        return new ApiResponse(200, true, "기록이 저장되었습니다.");
    }
    
    @Override
    public ApiResponse updateRecord(RecordPostRequest request) {
        return null;
    }
    
}
