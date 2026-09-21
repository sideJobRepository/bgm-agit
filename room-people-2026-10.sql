-- 10월 예약 정책 개편: 룸 권장/제한 인원 최신화
--
-- 인원은 BGM_AGIT_IMAGE 의 MIN/MAX_PEOPLE 컬럼인데 이 값을 고칠 관리 화면도 API 도 없다
-- (BgmAgitImageCreateRequest 에 인원 필드가 없고 modifyBgmAgitImage 도 건드리지 않는다).
-- 그래서 DB 직접 UPDATE 가 유일한 경로다.
--
-- 실행 시점: **앱 배포보다 먼저.** 서버에 인원 범위 검증이 새로 들어갔기 때문에
-- 옛 값(B Room 최대 4명 등)이 남아 있으면 공지대로 예약하려는 손님이 거절당한다.
--
-- BGM_AGIT_IMAGE_GROUPS 는 카드·캘린더에 그대로 찍히는 안내 문자열이라 같이 고친다.

-- UPDATE 라 여러 번 돌려도 결과가 같다.
--
-- 다만 라벨로 매칭하므로 **운영 DB 의 실제 라벨이 다르면 0건 갱신되고 조용히 지나간다.**
-- 그래서 실행 전후 상태를 같이 출력한다. 아래 "실행 전"과 "실행 후"를 눈으로 대조할 것.

SELECT '=== 실행 전 ===' AS step;
SELECT BGM_AGIT_IMAGE_ID   AS id,
       BGM_AGIT_IMAGE_LABEL AS label,
       BGM_AGIT_IMAGE_GROUPS AS groups_text,
       BGM_AGIT_IMAGE_MIN_PEOPLE AS min_p,
       BGM_AGIT_IMAGE_MAX_PEOPLE AS max_p,
       BGM_AGIT_IMAGE_USE_STATUS AS use_yn
  FROM BGM_AGIT_IMAGE
 WHERE BGM_AGIT_IMAGE_CATEGORY = 'ROOM'
 ORDER BY BGM_AGIT_IMAGE_LABEL;

START TRANSACTION;

-- B/F 룸 : 4~6인
UPDATE BGM_AGIT_IMAGE
   SET BGM_AGIT_IMAGE_MIN_PEOPLE = 4,
       BGM_AGIT_IMAGE_MAX_PEOPLE = 6,
       BGM_AGIT_IMAGE_GROUPS     = '4~6인'
 WHERE BGM_AGIT_IMAGE_CATEGORY = 'ROOM'
   AND BGM_AGIT_IMAGE_LABEL IN ('B Room', 'F Room');

-- C/D/E 룸 : 권장 2~4인, 어린이 동반 시 6인까지
--
-- MAX 를 4로 막으면 공지가 허용한 "어린이 2~6인"을 아예 예약할 수 없다.
-- 시스템은 6까지 열어두고 구분은 안내 문구로 한다(현장에서 확인).
UPDATE BGM_AGIT_IMAGE
   SET BGM_AGIT_IMAGE_MIN_PEOPLE = 2,
       BGM_AGIT_IMAGE_MAX_PEOPLE = 6,
       BGM_AGIT_IMAGE_GROUPS     = '2~4인 (어린이 동반 2~6인)'
 WHERE BGM_AGIT_IMAGE_CATEGORY = 'ROOM'
   AND BGM_AGIT_IMAGE_LABEL IN ('C Room', 'D Room', 'E Room');

-- G 룸 : 7~12인
UPDATE BGM_AGIT_IMAGE
   SET BGM_AGIT_IMAGE_MIN_PEOPLE = 7,
       BGM_AGIT_IMAGE_MAX_PEOPLE = 12,
       BGM_AGIT_IMAGE_GROUPS     = '7~12인'
 WHERE BGM_AGIT_IMAGE_CATEGORY = 'ROOM'
   AND BGM_AGIT_IMAGE_LABEL = 'G Room';

-- M-1 / M-2 / M-3 : 각 4~7인 (합쳐 예약하면 최대 21인)
UPDATE BGM_AGIT_IMAGE
   SET BGM_AGIT_IMAGE_MIN_PEOPLE = 4,
       BGM_AGIT_IMAGE_MAX_PEOPLE = 7,
       BGM_AGIT_IMAGE_GROUPS     = '4~7인 (오픈 공간)'
 WHERE BGM_AGIT_IMAGE_CATEGORY = 'ROOM'
   AND BGM_AGIT_IMAGE_LABEL IN ('M-1', 'M-2', 'M-3');

COMMIT;

SELECT '=== 실행 후 ===' AS step;
SELECT BGM_AGIT_IMAGE_ID   AS id,
       BGM_AGIT_IMAGE_LABEL AS label,
       BGM_AGIT_IMAGE_GROUPS AS groups_text,
       BGM_AGIT_IMAGE_MIN_PEOPLE AS min_p,
       BGM_AGIT_IMAGE_MAX_PEOPLE AS max_p,
       BGM_AGIT_IMAGE_USE_STATUS AS use_yn
  FROM BGM_AGIT_IMAGE
 WHERE BGM_AGIT_IMAGE_CATEGORY = 'ROOM'
 ORDER BY BGM_AGIT_IMAGE_LABEL;

-- 기대값: B/F 4~6, C/D/E 2~6('2~4인 (어린이 동반 2~6인)'), G 7~12, M-1~3 4~7.
-- min_p/max_p 가 NULL 로 남은 ROOM 이 있으면 라벨이 안 맞은 것이니 그 행은 수동으로 맞출 것.

-- 참고: 마작 대탁(BGM_AGIT_IMAGE_CATEGORY = 'MAHJONG')은 이번 개편 대상이 아니라 건드리지 않는다.
-- 숨김 항목(M Room id 19, 대탁 JP류 34·35)도 USE_STATUS='N' 이라 그대로 둔다.
