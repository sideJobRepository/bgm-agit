-- 10월 예약 정책 개편: 룸 권장/제한 인원 최신화
--
-- 방 테이블 분리(room-reservation-split.sql) 이후 기준이다. 인원은 BGM_AGIT_ROOM 의 MIN/MAX_PEOPLE,
-- 카드·캘린더에 찍히는 안내 문구는 BGM_AGIT_ROOM_GUIDE. 방 관리 화면에서도 고칠 수 있지만
-- 개편 오픈 시 한 번에 맞추려고 SQL 로 둔다.
--
-- 실행 시점: **개편 앱 배포보다 먼저.** 서버에 인원 범위 검증이 새로 들어갔기 때문에
-- 옛 값(B Room 최대 4명 등)이 남아 있으면 공지대로 예약하려는 손님이 거절당한다.
-- 선행 조건: room-reservation-split.sql 이 이미 적용돼 있어야 한다(BGM_AGIT_ROOM 이 채워져 있어야 함).
--
-- UPDATE 라 여러 번 돌려도 결과가 같다.
-- 다만 이름으로 매칭하므로 **실제 방 이름이 다르면 0건 갱신되고 조용히 지나간다.**
-- 실행 전후 상태를 같이 출력하니 눈으로 대조할 것.

SELECT '=== 실행 전 ===' AS step;
SELECT BGM_AGIT_ROOM_ID AS id, BGM_AGIT_ROOM_NAME AS name, BGM_AGIT_ROOM_GUIDE AS guide,
       BGM_AGIT_ROOM_MIN_PEOPLE AS min_p, BGM_AGIT_ROOM_MAX_PEOPLE AS max_p, BGM_AGIT_ROOM_USE_STATUS AS use_yn
  FROM BGM_AGIT_ROOM
 WHERE BGM_AGIT_ROOM_LINK = '/detail/room'
 ORDER BY BGM_AGIT_ROOM_NAME;

START TRANSACTION;

-- B/F 룸 : 4~6인
UPDATE BGM_AGIT_ROOM
   SET BGM_AGIT_ROOM_MIN_PEOPLE = 4, BGM_AGIT_ROOM_MAX_PEOPLE = 6, BGM_AGIT_ROOM_GUIDE = '4~6인'
 WHERE BGM_AGIT_ROOM_LINK = '/detail/room' AND BGM_AGIT_ROOM_NAME IN ('B Room', 'F Room');

-- C/D/E 룸 : 권장 2~4인, 어린이 동반 시 6인까지
--
-- MAX 를 4로 막으면 공지가 허용한 "어린이 2~6인"을 아예 예약할 수 없다.
-- 시스템은 6까지 열어두고 구분은 안내 문구로 한다(현장에서 확인).
UPDATE BGM_AGIT_ROOM
   SET BGM_AGIT_ROOM_MIN_PEOPLE = 2, BGM_AGIT_ROOM_MAX_PEOPLE = 6, BGM_AGIT_ROOM_GUIDE = '2~4인 (어린이 동반 2~6인)'
 WHERE BGM_AGIT_ROOM_LINK = '/detail/room' AND BGM_AGIT_ROOM_NAME IN ('C Room', 'D Room', 'E Room');

-- G 룸 : 7~12인
UPDATE BGM_AGIT_ROOM
   SET BGM_AGIT_ROOM_MIN_PEOPLE = 7, BGM_AGIT_ROOM_MAX_PEOPLE = 12, BGM_AGIT_ROOM_GUIDE = '7~12인'
 WHERE BGM_AGIT_ROOM_LINK = '/detail/room' AND BGM_AGIT_ROOM_NAME = 'G Room';

-- M-1 / M-2 / M-3 : 각 4~7인 (합쳐 예약하면 최대 21인)
UPDATE BGM_AGIT_ROOM
   SET BGM_AGIT_ROOM_MIN_PEOPLE = 4, BGM_AGIT_ROOM_MAX_PEOPLE = 7, BGM_AGIT_ROOM_GUIDE = '4~7인 (오픈 공간)'
 WHERE BGM_AGIT_ROOM_LINK = '/detail/room' AND BGM_AGIT_ROOM_NAME IN ('M-1', 'M-2', 'M-3');

COMMIT;

SELECT '=== 실행 후 ===' AS step;
SELECT BGM_AGIT_ROOM_ID AS id, BGM_AGIT_ROOM_NAME AS name, BGM_AGIT_ROOM_GUIDE AS guide,
       BGM_AGIT_ROOM_MIN_PEOPLE AS min_p, BGM_AGIT_ROOM_MAX_PEOPLE AS max_p, BGM_AGIT_ROOM_USE_STATUS AS use_yn
  FROM BGM_AGIT_ROOM
 WHERE BGM_AGIT_ROOM_LINK = '/detail/room'
 ORDER BY BGM_AGIT_ROOM_NAME;

-- 기대값: B/F 4~6, C/D/E 2~6('2~4인 (어린이 동반 2~6인)'), G 7~12, M-1~3 4~7.
-- min_p/max_p 가 NULL 로 남은 사용중 방이 있으면 이름이 안 맞은 것이니 수동으로 맞출 것.

-- 참고: 마작 대탁(BGM_AGIT_ROOM_LINK = '/detail/mahjongRental')은 이번 개편 대상이 아니라 건드리지 않는다.
-- 숨김 방(M Room id 19, 대탁 JP류 34·35)도 USE_STATUS='N' 이라 그대로 둔다.
