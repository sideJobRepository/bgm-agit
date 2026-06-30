# bgm-agit

한국마작연맹(KML) 기록 생태계와 연동되는 bgm-agit(마작장) 도메인 시스템.

## 구성

- `bgm-agit-api` — Spring Boot 3.4.7 / Java 17 / JPA + QueryDSL / MySQL 8.0
- `bgm-agit-front` — 메인 도메인 프론트 (Vite, 포트 5173 예상). **자체로그인(폼) 주력 + 소셜은 기존 회원 전용** (2026-06-30 전환, 아래 "메인사이트 자체로그인 전환" 참고)
- `bgm-agit-kml-front` — Next.js 15+ (`basePath: /record`). 여기선 **일반 폼 로그인** 사용
- 같은 API·같은 DB·같은 JWT를 공유하는 SSO 구조

## 인증 설계

### 로그인 경로 3가지
| 경로 | 누가 쓰나 | 입력 |
|---|---|---|
| `POST /bgm-agit/kakao-login` | `bgm-agit-front` | 카카오 `code` (**기존 가입 회원만**, 신규 소셜 가입 차단) |
| `POST /bgm-agit/naver-login` | `bgm-agit-front` | 네이버 `code` (**기존 가입 회원만**) |
| `POST /bgm-agit/login` | `bgm-agit-front` | `{ nickname, password }` (자체로그인, MAHJONG) → `refreshToken_main` |
| `POST /bgm-agit/next/login` | `bgm-agit-kml-front` | `{ nickname, password }` (자체로그인, MAHJONG) → `refreshToken_record` |

성공 시 네 경로 모두 동일한 JWT 액세스 토큰을 발급하지만, **리프레시 쿠키는 앱별로 분리**됨. 발급 로직은 `BgmAgitAuthenticationSuccessHandler`. **쿠키 이름은 요청 URI로 결정** (`/bgm-agit/next/login`이면 `refreshToken_record`, 그 외(`/login`, `/kakao-login`, `/naver-login`)는 `refreshToken_main`). 그래서 메인 폼로그인은 `/bgm-agit/login`(= `/next/login` 아님)으로 둬서 `refreshToken_main`을 받게 한 것.

### 리프레시 토큰 쿠키 분리 (메인 ↔ /record 자동 로그인 차단)
같은 도메인 하위 `/`(bgm-agit-front, 소셜 로그인)와 `/record`(kml-front, 폼 로그인)에서 서로 다른 쿠키를 사용해 한쪽 로그인이 다른 쪽으로 새지 않도록 함.
- `/bgm-agit/next/login` 성공 → `refreshToken_record` 쿠키
- `/bgm-agit/login`, `/bgm-agit/kakao-login`, `/bgm-agit/naver-login` 성공 → `refreshToken_main` 쿠키
- 쿠키 이름 상수: `BgmAgitAuthenticationSuccessHandler.COOKIE_NAME_MAIN/_RECORD`
- `POST/DELETE /bgm-agit/refresh?source=main|record` — `source` 쿼리 파라미터로 어느 쿠키를 읽고 다시 굽거나 지울지 결정 (`BgmAgitRefreshTokenController`). 디폴트는 `main`.
- 프론트는 자기 쪽 source를 박아서 호출:
  - `bgm-agit-front/src/utils/axiosInstance.ts` → `?source=main`
  - `bgm-agit-kml-front/lib/axiosInstance.ts` → `?source=record`
  - 로그아웃 DELETE도 동일 (`Sidebar.tsx`, `TopHeader.tsx`)
- 결과: 카카오로 메인 로그인해도 `/record`에는 `refreshToken_record`가 없어서 자동 로그인이 안 되고, `/record`에서 폼 로그인해도 메인은 영향 없음. 기존 단일 `refreshToken` 쿠키는 더 이상 사용 안 함 (만료까지 무해하게 남아있음).

### 소셜타입 네임스페이스 분리
`BgmAgitSocialType`: `KAKAO / NAVER / GOOGLE / MAHJONG`
- **`MAHJONG`** = 폼 가입(일반 로그인) 유저. `bgm-agit-kml-front`의 회원가입으로만 생성
- 폼 로그인 시 닉네임 조회는 **반드시 `socialType = MAHJONG` 필터** 포함
  - `findByBgmAgitMemberNicknameAndSocialType(nickname, MAHJONG)`
  - `existsByBgmAgitMemberNicknameAndSocialType(nickname, MAHJONG)`
- 이유: 소셜 유저와 닉네임이 우연히 겹쳐도 계정이 섞이지 않게

### 회원가입 (폼)
- 엔드포인트: `POST /bgm-agit/next/signup` (kml-front `/record/signup` + **메인 `bgm-agit-front` 회원가입 모달** 둘 다 이 엔드포인트 사용)
- 입력: `{ name, nickname, phoneNo, password(백엔드 @Size min=4) }`
- BCrypt 해시(`PasswordEncoder` Bean은 `security/config/PasswordConfig.java`)
- `USER` role 자동 부여 (`BgmAgitMemberDetailRepositoryImpl.findByBgmAgitRoleName("USER")`)
- 회원가입 시 알림톡 발행은 **주석 처리된 상태** (`SignupServiceImpl.signup` 내 `eventPublisher.publishEvent(...)` 주석)

