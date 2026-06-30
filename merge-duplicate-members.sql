-- =====================================================================
-- 중복 소셜 회원 병합 스크립트 (12그룹)
--  - 같은 사람이 카카오/네이버로 각각 가입해 생긴 중복 계정을 1개로 합침.
--  - dup 계정의 모든 회원 소유 데이터를 keep 계정으로 이관 후 dup 삭제.
--  - MySQL 8.0 / 운영 DB에서 직접 실행. ddl-auto 무관(데이터 작업).
--
--  ⚠️ 실행 전 반드시:
--    1) 백업 (mysqldump 등)
--    2) 아래 [0] FK 점검 쿼리로 회원 참조 테이블이 모두 커버되는지 확인
--    3) [3] 트랜잭션 안에서 CALL 실행 → [4] 검증 → 이상 없으면 COMMIT
-- =====================================================================


-- =====================================================================
-- [0] (실행 전 점검) 회원을 참조하는 FK 자식 테이블 전수 조회
--     아래 결과 테이블이 MERGE_MEMBER 프로시저에 모두 들어있는지 확인.
--     빠진 게 있으면 프로시저의 _reassign 호출 목록에 추가.
-- =====================================================================
-- SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME
-- FROM information_schema.KEY_COLUMN_USAGE
-- WHERE REFERENCED_TABLE_NAME = 'BGM_AGIT_MEMBER'
--   AND TABLE_SCHEMA = DATABASE()
-- ORDER BY TABLE_NAME;


-- =====================================================================
-- [1] 헬퍼 프로시저: 테이블이 존재할 때만 회원ID 이관
-- =====================================================================
DROP PROCEDURE IF EXISTS _reassign_member;
DELIMITER $$
CREATE PROCEDURE _reassign_member(IN p_table VARCHAR(64), IN p_keep BIGINT, IN p_dup BIGINT)
BEGIN
    IF (SELECT COUNT(*) FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table) > 0 THEN
        SET @sql = CONCAT('UPDATE ', p_table,
                          ' SET BGM_AGIT_MEMBER_ID = ', p_keep,
                          ' WHERE BGM_AGIT_MEMBER_ID = ', p_dup);
        PREPARE st FROM @sql;
        EXECUTE st;
        DEALLOCATE PREPARE st;
    END IF;
END$$
DELIMITER ;


-- =====================================================================
-- [2] 병합 프로시저: dup → keep
--   (a) 유니크 제약 테이블은 keep에 이미 있는 키와 충돌하는 dup 행을 먼저 삭제
--   (b) 리프레시 토큰은 dup 것 삭제(이관 불필요)
--   (c) 나머지 회원 소유 테이블 전부 keep으로 이관
--   (d) dup 회원 삭제
-- =====================================================================
DROP PROCEDURE IF EXISTS MERGE_MEMBER;
DELIMITER $$
CREATE PROCEDURE MERGE_MEMBER(IN p_keep BIGINT, IN p_dup BIGINT)
BEGIN
    -- (a) 유니크 제약: 충돌 행 선삭제 --------------------------------

    -- BGM_AGIT_MEMBER_ROLE: dup의 권한 행은 keep으로 이관하지 않고 전부 삭제.
    --   (keep은 자기 권한 유지. dup 권한을 keep에 합치면 안 되고, 남겨두면 회원 삭제가 FK로 막힘)
    DELETE FROM BGM_AGIT_MEMBER_ROLE WHERE BGM_AGIT_MEMBER_ID = p_dup;

    -- BGM_AGIT_GATHERING_PARTICIPANT (gathering_id, member_id) — 테이블 잔존 시
    IF (SELECT COUNT(*) FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'BGM_AGIT_GATHERING_PARTICIPANT') > 0 THEN
        DELETE dp FROM BGM_AGIT_GATHERING_PARTICIPANT dp
            JOIN BGM_AGIT_GATHERING_PARTICIPANT kp
              ON kp.BGM_AGIT_MEMBER_ID    = p_keep
             AND kp.BGM_AGIT_GATHERING_ID = dp.BGM_AGIT_GATHERING_ID
         WHERE dp.BGM_AGIT_MEMBER_ID = p_dup;
    END IF;

    -- BGM_AGIT_PLAY_RECORD_PARTICIPANT (play_record_id, member_id) — 테이블 있을 때만
    IF (SELECT COUNT(*) FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'BGM_AGIT_PLAY_RECORD_PARTICIPANT') > 0 THEN
        DELETE dp FROM BGM_AGIT_PLAY_RECORD_PARTICIPANT dp
            JOIN BGM_AGIT_PLAY_RECORD_PARTICIPANT kp
              ON kp.BGM_AGIT_MEMBER_ID      = p_keep
             AND kp.BGM_AGIT_PLAY_RECORD_ID = dp.BGM_AGIT_PLAY_RECORD_ID
         WHERE dp.BGM_AGIT_MEMBER_ID = p_dup;
    END IF;

    -- BGM_AGIT_CLOCKTOWER_PARTICIPANT (clocktower_record_id, member_id) — 테이블 있을 때만
    IF (SELECT COUNT(*) FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'BGM_AGIT_CLOCKTOWER_PARTICIPANT') > 0 THEN
        DELETE dp FROM BGM_AGIT_CLOCKTOWER_PARTICIPANT dp
            JOIN BGM_AGIT_CLOCKTOWER_PARTICIPANT kp
              ON kp.BGM_AGIT_MEMBER_ID            = p_keep
             AND kp.BGM_AGIT_CLOCKTOWER_RECORD_ID = dp.BGM_AGIT_CLOCKTOWER_RECORD_ID
         WHERE dp.BGM_AGIT_MEMBER_ID = p_dup;
    END IF;

    -- (b) 리프레시 토큰: dup 것 삭제 --------------------------------
    DELETE FROM BGM_AGIT_REFRESH_TOKEN WHERE BGM_AGIT_MEMBER_ID = p_dup;

    -- (c) 회원 소유 테이블 전부 이관 (존재하는 것만) ----------------
    --   ※ BGM_AGIT_MEMBER_ROLE 은 위 (a)에서 dup 행을 삭제했으므로 이관하지 않음
    CALL _reassign_member('BGM_AGIT_RESERVATION',             p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_INQUIRY',                 p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_FREE',                    p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_COMMON_COMMENT',          p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_REVIEW',                  p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_LECTURE',                 p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_RECORD',                  p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_YAKUMAN',                 p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_SANBAEMAN',              p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_MATCHS',                  p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_MATCHS_HISTORY',          p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_RECORD_HISTORY',          p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_GATHERING',              p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_GATHERING_PARTICIPANT',   p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_PLAY_RECORD',             p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_PLAY_RECORD_PARTICIPANT', p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_CLOCKTOWER_RECORD',       p_keep, p_dup);
    CALL _reassign_member('BGM_AGIT_CLOCKTOWER_PARTICIPANT',  p_keep, p_dup);

    -- (d) dup 회원 삭제 --------------------------------------------
    DELETE FROM BGM_AGIT_MEMBER WHERE BGM_AGIT_MEMBER_ID = p_dup;
