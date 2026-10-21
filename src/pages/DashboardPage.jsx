
import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import WorkoutCalendar from '../components/WorkoutCalendar'
import WorkoutHeatmap from '../components/WorkoutHeatmap'
import {
    fetchWorkoutsInRange,
    monthBounds,
    dateKey,
    todayKey,
    workoutLabel
} from '../utils/workouts'
import { fetchAssessment } from '../api/coachingApi'
import { clearToken } from '../auth/token'

const LEVEL = {
    STOP: ['운동 중단 권고', 'danger'],
    REST: ['휴식 권고', 'warning'],
    REDUCE: ['강도 조절 권고', 'warning'],
    NORMAL: ['운동 상태 양호', 'success'],
    INSUFFICIENT_DATA: ['컨디션 기록이 부족해요', 'neutral']
}

export default function DashboardPage() {
    const now = new Date()

    const [view, setView] = useState({
        year: now.getFullYear(),
        month: now.getMonth()
    })
    const [selected, setSelected] = useState(todayKey())
    const [monthWorkouts, setMonthWorkouts] = useState([])
    const [yearWorkouts, setYearWorkouts] = useState([])
    const [assessment, setAssessment] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()
    const { nickname } = useOutletContext()

    useEffect(() => {
        let active = true
        const { from, to } = monthBounds(view.year, view.month)

        fetchWorkoutsInRange(from, to)
            .then(items => {
                if (active) setMonthWorkouts(items)
            })
            .catch(err => {
                if (!active) return

                if (err.status === 401) {
                    clearToken()
                    navigate('/login', { replace: true })
                } else {
                    setError(err.message)
                }
            })

        return () => {
            active = false
        }
    }, [view, navigate])

    useEffect(() => {
        let active = true
        const start = new Date()
        start.setDate(start.getDate() - 370)

        const from = [
            start.getFullYear(),
            String(start.getMonth() + 1).padStart(2, '0'),
            String(start.getDate()).padStart(2, '0')
        ].join('-')

        Promise.allSettled([
            fetchWorkoutsInRange(from, todayKey()),
            fetchAssessment()
        ]).then(([workouts, coaching]) => {
            if (!active) return

            if (workouts.status === 'fulfilled') {
                setYearWorkouts(workouts.value)
            } else if (workouts.reason?.status === 401) {
                clearToken()
                navigate('/login', { replace: true })
            } else {
                setError(
                    workouts.reason?.message ||
                    '운동 기록을 불러오지 못했습니다.'
                )
            }

            if (coaching.status === 'fulfilled') {
                setAssessment(coaching.value)
            }

            setLoading(false)
        })

        return () => {
            active = false
        }
    }, [navigate])

    function moveMonth(amount) {
        setView(v => {
            const d = new Date(v.year, v.month + amount, 1)

            return {
                year: d.getFullYear(),
                month: d.getMonth()
            }
        })
    }

    const selectedItems = monthWorkouts.filter(
        w => dateKey(w.workoutDateTime) === selected
    )

    const thisMonth = yearWorkouts.filter(
        w => dateKey(w.workoutDateTime).startsWith(todayKey().slice(0, 7))
    )

    const monthlyMinutes = thisMonth.reduce(
        (sum, w) => sum + (w.durationMinutes || 0),
        0
    )

    const monthlyDistance = thisMonth.reduce(
        (sum, w) =>
            sum + (w.type === 'RUNNING' ? (Number(w.distanceKm) || 0) : 0),
        0
    )

    const level = LEVEL[assessment?.level] || LEVEL.INSUFFICIENT_DATA

    return (
        <div className="dashboard-page">
            <div className="page-heading">
                <div>
                    <span className="eyebrow">MY TRAINING SPACE</span>
                    <h1>
                        안녕하세요, {nickname || '회원'}님{' '}
                        <span className="wave">👋</span>
                    </h1>
                    <p>
                        오늘도 나만의 페이스로, 기록을 이어가 볼까요?
                    </p>
                </div>

                <Link to="/workouts/new" className="btn btn-primary">
                    ＋ 운동 기록하기
                </Link>
            </div>

            {error && (
                <div className="alert-error" role="alert">
                    {error}
                </div>
            )}

            <div className="metric-grid">
                <div className="metric-card">
                    <span className="metric-icon blue-icon">◉</span>
                    <span>이번 달 운동</span>
                    <strong>
                        {thisMonth.length}<small>회</small>
                    </strong>
                    <em>꾸준한 기록이 쌓이고 있어요</em>
                </div>

                <div className="metric-card">
                    <span className="metric-icon coral-icon">◷</span>
                    <span>이번 달 운동 시간</span>
                    <strong>
                        {monthlyMinutes.toLocaleString()}<small>분</small>
                    </strong>
                    <em>움직인 시간만큼 성장 중</em>
                </div>

                <div className="metric-card">
                    <span className="metric-icon mint-icon">↗</span>
                    <span>이번 달 러닝 거리</span>
                    <strong>
                        {monthlyDistance.toFixed(1)}<small>km</small>
                    </strong>
                    <em>러닝 기록 기준</em>
                </div>
            </div>

            <div className="dashboard-columns">
                <section className="surface calendar-surface">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">
                                YOUR SCHEDULE
                            </span>
                            <h2>운동 캘린더</h2>
                        </div>

                        <Link to="/calendar" className="text-link">
                            전체 보기 →
                        </Link>
                    </div>

                    <WorkoutCalendar
                        {...view}
                        workouts={monthWorkouts}
                        selected={selected}
                        onSelect={setSelected}
                        onMove={moveMonth}
                        compact
                    />

                    <div className="selected-workouts">
                        <div className="selected-heading">
                            <strong>
                                {selected.replaceAll('-', '.')} 운동
                            </strong>

                            <Link
                                to={`/workouts/new?date=${selected}`}
                                className="text-link"
                            >
                                ＋ 기록 추가
                            </Link>
                        </div>

                        {selectedItems.length ? (
                            selectedItems.map(w => (
                                <Link
                                    key={w.id}
                                    to={`/workouts/${w.id}`}
                                    className="mini-workout"
                                >
                                    <span
                                        className={`workout-symbol ${
                                            w.type === 'RUNNING'
                                                ? 'run-symbol'
                                                : 'box-symbol'
                                        }`}
                                    >
                                        {w.type === 'RUNNING' ? '🏃' : '🥊'}
                                    </span>

                                    <strong>{workoutLabel(w.type)}</strong>
                                    <span>{w.durationMinutes}분</span>
                                    <span className="push-right">→</span>
                                </Link>
                            ))
                        ) : (
                            <p className="muted">
                                선택한 날짜의 운동 기록이 없어요.
                            </p>
                        )}
                    </div>
                </section>

                <div className="right-column">
                    <section className="surface coaching-preview">
                        <div className="section-heading">
                            <div>
                                <span className="eyebrow">
                                    SMART COACH
                                </span>
                                <h2>오늘의 운동 컨디션</h2>
                            </div>
                            <span className="coaching-spark">✦</span>
                        </div>

                        <span className={`status-pill status-${level[1]}`}>
                            {level[0]}
                        </span>

                        <p>
                            {assessment?.reasons?.[0]?.detail ||
                                '운동 후 컨디션을 기록하면 최근 14일을 바탕으로 운동 상태를 확인할 수 있어요.'}
                        </p>

                        <Link
                            to="/coaching"
                            className="btn btn-primary full-width"
                        >
                            AI 코칭 확인하기 →
                        </Link>
                    </section>

                    <section className="surface recent-surface">
                        <div className="section-heading">
                            <div>
                                <span className="eyebrow">
                                    RECENT ACTIVITY
                                </span>
                                <h2>최근 운동</h2>
                            </div>

                            <Link to="/workouts" className="text-link">
                                전체 보기 →
                            </Link>
                        </div>

                        {yearWorkouts.slice(0, 4).map(w => (
                            <Link
                                key={w.id}
                                to={`/workouts/${w.id}`}
                                className="recent-row"
                            >
                                <span
                                    className={`workout-symbol ${
                                        w.type === 'RUNNING'
                                            ? 'run-symbol'
                                            : 'box-symbol'
                                    }`}
                                >
                                    {w.type === 'RUNNING' ? '🏃' : '🥊'}
                                </span>

                                <span>
                                    <strong>{workoutLabel(w.type)}</strong>
                                    <small>{dateKey(w.workoutDateTime)}</small>
                                </span>

                                <b>{w.durationMinutes}분</b>
                            </Link>
                        ))}

                        {!yearWorkouts.length && (
                            <p className="muted">
                                {loading
                                    ? '기록을 불러오는 중...'
                                    : '아직 운동 기록이 없어요.'}
                            </p>
                        )}
                    </section>
                </div>
            </div>

            <section className="surface heatmap-surface">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">
                            CONSISTENCY IS KEY
                        </span>
                        <h2>나의 운동 잔디</h2>
                    </div>

                    <span className="muted">최근 1년</span>
                </div>

                <WorkoutHeatmap workouts={yearWorkouts} />
            </section>
        </div>
    )
}
