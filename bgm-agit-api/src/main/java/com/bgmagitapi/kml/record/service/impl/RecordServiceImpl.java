package com.bgmagitapi.kml.record.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.enums.Wind;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import com.bgmagitapi.kml.record.service.RecordService;
import com.bgmagitapi.kml.setting.entity.Setting;
import com.bgmagitapi.kml.setting.repository.SettingRepository;
import com.bgmagitapi.kml.yakuman.entity.Yakuman;
import com.bgmagitapi.kml.yakuman.repository.YakumanRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.util.CalculateUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {

    private final RecordRepository recordRepository;
    
    private final MatchsRepository matchsRepository;
    
    private final BgmAgitMemberRepository memberRepository;
    
    private final SettingRepository settingRepository;
    
    private final YakumanRepository yakumanRepository;
    
    @Override
    public ApiResponse createRecord(RecordPostRequest request) {
        
        MatchsWind wind = request.getWind();
        String tournamentStatus = request.getTournamentStatus();
        
        Matchs matchs = Matchs.builder()
                .wind(wind)
                .tournamentStatus(tournamentStatus)
                .build();
        
        matchsRepository.save(matchs);
        
        Setting setting = settingRepository.findBySetting();
        
        List<RecordPostRequest.Records> records = request.getRecords();
        for (RecordPostRequest.Records record : records) {
            BgmAgitMember member = memberRepository.findById(record.getMemberId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
            int multiplier = CalculateUtil.seatMultiplier(record.getRecordSeat());
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
                    .memberId(member.getBgmAgitMemberId())
                    .yakumanName(yakumanName)
                    .build();
            yakumanRepository.save(saveYakuman);
        }
        
        return new ApiResponse(200,true,"기록이 저장되었습니다.");
    }
}
