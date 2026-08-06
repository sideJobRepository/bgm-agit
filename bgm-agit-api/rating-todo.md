# 운영 db 작업 필요

## DDL
```sql
create table BGMAGIT.BGM_AGIT_RATING
(
    BGM_AGIT_RATING_ID     bigint auto_increment comment 'BGM 아지트 레이팅 ID'
        primary key,
    BGM_AGIT_SEASON_ID     bigint        not null comment 'BGM 아지트 시즌 ID',
    BGM_AGIT_MATCHS_ID     bigint        not null comment 'BGM 아지트 대국 ID',
    BGM_AGIT_MEMBER_ID     bigint        not null comment 'BGM 아지트 회원 ID',
    BGM_AGIT_RATING_VALUE  decimal(6, 2) null comment 'BGM 아지트 레이팅 값',
    BGM_AGIT_RATING_RESULT decimal(6, 2) null comment 'BGM 아지트 레이팅 결과',
    REGIST_DATE            datetime      null comment '생성 일시',
    MODIFY_DATE            datetime      null comment '수정 일시',
    constraint FK_BGM_AGIT_SEASON_TO_BGM_AGIT_RATING
        foreign key (BGM_AGIT_SEASON_ID) references BGMAGIT.BGM_AGIT_SEASON (BGM_AGIT_SEASON_ID)
)
    comment 'BGM_아지트_레이팅';


create table BGMAGIT.BGM_AGIT_SEASON
(
    BGM_AGIT_SEASON_ID              bigint auto_increment comment 'BGM 아지트 시즌 ID'        primary key,
    BGM_AGIT_SEASON_NAME            varchar(500)                 not null comment 'BGM 아지트 시즌 이름',
    BGM_AGIT_SEASON_START_DATE      date                         null comment 'BGM 아지트 시즌 시작 일시',
    BGM_AGIT_SEASON_END_DATE        date                         null comment 'BGM 아지트 시즌 종료 일시',
    BGM_AGIT_SEASON_PROGRESS_STATUS varchar(500)                 null comment 'BGM 아지트 시즌 진행 상태',
    BGM_AGIT_SEASON_RESET_TYPE      varchar(500)                 null comment 'BGM 아지트 시즌 리셋 타입',
    BGM_AGIT_SEASON_CARRY_RATE      decimal(5, 2)                null comment 'BGM 아지트 시즌 계승 비율',
    BGM_AGIT_SEASON_BASE_RATING     int           default 1000   not null comment 'BGM 아지트 시즌 기준 레이팅',
    BGM_AGIT_SEASON_FIRST_SCORE     decimal(6, 2) default 60.00  not null comment 'BGM 아지트 시즌 1등 점수',
    BGM_AGIT_SEASON_SECOND_SCORE    decimal(6, 2) default 20.00  not null comment 'BGM 아지트 시즌 2등 점수',
    BGM_AGIT_SEASON_THIRD_SCORE     decimal(6, 2) default -20.00 not null comment 'BGM 아지트 시즌 3등 점수',
    BGM_AGIT_SEASON_FOURTH_SCORE    decimal(6, 2) default -60.00 not null comment 'BGM 아지트 시즌 4등 점수',
    BGM_AGIT_SEASON_EAST_MULTIPLE   decimal(5, 2) default 1.00   not null comment 'BGM 아지트 시즌 동 배수',
    BGM_AGIT_SEASON_SOUTH_MULTIPLE  decimal(5, 2) default 1.00   not null comment 'BGM 아지트 시즌 남 배수',
    BGM_AGIT_SEASON_WEST_MULTIPLE   decimal(5, 2) default 1.00   not null comment 'BGM 아지트 시즌 서 배수',
    BGM_AGIT_SEASON_NORTH_MULTIPLE  decimal(5, 2) default 1.00   not null comment 'BGM 아지트 시즌 북 배수',
    BGM_AGIT_SEASON_USE_STATUS      varchar(1)    default 'Y'    not null comment 'BGM 아지트 시즌 사용 여부'
)
    comment 'BGM_아지트_시즌';


create table BGMAGIT.BGM_AGIT_SEASON_STANDING
(
    BGM_AGIT_SEASON_STANDING_ID     bigint auto_increment comment 'BGM 아지트 시즌 현황 ID'
        primary key,
    BGM_AGIT_SEASON_ID              bigint        not null comment 'BGM 아지트 시즌 ID',
    BGM_AGIT_MEMBER_ID              bigint        not null comment 'BGM 아지트 회원 ID',
    BGM_AGIT_SEASON_STANDING_RATING decimal(6, 2) null comment 'BGM 아지트 시즌 현황 레이팅',
    REGIST_DATE                     datetime      null comment '생성 일시',
    MODIFY_DATE                     datetime      null comment '수정 일시',
    constraint FK_BGM_AGIT_SEASON_TO_BGM_AGIT_SEASON_STANDING
        foreign key (BGM_AGIT_SEASON_ID) references BGMAGIT.BGM_AGIT_SEASON (BGM_AGIT_SEASON_ID)
)
    comment 'BGM_아지트_시즌_현황';

create table BGMAGIT.BGM_AGIT_TIER
(
    BGM_AGIT_TIER_ID         bigint auto_increment comment 'BGM 아지트 등급 ID'
        primary key,
    BGM_AGIT_SEASON_ID       bigint       not null comment 'BGM 아지트 시즌 ID',
    BGM_AGIT_TIER_NAME       varchar(500) not null comment 'BGM 아지트 등급 이름',
    BGM_AGIT_TIER_MIN_RATING int          null comment 'BGM 아지트 등급 최소 레이팅',
    REGIST_DATE              datetime     null comment '생성 일시',
    MODIFY_DATE              datetime     null comment '수정 일시',
    constraint FK_BGM_AGIT_SEASON_TO_BGM_AGIT_TIER
        foreign key (BGM_AGIT_SEASON_ID) references BGMAGIT.BGM_AGIT_SEASON (BGM_AGIT_SEASON_ID)
)
    comment 'BGM_아지트_등급';

```

## 시즌 관리, 티어 관리 API 권한 등록

```sql
INSERT INTO BGM_AGIT_URL_RESOURCES (BGM_AGIT_URL_RESOURCES_PATH, BGM_AGIT_URL_HTTP_METHOD, REGIST_DATE)
VALUES ('/bgm-agit/rating/seasons',            'POST',   NOW()),
       ('/bgm-agit/rating/seasons/{seasonId}', 'PUT',    NOW()),
       ('/bgm-agit/rating/seasons/{seasonId}', 'DELETE', NOW()),
       ('/bgm-agit/rating/seasons/{seasonId}/start', 'POST', NOW()),
       ('/bgm-agit/rating/seasons/{seasonId}/close', 'POST', NOW()),
       ('/rating/seasons/{seasonId}/tiers', 'PUT', NOW());

-- BGM_AGIT_URL_RESOURCES_ROLE 에도 추가
```