## 메인사이트 자체로그인 전환 (2026-06-30)

`bgm-agit-front`를 소셜 전용에서 **자체로그인(폼) 주력**으로 전환. 신규 회원은 자체가입으로만 받고, 소셜은 기존 회원 로그인만 유지. 같은 MAHJONG 계정이 메인↔BML 양쪽에서 동일 자격증명으로 로그인됨(리프레시 쿠키는 `_main`/`_record`로 계속 분리).

### 신규 소셜 가입 차단
- `BgmAgitMemberDetailService.loadUserByUsername(SocialProfile)`: 소셜ID 미존재 시 신규 생성 대신 `SocialLoginNotAllowedException("소셜 로그인은 기존 가입 회원만 이용할 수 있습니다. 신규 회원은 자체 회원가입을 이용해 주세요.")` 발생. 기존 `registerNewMember`/`normalizePhone`/`socialTypeLabel`·`eventPublisher` 제거
- `BgmAuthenticationFailureHandler`에 `SocialLoginNotAllowedException` 메시지 그대로 전달 분기 추가 (`DuplicateMemberException`과 동일 패턴. `BadCredentialsException`은 "인증에 실패하였습니다"로 덮이므로 메시지 노출하려면 전용 예외 필요)

### 메인 폼로그인 엔드포인트 `POST /bgm-agit/login`
- 로그인 경로 매처가 **두 곳**: `BgmAgitAuthenticationFilter` 생성자 + `BgmAgitSecurityDsl.LOGIN_MATCHER`. 둘 다 추가해야 함
- `BgmAgitAuthenticationFilter`: 상수 `MAIN_FORM_LOGIN_PATH = "/bgm-agit/login"`, 폼 분기 조건 `FORM_LOGIN_PATH || MAIN_FORM_LOGIN_PATH`. 인증은 기존 `FormAuthenticationProvider`(닉네임+비번, MAHJONG) 재사용
- 성공 핸들러·permitAll 변경 불필요 (로그인 프로세싱 URL은 필터가 인가 전 가로챔)

### 프론트 (bgm-agit-front)
- `utils/axiosInstance.ts` `isAuthEndpoint`에 `/bgm-agit/login` 추가 (리프레시는 이미 `?source=main`)
- `recoil/fetch.ts`: `useFormLoginPost`(`/bgm-agit/login`), `useSignupPost`(`/bgm-agit/next/signup`) 추가 (기존 소셜 `useLoginPost` 패턴 미러)
- `components/LoginMoadl.tsx`: 자체로그인 폼 + 회원가입 토글(한 모달 내 mode 전환) + 소셜 버튼은 "기존 소셜 회원 로그인" 보조. **로그인 성공 직후 `window.location.reload()`** — `getMainMenu`가 서버에서 로그인 권한으로 메뉴 필터링하므로, 새로고침해야 권한 메뉴(마이페이지 등)가 보임. 카카오는 OAuth 왕복으로 자연 재조회됨
- 자체로그인 판별 신호: **`user.socialId`가 없으면 MAHJONG(자체로그인)**. 소셜 회원은 socialId 보유

### KML 연동 (의도적으로 유지)
- 메인 회원가입도 `/next/signup`을 쓰므로 `kmlUserClient.findOrRegisterKmlIdByNickname`로 KML 조회·자동등록 호출됨. 계정 공유 구조상 무해하다고 판단해 **그대로 둠**(메인 가입만 빼려면 signup 요청에 skipKml 플래그 추가)

### 함정: ApiResponse(403) 은 HTTP 200
`ApiResponse(code, success, message)`는 컨트롤러에서 평범히 반환되어 **항상 HTTP 200**. 프론트 `useRequest`는 2xx면 `onSuccess` 실행 → 403 본문이어도 "성공" 토스트가 뜨는 false-success. 권한/타입 차단은 백엔드 enforcement + **프론트 UI 가드(버튼 숨김/제출 가드)** 둘 다 필요.

## 시계탑/머더 자체로그인 전용화 (2026-06-30)

### 회원 검색 MAHJONG만
- `/bgm-agit/all-members`(`BgmAgitPlayRecordServiceImpl.searchMembers`) 필터를 `KAKAO/NAVER` → **`MAHJONG`**로 반전. 시계탑(`ClockTowerRecordDetail` 인라인 검색)·머더(`MemberMultiSelect`)가 공유하는 엔드포인트라 양쪽 드롭다운 동시 적용

