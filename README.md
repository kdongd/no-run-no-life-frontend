# 🔥 NO RUN NO LIFE (NBNL) - Frontend

### 러닝과 복싱 운동 기록을 기반으로 개인의 운동 상태를 분석하고 AI 코칭을 제공하는 웹 서비스

`NO RUN NO LIFE`는 사용자가 러닝과 복싱 운동을 기록하고, 누적된 운동 데이터를 기반으로 자신의 운동 패턴과 컨디션을 확인할 수 있도록 개발한 운동 기록 관리 서비스입니다.

단순히 운동 시간과 거리를 저장하는 것에서 나아가, **운동 강도(RPE), 통증, 만족도, 컨디션 등 주관적인 운동 상태까지 기록**하고 이를 바탕으로 규칙 기반 상태 판정과 LLM을 활용한 개인 맞춤형 AI 코칭을 제공합니다.

본 저장소는 NBNL 서비스의 **React 기반 프론트엔드 저장소**입니다.

---

## 📌 Repository 소개

`Java`와 `Spring Boot`를 기반으로 백엔드를 개발하고, `React`를 활용하여 실제 사용 가능한 웹 서비스로 확장하는 것을 목표로 진행했습니다.

운동 기록 관리부터 통계 시각화, 인증, AI 코칭까지 프론트엔드와 백엔드가 통신하는 전체 웹 애플리케이션 구조를 구현하고 학습하는 데 중점을 두었습니다.

## 🛠️ 기술 스택

| 구분 | 기술 |
|---|---|
| Language | JavaScript (ES6+) |
| UI Library | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM 7 |
| Styling | CSS3 |
| HTTP Client | Fetch API |
| Chart | Chart.js, react-chartjs-2 |
| Authentication | JWT |
| Package Manager | npm |
| Code Linting | Oxlint |

---

## ✨ 주요 기능

### 1. 사용자 인증 및 계정 관리

- 이메일 및 비밀번호를 이용한 회원가입과 로그인
- Google 로그인 연동
- JWT 기반 인증 및 로그인 상태 관리
- 닉네임 설정 및 사용자 프로필 관리
- 인증 여부에 따른 페이지 접근 제어

### 2. 메인 대시보드

- 이번 달 운동 기록 요약
- 월간 운동 캘린더
- 최근 운동 기록 조회
- 연간 운동 기록 히트맵(운동 잔디)
- 운동 데이터를 기반으로 한 상태 판정 결과 확인

### 3. 운동 기록 관리

**러닝 (Running)**

- 운동 날짜 및 시간
- 운동 거리
- 운동 소요 시간
- 평균 페이스
- 평균 심박수

**복싱 (Boxing)**

- 운동 날짜 및 시간
- 총 운동 라운드
- 운동 소요 시간
- 운동 구성 항목 선택

**공통 기능**

- 운동 기록 등록, 조회, 수정, 삭제
- 운동 기록 검색 및 정렬
- 날짜별 운동 기록 조회
- 운동 메모 작성

### 4. 운동 컨디션 관리

운동 기록에 다음과 같은 컨디션 정보를 추가로 관리할 수 있습니다.

- 운동 자각도(RPE)
- 통증 부위 및 통증 강도
- 운동 만족도
- 운동 후 컨디션 및 메모

운동 기록과 컨디션 데이터를 함께 관리하여 단순 운동량뿐 아니라 운동 강도와 신체 상태를 종합적으로 확인할 수 있도록 구성했습니다.

### 5. 운동 통계

- 기간별 운동 기록 조회
- 러닝 및 복싱 운동 통계
- 운동 횟수와 운동량 분석
- 운동 강도 및 컨디션 관련 통계
- Chart.js를 활용한 데이터 시각화

### 6. AI 운동 코칭

- 누적 운동 기록을 기반으로 한 상태 분석
- 규칙 기반 운동 상태 판정
- LLM을 활용한 개인 맞춤형 운동 코칭
- 운동 기록과 컨디션을 반영한 피드백 제공

프론트엔드에서는 코칭 요청과 응답 결과를 표시하며, 실제 상태 판정과 LLM 호출은 Spring Boot 백엔드에서 처리합니다.

---

## 📂 프로젝트 구조

```text
src/
├── api/                   # 백엔드 API 통신
│   ├── authApi.js
│   ├── userApi.js
│   ├── workoutApi.js
│   └── coachingApi.js
│
├── auth/                  # JWT 및 사용자 인증 관련 기능
│   ├── token.js
│   └── nickname.js
│
├── components/            # 공통 UI 컴포넌트
│   ├── ErrorBoundary.jsx
│   ├── WorkoutCalendar.jsx
│   └── WorkoutHeatmap.jsx
│
├── layout/                # 공통 레이아웃
│   └── AppLayout.jsx
│
├── pages/                 # 페이지 컴포넌트
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── NicknamePage.jsx
│   ├── DashboardPage.jsx
│   ├── CalendarPage.jsx
│   ├── WorkoutListPage.jsx
│   ├── WorkoutFormPage.jsx
│   ├── WorkoutDetailPage.jsx
│   ├── ConditionPage.jsx
│   ├── StatsPage.jsx
│   ├── CoachingPage.jsx
│   └── MyPage.jsx
│
├── styles/                # CSS 스타일
├── utils/                 # 공통 유틸리티
│   └── workouts.js
│
├── assets/                # 이미지 및 정적 리소스
├── App.jsx                # 라우팅 및 인증 페이지 제어
└── main.jsx               # React 진입점
```

