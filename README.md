# 김민혁 · 성현선 모바일 청첩장

빌드 없는 정적 사이트(HTML/CSS/JS)입니다. GitHub Pages로 배포합니다.

## 로컬 실행
```
python3 -m http.server 8000   # http://localhost:8000
node --test tests/            # 날짜·RSVP 검증 테스트
```

## 내용 바꾸기
`js/config.js` 한 곳에서 이름, 일시, 장소, 부모님 성함, 연락처, 계좌, 인사말, 교통편, 갤러리 사진 경로를 바꿉니다.
사진은 `images/`에 넣고 `config.cover`(표지)와 `config.gallery`(갤러리)에 경로를 적습니다. 카톡 미리보기 사진은 `index.html`의 `og:image`입니다.

## 참석 여부를 Google 시트로 받기
1. 새 Google 시트를 만들고 1행에 `시간, 이름, 참석, 인원, 식사, 메시지`를 적습니다.
2. 확장 프로그램 > Apps Script에서 `apps-script/Code.gs` 내용을 붙여넣습니다.
3. 배포 > 새 배포 > 유형 `웹 앱`, 실행 사용자 `나`, 액세스 `모든 사용자`로 배포합니다.
4. 발급된 웹 앱 URL을 `js/config.js`의 `rsvpUrl`에 넣습니다. (비어 있으면 폼은 "준비 중"으로 비활성화됩니다.)
5. 코드를 수정해 다시 배포할 때는 "배포 관리"에서 새 버전으로 갱신해야 URL이 유지됩니다.

## 공유 방식
카카오톡 공유는 카카오 개발자 앱 키가 필요해서 넣지 않았습니다. 대신 기기의 공유 시트(Web Share API)를 쓰고, 지원하지 않는 환경에서는 링크를 복사합니다.

## GitHub Pages 배포
저장소 Settings > Pages에서 Branch `main` / `/ (root)`를 선택합니다.
