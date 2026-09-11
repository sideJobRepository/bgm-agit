# bgm-agit

한국마작연맹(KML) 기록 생태계와 연동되는 bgm-agit(마작장 + 보드게임카페) 도메인 시스템.

## 구성

| 앱 | 스택 | 경로 | 비고 |
|---|---|---|---|
| `bgm-agit-api` | Spring Boot 3.4.7 / Java 17 / JPA + QueryDSL / MySQL 8.0 | `/bgm-agit/**` | 8080 |
| `bgm-agit-front` | Vite + React 18 + recoil | `/` | 5173. 메인 도메인 |
| `bgm-agit-kml-front` | Next.js 16 + zustand | `basePath: /record` | 3000. 마작 기록(BML) |
| `bgm-agit-murder-front` | Next.js 16 + Tailwind 4 | `basePath: /murder` | 3002. 머더미스터리 |

같은 API·같은 DB·같은 JWT를 공유하는 SSO 구조. Next 앱은 도커 컨테이너(각자 `Dockerfile`, `ENV_FILE` build-arg로 `.env.staging`/`.env.production` 선택), 메인 프론트는 정적 빌드를 nginx로 서빙. nginx가 `/record`→3000, `/murder`→3002로 프록시(`proxy_pass`에 **후행 슬래시 금지** — 붙이면 basePath 프리픽스가 잘려 404).

### 패키지 구조 (bgm-agit-api)
`com.bgmagitapi` 아래 **`origin`**(원래 bgm-agit 도메인 전부: advice, annotation, apiresponse, clocktower, config, controller, entity, event, file, lecture, murder, my, page, payment, repository, security, service, slot, util, valid) / **`kml`**(마작 기록·랭킹·대회) / **`log`** 3갈래. 메인 클래스만 루트에 있어 스캔 기준(`com.bgmagitapi`)은 셋 다 커버.

---

## 인증

### 로그인 경로 4가지
| 경로 | 누가 쓰나 | 입력 | 리프레시 쿠키 |
|---|---|---|---|
| `POST /bgm-agit/login` | `bgm-agit-front` | `{ nickname, password }` (MAHJONG) | `refreshToken_main` |
| `POST /bgm-agit/kakao-login` | `bgm-agit-front` | 카카오 `code` (**기존 회원만**) | `refreshToken_main` |
| `POST /bgm-agit/naver-login` | `bgm-agit-front` | 네이버 `code` (**기존 회원만**) | `refreshToken_main` |
| `POST /bgm-agit/next/login` | `bgm-agit-kml-front` | `{ nickname, password }` (MAHJONG) | `refreshToken_record` |

- 네 경로 모두 **동일한 JWT 액세스 토큰**을 발급. 발급 로직 `BgmAgitAuthenticationSuccessHandler`
- **쿠키 이름은 요청 URI로 결정** — `/next/login`이면 `_record`, 그 외는 `_main`. 메인 폼로그인을 `/bgm-agit/login`(≠`/next/login`)에 둔 이유가 이것
- 로그인 경로 매처가 **두 곳**(`BgmAgitAuthenticationFilter` 생성자 + `BgmAgitSecurityDsl.LOGIN_MATCHER`)이라 새 로그인 경로는 둘 다 추가해야 함. 로그인 프로세싱 URL은 필터가 인가 전에 가로채므로 permitAll 변경은 불필요

### 리프레시 쿠키 분리 (메인 ↔ /record 자동 로그인 차단)
- `POST/DELETE /bgm-agit/refresh?source=main|record` — `source`로 어느 쿠키를 읽고 다시 굽거나 지울지 결정(`BgmAgitRefreshTokenController`, 디폴트 `main`)
- 상수: `BgmAgitAuthenticationSuccessHandler.COOKIE_NAME_MAIN/_RECORD`
- 프론트는 자기 source를 박아 호출 — `bgm-agit-front/src/utils/axiosInstance.ts`→`main`, `bgm-agit-kml-front/lib/axiosInstance.ts`→`record`. 로그아웃 DELETE도 동일(`Sidebar.tsx`, `TopHeader.tsx`)
- 결과: 카카오로 메인 로그인해도 `/record`는 자동 로그인 안 됨(반대도 마찬가지). 구 단일 `refreshToken` 쿠키는 미사용

### 소셜타입 = 인증수단 축
`BgmAgitSocialType`: `KAKAO / NAVER / GOOGLE / MAHJONG`
- **`MAHJONG`** = 폼 가입(자체로그인) 유저
- 폼 로그인 닉네임 조회는 **반드시 `socialType=MAHJONG` 필터** 포함 — `findByBgmAgitMemberNicknameAndSocialType` / `existsBy...AndSocialType`. 필터 없는 `findByBgmAgitMemberNickname`류는 **버그**(소셜 유저와 닉네임 충돌 시 계정 섞임)
- 프론트 판별 신호: **`user.socialId`가 없으면 자체로그인**. 소셜 회원은 socialId 보유

### 회원가입 (폼)
- `POST /bgm-agit/next/signup` — kml-front `/record/signup` + **메인 회원가입 모달** 둘 다 이 엔드포인트
- 입력 `{ name, nickname, phoneNo, password(@Size min=4), mahjongUse }`. BCrypt(`security/config/PasswordConfig`), `USER` role 자동 부여
- 가입 알림톡 발행은 **주석 처리 상태**(`SignupServiceImpl.signup`)

### 신규 소셜 가입 차단
메인은 자체로그인 주력이고 소셜은 **기존 회원 로그인 전용**.
- `BgmAgitMemberDetailService.loadUserByUsername(SocialProfile)`: 소셜ID 미존재 시 신규 생성 대신 `SocialLoginNotAllowedException` 발생
- `BgmAuthenticationFailureHandler`에 해당 예외 메시지 그대로 전달하는 분기 있음. **`BadCredentialsException`은 "인증에 실패하였습니다"로 덮이므로 메시지를 노출하려면 전용 예외가 필요**

### 로그인 시 role 누락되면 USER 자동 부여
`BgmAgitMemberDetailService.ensureDefaultRole(...)` — 소셜·폼 공통. DELETE 사고로 `BGM_AGIT_MEMBER_ROLE`가 날아간 유저도 로그인하면 복구됨.

### 권한 관리 `/role` (bgm-agit-front, `pages/Role.tsx`)
**소셜 로그인 / 자체로그인 탭**으로 갈림.
- 목록: 소셜 탭 `GET /bgm-agit/role`(notMahjong), 자체 탭 `GET /bgm-agit/mahjong-role`(MAHJONG). `useRoletFetch(page, kw, mahjong)` 3번째 인자로 분기
- `BgmAgitRoleResponse`에 `mahjongUseStatus` 포함 — **`Projections.constructor`가 위치 기반이라 두 프로젝션을 항상 동시 수정**
- 자체 탭: 닉네임 변경 `PUT /bgm-agit/mahjong-role/nickname`, 비번 변경 `PUT /bgm-agit/mahjong-role/password`(BCrypt, MAHJONG만). 입력 UI는 `confirmAlert.tsx`의 `showInputModal`
- 소셜 탭 회원 삭제: `DELETE /bgm-agit/role/{memberId}`(`BgmAgitRoleServiceImpl.deleteSocialMember`). ADMIN 전용, `socialType!=MAHJONG`만. **하드 삭제** — `MEMBER_ROLE`·`REFRESH_TOKEN`을 먼저 지우고, 그 외 콘텐츠 자식이 남아 있으면 `DataIntegrityViolationException` catch → 안내. 모든 FK가 `ON DELETE RESTRICT`라 이 순서 필수
- 회원 병합/삭제 SQL: `merge-duplicate-members.sql`의 `MERGE_MEMBER(keep, dup)` (시계탑 테이블 reassign 포함). 실행 전 information_schema FK 점검
- 권한 변경(kml-front `/role`)은 `PUT /bgm-agit/role` 재사용. roleId **1=관리자, 4=멘토, 2=유저**

