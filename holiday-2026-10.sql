-- 공휴일 수동 지정
--
-- 법정공휴일은 LunarCalendar 가 계산한다(고정 양력 + 음력 변환 설·추석·석가탄신일 + 대체공휴일).
-- 계산으로 알 수 없는 것은 선거일·임시공휴일처럼 그때그때 고시되는 날이라,
-- 전체 목록을 들고 있지 않고 **예외만** 저장한다.
--   ADD     = 이 날도 공휴일로 쳐라 (주말 단가 11,000원)
--   EXCLUDE = 계산은 공휴일이라지만 정상 영업한다 (평일 단가 9,000원)
--
-- ddl-auto: none 이라 수동 실행. 앱 배포 **전에** 돌린다.
-- mysql 클라이언트로 실행할 때 --default-character-set=utf8mb4 를 붙일 것.

CREATE TABLE IF NOT EXISTS BGM_AGIT_HOLIDAY (
    BGM_AGIT_HOLIDAY_ID   BIGINT       NOT NULL AUTO_INCREMENT,
    BGM_AGIT_HOLIDAY_DATE DATE         NOT NULL COMMENT '대상 날짜',
    BGM_AGIT_HOLIDAY_NAME VARCHAR(100) NULL COMMENT '화면 표시용 이름 (예: 제22대 대선)',
    BGM_AGIT_HOLIDAY_TYPE VARCHAR(20)  NULL COMMENT 'ADD / EXCLUDE',
    REGIST_DATE           DATETIME     NULL,
    MODIFY_DATE           DATETIME     NULL,
    PRIMARY KEY (BGM_AGIT_HOLIDAY_ID),
    -- 하루에 ADD 와 EXCLUDE 가 동시에 있을 수 없다. 서비스단 upsert 도 이 제약을 전제한다
    UNIQUE KEY UK_HOLIDAY_DATE (BGM_AGIT_HOLIDAY_DATE)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 권한 매핑
--
-- URL_RESOURCES 에 없는 경로는 BgmAgitAuthorizationManager 가 기본 permit 으로 통과시킨다.
-- 요금이 바뀌는 설정이라 반드시 넣는다(서비스단에도 관리자 검사가 있지만 둘 다 둔다).
-- **INSERT 후 앱 재시작 필요** — 매핑 로딩이 @PostConstruct 1회다.
--
-- 조회(GET /bgm-agit/holidays)는 요금 안내용이라 매핑하지 않는다(비로그인 허용).

START TRANSACTION;

INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
SELECT v.path, v.method, NOW()
  FROM (SELECT '/bgm-agit/holidays' AS path, 'POST' AS method
        UNION ALL SELECT '/bgm-agit/holidays/**', 'DELETE') v
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES u
        WHERE u.BGM_AGIT_URL_RESOURCES_PATH = v.path
          AND u.BGM_AGIT_URL_HTTP_METHOD = v.method);

-- 관리자(1)만
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID, REGIST_DATE)
SELECT 1, u.BGM_AGIT_URL_RESOURCES_ID, NOW()
  FROM BGM_AGIT_URL_RESOURCES u
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH IN ('/bgm-agit/holidays', '/bgm-agit/holidays/**')
   AND NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES_ROLE r
        WHERE r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID
          AND r.BGM_AGIT_ROLE_ID = 1);

COMMIT;

-- 결과 확인
SELECT u.BGM_AGIT_URL_RESOURCES_ID AS url_id,
       u.BGM_AGIT_URL_RESOURCES_PATH AS path,
       u.BGM_AGIT_URL_HTTP_METHOD AS method,
       GROUP_CONCAT(r.BGM_AGIT_ROLE_ID ORDER BY r.BGM_AGIT_ROLE_ID) AS role_ids
  FROM BGM_AGIT_URL_RESOURCES u
  LEFT JOIN BGM_AGIT_URL_RESOURCES_ROLE r ON r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/holidays%'
 GROUP BY 1,2,3;

-- 롤백 (스테이징에서만)
-- DELETE FROM BGM_AGIT_URL_RESOURCES_ROLE WHERE BGM_AGIT_URL_RESOURCES_ID IN (
--   SELECT BGM_AGIT_URL_RESOURCES_ID FROM BGM_AGIT_URL_RESOURCES
--    WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/holidays%');
-- DELETE FROM BGM_AGIT_URL_RESOURCES WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/holidays%';
-- DROP TABLE IF EXISTS BGM_AGIT_HOLIDAY;
