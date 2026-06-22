package com.bgmagitapi.kml.record.repository.query;

import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.yakamantype.dto.response.MembersGetResponse;
import com.querydsl.jpa.impl.JPAQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RecordQueryRepository {

    Page<Record> findByRecords(Pageable pageable, String startDate, String endDate, String nickName, String tournamentStatus, String bonusType, boolean includeDeleted);

    /** 최근 기록에 등장한 MAHJONG 회원을 최근순 distinct로 최대 limit명 반환 */
    List<MembersGetResponse> findRecentMembers(int limit);

    List<RecordGetDetailResponse.RecordList> findByRecord(Long id);

    List<Record> findByRecordByMatchsId(Long id);

    Page<Long> findMatchIdsByYear(Pageable pageable, Integer year);

    List<Record> findRecordsByMatchIds(List<Long> matchIds);

    Long countQuery(String startDate, String endDate, String nickName, String tournamentStatus, String bonusType, boolean includeDeleted);
}