### 함정: `ApiResponse(403)`은 HTTP 200
`ApiResponse(code, success, message)`는 컨트롤러가 평범히 반환하므로 **항상 HTTP 200**. 프론트 `useRequest`는 2xx면 `onSuccess`를 타서 403 본문에도 "성공" 토스트가 뜬다. 권한 차단은 **백엔드 enforcement + 프론트 UI 가드(버튼 숨김/제출 가드)** 둘 다 필요.

### 함정: `CustomException`의 상태코드
`ExceptionController`가 `e.getStatus()`를 따른다(리프레시 토큰류 401, `ReservationConflictException` 409). **전부 401로 내보내면 프론트 axios 인터셉터가 토큰 갱신 후 요청을 자동 재시도**하므로 결제 승인 같은 건 두 번 날아간다.

---

## 회원 축: 마작(BML) 이용 여부

메인 자체로그인 전환으로 보드게임 가입자도 BML 가입자도 전부 `socialType=MAHJONG`이 되면서, **인증수단과 별개로 "마작 이용 회원" 축**을 뒀다.

- 컬럼/필드: `BGM_AGIT_MEMBER.BGM_AGIT_MEMBER_MAHJONG_USE_STATUS` / `BgmAgitMember.bgmAgitMemberMahjongUseStatus`
  - `'Y'` = 마작/BML 회원 → **KML 등록 대상 + 마작/시계탑/머더 검색 노출**
  - `'N'`/`null` = 보드게임 등 일반 가입자 → KML 미등록 + 검색 제외
- 가입 분기: `SignupRequest.mahjongUse`(기본 false)
  - `bgm-agit-front` 가입 → `false`. KML 호출 생략, `kml_synk=null`(스케줄러는 `'N'`만 재시도하므로 건너뜀)
  - `bgm-agit-kml-front` 가입 → `true`. 즉시 KML 등록
- 전환(신청): 메인 마이페이지 "마작 기록 이용 신청" → `POST /bgm-agit/mahjong-use`(`BgmAgitMyPageServiceImpl.applyMahjongUse`) → `enableMahjongUse(kmlId)`로 `'Y'` + KML 등록(실패 시 `synk='N'`→스케줄러 재시도). 멱등. 버튼은 `MyPageModal.tsx`에서 `isSelfLogin && mahjongUseStatus!=='Y'`일 때 노출
- **검색 필터 두 곳에 `mahjongUseStatus='Y'` 적용**: `YakumanTypeRepositoryImpl.getMembers()`(기록 입력 드롭다운), `BgmAgitMemberRepository.searchMembersBySocialTypes`(`/bgm-agit/all-members` — 시계탑·머더 공용)

### 시계탑 기록 = 자체로그인 전용 (조회는 누구나)
- `BgmAgitClockTowerRecordServiceImpl`: `createRecord`는 writer가 MAHJONG 아니면 403. `modify/deleteRecord`는 `requireClockTowerWriter(memberId, roles)` — 비MAHJONG 403, **관리자는 모더레이션 위해 예외 허용**
- 프론트 가드: `canWrite = isSelfLogin || isAdmin` (`ClockTowerRecords` 기록하기 버튼, `ClockTowerRecordDetail` 수정/삭제·`onSubmit`)

### 마이페이지
노출 항목: 가입일자/이름/닉네임/휴대폰번호 + `mahjongUseStatus` + 알림톡 ON/OFF. (EMAIL은 제거됨)
조회 `getMyPage`는 socialType 무관. **비밀번호 변경만 MAHJONG 전용**(소셜은 비번이 없음).

---

## 예약

### 데이터 모델
- 예약 대상(룸/대탁)은 **`BGM_AGIT_IMAGE` 행**이다. `category=ROOM|MAHJONG`, `link=/detail/room|/detail/mahjongRental`, `BGM_AGIT_MAIN_MENU_ID=3`(프론트 `labelGb 3`)
- 한 예약 = 시간 슬롯 여러 행이 **`BGM_AGIT_RESERVATION_NO`(그룹키)** 로 묶임. 예약 PK가 아니라 그룹키라 **중복값**
- 상태는 승인여부(`..._APPROVAL_STATUS` Y/N) + 취소여부(`..._CANCEL_STATUS` Y/N) 두 컬럼
- **`BGM_AGIT_IMAGE_USE_STATUS`**(varchar(1), default 'Y') — 운영 종료 항목은 삭제(FK RESTRICT로 예약 이력에 물림) 대신 `'N'`으로 숨김. 필터는 `BgmAgitImageRepositoryImpl.notHidden()`(null도 노출 취급)이 `getMainMenuImage`/`getDetailImage`에 적용, 직접 호출 차단은 `getReservation`/`createReservation`의 `BgmAgitImage.isHidden()` 체크
  - 현재 숨김: 대탁 JP류(id 34·35, 실제로는 F Room 스왑 운영), **M Room(id 19)**
  - **오픈 공간 M-1/M-2/M-3**(id 83·84·85, 5~7명)이 M Room 대체. `category=ROOM`이라 1시간 슬롯·예약금 1만원 자동 적용

### 예약 정책은 서버가 유일한 출처 (프론트 magic id 금지)
`SlotSchedule`(origin/util)에 전부 모임: `of()`(open/close/interval/durationHours), `slots()`, `maxSelectableSlots()`, `resolveReservationType()`, `resolveDepositAmount()`.
- **G Room** = 6시간 간격·이용 5시간(13~18, 19~00) / **MAHJONG** = 3시간 / 그 외 = 1시간
- `GET /bgm-agit/reservation` 응답에 `slotRanges[{start,end}]`, `maxSelectableSlots`(G룸 1, 그 외 null), `reservationType`(ROOM|DELEGATE_PLAY) 포함 → `ReservationTimePanel.tsx`가 그대로 그림
- `createReservation`은 **클라이언트가 보낸 예약타입을 무시**하고 이미지 카테고리로 결정
- 수요일은 무인운영이라 예약 불가. 규칙은 `SlotSchedule.CLOSED_DAY_OF_WEEK`/`isClosedDay()`/`CLOSED_DAY_MESSAGE` 한 곳에 모임(등록 검증 + 방 목록 조회가 같은 값을 봄). 프론트는 `available-rooms` 응답의 `closedWeekday`(JS `getDay()` 규약)를 쓸 수 있다

