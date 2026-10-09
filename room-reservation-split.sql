-- 방 테이블 분리(BGM_AGIT_ROOM) + 예약 1건 = 1행 정규화(BGM_AGIT_RESERVATION_ROOM)
--
-- 바뀌는 것
--   BGM_AGIT_IMAGE 의 방·마작 대탁 행      → BGM_AGIT_ROOM (ROOM_ID = 기존 IMAGE_ID 값 그대로)
--   BGM_AGIT_RESERVATION (슬롯마다 1행)    → BGM_AGIT_RESERVATION (예약 1건 1행, 이어진 시간 한 구간)
--                                           + BGM_AGIT_RESERVATION_ROOM (예약↔방, 합쳐 예약이면 여러 행)
--   예약 PK = 기존 RESERVATION_NO 값 그대로 → 결제·토스 orderId·알림톡 이력 SUBJECT_ID 가 값 변경 없이 유효
--   BGM_AGIT_PAYMENT(_CANCEL).BGM_AGIT_RESERVATION_NO → BGM_AGIT_RESERVATION_ID (값 그대로, PAYMENT 에는 FK)
--   BGM_AGIT_IMAGE 컬럼 MIN_PEOPLE / MAX_PEOPLE / USE_STATUS / GROUPS 삭제
--
-- 실행 시점: **테이블 분리 코드(현행 정책 브랜치) 배포 직전, 백엔드를 내린 상태에서.**
--   컬럼·테이블이 바뀌는 순간 구 코드는 예약·결제가 전부 깨진다. 구 코드와 공존할 수 없다.
--   순서: 점검 공지 → 백엔드 중지 → 이 파일 0~9 → 백엔드·프론트 배포 → 확인 → (며칠 뒤) 10번 백업 정리
--   10월 개편과는 독립이다 — 개편 SQL(room-people / payment-partial-cancel / holiday)은 개편 브랜치 배포 때
--   ROOM·RESERVATION_ID 기준으로 개정된 판을 따로 돌린다. 스테이징처럼 개편 테이블이 이미 있으면 6번이 같이 맞춘다.
--
-- mysql 클라이언트로 실행할 때 --default-character-set=utf8mb4 를 붙일 것.
-- DDL 은 MySQL 이 암시적 커밋을 하므로 트랜잭션으로 되돌릴 수 없다. 단계별로 결과를 보고 넘어갈 것.
-- 롤백은 맨 아래 참고(백업 테이블 BGM_AGIT_RESERVATION_OLD 를 남겨 둔다). binlog 도 ROW/FULL 이다.


-- =====================================================================
-- 0) 사전 점검 — 결과를 눈으로 확인하고, 문제가 있으면 여기서 멈춘다
-- =====================================================================

-- 0-1) 이관 대상 방(아모스렉스·JP컬러 등 마작 대탁 포함 여부, 숨김 여부 확인)
SELECT BGM_AGIT_IMAGE_ID AS id, BGM_AGIT_IMAGE_LABEL AS label, BGM_AGIT_IMAGE_CATEGORY AS category,
       BGM_AGIT_MENU_LINK AS link, BGM_AGIT_IMAGE_GROUPS AS guide,
       BGM_AGIT_IMAGE_MIN_PEOPLE AS min_p, BGM_AGIT_IMAGE_MAX_PEOPLE AS max_p,
       BGM_AGIT_IMAGE_USE_STATUS AS use_yn
  FROM BGM_AGIT_IMAGE
 WHERE BGM_AGIT_IMAGE_CATEGORY IN ('ROOM', 'MAHJONG')
 ORDER BY BGM_AGIT_IMAGE_CATEGORY, BGM_AGIT_IMAGE_ID;

-- 0-2) 예약이 가리키는데 이관 대상이 아닌 이미지 — 0건이어야 한다(아니면 그 이미지도 방으로 옮겨야 함)
SELECT r.BGM_AGIT_IMAGE_ID, i.BGM_AGIT_IMAGE_LABEL, i.BGM_AGIT_IMAGE_CATEGORY, COUNT(*) AS rows_cnt
  FROM BGM_AGIT_RESERVATION r
  LEFT JOIN BGM_AGIT_IMAGE i ON i.BGM_AGIT_IMAGE_ID = r.BGM_AGIT_IMAGE_ID
 WHERE i.BGM_AGIT_IMAGE_ID IS NULL OR i.BGM_AGIT_IMAGE_CATEGORY NOT IN ('ROOM', 'MAHJONG')
 GROUP BY r.BGM_AGIT_IMAGE_ID, i.BGM_AGIT_IMAGE_LABEL, i.BGM_AGIT_IMAGE_CATEGORY;

-- 0-3) 예약번호 없는 행 수 — 있으면 2번에서 새 번호를 준다
SELECT COUNT(*) AS null_no_rows FROM BGM_AGIT_RESERVATION WHERE BGM_AGIT_RESERVATION_NO IS NULL;

