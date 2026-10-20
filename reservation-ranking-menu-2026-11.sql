-- 예약 랭킹을 마이페이지 하위에서 **최상위 메뉴 "예약 랭킹"(관리자만)** 으로 분리 (2026-10-20)
-- reservation-ranking-2026-11.sql 다음에 돌린다. 서비스 요청(service-request-menu.sql)과 같은 구조다:
-- getMainMenu 가 subMenu 없는 root 를 걸러내므로 최상위(링크 없음) + 하위(실제 링크) 두 단으로 둔다.
-- 자리는 "서비스 요청"(area 7) 다음 area 8.
--
-- mysql 클라이언트로 실행할 때 --default-character-set=utf8mb4 를 붙일 것.

START TRANSACTION;

-- 최상위 메뉴 (링크 없음)
INSERT INTO BGM_AGIT_MAIN_MENU
       (BGM_AGIT_SUB_MENU_ID, BGM_AGIT_AREA_ID, BGM_AGIT_MENU_NAME, BGM_AGIT_MENU_LINK, BGM_AGIT_USE_STATUS, REGIST_DATE)
SELECT NULL, 8, '예약 랭킹', NULL, 1, NOW()
  FROM DUAL
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_MAIN_MENU
        WHERE BGM_AGIT_SUB_MENU_ID IS NULL AND BGM_AGIT_MENU_NAME = '예약 랭킹');

SELECT BGM_AGIT_MAIN_MENU_ID INTO @PARENT_ID
  FROM BGM_AGIT_MAIN_MENU
 WHERE BGM_AGIT_SUB_MENU_ID IS NULL AND BGM_AGIT_MENU_NAME = '예약 랭킹'
 LIMIT 1;

-- 최상위 메뉴 권한 — 관리자(1)
INSERT INTO BGM_AGIT_MENU_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_MAIN_MENU_ID, REGIST_DATE, MODIFY_DATE)
SELECT 1, @PARENT_ID, NOW(), NOW()
  FROM DUAL
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_MENU_ROLE WHERE BGM_AGIT_MAIN_MENU_ID = @PARENT_ID AND BGM_AGIT_ROLE_ID = 1);

-- 기존 하위 메뉴(/reservation-ranking)를 새 최상위 아래로 옮긴다
UPDATE BGM_AGIT_MAIN_MENU
   SET BGM_AGIT_SUB_MENU_ID = @PARENT_ID, BGM_AGIT_AREA_ID = 1, MODIFY_DATE = NOW()
 WHERE BGM_AGIT_MENU_LINK = '/reservation-ranking';

COMMIT;

-- 확인
SELECT m.BGM_AGIT_MAIN_MENU_ID AS id, m.BGM_AGIT_SUB_MENU_ID AS parent_id, m.BGM_AGIT_AREA_ID AS area,
       m.BGM_AGIT_MENU_NAME AS name, m.BGM_AGIT_MENU_LINK AS link,
       (SELECT GROUP_CONCAT(BGM_AGIT_ROLE_ID) FROM BGM_AGIT_MENU_ROLE r WHERE r.BGM_AGIT_MAIN_MENU_ID = m.BGM_AGIT_MAIN_MENU_ID) AS roles
  FROM BGM_AGIT_MAIN_MENU m
 WHERE m.BGM_AGIT_MAIN_MENU_ID = @PARENT_ID OR m.BGM_AGIT_MENU_LINK = '/reservation-ranking';
