# 시계탑(Blood on the Clocktower) — 캐릭터 사전 · 스크립트 · 이야기꾼 마도서 · 기록

> 매장에서 우리끼리 게임하고 기록하는 **비상업 내부 용도**다. 원작사 권리·이용약관 이야기는 꺼내지 않고, 고지 문구·CCC 로고도 넣지 않는다(사용자 결정 2026-10-25).
> 프론트 `bgm-agit-front/src/components/clocktower/CLAUDE.md` 가 이 파일을 불러온다. 루트 `CLAUDE.md` 의 "시계탑 기록 = 자체로그인 전용" 절도 함께 볼 것.

## 구성 한눈에

| 영역 | 백엔드 (`origin/clocktower`) | 프론트 (`bgm-agit-front/src`) |
|---|---|---|
| 게임(=스크립트) 카탈로그 | `BgmAgitClockTowerGame*` | `pages/ClockTowerGames.tsx`, `ClockTowerGameDetail.tsx` |
| 캐릭터 사전·공식 데이터 가져오기·스크립트 JSON 등록 | `BgmAgitClockTowerRole*`, `ClockTowerRoleWriter`, `util/ClockTowerOfficialData(Client)`, `util/ClockTowerScriptParser` | `pages/ClockTowerRoles.tsx`(관리자, `/clocktower-roles`) |
| 커스텀 시계탑 시트 주소 불러오기 | `util/VnamuScriptFetcher`, `BgmAgitClockTowerScriptFetchController` | 사전 화면 스크립트 등록 칸 |
| 이야기꾼 마도서(그리모어) | `GET /clocktower-games/{id}/grimoire`(묶음 조회만) | `pages/ClockTowerGrimoire.tsx`(`/clocktower-grimoire`), `components/clocktower/grimoire/*` |
| 플레이 기록·통계 | `BgmAgitClockTowerRecord*`, `Participant`, `Stats*` | `pages/ClockTowerRecord*.tsx`, `ClockTowerHistory/Stats.tsx` |

진영 표시 규칙(이름·색·좌석 여부)은 프론트 `config/clocktower.ts` 한 곳, 서버는 `entity/enumeration/ClockTowerCharacterType`(`isEvil`·`isSeatable`·`fromTeam`).

## 공식 데이터 (손으로 넣지 않는다)

- 캐릭터 `https://release.botc.app/resources/data/roles.json`(181개), 밤 순서 `nightsheet.json`, 징크스 `jinxes.json`, 공식 한국어 `ThePandemoniumInstitute/botc-translations` 의 `game/ko.json`
- 관리자 [공식 데이터 가져오기] = `POST /bgm-agit/clocktower-roles/import` → 사전·징크스 upsert + 기본 3종(`tb/bmr/snv`, 한국어 점철되는 혼란 / 피로 물든 달 / 화단에 꽃피운 이단) 게임 생성·갱신
  - 외부 호출은 트랜잭션 밖(`importOfficial` NOT_SUPPORTED), 쓰기만 `ClockTowerRoleWriter.apply` 트랜잭션. 변환이 전부 성공해야 쓴다 → 형식이 바뀌어도 기존 사전은 그대로
  - 관리자가 고친 한글 문구(`CUSTOM_EDITED='Y'`)는 덮어쓰지 않는다. 사전 문구가 바뀌면 그 캐릭터를 쓰는 게임 캐릭터 행도 맞춘다(`syncCharacters`)