-- 0-4) 같은 예약번호인데 회원·날짜·인원·요청·상태·타입이 갈리는 그룹 — 0건이어야 한다
--      (이관은 그룹의 첫 행 값을 쓴다. 갈리면 어느 값이 맞는지 먼저 정리할 것)
SELECT BGM_AGIT_RESERVATION_NO AS no,
       COUNT(DISTINCT BGM_AGIT_MEMBER_ID) AS members,
       COUNT(DISTINCT BGM_AGIT_RESERVATION_START_DATE) AS dates,
       COUNT(DISTINCT IFNULL(BGM_AGIT_RESERVATION_PEOPLE, -1)) AS people,
       COUNT(DISTINCT IFNULL(BGM_AGIT_RESERVATION_REQUEST, '')) AS requests,
       COUNT(DISTINCT BGM_AGIT_RESERVATION_APPROVAL_STATUS) AS approvals,
       COUNT(DISTINCT BGM_AGIT_RESERVATION_CANCEL_STATUS) AS cancels,
       COUNT(DISTINCT BGM_AGIT_RESERVATION_TYPE) AS types
  FROM BGM_AGIT_RESERVATION
 WHERE BGM_AGIT_RESERVATION_NO IS NOT NULL
 GROUP BY BGM_AGIT_RESERVATION_NO
HAVING members > 1 OR dates > 1 OR people > 1 OR requests > 1 OR approvals > 1 OR cancels > 1 OR types > 1;

-- 0-5) **시간이 떨어진 예약** — 한 구간으로 못 담는다.
--      분값 규약: 10:00 이전은 익일(+1440) — 개편 SlotSchedule.toSortableMinutes 와 같다.
--      gap_min > 0 이면 떨어진 예약. 지난 예약·취소건은 그대로 두면 5번에서 첫 시작~마지막 종료로 합쳐진다.
--      **앞으로 이용할 유효 예약(미취소·오늘 이후)이 있으면 목록을 사장님께 확인받고 손님 연락 후 정리할 것.**
SELECT g.no, g.room_id, g.start_date, g.cancel_yn, g.approval_yn, g.slot_min, g.span_min,
       g.span_min - g.slot_min AS gap_min,
       IF(g.cancel_yn = 'N' AND g.start_date >= CURDATE(), '★ 유효 예약 — 확인 필요', '') AS note
  FROM (SELECT BGM_AGIT_RESERVATION_NO AS no, BGM_AGIT_IMAGE_ID AS room_id,
               MIN(BGM_AGIT_RESERVATION_START_DATE) AS start_date,
               MAX(BGM_AGIT_RESERVATION_CANCEL_STATUS) AS cancel_yn,
               MAX(BGM_AGIT_RESERVATION_APPROVAL_STATUS) AS approval_yn,
               SUM(MOD(TIME_TO_SEC(BGM_AGIT_RESERVATION_END_TIME) - TIME_TO_SEC(BGM_AGIT_RESERVATION_START_TIME) + 86400, 86400) / 60
                   + IF(BGM_AGIT_RESERVATION_END_TIME = BGM_AGIT_RESERVATION_START_TIME, 1440, 0)) AS slot_min,
               MAX(TIME_TO_SEC(BGM_AGIT_RESERVATION_START_TIME) / 60
                   + IF(BGM_AGIT_RESERVATION_START_TIME < '10:00:00', 1440, 0)
                   + MOD(TIME_TO_SEC(BGM_AGIT_RESERVATION_END_TIME) - TIME_TO_SEC(BGM_AGIT_RESERVATION_START_TIME) + 86400, 86400) / 60)
             - MIN(TIME_TO_SEC(BGM_AGIT_RESERVATION_START_TIME) / 60
                   + IF(BGM_AGIT_RESERVATION_START_TIME < '10:00:00', 1440, 0)) AS span_min
          FROM BGM_AGIT_RESERVATION
         WHERE BGM_AGIT_RESERVATION_NO IS NOT NULL
         GROUP BY BGM_AGIT_RESERVATION_NO, BGM_AGIT_IMAGE_ID) g
 WHERE g.span_min <> g.slot_min
 ORDER BY note DESC, g.start_date DESC;

-- 0-6) 합쳐 예약인데 방마다 시간대가 다른 그룹 — 0건이어야 한다(예약 1건 = 구간 1개라 방별 시간을 못 담는다)
SELECT BGM_AGIT_RESERVATION_NO AS no, COUNT(*) AS distinct_room_timesets
  FROM (SELECT BGM_AGIT_RESERVATION_NO, BGM_AGIT_IMAGE_ID,
               GROUP_CONCAT(CONCAT(BGM_AGIT_RESERVATION_START_TIME, '-', BGM_AGIT_RESERVATION_END_TIME)
                            ORDER BY BGM_AGIT_RESERVATION_START_TIME) AS times
          FROM BGM_AGIT_RESERVATION
         WHERE BGM_AGIT_RESERVATION_NO IS NOT NULL
         GROUP BY BGM_AGIT_RESERVATION_NO, BGM_AGIT_IMAGE_ID) t
 GROUP BY BGM_AGIT_RESERVATION_NO
