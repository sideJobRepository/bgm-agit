-- =====================================================================
-- 머더미스터리 / 시계탑 모임(Gathering) 모집 시스템 DDL  (MySQL 8.0)
-- ddl-auto: none 이므로 수동 실행 필요.
-- =====================================================================

-- ---------------------------------------------------------------------
-- BGM_AGIT_GATHERING (모임)
-- ---------------------------------------------------------------------
CREATE TABLE BGM_AGIT_GATHERING
(
    `BGM_AGIT_GATHERING_ID`                 BIGINT           NOT NULL    AUTO_INCREMENT COMMENT 'BGM 아지트 모임 ID',
    `BGM_AGIT_MEMBER_ID`                    BIGINT           NULL        COMMENT 'BGM 아지트 회원 ID',
    `BGM_AGIT_GATHERING_TYPE`               VARCHAR(30)      NULL        COMMENT 'BGM 아지트 모임 종류 (MURDER_MYSTERY/CLOCK_TOWER)',
    `BGM_AGIT_GATHERING_TITLE`              VARCHAR(500)     NULL        COMMENT 'BGM 아지트 모임 제목',
    `BGM_AGIT_SCENARIO_NAME`                VARCHAR(500)     NULL        COMMENT 'BGM 아지트 시나리오 이름',
    `BGM_AGIT_GATHERING_PLACE`              VARCHAR(500)     NULL        COMMENT 'BGM 아지트 모임 장소',
    `BGM_AGIT_GATHERING_DESCRIPTION`        VARCHAR(4000)    NULL        COMMENT 'BGM 아지트 모임 설명',
    `BGM_AGIT_GATHERING_DATE`               DATE             NULL        COMMENT 'BGM 아지트 모임 일시',
    `BGM_AGIT_GATHERING_START_TIME`         TIME             NULL        COMMENT 'BGM 아지트 모임 시작 시간',
    `BGM_AGIT_GATHERING_END_TIME`           TIME             NULL        COMMENT 'BGM 아지트 모임 종료 시간',
    `BGM_AGIT_GATHERING_MIN_PEOPLE`         INT              NULL        COMMENT 'BGM 아지트 모임 최소 인원',
    `BGM_AGIT_GATHERING_MAX_PEOPLE`         INT              NULL        COMMENT 'BGM 아지트 모임 최대 인원',
    `BGM_AGIT_RECRUIT_DEADLINE`             DATETIME         NULL        COMMENT 'BGM 아지트 모집 마감',
    `BGM_AGIT_GATHERING_STATUS`             VARCHAR(500)     NULL        COMMENT 'BGM 아지트 모임 상태 (RECRUITING/CONFIRMED/CANCELLED/COMPLETED)',
    `REGIST_DATE`                           DATETIME         NULL        COMMENT '생성 일시',
    `MODIFY_DATE`                           DATETIME         NULL        COMMENT '수정 일시',
     PRIMARY KEY (BGM_AGIT_GATHERING_ID)
);

-- 테이블 Comment 설정 SQL - BGM_AGIT_GATHERING
ALTER TABLE BGM_AGIT_GATHERING COMMENT 'BGM_아지트_모임';

