# API 연동 가이드

본 API는 외부 애플리케이션(앱/웹)에서 KML 기록 시스템의 사용자 목록을 조회하고, 경기 결과를 서버로 전송하기 위해 제공됩니다. (역만 기록 관리 기능 포함)

## 공통 인증 (Authentication)

모든 API 요청 시, 보안을 위해 HTTP 헤더(Header)에 발급받은 API 키를 반드시 포함해야 합니다. 
• **Header Key** : `x-api-key`
• **Header Value** : 발급받은 API Key 문자열 (예: `1111`)

> [!CAUTION]
> **주의**: API 키가 유출되지 않도록 클라이언트 소스코드에 직접 하드코딩하지 말고, 환경 변수나 안전한 저장소를 통해 관리해 주세요.

> [!WARNING]
> **참고**: 클라우드플레어(Cloudflare) 보안 설정 등의 이유로 API 접근이 차단되거나 문제가 발생하는 경우, KML 문의 게시판을 통해 별도로 문의해 주시기 바랍니다.

### 🔑 API 키 등록 방법
API 키는 **관리자로 로그인한 후 나타나는 톱니바퀴 모양의 메뉴**에서 등록 가능합니다. 연동할 API 키(비밀번호)만 등록하면 시스템이 연동에 필요한 권한 레벨을 자동으로 지정해 줍니다.

**[ 공통 에러 응답 (HTTP 401 - 인증 실패) ]**
API 키가 누락되었거나 일치하지 않을 경우, 모든 API는 아래와 같이 공통적으로 401 에러를 반환합니다.
```json
{
  "status": "error",
  "message": "Invalid API Key"
}
```

> [!NOTE]
> 아래 모든 API 호출 예시의 URL에 포함된 `statXXX` 부분의 `XXX`는 **본인 모임의 고유 기록 시스템 번호**(예: `stat101`)로 변경하여 사용하시기 바랍니다.

---

## 1. 사용자 목록 조회 API
시스템에 등록된 모든 사용자의 `id`와 `nick`(닉네임) 목록을 조회합니다.

• **URL** : `https://kml.or.kr/statXXX/api_users.php`
• **Method** : `GET` (또는 `POST`)
• **Headers** : 
  - `x-api-key`: `1111` (인증키)

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "count": 2,
  "users": [
    { "id": 1, "nick": "홍길동" },
    { "id": 2, "nick": "김철수" }
  ]
}
```

---

## 2. 사용자 신규 등록 API
새로운 사용자를 등록합니다. (기본 등급은 "10급"으로 자동 설정됩니다.)

• **URL** : `https://kml.or.kr/statXXX/api_user_register.php`
• **Method** : `POST`
• **Headers** : 
  - `x-api-key`: `1111`
  - `Content-Type`: `application/json`

**[ Request Body ]**
```json
{
  "nick": "새로운유저"
}
```

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "user_id": 3,
  "nick": "새로운유저",
  "message": "User successfully registered"
}
```
**[ Response (실패 시 - 닉네임 누락, HTTP 400) ]**
```json
{
  "status": "error",
  "message": "Nickname is required"
}
```
**[ Response (실패 시 - 닉네임 중복, HTTP 409) ]**
```json
{
  "status": "error",
  "message": "Nickname already exists"
}
```

---

## 3. 대국 기록 조회 API
등록된 대국 기록을 조회합니다. 조건에 따라 최신순, 특정 날짜, 특정 월별 조회가 가능합니다.

• **URL** : `https://kml.or.kr/statXXX/api_records_read.php?type=recent`
• **Method** : `GET`
• **Headers** : 
  - `x-api-key`: `1111`