HAVING COUNT(DISTINCT times) > 1;

-- 0-7) 예약에 없는 예약번호를 가진 결제 — 0건이어야 한다(8번 FK 추가가 실패한다)
SELECT p.BGM_AGIT_PAYMENT_ID, p.BGM_AGIT_RESERVATION_NO, p.BGM_AGIT_PAYMENT_STATUS
  FROM BGM_AGIT_PAYMENT p
 WHERE p.BGM_AGIT_RESERVATION_NO IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM BGM_AGIT_RESERVATION r WHERE r.BGM_AGIT_RESERVATION_NO = p.BGM_AGIT_RESERVATION_NO);

-- 0-8) BGM_AGIT_RESERVATION / BGM_AGIT_IMAGE 를 참조하는 FK 전부
--      RENAME 하면 참조 FK 가 바뀐 이름(OLD)을 따라간다. 4번에서 RESERVATION_ROOM 쪽은 자동으로 떼지만,
--      **그 외 테이블이 BGM_AGIT_RESERVATION 을 참조하고 있으면 여기서 멈추고 따로 처리할 것.**
--      BGM_AGIT_IMAGE 참조는 10번에서 방 행을 지울 때 걸리지 않는지 확인용.
SELECT TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
  FROM information_schema.KEY_COLUMN_USAGE
 WHERE TABLE_SCHEMA = DATABASE()
   AND REFERENCED_TABLE_NAME IN ('BGM_AGIT_RESERVATION', 'BGM_AGIT_IMAGE', 'BGM_AGIT_ROOM')
 ORDER BY REFERENCED_TABLE_NAME, TABLE_NAME;

-- 0-9) 미리 만들어 둔 두 테이블의 실제 정의 확인
SHOW CREATE TABLE BGM_AGIT_ROOM;
SHOW CREATE TABLE BGM_AGIT_RESERVATION_ROOM;
SELECT (SELECT COUNT(*) FROM BGM_AGIT_ROOM) AS room_rows, (SELECT COUNT(*) FROM BGM_AGIT_RESERVATION_ROOM) AS rr_rows;
-- 둘 다 0 이어야 한다. 행이 있으면 재실행이거나 수동 입력이 있는 것이니 비우고 시작할 것.


-- =====================================================================
-- 1) 미결제 주문 무효화 — 열려 있던 결제창이 배포 후 구 금액·구 예약번호 구조로 승인되지 않게
--    (payment-partial-cancel-2026-10.sql 4번과 같다. 이미 돌렸으면 0건)
-- =====================================================================
UPDATE BGM_AGIT_PAYMENT
   SET BGM_AGIT_PAYMENT_STATUS = 'ABORTED',
       BGM_AGIT_PAYMENT_FAIL_REASON = '예약 구조 개편으로 무효화된 주문'
 WHERE BGM_AGIT_PAYMENT_STATUS = 'READY';


-- =====================================================================
-- 2) 예약번호 없는 행에 새 번호 — 행마다 별개 예약으로 본다
-- =====================================================================
SET @next_no = (SELECT IFNULL(MAX(BGM_AGIT_RESERVATION_NO), 0) FROM BGM_AGIT_RESERVATION);
UPDATE BGM_AGIT_RESERVATION
   SET BGM_AGIT_RESERVATION_NO = (@next_no := @next_no + 1)
 WHERE BGM_AGIT_RESERVATION_NO IS NULL
 ORDER BY BGM_AGIT_RESERVATION_ID;


-- =====================================================================
-- 3) BGM_AGIT_ROOM 채우기
-- =====================================================================
-- 스테이징은 사용자가 미리 만들었다. 운영도 미리 만든다(아래는 없을 때만 만든다 — 사용자 DDL 과 같음).
CREATE TABLE IF NOT EXISTS BGM_AGIT_ROOM
(
    `BGM_AGIT_ROOM_ID`          BIGINT          NOT NULL    AUTO_INCREMENT COMMENT 'BGM 아지트 방 ID',
    `BGM_AGIT_ROOM_NAME`        VARCHAR(500)    NULL        COMMENT 'BGM 아지트 방 이름',
    `BGM_AGIT_ROOM_LINK`        VARCHAR(500)    NULL        COMMENT 'BGM 아지트 방 링크',
    `BGM_AGIT_ROOM_MIN_PEOPLE`  INT             NULL        COMMENT 'BGM 아지트 방 최소 인원',
    `BGM_AGIT_ROOM_MAX_PEOPLE`  INT             NULL        COMMENT 'BGM 아지트 방 최대 인원',
    `BGM_AGIT_ROOM_GUIDE`       VARCHAR(500)    NULL        COMMENT 'BGM 아지트 방 가이드',
    `BGM_AGIT_ROOM_IMAGE_URL`   VARCHAR(500)    NULL        COMMENT 'BGM 아지트 방 이미지 URL',
    `BGM_AGIT_ROOM_USE_STATUS`  VARCHAR(1)      NULL        COMMENT 'BGM 아지트 방 사용 상태',
    `REGIST_DATE`               DATETIME        NULL        DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    `MODIFY_DATE`               DATETIME        NULL        DEFAULT CURRENT_TIMESTAMP COMMENT '수정 일시',
     PRIMARY KEY (BGM_AGIT_ROOM_ID)
) COMMENT 'BGM_아지트_방';