- **함정: 징크스 번역 키는 두 id 를 알파벳순 정렬해 잇는다**(`drunk-mathematician`). 주인-대상 순서로 찾으면 131개 중 63개만 한글이 된다 → `ClockTowerOfficialData.jinxKey`
- 리마인더 번역 키 = 영문 문구를 소문자 영숫자만 남긴 값(`"3 Attacks"`→`3attacks`, `ClockTowerScriptParser.normalizeKey`)
- 밤 순서는 nightsheet 배열 인덱스(1부터). 특수 단계 `dusk/minioninfo/demoninfo/dawn` 은 사전에 team=null, edition=`night` 로 들어간다
- 이미지: 공식 `release.botc.app/resources/characters/<edition>/<id>_g|_e.webp`(181개 전부, 선악 두 장은 156개, `generic` 폴더에 진영 기본)를 **우리 S3 에 복사**해서 쓴다(관리자 화면에서 30개씩 순차 복사 — nginx 타임아웃 때문)
  - 경로 규칙은 `util/ClockTowerImagePaths` 한 곳(주민·외지인·하수인·악마 `_g`+`_e`, 여행자 무접미+`_g`+`_e`, 전설·로릭 무접미, generic 22장). S3 키 `clocktower/characters/{같은 경로}`, `S3FileUtils.putAt`(고정 키라 다시 올려도 주소가 같다)
  - `ClockTowerImageSyncService`: 상태 `GET /clocktower-roles/images/status` → `{total, done, missing, paths}`, 복사 `POST .../images/sync {paths≤30, force}`. 원본 호스트 고정 + 경로 정규식 + 상태 목록 화이트리스트(SSRF 방지), 장당 재시도 2회, `image/webp` 만, 요청당 20초 예산(넘으면 NOT_RUN → 화면이 다음 묶음에 다시 넣는다). 원본 404 는 SKIPPED
  - 사전 컬럼 `IMAGE_URL/IMAGE_GOOD_URL/IMAGE_EVIL_URL/IMAGE_SYNCED_AT` — 공식 데이터 가져오기(`applyOfficial`)는 안 건드린다. 자작 캐릭터는 스크립트 JSON `image` 원본 주소 그대로(http(s)·500자·svg 거부, 배열은 [기본 진영, 뒤집힌 진영], 여행자 [무진영, 선, 악])
  - **토큰 모양은 포켓 그리모어식**(2026-10-26 사용자 참고 이미지). 좌석 토큰 = 양피지색 원 + 그림 + 아래 테두리를 따라 휜 캐릭터 이름(`CurvedText`) + 왼쪽 위 자리 번호 배지. 리마인더·믿는 캐릭터(`ReminderToken`) = 남색 원 + 위쪽 휜 캐릭터 이름 + 그림 + 아래쪽 휜 문구, 토큰 가장자리에 걸쳐 원 중심 쪽 **좌우 대각선**으로 번갈아 붙는다(정면은 위쪽 자리의 이름을 가려서 비움). 크기는 원 지름·인원에 맞춘다(`seatTokenSize`, 리마인더 0.64배). 리마인더 출처는 캐릭터 **이름**으로 저장돼 있어 `reminderSourceRole` 이 이름으로 찾는다. 밤 순서·밤 진행 카드·셋업 고르기·징크스·전설 탭에도 캐릭터 그림
  - 마도서 토큰은 `grimoire/tokenImage.ts` — 좌석의 **실제 선악**으로 `_g/_e`, 안 뜨면 generic → 글자 토큰. 낮 화면엔 그림 없음, 사망은 흑백. 끄기: 프론트 `CT_IMAGES_ENABLED`, 서버 `clocktower.images-enabled=false`(앱 재시작)

## 데이터 모델

- `BGM_AGIT_CLOCKTOWER_ROLE`(사전) — `ROLE_KEY` UNIQUE = 공식 영문 id. **자작 캐릭터는 `g{게임ID}:{id}`** 로 저장해 공식과 안 겹치게. `BGM_AGIT_CLOCKTOWER_GAME_ID` 는 자작 캐릭터 소속 스크립트(공식은 null)
- `BGM_AGIT_CLOCKTOWER_JINX`(ROLE_A, ROLE_B UNIQUE)
- `BGM_AGIT_CLOCKTOWER_GAME` + `SOURCE`(MANUAL/OFFICIAL/CUSTOM)·`SCRIPT_KEY`(tb/bmr/snv)·`AUTHOR`. 스크립트를 새 테이블로 만들지 않은 건 기록·통계가 이미 게임 id 를 보기 때문
- `BGM_AGIT_CLOCKTOWER_CHARACTER` + `ROLE_KEY`(사전 연결, 직접 입력은 null). **게임 수정·재가져오기는 캐릭터 행을 지우고 새로 만든다 → characterId 가 바뀐다**
  - 그래서 기록 저장은 참가자 `roleKey` 를 같이 받아 서버가 `(gameId, roleKey)` 로 다시 찾는다(`BgmAgitClockTowerRecordServiceImpl.resolveCharacter` — 이 게임 소속 characterId 우선, 못 찾으면 400). 마도서도 진입 때 grimoire 를 다시 받아 key 기준으로 characterId 를 갱신한다
  - 게임 수정 폼은 `roleKey` 를 그대로 돌려보내야 사전 연결이 유지된다(`ClockTowerCharacterInput.roleKey`)