### 시계탑 기록 등록·수정·삭제 = 자체로그인 전용 (조회는 누구나)
- 백엔드 `BgmAgitClockTowerRecordServiceImpl`: `createRecord`는 writer socialType이 MAHJONG 아니면 403. `modify/deleteRecord`는 `requireClockTowerWriter(memberId, roles)` 가드 — 비MAHJONG 403, **관리자는 모더레이션 위해 예외 허용**
- 프론트: `ClockTowerRecords` "기록하기" 버튼·`ClockTowerRecordDetail` 수정/삭제 버튼·`onSubmit`을 `canWrite = isSelfLogin || isAdmin`로 가드 (`isSelfLogin = !!user && !user.socialId`)

## 마이페이지 정리 (2026-06-30)
- `MyPageModal`에서 **EMAIL·마작기록 사용 여부 제거** (자체로그인 회원정보엔 불필요). 남는 항목: 가입일자/이름/닉네임/휴대폰번호
- **`mahjongUseStatus`(BGM_AGIT_MEMBER_MAHJONG_USE_STATUS) 컬럼 코드 전부 제거** — DB 컬럼 드롭 예정. 제거 위치: 엔티티 필드·`@Column`·두 생성자·`modifyMyPage`, `BgmAgitMemberRepositoryImpl`의 마이페이지 QueryDSL 프로젝션 인자(이게 컬럼 SELECT), `BgmAgitMyPageGetResponse`(필드+@QueryProjection 생성자), `BgmAgitMyPagePutRequest`, 프론트 `types/user.ts`·`userState.ts`. 드롭 SQL: `ALTER TABLE BGM_AGIT_MEMBER DROP COLUMN BGM_AGIT_MEMBER_MAHJONG_USE_STATUS;`
- 마이페이지 조회(`getMyPage`)는 socialType 무관(누구나 노출). socialType 분기는 `changeMyPassword`에만 있고 **MAHJONG만 비번 변경 가능**(소셜은 비번 없음)

### 보호막: 로그인 시 role 누락되면 USER 자동 부여
`BgmAgitMemberDetailService.ensureDefaultRole(BgmAgitMember)` — 소셜·폼 두 경로 공통 호출.
DELETE 사고로 `BGM_AGIT_MEMBER_ROLE`가 날아간 기존 유저도 로그인하면 자연 복구됨.

## KML 연동

### 설정 (application.yml)
```yaml
kml:
  url: https://kml.or.kr/stat52     # stat 번호 52 = bgm-agit
  api:
    key: ${KML_API_KEY}                    # x-api-key 헤더 값
```

### KML API (bgm-agit 기준)
- `GET /api_users.php` — 전체 사용자 리스트 반환 `{status, count, users: [{id, nick}]}`
- `POST /api_user_register.php` — 신규 사용자 등록 `{nick}` → `{status, user_id, nick, message}` (409면 이미 존재)
- `POST /api_record_submit.php` — 기록 전송 `{game_length, common_point, players[4]{user_id, point, wind}}` → `{status, record_id, sum_check}`
- `POST /api_record_modify.php` — 기록 수정 `{modify_id, game_length, common_point, players[4]}` → `{status, modify_id, sum_check}` (404면 대상 미존재)
- 모두 `x-api-key` 헤더 필요. 삭제 API는 KML이 아직 안 만들어줌
- 매핑: `MatchsWind`/`Wind` enum의 `ordinal()`이 그대로 0=동/1=남/2=서/3=북. `point`는 `recordScore` (정수). `common_point`는 현재 추적하지 않아 0 고정

### 기록 송신 (등록) 흐름
- `RecordServiceImpl.createRecord` 마지막에 `KmlRecordSubmitEvent` 발행 (`publishKmlSubmitEvent`) — 이벤트에 `matchsId` 포함
- 4명 중 한 명이라도 `bgmAgitMemberKmlId == null`이면 송신 자체를 생략 (KML이 4명 정확히 요구하기 때문)
- `KmlRecordEventListener.onRecordSubmit` (`@Async("bizTalkExecutor")`, `@TransactionalEventListener AFTER_COMMIT`) → `KmlRecordClient.submit(...)` → 응답의 `record_id` 추출 → `KmlMatchsLinker.linkKmlMatchsId(matchsId, recordId)` 별도 트랜잭션에서 `BGM_AGIT_MATCHS.BGM_AGIT_MATCHS_KML_ID` 저장
- 송신 실패는 모두 catch 후 `log.warn`만. **DB 저장 트랜잭션과 분리**되어 있어 KML이 에러나도 우리쪽 기록은 정상 저장됨

### 기록 송신 (수정) 흐름
- `RecordServiceImpl.updateRecord` 마지막에 `publishKmlModifyEvent` — `matchs.matchsKmlId`가 null이면 스킵 (등록 미송신 게임은 수정도 송신 안 함, fallback submit 안 함)
- 4명 중 KML 미연동 회원 있으면 스킵 (등록과 동일)
- `KmlRecordEventListener.onRecordModify` → `KmlRecordClient.modify(...)`
- 응답은 따로 저장하지 않음 (`modifyId`는 이미 알고 있음)
- 삭제(`removeRecord`)는 KML 송신 안 함 — KML 측 delete API 없음