INSERT INTO BGM_AGIT_ROOM
       (BGM_AGIT_ROOM_ID, BGM_AGIT_ROOM_NAME, BGM_AGIT_ROOM_LINK, BGM_AGIT_ROOM_MIN_PEOPLE, BGM_AGIT_ROOM_MAX_PEOPLE,
        BGM_AGIT_ROOM_GUIDE, BGM_AGIT_ROOM_IMAGE_URL, BGM_AGIT_ROOM_USE_STATUS, REGIST_DATE, MODIFY_DATE)
SELECT i.BGM_AGIT_IMAGE_ID, i.BGM_AGIT_IMAGE_LABEL,
       -- 링크가 비어 있으면 카테고리로 채운다(코드가 링크로 룸/마작을 가른다)
       IFNULL(NULLIF(i.BGM_AGIT_MENU_LINK, ''),
              IF(i.BGM_AGIT_IMAGE_CATEGORY = 'MAHJONG', '/detail/mahjongRental', '/detail/room')),
       i.BGM_AGIT_IMAGE_MIN_PEOPLE, i.BGM_AGIT_IMAGE_MAX_PEOPLE,
       i.BGM_AGIT_IMAGE_GROUPS, i.BGM_AGIT_IMAGE_URL,
       IF(i.BGM_AGIT_IMAGE_USE_STATUS = 'N', 'N', 'Y'),
       i.REGIST_DATE, i.MODIFY_DATE
  FROM BGM_AGIT_IMAGE i
 WHERE i.BGM_AGIT_IMAGE_CATEGORY IN ('ROOM', 'MAHJONG')
   AND NOT EXISTS (SELECT 1 FROM BGM_AGIT_ROOM r WHERE r.BGM_AGIT_ROOM_ID = i.BGM_AGIT_IMAGE_ID);

-- 10월 개편 인원값은 여기서 넣지 않는다 — 개편 브랜치의 room-people-2026-10.sql(ROOM 기준으로 개정)이 맡는다.
-- 스테이징은 개편 SQL 이 IMAGE 에 이미 적용돼 있어 개편 인원값이 그대로 옮겨진다(구 코드는 인원 범위를 검증하지 않아 무해).

-- 이름·링크·사용상태는 비면 안 된다(화면·알림톡에 이름이 빈 채로 나가고, 링크로 룸/마작을 가른다)
ALTER TABLE BGM_AGIT_ROOM
    MODIFY `BGM_AGIT_ROOM_NAME`       VARCHAR(500) NOT NULL COMMENT 'BGM 아지트 방 이름',
    MODIFY `BGM_AGIT_ROOM_LINK`       VARCHAR(500) NOT NULL COMMENT 'BGM 아지트 방 링크',
    MODIFY `BGM_AGIT_ROOM_USE_STATUS` VARCHAR(1)   NOT NULL DEFAULT 'Y' COMMENT 'BGM 아지트 방 사용 상태';

-- ID 를 직접 넣었으니 다음 번호를 맞춘다
SET @sql = (SELECT CONCAT('ALTER TABLE BGM_AGIT_ROOM AUTO_INCREMENT = ', IFNULL(MAX(BGM_AGIT_ROOM_ID), 0) + 1) FROM BGM_AGIT_ROOM);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT * FROM BGM_AGIT_ROOM ORDER BY BGM_AGIT_ROOM_LINK, BGM_AGIT_ROOM_ID;
-- min/max 가 NULL 인 사용중('Y') 방이 있으면 수동으로 채울 것(개편 코드가 인원 범위를 검증한다).


-- =====================================================================
-- 4) 기존 예약 테이블을 백업으로 돌리고 새 예약 테이블 만들기
-- =====================================================================
-- 4-1) RESERVATION_ROOM → RESERVATION FK 가 미리 걸려 있으면 뗀다. 그대로 두면 RENAME 때 OLD 를 따라간다.
SET @sql = (SELECT IFNULL(CONCAT('ALTER TABLE BGM_AGIT_RESERVATION_ROOM ',
                                 GROUP_CONCAT(CONCAT('DROP FOREIGN KEY `', CONSTRAINT_NAME, '`'))), 'DO 0')
              FROM information_schema.REFERENTIAL_CONSTRAINTS
             WHERE CONSTRAINT_SCHEMA = DATABASE()
               AND TABLE_NAME = 'BGM_AGIT_RESERVATION_ROOM'
               AND REFERENCED_TABLE_NAME = 'BGM_AGIT_RESERVATION');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4-2) 같은 컬럼 정의(타입·코멘트·기본값)로 새 테이블. LIKE 는 인덱스는 복사하고 FK 는 복사하지 않는다
