-- =====================================================================
-- 머미(머더미스터리) 게임 카탈로그 + 플레이 기록 시스템 DDL  (MySQL 8.0)
-- ddl-auto: none 이므로 수동 실행 필요.
-- 기존 모임(BGM_AGIT_GATHERING*) 모집 시스템과는 완전히 별개의 신규 테이블.
-- =====================================================================

-- ---------------------------------------------------------------------
-- BGM_AGIT_MURDER_GAME (머미 게임 카탈로그)
--  - 인원수는 게임마다 다름 → 최소/최대 두 컬럼. 단일 정원이면 min=max.
-- ---------------------------------------------------------------------
CREATE TABLE BGM_AGIT_MURDER_GAME
(
    `BGM_AGIT_MURDER_GAME_ID`          BIGINT          NOT NULL    AUTO_INCREMENT COMMENT 'BGM 아지트 머미 게임 ID',
    `BGM_AGIT_MURDER_GAME_NAME`        VARCHAR(300)    NOT NULL    COMMENT '게임명',
    `BGM_AGIT_MURDER_GAME_MIN_PLAYERS` INT             NULL        COMMENT '최소 인원',
    `BGM_AGIT_MURDER_GAME_MAX_PLAYERS` INT             NULL        COMMENT '최대 인원',
    `BGM_AGIT_MURDER_GAME_PLAY_MINUTES` INT            NULL        COMMENT '예상 플레이타임(분)',
    `BGM_AGIT_MURDER_GAME_IMAGE_URL`   VARCHAR(1000)   NULL        COMMENT '커버 이미지 URL(S3, 선택)',
    `BGM_AGIT_MURDER_GAME_USE_STATUS`  VARCHAR(1)      NULL        COMMENT '사용 여부 Y/N (소프트 삭제)',
    `REGIST_DATE`                      DATETIME        NULL        COMMENT '생성 일시',
    `MODIFY_DATE`                      DATETIME        NULL        COMMENT '수정 일시',
     PRIMARY KEY (BGM_AGIT_MURDER_GAME_ID)
);
ALTER TABLE BGM_AGIT_MURDER_GAME COMMENT 'BGM_아지트_머미_게임_카탈로그';


-- ---------------------------------------------------------------------
-- BGM_AGIT_PLAY_RECORD (플레이 세션: 게임 1 + 플레이 날짜 + 작성자)
--  - 월간 게임수 집계는 PLAY_DATE(사용자 선택) 기준. registDate 아님.
-- ---------------------------------------------------------------------
CREATE TABLE BGM_AGIT_PLAY_RECORD
(
    `BGM_AGIT_PLAY_RECORD_ID`     BIGINT          NOT NULL    AUTO_INCREMENT COMMENT 'BGM 아지트 플레이 기록 ID',
    `BGM_AGIT_MURDER_GAME_ID`     BIGINT          NOT NULL    COMMENT '플레이한 머미 게임 ID',
    `BGM_AGIT_MEMBER_ID`          BIGINT          NOT NULL    COMMENT '기록 작성자 회원 ID',
    `BGM_AGIT_PLAY_RECORD_DATE`   DATE            NOT NULL    COMMENT '플레이 날짜',
    `BGM_AGIT_PLAY_RECORD_MEMO`   VARCHAR(1000)   NULL        COMMENT '메모(선택)',
    `REGIST_DATE`                 DATETIME        NULL        COMMENT '생성 일시',
    `MODIFY_DATE`                 DATETIME        NULL        COMMENT '수정 일시',
     PRIMARY KEY (BGM_AGIT_PLAY_RECORD_ID)
);
ALTER TABLE BGM_AGIT_PLAY_RECORD COMMENT 'BGM_아지트_플레이_기록';

CREATE INDEX IDX_PLAY_RECORD_DATE ON BGM_AGIT_PLAY_RECORD (BGM_AGIT_PLAY_RECORD_DATE);