- 참가자 `BGM_AGIT_CLOCKTOWER_PARTICIPANT_EVIL`(Y/N, null=캐릭터 진영대로) — 승패는 `Participant.resolveEvil()`(직접 지정 우선, 여행자·전설·로릭은 null=승패 없음). 승패 계산은 `ClockTowerParticipantResponse` 한 곳뿐이고 통계 쿼리는 승패를 안 쓴다
- 기록 메모는 **TEXT**(예전 varchar(100) 이라 마도서 메모를 붙이면 저장이 통째로 실패했다). 서버 `@Size(5000)`, 화면 maxLength 5000
- 진영 enum 에 `TRAVELLER/FABLED/LORIC`. 전설·로릭은 좌석 캐릭터가 아니라 기록 참가자 선택지에서 뺀다(`isSeatableType`)

## API·권한

| 메서드·경로 | 권한 |
|---|---|
| `GET /clocktower-games`, `/simple`, `/{id}` | 공개 |
| `POST /clocktower-games`, `PUT·DELETE /clocktower-games/{id}` | 관리자(컨트롤러 `requireAdmin` + URL 매핑). **2026-10-25 전엔 둘 다 없어 누구나 등록·삭제할 수 있었다** |
| `POST /clocktower-roles/import`, `GET /clocktower-roles`, `PUT /clocktower-roles/{id}(/reset)`, `POST /clocktower-games/script` | 관리자 |
| `GET /clocktower-games/script/fetch?url=` | 관리자. 매핑은 **정확 경로로만** — `/clocktower-games/**` GET 을 걸면 공개 조회가 막힌다 |
| `GET /clocktower-games/{id}/grimoire` | 로그인(이야기꾼은 그때그때 다르다) |
| 이미지 상태·복사 `/clocktower-roles/images/**` | 관리자 |

- URL_RESOURCES 에 없는 경로는 기본 permit — 새 관리자 API 는 매핑 SQL 필수 + **앱 재시작**
- 커스텀 시계탑 시트(`botc.vnamu.com`): `/sheets/{번호}`(페이지의 `/api/download-json/{slug}` 링크를 찾음) · `/sheet/{slug}` · 내려받기 주소를 받는다. 그 사이트만 허용하고 요청 주소는 slug 로 다시 만든다(SSRF 방지). 등록은 하지 않고 이름·JSON 을 돌려줘 화면이 입력칸을 채운다
- 스크립트 JSON 파서: 문자열 id 와 `{"id":…}` 혼용, 표기 차이 정규화(`fortune_teller`=`fortuneteller`), `_meta`(이름·작성자), id 외 필드가 있는 객체 = 자작 캐릭터 후보. 사전에 없는 id 는 목록으로 400

## 이야기꾼 마도서 (프론트)