CREATE TABLE BGM_AGIT_RESERVATION_NEW LIKE BGM_AGIT_RESERVATION;
ALTER TABLE BGM_AGIT_RESERVATION_NEW
    DROP COLUMN BGM_AGIT_IMAGE_ID,
    DROP COLUMN BGM_AGIT_RESERVATION_NO;

-- 4-3) 예약번호별 1행. PK = 예약번호. 다른 값은 그룹의 첫 행(MIN id).
--      시작 = 영업일 기준 가장 이른 슬롯 시작, 종료 = 가장 늦은 슬롯 종료(10:00 이전은 익일로 비교)
INSERT INTO BGM_AGIT_RESERVATION_NEW
       (BGM_AGIT_RESERVATION_ID, BGM_AGIT_MEMBER_ID, BGM_AGIT_RESERVATION_TYPE,
        BGM_AGIT_RESERVATION_START_DATE, BGM_AGIT_RESERVATION_START_TIME, BGM_AGIT_RESERVATION_END_TIME,
        BGM_AGIT_RESERVATION_PEOPLE, BGM_AGIT_RESERVATION_REQUEST,
        BGM_AGIT_RESERVATION_APPROVAL_STATUS, BGM_AGIT_RESERVATION_CANCEL_STATUS,
        REGIST_DATE, MODIFY_DATE)
SELECT h.BGM_AGIT_RESERVATION_NO, h.BGM_AGIT_MEMBER_ID, h.BGM_AGIT_RESERVATION_TYPE,
       h.BGM_AGIT_RESERVATION_START_DATE, s.start_time, s.end_time,
       h.BGM_AGIT_RESERVATION_PEOPLE, h.BGM_AGIT_RESERVATION_REQUEST,
       h.BGM_AGIT_RESERVATION_APPROVAL_STATUS, h.BGM_AGIT_RESERVATION_CANCEL_STATUS,
       h.REGIST_DATE, h.MODIFY_DATE
  FROM BGM_AGIT_RESERVATION h
  JOIN (SELECT BGM_AGIT_RESERVATION_NO AS no,
               MIN(BGM_AGIT_RESERVATION_ID) AS head_id,
               SEC_TO_TIME(MOD(MIN(TIME_TO_SEC(BGM_AGIT_RESERVATION_START_TIME)
                                   + IF(BGM_AGIT_RESERVATION_START_TIME < '10:00:00', 86400, 0)), 86400)) AS start_time,
               SEC_TO_TIME(MOD(MAX(TIME_TO_SEC(BGM_AGIT_RESERVATION_START_TIME)
                                   + IF(BGM_AGIT_RESERVATION_START_TIME < '10:00:00', 86400, 0)
                                   + MOD(TIME_TO_SEC(BGM_AGIT_RESERVATION_END_TIME)
                                         - TIME_TO_SEC(BGM_AGIT_RESERVATION_START_TIME) + 86400, 86400)), 86400)) AS end_time
          FROM BGM_AGIT_RESERVATION
         GROUP BY BGM_AGIT_RESERVATION_NO) s
    ON s.head_id = h.BGM_AGIT_RESERVATION_ID;

SET @sql = (SELECT CONCAT('ALTER TABLE BGM_AGIT_RESERVATION_NEW AUTO_INCREMENT = ', IFNULL(MAX(BGM_AGIT_RESERVATION_ID), 0) + 1)
              FROM BGM_AGIT_RESERVATION_NEW);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4-4) 교체. RENAME 두 개는 한 문장이라 원자적이다
RENAME TABLE BGM_AGIT_RESERVATION     TO BGM_AGIT_RESERVATION_OLD,
             BGM_AGIT_RESERVATION_NEW TO BGM_AGIT_RESERVATION;

-- 4-5) 백업 테이블의 FK 를 뗀다 — IMAGE 를 물고 있으면 10번에서 방 이미지 행을 못 지우고,
--      FK 이름은 스키마 전역이라 새 테이블에 같은 이름을 쓸 수 없다
SET @sql = (SELECT IFNULL(CONCAT('ALTER TABLE BGM_AGIT_RESERVATION_OLD ',
                                 GROUP_CONCAT(CONCAT('DROP FOREIGN KEY `', CONSTRAINT_NAME, '`'))), 'DO 0')
              FROM information_schema.REFERENTIAL_CONSTRAINTS
             WHERE CONSTRAINT_SCHEMA = DATABASE()
               AND TABLE_NAME = 'BGM_AGIT_RESERVATION_OLD');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4-6) 새 예약 테이블 FK
