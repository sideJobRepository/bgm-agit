package com.bgmagitapi.kml.yakamantype.service.impl;

import com.bgmagitapi.kml.yakamantype.dto.response.MembersGetResponse;
import com.bgmagitapi.kml.yakamantype.dto.response.YakumanTypeGetResponse;
import com.bgmagitapi.kml.yakamantype.entity.YakumanType;
import com.bgmagitapi.kml.yakamantype.repository.YakumanTypeRepository;
import com.bgmagitapi.kml.yakamantype.service.YakumanTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Transactional
@RequiredArgsConstructor
@Service
public class YakumanTypeServiceImpl implements YakumanTypeService {
    
    private final YakumanTypeRepository yakumanTypeRepository;
    
    @Override
    public List<YakumanTypeGetResponse> getYakumanType() {
        List<YakumanType> yakumanTypeList = yakumanTypeRepository.findAll();
        return yakumanTypeList
                .stream()
                .sorted(Comparator.comparing(YakumanType::getOrders))
                .map(item ->
                        YakumanTypeGetResponse
                                .builder()
                                .id(item.getId())
                                .yakumanName(item.getYakumanName())
                                .orders(item.getOrders())
                                .build()
                ).toList();
    }
    
    @Override
    public List<MembersGetResponse> getNickName() {
        return yakumanTypeRepository.getMembers()
                .stream()
                .map(item -> MembersGetResponse
                        .builder()
                        .id(item.getBgmAgitMemberId())
                        .nickName(item.getBgmAgitMemberNickname())
                        .build()
                ).toList();
    }
}