### 예약 진행 순서 = 날짜 → 방 → 시간
원래는 방 → 날짜 → 시간이었고, **캘린더가 "내일"을 기본 선택**(`useState<Date>(initialDate)`)한 데다 첫 번째 방까지 자동 선택돼서, 손님이 날짜를 인지하지 못한 채 시간만 눌러 **엉뚱한 날짜로 예약되는 사고**가 반복됐다(사장님 보고).
- 컴포넌트 3분할: `calendar/ReservationDatePicker.tsx`(월 캘린더) / `grid/RoomAvailabilityBadge.tsx`(카드 배지) / `calendar/ReservationTimePanel.tsx`(구 `ReservationCalendar`에서 캘린더를 뺀 것)
- **날짜 state는 `ImageGrid.tsx`의 지역 `useState<string | null>`이고 기본값이 null.** 기본값을 넣으면 날짜만 바뀔 뿐 사고 형태는 그대로다. 날짜 미선택이면 방 카드를 아예 렌더하지 않아 시간 버튼 도달 경로가 없다
- 오예약 방어 3중: ① 미선택이면 카드 없음 ② 시간 버튼 바로 위 `TimeTitle`에 날짜 재표시(sticky에 의존 안 하므로 이게 실질 1순위) ③ 확인 모달 `summary` 첫 줄
- `<ReservationTimePanel key={`${imageId}-${date}`}>` — 방·날짜가 바뀌면 리마운트로 `selectedTimes`/`combineIds`/`useMode` 초기화
- `/detail/room` ↔ `/detail/mahjongRental`은 `App.tsx`의 `path="detail/*"` 한 라우트라 **언마운트되지 않는다** → `location.pathname` 초기화 effect 필수
- **`bgmAgitReservationStartDate`는 `` `${ymd}T00:00:00+09:00` `` 형식으로 보낼 것.** 서버가 `ZonedDateTime.parse`로 받아서(`BgmAgitReservationServiceImpl`) 순수 `'YYYY-MM-DD'`는 파싱 실패 → 500. 예전엔 `Date` 객체가 `toISOString()`으로 변환돼 **우연히** 맞던 구조라 KST 브라우저에서만 옳았다

### 날짜별 방 가용 현황 `GET /bgm-agit/reservation/available-rooms`
`?date=&labelGb=3&link=/detail/room` → `{ date, closed, message, closedWeekday, rooms[{imageId, label, group, category, minPeople, maxPeople, totalSlotCount, availableSlotCount, available, message}] }`
- 판정은 **예약 캘린더와 같은 `resolveDayAvailability`를 탄다.** 별도 구현을 만들면 배지 숫자와 방을 눌렀을 때 캘린더에 뜨는 시간 수가 갈린다. 같은 이유로 이 API도 **JWT userId를 반드시 읽어야** 한다(내 대기건 점유 규칙)
- **선택 가능한 실제 시간대는 내려주지 않는다** — 합쳐예약 교집합·`maxSelectableSlots`·가격이 `GET /reservation`에만 있어서, 두 소스를 섞으면 어긋난다
- 쿼리는 `findReservedTimesByImageIdsAndDate(imageIds, date)` 1회(`transform(groupBy(imageId))`). **`ReservedTimeDto`에 필드를 추가하지 말 것** — `Projections.constructor` 위치 기반인데 `memberId`와 `imageId`가 둘 다 `Long`이라 순서가 어긋나도 컴파일이 통과하고, 어긋나면 남의 대기 예약이 내 것처럼 점유 처리된다. 프로젝션은 `reservedTimeProjection()` 한 곳에서만 만든다
- 배지 조회는 `useRequest`를 쓰지 않는다(`useAvailableRoomsFetch`) — 실패 시 `/error` 리다이렉트·에러 토스트·전역 로딩 오버레이가 전부 부적절. 실패하면 **배지를 안 그린다**(없는 걸 '마감'으로 표시하면 예약 가능한 방을 가린다)
- 회원정보가 안 나가는 공개 조회라 URL_RESOURCES 매핑 불필요. 단 `/bgm-agit/reservation/**` 와일드카드 행이 이미 있으면 비로그인 403이 되므로 배포 전 확인

### 합쳐 예약 (M-1 + M-2 …)
행마다 이미지 FK가 따로 있어서, 테이블 변경 없이 "같은 예약번호에 이미지가 다른 행"으로 구현.
- 조회 `GET /bgm-agit/reservation?...&ids=84,85` — 시간대는 **전 항목 교집합**, `label`은 `"M-1, M-2"`, `minPeople`=최소값들 중 최대, `maxPeople`=합산
- 등록 `POST /bgm-agit/reservation`에 `bgmAgitImageIds: [84,85]` — 항목별 충돌 검증 후 **같은 예약번호**로 행 생성
- 조합 검증(`loadReservableImages`): 같은 카테고리 + 같은 메뉴링크 + `maxSelectableSlots == null`(하루 1팀 제한인 G룸은 불가). 숨김 항목 거부
- **예약금은 항목 수만큼 합산** → M-1+M-2 = 2만원
- 프론트 `RESERVATION_COMBINABLE_GROUPS`(`[['M-1','M-2','M-3']]`) → `ImageGrid`가 `combinable` prop 전달, 캘린더 상단 토글

> **함정: 예약번호 단건 조회는 항목 수만큼 행이 늘어난다.** `findBizTalkCancel`이 `fetchOne`이라 `NonUniqueResultException`으로 관리자 확정·결제 승인이 터진 적 있음 → `fetch()` 후 라벨만 합쳐 조립하도록 수정됨. 예약번호로 단건을 가정하는 코드를 새로 쓸 때 같은 함정 주의.

### 코멘트 / 이용 방식 (프론트 하드코딩 맵)
`bgm-agit-front/src/config/reservationComments.ts` — **라벨을 키로** 쓰는 맵 3종. DB 컬럼·알림톡 템플릿 변경 없이 요청사항 문자열에 얹는 방식.
- `RESERVATION_COMMENTS` — 예약 카드·캘린더 안내 문구 (F Room "대탁룸(JP-COLOR)으로 변경 가능", M-1~3 "룸이 아닌 오픈된 공간입니다.")
- `RESERVATION_OPTIONS` — 예약 확인 모달 체크박스. 선택 시 요청사항 맨 앞에 `[요청 옵션] …`
- `RESERVATION_USE_MODES` — 캘린더 시간대 **위** 토글(`'F Room': ['일반룸','대탁룸(JP-COLOR)']`, 첫 값 기본). 선택 시 `[이용 방식] …`
- 합쳐 예약이면 서버 label이 `"M-1, M-2"`로 오므로 프론트는 `label.split(',')[0]`(기준 라벨)로 조회

### 취소 규칙
- 사용자: 본인 예약만 + **예약일 전날까지**(`validateUserCancelableReservation`)
- 관리자: 제한 없음. 단 현황판은 **지난 예약 확정·취소 불가**(`canManage = date >= todayYmd()`)
- 사용자·관리자 모두 `modifyReservation` 한 곳으로 모여서 `cancelStatus='Y'`면 결제 환불이 함께 돈다(아래 결제 참고)