### 회원-KML 연결
- 회원가입 시 닉네임으로 KML 조회·자동 등록(`KmlUserClient.findOrRegisterKmlIdByNickname`)
- 단건 매칭 → `BGM_AGIT_MEMBER.BGM_AGIT_MEMBER_KML_ID` 저장 + `BGM_AGIT_MEMBER_KML_SYNK = 'Y'`
- **0건 매칭 → KML `api_user_register.php` 호출하여 자동 등록 후 발급된 `user_id` 저장 + `synk = 'Y'`**
  - 등록 시 409 충돌이면 단건 재조회로 폴백, 그래도 안 되면 `synk = 'N'`
- 다건 매칭(`AMBIGUOUS`) / 502·네트워크·파싱 오류 → `kml_id = null` + `synk = 'N'` (가입은 계속 진행)

### 자동 재시도 스케줄러
`KmlSyncScheduler` + `KmlSyncService`
- `@Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")` — 매시 정각
- `synk = 'N'` 유저 배치 조회 → `findOrRegisterKmlIdByNickname` 재호출 → 성공 시(매칭 또는 신규 등록) `linkKml(id)`로 상태 `'Y'` 전환
- `BgmAgitApiApplication`에 `@EnableScheduling` 이미 있음

### 닉네임 변경 시 주의
현재 마이페이지 닉네임 변경 로직에서 `kml_synk` 리셋은 **미구현**. 나중에 변경 기능 손볼 때:
- 닉네임 바뀌면 `markKmlSyncFailed()` 호출해서 `'N'`으로 리셋
- 다음 스케줄러 주기에 새 닉네임으로 다시 KML 조회됨

## 데이터베이스

### 접근 방식
- 서버 도커 컨테이너 MySQL 8.0.43
- `binlog_format = ROW`, `binlog_row_image = FULL` (플래쉬백 가능)
- 실수 DELETE 났을 때 절대 하지 말 것: 컨테이너 재시작, `RESET MASTER`, `PURGE BINARY LOGS`
- 복구는 `mysqlbinlog --base64-output=DECODE-ROWS -v` 로 덤프 후 역변환

### 핵심 테이블 (auth 관련)
- `BGM_AGIT_MEMBER` — 회원. 소셜·폼 혼재. 폼 유저는 `socialType = 'MAHJONG'`
- `BGM_AGIT_MEMBER_ROLE` — 회원 ↔ 역할 매핑
- `BGM_AGIT_ROLE` — 역할 정의 (USER, ADMIN 등)
- `BGM_AGIT_URL_RESOURCES` / `BGM_AGIT_URL_RESOURCES_ROLE` — URL별 권한 매핑(DB 기반 동적 인가, `BgmAgitAuthorizationManager` 참조)

### Hibernate DDL
`ddl-auto: none`. 스키마 변경은 수동 ALTER. `create.sql`/`create2.sql` 참고.

## 프론트 개발 팁 (kml-front)

- `basePath: /record` — 모든 경로에 `/record` 프리픽스
- API 호출은 Next.js rewrite로 `/bgm-agit/*` → `${NEXT_PUBLIC_API_URL}/bgm-agit/*` 프록시
- `axiosInstance`가 access token(`tokenStore` 메모리) / refresh token(HttpOnly 쿠키) 자동 처리
- 보호 라우트 가드: `RouteAuthGuard.tsx`, 리다이렉트는 `/login?redirect=...`
- Kakao SDK(`KakaoProvider`)는 **공유하기 SDK**용 (`NEXT_PUBLIC_KAKAO_JS_KEY`). 로그인과는 무관
- **반응형 원칙** — 사용자가 거의 휴대폰으로 입력. `theme.device.mobile`(`max-width: 844px`) 기준으로 점검:
  - input/select 모바일은 `font-size: 16px` (iOS Safari 자동 줌 방지)
  - 데스크탑에서 `flex-wrap: nowrap; overflow-x: auto` 인 검색/필드는 모바일에서 `flex-wrap: wrap`으로 풀어주기 (`write/page.tsx`, `BaseTable.tsx`, `role/page.tsx` 패턴 참고)
  - 표는 모바일에서 부모에 `overflow-x: auto`, table에 `min-width` 두고 가로 스크롤
  - `Wrapper`의 `min-width: 1280px`은 `@media tablet` 블록에서 `100%`로 풀어줘야 함

### 사이드바 sub 메뉴 (`Sidebar.tsx`)
DB의 `BGM_AGIT_KML_MENU.BGM_AGIT_KML_SUB_MENU_ID`가 부모 메뉴 ID. 백엔드(`KmlMenuServiceImpl`)에서 `parentMenuId`로 트리 구성, `subMenus[]` 배열로 묶어 반환.
- **부모 메뉴 분기 (Sidebar)**:
  - `menuLink === '/my-page'` → 마이페이지 모달 오픈
  - `!menuLink || menuLink === '/sub'` → sub 펼침 토글 (link 없는 부모도 sub 컨테이너로 동작)
  - 그 외 → 일반 `<Link>`
