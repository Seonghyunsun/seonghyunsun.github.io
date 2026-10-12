# 모바일 청첩장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 김민혁·성현선 모바일 청첩장을 GitHub Pages 정적 사이트로 만들고, 참석 여부를 Google Sheets로 수집한다.

**Architecture:** 빌드 없는 HTML/CSS/ES 모듈. 개인 정보는 `js/config.js` 한 곳에 두고, 날짜 계산은 `js/date-utils.js`의 순수 함수로 분리해 `node --test`로 검증한다. RSVP는 Apps Script 웹앱에 `fetch` POST.

**Tech Stack:** HTML, CSS, vanilla JS(ES modules), `node --test`, Google Apps Script.

**Spec:** `docs/superpowers/specs/2026-10-12-wedding-invitation-design.md`

## Global Constraints

- 신랑 김민혁, 신부 성현선
- 일시 2027-01-03 (일) 오후 12:40
- 장소 루이비스컨벤션 송파문정 B1층, 주소 서울특별시 송파구 법원로9길 26 H비즈니스파크 D동
- 모바일 우선, 최대 폭 480px 중앙 정렬
- 빌드 도구 없음. 저장소 루트 `index.html` 배포
- 공지사항에는 참석 여부 전달만. 방명록·포토 드롭·화환·배경음악·기타 안내 금지
- 부모님 성함·연락처·계좌·사진·인사말·교통편은 샘플 값으로 두고 `config.js`에서 교체

## Review Focus

- RSVP 웹앱 URL이 빈 문자열: 제출 불가 + 안내 메시지(폼이 조용히 실패하지 않음)
- 이름 공백만 입력 또는 참석 여부 미선택: 제출 차단
- 제출 중 버튼 연타: 요청 1회만 전송
- 예식일 당일·이후: D-day가 음수나 NaN이 아니라 "D-Day"/"지났습니다"로 표시
- `navigator.clipboard` 미지원 환경: 복사 실패 시 대체 동작(`execCommand` 폴백)
- 이미지 파일 없음: 갤러리 깨진 아이콘 대신 빈 칸 유지(`onerror`로 숨김)

---

### Task 1: 설정과 날짜 유틸

**Files:**
- Create: `package.json` (`{"type":"module"}`), `js/config.js`, `js/date-utils.js`, `tests/date-utils.test.js`

**Interfaces:**
- Produces: `config` (default export 아님, `export const config`) — `{ groom:{name,father,mother,phone}, bride:{...}, weddingDate:"2027-01-03T12:40:00+09:00", venue:{name,hall,address,tel,mapQuery}, greeting:string[], gallery:string[], accounts:{groom:[{bank,number,holder}], bride:[...]}, rsvpUrl:"" }`
- Produces: `buildCalendar(year: number, month: number): (number|null)[][]` (month 0-based, 주 단위 7칸, 빈 칸 null)
- Produces: `diffParts(target: Date, now: Date): {days,hours,minutes,seconds,past:boolean}`
- Produces: `formatKoreanDate(d: Date): string` → `"2027년 1월 3일 일요일 오후 12시 40분"`

- [ ] **Step 1: 실패하는 테스트 작성** (`tests/date-utils.test.js`)
  - `buildCalendar(2027, 0)[0]` 가 `[null,null,null,null,null,1,2]`, 3일은 두 번째 주 첫 칸(일요일)이 아니라 `buildCalendar(2027,0)[1][0] === 3`
  - `diffParts(new Date("2027-01-03T12:40:00+09:00"), new Date("2027-01-01T12:40:00+09:00"))` → `{days:2,hours:0,minutes:0,seconds:0,past:false}`
  - `now`가 target 이후면 `past:true`, 모든 값 0
  - `formatKoreanDate(new Date("2027-01-03T12:40:00+09:00"))` === `"2027년 1월 3일 일요일 오후 12시 40분"` (Asia/Seoul 기준으로 계산)
- [ ] **Step 2:** `node --test tests/` → FAIL(모듈 없음)
- [ ] **Step 3:** `js/date-utils.js` 구현. `formatKoreanDate`는 `Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",...})` 사용. `config.js`는 위 구조를 샘플 값으로 채운다(이름·일시·장소는 확정값).
- [ ] **Step 4:** `node --test tests/` → PASS
- [ ] **Step 5:** 커밋 `feat: 설정과 날짜 유틸 추가`

### Task 2: 페이지 골격, 표지, 인사말, 달력/D-day

**Files:**
- Create: `index.html`, `css/style.css`, `js/main.js`
- Modify: `js/main.js` 이후 태스크에서 확장

**Interfaces:**
- Consumes: Task 1의 `config`, `buildCalendar`, `diffParts`, `formatKoreanDate`
- Produces: `index.html`에 섹션 `<section id="cover|greeting|calendar|gallery|location|notice|account">`와 푸터. `main.js`는 `type="module"`로 로드. 스크롤 등장 효과는 `.reveal` 클래스 + `IntersectionObserver`로 `.is-visible` 토글.

- [ ] **Step 1:** `index.html`에 viewport 메타, 8개 섹션 컨테이너, `<script type="module" src="js/main.js">` 작성. 텍스트는 `main.js`가 `config`로 채운다.
- [ ] **Step 2:** `main.js`에 `renderCover`, `renderGreeting`(연락하기는 `tel:`/`sms:` 링크), `renderCalendar`(예식일에 `.today` 강조), `startCountdown`(1초 간격, `past`면 "D-Day"/"결혼식이 지났습니다") 구현.
- [ ] **Step 3:** `style.css`로 모바일 폭 중앙 정렬, 섹션 제목(영문 소제목 + 한글 부제), 등장 효과. 색상은 `:root` 변수로 정의.
- [ ] **Step 4:** 검증 — `python3 -m http.server 8000` 후 브라우저 375px 폭에서 표지·달력(2027년 1월, 3일 강조, 일요일 열)·카운트다운 확인. 콘솔 오류 없음.
- [ ] **Step 5:** 커밋 `feat: 표지·인사말·달력·D-day 섹션`

