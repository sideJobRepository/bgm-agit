-- 월간패스 (2026-11 공지 "월간패스 이용자께서 예약하실 경우, 본인에 대한 이용요금은 할인")
--
-- 1) 회원 월간패스 여부 — 관리자가 권한관리 → 월간패스 탭에서 켠다. 매월 1일 0시에 스케줄러가 일괄 'N'
-- 2) 결제행 할인액 스냅샷 — 주문 때 뺀 본인 1명분 금액. 승인 재대조가 이 값을 빼고 비교한다
--    (주문과 승인 사이에 패스가 꺼져도 안내한 금액으로 승인되게)
-- 3) URL 권한 매핑 — 목록에 전화번호가 나가므로 관리자만
--
-- ddl-auto: none 이라 수동 실행. 앱 배포 **전에** 돌린다(엔티티가 새 컬럼을 읽는다).
-- mysql 클라이언트로 실행할 때 --default-character-set=utf8mb4 를 붙일 것.
-- MySQL 8 은 ADD COLUMN IF NOT EXISTS 가 없다 — 다시 돌릴 때 Duplicate column 오류는 무시해도 된다.

ALTER TABLE BGM_AGIT_MEMBER
    ADD COLUMN BGM_AGIT_MEMBER_MONTHLY_PASS_STATUS VARCHAR(1) NOT NULL DEFAULT 'N' COMMENT '월간패스 회원 여부 Y/N (매월 1일 초기화)';

ALTER TABLE BGM_AGIT_PAYMENT
    ADD COLUMN BGM_AGIT_PAYMENT_DISCOUNT_AMOUNT INT NULL COMMENT '주문 시점 월간패스 할인액(본인 1명분). 없으면 0, 개편 전 결제는 NULL';

-- 권한 매핑
--
-- URL_RESOURCES 에 없는 경로는 BgmAgitAuthorizationManager 가 기본 permit 으로 통과시킨다.
-- 서비스단에도 관리자 검사가 있지만 둘 다 둔다.
-- **INSERT 후 앱 재시작 필요** — 매핑 로딩이 @PostConstruct 1회다.

START TRANSACTION;

INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
SELECT v.path, v.method, NOW()
  FROM (SELECT '/bgm-agit/role/monthly-pass' AS path, 'GET' AS method
        UNION ALL SELECT '/bgm-agit/role/monthly-pass', 'PUT') v
 WHERE NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES u
        WHERE u.BGM_AGIT_URL_RESOURCES_PATH = v.path
          AND u.BGM_AGIT_URL_HTTP_METHOD = v.method);

-- 관리자(1)만
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID, REGIST_DATE)
SELECT 1, u.BGM_AGIT_URL_RESOURCES_ID, NOW()
  FROM BGM_AGIT_URL_RESOURCES u
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/role/monthly-pass'
   AND NOT EXISTS (
       SELECT 1 FROM BGM_AGIT_URL_RESOURCES_ROLE r
        WHERE r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID
          AND r.BGM_AGIT_ROLE_ID = 1);

COMMIT;

-- 결과 확인
SELECT COUNT(*) AS pass_members FROM BGM_AGIT_MEMBER WHERE BGM_AGIT_MEMBER_MONTHLY_PASS_STATUS = 'Y';

SELECT u.BGM_AGIT_URL_RESOURCES_ID AS url_id,
       u.BGM_AGIT_URL_RESOURCES_PATH AS path,
       u.BGM_AGIT_URL_HTTP_METHOD AS method,
       GROUP_CONCAT(r.BGM_AGIT_ROLE_ID ORDER BY r.BGM_AGIT_ROLE_ID) AS role_ids
  FROM BGM_AGIT_URL_RESOURCES u
  LEFT JOIN BGM_AGIT_URL_RESOURCES_ROLE r ON r.BGM_AGIT_URL_RESOURCES_ID = u.BGM_AGIT_URL_RESOURCES_ID
 WHERE u.BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/role/monthly-pass'
 GROUP BY 1,2,3;

-- 롤백 (스테이징에서만)
-- DELETE FROM BGM_AGIT_URL_RESOURCES_ROLE WHERE BGM_AGIT_URL_RESOURCES_ID IN (
--   SELECT BGM_AGIT_URL_RESOURCES_ID FROM BGM_AGIT_URL_RESOURCES
--    WHERE BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/role/monthly-pass');
-- DELETE FROM BGM_AGIT_URL_RESOURCES WHERE BGM_AGIT_URL_RESOURCES_PATH = '/bgm-agit/role/monthly-pass';
-- ALTER TABLE BGM_AGIT_PAYMENT DROP COLUMN BGM_AGIT_PAYMENT_DISCOUNT_AMOUNT;
-- ALTER TABLE BGM_AGIT_MEMBER DROP COLUMN BGM_AGIT_MEMBER_MONTHLY_PASS_STATUS;