### 관리자 예약 현황판 `/reservation-board`
`bgm-agit-front/src/pages/ReservationBoard.tsx`. 예약내역(10건 페이징)으로는 "오늘 어느 방이 몇 시에 차 있나"가 안 보여서 신설.
- **세로축 = 시간, 가로축 = 장소** — 초안은 가로축이 시간이었는데 영업시간이 13:00~익일 02:00라 모바일에서 항상 가로 스크롤이 생겨 전치함. 전치만으로는 룸이 8~10개일 때 여전해서 **룸 그룹 탭**을 같이 넣어야 해결됨
- 탭 분류는 **카테고리 우선 → 라벨 첫 알파벳**: `MAHJONG` 카테고리(라벨이 한글이라 알파벳 규칙으로 안 갈림)→`마작탁`, `ROOM`→`ROOM_GROUPS`(C·D·E / B·F·G / M), 나머지→`기타`. 그날 예약 있는 그룹만 노출
- 모바일 기본은 **목록(아젠다) 뷰** — 1시간 블록(48px)에 이름·시간·인원 3줄이 안 들어감. `viewMode`가 `null`이면 화면 크기에 맡기고(`isMobile ? 'list' : 'grid'`), 토글하면 그 선택을 따름
- 색상: **바탕색 = 룸**, 상태는 채움으로 — 확정=꽉 참 / 대기=점선+옅은 배경 / 취소=회색+취소선. `ROOM_PALETTE`(10색)를 **필터·탭 적용 전** 순서로 배정해 필터를 바꿔도 색이 안 흔들림. `blockStyle()`이 inline style로 주입
- 백엔드 `GET /bgm-agit/reservation/board?date=YYYY-MM-DD` → `getReservationBoard(date, roles)`. 쿼리 `findReservationsByDate`(페이징 없음, member/image fetch join), DTO `AdminReservationBoardResponse`, 영수증은 `findDoneReceiptUrlsByReservationNos` 배치
- **시간축 분값 규약 — 06시 이전은 +1440.** G룸(19:00~00:00)·마작대여(23:00~02:00)처럼 마감이 익일로 넘어가는 슬롯 때문. 프론트도 이 규약 그대로 사용
- **권한 2중** — `BgmAgitAuthorizationManager`는 URL_RESOURCES에 없는 경로를 **기본 permit**으로 통과시킨다. 이 API는 회원 연락처가 나가므로 서비스단 `isAdmin(roles)` 검사 + URL 레벨 ADMIN 매핑 둘 다 필요(**매핑 INSERT 후 앱 재시작** — 로딩이 `@PostConstruct` 1회)
- 메뉴 등록은 `/menuManage`에서. `getMainMenu`가 **subMenu 없는 root를 걸러내므로** 반드시 기존 부모 메뉴의 하위로

### 함정: `toISOString()` 날짜 밀림
`Date.toISOString()`은 UTC 변환이라 **KST 자정 Date가 하루 앞으로 밀린다**(`ReservationList` 검색이 실제로 이 버그였음). 서버로 보내는 날짜는 항상 `src/utils/date.ts`의 `toLocalYmd()`(`toLocaleDateString('sv-SE')` 기반) 사용. 같은 파일에 `todayYmd`/`addDaysYmd`/`formatYmdWithWeekday`.

### TODO: `BGM_AGIT_ROOM` 테이블 분리
예약 대상 메타(라벨/인원/슬롯정책/예약금/코멘트/옵션/노출여부)를 이미지 테이블에 얹은 게 근본 원인. 떼내면 프론트 하드코딩 맵과 라벨 문자열 비교(`"G Room".equals(...)`)도 같이 사라진다.
**예약 2테이블 정규화**(부모=예약묶음 + 자식=슬롯행)도 정석이지만, 운영 데이터 이관 + 생성/조회/취소/알림톡 대수술이라 보류.

---

## 예약금 결제 (토스페이먼츠)

### 모듈·테이블
- 패키지 `com.bgmagitapi.origin.payment` — entity / repository / service / controller / schedule
- 테이블 `BGM_AGIT_PAYMENT`: `BGM_AGIT_MEMBER_ID`(FK, RESTRICT), `BGM_AGIT_RESERVATION_NO`, `BGM_AGIT_ORDER_NO`(토스 orderId, 서버 발급), `BGM_AGIT_PAYMENT_KEY`, `..._AMOUNT`, `..._STATUS`, `..._TYPE`(토스 method), 승인/취소일시, `..._CANCEL_AMOUNT`/`_REASON`, `..._RECEIPT_URL`, `..._FAIL_REASON`, `REGIST_DATE`/`MODIFY_DATE`. varchar 기본 500
- **`BGM_AGIT_ORDER_NO`만 UNIQUE.** `BGM_AGIT_RESERVATION_NO`엔 **UNIQUE 걸지 말 것** — 재결제 시 같은 예약번호로 새 행이 들어가서 터진다. "그룹당 유효 결제 1건"은 서비스단 관리
- 예약↔결제는 논리 연결(payment가 `RESERVATION_NO` 보관). 그룹키라 물리 FK 불가
- `PaymentStatus`: `READY`(주문 생성) / `DONE`(승인) / `CANCELED`(환불) / `ABORTED`(실패)

### 흐름
1. 예약 생성(대기 N/N) → 예약내역(`ReservationList.tsx`) 대기행의 **`예약금 결제`** 버튼
2. `POST /bgm-agit/payments/order { reservationNo }` → `BgmAgitReservationService.createPaymentOrder`가 소유자·취소·확정 검증 + **금액 서버 계산** 후 공통 `createOrder` 위임 → `{ orderId, amount, orderName, clientKey }`
3. 토스 위젯(`components/payment/PaymentCheckoutModal.tsx`) → 성공 시 `/payment/success`로 리다이렉트
4. `POST /bgm-agit/payments/confirm` → 금액 대조·멱등 → 토스 승인 → **예약 `approvalStatus='Y'` 자동 확정 + 확정 알림톡**
5. 취소(`modifyReservation`, `cancelStatus='Y'`) → DONE 결제가 있으면 **토스 전액 취소로 자동 환불**

- **예약금**: `SlotSchedule.resolveDepositAmount(category, label)` — **전 항목 10,000원 정액**. 슬롯 수 무관, 합쳐 예약이면 항목 수만큼 합산(M-1+M-2+M-3 = 3만원). M Room 3만원 예외는 M-1/M-2/M-3 분리와 함께 제거됨. 약관(`Terms.tsx`)·환불정책(`RefundPolicy.tsx`) 문구도 1만원
- **향후 인원수 기준 전환 예정** — `bgmAgitReservationPeople`(예약 생성 시 이미 수집)로 인원 x 단가 계산. `resolveDepositAmount` 시그니처에 인원 인자 추가 + 약관·환불정책 문구 + 알림톡 템플릿(재심사) 동반 수정 필요. 토스페이먼츠 가맹점 재심사는 불필요(금액 산정 방식 변경은 심사 대상 아님)
- 잔여 이용요금은 현장 결제
- `payment.live`(yml) — `false`면 결제행만 처리하고 **예약 자동확정을 하지 않는다**(심사 기간 공짜 예약 방지). staging·real 모두 현재 `true`

### 동시성·정합성 방어
- **승인 직전 슬롯 재검증**(`PaymentServiceImpl.validateReservationSlotAvailable`) — 대기 예약은 서로의 자리를 막지 않아서, 같은 시간대를 여럿이 대기로 들고 있다가 각자 결제하면 전부 확정되는 이중 예약이 가능했다. 확정건과 겹치면 **토스 승인(=과금) 전에** 409로 차단. 쿼리 `findConfirmedReservations(imageIds, date, excludeReservationNo)`
- **승인 직렬화**(`PaymentConfirmExecutor`) — 재검증만으론 동시 통과 창이 남아 `ReentrantLock`(fair)으로 승인 전체를 한 줄로 세움. **서버 인스턴스 1대 전제**(다중화하면 DB/분산 락 필요)
  - ⚠️ **`@Transactional` 메서드 안에 `synchronized`를 걸면 무의미** — 커밋은 프록시가 메서드 반환 후에 하므로 락이 먼저 풀리고, 뒤 스레드가 미커밋 확정건을 못 본다. 그래서 락을 트랜잭션 **바깥** 컴포넌트에 두고 컨트롤러가 그걸 거친다