### Task 3: 갤러리와 라이트박스

**Files:** Modify `index.html`, `css/style.css`, `js/main.js`; Create `images/` (샘플 SVG 플레이스홀더 6장)

**Interfaces:** Consumes `config.gallery: string[]`. Produces `renderGallery(el: HTMLElement, urls: string[]): void`.

- [ ] **Step 1:** 3열 썸네일 그리드, 이미지 `onerror` 시 해당 칸 숨김.
- [ ] **Step 2:** 썸네일 클릭 시 라이트박스(닫기, 이전/다음, 좌우 스와이프, ESC 닫기).
- [ ] **Step 3:** 검증 — 375px에서 열기·이동·닫기, 존재하지 않는 경로를 `config.gallery`에 추가해도 깨진 아이콘이 보이지 않음.
- [ ] **Step 4:** 커밋 `feat: 갤러리와 라이트박스`

### Task 4: 오시는 길

**Files:** Modify `index.html`, `css/style.css`, `js/main.js`

**Interfaces:** Consumes `config.venue`. Produces `copyText(text: string): Promise<boolean>` (clipboard API 실패 시 임시 textarea + `execCommand("copy")` 폴백) — Task 6도 사용.

- [ ] **Step 1:** 장소명·주소 표시, "주소 복사" 버튼(`copyText`, 성공 시 토스트).
- [ ] **Step 2:** 지도 링크 3개: 카카오맵 `https://map.kakao.com/link/search/<주소>`, 네이버지도 `https://map.naver.com/p/search/<주소>`, 티맵 `https://tmap.life/` 또는 주소 검색 링크. 주소는 `encodeURIComponent` 처리. 교통편 텍스트는 `config`의 샘플.
- [ ] **Step 3:** 검증 — 링크 3개가 주소 검색 결과로 열림, 복사 후 붙여넣기 값이 주소와 일치.
- [ ] **Step 4:** 커밋 `feat: 오시는 길 섹션`

### Task 5: 공지사항 — 참석 여부 전달

**Files:** Create `js/rsvp.js`, `apps-script/Code.gs`; Modify `index.html`, `css/style.css`, `js/main.js`

**Interfaces:**
- Consumes: `config.rsvpUrl`
- Produces: `validateRsvp(data: {name:string, attend:""|"yes"|"no", count:number, meal:""|"yes"|"no", message:string}): {ok:boolean, error?:string}` (순수 함수, `tests/rsvp.test.js`로 검증), `initRsvp(root: HTMLElement, url: string): void`
- Apps Script: `doPost(e)`가 JSON 본문을 파싱해 시트에 `[타임스탬프, 이름, 참석, 인원, 식사, 메시지]` 행 추가 후 `{ok:true}` 반환.

- [ ] **Step 1: 실패하는 테스트** (`tests/rsvp.test.js`): 이름이 `"  "`이면 `ok:false`; `attend:""`이면 `ok:false`; 이름 "홍길동" + `attend:"yes"` + `count:2`이면 `ok:true`; `attend:"no"`이면 `count`는 검사하지 않음.
- [ ] **Step 2:** `node --test tests/` → FAIL
- [ ] **Step 3:** `validateRsvp` 구현 → PASS.
- [ ] **Step 4:** `initRsvp`: "참석 여부 전달하기" 버튼 → 모달 폼. 제출 시 검증 → 버튼 비활성화 → `fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(data)})`(Apps Script CORS 회피용 text/plain) → 성공/실패 메시지. `url`이 비면 제출 버튼 비활성화와 "준비 중" 안내. 공지사항 섹션에는 이 버튼 외 내용을 넣지 않는다.
- [ ] **Step 5:** `Code.gs` 작성(`SpreadsheetApp.getActiveSheet().appendRow`).
- [ ] **Step 6:** 검증 — `rsvpUrl`이 빈 상태에서 안내 표시, 연타 시 요청 1회(Network 탭), 빈 이름 차단. 실제 전송은 사용자가 웹앱 배포 후 확인.
- [ ] **Step 7:** 커밋 `feat: 참석 여부 전달 폼과 Apps Script`

### Task 6: 마음 전하실 곳, 공유, README

**Files:** Modify `index.html`, `css/style.css`, `js/main.js`; Create `README.md`

**Interfaces:** Consumes `config.accounts`, `copyText` (Task 4).

- [ ] **Step 1:** 신랑측·신부측 아코디언(`<details>`), 계좌별 "복사" 버튼.
- [ ] **Step 2:** 푸터 "청첩장 링크 복사하기"(`copyText(location.href)`). 카카오톡 공유는 Kakao JS 키가 필요하므로 Web Share API(`navigator.share`)로 대체하고 미지원 시 링크 복사. 이 대체는 README에 명시.
- [ ] **Step 3:** `README.md`: 로컬 실행, `config.js` 수정 위치, Google 시트 생성 → 확장 프로그램 → Apps Script에 `Code.gs` 붙여넣기 → 웹앱 배포(액세스: 모든 사용자) → URL을 `rsvpUrl`에 입력하는 절차, GitHub Pages 설정(Settings → Pages → main / root).
- [ ] **Step 4:** 최종 검증 — `node --test tests/` 전체 PASS, 375px에서 전 섹션 확인, 콘솔 오류 없음, 범위 제외 항목이 페이지에 없는지 확인.
- [ ] **Step 5:** 커밋 `feat: 계좌·공유·README`