-- Foreign Key 설정 SQL - BGM_AGIT_GATHERING(BGM_AGIT_MEMBER_ID) -> BGM_AGIT_MEMBER(BGM_AGIT_MEMBER_ID)
ALTER TABLE BGM_AGIT_GATHERING
    ADD CONSTRAINT FK_BGM_AGIT_GATHERING_BGM_AGIT_MEMBER_ID_BGM_AGIT_MEMBER_BGM_AGI FOREIGN KEY (BGM_AGIT_MEMBER_ID)
        REFERENCES BGM_AGIT_MEMBER (BGM_AGIT_MEMBER_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- ---------------------------------------------------------------------
-- BGM_AGIT_GATHERING_PARTICIPANT (참가자 / 좌석 상태)
-- ---------------------------------------------------------------------
CREATE TABLE BGM_AGIT_GATHERING_PARTICIPANT
(
    `BGM_AGIT_GATHERING_PARTICIPANT_ID`              BIGINT          NOT NULL    AUTO_INCREMENT COMMENT 'BGM 아지트 모임 참가자 ID',
    `BGM_AGIT_GATHERING_ID`                          BIGINT          NULL        COMMENT 'BGM 아지트 모임 ID',
    `BGM_AGIT_MEMBER_ID`                             BIGINT          NULL        COMMENT 'BGM 아지트 회원 ID',
    `BGM_AGIT_GATHERING_PARTICIPANT_STATUS`          VARCHAR(500)    NULL        COMMENT 'BGM 아지트 모임 참가자 상태 (CONFIRMED/WAITING/CANCELLED/ATTENDED/NOSHOW)',
    `BGM_AGIT_GATHERING_PARTICIPANT_FLEXIBLE`        TINYINT         NULL        COMMENT 'BGM 아지트 모임 참가자 유연(다른 장르도 가능)',
    `BGM_AGIT_GATHERING_PARTICIPANT_ORDERS`          BIGINT          NULL        COMMENT 'BGM 아지트 모임 참가자 순서',
    `REGIST_DATE`                                    DATETIME        NULL        COMMENT '생성 일시',
    `MODIFY_DATE`                                    DATETIME        NULL        COMMENT '수정 일시',
     PRIMARY KEY (BGM_AGIT_GATHERING_PARTICIPANT_ID)
);

-- 테이블 Comment 설정 SQL - BGM_AGIT_GATHERING_PARTICIPANT
ALTER TABLE BGM_AGIT_GATHERING_PARTICIPANT COMMENT 'BGM_아지트_모임_참가자';

-- (권장) 한 모임에 한 회원 1행 보장 — 중복 신청 DB 차원 방지
ALTER TABLE BGM_AGIT_GATHERING_PARTICIPANT
    ADD CONSTRAINT UQ_GATHERING_PARTICIPANT UNIQUE (BGM_AGIT_GATHERING_ID, BGM_AGIT_MEMBER_ID);

-- Foreign Key 설정 SQL - BGM_AGIT_GATHERING_PARTICIPANT(BGM_AGIT_GATHERING_ID) -> BGM_AGIT_GATHERING(BGM_AGIT_GATHERING_ID)
ALTER TABLE BGM_AGIT_GATHERING_PARTICIPANT
    ADD CONSTRAINT FK_BGM_AGIT_GATHERING_PARTICIPANT_BGM_AGIT_GATHERING_ID_BGM_AGIT FOREIGN KEY (BGM_AGIT_GATHERING_ID)
        REFERENCES BGM_AGIT_GATHERING (BGM_AGIT_GATHERING_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Foreign Key 설정 SQL - BGM_AGIT_GATHERING_PARTICIPANT(BGM_AGIT_MEMBER_ID) -> BGM_AGIT_MEMBER(BGM_AGIT_MEMBER_ID)
ALTER TABLE BGM_AGIT_GATHERING_PARTICIPANT
    ADD CONSTRAINT FK_BGM_AGIT_GATHERING_PARTICIPANT_BGM_AGIT_MEMBER_ID_BGM_AGIT_ME FOREIGN KEY (BGM_AGIT_MEMBER_ID)
        REFERENCES BGM_AGIT_MEMBER (BGM_AGIT_MEMBER_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- =====================================================================
-- 권한 매핑 (BGM_AGIT_URL_RESOURCES / BGM_AGIT_URL_RESOURCES_ROLE)
-- - 조회(GET /gatherings, /gatherings/{id})가 전체 공개면 등록 불필요할 수 있음(인가 정책 확인).
-- - 모임 생성/수정/무산/참가자관리/신청은 "로그인 회원(USER)"이면 됨.
--   (수정/무산/참가자관리는 주최자 본인 or 관리자만 통과하도록 서비스에서 한 번 더 검증함)
-- - 메뉴 관리만 ADMIN 전용.
-- =====================================================================

-- 모임 쓰기 엔드포인트 (회원이면 호출 가능, 소유권은 서비스가 검증)
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/gatherings', 'POST');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/gatherings/*', 'PUT');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/gatherings/*', 'DELETE');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/gatherings/*/participants/*', 'PUT');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/gatherings/*/apply', 'POST');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/gatherings/*/apply', 'DELETE');

-- 메뉴 관리(관리자 전용)
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/main-menu/options', 'GET');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/main-menu', 'POST');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/main-menu/*', 'PUT');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/main-menu/*', 'DELETE');

-- 모임 쓰기/신청 → USER(roleId=2)에 매핑 (role 계층상 ADMIN도 포함됨)
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID)
SELECT 2, BGM_AGIT_URL_RESOURCES_ID
FROM BGM_AGIT_URL_RESOURCES
WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/gatherings%';

-- 메뉴 관리 → ADMIN(roleId=1)에 매핑
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID)
SELECT 1, BGM_AGIT_URL_RESOURCES_ID
FROM BGM_AGIT_URL_RESOURCES
WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/main-menu%';
