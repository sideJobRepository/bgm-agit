package com.bgmagitapi.kml.rank.service;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.kml.rank.dto.response.RankGetResponse;
import com.bgmagitapi.kml.rank.enums.RankType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RankServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private RankServiceImpl rankService;
    
    @DisplayName("")
    @Test
    void test1(){
        // given
        RankType type = RankType.MONTHLY;
        LocalDate baseDate = LocalDate.of(2026, 2, 20);
        
        // when
        List<RankGetResponse> ranks = rankService.findRanks(type, baseDate);
        
        // then
        System.out.println("=== MONTHLY RANK ===");
        ranks.forEach(System.out::println);
        
    }
}