- **진행 상태는 이 기기 localStorage 에만**(키 `clocktowerGrimoire_v1`, 상태 안 `version` 으로 구분 — 지금 v2). 서버에 두면 누가 악마인지 조회될 수 있다. 버전을 올리면 마이그레이션하고 **절대 버리지 않는다**(모르는 버전은 백업 키로 복사)
- **판은 회원별 키**(`clocktowerGrimoire_v1_m{회원id}`, 2026-10-26). 예전엔 기기에 한 판뿐이라 매장 태블릿에 다른 이야기꾼이 로그인하면 앞 판을 지워야 시작할 수 있었다. 옛 한 판짜리 키는 그 판 주인(또는 주인 없는 판)이 처음 열 때 회원 키로 옮긴다(`migrateLegacy`), 남의 판은 건드리지 않는다
- **셋업 단계 안내**(`SetupWizard`, `bagRules.ts`) — 셋업 중이고 아직 아무도 앉지 않았으면 마도서 위에 뜬다. ① 인원(여행자 제외, 5~15) — 고르면 진영별 추천 수와 공식 분배표가 나온다. 나눠 주기 전까지 자리 수와 맞아야 한다(상태 `setupPlayers`) ② 캐릭터 주머니(직접 고르기·[무작위로 채우기]). **주정뱅이·꼭두각시·미치광이를 넣으면 이야기꾼에게 "받을 캐릭터를 고르세요"를 띄우고, 플레이어는 그 정상 캐릭터를 뽑은 것으로 받는다**(사용자 결정 — 주정뱅이는 외부인 칸을 차지하고 받는 마을주민은 주머니에 안 들어간다, 공식 규칙과 같음) ③ 악마의 속임수 3개(주머니·믿는 캐릭터와 안 겹치게, 7명 미만이면 건너뜀) ④ [캐릭터 무작위로 나눠 주고 휴대폰으로 보내기] — **자리(좌석 순서)는 그대로, 캐릭터만 무작위**(사용자 결정). 누르는 순간 처음으로 누가 무엇인지 정해지고 악 팀 정보까지 한 번에 보낸다. 꼭두각시는 나눈 뒤 악마 옆자리 사람과 캐릭터를 맞바꾼다. 주머니는 상태 `bag`(v2 안 선택 필드). 안내가 떠 있는 동안 툴바 [무작위 배정]·[휴대폰으로 배정 보내기]는 숨긴다(나눈 뒤 다시 보이고, 손님 위주 진행용으로 남겨 둠)
- 되돌리기(`useGrimoire.update`) 최근 30개. 메모·이름 입력·밤 체크처럼 자주 바뀌는 건 `updateSilently`(기록 안 남김). 갱신 함수 안에서 기록을 쌓으면 StrictMode 가 두 번 쌓으므로 ref 로 최신 상태를 들고 바깥에서 계산한다
- 좌석은 **어디서나 원형**(사용자 결정 2026-10-26 — 예전엔 세로·휴대폰이 좌석 목록). 가로는 원 + 오른쪽 패널, 세로·좁은 화면(`NARROW`)은 패널이 원 아래로 내려가고 원은 폭을 다 쓴다. 600px 이하는 좌석을 0.72배로 줄인다. **공통 `Wrapper` 는 데스크톱 min-width 1280px 이라 iPad 가로(1180~1366)에서 가로 스크롤이 생긴다 → 마도서는 자체 전체 폭 컨테이너**
- **마도서만 어두운 테마**(루트 CSS 변수 `--ct-*`, 진영 색은 대비 통과 `CT_TYPE_COLOR_DARK`) + [몰입 모드](Layout 헤더·푸터 숨김 + 전체화면). 다른 시계탑 화면은 사이트 색 그대로
  - 루트는 `grimoire.styles.ts` 의 `GrimoireRoot`(색 변수·전체 폭·dvh). 마도서 하위 컴포넌트에 색을 새로 쓸 때는 hex 대신 `var(--ct-*)`. 모달은 portal 이 아니라 루트 안에 그려서 변수가 그대로 먹는다
  - 몰입 모드는 recoil `layoutModeState`('normal'|'immersive', `recoil/state/layoutState.ts`) — `Layout` 이 immersive 면 머리·메뉴·푸터·설치 배너를 안 그린다. 켜고 끄기·전체화면·html 배경/theme-color 는 `grimoire/useImmersiveMode.ts` 한 곳이고, **언마운트 때 normal 복구 + 전체화면 종료**. 전체화면은 클릭 핸들러에서 바로 `document.documentElement` 에 요청(iPhone 은 지원 안 해 버튼 숨김). 마지막 선택은 localStorage `clocktowerGrimoireImmersive`
