-- =====================================================================
-- 시계탑 공식 스크립트 + 캐릭터 로스터 시드 (MySQL 8.0)
-- 선행 조건: create-clocktower.sql 실행되어 테이블이 존재해야 함.
-- 캐릭터명은 "한글 (English)" 형식, 역할군은 TOWNSFOLK/OUTSIDER/MINION/DEMON.
-- 각 스크립트는 게임 1행 + 캐릭터 N행으로 구성.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) 피흘리는 시계탑 (Trouble Brewing) : 마을주민 13, 외부인 4, 하수인 4, 악마 1
-- ---------------------------------------------------------------------
INSERT INTO BGM_AGIT_CLOCKTOWER_GAME
    (BGM_AGIT_CLOCKTOWER_GAME_NAME, BGM_AGIT_CLOCKTOWER_GAME_MIN_PEOPLE, BGM_AGIT_CLOCKTOWER_GAME_MAX_PEOPLE, BGM_AGIT_CLOCKTOWER_GAME_PLAY_TIME, BGM_AGIT_CLOCKTOWER_USE_STATUS, REGIST_DATE, MODIFY_DATE)
VALUES ('피흘리는 시계탑 (Trouble Brewing)', 5, 15, 60, 'Y', NOW(), NOW());
SET @tb := LAST_INSERT_ID();

INSERT INTO BGM_AGIT_CLOCKTOWER_CHARACTER
    (BGM_AGIT_CLOCKTOWER_GAME_ID, BGM_AGIT_CLOCKTOWER_CHARACTER_NAME, BGM_AGIT_CLOCKTOWER_CHARACTER_TYPE, BGM_AGIT_CLOCKTOWER_CHARACTER_DESCRIPTION, BGM_AGIT_CLOCKTOWER_CHARACTER_ORDERS, REGIST_DATE, MODIFY_DATE)
VALUES
(@tb, '세탁부 (Washerwoman)', 'TOWNSFOLK', '게임 시작 시 두 명 중 한 명이 특정 마을주민임을 알게 됩니다.', 1, NOW(), NOW()),
(@tb, '사서 (Librarian)', 'TOWNSFOLK', '게임 시작 시 두 명 중 한 명이 특정 외부인임을 알게 됩니다. 외부인이 없으면 그 사실을 알게 됩니다.', 2, NOW(), NOW()),
(@tb, '조사관 (Investigator)', 'TOWNSFOLK', '게임 시작 시 두 명 중 한 명이 특정 하수인임을 알게 됩니다.', 3, NOW(), NOW()),
(@tb, '요리사 (Chef)', 'TOWNSFOLK', '게임 시작 시 서로 인접하게 앉은 악 진영이 몇 쌍인지 알게 됩니다.', 4, NOW(), NOW()),
(@tb, '공감술사 (Empath)', 'TOWNSFOLK', '매일 밤 좌우로 살아있는 두 이웃 중 악이 몇 명인지 알게 됩니다.', 5, NOW(), NOW()),
(@tb, '점쟁이 (Fortune Teller)', 'TOWNSFOLK', '매일 밤 두 명을 선택하면 그중 악마가 있는지 알게 됩니다. 선인 한 명이 항상 악마로 표시됩니다.', 6, NOW(), NOW()),
(@tb, '장의사 (Undertaker)', 'TOWNSFOLK', '첫 밤을 제외한 매일 밤, 오늘 낮에 처형된 캐릭터가 무엇이었는지 알게 됩니다.', 7, NOW(), NOW()),
(@tb, '수도승 (Monk)', 'TOWNSFOLK', '첫 밤을 제외한 매일 밤, 자신을 제외한 한 명을 그날 밤 악마로부터 보호합니다.', 8, NOW(), NOW()),
(@tb, '까마귀지기 (Ravenkeeper)', 'TOWNSFOLK', '밤에 죽으면 한 명을 선택해 그의 캐릭터를 알게 됩니다.', 9, NOW(), NOW()),
(@tb, '처녀 (Virgin)', 'TOWNSFOLK', '처음으로 자신에게 처형을 발의한 사람이 마을주민이면 그 사람이 즉시 처형됩니다.', 10, NOW(), NOW()),
(@tb, '학살자 (Slayer)', 'TOWNSFOLK', '게임 중 한 번, 낮에 공개적으로 한 명을 지목합니다. 그가 악마라면 죽습니다.', 11, NOW(), NOW()),
(@tb, '군인 (Soldier)', 'TOWNSFOLK', '악마에게 죽지 않습니다.', 12, NOW(), NOW()),
(@tb, '시장 (Mayor)', 'TOWNSFOLK', '살아있는 사람이 셋뿐이고 그날 처형이 없으면 선 진영이 승리합니다. 밤에 죽을 때 대신 다른 사람이 죽기도 합니다.', 13, NOW(), NOW()),
(@tb, '집사 (Butler)', 'OUTSIDER', '매일 밤 자신을 제외한 한 명을 주인으로 정합니다. 다음 날 그 주인이 투표할 때만 함께 투표할 수 있습니다.', 14, NOW(), NOW()),
(@tb, '주정뱅이 (Drunk)', 'OUTSIDER', '자신을 마을주민으로 알고 있지만 실제로는 주정뱅이입니다. 능력이 작동하지 않고 정보가 틀릴 수 있습니다.', 15, NOW(), NOW()),
(@tb, '은둔자 (Recluse)', 'OUTSIDER', '선 진영이지만 악으로, 또는 하수인이나 악마로 표시될 수 있습니다.', 16, NOW(), NOW()),
(@tb, '성인 (Saint)', 'OUTSIDER', '처형당하면 선 진영이 패배합니다.', 17, NOW(), NOW()),
(@tb, '독살자 (Poisoner)', 'MINION', '매일 밤 한 명을 중독시켜 그날 밤과 다음 낮 동안 능력을 무력화합니다.', 18, NOW(), NOW()),
(@tb, '첩자 (Spy)', 'MINION', '매일 밤 전체 배치(그리무아)를 봅니다. 선으로, 또는 마을주민이나 외부인으로 표시될 수 있습니다.', 19, NOW(), NOW()),
(@tb, '주홍여인 (Scarlet Woman)', 'MINION', '살아있는 사람이 다섯 이상일 때 악마가 죽으면 당신이 악마가 됩니다.', 20, NOW(), NOW()),
(@tb, '남작 (Baron)', 'MINION', '게임에 외부인이 두 명 늘어납니다.', 21, NOW(), NOW()),
(@tb, '임프 (Imp)', 'DEMON', '첫 밤을 제외한 매일 밤 한 명을 죽입니다. 자신을 죽이면 하수인 한 명이 임프가 됩니다.', 22, NOW(), NOW());