### 디렉터리별 역할

| 디렉터리 | 역할 |
|---|---|
| `api` | Spring Boot 백엔드와의 HTTP 통신 |
| `auth` | JWT 저장 및 로그인 상태 확인 |
| `components` | 재사용 가능한 UI 컴포넌트 |
| `layout` | 공통 페이지 레이아웃 |
| `pages` | 각 기능별 화면 구성 |
| `styles` | 화면 디자인 및 반응형 스타일 |
| `utils` | 날짜 및 운동 데이터 가공 |

---

## 🔄 프론트엔드와 백엔드 통신 구조

```text
[사용자]
    │
    ▼
[React Frontend]
    │
    ├── 페이지 렌더링
    ├── 사용자 입력 및 상태 관리
    ├── JWT 인증 정보 관리
    └── Fetch API
          │
          │ HTTP Request / JSON
          ▼
[Spring Boot Backend]
    │
    ├── Spring Security / JWT
    ├── Controller
    ├── Service
    ├── Repository
    ├── PostgreSQL
    └── LLM API
          │
          ▼
[HTTP Response / JSON]
          │
          ▼
[React 화면 갱신]
```

`React`는 사용자 인터페이스와 API 요청을 담당하고, `Spring Boot`는 인증, 비즈니스 로직, 데이터 저장 및 AI 코칭 처리를 담당하도록 역할을 분리했습니다.

---

## 🔐 인증 처리

**JWT Access Token**을 활용하여 사용자 인증을 처리합니다.

1. 사용자가 로그인 정보를 입력합니다.
2. React에서 백엔드 로그인 API를 호출합니다.
3. 인증에 성공하면 JWT Access Token을 전달받습니다.
4. Access Token을 브라우저 localStorage에 저장합니다.
5. 인증이 필요한 API 요청 시 `Authorization` 헤더에 토큰을 포함합니다.
6. 백엔드에서 토큰의 유효성을 검증하고 요청을 처리합니다.

```http
Authorization: Bearer <access-token>
```

프론트엔드에서는 인증 여부에 따라 페이지 접근을 제어하며, 실제 인증 및 인가 검증은 Spring Boot 백엔드에서 수행합니다.

---


## 📡 백엔드 API 연동

프론트엔드에서는 Fetch API를 사용하여 Spring Boot REST API와 통신합니다.

### 운동 기록 API

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/workouts` | 운동 기록 목록 조회 |
| GET | `/workouts/{id}` | 운동 기록 상세 조회 |
| POST | `/workouts` | 운동 기록 등록 |
| PUT | `/workouts/{id}` | 운동 기록 수정 |
| DELETE | `/workouts/{id}` | 운동 기록 삭제 |

> 위 Endpoint는 API Base URL을 제외한 상대 경로입니다.

### API 요청 예시

```javascript
export function fetchWorkoutById(id) {
  return fetch(`${API_URL}/${id}`, {
    headers: {
      ...authHeaders()
    }
  }).then(handleResponse);
}
```

인증이 필요한 API 요청에는 JWT Access Token을 포함합니다.

---

## 🧩 주요 프론트엔드 설계

### 1. 페이지와 공통 컴포넌트 분리

화면 단위 컴포넌트는 `pages/`에 배치하고, 여러 화면에서 재사용하는 UI는 `components/`로 분리했습니다.

### 2. API 통신 로직 분리

백엔드와의 HTTP 통신은 `api/` 디렉터리에서 관리합니다.

- `authApi.js` : 인증 관련 API
- `userApi.js` : 사용자 정보 관련 API
- `workoutApi.js` : 운동 기록 관련 API
- `coachingApi.js` : AI 코칭 관련 API

이를 통해 화면 컴포넌트와 서버 통신 로직의 책임을 구분했습니다.

### 3. React Router 기반 페이지 관리

React Router를 활용하여 URL별 페이지를 구성했습니다.

```jsx
<Route
  path="/workouts/new"
  element={<WorkoutFormPage mode="create" />}
/>

<Route
  path="/workouts/:id/edit"
  element={<WorkoutFormPage mode="edit" />}
/>
```

운동 등록과 수정 화면은 동일한 컴포넌트를 재사용하며, `mode` Props로 동작을 구분합니다.

### 4. 공통 레이아웃 적용

`AppLayout`을 통해 공통 화면 구조를 관리하고, React Router의 중첩 라우팅을 활용하여 페이지별 콘텐츠를 렌더링합니다.

### 5. 운동 데이터 가공 로직 분리

운동 날짜, 운동 유형, 기간별 데이터 조회 및 집계 등 공통 기능은 `utils/workouts.js`에서 관리합니다.

---

## 🔗 Backend Repository

NBNL 서비스의 Spring Boot 백엔드 저장소입니다.

[NO RUN NO LIFE - Backend](https://github.com/kdongd/no-run-no-life-backend2)

---

## 📝 향후 개선 사항


- 인증 토큰 저장 및 관리 방식 개선
- 컴포넌트 책임 분리 및 재사용성 개선
- CSS 스타일 구조 정리
- 반응형 UI 및 사용자 경험 개선
- 배포 환경 구성 및 운영 안정성 개선

