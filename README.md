# 🥊 NO RUN NO LIFE - Frontend
> 기록이 실력을 만든다. 러닝과 복싱 기록을 남기는 웹 서비스의 프론트엔드입니다.

---

## 📌 프로젝트 소개
- 오늘의 운동을 기록하고, 어제보다 나은 나를 확인하세요.
- 러닝과 복싱, 두 종목의 기록을 한 곳에서 관리하고 나만의 운동 루틴을 쌓아가는 서비스입니다.
- Spring Boot REST API 서버와 분리된 SPA(Single Page Application) 프론트엔드입니다.
- 백엔드 레포: [no-run-no-life-backend2](https://github.com/kdongd/no-run-no-life-backend2)

---

## 🛠 기술 스택
| 분류 | 기술 |
|------|------|
| 빌드 도구 | Vite |
| UI 라이브러리 | React |
| 라우팅 | React Router (react-router-dom) |
| 차트 | Chart.js (react-chartjs-2) |
| 스타일 | CSS (기존 다크 테마 그대로 유지) |
| 상태 관리 | React 내장 상태(useState/useEffect) — 별도 상태관리 라이브러리 미도입 |

---

## ⚙️ 실행 방법
1. 백엔드 서버 먼저 실행 (`localhost:8080`)
2. `.env.example`을 참고해 `.env` 파일 생성 (`VITE_API_BASE_URL` 설정)
3. 의존성 설치

       npm install

4. 개발 서버 실행

       npm run dev

5. 브라우저에서 안내되는 주소(기본 `http://localhost:5173`, 포트 충돌 시 자동으로 다음 포트 사용) 접속

---

## 📁 프로젝트 구조

    src/
    ├── main.jsx              # 진입점, 라우터 설정
    ├── App.jsx               # 라우트 정의
    ├── api/
    │   └── workoutApi.js     # 백엔드 API 호출 모음
    ├── pages/
    │   ├── WorkoutListPage.jsx    # 목록 + 검색/필터/정렬 + 페이징
    │   ├── WorkoutFormPage.jsx    # 등록/수정 겸용, 타입별 필드 동적 노출
    │   ├── WorkoutDetailPage.jsx  # 상세 조회 + 삭제
    │   └── StatsPage.jsx          # 타입별/월별 통계 차트
    ├── assets/
    │   └── boxing-hero.png
    └── styles/
        └── index.css

---

## 📦 페이지 설명

### WorkoutListPage
- 헤더, 히어로 섹션, 운동 기록 목록 표시
- 종류/기간/정렬 필터 바 제공
- 백엔드 API(`GET /workouts`)를 호출해 목록 렌더링, 페이지네이션 응답 구조 대응
- 목록 행 클릭 시 상세 페이지(`/workouts/:id`)로 이동

### WorkoutFormPage
- `mode` prop으로 등록(`create`)/수정(`edit`) 겸용 처리
- 운동 종류(러닝/복싱)에 따라 타입 전용 입력 필드가 동적으로 전환
- 수정 모드에서는 운동 종류 변경 불가(백엔드의 타입 변경 제한 정책과 일치)
- 세부 기록(라운드/구간) 동적 추가/삭제
- 백엔드 API(`POST /workouts`, `PUT /workouts/{id}`)로 데이터 전송
- 400 응답 시 errors 배열 파싱 → 각 필드 아래 에러 메시지 표시

### WorkoutDetailPage
- 단건 조회(`GET /workouts/{id}`), 타입별 속성 및 세부 기록 표시
- 수정 페이지로 이동하는 버튼, 삭제(`DELETE /workouts/{id}`) 버튼 제공

### StatsPage
- 타입별 통계(`GET /workouts/stats/by-type`), 월별 통계(`GET /workouts/stats/monthly`)를 Chart.js 막대 그래프로 시각화

---

## ✅ 구현 기능
- 운동 기록 목록 조회 / 등록 / 상세 조회 / 수정 / 삭제
- 러닝/복싱 타입별 전용 입력 필드 동적 전환
- 세부 기록(라운드/구간) 동적 추가/삭제
- 서버 사이드 검증 실패 시 400 응답 errors 배열 파싱 → 필드별 에러 메시지 표시
- 종류·기간 조건 검색 + 정렬 (최신순/오래된순/운동시간순/종류순/거리순)
- 페이지네이션 (이전/다음, 현재 페이지 표시)
- 타입별/월별 통계 차트 (Chart.js)
- API base URL을 `.env`로 분리 (`VITE_API_BASE_URL`)
- React Router 기반 페이지 라우팅
- 다크 테마 UI (기존 디자인 유지)