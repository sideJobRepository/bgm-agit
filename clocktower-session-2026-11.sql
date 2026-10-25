-- 시계탑 진행판 세션 = 플레이어 휴대폰 "내 캐릭터"
--
-- 참가자는 전원 회원(회원가입 강제)이고 각자 휴대폰으로 로그인해 자기 캐릭터를 본다.
-- 서버에는 "각 플레이어에게 보여줄 것"만 둔다. 주정뱅이·꼭두각시·미치광이는 믿는 캐릭터만 올라오고 진짜 정체는 없다.
-- 진행 상태 전체(누가 진짜 무엇인지)는 여전히 진행판 기기 localStorage 에만 있다.
--
-- ddl-auto: none 이라 수동 실행. 앱 배포 **전에** 돌린다(엔티티가 이 표를 읽는다).
-- mysql 클라이언트로 실행할 때 --default-character-set=utf8mb4 를 붙일 것.
-- 회원 FK 는 걸지 않는다 — 회원 하드 삭제·병합(MERGE_MEMBER)이 이 표 때문에 막히지 않게. 세션이 지나면 의미 없는 데이터다.

-- 1) 세션(한 판). 생성 후 18시간이 지나면 ACTIVE 여도 앱이 닫힌 것으로 본다
CREATE TABLE IF NOT EXISTS BGM_AGIT_CLOCKTOWER_SESSION (
    BGM_AGIT_CLOCKTOWER_SESSION_ID             BIGINT      NOT NULL AUTO_INCREMENT,
    BGM_AGIT_CLOCKTOWER_GAME_ID                BIGINT      NOT NULL COMMENT '시계탑 게임(스크립트)',
    BGM_AGIT_CLOCKTOWER_SESSION_STORYTELLER_ID BIGINT      NOT NULL COMMENT '이야기꾼 회원 ID',
    BGM_AGIT_CLOCKTOWER_SESSION_STATUS         VARCHAR(20) NOT NULL COMMENT 'ACTIVE/CLOSED',
    REGIST_DATE                                DATETIME    NULL,
    MODIFY_DATE                                DATETIME    NULL,
    PRIMARY KEY (BGM_AGIT_CLOCKTOWER_SESSION_ID),
    KEY IDX_CLOCKTOWER_SESSION_STORYTELLER (BGM_AGIT_CLOCKTOWER_SESSION_STORYTELLER_ID, BGM_AGIT_CLOCKTOWER_SESSION_STATUS)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 2) 좌석 = 플레이어 1명에게 보여줄 것
