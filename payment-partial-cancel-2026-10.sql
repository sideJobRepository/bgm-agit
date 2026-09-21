-- 10월 예약 정책 개편: 전액결제 전환 + 부분환불 도입에 필요한 스키마 변경
--
-- ddl-auto: none 이라 수동 실행이다. 앱 배포 **전에** 돌려야 한다
-- (새 엔티티가 없는 컬럼을 읽으면 기동 직후 조회가 전부 깨진다).

START TRANSACTION;

-- 1) 결제 시점 스냅샷
--
-- 환불액을 "지금 예약 인원"으로 재계산하면 결제액과 어긋난다. 인원은 뒤에 바뀔 수 있고,
-- 개편 전 결제건(예약금 1만원 정액)에 새 단가를 적용하면 결제액을 넘는 취소 요청이 나가
-- 토스가 NOT_CANCELABLE_AMOUNT 로 거절한다. 그래서 결제 순간의 인원과 단가를 박아 둔다.
-- 정액(마작 대탁)·개편 전 결제행은 UNIT_PRICE 가 NULL 이고, 그 경우 인원 차액 환불을 하지 않는다.
ALTER TABLE BGM_AGIT_PAYMENT
    ADD COLUMN BGM_AGIT_PAYMENT_PEOPLE     INT NULL COMMENT '결제 시점 예약 인원',
    ADD COLUMN BGM_AGIT_PAYMENT_UNIT_PRICE INT NULL COMMENT '결제 시점 1인 단가(정액 결제면 NULL)';

-- 2) 환불 시도 이력
--
-- 두 가지 때문에 테이블이 필요하다.
--  (1) 멱등키 — PK 를 Idempotency-Key 로 써서 재시도 중복 환불을 막는다.
--      전액취소는 토스가 ALREADY_CANCELED_PAYMENT 로 막아주지만 부분취소는 잔액이 남아 있으면
--      같은 요청을 또 받아준다. read timeout 30초 + 프론트 자동 재시도가 있는 환경이다.
--  (2) 응대 근거 — 결제행의 CANCEL_AMOUNT 하나로는 "누적 얼마"만 남고
--      언제 왜 얼마를 돌려줬는지가 사라진다. 50% 환불과 인원 축소 차액이 섞이면 추적이 안 된다.
--
-- 토스 호출 **전에** REQUIRES_NEW 로 선커밋되는 행이라, 바깥 트랜잭션이 롤백돼도 흔적이 남는다.
CREATE TABLE BGM_AGIT_PAYMENT_CANCEL (
    BGM_AGIT_PAYMENT_CANCEL_ID     BIGINT       NOT NULL AUTO_INCREMENT,
    BGM_AGIT_PAYMENT_ID            BIGINT       NOT NULL,
    BGM_AGIT_RESERVATION_NO        BIGINT       NULL COMMENT '예약 그룹키(논리 연결, 물리 FK 없음)',
    BGM_AGIT_CANCEL_AMOUNT         INT          NULL COMMENT '이번 시도에서 환불하려는 금액',
    BGM_AGIT_CANCEL_RATE           INT          NULL COMMENT '적용된 환불 비율 100/50/0',
    BGM_AGIT_CANCEL_REASON         VARCHAR(500) NULL,
    BGM_AGIT_CANCEL_STATUS         VARCHAR(20)  NULL COMMENT 'REQUESTED/DONE/FAILED',
    BGM_AGIT_CANCEL_TRANSACTION_KEY VARCHAR(255) NULL COMMENT '토스 취소 거래 키',
    BGM_AGIT_CANCEL_FAIL_REASON    VARCHAR(500) NULL,
    REGIST_DATE                    DATETIME     NULL,
    MODIFY_DATE                    DATETIME     NULL,
    PRIMARY KEY (BGM_AGIT_PAYMENT_CANCEL_ID),
    KEY IDX_PAYMENT_CANCEL_RESERVATION (BGM_AGIT_RESERVATION_NO),
    CONSTRAINT FK_PAYMENT_CANCEL_PAYMENT
        FOREIGN KEY (BGM_AGIT_PAYMENT_ID) REFERENCES BGM_AGIT_PAYMENT (BGM_AGIT_PAYMENT_ID)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

COMMIT;

-- 3) 인원 변경 API 권한 매핑
--
-- URL_RESOURCES 에 없는 경로는 BgmAgitAuthorizationManager 가 **기본 permit** 으로 통과시킨다.
-- 돈이 움직이는 API 라 매핑을 반드시 넣는다. 서비스단에도 소유자 검증이 있지만 둘 다 둔다.
--
-- 주의 1: 매핑 로딩이 @PostConstruct 1회라 INSERT 후 **앱 재시작**이 필요하다.
-- 주의 2: 이미 '/bgm-agit/reservation/**' 와일드카드 행이 있으면 그쪽이 먼저 걸릴 수 있으니
--         아래 SELECT 로 먼저 확인할 것.
--
-- SELECT * FROM BGM_AGIT_URL_RESOURCES WHERE BGM_AGIT_URL_RESOURCES_PATH LIKE '/bgm-agit/reservation%';

START TRANSACTION;

INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
VALUES ('/bgm-agit/reservation/people', 'PUT', NOW());

SET @URL_ID = LAST_INSERT_ID();

-- 본인 예약만 바꿀 수 있으므로 로그인 사용자 전체에 허용한다(1=관리자, 2=유저, 4=멘토)
INSERT INTO BGM_AGIT_URL_RESOURCES_ROLE (BGM_AGIT_ROLE_ID, BGM_AGIT_URL_RESOURCES_ID, REGIST_DATE)
VALUES (1, @URL_ID, NOW()),
       (2, @URL_ID, NOW()),
       (4, @URL_ID, NOW());

COMMIT;

-- 4) 배포 직전 실행: 살아있는 미결제 주문 무효화
--
-- 이미 열려 있는 결제창에서 승인이 들어오면 구 금액(10,000원)으로 통과할 수 있다.
-- 코드에도 서버 재계산 대조가 들어갔지만 이중으로 막는다.
--
-- UPDATE BGM_AGIT_PAYMENT
--    SET BGM_AGIT_PAYMENT_STATUS = 'ABORTED',
--        BGM_AGIT_PAYMENT_FAIL_REASON = '요금제 개편으로 무효화된 주문'
--  WHERE BGM_AGIT_PAYMENT_STATUS = 'READY';