-- ---------------------------------------------------------------------
-- 2) 분파와 폭력 (Sects & Violets) : 마을주민 13, 외부인 4, 하수인 4, 악마 4
-- ---------------------------------------------------------------------
INSERT INTO BGM_AGIT_CLOCKTOWER_GAME
    (BGM_AGIT_CLOCKTOWER_GAME_NAME, BGM_AGIT_CLOCKTOWER_GAME_MIN_PEOPLE, BGM_AGIT_CLOCKTOWER_GAME_MAX_PEOPLE, BGM_AGIT_CLOCKTOWER_GAME_PLAY_TIME, BGM_AGIT_CLOCKTOWER_USE_STATUS, REGIST_DATE, MODIFY_DATE)
VALUES ('분파와 폭력 (Sects & Violets)', 5, 15, 60, 'Y', NOW(), NOW());
SET @sv := LAST_INSERT_ID();

INSERT INTO BGM_AGIT_CLOCKTOWER_CHARACTER
    (BGM_AGIT_CLOCKTOWER_GAME_ID, BGM_AGIT_CLOCKTOWER_CHARACTER_NAME, BGM_AGIT_CLOCKTOWER_CHARACTER_TYPE, BGM_AGIT_CLOCKTOWER_CHARACTER_DESCRIPTION, BGM_AGIT_CLOCKTOWER_CHARACTER_ORDERS, REGIST_DATE, MODIFY_DATE)