- **가상계좌 차단** — 승인 응답 `status`가 `DONE`이 아니면(가상계좌는 200 + `WAITING_FOR_DEPOSIT`) 발급을 즉시 취소하고 실패 처리. 입금 웹훅이 없어 나중에 확정을 걸 수단이 없기 때문. **근본 차단은 토스 상점관리자에서 가상계좌 수단 끄기**
- **타임아웃**(`TossPaymentsClient`) — connect 5초 / read 30초. read를 짧게 잡으면 "토스는 승인했는데 우리는 실패 처리"라는 최악의 불일치가 늘어나므로 넉넉히 둠. 전역 `spring.http.client.*` 대신 이 클라이언트에만 적용(KML·비즈톡·소셜이 같은 빌더를 공유)

### 정리 스케줄러
`BgmAgitPaymentSchedule` — 매일 **01:00 KST**, `READY` + `REGIST_DATE < 지금-1일` 행 삭제(`deleteAbandonedOrders`). 결제 버튼을 누를 때마다 주문행이 생기는데 대부분 승인까지 안 가서 쌓인다.
- **하루 여유가 핵심** — 진행 중인 주문을 지우면 confirm이 "존재하지 않는 주문"으로 실패해 토스엔 승인, 우리 DB엔 근거 없음이 된다
- `DONE`/`CANCELED`는 결제 이력이라 절대 삭제하지 않음
- S3 임시파일 정리(`BgmAgitFileSchedule`)와 같은 시각이지만 **별도 컴포넌트** — 그쪽은 try/catch가 없어 한쪽 실패가 다른 쪽을 막지 않게

### 알려진 한계 (미해결)
- **`ABORTED`가 DB에 안 쌓인다** — `markAborted()` 직후 예외를 다시 던져서 트랜잭션이 롤백된다. 결제 실패 이력이 `BGM_AGIT_PAYMENT_FAIL_REASON`에 전혀 안 남고 결제행은 `READY`로 남음. 고치려면 실패 기록만 `@Transactional(REQUIRES_NEW)`로 분리(그러면 `ABORTED`도 정리 대상에 추가해야 함. `markDone`이 failReason을 null로 미는 것도 같이 검토)
- **외부 호출이 트랜잭션 안에 있음** — 토스 승인/취소 성공 후 뒤쪽에서 예외가 나면 롤백되어 "돈은 움직였는데 DB엔 없음". 반대로 토스가 4xx면(예: 상점관리자에서 직접 환불해 `ALREADY_CANCELED_PAYMENT`) 예약 취소 자체가 막힌다
- **DONE 결제가 2건 이상이면 최신 1건만 환불**(`findLatestPaymentByReservationNoAndStatus`가 `fetchFirst`)
- **노쇼/당일취소 위약금 없음** — 관리자가 취소하면 전액 환불. 약관의 "당일 취소·노쇼 환불 불가"는 사용자 취소가 전날까지만 가능해서 성립하는 것
- **관리자 수동 확정에는 슬롯 충돌 재검증이 없음**(`modifyReservation`의 `approvalStatus='Y'`)

### 키·심사 메모
- 결제위젯이므로 **위젯용 키**(`test_gck_`/`test_gsk_`, `live_gck_`/`live_gsk_`). `test_ck_`/`test_sk_`(API 개별 연동 키)를 위젯에 쓰면 `INVALID_API_KEY`
- yml `toss.client-key/secret-key/confirm-url/cancel-url`, 값은 `.env`/GitHub Secrets. clientKey는 주문 응답으로 내려주므로 프론트 env 불필요
- 정책 페이지: `/terms`(`pages/Terms.tsx`), `/refund-policy`(`pages/RefundPolicy.tsx`), `/privacy`
- 푸터(`Footer.tsx`) 사업자정보 — 보드게임카페BGM(비지엠)아지트 / 대표 박범후 / 896-17-02241 / 대전광역시 서구 문정로 62, 3층 일부호(탄방동, 프라임빌딩) / 0507-1445-3503

---

## KML 연동

### 설정
```yaml
kml:
  url: https://kml.or.kr/stat52     # stat 52 = bgm-agit
  api:
    key: ${KML_API_KEY}             # x-api-key 헤더
```

### API (모두 `x-api-key` 필요)
| 엔드포인트 | 바디 | 응답 |
|---|---|---|
| `GET /api_users.php` | — | `{status, count, users:[{id, nick}]}` |
| `POST /api_user_register.php` | `{nick}` | `{status, user_id, nick, message}` (409=이미 존재) |
| `POST /api_record_submit.php` | `{game_length, common_point, players[4]{user_id, point, wind}}` | `{status, record_id, sum_check}` |
| `POST /api_record_modify.php` | `{modify_id, …}` | `{status, modify_id, sum_check}` (404=대상 없음) |
| `POST /api_record_del.php` | `{record_id}` | `{status, message, record_id}` |
| `POST /api_record_restore.php` | `{record_id}` | `{status, message, record_id}` |

- 매핑: `MatchsWind`/`Wind` enum의 `ordinal()`이 그대로 0=동/1=남/2=서/3=북. `point`는 `recordScore`(정수). `common_point`는 추적 안 해서 0 고정
- 역만 del/restore API도 KML엔 있으나 역만은 전송 파이프라인 자체가 없어 미연동(`api_user_guide.md`)

### 기록 송신
전부 `RecordServiceImpl`이 이벤트를 발행하고 `KmlRecordEventListener`(`@Async("bizTalkExecutor")` + `@TransactionalEventListener(AFTER_COMMIT)`)가 처리. **DB 트랜잭션과 분리**돼 있어 KML이 죽어도 우리 기록은 정상 저장되고, 실패는 catch 후 `log.warn`만.

| 흐름 | 발행 | 스킵 조건 | 후처리 |
|---|---|---|---|
| 등록 | `createRecord` → `KmlRecordSubmitEvent` | 4명 중 하나라도 `kmlId == null` | 응답 `record_id`를 `KmlMatchsLinker`가 별도 트랜잭션에서 `BGM_AGIT_MATCHS_KML_ID`에 저장 |
| 수정 | `updateRecord` → modify | `matchsKmlId == null` (fallback submit 안 함) + 미연동 회원 | 없음 |
| 삭제/복구 | `removeRecord`/`restoreRecord` | `matchsKmlId == null` | 없음. 바디는 `{record_id}` 하나뿐 |

### 회원-KML 연결
- 가입 시 닉네임으로 조회·자동 등록(`KmlUserClient.findOrRegisterKmlIdByNickname`) — **`mahjongUse=true`일 때만**
- 단건 매칭 → `BGM_AGIT_MEMBER_KML_ID` 저장 + `KML_SYNK='Y'`
- 0건 → `api_user_register.php`로 자동 등록 후 `user_id` 저장 + `'Y'` (409면 단건 재조회 폴백, 그래도 안 되면 `'N'`)
- 다건(`AMBIGUOUS`) / 502·네트워크·파싱 오류 → `kml_id=null` + `'N'` (가입은 계속 진행)
- 재시도: `KmlSyncScheduler`(매시 정각)가 `synk='N'`을 다시 조회 → 성공 시 `'Y'`
- **닉네임 변경 시 `kml_synk` 리셋 미구현** — 변경 기능 손볼 때 `markKmlSyncFailed()` 호출 추가할 것

---

## 알림톡 (BizTalk)

`https://www.biztalk-api.com/v2/kko/sendAlimTalk`. 센더키는 `biztalk.sender-key`.

### 코드 구조
- 템플릿 코드 상수 `util/AlimtalkTemplate.java` / 메시지 빌더 `util/AlimtalkUtils.java`(점수·전화번호 포맷터도 여기)
- 발송 `service/BgmAgitBizTalkSandService(.Impl)` — `sendTalk(...)` 공통 + 이력 `BgmAgitBiztalkSendHistory`
- 리스너 `event/BizTalkEventListener` — `@Async("bizTalkExecutor")` + `AFTER_COMMIT`. catch에서 1회 재시도(부분 실패 시 중복 발송 가능)