ALTER TABLE BGM_AGIT_RESERVATION
    ADD CONSTRAINT FK_BGM_AGIT_RESERVATION_MEMBER FOREIGN KEY (BGM_AGIT_MEMBER_ID)
        REFERENCES BGM_AGIT_MEMBER (BGM_AGIT_MEMBER_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- =====================================================================
-- 5) BGM_AGIT_RESERVATION_ROOM 채우기
-- =====================================================================
CREATE TABLE IF NOT EXISTS BGM_AGIT_RESERVATION_ROOM
(
    `BGM_AGIT_RESERVATION_ROOM_ID`  BIGINT      NOT NULL    AUTO_INCREMENT COMMENT 'BGM 아지트 예약 방 ID',
    `BGM_AGIT_RESERVATION_ID`       BIGINT      NOT NULL    COMMENT 'BGM 아지트 예약 ID',
    `BGM_AGIT_ROOM_ID`              BIGINT      NOT NULL    COMMENT 'BGM 아지트 방 ID',
    `REGIST_DATE`                   DATETIME    NULL        DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    `MODIFY_DATE`                   DATETIME    NULL        DEFAULT CURRENT_TIMESTAMP COMMENT '수정 일시',
     PRIMARY KEY (BGM_AGIT_RESERVATION_ROOM_ID)
) COMMENT 'BGM_아지트_예약_방';

INSERT INTO BGM_AGIT_RESERVATION_ROOM (BGM_AGIT_RESERVATION_ID, BGM_AGIT_ROOM_ID, REGIST_DATE, MODIFY_DATE)
SELECT o.BGM_AGIT_RESERVATION_NO, o.BGM_AGIT_IMAGE_ID, MIN(o.REGIST_DATE), MAX(o.MODIFY_DATE)
  FROM BGM_AGIT_RESERVATION_OLD o
 GROUP BY o.BGM_AGIT_RESERVATION_NO, o.BGM_AGIT_IMAGE_ID
 ORDER BY o.BGM_AGIT_RESERVATION_NO, o.BGM_AGIT_IMAGE_ID;

-- 같은 예약에 같은 방 두 번 금지
ALTER TABLE BGM_AGIT_RESERVATION_ROOM
    ADD CONSTRAINT UK_RESERVATION_ROOM UNIQUE (BGM_AGIT_RESERVATION_ID, BGM_AGIT_ROOM_ID);

-- 예약 FK — 4-1 에서 미리 걸린 것을 뗐으니 새 예약 테이블로 다시 건다
ALTER TABLE BGM_AGIT_RESERVATION_ROOM
    ADD CONSTRAINT FK_BGM_AGIT_RESERVATION_ROOM_RESERVATION FOREIGN KEY (BGM_AGIT_RESERVATION_ID)
        REFERENCES BGM_AGIT_RESERVATION (BGM_AGIT_RESERVATION_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- 방 FK(+인덱스) — 테이블을 미리 만들 때 이미 걸어 두었으면 건너뛴다(스테이징이 그렇다)
SET @sql = (SELECT IF(COUNT(*) > 0, 'DO 0',
                      'ALTER TABLE BGM_AGIT_RESERVATION_ROOM ADD CONSTRAINT FK_BGM_AGIT_RESERVATION_ROOM_ROOM FOREIGN KEY (BGM_AGIT_ROOM_ID) REFERENCES BGM_AGIT_ROOM (BGM_AGIT_ROOM_ID) ON DELETE RESTRICT ON UPDATE RESTRICT')
              FROM information_schema.REFERENTIAL_CONSTRAINTS
             WHERE CONSTRAINT_SCHEMA = DATABASE()
               AND TABLE_NAME = 'BGM_AGIT_RESERVATION_ROOM'
               AND REFERENCED_TABLE_NAME = 'BGM_AGIT_ROOM');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- =====================================================================
-- 6) 결제 — 예약번호 컬럼을 예약 ID 로 (값 그대로)
-- =====================================================================
ALTER TABLE BGM_AGIT_PAYMENT RENAME COLUMN BGM_AGIT_RESERVATION_NO TO BGM_AGIT_RESERVATION_ID;
ALTER TABLE BGM_AGIT_PAYMENT
    ADD CONSTRAINT FK_BGM_AGIT_PAYMENT_RESERVATION FOREIGN KEY (BGM_AGIT_RESERVATION_ID)
        REFERENCES BGM_AGIT_RESERVATION (BGM_AGIT_RESERVATION_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;
-- UNIQUE 는 걸지 않는다 — 재결제·분할결제면 같은 예약에 결제행이 여러 개다

-- 환불 이력(개편 테이블) — **있을 때만**(스테이징에는 개편 SQL 로 이미 있고, 운영에는 아직 없다).
-- 운영은 개편 배포 때 개정된 payment-partial-cancel-2026-10.sql 이 처음부터 _RESERVATION_ID 로 만든다.
-- 물리 FK 는 걸지 않는다 — 그 파일의 데드락 주석 참고
SET @sql = (SELECT IF(COUNT(*) > 0,
                      'ALTER TABLE BGM_AGIT_PAYMENT_CANCEL RENAME COLUMN BGM_AGIT_RESERVATION_NO TO BGM_AGIT_RESERVATION_ID',
                      'DO 0')
              FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'BGM_AGIT_PAYMENT_CANCEL'
               AND COLUMN_NAME = 'BGM_AGIT_RESERVATION_NO');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- =====================================================================
-- 7) 검증 — 전부 기대값과 같아야 한다
-- =====================================================================
SELECT (SELECT COUNT(DISTINCT BGM_AGIT_RESERVATION_NO) FROM BGM_AGIT_RESERVATION_OLD) AS old_groups,
       (SELECT COUNT(*) FROM BGM_AGIT_RESERVATION)                                     AS new_reservations,   -- = old_groups
       (SELECT COUNT(*) FROM (SELECT DISTINCT BGM_AGIT_RESERVATION_NO, BGM_AGIT_IMAGE_ID
                                FROM BGM_AGIT_RESERVATION_OLD) x)                       AS old_group_rooms,
       (SELECT COUNT(*) FROM BGM_AGIT_RESERVATION_ROOM)                                AS new_reservation_rooms; -- = old_group_rooms