- **포켓 그리모어에서 가져온 것**(2026-10-26): ① [정보 카드](`InfoCards.tsx`) — 공식 정보 토큰 문장(이 사람이 악마입니다·당신의 하수인들입니다·이 캐릭터들은 게임에 없습니다·능력을 사용하시겠습니까? 등) + 캐릭터·플레이어를 전체 화면으로 ② 밤 진행의 하수인·악마 정보 단계에 [보여주기] 단축 버튼(`evilInfoCards`) ③ 사망 수의(토큰 위 검은 띠) ④ 플레이어 휴대폰 진동(새 캐릭터 도착) ⑤ 시작 화면 [지난 판 참가자 그대로 넣기]·최근 함께한 사람(이 기기·이야기꾼별 localStorage `clocktowerRecentPlayers_m{id}`, 회원만) ⑥ 나눠 준 뒤 셋업 중이면 "휴대폰 확인 n/m명 — 아직: …" + [첫날 밤 시작] 안내줄. 보여주기 카드(`ShowCard`)는 다른 창 위에 오도록 맨 뒤에 그린다
- **주정뱅이·꼭두각시·미치광이 토큰**(2026-10-26 사용자 요청) — 토큰에는 **믿는 캐릭터** 그림·이름, 진짜 캐릭터는 리마인더 "주정뱅이입니다"로 붙인다(포켓 그리모어식). 테두리 색·모양은 진짜 진영. **밤 순서도 믿는 캐릭터 차례에 깨운다**("(실제 주정뱅이)" 표시) — 본인은 그 캐릭터인 줄 안다
- **셋업 캐릭터 추천 수 자동 반영**(`bagRules.SETUP_MODIFIERS`·`adjustedCounts`) — 남작 외지인 +2, 대부 ±1(선택), 팡 구 +1, 비고르모르티스 -1, 열기구 조종사·둔세자·카잘리·티폰의 군주(선택), 릴 몬스타 하수인 +1, 무신론자 악 없음, 소환사 악마 없음. 늘어난 만큼 마을주민이 준다. 선택은 주머니 칸 `setupChoice`. [무작위로 채우기]는 악마·하수인부터 뽑아 바뀐 수로 외지인·마을주민을 채운다. 성가대 소년·사냥꾼·마을 백치·잔·현상금 사냥꾼·군단은 수 변화가 아니라 직접 처리(안내만). 보초는 전설이라 주머니에 없다
- 세로 화면에서 위·아래 좌석이 원 밖으로 나와 툴바·패널과 겹쳐서 원에 토큰 크기만큼 위아래 여백을 준다
- **마도서 전체화면**(툴바 [전체화면], 2026-10-26) — 툴바·패널·안내를 숨기고 원형 마도서만 화면 높이까지 키운다(포켓 그리모어처럼 플레이어에게 마도서를 보여줄 때). 위에 [전체화면 끝내기]만. 좌석 메뉴는 그대로, 가운데에 악마의 속임수도 보인다. 몰입 모드를 이 기능이 켰으면 끝낼 때 같이 끈다
- **리마인더 끌어서 옮기기**(2026-10-26, 포켓 그리모어) — 리마인더 `pos`(토큰 중심 기준 토큰 지름 단위). 8px 넘게 움직여야 끌기, 아니면 누른 것(그 자리 좌석 메뉴). 놓을 때 한 번만 저장(되돌리기 가능). [더보기]→[리마인더 위치 원래대로]. **좌석 토큰은 끌지 않는다** — 써 보니 [자리 바꾸기]가 낫다(사용자 결정). 낮 토론 타이머도 넣었다가 뺐다(휴대폰 타이머로 충분)
- **툴바**: 되돌리기·정보 카드·낮 화면·밤 시작/끝내기만 밖에, 나머지는 [더보기](`ToolbarMenu.tsx`, 진행/자리/화면/게임 묶음)
- **밤 순서**: 그 외 밤에 이전에 죽은 캐릭터는 숨김(오늘 밤 사망은 남기고 표시, [죽은 캐릭터도 보기]), 7명 미만 하수인·악마 정보는 흐리게 "하지 않습니다", 줄을 누르면 그 단계부터 밤 진행, 목록 아래 [밤 끝내기], 체크 비우기 없음(새 밤이 비운다). 밤 진행 카드에 능력 도우미 — 장의사 처형된 캐릭터 자동, 초공감자·요리사 참고값(실제 선악만, 중독·오등록은 이야기꾼 판단), 큰 숫자 0~5·예/아니오(`ShowContent.big`), 캐릭터별 정보 카드(`INFO_PRESET`)
- 낮 화면(플레이어에게 보이는 화면)에는 캐릭터·리마인더·선악·악마의 속임수·판정 제안을 절대 노출하지 않는다