### 이벤트 종류
`MemberJoinedEvent`(발행 주석처리) / `ReservationWaitingEvent`·`ReservationTalkEvent` / `InquiryEvent` / `LecturePostEvent`·`MyAcademyApprovalEvent`·`MyAcademyCancelEvent` / `ReviewPostEvents` / `MatchRecordRegisteredEvent`

### 대국 기록 알림톡 (`bgmagit-bml-match`)
- 발행은 `createRecord`만. **수정/삭제 흐름 미적용**
- 발송 필터(4명 각각): `socialType=MAHJONG` **AND** `alimtalkStatus='Y'` **AND** phoneNo 존재. 4인 + 동남서북 다 채워졌을 때만, 하나라도 빠지면 전체 skip
- 변수 14개(기록ID/기록일자/각 자리 닉네임·점수·승점). 점수 `38,100`, 승점 `+18.1`/`-39.6`
- 버튼 URL은 `https://bgmagit.co.kr/record/rank/{memberId}`. 템플릿엔 `.../rank/#{memberId}` 패턴이 검수 통과가 잘 됨

### 관리자 당일 예약 알림 (`bgmagit-admin--reservation-rem`)
매일 **09:00 KST** 관리자 2명(`BgmAgitBizTalkSandServiceImpl.PHONE1/PHONE2`)에게 발송.
- 스케줄러 `BgmAgitAdminReservationNotifyScheduler`, 발송 `sendAdminDailyReservation(date)` — 현황판의 `findReservationsByDate` 재사용, 예약번호로 묶고 취소건 제외
- **`biztalk.admin-reservation-notify`(기본 false)가 발송 환경 스위치** — 운영(`application-real.yml`)만 `true`, staging·로컬은 `false`. 없을 때는 staging 컨테이너와 운영 컨테이너가 각자 09:00에 보내서 관리자에게 하루 2번 나갔다
- 변수 5개(예약일자/건수/총인원/첫예약시간/예약목록). **0건이어도 매일 발송** — 빈 문자열이면 치환이 실패하므로 `"없음"`으로 채움
- 목록 **15줄 제한**(`ADMIN_LIST_MAX_LINES`, 본문 1,000자 한계). 넘치면 `외 N건`
- 템플릿 코드의 **하이픈 2개(`admin--reservation`)는 카카오 등록값 그대로** — 오타로 보고 고치지 말 것
- 종료시각 `lastEndTime()`은 06시 이전을 익일로 보고 비교

### 예약 결제 안내 (`bgmagit-res-payment-1`)
구 템플릿 `bgmagit-res-payment`는 고정 문구에 "예약금은 M룸 30,000원, 그 외 10,000원이며 잔여 이용요금은 현장에서 결제합니다."가 박혀 있어 금액 정책이 바뀔 때마다 재심사가 필요했다. **`-1` 개정판에서 그 줄을 지우고 정보 블록에 `예약금: #{예약금}` 변수를 추가**해 금액이 바뀌어도 소스만 고치면 되게 했다.
- 금액은 `SlotSchedule.totalDepositAmount(images)` 결과를 `AlimtalkUtils.formatAmount`로 포맷해 넣는다. **결제 주문 금액(`createPaymentOrder`)과 같은 메서드**라 합쳐 예약(M-1+M-2 = 20,000원)도 실제 청구액이 그대로 나간다. 두 곳이 갈리면 고지 금액과 청구 금액 불일치가 되므로 계산을 따로 만들지 말 것
- **카카오 검수 통과 템플릿과 고정 문구는 여전히 글자 단위로 일치해야 한다.** 변수(`#{예약금}`, `#{룸}` 등) 값만 자유롭게 조립 가능
- 검수 통과 **전에 배포하면 발송이 거부된다.** 다만 `biztalk.reservation-payment-live`(기본 false, yml·.env·워크플로우 어디에도 미설정)가 꺼져 있는 동안은 계좌안내 템플릿 `bgmagit-res-account2`가 나가므로 이 템플릿은 아예 쓰이지 않는다. 결제 안내로 전환할 때 이 값을 켜면 된다

### 알림톡 ON/OFF
- `BGM_AGIT_MEMBER_ALIMTALK_STATUS`(Y/N). 신규 가입 시 두 생성자 모두 `"Y"`
- 마이페이지 토글(`MyPageModal.tsx` "알림 설정") → `PUT /bgm-agit/mypage` → `modifyMyPage()`. 조회 응답에도 포함(`BgmAgitMyPageGetResponse.alimtalkStatus`, QueryProjection이라 Q-class 재생성 필요)

### 휴대폰 번호
- `@PhoneValid`: `^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$` — **하이픈 선택**
- DB엔 입력 그대로 저장(`normalizePhone`은 `+82`→`0`만), 발송 시 `formatRecipientKr()`이 `010-1234-5678`로 재포맷

---

## 기록 · 랭킹 (kml-front)

### 기록 입력 UX (`write/page.tsx`)
- **점수 자동 계산**: 4자리 중 사용자가 직접 안 건드린 자리(`scoreEditTime[key]===0`)가 대상. 3자리 입력하면 나머지가 `refund - sum(others)`. 기본 대상은 NORTH. 4자리 다 입력하면 수동 모드, 칸을 비우면 timestamp가 0으로 리셋돼 다시 후보 복귀. `Number.isNaN` 체크로 `'-'` 단독 입력 시 NaN 발산 방지
- **± 토글**(`SignButton`): input은 `type="text"` + `inputMode="numeric"` + `^-?\d*$` — `-` 단독 표시를 위해(type=number 불가). 빈 값에서 누르면 `-`, `0`에선 무시(`-0` 방지), 값 있으면 부호 토글
- **"내 닉네임" 버튼**: 각 자리 + 역만 행마다 좌측 `<MeButton>`, 휴지통은 우측(오클릭 방지). 회원 목록에 본인이 없으면 alert

### 랭킹 검색 (`RankType`)
- `WEEKLY`(월요일~다음 월요일) / `MONTHLY`(1일~다음 달 1일) / `CUSTOM`(`startDateTime`/`endDateTime`, 둘 다 필수·end>start)
- `GET /bgm-agit/ranks?type=…&baseDate=…|startDateTime=…&endDateTime=…`. repository는 `LocalDateTime` 범위 비교
- 프론트 `BaseTable`이 rankType 따라 주 픽커 / 년월 픽커 / datetime 2개로 분기

### 개인기록 `/rank/{memberId}`
차트·단 시스템 없이 표·카드 중심. **CSR**(SSR 안 씀), styled-components, 외부 차트 라이브러리 없음.
- `GET /bgm-agit/ranks/{memberId}/stats?year=` — 카드 통계(총국수/평균순위/총승점/1·4위/토비/+30000/-2등) + 자리별×순위별 표 + 같이 친 TOP3
- `GET /bgm-agit/ranks/{memberId}/games?page=&year=` — 최근 경기 페이징. `year` 생략 = 전체 기간
- 서비스 `RankServiceImpl.findMemberStats/findMemberRecentGames`, 쿼리는 `RankRepository`의 `findMemberCards/findMemberSeatStats/findMemberTopRivals/findMemberMatchIds`
- 진입: 랭킹 표 닉네임 링크 / 메인 퀵메뉴 "내 기록" / DB 메뉴는 **`/my-rank`로 등록**(`app/my-rank/page.tsx`가 본인 id로 redirect)
- **비율 규약**: 전체% = 그 wind 총국수 분모, 동·남·서·북% = 그 자리 합계(rank 1~4 합) 분모(토비 행도 동일). 소수점 2자리 + 끝 0 제거(`23.80%`→`23.8%`)