- **sub 안 `/my-page`** 도 모달 오픈 (마이페이지를 sub로 옮긴 경우 대응)
- 데스크탑: sub `position: absolute` 드롭다운. **`SidebarWrapper { overflow: visible }`** 필수 — 헤더가 가로 일렬이라 absolute로 안 띄우면 다른 메뉴가 밀리거나 잘림
- 태블릿/모바일: sub `position: static` 인라인 펼침 + `padding-left: 16px` 들여쓰기. `SidebarWrapper { overflow-y: auto }`
- 라우트 변경 시 `setOpenSubMenuId(null)` (펼친 채 남는 버그 방지)
- **메인 페이지 `quickMenus` 필터** — `!!menuLink && menuLink !== '/sub' && menuLink !== '/my-page'`. 즉 link 없는 부모도 제외 (root만 단일 액션 가능, 부모는 sub 컨테이너 역할이라 메인 퀵메뉴엔 안 띄움)

## SSR / SEO 패턴 (kml-front)

### Hybrid SSR
`day-record`, `yakuman-record`, `rank`, `notice` 4개 페이지는 hybrid SSR로 변환됨.
- `app/<page>/page.tsx` — server component. 비로그인 기준으로 초기 데이터 fetch + `metadata` export
- `app/<page>/<Page>Client.tsx` — `'use client'`. `initialData` prop을 받아 `useRef` 가드로 zustand store에 1회 hydrate
- 첫 진입 + `initialData` 있으면 client 측 첫 fetch 스킵 (`firstFetchSkipRef`) — 불필요한 재요청 방지
- 검색·페이지네이션·필터는 기존 hook 그대로 (CSR)
- 서버 fetch는 plain `fetch(`${process.env.NEXT_PUBLIC_API_URL}/...`)` 사용. `lib/axiosInstance.ts`는 `tokenStore.get()`/`window.dispatchEvent` 등 클라이언트 전용 API를 써서 서버에서 못 부름
  - 분리 폴더: `services/server/*.server.ts` (`'server-only'` 가드) 또는 `page.tsx` 내부에 inline 정의 — 둘 다 혼재 중

### Metadata 주의 (title 중복 함정)
- `app/layout.tsx`에 `title.template = '%s | BGM 아지트 BML'` 있음. 자식 페이지의 `metadata.title`이 자동으로 ` | BGM 아지트 BML` suffix를 받음
- 따라서 페이지별 `metadata.title`은 **suffix 없이 짧게** 작성: `'역만 기록'`, `'랭킹'`, `'월간/일간 기록'` 등
- 잘못 작성하면 `'역만 기록 | BGM 아지트 BML | BGM 아지트 BML'`로 중복됨
- `openGraph.title`은 template 안 거치므로 풀 텍스트(`'역만 기록 | BGM 아지트 BML'`)로 명시
- `alternates.canonical`, `openGraph.url`도 페이지별로 명시

### Soft 404 대응
구글 서치콘솔에서 컨텐츠가 적은 목록 페이지(공지 1개, 랭킹 4명 등)가 **soft 404**로 분류되어 색인 거부될 수 있음.
- 대응: server `page.tsx`에서 `<script type="application/ld+json">` 으로 페이지별 `CollectionPage` + `ItemList` 구조화 데이터 추가 (`app/notice/page.tsx`, `app/rank/page.tsx` 참고)
- 본문 한국어 텍스트량 늘리는 것도 효과적 (특히 rank처럼 칼럼이 숫자/율 위주인 페이지)

## 기록 입력 UX 규칙 (write/page.tsx)

### 점수 자동 계산
- 4자리(동/남/서/북) 중 **사용자가 직접 입력 안 한 자리**(`scoreEditTime[key] === 0`)가 자동 계산 대상
- 어느 3자리든 입력하면 나머지 1자리가 `refund - sum(others)`로 자동 계산
- 기본 자동 계산 대상은 NORTH (기존 동작 호환)
- 4자리 모두 사용자가 직접 입력 시 자동 계산 정지 (수동 모드). 칸 비우면(`score === ''`) timestamp가 0으로 리셋되어 다시 자동 계산 후보로 복귀
- 자동 계산 effect는 `Number.isNaN` 체크로 `'-'` 단독 입력시 NaN 발산 방지

### 모바일 ± 부호 토글 (`SignButton`)
- 점수 input은 `type="text"` + `inputMode="numeric"` + `^-?\d*$` 정규식 검증 — `-`만 단독으로 표시하기 위해 (type=number는 안 됨)
- 빈 값에서 ± 누르면 `-` 입력 → 이후 숫자 타이핑하면 음수 완성
- `0`에서 누르면 무시 (`-0` 방지)
- 값이 있으면 부호 토글 (`'1000'` ↔ `'-1000'`)