**[ Query Parameters ]**
- `type=recent`: 가장 최근 100건 조회 (기본값)
- `type=date&date=2024-05-15`: 특정 날짜(`YYYY-MM-DD`) 조회
- `type=month&year=2024&month=5`: 특정 연월 조회

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "count": 1,
  "records": [
    {
      "record_id": 70105,
      "date": "2024-05-15 14:30:00",
      "game_length": 1,
      "common_point": 1000,
      "players": [
        {"user_id": 1, "point": 45000, "wind": 0},
        {"user_id": 2, "point": 30000, "wind": 1},
        {"user_id": 3, "point": 15000, "wind": 2},
        {"user_id": 4, "point": 10000, "wind": 3}
      ]
    }
  ]
}
```

---

## 4. 대국 기록 등록 API
4명의 플레이어 정보와 점수를 포함한 새로운 대국 기록을 시스템에 등록하고, 등급을 갱신합니다.

• **URL** : `https://kml.or.kr/statXXX/api_record_submit.php`
• **Method** : `POST`
• **Headers** : 
  - `x-api-key`: `1111`
  - `Content-Type`: `application/json`

**[ Request Body ]**
```json
{
  "game_length": 1,
  "common_point": 1000,
  "players": [
    {"user_id": 1, "point": 45000, "wind": 0},
    {"user_id": 2, "point": 30000, "wind": 1},
    {"user_id": 3, "point": 15000, "wind": 2},
    {"user_id": 4, "point": 10000, "wind": 3}
  ]
}
```

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "record_id": 70106,
  "sum_check": 100000
}
```
**[ Response (실패 시 - 플레이어 4명 미만 등 데이터 오류, HTTP 400) ]**
```json
{
  "status": "error",
  "message": "Invalid game data"
}
```

---

## 5. 대국 기록 수정 API
기존에 등록된 특정 대국 기록을 수정하고, 관련된 유저의 등급을 다시 계산합니다.

• **URL** : `https://kml.or.kr/statXXX/api_record_modify.php`
• **Method** : `POST`
• **Headers** : 
  - `x-api-key`: `1111`
  - `Content-Type`: `application/json`

**[ Request Body ]**
```json
{
  "modify_id": 70106,
  "game_length": 1,
  "common_point": 1000,
  "players": [
    {"user_id": 1, "point": 50000, "wind": 0},
    {"user_id": 2, "point": 25000, "wind": 1},
    {"user_id": 3, "point": 15000, "wind": 2},
    {"user_id": 4, "point": 10000, "wind": 3}
  ]
}
```

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "modify_id": 70106,
  "sum_check": 100000
}
```
**[ Response (실패 시 - 파라미터 누락, HTTP 400) ]**
```json
{
  "status": "error",
  "message": "Invalid game data or missing modify_id"
}
```
**[ Response (실패 시 - 기록이 없거나 삭제된 경우, HTTP 404) ]**
```json
{
  "status": "error",
  "message": "Record not found"
}
```

---

## 6. 대국 기록 삭제 API
특정 경기 기록 하나를 삭제 처리하며, 플레이어의 등급(Grade)을 재계산합니다.

• **URL** : `https://kml.or.kr/statXXX/api_record_del.php`
• **Method** : `POST`
• **Headers** : 
  - `x-api-key`: `1111`
  - `Content-Type`: `application/json`

**[ Request Body ]**
```json
{
  "record_id": 70106
}
```

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "message": "Record deleted successfully.",
  "record_id": "70106"
}
```
**[ Response (실패 시 - 이미 삭제되었거나 없는 ID, HTTP 404) ]**
```json
{
  "status": "error",
  "message": "Record not found or already deleted."
}
```

---

## 7. 대국 기록 복구 API
삭제 처리된 특정 경기 기록을 다시 정상 상태로 활성화하며, 등급을 재계산합니다.

• **URL** : `https://kml.or.kr/statXXX/api_record_restore.php`
• **Method** : `POST`
• **Headers** : 
  - `x-api-key`: `1111`
  - `Content-Type`: `application/json`