### QueryDSL 함정 (이 프로젝트 환경)
- `new CaseBuilder()...sum()`, `record.recordPoint.sum()`, `.avg()` 등 **인스턴스 집계 메서드가 컴파일 실패**(`method sum cannot be applied`)
- 우회: `Expressions.numberTemplate(Long.class, "SUM({0})", flag)` / `numberTemplate(Double.class, "AVG({0})", path)`. 기존 `findRanks`도 이 패턴
- **`RecordQueryRepository`를 인터페이스로 주입하면 기동 실패**(`RecordRepository` + `RecordRepositoryImpl` 두 빈 매칭). 주입은 항상 `RecordRepository`로

---

## 프론트 개발 팁 (kml-front)

- API는 Next rewrite로 `/bgm-agit/*` → `${NEXT_PUBLIC_API_URL}/bgm-agit/*` 프록시
- `axiosInstance`가 access token(`tokenStore` 메모리) / refresh token(HttpOnly 쿠키) 자동 처리. 보호 라우트는 `RouteAuthGuard.tsx`, 리다이렉트 `/login?redirect=…`
- Kakao SDK(`KakaoProvider`)는 **공유하기용**(`NEXT_PUBLIC_KAKAO_JS_KEY`), 로그인과 무관
- **반응형** — 사용자가 거의 휴대폰으로 입력. `theme.device.mobile`(`max-width: 844px`) 기준:
  - input/select는 모바일 `font-size: 16px`(iOS Safari 자동 줌 방지)
  - 데스크탑 `flex-wrap: nowrap; overflow-x: auto`인 검색/필드는 모바일에서 `wrap`으로 풀기
  - 표는 부모 `overflow-x: auto` + table `min-width`
  - `Wrapper`의 `min-width: 1280px`은 `@media tablet`에서 `100%`로 해제

### 사이드바 sub 메뉴 (`Sidebar.tsx`)
`BGM_AGIT_KML_MENU.BGM_AGIT_KML_SUB_MENU_ID`가 부모 ID. `KmlMenuServiceImpl`이 트리로 묶어 `subMenus[]` 반환.
- 부모 분기: `/my-page`→모달 / `!menuLink || '/sub'`→펼침 토글 / 그 외→`<Link>`. sub 안의 `/my-page`도 모달
- 데스크탑 sub는 `position: absolute` 드롭다운 → **`SidebarWrapper { overflow: visible }` 필수**(헤더가 가로 일렬이라 안 그러면 밀리거나 잘림). 태블릿/모바일은 `static` 인라인 펼침 + `padding-left: 16px`, `overflow-y: auto`
- 라우트 변경 시 `setOpenSubMenuId(null)`. **외부 클릭 시 자동 닫기는 미구현**
- 메인 `quickMenus` 필터: `!!menuLink && menuLink !== '/sub' && menuLink !== '/my-page'`

## SSR / SEO (kml-front)

### Hybrid SSR
`day-record`, `yakuman-record`, `rank`, `notice` 4개.
- `page.tsx`(server) — 비로그인 기준 초기 데이터 fetch + `metadata` export / `<Page>Client.tsx` — `initialData`를 `useRef` 가드로 store에 1회 hydrate
- 첫 진입 + `initialData` 있으면 client 첫 fetch 스킵(`firstFetchSkipRef`). 검색·페이징·필터는 기존 hook 그대로 CSR
- 서버 fetch는 plain `fetch()` — `lib/axiosInstance.ts`는 `tokenStore.get()`/`window.dispatchEvent` 같은 클라 전용 API를 써서 서버에서 못 부름. 분리 폴더 `services/server/*.server.ts`(`'server-only'`)와 inline 정의가 혼재

### Metadata title 중복 함정
`app/layout.tsx`에 `title.template = '%s | BGM 아지트 BML'`이 있어 자식 `metadata.title`은 **suffix 없이 짧게**(`'역만 기록'`). 잘못 쓰면 `'역만 기록 | BGM 아지트 BML | BGM 아지트 BML'`. `openGraph.title`은 template을 안 거치므로 풀 텍스트로, `alternates.canonical`·`openGraph.url`도 페이지별 명시.

### Soft 404
컨텐츠가 적은 목록 페이지(공지 1개, 랭킹 4명)가 서치콘솔에서 soft 404로 색인 거부될 수 있음 → server `page.tsx`에 `CollectionPage` + `ItemList` JSON-LD 추가(`app/notice/page.tsx`, `app/rank/page.tsx` 참고). 한국어 본문량 늘리는 것도 효과적.

---

## 인프라

### 환경변수
- `bgm-agit-api`는 `me.paulschwarz:spring-dotenv`로 `bgm-agit-api/src/main/resources/.env`를 읽어 yml 플레이스홀더 치환. `.env`는 커밋 금지(`.gitignore`)
- 배포는 **GitHub Secrets → 시스템 환경변수**(시스템 쪽이 `.env`보다 우선)
- **`=` 뒤에 공백 넣지 말 것**(dotenv가 trim 안 함). `spring.config.import`는 불필요
- Next 앱의 `.env.development/.staging/.production`은 **커밋됨**(시크릿 아님). 도커 빌드가 `ENV_FILE` build-arg로 골라 씀

### CI/CD (`.github/workflows`)
- `bgmagit-staging-cicd.yaml`(staging 브랜치) / `bgmagit-cicd.yaml`(main)
- `dorny/paths-filter`로 앱별 변경 감지 → 해당 잡만 실행 (`backend` / `frontend` / `kml_frontend` / `murder_frontend`)
- 백엔드·Next 앱은 도커허브 push 후 SSH로 컨테이너 교체, 메인 프론트는 scp + nginx reload
- staging은 SSH 포트 2222 + `STAGING_*` 시크릿, 운영은 22 + `HOST`/`USERNAME`/`PASSWORD`

### 데이터베이스
- 서버 도커 컨테이너 MySQL 8.0.43. `binlog_format=ROW`, `binlog_row_image=FULL`(플래시백 가능)
- **실수 DELETE 났을 때 절대 하지 말 것**: 컨테이너 재시작, `RESET MASTER`, `PURGE BINARY LOGS`. 복구는 `mysqlbinlog --base64-output=DECODE-ROWS -v` 덤프 후 역변환
- `ddl-auto: none` — 스키마 변경은 **수동 ALTER**(`create.sql`/`create2.sql` 참고)
- 인증 관련 핵심 테이블: `BGM_AGIT_MEMBER` / `BGM_AGIT_MEMBER_ROLE` / `BGM_AGIT_ROLE` / `BGM_AGIT_URL_RESOURCES`(+`_ROLE`, DB 기반 동적 인가 — `BgmAgitAuthorizationManager`)

### 스케줄러 목록
`@EnableScheduling`은 `BgmAgitApiApplication`에 있음. 전부 KST.