### "내 닉네임" 버튼
- 동/남/서/북 각 자리 + 역만 행마다 `<MeButton>` 좌측 배치, 휴지통(역만 전용)은 우측. 같은 줄로 분리해 오클릭 방지
- 클릭 시 `Number(user.id)`를 `recordUser`(`socialType=MAHJONG` 멤버 목록)에서 찾아 해당 자리 `userId`로 세팅
- 회원 목록에 본인 정보 없으면 alert 출력 (마작 회원 미등록자 대응)

## 기록 권한·랭킹 (bgm-agit-kml-front 운영)

### 마작 회원 식별
- 닉네임 드롭다운(기록 입력)은 `socialType = MAHJONG`으로만 필터 (`YakumanTypeRepositoryImpl.getMembers()`). 과거의 `bgmAgitMemberMahjongUseStatus` 필터는 사용 안 함
- 관리자가 권한을 주려면 `socialType=MAHJONG` 회원을 만든 뒤 권한 부여 화면에서 ROLE 변경

### `/role` (관리자, kml-front)
- `app/role/page.tsx` — `socialType=MAHJONG` 회원만 페이지네이션, 닉네임/이름/연락처 검색
- `GET /bgm-agit/mahjong-role` (BgmAgitRoleController) → 마작 회원 + 권한 페이지 반환
- 권한 변경: 기존 `PUT /bgm-agit/role` 재사용 (memberId, roleId 배열). roleId: 1=관리자, 4=멘토, 2=유저
- 비밀번호 변경: `PUT /bgm-agit/mahjong-role/password` — `socialType=MAHJONG`인 경우만, BCrypt 해시. `BgmAgitMember.changePassword(...)`

### 랭킹 검색 타입 (RankType)
- `WEEKLY` — `baseDate`가 속한 주 월요일 00:00 ~ 다음 주 월요일 00:00
- `MONTHLY` — `baseDate`의 1일 00:00 ~ 다음 달 1일 00:00
- `CUSTOM` — `startDateTime`/`endDateTime` 그대로 사용 (시·분 단위 필터). 검증: 둘 다 필수, end > start
- 컨트롤러: `GET /bgm-agit/ranks?type=...&baseDate=...|startDateTime=...&endDateTime=...`
- repository는 `LocalDateTime` 범위로 비교 (`record.registDate.goe(start).and(.lt(end))`)
- 프론트 UI: `BaseTable`이 `rankType` 따라 주 픽커 / 년월 픽커 / datetime 두 개로 분기

### 개인기록 (memberId 기준)
랭킹 표 닉네임 클릭 → `/rank/{memberId}`로 진입. 차트·단(段) 시스템 안 씀, 표·카드 중심 (실용적 방향).
- 백엔드: `RankServiceImpl.findMemberStats / findMemberRecentGames`, 쿼리는 `RankRepository`에 4개 메서드(`findMemberCards / findMemberSeatStats / findMemberTopRivals / findMemberMatchIds`)
  - `GET /bgm-agit/ranks/{memberId}/stats?year=` — 카드 통계(총국수/평균순위/총승점/1·4위/토비/+30000/-2등) + 자리별×순위별 표(동·남·서·북장 각각, 1~4위 + 토비 행) + 같이 친 TOP3
  - `GET /bgm-agit/ranks/{memberId}/games?page=&year=` — 최근 경기 페이징. matchs id를 본인 record로 페이징 → `RecordRepository.findRecordsByMatchIds`로 4명 record 묶어 반환
  - `year` 생략 = 전체 기간
- 프론트: `app/rank/[memberId]/page.tsx` + `MemberRankClient.tsx` — **CSR (SSR 안 씀)**. styled-components로 작성, 외부 차트 라이브러리 의존 없음
- 진입 동선:
  - `app/rank/RankClient.tsx`의 닉네임 셀 → `Link href="/rank/{memberId}"`
  - 메인 퀵메뉴 "내 기록"(로그인 시 노출, `UserCircle` 아이콘) → `/rank/{user.id}`
  - DB 메뉴로 등록할 땐 `/my-rank`로 적기 — `app/my-rank/page.tsx`가 본인 id로 redirect (비로그인이면 `/login?redirect=/my-rank`)
- 자리별 표 비율 규약 (스샷 기준):
  - **전체%** = 그 wind 총국수 분모
  - **동·남·서·북%** = 그 자리에 앉은 합계(rank 1~4 합) 분모. 토비 행도 동일 분모
  - 표시: 소수점 2자리, 끝의 0 자동 제거 (`23.80%` → `23.8%`, `25.00%` → `25%`)
- **QueryDSL 함정** — 이 프로젝트 환경에서 다음이 컴파일 실패:
  - `new CaseBuilder().when(...).then(1L).otherwise(0L).sum()` → `method sum cannot be applied: required: Class<P>`
  - `record.recordPoint.sum()`, `record.recordRank.avg()` 등 NumberPath 인스턴스 집계 메서드도 동일 증상
  - 우회: 모두 `Expressions.numberTemplate(Long.class, "SUM({0})", flag)` / `Expressions.numberTemplate(Double.class, "AVG({0})", path)` 패턴으로. 기존 `findRanks` 메서드도 같은 패턴 사용 중