VALUES
(@sv, '시계공 (Clockmaker)', 'TOWNSFOLK', '게임 시작 시 악마와 가장 가까운 하수인 사이의 자리 간격을 알게 됩니다.', 1, NOW(), NOW()),
(@sv, '몽상가 (Dreamer)', 'TOWNSFOLK', '매일 밤 한 명을 선택하면 선 캐릭터 하나와 악 캐릭터 하나가 제시되며 그중 하나가 그의 정체입니다.', 2, NOW(), NOW()),
(@sv, '뱀 조련사 (Snake Charmer)', 'TOWNSFOLK', '매일 밤 한 명을 선택합니다. 그가 악마라면 서로의 역할이 뒤바뀌고 당신은 중독됩니다.', 3, NOW(), NOW()),
(@sv, '수학자 (Mathematician)', 'TOWNSFOLK', '매일 밤 오늘 능력이 비정상적으로 작동한 캐릭터 수를 알게 됩니다.', 4, NOW(), NOW()),
(@sv, '꽃집 소녀 (Flowergirl)', 'TOWNSFOLK', '첫 밤을 제외한 매일 밤, 오늘 낮에 악마가 투표했는지 알게 됩니다.', 5, NOW(), NOW()),
(@sv, '마을 전령 (Town Crier)', 'TOWNSFOLK', '첫 밤을 제외한 매일 밤, 오늘 하수인이 처형을 발의했는지 알게 됩니다.', 6, NOW(), NOW()),
(@sv, '신탁 (Oracle)', 'TOWNSFOLK', '첫 밤을 제외한 매일 밤, 죽은 사람 중 악이 몇 명인지 알게 됩니다.', 7, NOW(), NOW()),
(@sv, '석학 (Savant)', 'TOWNSFOLK', '낮마다 스토리텔러에게서 정보 두 개를 받을 수 있으며 하나는 참, 하나는 거짓입니다.', 8, NOW(), NOW()),
(@sv, '재봉사 (Seamstress)', 'TOWNSFOLK', '게임 중 한 번, 밤에 두 명을 선택해 둘이 같은 진영인지 알게 됩니다.', 9, NOW(), NOW()),
(@sv, '철학자 (Philosopher)', 'TOWNSFOLK', '게임 중 한 번, 밤에 선 캐릭터 하나를 골라 그 능력을 얻습니다. 그 캐릭터가 실재하면 중독됩니다.', 10, NOW(), NOW()),
(@sv, '예술가 (Artist)', 'TOWNSFOLK', '게임 중 한 번, 낮에 스토리텔러에게 예 또는 아니오로 답할 질문을 합니다.', 11, NOW(), NOW()),
(@sv, '저글러 (Juggler)', 'TOWNSFOLK', '첫째 날 여러 명의 캐릭터를 공개적으로 추측하면 다음 밤에 맞힌 개수를 알게 됩니다.', 12, NOW(), NOW()),
(@sv, '현자 (Sage)', 'TOWNSFOLK', '악마에게 죽으면 두 명을 제시받고 그중 하나가 악마임을 알게 됩니다.', 13, NOW(), NOW()),
(@sv, '돌연변이 (Mutant)', 'OUTSIDER', '자신이 외부인임을 드러내면 처형될 수 있습니다.', 14, NOW(), NOW()),
(@sv, '연인 (Sweetheart)', 'OUTSIDER', '죽으면 그 뒤로 한 명이 계속 중독됩니다.', 15, NOW(), NOW()),
(@sv, '이발사 (Barber)', 'OUTSIDER', '죽으면 그날 밤 악마가 두 명의 캐릭터를 서로 맞바꿀 수 있습니다.', 16, NOW(), NOW()),
(@sv, '얼간이 (Klutz)', 'OUTSIDER', '죽으면 즉시 한 명을 공개로 지목해야 하며 그가 악이면 선 진영이 패배합니다.', 17, NOW(), NOW()),
(@sv, '사악한 쌍둥이 (Evil Twin)', 'MINION', '선 진영의 한 명과 쌍둥이가 되어 서로의 정체를 압니다. 쌍둥이가 처형되면 악이 승리합니다.', 18, NOW(), NOW()),
(@sv, '마녀 (Witch)', 'MINION', '매일 밤 한 명을 저주합니다. 그가 다음 날 처형을 발의하면 죽습니다.', 19, NOW(), NOW()),
(@sv, '세레노버스 (Cerenovus)', 'MINION', '매일 밤 한 명에게 특정 캐릭터인 척하도록 강요하며 따르지 않으면 처형될 수 있습니다.', 20, NOW(), NOW()),
(@sv, '구덩이 마녀 (Pit-Hag)', 'MINION', '매일 밤 한 명을 다른 캐릭터로 바꿉니다.', 21, NOW(), NOW()),
(@sv, '팡구 (Fang Gu)', 'DEMON', '첫 밤을 제외한 매일 밤 한 명을 죽입니다. 외부인을 처음 죽이면 대신 그가 팡구가 되고 당신은 죽습니다.', 22, NOW(), NOW()),
(@sv, '노 다시 (No Dashii)', 'DEMON', '첫 밤을 제외한 매일 밤 한 명을 죽입니다. 좌우로 인접한 마을주민들이 중독됩니다.', 23, NOW(), NOW()),
(@sv, '비고르모티스 (Vigormortis)', 'DEMON', '첫 밤을 제외한 매일 밤 한 명을 죽입니다. 죽인 하수인은 능력을 유지하고 그 옆의 마을주민이 중독됩니다.', 24, NOW(), NOW()),
(@sv, '보르톡스 (Vortox)', 'DEMON', '첫 밤을 제외한 매일 밤 한 명을 죽입니다. 마을주민의 정보가 모두 거짓이 되며 처형이 없는 날에는 악이 승리합니다.', 25, NOW(), NOW());
