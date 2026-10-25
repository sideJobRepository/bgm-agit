-- 시계탑 기록 참가자의 최종 선악
--
-- 승패를 캐릭터 진영(하수인·악마=악)으로만 판정했더니, 게임 중 진영이 바뀐 판(뱀 부리는 사람과 악마 교체 등)과
-- 이야기꾼이 선악을 정하는 여행자의 승패가 틀렸다. 진행판이 게임 종료 때 좌석별 최종 선악을 같이 보낸다.
-- NULL 이면 예전처럼 캐릭터 진영대로 판정하므로 기존 기록은 그대로다.
--
-- ddl-auto: none 이라 수동 실행. 앱 배포 **전에** 돌린다(clocktower-dictionary-2026-11.sql 다음).

ALTER TABLE BGM_AGIT_CLOCKTOWER_PARTICIPANT
    ADD COLUMN BGM_AGIT_CLOCKTOWER_PARTICIPANT_EVIL CHAR(1) NULL COMMENT '최종 선악 Y/N, NULL=캐릭터 진영대로';

-- 롤백: ALTER TABLE BGM_AGIT_CLOCKTOWER_PARTICIPANT DROP COLUMN BGM_AGIT_CLOCKTOWER_PARTICIPANT_EVIL;
