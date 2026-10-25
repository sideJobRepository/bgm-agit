-- 시계탑 캐릭터 사전 + 스크립트
--
-- 공식 데이터(release.botc.app 의 roles·nightsheet·jinxes + 공식 한국어 번역 ko.json)를
-- 관리자 화면의 [공식 데이터 가져오기] 로 받아 사전을 채운다. 손으로 넣을 데이터는 없다.
-- 커스텀 스크립트는 스크립트 도구 JSON 을 붙여넣어 등록하고, 캐릭터는 사전 키(ROLE_KEY)로 연결된다.
--
-- ddl-auto: none 이라 수동 실행. 앱 배포 **전에** 돌린다.
-- mysql 클라이언트로 실행할 때 --default-character-set=utf8mb4 를 붙일 것.

-- 1) 캐릭터 사전
CREATE TABLE IF NOT EXISTS BGM_AGIT_CLOCKTOWER_ROLE (
    BGM_AGIT_CLOCKTOWER_ROLE_ID                BIGINT        NOT NULL AUTO_INCREMENT,
    BGM_AGIT_CLOCKTOWER_ROLE_KEY               VARCHAR(100)  NOT NULL COMMENT '공식 영문 id(fortuneteller). 자작 캐릭터는 g{게임ID}:{id}',
    BGM_AGIT_CLOCKTOWER_ROLE_NAME              VARCHAR(100)  NULL COMMENT '한글 이름',
    BGM_AGIT_CLOCKTOWER_ROLE_NAME_EN           VARCHAR(100)  NULL COMMENT '영문 이름',
    BGM_AGIT_CLOCKTOWER_ROLE_TEAM              VARCHAR(20)   NULL COMMENT 'TOWNSFOLK/OUTSIDER/MINION/DEMON/TRAVELLER/FABLED/LORIC, 밤 특수 단계는 NULL',
    BGM_AGIT_CLOCKTOWER_ROLE_EDITION           VARCHAR(20)   NULL COMMENT 'tb/bmr/snv/carousel/fabled/loric/night/homebrew',
    BGM_AGIT_CLOCKTOWER_ROLE_ABILITY           VARCHAR(1000) NULL COMMENT '능력(한글)',
    BGM_AGIT_CLOCKTOWER_ROLE_FIRST_NIGHT_ORDER INT           NULL COMMENT '첫날 밤 순서(1부터), NULL=안 깨움',
    BGM_AGIT_CLOCKTOWER_ROLE_OTHER_NIGHT_ORDER INT           NULL COMMENT '그 외 밤 순서',
    BGM_AGIT_CLOCKTOWER_ROLE_FIRST_NIGHT_TEXT  VARCHAR(1000) NULL COMMENT '첫날 밤 이야기꾼 안내',
    BGM_AGIT_CLOCKTOWER_ROLE_OTHER_NIGHT_TEXT  VARCHAR(1000) NULL COMMENT '그 외 밤 이야기꾼 안내',
    BGM_AGIT_CLOCKTOWER_ROLE_REMINDERS         VARCHAR(1000) NULL COMMENT '리마인더 문구 JSON 배열',
    BGM_AGIT_CLOCKTOWER_ROLE_REMINDERS_GLOBAL  VARCHAR(1000) NULL COMMENT '다른 플레이어에게도 붙이는 리마인더 JSON 배열',
    BGM_AGIT_CLOCKTOWER_ROLE_SETUP             CHAR(1)       NULL COMMENT '셋업(진영 인원수) 변경 캐릭터 Y/N',
    BGM_AGIT_CLOCKTOWER_ROLE_CUSTOM_EDITED     CHAR(1)       NULL COMMENT 'Y=관리자가 한글 문구 수정, 가져오기가 덮어쓰지 않음',
    BGM_AGIT_CLOCKTOWER_GAME_ID                BIGINT        NULL COMMENT '자작 캐릭터가 속한 스크립트. 공식은 NULL',
    REGIST_DATE                                DATETIME      NULL,
    MODIFY_DATE                                DATETIME      NULL,
    PRIMARY KEY (BGM_AGIT_CLOCKTOWER_ROLE_ID),
    UNIQUE KEY UK_CLOCKTOWER_ROLE_KEY (BGM_AGIT_CLOCKTOWER_ROLE_KEY),
    KEY IDX_CLOCKTOWER_ROLE_GAME (BGM_AGIT_CLOCKTOWER_GAME_ID)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 2) 징크스
