-- 시계탑 사전·징크스 문구 컬럼 길이 확대 (varchar(1000) → 4000)
--
-- 문구 컬럼은 varchar(4000). 리마인더 목록(JSON 배열) 두 개는 TEXT 로 둔다 —
-- MySQL 은 한 행의 varchar 최대 바이트 합이 65,535 를 넘으면 ALTER 를 거부한다(utf8mb4 는 글자당 4바이트).
-- 사전 표의 varchar 다섯 개를 모두 4000 으로 하면 약 80,000바이트라 실패한다.
--
-- ddl-auto: none 이라 수동 실행. 이미 4000/TEXT 인 컬럼에 다시 돌려도 결과는 같다.

ALTER TABLE BGM_AGIT_CLOCKTOWER_JINX
    MODIFY COLUMN BGM_AGIT_CLOCKTOWER_JINX_REASON VARCHAR(4000) NULL COMMENT '바뀌는 규칙(한글)';

ALTER TABLE BGM_AGIT_CLOCKTOWER_ROLE
    MODIFY COLUMN BGM_AGIT_CLOCKTOWER_ROLE_ABILITY           VARCHAR(4000) NULL COMMENT '능력(한글)',
    MODIFY COLUMN BGM_AGIT_CLOCKTOWER_ROLE_FIRST_NIGHT_TEXT  VARCHAR(4000) NULL COMMENT '첫날 밤 이야기꾼 안내',
    MODIFY COLUMN BGM_AGIT_CLOCKTOWER_ROLE_OTHER_NIGHT_TEXT  VARCHAR(4000) NULL COMMENT '그 외 밤 이야기꾼 안내',
    MODIFY COLUMN BGM_AGIT_CLOCKTOWER_ROLE_REMINDERS         TEXT          NULL COMMENT '리마인더 문구 JSON 배열',
    MODIFY COLUMN BGM_AGIT_CLOCKTOWER_ROLE_REMINDERS_GLOBAL  TEXT          NULL COMMENT '다른 플레이어에게도 붙이는 리마인더 JSON 배열';
