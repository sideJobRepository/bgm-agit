# bgm-agit

한국마작연맹(KML) 기록 생태계와 연동되는 bgm-agit(마작장) 도메인 시스템.

## 구성

- `bgm-agit-api` — Spring Boot 3.4.7 / Java 17 / JPA + QueryDSL / MySQL 8.0
- `bgm-agit-front` — 메인 도메인 프론트 (Vite, 포트 5173 예상). 여기선 **소셜 로그인** 사용
- `bgm-agit-kml-front` — Next.js 15+ (`basePath: /record`). 여기선 **일반 폼 로그인** 사용
- 같은 API·같은 DB·같은 JWT를 공유하는 SSO 구조

## 인증 설계

### 로그인 경로 3가지
| 경로 | 누가 쓰나 | 입력 |
|---|---|---|
| `POST /bgm-agit/kakao-login` | `bgm-agit-front` | 카카오 `code` |
| `POST /bgm-agit/naver-login` | `bgm-agit-front` | 네이버 `code` |
| `POST /bgm-agit/next/login` | `bgm-agit-kml-front` | `{ nickname, password }` |

성공 시 세 경로 모두 동일한 JWT 액세스 토큰을 발급하지만, **리프레시 쿠키는 앱별로 분리**됨. 발급 로직은 `BgmAgitAuthenticationSuccessHandler`.

### 리프레시 토큰 쿠키 분리 (메인 ↔ /record 자동 로그인 차단)
같은 도메인 하위 `/`(bgm-agit-front, 소셜 로그인)와 `/record`(kml-front, 폼 로그인)에서 서로 다른 쿠키를 사용해 한쪽 로그인이 다른 쪽으로 새지 않도록 함.
- `/bgm-agit/next/login` 성공 → `refreshToken_record` 쿠키
- `/bgm-agit/kakao-login`, `/bgm-agit/naver-login` 성공 → `refreshToken_main` 쿠키
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
- 엔드포인트: `POST /bgm-agit/next/signup`
- 입력: `{ name, nickname, phoneNo, password(8자+) }`
- BCrypt 해시(`PasswordEncoder` Bean은 `security/config/PasswordConfig.java`)
- `USER` role 자동 부여 (`BgmAgitMemberDetailRepositoryImpl.findByBgmAgitRoleName("USER")`)
- 회원가입 시 알림톡 발행은 **주석 처리된 상태** (`SignupServiceImpl.signup` 내 `eventPublisher.publishEvent(...)` 주석)

### 보호막: 로그인 시 role 누락되면 USER 자동 부여
`BgmAgitMemberDetailService.ensureDefaultRole(BgmAgitMember)` — 소셜·폼 두 경로 공통 호출.
DELETE 사고로 `BGM_AGIT_MEMBER_ROLE`가 날아간 기존 유저도 로그인하면 자연 복구됨.

## KML 연동

### 설정 (application.yml)
```yaml
kml:
  url: https://kml.or.kr/stat52     # stat 번호 52 = bgm-agit
  api:
    key: BgmAgit                    # x-api-key 헤더 값
```

### KML API (bgm-agit 기준)
- `GET /api_users.php` — 전체 사용자 리스트 반환 `{status, count, users: [{id, nick}]}`
- `POST /record_submit_api.php` — 기록 전송(아직 미연동) `{game_length, common_point, players[4]{user_id, point, wind}}`
- 둘 다 `x-api-key` 헤더 필요

### 회원-KML 연결
- 회원가입 시 닉네임으로 KML 조회(`KmlUserClient.findSingleKmlIdByNickname`)
- 단건 매칭 → `BGM_AGIT_MEMBER.BGM_AGIT_MEMBER_KML_ID` 저장 + `BGM_AGIT_MEMBER_KML_SYNK = 'Y'`
- 0건 / 다건 / 502·오류 → `kml_id = null` + `synk = 'N'` (가입은 계속 진행)

### 자동 재시도 스케줄러
`KmlSyncScheduler` + `KmlSyncService`
- `@Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")` — 매시 정각
- `synk = 'N'` 유저 배치 조회 → KML 재호출 → 성공 시 `linkKml(id)`로 상태 `'Y'` 전환
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

## 운영상 주의사항 (현장에서 겪은 이슈)

1. **KML 서버가 종종 502** — 스케줄러가 자동 커버하지만, curl로 상태 확인 가능
   ```bash
   curl -I -H "x-api-key: BgmAgit" https://kml.or.kr/stat52/api_users.php
   ```
2. **KML 닉네임 중복** — 동일 닉네임 여러 명 있을 수 있음. 단건일 때만 자동 연결, 다건은 `AMBIGUOUS` 취급되어 스케줄러도 연결 안 함 (수동 개입 필요)
3. **회원가입 시 알림톡 발행은 주석처리** — 활성화 하려면 `SignupServiceImpl`의 `eventPublisher.publishEvent(...)` 주석 해제
4. **소셜·폼 닉네임 네임스페이스 분리** — `findByBgmAgitMemberNickname` 같은 무조건 조회는 버그. 항상 `AndSocialType` 버전 사용

## 아직 안 한 것 (TODO 후보)

- 닉네임 변경 시 KML synk 리셋
- `AMBIGUOUS`(다건 매칭) 수동 해결 UI — 마이페이지에서 KML ID 직접 선택
- KML `record_submit_api.php` 연동 (기록 송신)
- `application-*.yml` 정리 (`kakao.redirecturi2`, `naver.redirecturi2`, `bgm-agit-kml-front`의 소셜 OAuth env vars)

## 자주 쓰는 경로

- 인증/시큐리티: `bgm-agit-api/src/main/java/com/bgmagitapi/security/`
- KML 연동: `bgm-agit-api/src/main/java/com/bgmagitapi/security/service/kml/`
- 도메인 패키지: `bgm-agit-api/src/main/java/com/bgmagitapi/kml/{lecture,notice,record,rank,...}/`
- 프론트 로그인/가입: `bgm-agit-kml-front/app/{login,signup}/page.tsx`
- 프론트 인증 서비스: `bgm-agit-kml-front/services/auth.service.ts`