| 주기 | 클래스 | 하는 일 |
|---|---|---|
| 매분 | `kml/tournament/.../TournamentScheduler` | 종료시각 지난 대회 CLOSED 전환 |
| 5분 | `BgmAgitBiztalkResultSyncScheduler` | 알림톡 발송 결과 동기화 |
| 매시 정각 | `KmlSyncScheduler` | `kml_synk='N'` 회원 재조회·등록 |
| 매시 30분 | `KmlMatchsRetryScheduler` | KML 기록 전송 실패분 재시도 |
| 09:00 | `BgmAgitAdminReservationNotifyScheduler` | 관리자 당일 예약 알림톡 |
| 01:00 | `BgmAgitFileSchedule` | S3 임시파일 정리 |
| 01:00 | `origin/payment/schedule/BgmAgitPaymentSchedule` | 버려진 READY 주문 정리 |
| 10시간 간격 | `BgmAgitBizTalkServiceImpl.scheduled` | 비즈톡 토큰 재발급 |

---

## 운영 주의사항

1. **KML 닉네임 중복** — 동일 닉네임이 여럿이면 `AMBIGUOUS`로 자동 연결·등록을 안 한다(스케줄러도 마찬가지). 수동 개입 필요. 0건일 때만 신규 등록
2. **회원가입 알림톡은 발행이 주석 처리됨** — 켜려면 `SignupServiceImpl`의 `eventPublisher.publishEvent(...)` 주석 해제
3. **소셜·폼 닉네임 네임스페이스 분리** — `AndSocialType` 없는 조회는 버그
4. **`bgmagit-bml-match` 카카오 검수 대기 중** — 통과 전엔 발송이 거부되고 catch에서 1회 재시도 후 종료. 통과 즉시 자동 발송. 첫 발송 때 URL 중복(`https://https://…`) 여부 확인할 것
5. **URL_RESOURCES에 없는 경로는 기본 permit** — 새 관리자용 POST/PUT/DELETE는 매핑을 넣지 않으면 무방비. 매핑 INSERT 후 **앱 재시작** 필요

## TODO 후보

- 닉네임 변경 시 KML synk 리셋
- `AMBIGUOUS` 수동 해결 UI(마이페이지에서 KML ID 직접 선택)
- `application-*.yml` 정리(`kakao.redirecturi2`, `naver.redirecturi2`, kml-front 소셜 OAuth env)
- 결제: `ABORTED` 기록 남기기(`REQUIRES_NEW`), 외부 호출 트랜잭션 분리, 관리자 확정 슬롯 검증, 노쇼 위약금
- `BGM_AGIT_ROOM` 테이블 분리 / 예약 2테이블 정규화
- 새 엔드포인트 권한 매핑 확인 — `/bgm-agit/ranks/{memberId}/stats`, `.../games`, `/my-rank`
- 대국 기록 알림톡을 수정/삭제 흐름에도 적용(`eventPublisher.publishEvent(new MatchRecordRegisteredEvent(...))` 한 줄씩)
- 메인 퀵메뉴 추가(현재 "내 기록"만 들어감) / 개인기록 "더보기" 영역 / 사이드바 외부 클릭 닫기

---

## 랭크 티어 시스템 — 계획만, 코드 없음

기존 `kml/rank`(기간별 누적 승점 순위표)와 **별개**로 레이팅형(작혼/롤식) 시즌 티어를 신설하기로 함. 누적 합산은 "많이 친 사람"이 이기는 볼륨 편향이 있어서. 원 아이디어 문서 `랭크시스템_계획서.html`은 누적 승점+월 리셋안이라 아래 결정으로 대체됨.

### 확정된 결정
- **모델**: 착순별 고정 포인트 × 게임길이 가중치(동0.5/반1.0/서1.5/전2.0)로 판마다 레이팅 ±, 밴드로 티어 결정
  - 가중치 idiom은 `RankRepository.findRanks`에 이미 있음. **`MatchsWind` 기준이지 `recordSeat` 아님**. `CalculateUtil.seatMultiplier`(우마용 1/2/3/4)와 혼동 금지
- **시즌**: 관리자가 DB로 정의(이름·기간·리셋방식·티어이름·밴드·포인트). 튜닝은 SQL UPDATE, 설정 UI는 후순위
- **리셋 방식**: HARD / SOFT(일부 계승) / CONTINUOUS(상시 래더)
- **강등 방지 있음** — 시즌 중 도달한 티어 밑으로 안 떨어짐(`PEAK_FLOOR`). 순차 의존이라 **SQL 백필 불가, 코드 replay만 정확**
- **CLOSED 시즌도 재계산**(과거 기록 정정 시)
- **배치(placement)**: 최소 판수 미만은 provisional. `MatchsRepositoryImpl.getYearRanks`의 requiredGames 선례 참고

### 설계 요지
- 테이블 4종 `BGM_AGIT_RANK_SEASON / _TIER / _POINT / _STANDING`(수동 DDL). TIER는 시즌 종속, POINT는 tier NULL=시즌 기본 + 티어별 오버라이드, STANDING은 회원×시즌 실시간값
- 패키지 `com.bgmagitapi.kml.ranktier`. 이벤트 DTO만 관례상 `origin/event/dto/RankTierRecalcEvent`
- **레이팅은 재합산이 아니라 replay** — 각 판 ±가 그 시점 티어에 의존(경로 의존)이라 시즌 시작부터 `matchs.registDate` 순으로 재생
- **이벤트를 4곳 모두에 달아야 함** — `RecordServiceImpl`의 생성·수정·삭제·복구. 현재 `createRecord`만 알림톡용 이벤트를 발행한다. 리스너는 `KmlRecordEventListener` 패턴 미러, 실패는 삼켜 로깅
- 조회 API는 공개 GET 4종(`/bgm-agit/rank-tiers/{standings,members/{id},config,badges}`). **관리자 `POST /recalc-all`은 URL_RESOURCES에 ADMIN 매핑 필수**
- 프론트 `/rank-tier` + `TierBadge`(zustand 캐시, `/badges` 배치로 N+1 방지)

### 미결
티어 이름·개수·레이팅 컷·착순 포인트 실제 값(현재 placeholder: base 1500, 급위/초단/삼단/사범, 1위 +60 ~ 4위 -60) / 전 티어 바닥보호 유지할지 / 첫 시즌 리셋 방식.

---

## 자주 쓰는 경로

- 인증·시큐리티: `bgm-agit-api/.../origin/security/`
- KML 연동: `bgm-agit-api/.../origin/security/service/kml/`
- 결제: `bgm-agit-api/.../origin/payment/`, 프론트 `bgm-agit-front/src/components/payment/`, `src/pages/Payment{Success,Fail}.tsx`
- 예약: `bgm-agit-api/.../origin/{controller/BgmAgitReservationController, service/impl/BgmAgitReservationServiceImpl, util/SlotSchedule}.java`, 프론트 `src/pages/{ReservationList,ReservationBoard}.tsx`, `src/components/ReservationCalendar.tsx`
- 알림톡: `bgm-agit-api/.../origin/{util/Alimtalk*, service/BgmAgitBizTalk*, service/impl/BgmAgitBizTalk*Impl, event/BizTalkEventListener, event/dto/*Event}.java`
- 마이페이지: `bgm-agit-api/.../origin/service/{BgmAgitMyPageService,impl/BgmAgitMyPageServiceImpl}.java`, 프론트 `bgm-agit-front/src/components/MyPageModal.tsx`
- 마작 도메인: `bgm-agit-api/.../kml/{lecture,notice,record,rank,tournament,...}/`
- kml-front: `app/{login,signup}/page.tsx`, `services/auth.service.ts`, `app/components/Sidebar.tsx`, `app/rank/[memberId]/{page,MemberRankClient}.tsx`, `app/my-rank/page.tsx`