CREATE TABLE IF NOT EXISTS BGM_AGIT_CLOCKTOWER_SESSION_SEAT (
    BGM_AGIT_CLOCKTOWER_SESSION_SEAT_ID             BIGINT       NOT NULL AUTO_INCREMENT,
    BGM_AGIT_CLOCKTOWER_SESSION_ID                  BIGINT       NOT NULL,
    BGM_AGIT_MEMBER_ID                              BIGINT       NOT NULL COMMENT '플레이어 회원 ID',
    BGM_AGIT_CLOCKTOWER_SESSION_SEAT_NO             INT          NOT NULL COMMENT '좌석 번호(1부터)',
    BGM_AGIT_CLOCKTOWER_SESSION_SEAT_ROLE_KEY       VARCHAR(100) NULL COMMENT '보여줄 캐릭터: 사전 키 또는 c{캐릭터ID}. NULL=미배정',
    BGM_AGIT_CLOCKTOWER_SESSION_SEAT_EVIL           CHAR(1)      NULL COMMENT '보여줄 선악 Y/N, NULL=캐릭터 기본 진영',
    BGM_AGIT_CLOCKTOWER_SESSION_SEAT_INFO           TEXT         NULL COMMENT '이야기꾼 정보 JSON {title, lines}',
    BGM_AGIT_CLOCKTOWER_SESSION_SEAT_VERSION        INT          NOT NULL DEFAULT 1 COMMENT '내용이 바뀔 때마다 +1',
    BGM_AGIT_CLOCKTOWER_SESSION_SEAT_VIEWED_VERSION INT          NOT NULL DEFAULT 0 COMMENT '플레이어가 확인한 버전',
    BGM_AGIT_CLOCKTOWER_SESSION_SEAT_VIEWED_AT      DATETIME     NULL,
    REGIST_DATE                                     DATETIME     NULL,
    MODIFY_DATE                                     DATETIME     NULL,
    PRIMARY KEY (BGM_AGIT_CLOCKTOWER_SESSION_SEAT_ID),
    UNIQUE KEY UK_CLOCKTOWER_SESSION_SEAT_MEMBER (BGM_AGIT_CLOCKTOWER_SESSION_ID, BGM_AGIT_MEMBER_ID),
    KEY IDX_CLOCKTOWER_SESSION_SEAT_MEMBER (BGM_AGIT_MEMBER_ID),
    CONSTRAINT FK_CLOCKTOWER_SESSION_SEAT_SESSION FOREIGN KEY (BGM_AGIT_CLOCKTOWER_SESSION_ID)
        REFERENCES BGM_AGIT_CLOCKTOWER_SESSION (BGM_AGIT_CLOCKTOWER_SESSION_ID) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 3) 권한 매핑 — 유저(2). 참가자 닉네임 검색 GET /bgm-agit/clocktower-members 도 같이(로그인 회원만). 권한 계층(관리자 > 멘토 > 유저)이라 관리자도 통과하고, 주소당 역할 하나가 규칙이다.
--    이야기꾼 본인/관리자 판정은 서비스단에서 한다. **INSERT 후 앱 재시작 필요**(매핑 로딩이 @PostConstruct 1회)

START TRANSACTION;

INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
SELECT v.path, v.method, NOW()
  FROM (SELECT '/bgm-agit/clocktower-sessions' AS path, 'POST' AS method
        UNION ALL SELECT '/bgm-agit/clocktower-sessions/**', 'GET'
        UNION ALL SELECT '/bgm-agit/clocktower-sessions/**', 'POST'
        UNION ALL SELECT '/bgm-agit/clocktower-sessions/**', 'PUT'
        UNION ALL SELECT '/bgm-agit/clocktower-members', 'GET') v
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES u
        WHERE u.BGM_AGIT_URL_RESOURCES_PATH = v.path
          AND u.BGM_AGIT_URL_HTTP_METHOD = v.method);

-- 아무 역할도 없는 행에만 넣는다. 이미 다른 역할이 걸린 행이 있으면 아래 결과 확인에서 role_ids 를 보고 손으로 정리할 것
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID, REGIST_DATE)
SELECT 2, u.BGM_AGIT_URL_RESOURCES_ID, NOW()
  FROM BGM_AGIT_URL_RESOURCES u
  JOIN (SELECT '/bgm-agit/clocktower-sessions' AS path, 'POST' AS method
        UNION ALL SELECT '/bgm-agit/clocktower-sessions/**', 'GET'
        UNION ALL SELECT '/bgm-agit/clocktower-sessions/**', 'POST'
        UNION ALL SELECT '/bgm-agit/clocktower-sessions/**', 'PUT'
        UNION ALL SELECT '/bgm-agit/clocktower-members', 'GET') v
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
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-sessions%' OR u.BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/clocktower-members'
 GROUP BY 1,2,3;

-- 롤백 (스테이징에서만)
-- DELETE FROM BGM_AGIT_URL_RESOURCES_ROLE WHERE BGM_AGIT_URL_RESOURCES_ID IN (
--   SELECT BGM_AGIT_URL_RESOURCES_ID FROM BGM_AGIT_URL_RESOURCES
--    WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-sessions%');
-- DELETE FROM BGM_AGIT_URL_RESOURCES WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-sessions%';
-- DROP TABLE IF EXISTS BGM_AGIT_CLOCKTOWER_SESSION_SEAT;
-- DROP TABLE IF EXISTS BGM_AGIT_CLOCKTOWER_SESSION;
