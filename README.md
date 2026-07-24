# 🥊 NO RUN NO LIFE - Frontend
> 기록이 실력을 만든다. 러닝과 복싱 기록을 남기는 웹 서비스의 프론트엔드입니다.

---

## 📌 프로젝트 소개
- 오늘의 운동을 기록하고, 어제보다 나은 나를 확인하세요.
- 러닝과 복싱, 두 종목의 기록을 한 곳에서 관리하고 나만의 운동 루틴을 쌓아가는 서비스입니다.
- Spring Boot REST API 서버와 분리된 순수 HTML/CSS/JS 기반 프론트엔드입니다.
- 백엔드 레포: [no-run-no-life-backend2](https://github.com/kdongd/no-run-no-life-backend2)

---

## 🛠 기술 스택
| 분류 | 기술 |
|------|------|
| 마크업 | HTML5 |
| 스타일 | CSS3 |
| 동작 | Vanilla JavaScript |
| UI 라이브러리 | Bootstrap 5 |
| 개발 서버 | Live Server (VSCode) |

---

## ⚙️ 실행 방법
1. 백엔드 서버 먼저 실행 (`localhost:8080`)
2. `index.html` 을 Live Server로 실행 (`localhost:5500`)
3. 브라우저에서 `http://localhost:5500/index.html` 접속

---

## 📁 프로젝트 구조

no-run-no-life-frontend
├── images
│   └── boxing-hero.png
├── index.html
├── form.html
├── style.css
└── app.js

---

## 📦 파일 설명

### index.html
- 메인 화면
- 히어로 섹션 + 운동 기록 목록 표시
- 종류/기간/정렬 필터 바 제공
- 백엔드 API(`GET /workouts`)를 호출해 목록 렌더링 (페이지네이션 응답 구조 대응)

### form.html
- 운동 기록 등록 화면
- 운동 종류, 운동 시간, 메모, 날짜/시간 입력 폼
- 세부 기록(라운드/구간) 동적 추가/삭제 기능
- 백엔드 API(`POST /workouts`)로 데이터 전송
- 400 응답 시 errors 배열 파싱 → 각 input 옆에 빨간 메시지 표시

### style.css
- 전체 페이지 공통 스타일
- 다크 테마 기반 UI
- 필터 바 / 페이지네이션 버튼 스타일 포함

### app.js
- 백엔드 API 호출 및 응답 데이터 처리
- 운동 목록을 동적으로 HTML 테이블로 렌더링
- 종류/기간/정렬 조건으로 쿼리 파라미터 구성 후 검색
- 페이지네이션 처리 (이전/다음 버튼, 페이지 번호 표시)

---

## ✅ 구현 기능
- 운동 기록 목록 조회 (GET /workouts)
- 운동 기록 등록 (POST /workouts)
- 세부 기록(라운드/구간) 동적 추가/삭제 (+ 라운드 추가 버튼)
- 서버 사이드 검증 실패 시 400 응답 errors 배열 파싱 → input 옆 빨간 메시지 표시
- 종류·기간 조건 검색 + 정렬 (최신순/오래된순/운동시간순/종류순)
- 페이지네이션 (이전/다음, 현재 페이지 표시)
- 다크 테마 반응형 UI
- 히어로 이미지 배경
- 운동 종류별 이모지 아이콘 (🏃 러닝 / 🥊 복싱)