CREATE TABLE IF NOT EXISTS BGM_AGIT_CLOCKTOWER_JINX (
    BGM_AGIT_CLOCKTOWER_JINX_ID     BIGINT        NOT NULL AUTO_INCREMENT,
    BGM_AGIT_CLOCKTOWER_JINX_ROLE_A VARCHAR(100)  NOT NULL COMMENT '징크스를 가진 캐릭터 ROLE_KEY',
    BGM_AGIT_CLOCKTOWER_JINX_ROLE_B VARCHAR(100)  NOT NULL COMMENT '상대 캐릭터 ROLE_KEY',
    BGM_AGIT_CLOCKTOWER_JINX_REASON VARCHAR(1000) NULL COMMENT '바뀌는 규칙(한글)',
    REGIST_DATE                     DATETIME      NULL,
    MODIFY_DATE                     DATETIME      NULL,
    PRIMARY KEY (BGM_AGIT_CLOCKTOWER_JINX_ID),
    UNIQUE KEY UK_CLOCKTOWER_JINX (BGM_AGIT_CLOCKTOWER_JINX_ROLE_A, BGM_AGIT_CLOCKTOWER_JINX_ROLE_B)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 3) 게임(=스크립트) 컬럼
--    기존 게임은 전부 MANUAL(관리자가 직접 입력). 공식 기본 3종은 SCRIPT_KEY(tb/bmr/snv)로 찾아 갱신한다
ALTER TABLE BGM_AGIT_CLOCKTOWER_GAME
    ADD COLUMN BGM_AGIT_CLOCKTOWER_GAME_SOURCE     VARCHAR(20)  NULL COMMENT 'MANUAL/OFFICIAL/CUSTOM',
    ADD COLUMN BGM_AGIT_CLOCKTOWER_GAME_SCRIPT_KEY VARCHAR(20)  NULL COMMENT '공식 기본 스크립트 판본 키',
    ADD COLUMN BGM_AGIT_CLOCKTOWER_GAME_AUTHOR     VARCHAR(200) NULL COMMENT '스크립트 작성자';

UPDATE BGM_AGIT_CLOCKTOWER_GAME SET BGM_AGIT_CLOCKTOWER_GAME_SOURCE = 'MANUAL'
 WHERE BGM_AGIT_CLOCKTOWER_GAME_SOURCE IS NULL;

-- 4) 시나리오 캐릭터 ↔ 사전 연결. 직접 입력한 캐릭터는 NULL
--    (설명 컬럼은 이미 varchar(4000)이라 손대지 않는다)
ALTER TABLE BGM_AGIT_CLOCKTOWER_CHARACTER
    ADD COLUMN BGM_AGIT_CLOCKTOWER_CHARACTER_ROLE_KEY VARCHAR(100) NULL COMMENT '캐릭터 사전 키';

-- 5) 권한 매핑
--
-- URL_RESOURCES 에 없는 경로는 BgmAgitAuthorizationManager 가 기본 permit 으로 통과시킨다.
-- 시계탑 게임 등록·수정·삭제는 지금까지 서버 검사도 매핑도 없었다(누구나 호출 가능). 이번에 같이 막는다.
-- 컨트롤러 requireAdmin 도 있지만 둘 다 둔다. **INSERT 후 앱 재시작 필요** — 매핑 로딩이 @PostConstruct 1회다.
-- 조회(GET /bgm-agit/clocktower-games...)는 공개라 매핑하지 않는다.

START TRANSACTION;

INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
SELECT v.path, v.method, NOW()
  FROM (SELECT '/bgm-agit/clocktower-games' AS path, 'POST' AS method
        UNION ALL SELECT '/bgm-agit/clocktower-games/**', 'POST'
        UNION ALL SELECT '/bgm-agit/clocktower-games/**', 'PUT'
        UNION ALL SELECT '/bgm-agit/clocktower-games/**', 'DELETE'
        UNION ALL SELECT '/bgm-agit/clocktower-roles', 'GET'
        UNION ALL SELECT '/bgm-agit/clocktower-roles/**', 'POST'
        UNION ALL SELECT '/bgm-agit/clocktower-roles/**', 'PUT') v
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES u
        WHERE u.BGM_AGIT_URL_RESOURCES_PATH = v.path
          AND u.BGM_AGIT_URL_HTTP_METHOD = v.method);

-- 관리자(1)만. 주소당 역할 하나가 규칙이라(매핑 로딩이 하나만 남긴다) 아무 역할도 없는 행에만 넣는다.
-- 이미 다른 역할이 걸린 행이 있으면 아래 결과 확인에서 role_ids 를 보고 손으로 정리할 것
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID, REGIST_DATE)
SELECT 1, u.BGM_AGIT_URL_RESOURCES_ID, NOW()
  FROM BGM_AGIT_URL_RESOURCES u
  JOIN (SELECT '/bgm-agit/clocktower-games' AS path, 'POST' AS method
        UNION ALL SELECT '/bgm-agit/clocktower-games/**', 'POST'
        UNION ALL SELECT '/bgm-agit/clocktower-games/**', 'PUT'
        UNION ALL SELECT '/bgm-agit/clocktower-games/**', 'DELETE'
        UNION ALL SELECT '/bgm-agit/clocktower-roles', 'GET'
        UNION ALL SELECT '/bgm-agit/clocktower-roles/**', 'POST'
        UNION ALL SELECT '/bgm-agit/clocktower-roles/**', 'PUT') v
    ON v.path = u.BGM_AGIT_URL_RESOURCES_PATH
   AND v.method = u.BGM_AGIT_URL_HTTP_METHOD
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES_ROLE r
        WHERE r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID);

COMMIT;

-- 결과 확인
SELECT u.BGM_AGIT_URL_RESOURCES_ID AS url_id,
       u.BGM_AGIT_URL_RESOURCES_PATH AS path,
       u.BGM_AGIT_URL_HTTP_METHOD AS method,
       GROUP_CONCAT(r.BGM_AGIT_ROLE_ID ORDER BY r.BGM_AGIT_ROLE_ID) AS role_ids
  FROM BGM_AGIT_URL_RESOURCES u
  LEFT JOIN BGM_AGIT_URL_RESOURCES_ROLE r ON r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-%'
 GROUP BY 1,2,3;

-- 롤백 (스테이징에서만)
-- DELETE FROM BGM_AGIT_URL_RESOURCES_ROLE WHERE BGM_AGIT_URL_RESOURCES_ID IN (
--   SELECT BGM_AGIT_URL_RESOURCES_ID FROM BGM_AGIT_URL_RESOURCES
--    WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-roles%');
-- DELETE FROM BGM_AGIT_URL_RESOURCES WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-roles%';
-- ALTER TABLE BGM_AGIT_CLOCKTOWER_CHARACTER DROP COLUMN BGM_AGIT_CLOCKTOWER_CHARACTER_ROLE_KEY;
-- ALTER TABLE BGM_AGIT_CLOCKTOWER_GAME DROP COLUMN BGM_AGIT_CLOCKTOWER_GAME_SOURCE,
--   DROP COLUMN BGM_AGIT_CLOCKTOWER_GAME_SCRIPT_KEY, DROP COLUMN BGM_AGIT_CLOCKTOWER_GAME_AUTHOR;
-- DROP TABLE IF EXISTS BGM_AGIT_CLOCKTOWER_JINX;
-- DROP TABLE IF EXISTS BGM_AGIT_CLOCKTOWER_ROLE;
