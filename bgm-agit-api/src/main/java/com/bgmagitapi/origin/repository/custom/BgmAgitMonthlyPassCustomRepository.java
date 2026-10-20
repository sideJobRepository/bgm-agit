package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.entity.BgmAgitMonthlyPass;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

public interface BgmAgitMonthlyPassCustomRepository {

    /** 그 달이 회원의 패스 기간 안에 있는지. 예약 결제 할인 판정용 */
    boolean coversMonth(Long memberId, YearMonth month);

    /** 회원별로 그 달 이후에 끝나는(=아직 쓸 수 있는) 기간 목록. 시작월 오름차순 */
    Map<Long, List<BgmAgitMonthlyPass>> findActivePassesByMemberIds(List<Long> memberIds, YearMonth from);
}