### 규칙 처리 원칙
- **자동은 제안·경고까지, 확정은 이야기꾼 버튼.** 승패·사망·캐릭터/선악 변경·처형 집행은 버튼으로만. 제안에는 근거 문구 + 공식 위키 링크
- 산술(필요 표 수, 분배표, 밤 순서, 기록)은 자동으로 해도 된다
- **캐릭터가 바뀌어도 선악은 그대로**(공식 용어집 Alignment). 게임 중 캐릭터를 바꾸면 바꾸기 직전 선악을 `evil` 에 명시값으로 고정한다. 선악도 같이 바뀌는 건 팡 구·소환사·카잘리·티폰의 군주(악), 뱀 조련사(맞교환)뿐
- 주정뱅이·꼭두각시·미치광이는 `roleKey`=실제, `believedRoleKey`=본인이 믿는 캐릭터. **[본인에게 보여주기]는 믿는 캐릭터를 보여줘야 한다**(실제를 보여주면 정체가 드러난다). 기록은 실제 캐릭터로
- 무작위 배정은 주머니에 넣지 않는 캐릭터(special `bag-disabled`: 주정뱅이·꼭두각시·릴 몬스타)를 뽑지 않는다. 비여행자 16명 이상은 거절(15 초과는 여행자)

### 인원 셈 — 용도마다 다르다 (공식 근거)
| 함수 | 셈 | 쓰는 곳 |
|---|---|---|
| totalPlayers | 떠나지 않은 전체(사망·여행자 포함) | 여행자 추방 정족수 ceil(/2) |
| aliveAll | 생존(여행자 포함) | 처형 필요 표 ceil(/2), 시장 3명, 광신자 5명 |
| aliveNonTraveller | 생존(여행자 제외) | 악 승리(2명), 탕녀(악마가 **죽기 직전** 5명 이상) |
| baseSeatCount | 여행자 제외 좌석 | 인원별 진영 분배표 |
| evilInfoCount | 설정값(공식 문장 없음, 기본 여행자 포함) | 첫날 하수인·악마 정보 7인 판정 |

- 처형은 하루 최대 1회, 처형≠사망(처형돼도 살 수 있고 죽은 사람도 처형될 수 있다). 여행자는 처형이 아니라 **추방**(유령 투표를 안 쓰고 능력의 영향을 받지 않는다)
- 동시에 양쪽 승리 조건이면 선 승리. 배교자(맑음)는 결과를 뒤집는다

## 플레이어 휴대폰 "내 캐릭터" (2026-10-25)

