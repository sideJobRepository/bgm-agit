# bgm-agit

한국마작연맹(KML) 기록 생태계와 연동되는 **bgm-agit(마작장) 도메인 시스템**.
같은 도메인 하위에 메인 사이트와 마작 기록 사이트를 두고, 같은 API/DB/JWT를 공유하는 구조.

## 구성

| 모듈 | 역할 | 스택 | 주된 사용자 |
|---|---|---|---|
| `bgm-agit-api` | 백엔드 | Spring Boot 3.4.7 / Java 17 / JPA + QueryDSL / MySQL 8 | (공통) |
| `bgm-agit-front` | 메인 도메인 (`/`) — 예약·게시판·마이페이지 | Vite + React + Recoil | 일반 회원 (소셜 로그인) |
| `bgm-agit-kml-front` | 기록 도메인 (`/record`) — 일일/주간/월간 기록·랭킹·역만 | Next.js 15+ + zustand | 마작 회원 (폼 로그인) |

배포 형태는 같은 도메인 + reverse proxy (메인은 `/`, 기록은 `/record`).

## 인증

세 가지 로그인 진입점, 모두 같은 백엔드:

| 경로 | 누가 | 입력 | 발급 쿠키 |
|---|---|---|---|
| `POST /bgm-agit/kakao-login` | bgm-agit-front | `{ code }` | `refreshToken_main` |
| `POST /bgm-agit/naver-login` | bgm-agit-front | `{ code }` | `refreshToken_main` |
| `POST /bgm-agit/next/login` | bgm-agit-kml-front | `{ nickname, password }` | `refreshToken_record` |

- **리프레시 쿠키 분리**로 메인↔record 자동 로그인 차단. 액세스 토큰은 메모리(`tokenStore`)에만 유지
- 재발급/로그아웃: `POST/DELETE /bgm-agit/refresh?source=main|record`
- 폼 가입자는 `socialType = MAHJONG` 식별자 부여 — 닉네임 네임스페이스 분리(소셜 닉과 우연히 겹쳐도 계정 안 섞임)

## KML 연동

KML에 발급받은 stat 번호(`stat52`)에 `x-api-key: ${KML_API_KEY}` 헤더로 호출.

| 엔드포인트 | 용도 | 호출 시점 |
|---|---|---|
| `GET /api_users.php` | 닉네임 → KML user id 조회 | 회원가입 시 단건 매칭, 매시 정각 스케줄러로 미연동 회원 재시도 |
| `POST /record_submit_api.php` | 기록 송신 | `RecordServiceImpl.createRecord` 후 이벤트 비동기 발행 |

KML 호출 실패는 모두 `log.warn`만 → 우리 DB 트랜잭션과 분리.

## 주요 화면 (마작 회원 — `bgm-agit-kml-front`)

- 기록 입력(`/record/write`) — 동남서북 4명 점수, 역만 첨부 이미지
- 일간 요약(`/record/day-record`)
- 랭킹(`/record/rank`) — 주간 / 월간 / 사용자설정(시·분 단위 기간)
- 역만 기록(`/record/yakuman-record`)
- 권한 관리(`/record/role`, ADMIN 전용) — 마작 회원 권한·비밀번호 변경

UI는 모바일 우선(대부분 휴대폰으로 입력). `theme.device.mobile` (`max-width: 844px`) 기준.

## 개발 환경

요구: Node 18+, JDK 17, Docker (MySQL용)

```bash
# DB
docker compose up -d mysql

# API
cd bgm-agit-api
./gradlew bootRun

# 메인 프론트
cd bgm-agit-front
npm install && npm run dev          # http://localhost:5173

# 기록 프론트
cd bgm-agit-kml-front
npm install && npm run dev          # http://localhost:3000/record
```

API 환경변수(`application-*.yml`):
- `kml.url` — `https://kml.or.kr/stat52`
- `kml.api.key` — `${KML_API_KEY}`
- `cookie.secure` — 운영은 true, 로컬은 false

## 데이터베이스

- MySQL 8.0.43, Docker 컨테이너
- `binlog_format = ROW`, `binlog_row_image = FULL` (실수 DELETE 시 binlog로 복구 가능)
- Hibernate `ddl-auto: none` — 스키마는 수동 ALTER (`create.sql`, `create2.sql`, `menu-insert*.sql` 참고)
- URL 권한은 `BGM_AGIT_URL_RESOURCES` + `BGM_AGIT_URL_RESOURCES_ROLE` 매핑 기반 동적 인가

## 운영 메모

- KML 서버가 종종 502 → 회원-KML 자동 재연결 스케줄러(`KmlSyncScheduler`)가 매시 정각 재시도
- 닉네임 중복(KML 다건 매칭)은 `AMBIGUOUS` 처리되어 자동 연결 안 됨 (수동 개입 필요)
- 회원가입 시 알림톡은 현재 주석 처리 (`SignupServiceImpl`)
- KML `record_submit_api.php` 활성화 여부에 따라 기록 송신 동작/실패 — 미배포면 404 워닝만 쌓이고 우리 저장은 정상

## 더 자세한 내부 구조 / 트러블슈팅

→ [`CLAUDE.md`](./CLAUDE.md) 참고. 이벤트 발행, 인증 보호막, 리프레시 토큰 분리, 반응형 가이드 등 작업하면서 쌓인 컨텍스트가 정리돼 있음.