**[ Request Body ]**
```json
{
  "record_id": 70106
}
```

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "message": "Record restored successfully.",
  "record_id": "70106"
}
```
**[ Response (실패 시 - 이미 정상이거나 없는 ID, HTTP 404) ]**
```json
{
  "status": "error",
  "message": "Record not found or already restored."
}
```

---

## 8. 역만 기록 조회 API
등록된 역만(Yakuman) 기록을 조회합니다. 조건에 따라 최신순, 특정 날짜, 특정 월별 조회 및 특정 사용자의 기록 조회가 가능합니다.

• **URL** : `https://kml.or.kr/statXXX/api_yakuman_read.php?type=recent`
• **Method** : `GET`
• **Headers** : 
  - `x-api-key`: `1111`

**[ Query Parameters ]**
- `type=recent`: 가장 최근 100건 조회 (기본값)
- `type=date&date=2024-05-15`: 특정 날짜(`YYYY-MM-DD`) 조회
- `type=month&year=2024&month=5`: 특정 연월 조회
- `user_id=1`: 특정 사용자의 역만 기록만 필터링 (선택적 파라미터, 다른 `type` 파라미터와 함께 사용 가능)
- `limit=50`: 반환할 레코드 개수 제한 (기본값: 100, 최대: 500)

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "count": 1,
  "records": [
    {
      "yakuman_id": 820,
      "user_id": 1,
      "point": 2,
      "date": "2024-05-15 15:00:00",
      "comment": "더블 역만 달성!",
      "yakumans": [
        1,
        2
      ]
    }
  ]
}
```

---

## 9. 역만 기록 등록 API
사용자가 달성한 역만(Yakuman) 기록을 시스템에 등록합니다. 최대 10개까지 배열로 입력 가능합니다.

• **URL** : `https://kml.or.kr/statXXX/api_yakuman_rec.php`
• **Method** : `POST`
• **Headers** : 
  - `x-api-key`: `1111`
  - `Content-Type`: `application/json`

**[ Request Body ]**
```json
{
  "user_id": 1,
  "yakumans": [1, 2],
  "comment": "더블 역만 달성!"
}
```

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "message": "Yakuman record registered successfully.",
  "yakuman_id": 820,
  "total_point": 2
}
```
**[ Response (실패 시 - 필수 파라미터 누락, HTTP 400) ]**
```json
{
  "status": "error",
  "message": "Invalid request data. 'user_id' and 'yakumans' (array) are required."
}
```
**[ Response (실패 시 - 배열 개수 10개 초과, HTTP 400) ]**
```json
{
  "status": "error",
  "message": "Maximum 10 yakumans allowed."
}
```

---

## 10. 역만 기록 삭제 API
특정 역만 기록 하나를 삭제 처리합니다.

• **URL** : `https://kml.or.kr/statXXX/api_yakuman_del.php`
• **Method** : `POST`
• **Headers** : 
  - `x-api-key`: `1111`
  - `Content-Type`: `application/json`

**[ Request Body ]**
```json
{
  "yakuman_id": 820
}
```

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "message": "Yakuman record deleted successfully.",
  "yakuman_id": "820"
}
```
**[ Response (실패 시 - 기록이 없거나 이미 삭제된 경우, HTTP 404) ]**
```json
{
  "status": "error",
  "message": "Record not found or already deleted."
}
```

---

## 11. 역만 기록 복원 API
삭제된 특정 역만 기록을 다시 정상 상태로 복구합니다.

• **URL** : `https://kml.or.kr/statXXX/api_yakuman_restore.php`
• **Method** : `POST`
• **Headers** : 
  - `x-api-key`: `1111`
  - `Content-Type`: `application/json`

**[ Request Body ]**
```json
{
  "yakuman_id": 820
}
```

**[ Response (성공 시 - HTTP 200) ]**
```json
{
  "status": "success",
  "message": "Yakuman record restored successfully.",
  "yakuman_id": "820"
}
```
**[ Response (실패 시 - 기록이 없거나 이미 정상 상태인 경우, HTTP 404) ]**
```json
{
  "status": "error",
  "message": "Record not found or already restored(active)."
}
```