- **참가자는 전원 회원**(사용자 결정 — 회원가입 강제). 마도서 시작 화면은 닉네임 검색(·지난 판 참가자·최근 함께한 사람)으로만 넣는다. 관리자 테스트용 [N명까지 채우기](손님 자리)는 2026-10-26 없앴다
- **참가자 검색은 `GET /clocktower-members?keyword=`**(시계탑 전용, 로그인 회원). 자체로그인(MAHJONG) 회원 **전체**를 **닉네임**으로만 찾고 응답은 `{id, nickname}` 뿐이다. 공용 `/all-members` 는 마작 이용 'Y' 만 나와 메인 사이트 가입자를 못 찾는다 — 마도서·시계탑 기록 화면 둘 다 이걸 쓴다. 카카오·네이버 로그인 회원은 나오지 않는다(자체로그인 가입 필요)
- 흐름: 이야기꾼 [휴대폰으로 배정 보내기] → `POST /clocktower-sessions` → 플레이어는 스크립트 QR(`/clocktower-my?game=`)로 들어와 **누르고 있는 동안만** 자기 캐릭터를 본다 → 마도서 토큰에 ✓ 확인 / 미확인
- 서버에는 **각자에게 보여줄 것만** 올린다(`BGM_AGIT_CLOCKTOWER_SESSION`, `_SESSION_SEAT`). 주정뱅이·꼭두각시·미치광이는 믿는 캐릭터만, **선악도 보내지 않는다**(진짜 기준 선악을 붙이면 "주민 + 악 배지"로 정체가 드러난다 — `usePhoneSession.phoneSeats`). 진행 상태 전체는 여전히 마도서 localStorage
- 게임 중 보여줄 캐릭터·선악·정보가 바뀌면 바뀐 좌석만 자동으로 `PUT /{id}/seats`(1.5초 디바운스). 플레이어 화면에 "바뀌었습니다"가 뜬다
- [첫날 밤 악 팀 정보 보내기]: 악마=하수인+악마의 속임수, 하수인=악마+다른 하수인. 꼭두각시는 받지 않고 다른 하수인 목록에도 없다(악마만 안다). 정보는 **지금 실제로 악마·하수인인 자리에만** 붙어서 배정을 고치면 자동으로 빠진다. 미치광이 가짜 정보는 이야기꾼이 직접
- **캐릭터 안내 알림톡 `bgmagit-ct-role`**(2026-10-26 템플릿 등록, 스위치 없이 바로 발송) — 세션 생성 때 전원, 좌석 갱신 때는 **캐릭터가 바뀐 자리만**(정보·좌석 번호만 바뀐 건 본문이 같아 안 보낸다). 본문은 닉네임·게임명·캐릭터·종류뿐이고 능력·악 팀 정보는 버튼(`/clocktower-my`)으로 — 자유 문장 변수는 검수 반려 위험. 캐릭터는 휴대폰 화면과 같은 `resolveRole`(믿는 캐릭터), 선악은 넣지 않는다. 알림톡 동의 Y + 번호 있는 회원만. 재시도는 받는 사람별 1회(`sendClockTowerRole`) — 리스너 통째 재시도는 이미 받은 사람에게 또 간다. 문구 고정 테스트 `AlimtalkClockTowerRoleMessageTest`
- `GET /clocktower-sessions/mine` 은 **내 줄만**. `status` 는 캐릭터 없이 확인 여부만, 만든 이야기꾼·관리자만. 세션은 생성 18시간 뒤 닫힌 것으로 본다. [새 게임]·기록 저장 때 닫는다
- **QR 대신 사이트 어디서든 알림**(`components/layout/ClockTowerSeatNotice.tsx`, 2026-10-26) — 로그인한 회원이 진행 중 세션에 자리가 있으면 모든 화면 아래에 [내 캐릭터 확인] 바(새 캐릭터면 강조). 30초마다·화면 복귀 때 `mine` 조회, 로그인하면 즉시 조회. 캐릭터는 바에 안 보인다(누구나 보는 화면). 메뉴에도 "내 캐릭터"(`/clocktower-my`, 시계탑 하위, 권한 3) — 스테이징 id 44
- `/clocktower-my` 는 ClosedMenuGuard 의 시계탑 메뉴 묶음에서 뺐다 — 운영 시계탑 메뉴가 꺼져 있어도 QR 이 열린다
- 알고 받아들인 것: ① 로그인 회원이면 누구나 세션을 만들 수 있고 mine 은 가장 최근 세션을 보여서, 다른 회원이 가짜 세션으로 남의 휴대폰 화면을 덮을 수 있다(매장 내부용이라 둠) ② 직접 입력 캐릭터(`c{id}`) 게임을 진행 중에 수정하면 키가 바뀌어 좌석 갱신이 400 으로 멈춘다 → [휴대폰으로 다시 보내기]

## SQL (리포지토리 루트, 실행 순서)