- **RecordQueryRepository 주입 충돌** — 인터페이스로 주입하면 `RecordRepository`(JpaRepository extends) + `RecordRepositoryImpl` 두 빈이 매칭되어 기동 실패. 주입은 항상 `RecordRepository`로 (다른 서비스도 모두 그렇게 함)

## 알림톡 (BizTalk)

비즈톡 API(`https://www.biztalk-api.com/v2/kko/sendAlimTalk`)로 카카오 알림톡 발송. 센더키는 `biztalk.sender-key` env.

### 코드 구조
- 템플릿 코드 상수: `util/AlimtalkTemplate.java` (interface, `String` 상수만)
- 메시지 빌더: `util/AlimtalkUtils.java` — StringBuilder 기반 정적 메서드. 점수 포맷터(`formatMatchScore`, `formatMatchPoint`)·전화번호 정규화(`formatRecipientKr`)도 여기
- 발송 서비스: `service/BgmAgitBizTalkSandService(.Impl)` — `sendTalk(...)` 공통 + 발송이력(`BgmAgitBiztalkSendHistory`) 저장
- 이벤트 리스너: `event/BizTalkEventListener.java` — `@Async("bizTalkExecutor")` + `@TransactionalEventListener(AFTER_COMMIT)`. catch에서 1회 재시도하는 패턴 (부분 실패 시 중복 발송 가능성 있음)

### 발송 이벤트 종류
- `MemberJoinedEvent` — 회원가입 (현재 발행 주석처리)
- `ReservationWaitingEvent` / `ReservationTalkEvent` — 룸 예약 대기·완료·취소
- `InquiryEvent` — 1:1 문의 등록/답변
- `LecturePostEvent` / `MyAcademyApprovalEvent` / `MyAcademyCancelEvent` — 마작 강의
- `ReviewPostEvents` — 강의 리뷰
- **`MatchRecordRegisteredEvent`** — 대국 기록 등록 (이번에 추가)

### 대국 기록 알림톡 (`bgmagit-bml-match`)
- 카카오 검수 진행중 — 통과 전엔 BizTalk가 발송 거부
- 발행: `RecordServiceImpl.createRecord` 마지막에 `eventPublisher.publishEvent(new MatchRecordRegisteredEvent(matchs.getId()))`
- 리스너: `BizTalkEventListener.onMatchRecordRegistered` → `BgmAgitBizTalkSandServiceImpl.sendMatchRecord(matchsId)`
- 발송 필터 (4명 각각): **`socialType=MAHJONG` AND `bgmAgitMemberAlimtalkStatus="Y"` AND `phoneNo` 존재** 셋 다 만족해야
- 4인 대국 + 동남서북 자리 모두 채워졌을 때만 발송 (1명이라도 누락이면 전체 skip)
- 메시지 변수: `#{기록ID}`, `#{기록일자}`, `#{동/남/서/북닉네임}`, `#{...점수}`, `#{...승점}` (총 14개)
- 점수 포맷 `38,100` (천 단위 콤마), 승점 포맷 `+18.1`/`-39.6` (양수면 부호 붙음)
- 버튼 URL: 코드는 `https://bgmagit.co.kr/record/rank/{memberId}`로 보냄. 카카오 템플릿엔 `https://bgmagit.co.kr/record/rank/#{memberId}` 패턴 권장 (`https://#{url}`보다 검수 통과 잘됨)
- **수정/삭제 흐름엔 미적용** — `updateRecord`/`removeRecord`에서도 발송하려면 같은 이벤트 발행 한 줄 추가

### 알림톡 ON/OFF (마작 회원 전용)
- 컬럼: `BGM_AGIT_MEMBER.BGM_AGIT_MEMBER_ALIMTALK_STATUS` (`Y`/`N`)
- 엔티티 필드: `BgmAgitMember.bgmAgitMemberAlimtalkStatus`
- 신규 가입 시 두 생성자 모두 `"Y"` 박음. 소셜 회원도 박혀있긴 한데 발송 필터에 `socialType=MAHJONG`이 같이 있어서 사실상 무시됨
- 마이페이지 토글: `MyPageModal.tsx` "알림 설정" 섹션. 토글 시 confirm → `PUT /bgm-agit/mypage`로 즉시 저장. 백엔드는 `BgmAgitMyPagePutRequest.alimtalkStatus` → `BgmAgitMember.modifyMyPage()`
- 조회 응답에도 포함: `BgmAgitMyPageGetResponse.alimtalkStatus` (QueryProjection 생성자에 인자 추가됨, Q-class 재생성 필요)