END$$
DELIMITER ;


-- =====================================================================
-- [3] 실행 (확정표: MERGE_MEMBER(keep, dup))
--     트랜잭션으로 감싸고, 검증([4]) 후 직접 COMMIT/ROLLBACK.
-- =====================================================================
START TRANSACTION;

CALL MERGE_MEMBER(1,   41);   -- 010-2331-6538  keep 1(KAKAO 닉넴수정)  / del 41(NAVER 박지수)

-- 검증([4]) 확인 후:
-- COMMIT;
-- ROLLBACK;


-- =====================================================================
-- [4] 검증 쿼리 (COMMIT 전에 실행)
-- =====================================================================
-- 4-1) 소셜 중복 재조회 → 0건이어야 함
-- SELECT BGM_AGIT_MEMBER_PHONE_NO, COUNT(*) cnt,
--        GROUP_CONCAT(BGM_AGIT_MEMBER_ID) ids
-- FROM BGM_AGIT_MEMBER
-- WHERE BGM_AGIT_MEMBER_PHONE_NO IS NOT NULL
--   AND TRIM(BGM_AGIT_MEMBER_PHONE_NO) <> ''
--   AND BGM_AGIT_SOCIAL_TYPE <> 'MAHJONG'
-- GROUP BY BGM_AGIT_MEMBER_PHONE_NO
-- HAVING COUNT(*) > 1;

-- 4-2) 삭제된 dup id 부재 확인 → 0건이어야 함
-- SELECT BGM_AGIT_MEMBER_ID FROM BGM_AGIT_MEMBER
-- WHERE BGM_AGIT_MEMBER_ID IN (41,42,57,118,82,109,27,38,86,188,7,116);

-- 4-3) keep 계정 예약수 = 두 계정 합산치 확인 (예: 박진민 55 → 26건)
-- SELECT r.BGM_AGIT_MEMBER_ID, COUNT(*) resv_cnt
-- FROM BGM_AGIT_RESERVATION r
-- WHERE r.BGM_AGIT_MEMBER_ID IN (1,25,77,87,3,63,93,4,114,76,51,55)
-- GROUP BY r.BGM_AGIT_MEMBER_ID;


-- =====================================================================
-- [5] 정리 (선택): 헬퍼/병합 프로시저 제거
-- =====================================================================
-- DROP PROCEDURE IF EXISTS MERGE_MEMBER;
-- DROP PROCEDURE IF EXISTS _reassign_member;