1. `clocktower-dictionary-2026-11.sql` — 사전·징크스 테이블, 게임·캐릭터 컬럼, 관리자 매핑(**스테이징·운영 적용**)
2. `clocktower-participant-evil-2026-11.sql` — 참가자 최종 선악(**스테이징·운영 적용**)
3. `clocktower-grimoire-v2-2026-11.sql` — 1) 메모 TEXT 2) 사전 이미지 컬럼 4개 3) `GET /clocktower-roles/**` 관리자 4) `GET /clocktower-games/script/fetch` 관리자(정확 경로) — **전부 스테이징·운영 적용**(2026-10-25). 2) 는 다시 돌리면 ADD COLUMN 오류가 나니 새 변경은 새 섹션·새 파일로
4. `clocktower-text-length-2026-11.sql` — 사전·징크스 문구 varchar(1000)→4000, 리마인더 2개는 TEXT(**스테이징·운영 적용** 2026-10-25). 사전 표 varchar 다섯 개를 모두 4000 으로 하면 행 한도 65,535바이트(utf8mb4 글자당 4)를 넘어 ALTER 가 거부된다 — 새 긴 컬럼은 TEXT 로
5. `clocktower-session-2026-11.sql` — 휴대폰 세션 테이블 2개 + `/clocktower-sessions`(POST·`/**` GET·POST·PUT)·`/clocktower-members` GET 유저(2) 매핑(**스테이징·운영 적용** 2026-10-25)
- 엔티티가 이미지 컬럼을 읽으므로 이 파일 2) 없이 백엔드를 배포하면 사전 조회가 전부 실패한다(운영은 이미 적용됨)
- 운영 매핑은 **앱 재시작 후** 반영된다(로딩이 @PostConstruct 1회)
- 운영의 "시계탑에 흐른피" 상위 메뉴(id 37)는 켜져 있지만 **권한 4(멘토)** — 아직 만드는 중이라 멘토·관리자에게만 보이게 둔 것(사용자 결정 2026-10-26). 손님에게 열 때 `BGM_AGIT_MENU_ROLE` 을 3 으로 바꾸고, 그때 운영에도 "내 캐릭터"(`/clocktower-my`) 하위 메뉴를 넣는다(스테이징은 id 44 로 넣어 둠)
- 운영 nginx `$bgm_spa_route` 에 `/clocktower-roles`, `/clocktower-grimoire`, `/clocktower-my` 추가 완료(2026-10-25)
- 스테이징 MCP DB 도구는 DDL 금지 설정이다. 스키마 변경은 `.env` 접속정보 + mysql 클라이언트(`C:/Program Files/MySQL/MySQL Workbench 8.0/mysql`)로, **포트 33070 + 컨테이너명 `1b4addd69ee9` 확인 후** 실행

## 테스트

- 순수 유틸만: `./gradlew test --tests "com.bgmagitapi.origin.clocktower.util.*"` (전체 실행 금지 — 실 DB 에 쓴다)
- 프론트: `npx tsc -p tsconfig.app.json --noEmit`(아카데미·문의·mainState 등 기존 무관 오류는 무시) + `npx vite build`

## 미뤄 둔 것 (2026-10-25 "핵심만 먼저" 결정 — 써 보고 필요하면)

설계서(규칙 전수 조사·반박 검증 결과)의 아래 단계는 하지 않았다.
- 지명·투표 집계 패널과 특수 투표(관료 가중치·부두술사·거리의 악사 비밀 투표·주교·푸주한 등)
- 밤 순서 세부: 장난감 제작자·관문 등 정보 단계 예외, 사망 시 발동 캐릭터(까마귀지기 등) 분류, 조건 배지, 스크립트 전체 징크스 공지
- 캐릭터·선악 변경 공통 동작과 캐릭터별 표(뱀 조련사·이발사·마귀할멈 등), 셋업 구간 점검(남작·대부 등 ±)
- 스크립트 `_meta.firstNight/otherNight` 밤 순서 우선, 자작 캐릭터 밤 순서 999 제거, special·bootlegger 보존, 공식 팀 명칭(주민/외지인/전설적인 캐릭터/설화적인 캐릭터)