ALTER TABLE BGM_AGIT_PLAY_RECORD
    ADD CONSTRAINT FK_PLAY_RECORD_MURDER_GAME FOREIGN KEY (BGM_AGIT_MURDER_GAME_ID)
        REFERENCES BGM_AGIT_MURDER_GAME (BGM_AGIT_MURDER_GAME_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE BGM_AGIT_PLAY_RECORD
    ADD CONSTRAINT FK_PLAY_RECORD_MEMBER FOREIGN KEY (BGM_AGIT_MEMBER_ID)
        REFERENCES BGM_AGIT_MEMBER (BGM_AGIT_MEMBER_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- ---------------------------------------------------------------------
-- BGM_AGIT_PLAY_RECORD_PARTICIPANT (세션 참가자: 세션당 회원 N행)
--  - 회원별 월간 게임수 집계의 핵심 테이블.
--  - [시계탑 확장점] 추후 ALTER ADD 만 하면 됨 (지금은 미생성):
--      BGM_AGIT_PLAY_RECORD_PARTICIPANT_FACTION   VARCHAR(30)  COMMENT '진영(악/시 승패)'
--      BGM_AGIT_PLAY_RECORD_PARTICIPANT_CHARACTER VARCHAR(100) COMMENT '플레이 캐릭터'
-- ---------------------------------------------------------------------
CREATE TABLE BGM_AGIT_PLAY_RECORD_PARTICIPANT
(
    `BGM_AGIT_PLAY_RECORD_PARTICIPANT_ID` BIGINT     NOT NULL    AUTO_INCREMENT COMMENT 'BGM 아지트 플레이 기록 참가자 ID',
    `BGM_AGIT_PLAY_RECORD_ID`             BIGINT     NOT NULL    COMMENT 'BGM 아지트 플레이 기록 ID',
    `BGM_AGIT_MEMBER_ID`                  BIGINT     NOT NULL    COMMENT 'BGM 아지트 회원 ID',
    `REGIST_DATE`                         DATETIME   NULL        COMMENT '생성 일시',
    `MODIFY_DATE`                         DATETIME   NULL        COMMENT '수정 일시',
     PRIMARY KEY (BGM_AGIT_PLAY_RECORD_PARTICIPANT_ID)
);
ALTER TABLE BGM_AGIT_PLAY_RECORD_PARTICIPANT COMMENT 'BGM_아지트_플레이_기록_참가자';

ALTER TABLE BGM_AGIT_PLAY_RECORD_PARTICIPANT
    ADD CONSTRAINT UQ_PLAY_RECORD_PARTICIPANT UNIQUE (BGM_AGIT_PLAY_RECORD_ID, BGM_AGIT_MEMBER_ID);

CREATE INDEX IDX_PRP_MEMBER ON BGM_AGIT_PLAY_RECORD_PARTICIPANT (BGM_AGIT_MEMBER_ID);

ALTER TABLE BGM_AGIT_PLAY_RECORD_PARTICIPANT
    ADD CONSTRAINT FK_PRP_PLAY_RECORD FOREIGN KEY (BGM_AGIT_PLAY_RECORD_ID)
        REFERENCES BGM_AGIT_PLAY_RECORD (BGM_AGIT_PLAY_RECORD_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE BGM_AGIT_PLAY_RECORD_PARTICIPANT
    ADD CONSTRAINT FK_PRP_MEMBER FOREIGN KEY (BGM_AGIT_MEMBER_ID)
        REFERENCES BGM_AGIT_MEMBER (BGM_AGIT_MEMBER_ID) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- =====================================================================
-- 권한 매핑 (BGM_AGIT_URL_RESOURCES / BGM_AGIT_URL_RESOURCES_ROLE)
--  - GET 조회(카탈로그/기록/통계)는 공개 → 미등록.
--  - 쓰기(등록/수정/삭제) + 멤버검색은 로그인 회원(USER)이면 됨.
--    (수정/삭제 소유권은 서비스에서 한 번 더 검증)
-- =====================================================================
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/murder-games', 'POST');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/murder-games/*', 'PUT');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/murder-games/*', 'DELETE');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/play-records', 'POST');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/play-records/*', 'PUT');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/play-records/*', 'DELETE');
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD) VALUES ('/bgm-agit/all-members', 'GET');

-- 쓰기/검색 → USER(roleId=2)에 매핑 (role 계층상 ADMIN도 포함됨)
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID)
SELECT 2, BGM_AGIT_URL_RESOURCES_ID
FROM BGM_AGIT_URL_RESOURCES
WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/murder-games%'
   OR BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/play-records%'
   OR BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/all-members';


-- =====================================================================
-- 메인 메뉴 (BGM_AGIT_MAIN_MENU) — '커뮤니티'(부모 ID=4) 하위에 추가
--  - 메뉴 노출 권한(BGM_AGIT_MENU_ROLE)은 링크 기준 서브쿼리로 매핑(공개=roleId 3).
-- =====================================================================
INSERT INTO BGM_AGIT_MAIN_MENU (BGM_AGIT_SUB_MENU_ID, BGM_AGIT_AREA_ID, BGM_AGIT_MENU_NAME, BGM_AGIT_MENU_LINK) VALUES (4, null, '머미 게임목록', '/murder-games');
INSERT INTO BGM_AGIT_MAIN_MENU (BGM_AGIT_SUB_MENU_ID, BGM_AGIT_AREA_ID, BGM_AGIT_MENU_NAME, BGM_AGIT_MENU_LINK) VALUES (4, null, '플레이 기록', '/play-records');
INSERT INTO BGM_AGIT_MAIN_MENU (BGM_AGIT_SUB_MENU_ID, BGM_AGIT_AREA_ID, BGM_AGIT_MENU_NAME, BGM_AGIT_MENU_LINK) VALUES (4, null, '이번달 게임랭킹', '/play-stats');

-- 공개 메뉴 (ANONYMOUS=roleId 3)
INSERT INTO BGM_AGIT_MENU_ROLE (BGM_AGIT_MAIN_MENU_ID, BGM_AGIT_ROLE_ID, REGIST_DATE, MODIFY_DATE)
SELECT BGM_AGIT_MAIN_MENU_ID, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM BGM_AGIT_MAIN_MENU
WHERE BGM_AGIT_MENU_LINK IN ('/murder-games', '/play-records', '/play-stats');

commit;