-- 방 연결이 없는 예약 — 0건
SELECT r.BGM_AGIT_RESERVATION_ID FROM BGM_AGIT_RESERVATION r
 WHERE NOT EXISTS (SELECT 1 FROM BGM_AGIT_RESERVATION_ROOM rr WHERE rr.BGM_AGIT_RESERVATION_ID = r.BGM_AGIT_RESERVATION_ID);

-- 시작·종료가 비었거나 같은 예약 — 0건
SELECT BGM_AGIT_RESERVATION_ID, BGM_AGIT_RESERVATION_START_TIME, BGM_AGIT_RESERVATION_END_TIME
  FROM BGM_AGIT_RESERVATION
 WHERE BGM_AGIT_RESERVATION_START_TIME IS NULL OR BGM_AGIT_RESERVATION_END_TIME IS NULL
    OR BGM_AGIT_RESERVATION_START_TIME = BGM_AGIT_RESERVATION_END_TIME;

-- 표본 비교: 최근 20건의 구 슬롯 목록과 새 구간
SELECT r.BGM_AGIT_RESERVATION_ID AS id, r.BGM_AGIT_RESERVATION_START_DATE AS date,
       r.BGM_AGIT_RESERVATION_START_TIME AS new_start, r.BGM_AGIT_RESERVATION_END_TIME AS new_end,
       (SELECT GROUP_CONCAT(DISTINCT CONCAT(TIME_FORMAT(o.BGM_AGIT_RESERVATION_START_TIME, '%H:%i'), '-',
                                            TIME_FORMAT(o.BGM_AGIT_RESERVATION_END_TIME, '%H:%i'))
                            ORDER BY o.BGM_AGIT_RESERVATION_START_TIME SEPARATOR ' ')
          FROM BGM_AGIT_RESERVATION_OLD o WHERE o.BGM_AGIT_RESERVATION_NO = r.BGM_AGIT_RESERVATION_ID) AS old_slots,
       (SELECT GROUP_CONCAT(rm.BGM_AGIT_ROOM_NAME ORDER BY rm.BGM_AGIT_ROOM_ID SEPARATOR ', ')
          FROM BGM_AGIT_RESERVATION_ROOM rr JOIN BGM_AGIT_ROOM rm ON rm.BGM_AGIT_ROOM_ID = rr.BGM_AGIT_ROOM_ID
         WHERE rr.BGM_AGIT_RESERVATION_ID = r.BGM_AGIT_RESERVATION_ID) AS rooms
  FROM BGM_AGIT_RESERVATION r
 ORDER BY r.BGM_AGIT_RESERVATION_ID DESC
 LIMIT 20;


-- =====================================================================
-- 8) 방 관리 API 권한 매핑 — 컨트롤러에도 관리자 검사가 있지만 둘 다 둔다
--    조회(GET /bgm-agit/rooms)는 예약 화면용이라 매핑하지 않는다(비로그인 허용)
--    **INSERT 후 앱 재시작 필요**(매핑 로딩이 @PostConstruct 1회) — 배포 전에 넣으면 배포 재시작으로 해결
-- =====================================================================
START TRANSACTION;

INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
SELECT v.path, v.method, NOW()
  FROM (SELECT '/bgm-agit/rooms' AS path, 'POST' AS method
        UNION ALL SELECT '/bgm-agit/rooms',    'PUT'
        UNION ALL SELECT '/bgm-agit/rooms/**', 'DELETE') v
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES u
        WHERE u.BGM_AGIT_URL_RESOURCES_PATH = v.path
          AND u.BGM_AGIT_URL_HTTP_METHOD = v.method);

-- 관리자(1)만
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID, REGIST_DATE)
SELECT 1, u.BGM_AGIT_URL_RESOURCES_ID, NOW()
  FROM BGM_AGIT_URL_RESOURCES u
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH IN ('/bgm-agit/rooms', '/bgm-agit/rooms/**')
   AND NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES_ROLE r
        WHERE r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID
          AND r.BGM_AGIT_ROLE_ID = 1);

COMMIT;


