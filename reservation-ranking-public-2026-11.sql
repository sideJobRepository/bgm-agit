-- 예약 랭킹을 회원 누구나 보게 연다 (2026-10-20, reservation-ranking-menu-2026-11.sql 다음)
--
-- 이름·연락처는 응답에서 뺐고 닉네임은 관리자가 아니면 서버가 가려서 내린다(NicknameMasker).
-- 그래서 관리자 전용이던 권한을 유저(2)로 바꾼다. 권한이 계층(관리자 > 멘토 > 유저)이라 관리자도 그대로 본다.
-- 주소당·메뉴당 역할 하나 규칙에 맞춰 관리자(1) 행을 유저(2)로 바꾼다.
-- **URL 매핑 변경 후 앱 재시작 필요** — 매핑 로딩이 @PostConstruct 1회다(배포하면 재시작된다).
--
-- mysql 클라이언트로 실행할 때 --default-character-set=utf8mb4 를 붙일 것.

START TRANSACTION;

UPDATE BGM_AGIT_URL_RESOURCES_ROLE r
  JOIN BGM_AGIT_URL_RESOURCES u ON u.BGM_AGIT_URL_RESOURCES_ID = r.BGM_AGIT_URL_RESOURCES_ID
   SET r.BGM_AGIT_ROLE_ID = 2
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/reservation/ranking'
   AND u.BGM_AGIT_URL_HTTP_METHOD = 'GET'
   AND r.BGM_AGIT_ROLE_ID = 1;

-- 하위 메뉴(/reservation-ranking)와 그 최상위 메뉴
UPDATE BGM_AGIT_MENU_ROLE r
  JOIN BGM_AGIT_MAIN_MENU m ON m.BGM_AGIT_MAIN_MENU_ID = r.BGM_AGIT_MAIN_MENU_ID
   SET r.BGM_AGIT_ROLE_ID = 2, r.MODIFY_DATE = NOW()
 WHERE r.BGM_AGIT_ROLE_ID = 1
   AND (m.BGM_AGIT_MENU_LINK = '/reservation-ranking'
        OR m.BGM_AGIT_MAIN_MENU_ID = (SELECT p.id FROM (
               SELECT BGM_AGIT_SUB_MENU_ID AS id FROM BGM_AGIT_MAIN_MENU
                WHERE BGM_AGIT_MENU_LINK = '/reservation-ranking' LIMIT 1) p));

COMMIT;

-- 확인
SELECT u.BGM_AGIT_URL_HTTP_METHOD AS method, u.BGM_AGIT_URL_RESOURCES_PATH AS path,
       GROUP_CONCAT(r.BGM_AGIT_ROLE_ID) AS role_ids
  FROM BGM_AGIT_URL_RESOURCES u
  LEFT JOIN BGM_AGIT_URL_RESOURCES_ROLE r ON r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/reservation/ranking'
 GROUP BY u.BGM_AGIT_URL_RESOURCES_ID, u.BGM_AGIT_URL_HTTP_METHOD, u.BGM_AGIT_URL_RESOURCES_PATH;
SELECT m.BGM_AGIT_MAIN_MENU_ID AS id, m.BGM_AGIT_SUB_MENU_ID AS parent_id, m.BGM_AGIT_MENU_NAME AS name,
       m.BGM_AGIT_MENU_LINK AS link,
       (SELECT GROUP_CONCAT(BGM_AGIT_ROLE_ID) FROM BGM_AGIT_MENU_ROLE r WHERE r.BGM_AGIT_MAIN_MENU_ID = m.BGM_AGIT_MAIN_MENU_ID) AS roles
  FROM BGM_AGIT_MAIN_MENU m
 WHERE m.BGM_AGIT_MENU_NAME = '예약 랭킹';
