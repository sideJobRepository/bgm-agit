-- 시계탑 진행판 2차 보완
--
-- ddl-auto: none 이라 수동 실행. 앱 배포 **전에** 돌린다.
-- 순서: clocktower-dictionary-2026-11.sql → clocktower-participant-evil-2026-11.sql → 이 파일
-- mysql 클라이언트로 실행할 때 --default-character-set=utf8mb4 를 붙일 것.

-- 1) 기록 메모 varchar(100) → TEXT
--    진행판이 이야기꾼 메모를 붙여 보내면 100자를 넘겨 STRICT 모드에서 기록 저장이 통째로 실패했다.
--    서버(@Size 5000)·화면(maxLength)도 같은 상한을 둔다.
ALTER TABLE BGM_AGIT_CLOCKTOWER_RECORD
    MODIFY COLUMN BGM_AGIT_CLOCKTOWER_RECORD_MEMO TEXT NULL;

-- 2) 캐릭터 토큰 이미지 컬럼
--    공식 이미지는 우리 S3(clocktower/characters/{edition}/{id}[_g|_e].webp)에 복사한 주소,
--    자작 캐릭터는 스크립트 JSON 의 원본 주소(http(s)·500자 이하만)를 그대로 넣는다.
--    공식 데이터 가져오기는 이 컬럼을 건드리지 않는다. 복사는 사전 관리 화면 [이미지 복사].
ALTER TABLE BGM_AGIT_CLOCKTOWER_ROLE
    ADD COLUMN BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_URL VARCHAR(500) NULL,
    ADD COLUMN BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_GOOD_URL VARCHAR(500) NULL,
    ADD COLUMN BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_EVIL_URL VARCHAR(500) NULL,
    ADD COLUMN BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_SYNCED_AT DATETIME NULL;

-- 3) 이미지 복사 현황 조회 GET /bgm-agit/clocktower-roles/images/status 관리자(1) 매핑
--    기존 '/bgm-agit/clocktower-roles' GET 행은 정확 경로라 하위 경로를 덮지 못한다. 그래서 '/**' GET 을 새로 건다(둘 다 관리자라 충돌 없음).
--    복사 POST /images/sync 는 기존 '/bgm-agit/clocktower-roles/**' POST(관리자) 행이 덮는다.
--    컨트롤러 requireAdmin 도 있다. **INSERT 후 앱 재시작 필요** — 매핑 로딩이 @PostConstruct 1회다.
START TRANSACTION;

INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
SELECT v.path, v.method, NOW()
  FROM (SELECT '/bgm-agit/clocktower-roles/**' AS path, 'GET' AS method) v
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES u
        WHERE u.BGM_AGIT_URL_RESOURCES_PATH = v.path
          AND u.BGM_AGIT_URL_HTTP_METHOD = v.method);

-- 주소당 역할 하나가 규칙이라 아무 역할도 없는 행에만 넣는다
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID, REGIST_DATE)
SELECT 1, u.BGM_AGIT_URL_RESOURCES_ID, NOW()
  FROM BGM_AGIT_URL_RESOURCES u
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/clocktower-roles/**'
   AND u.BGM_AGIT_URL_HTTP_METHOD = 'GET'
   AND NOT EXISTS (
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
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/clocktower-roles%'
 GROUP BY 1,2,3;

-- 롤백 (스테이징에서만)
-- DELETE FROM BGM_AGIT_URL_RESOURCES_ROLE WHERE BGM_AGIT_URL_RESOURCES_ID IN (
--   SELECT BGM_AGIT_URL_RESOURCES_ID FROM BGM_AGIT_URL_RESOURCES
--    WHERE BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/clocktower-roles/**' AND BGM_AGIT_URL_HTTP_METHOD = 'GET');
-- DELETE FROM BGM_AGIT_URL_RESOURCES
--  WHERE BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/clocktower-roles/**' AND BGM_AGIT_URL_HTTP_METHOD = 'GET';
-- ALTER TABLE BGM_AGIT_CLOCKTOWER_ROLE DROP COLUMN BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_URL,
--   DROP COLUMN BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_GOOD_URL, DROP COLUMN BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_EVIL_URL,
--   DROP COLUMN BGM_AGIT_CLOCKTOWER_ROLE_IMAGE_SYNCED_AT;

-- 4) 커스텀 시계탑(botc.vnamu.com) 시트 주소 불러오기 GET /bgm-agit/clocktower-games/script/fetch 관리자(1) 매핑
--    **정확 경로로만** 건다. '/bgm-agit/clocktower-games/**' GET 을 걸면 게임 목록·상세(공개 조회)가 막힌다.
--    컨트롤러 requireAdmin 도 있다. INSERT 후 앱 재시작 필요.
START TRANSACTION;

INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
SELECT '/bgm-agit/clocktower-games/script/fetch', 'GET', NOW()
  FROM DUAL
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES u
        WHERE u.BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/clocktower-games/script/fetch'
          AND u.BGM_AGIT_URL_HTTP_METHOD = 'GET');

INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID, REGIST_DATE)
SELECT 1, u.BGM_AGIT_URL_RESOURCES_ID, NOW()
  FROM BGM_AGIT_URL_RESOURCES u
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/clocktower-games/script/fetch'
   AND u.BGM_AGIT_URL_HTTP_METHOD = 'GET'
   AND NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES_ROLE r
        WHERE r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID);

COMMIT;