-- =====================================================================
-- 9) BGM_AGIT_IMAGE 정리 — 방·마작 행 삭제 + 방 전용 컬럼 삭제
--    3번에서 ROOM 으로 옮긴 행만 지운다(카테고리가 아니라 ROOM_ID 로 매칭)
--    0-8 에서 BGM_AGIT_IMAGE 를 참조하는 다른 FK 가 있으면 그 행이 걸려 실패한다 — 그때는 원인부터 볼 것
-- =====================================================================
DELETE i FROM BGM_AGIT_IMAGE i
  JOIN BGM_AGIT_ROOM r ON r.BGM_AGIT_ROOM_ID = i.BGM_AGIT_IMAGE_ID
 WHERE i.BGM_AGIT_IMAGE_CATEGORY IN ('ROOM', 'MAHJONG');

ALTER TABLE BGM_AGIT_IMAGE
    DROP COLUMN BGM_AGIT_IMAGE_MIN_PEOPLE,
    DROP COLUMN BGM_AGIT_IMAGE_MAX_PEOPLE,
    DROP COLUMN BGM_AGIT_IMAGE_USE_STATUS,
    DROP COLUMN BGM_AGIT_IMAGE_GROUPS;

-- 남은 방·마작 카테고리 이미지 — 0건
SELECT BGM_AGIT_IMAGE_ID, BGM_AGIT_IMAGE_LABEL FROM BGM_AGIT_IMAGE
 WHERE BGM_AGIT_IMAGE_CATEGORY IN ('ROOM', 'MAHJONG');


-- =====================================================================
-- 10) (배포 후 며칠 운영해 보고 문제 없을 때) 백업 테이블 정리
-- =====================================================================
-- DROP TABLE BGM_AGIT_RESERVATION_OLD;


-- =====================================================================
-- 롤백 — 배포 직후 문제가 생겨 구 코드로 되돌릴 때. **새 예약이 들어오기 전**에만 깔끔하다
--        (새 구조로 들어온 예약·방 변경은 수동으로 옮겨야 한다)
-- =====================================================================
-- ALTER TABLE BGM_AGIT_PAYMENT DROP FOREIGN KEY FK_BGM_AGIT_PAYMENT_RESERVATION;
-- ALTER TABLE BGM_AGIT_PAYMENT RENAME COLUMN BGM_AGIT_RESERVATION_ID TO BGM_AGIT_RESERVATION_NO;
-- ALTER TABLE BGM_AGIT_PAYMENT_CANCEL RENAME COLUMN BGM_AGIT_RESERVATION_ID TO BGM_AGIT_RESERVATION_NO;
-- ALTER TABLE BGM_AGIT_RESERVATION_ROOM DROP FOREIGN KEY FK_BGM_AGIT_RESERVATION_ROOM_RESERVATION;
-- RENAME TABLE BGM_AGIT_RESERVATION TO BGM_AGIT_RESERVATION_NEW, BGM_AGIT_RESERVATION_OLD TO BGM_AGIT_RESERVATION;
-- ALTER TABLE BGM_AGIT_IMAGE
--     ADD COLUMN BGM_AGIT_IMAGE_GROUPS     VARCHAR(100) NULL,
--     ADD COLUMN BGM_AGIT_IMAGE_MIN_PEOPLE INT          NULL,
--     ADD COLUMN BGM_AGIT_IMAGE_MAX_PEOPLE INT          NULL,
--     ADD COLUMN BGM_AGIT_IMAGE_USE_STATUS VARCHAR(1)   NULL DEFAULT 'Y';
-- INSERT INTO BGM_AGIT_IMAGE (BGM_AGIT_IMAGE_ID, BGM_AGIT_MAIN_MENU_ID, BGM_AGIT_IMAGE_LABEL, BGM_AGIT_MENU_LINK,
--        BGM_AGIT_IMAGE_GROUPS, BGM_AGIT_IMAGE_CATEGORY, BGM_AGIT_IMAGE_URL, BGM_AGIT_IMAGE_MIN_PEOPLE,
--        BGM_AGIT_IMAGE_MAX_PEOPLE, BGM_AGIT_IMAGE_USE_STATUS, REGIST_DATE, MODIFY_DATE)
-- SELECT BGM_AGIT_ROOM_ID, 3, BGM_AGIT_ROOM_NAME, BGM_AGIT_ROOM_LINK, BGM_AGIT_ROOM_GUIDE,
--        IF(BGM_AGIT_ROOM_LINK = '/detail/mahjongRental', 'MAHJONG', 'ROOM'), BGM_AGIT_ROOM_IMAGE_URL,
--        BGM_AGIT_ROOM_MIN_PEOPLE, BGM_AGIT_ROOM_MAX_PEOPLE, BGM_AGIT_ROOM_USE_STATUS, REGIST_DATE, MODIFY_DATE
--   FROM BGM_AGIT_ROOM;
-- -- 구 예약 테이블의 IMAGE/MEMBER FK 는 4-5 에서 뗐으니 필요하면 다시 건다
-- DELETE FROM BGM_AGIT_RESERVATION_ROOM; DROP TABLE BGM_AGIT_RESERVATION_NEW; DELETE FROM BGM_AGIT_ROOM;