### 휴대폰 번호 형식
- `@PhoneValid` 정규식: `^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$` — **하이픈 선택**
- 통과: `010-1234-5678`, `01012345678`, 혼합도 OK
- DB 저장은 사용자 입력 그대로 (`normalizePhone`은 `+82`만 `0`으로 변환)
- 발송 시 `formatRecipientKr()`이 숫자만 추출해 `010-1234-5678`로 재포맷하므로 어떤 형식으로 저장돼도 발송 가능

## 운영상 주의사항 (현장에서 겪은 이슈)


1.**KML 닉네임 중복** — 동일 닉네임 여러 명 있을 수 있음. 단건일 때만 자동 연결, 다건은 `AMBIGUOUS` 취급되어 스케줄러도 연결·자동 등록 안 함 (수동 개입 필요). 0건일 때만 신규 등록함
2.**회원가입 시 알림톡 발행은 주석처리** — 활성화 하려면 `SignupServiceImpl`의 `eventPublisher.publishEvent(...)` 주석 해제
3.**소셜·폼 닉네임 네임스페이스 분리** — `findByBgmAgitMemberNickname` 같은 무조건 조회는 버그. 항상 `AndSocialType` 버전 사용
4.**`bgmagit-bml-match` 검수 진행중** — 코드는 wired 완료. 검수 통과 전엔 발송 시도가 실패하고 catch에서 1회 재시도 후 종료. 통과 즉시 자동 발송됨

## 아직 안 한 것 (TODO 후보)

- 닉네임 변경 시 KML synk 리셋
- `AMBIGUOUS`(다건 매칭) 수동 해결 UI — 마이페이지에서 KML ID 직접 선택
- `application-*.yml` 정리 (`kakao.redirecturi2`, `naver.redirecturi2`, `bgm-agit-kml-front`의 소셜 OAuth env vars)
- **메인 퀵메뉴 추가** — *부분 진행 중*. 로그인 사용자에게 "내 기록"(`/rank/{user.id}`) QuickItem 추가됨 (`UserCircle` 아이콘). 추가 후보(월간 랭킹/주간 랭킹/다국왕 등)와 그리드/행 레이아웃·모바일 슬라이더 높이는 미결.
- **개인기록 더보기 영역 미구현** — 스샷에 있던 "월간/주간/요일별/시간대별 성적·역만·기록" 링크 라인은 `/rank/[memberId]`에 안 들어갔음
- **외부 클릭 시 사이드바 sub 자동 닫기 미구현** — 현재는 라우트 변경 시에만 닫힘
- **새 엔드포인트 권한 매핑** — `/bgm-agit/ranks/{memberId}/stats`, `/bgm-agit/ranks/{memberId}/games`, `/my-rank` 라우트가 `BGM_AGIT_URL_RESOURCES` / `BGM_AGIT_KML_MENU_ROLE`에 등록 안 됐을 수 있음. 기존 `/bgm-agit/ranks` 권한과 동일하게 추가 필요
- **대국 기록 알림톡 — 수정/삭제 흐름 미적용** — 현재 `createRecord`만 발송. `updateRecord`/`removeRecord`에서도 발송하려면 `eventPublisher.publishEvent(new MatchRecordRegisteredEvent(matchs.getId()))` 한 줄씩 추가
- **`bgmagit-bml-match` 카카오 검수 통과 대기** — 통과 후 첫 발송 시 URL 중복(`https://https://...`) 여부 모니터링. 문제 있으면 `BgmAgitBizTalkSandServiceImpl.sendMatchRecord`의 url 변수에서 `https://` 제거

## 자주 쓰는 경로

- 인증/시큐리티: `bgm-agit-api/src/main/java/com/bgmagitapi/security/`
- KML 연동: `bgm-agit-api/src/main/java/com/bgmagitapi/security/service/kml/`
- 도메인 패키지: `bgm-agit-api/src/main/java/com/bgmagitapi/kml/{lecture,notice,record,rank,...}/`
- 랭킹·개인기록: `bgm-agit-api/.../kml/rank/{controller,service,repository,dto/response}/`
- 프론트 로그인/가입: `bgm-agit-kml-front/app/{login,signup}/page.tsx`
- 프론트 인증 서비스: `bgm-agit-kml-front/services/auth.service.ts`
- 프론트 개인기록: `bgm-agit-kml-front/app/rank/[memberId]/{page,MemberRankClient}.tsx`, `app/my-rank/page.tsx`
- 프론트 사이드바: `bgm-agit-kml-front/app/components/Sidebar.tsx`
- 알림톡 (백엔드): `bgm-agit-api/src/main/java/com/bgmagitapi/{util/Alimtalk*.java, service/BgmAgitBizTalk*.java, service/impl/BgmAgitBizTalk*Impl.java, event/BizTalkEventListener.java, event/dto/*Event.java}`
- 마이페이지: `bgm-agit-api/.../service/{BgmAgitMyPageService,impl/BgmAgitMyPageServiceImpl}.java`, `controller/BgmAgitMyPageController.java`, 프론트 `app/components/MyPageModal.tsx`
