-- 시계탑 마도서 임시저장 + 끝난 기록의 마지막 마도서
--
-- 1) BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE: 이야기꾼이 [임시저장]을 누른 진행 중인 판. 저장한 회원·관리자만 연다(서비스에서 확인)
--    회원 FK 는 걸지 않는다(다른 시계탑 세션 표와 같은 방식 — 회원 병합·삭제 SQL 을 막지 않게)
-- 2) BGM_AGIT_CLOCKTOWER_RECORD.BGM_AGIT_CLOCKTOWER_RECORD_GRIMOIRE: 마도서에서 기록할 때 마지막 마도서(JSON). 기록 상세 [마도서 보기]
-- 3) URL 매핑: 임시저장 API 는 유저(2). 기록의 마도서 조회(GET /clocktower-records/{id}/grimoire)는 공개라 매핑하지 않는다
--
-- ddl-auto: none 이라 수동 실행. 앱 배포 **전에** 돌린다(엔티티가 새 표·컬럼을 읽는다).
-- mysql 클라이언트로 실행할 때 --default-character-set=utf8mb4 를 붙일 것. 매핑은 앱 재시작 후 반영된다.

-- 1) 임시저장 표
CREATE TABLE IF NOT EXISTS BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE (
    BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE_ID    BIGINT       NOT NULL AUTO_INCREMENT,
    BGM_AGIT_MEMBER_ID                      BIGINT       NOT NULL COMMENT '저장한 이야기꾼',
    BGM_AGIT_CLOCKTOWER_GAME_ID             BIGINT       NULL COMMENT '스크립트(게임)',
    BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE_TITLE VARCHAR(200) NULL COMMENT '목록에 보일 이름',
    BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE_STATE LONGTEXT     NOT NULL COMMENT '마도서 상태 JSON',
    REGIST_DATE                             DATETIME     NULL,
    MODIFY_DATE                             DATETIME     NULL,
    PRIMARY KEY (BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE_ID),
    KEY IDX_CT_GRIMOIRE_SAVE_MEMBER (BGM_AGIT_MEMBER_ID, MODIFY_DATE)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 2) 기록의 마지막 마도서(이미 있으면 건너뛴다 — 다시 돌려도 오류가 나지 않게)
SET @has_col = (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'BGM_AGIT_CLOCKTOWER_RECORD'
                   AND COLUMN_NAME = 'BGM_AGIT_CLOCKTOWER_RECORD_GRIMOIRE');
SET @ddl = IF(@has_col = 0,
              'ALTER TABLE BGM_AGIT_CLOCKTOWER_RECORD ADD COLUMN BGM_AGIT_CLOCKTOWER_RECORD_GRIMOIRE LONGTEXT NULL COMMENT ''게임이 끝났을 때의 마도서 JSON''',
              'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) URL 매핑(유저 2). 주소당 역할 하나(권한 계층: 관리자 > 멘토 > 유저)
START TRANSACTION;

INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
SELECT v.path, v.method, NOW()
  FROM (SELECT '/bgm-agit/clocktower-grimoire-saves' AS path, 'POST' AS method
        UNION ALL SELECT '/bgm-agit/clocktower-grimoire-saves', 'GET'
        UNION ALL SELECT '/bgm-agit/clocktower-grimoire-saves/**', 'GET'
        UNION ALL SELECT '/bgm-agit/clocktower-grimoire-saves/**', 'DELETE') v
 WHERE NOT EXISTS (SELECT 1 FROM BGM_AGIT_URL_RESOURCES u
                    WHERE u.BGM_AGIT_URL_RESOURCES_PATH = v.path AND u.BGM_AGIT_URL_HTTP_METHOD = v.method);

INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID, REGIST_DATE)
SELECT 2, u.BGM_AGIT_URL_RESOURCES_ID, NOW()
  FROM BGM_AGIT_URL_RESOURCES u
  JOIN (SELECT '/bgm-agit/clocktower-grimoire-saves' AS path, 'POST' AS method
        UNION ALL SELECT '/bgm-agit/clocktower-grimoire-saves', 'GET'
        UNION ALL SELECT '/bgm-agit/clocktower-grimoire-saves/**', 'GET'
        UNION ALL SELECT '/bgm-agit/clocktower-grimoire-saves/**', 'DELETE') v
    ON v.path = u.BGM_AGIT_URL_RESOURCES_PATH AND v.method = u.BGM_AGIT_URL_HTTP_METHOD
 WHERE NOT EXISTS (SELECT 1 FROM BGM_AGIT_URL_RESOURCES_ROLE r WHERE r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID);

COMMIT;

-- 확인
SELECT u.BGM_AGIT_URL_RESOURCES_PATH, u.BGM_AGIT_URL_HTTP_METHOD, GROUP_CONCAT(r.BGM_AGIT_ROLE_ID) AS roles
  FROM BGM_AGIT_URL_RESOURCES u
  LEFT JOIN BGM_AGIT_URL_RESOURCES_ROLE r ON r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-grimoire-saves%'
 GROUP BY u.BGM_AGIT_URL_RESOURCES_ID;

-- 되돌리기(필요할 때만)
-- DELETE r FROM BGM_AGIT_URL_RESOURCES_ROLE r JOIN BGM_AGIT_URL_RESOURCES u ON u.BGM_AGIT_URL_RESOURCES_ID = r.BGM_AGIT_URL_RESOURCES_ID
--  WHERE u.BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-grimoire-saves%';
-- DELETE FROM BGM_AGIT_URL_RESOURCES WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-grimoire-saves%';
-- ALTER TABLE BGM_AGIT_CLOCKTOWER_RECORD DROP COLUMN BGM_AGIT_CLOCKTOWER_RECORD_GRIMOIRE;
-- DROP TABLE BGM_AGIT_CLOCKTOWER_GRIMOIRE_SAVE;
