
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

import { fetchWorkoutsInRange, dateKey } from '../utils/workouts'
import { fetchCondition } from '../api/coachingApi'
import { clearToken } from '../auth/token'

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
)

const BLUE = '#3978f6'
const CORAL = '#ff8582'
const GRID = '#edf1f7'
const MUTED = '#8292aa'

const PERIODS = [
  { value: 1, label: '1개월' },
  { value: 3, label: '3개월' },
  { value: 6, label: '6개월' },
  { value: 12, label: '1년' }
]

const number = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function dateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

function monthId(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`
}

function getMonths(count) {
  const today = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - count + index + 1,
      1
    )
    return {
      id: monthId(date),
      label: `${date.getMonth() + 1}월`,
      year: date.getFullYear()
    }
  })
}

function formatMinutes(minutes) {
  const total = Math.round(minutes)
  const hours = Math.floor(total / 60)
  const remaining = total % 60

  if (hours === 0) return `${remaining}분`
  if (remaining === 0) return `${hours}시간`
  return `${hours}시간 ${remaining}분`
}

function formatDistance(value) {
  return number(value).toLocaleString('ko-KR', {
    maximumFractionDigits: 1
  })
}

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 450 },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      padding: 12,
      cornerRadius: 10,
      titleFont: { size: 12, weight: '600' },
      bodyFont: { size: 12 },
      displayColors: true
    }
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: MUTED,
        font: { size: 11 },
        maxRotation: 0
      }
    },
    y: {
      beginAtZero: true,
      border: { display: false, dash: [4, 4] },
      grid: {
        color: GRID,
        drawTicks: false
      },
      ticks: {
        color: MUTED,
        precision: 0,
        padding: 10,
        font: { size: 11 }
      }
    }
  }
}

function MetricCard({ icon, label, value, unit, description, tone }) {
  return (
    <div className="nrnl-stat-metric">
      <div className="nrnl-stat-metric-top">
        <span>{label}</span>
        <span className={`nrnl-stat-icon ${tone || ''}`}>
          {icon}
        </span>
      </div>

      <div className="nrnl-stat-metric-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>

      <div className="nrnl-stat-metric-description">
        {description}
      </div>
    </div>
  )
}

function ChartCard({ title, description, children, extra }) {
  return (
    <section className="nrnl-stat-card">
      <div className="nrnl-stat-card-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {extra}
      </div>
      {children}
    </section>
  )
}

function LegendItem({ color, children }) {
  return (
    <span className="nrnl-stat-legend-item">
      <i style={{ backgroundColor: color }} />
      {children}
    </span>
  )
}

function EmptyChart({ children }) {
  return (
    <div className="nrnl-stat-empty">
      <span className="nrnl-stat-empty-icon">◷</span>
      <strong>아직 표시할 기록이 없어요</strong>
      <p>{children || '운동을 기록하면 통계가 표시됩니다.'}</p>
    </div>
  )
}

function getWorkoutDate(workout) {
  return dateKey(workout.workoutDateTime)
}

export default function StatsPage() {
  const navigate = useNavigate()

  const [period, setPeriod] = useState(6)
  const [workouts, setWorkouts] = useState([])
  const [conditions, setConditions] = useState([])
  const [loading, setLoading] = useState(true)
  const [conditionLoading, setConditionLoading] = useState(false)
  const [error, setError] = useState('')

  const months = useMemo(() => getMonths(period), [period])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setConditionLoading(false)
      setError('')
      setWorkouts([])
      setConditions([])

      try {
        const today = new Date()
        const firstMonth = new Date(
          today.getFullYear(),
          today.getMonth() - period + 1,
          1
        )

        const items = await fetchWorkoutsInRange(
          dateString(firstMonth),
          dateString(today)
        )

        if (!active) return

        const validItems = items.filter(item => {
          const key = getWorkoutDate(item)
          return key && key <= dateString(today)
        })

        setWorkouts(validItems)
        setLoading(false)

        // 기존 API를 그대로 활용한다.
        // 최근 30건만 조회하여 과도한 API 요청을 방지한다.
        const recent = [...validItems]
          .filter(item => item.id != null)
          .sort((a, b) =>
            String(b.workoutDateTime).localeCompare(
              String(a.workoutDateTime)
            )
          )
          .slice(0, 30)

        if (recent.length === 0) return

        setConditionLoading(true)

        // 요청을 한꺼번에 수십 개 보내지 않고
        // 5개씩 나눠서 조회한다.
        const collected = []

        for (let i = 0; i < recent.length; i += 5) {
          if (!active) return

          const batch = recent.slice(i, i + 5)

          const results = await Promise.allSettled(
            batch.map(async workout => {
              const condition = await fetchCondition(workout.id)
              return {
                id: workout.id,
                date: getWorkoutDate(workout),
                type: workout.type,
                rpe: number(condition.rpe),
                bodyCondition: number(condition.bodyCondition)
              }
            })
          )

          if (!active) return

          results.forEach(result => {
            if (result.status === 'fulfilled') {
              collected.push(result.value)
            } else if (result.reason?.status === 401) {
              throw result.reason
            }
          })

          setConditions([...collected])
        }
      } catch (err) {
        if (!active) return

        if (err.status === 401) {
          clearToken()
          navigate('/login', { replace: true })
        } else {
          setError(
            err.message || '통계 데이터를 불러오지 못했습니다.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
          setConditionLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [period, navigate])

  const stats = useMemo(() => {
    const running = workouts.filter(w => w.type === 'RUNNING')
    const boxing = workouts.filter(w => w.type === 'BOXING')

    const minutes = workouts.reduce(
      (sum, w) => sum + number(w.durationMinutes),
      0
    )

    const distance = running.reduce(
      (sum, w) => sum + number(w.distanceKm),
      0
    )

    const validConditions = conditions.filter(
      c => c.rpe >= 1 && c.rpe <= 5
    )

    const avgRpe = validConditions.length
      ? validConditions.reduce((sum, c) => sum + c.rpe, 0) /
        validConditions.length
      : null

    const monthly = months.map(month => {
      const items = workouts.filter(w =>
        getWorkoutDate(w).startsWith(month.id)
      )

      return {
        ...month,
        running: items.filter(w => w.type === 'RUNNING').length,
        boxing: items.filter(w => w.type === 'BOXING').length,
        total: items.length
      }
    })

    return {
      total: workouts.length,
      minutes,
      distance,
      running: running.length,
      boxing: boxing.length,
      avgRpe,
      rpeCount: validConditions.length,
      monthly
    }
  }, [workouts, conditions, months])

  const monthLabels = stats.monthly.map(m => m.label)

  const lineData = {
    labels: monthLabels,
    datasets: [
      {
        label: '러닝',
        data: stats.monthly.map(m => m.running),
        borderColor: BLUE,
        backgroundColor: BLUE,
        borderWidth: 2.2,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderColor: BLUE,
        pointBorderWidth: 2,
        fill: false
      },
      {
        label: '복싱',
        data: stats.monthly.map(m => m.boxing),
        borderColor: CORAL,
        backgroundColor: CORAL,
        borderWidth: 2.2,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderColor: CORAL,
        pointBorderWidth: 2,
        fill: false
      }
    ]
  }

  const barData = {
    labels: monthLabels,
    datasets: [
      {
        label: '러닝',
        data: stats.monthly.map(m => m.running),
        backgroundColor: BLUE,
        borderRadius: 7,
        borderSkipped: false,
        maxBarThickness: 13,
        categoryPercentage: 0.65,
        barPercentage: 0.75
      },
      {
        label: '복싱',
        data: stats.monthly.map(m => m.boxing),
        backgroundColor: CORAL,
        borderRadius: 7,
        borderSkipped: false,
        maxBarThickness: 13,
        categoryPercentage: 0.65,
        barPercentage: 0.75
      }
    ]
  }

  const doughnutData = {
    labels: ['러닝', '복싱'],
    datasets: [
      {
        data: [stats.running, stats.boxing],
        backgroundColor: [BLUE, CORAL],
        borderWidth: 0,
        hoverOffset: 4,
        spacing: 3,
        borderRadius: 5
      }
    ]
  }

  const rpeItems = useMemo(
    () =>
      [...conditions]
        .filter(c => c.rpe >= 1 && c.rpe <= 5)
        .sort((a, b) => {
          const byDate = a.date.localeCompare(b.date)
          return byDate || Number(a.id) - Number(b.id)
        })
        .slice(-12),
    [conditions]
  )

  const rpeData = {
    labels: rpeItems.map(c => {
      const [, month, day] = c.date.split('-')
      return `${Number(month)}/${Number(day)}`
    }),
    datasets: [
      {
        label: '운동 체감 강도',
        data: rpeItems.map(c => c.rpe),
        borderColor: BLUE,
        backgroundColor: 'rgba(57,120,246,0.07)',
        borderWidth: 2.3,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: BLUE,
        pointBorderWidth: 2,
        fill: true
      }
    ]
  }

  const rpeOptions = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        min: 1,
        max: 5,
        ticks: {
          ...baseOptions.scales.y.ticks,
          stepSize: 1
        }
      }
    }
  }

  const runningPercent = stats.total
    ? Math.round((stats.running / stats.total) * 100)
    : 0

  const boxingPercent = stats.total
    ? Math.round((stats.boxing / stats.total) * 100)
    : 0

  const hasData = stats.total > 0

  return (
    <div className="nrnl-stats-page">
      <style>{`
        .nrnl-stats-page {
          width: 100%;
          min-width: 0;
          padding-bottom: 32px;
          color: #1d304f;
        }

        .nrnl-stats-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
          flex-wrap: wrap;
        }

        .nrnl-stats-eyebrow {
          color: #8498b7;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.6px;
          margin-bottom: 10px;
        }

        .nrnl-stats-header h1 {
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -1px;
          margin: 0 0 8px;
          color: #1c2e4b;
        }

        .nrnl-stats-header p {
          margin: 0;
          color: #8797b0;
          font-size: 14px;
        }

        .nrnl-period-switch {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #fff;
          border: 1px solid #e4ebf5;
          border-radius: 12px;
          padding: 5px;
        }

        .nrnl-period-switch button {
          border: 0;
          background: transparent;
          border-radius: 8px;
          color: #8292aa;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .nrnl-period-switch button.active {
          background: #3978f6;
          color: white;
          box-shadow: 0 3px 8px rgba(57,120,246,.16);
        }

        .nrnl-stats-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .nrnl-stat-metric,
        .nrnl-stat-card {
          background: #fff;
          border: 1px solid #e7edf6;
          border-radius: 18px;
          box-shadow: 0 6px 24px rgba(29,48,79,.025);
          min-width: 0;
        }

        .nrnl-stat-metric {
          padding: 22px;
          min-height: 145px;
        }

        .nrnl-stat-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #788ba6;
          font-size: 12px;
          font-weight: 700;
        }

        .nrnl-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #edf4ff;
          color: #3978f6;
          font-size: 17px;
        }

        .nrnl-stat-icon.coral {
          background: #fff0ef;
          color: #f17a75;
        }

        .nrnl-stat-icon.mint {
          background: #eafaf4;
          color: #27a987;
        }

        .nrnl-stat-icon.violet {
          background: #f3f0ff;
          color: #8870dd;
        }

        .nrnl-stat-metric-value {
          margin-top: 16px;
          font-size: 29px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -1px;
          color: #1c2e4b;
          white-space: nowrap;
        }

        .nrnl-stat-metric-value small {
          font-size: 14px;
          font-weight: 600;
          margin-left: 4px;
          color: #8090a9;
          letter-spacing: 0;
        }

        .nrnl-stat-metric-description {
          margin-top: 10px;
          color: #96a5ba;
          font-size: 11px;
        }

        .nrnl-stats-main-grid,
        .nrnl-stats-bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .nrnl-stats-bottom-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .nrnl-stat-card {
          padding: 26px;
          overflow: hidden;
        }

        .nrnl-stat-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .nrnl-stat-card-header h2 {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -.4px;
          margin: 0 0 7px;
          color: #1c2e4b;
        }

        .nrnl-stat-card-header p {
          color: #95a3b9;
          font-size: 12px;
          margin: 0;
        }

        .nrnl-stat-chart {
          position: relative;
          width: 100%;
          height: 225px;
          min-width: 0;
        }

        .nrnl-stat-chart.small {
          height: 190px;
        }

        .nrnl-stat-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 18px;
          flex-wrap: wrap;
        }

        .nrnl-stat-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #7789a3;
          font-size: 12px;
          font-weight: 600;
        }

        .nrnl-stat-legend-item i {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          display: inline-block;
        }

        .nrnl-stat-donut-area {
          display: flex;
          align-items: center;
          gap: 22px;
          min-height: 215px;
        }

        .nrnl-stat-donut {
          position: relative;
          width: 175px;
          height: 175px;
          flex-shrink: 0;
        }

        .nrnl-stat-donut-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          pointer-events: none;
        }

        .nrnl-stat-donut-center strong {
          font-size: 28px;
          font-weight: 800;
          color: #1c2e4b;
        }

        .nrnl-stat-donut-center span {
          font-size: 11px;
          color: #9aa8bc;
        }

        .nrnl-stat-sport-list {
          flex: 1;
          min-width: 0;
        }

        .nrnl-stat-sport-row {
          margin-bottom: 18px;
        }

        .nrnl-stat-sport-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 9px;
          gap: 8px;
          font-size: 12px;
        }

        .nrnl-stat-sport-heading strong {
          font-weight: 700;
          color: #30435f;
        }

        .nrnl-stat-sport-heading span {
          color: #8292aa;
          white-space: nowrap;
        }

        .nrnl-stat-progress {
          width: 100%;
          height: 7px;
          background: #eef2f8;
          border-radius: 99px;
          overflow: hidden;
        }

        .nrnl-stat-progress-fill {
          height: 100%;
          border-radius: 99px;
        }

        .nrnl-stat-empty {
          min-height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          gap: 8px;
          color: #93a2b8;
        }

        .nrnl-stat-empty-icon {
          font-size: 27px;
          color: #c4d0e1;
        }

        .nrnl-stat-empty strong {
          color: #6d809c;
          font-size: 13px;
        }

        .nrnl-stat-empty p {
          font-size: 12px;
          margin: 0;
        }

        .nrnl-stat-note {
          font-size: 11px;
          color: #9aa8bc;
          margin-top: 14px;
          line-height: 1.6;
        }

        .nrnl-stat-error {
          padding: 14px 16px;
          border-radius: 12px;
          background: #fff1f0;
          color: #c44d48;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .nrnl-stat-loading {
          padding: 60px 20px;
          text-align: center;
          color: #8292aa;
          font-size: 14px;
        }

        @media (max-width: 1150px) {
          .nrnl-stats-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .nrnl-stats-main-grid,
          .nrnl-stats-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .nrnl-stats-header h1 {
            font-size: 25px;
          }

          .nrnl-stats-metrics {
            gap: 10px;
          }

          .nrnl-stat-metric {
            padding: 16px;
            min-height: 130px;
          }

          .nrnl-stat-metric-value {
            font-size: 23px;
          }

          .nrnl-stat-card {
            padding: 18px;
          }

          .nrnl-stat-donut-area {
            flex-direction: column;
            align-items: stretch;
          }

          .nrnl-stat-donut {
            margin: 0 auto;
          }

          .nrnl-period-switch {
            width: 100%;
          }

          .nrnl-period-switch button {
            flex: 1;
            padding: 10px 5px;
          }
        }
      `}</style>

      <div className="nrnl-stats-header">
        <div>
          <div className="nrnl-stats-eyebrow">
            PERFORMANCE ANALYTICS
          </div>
          <h1>운동 통계</h1>
          <p>나의 운동 기록을 한눈에 확인해 보세요.</p>
        </div>

        <div className="nrnl-period-switch">
          {PERIODS.map(item => (
            <button
              key={item.value}
              type="button"
              className={period === item.value ? 'active' : ''}
              onClick={() => setPeriod(item.value)}
              aria-pressed={period === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="nrnl-stat-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="nrnl-stat-loading">
          운동 통계를 불러오는 중...
        </div>
      ) : (
        <>
          <div className="nrnl-stats-metrics">
            <MetricCard
              icon="◉"
              label="총 운동 횟수"
              value={stats.total.toLocaleString()}
              unit="회"
              description={`최근 ${period}개월 운동 기록`}
            />

            <MetricCard
              icon="◷"
              label="총 운동 시간"
              value={formatMinutes(stats.minutes)}
              description="러닝과 복싱 누적 시간"
              tone="coral"
            />

            <MetricCard
              icon="↗"
              label="러닝 거리"
              value={formatDistance(stats.distance)}
              unit="km"
              description="선택 기간 누적 거리"
              tone="mint"
            />

            <MetricCard
              icon="♡"
              label="평균 RPE"
              value={
                stats.avgRpe === null
                  ? '-'
                  : stats.avgRpe.toFixed(1)
              }
              unit="/ 5"
              description={
                conditionLoading
                  ? '컨디션 기록 조회 중...'
                  : `최근 운동 ${stats.rpeCount}건 기준`
              }
              tone="violet"
            />
          </div>

          <div className="nrnl-stats-main-grid">
            <ChartCard
              title="운동 활동 추이"
              description="월별 러닝과 복싱 횟수 변화"
            >
              {hasData ? (
                <>
                  <div className="nrnl-stat-chart">
                    <Line
                      data={lineData}
                      options={baseOptions}
                    />
                  </div>

                  <div className="nrnl-stat-legend">
                    <LegendItem color={BLUE}>러닝</LegendItem>
                    <LegendItem color={CORAL}>복싱</LegendItem>
                  </div>
                </>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>

            <ChartCard
              title="운동 종목 비율"
              description="러닝과 복싱 운동 구성"
            >
              {hasData ? (
                <div className="nrnl-stat-donut-area">
                  <div className="nrnl-stat-donut">
                    <Doughnut
                      data={doughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '82%',
                        plugins: {
                          legend: { display: false },
                          tooltip: baseOptions.plugins.tooltip
                        }
                      }}
                    />

                    <div className="nrnl-stat-donut-center">
                      <strong>{stats.total}</strong>
                      <span>총 운동 횟수</span>
                    </div>
                  </div>

                  <div className="nrnl-stat-sport-list">
                    <div className="nrnl-stat-sport-row">
                      <div className="nrnl-stat-sport-heading">
                        <strong>러닝</strong>
                        <span>
                          {stats.running}회 · {runningPercent}%
                        </span>
                      </div>

                      <div className="nrnl-stat-progress">
                        <div
                          className="nrnl-stat-progress-fill"
                          style={{
                            width: `${runningPercent}%`,
                            background: BLUE
                          }}
                        />
                      </div>
                    </div>

                    <div className="nrnl-stat-sport-row">
                      <div className="nrnl-stat-sport-heading">
                        <strong>복싱</strong>
                        <span>
                          {stats.boxing}회 · {boxingPercent}%
                        </span>
                      </div>

                      <div className="nrnl-stat-progress">
                        <div
                          className="nrnl-stat-progress-fill"
                          style={{
                            width: `${boxingPercent}%`,
                            background: CORAL
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>
          </div>

          <div className="nrnl-stats-bottom-grid">
            <ChartCard
              title="월별 운동 비교"
              description="종목별 월간 운동 횟수"
            >
              {hasData ? (
                <>
                  <div className="nrnl-stat-chart small">
                    <Bar
                      data={barData}
                      options={baseOptions}
                    />
                  </div>

                  <div className="nrnl-stat-legend">
                    <LegendItem color={BLUE}>러닝</LegendItem>
                    <LegendItem color={CORAL}>복싱</LegendItem>
                  </div>
                </>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>

            <ChartCard
              title="운동 강도 변화"
              description="최근 운동의 체감 강도 (RPE)"
              extra={
                <span
                  style={{
                    fontSize: 11,
                    color: MUTED,
                    whiteSpace: 'nowrap'
                  }}
                >
                  5점 만점
                </span>
              }
            >
              {rpeItems.length > 0 ? (
                <>
                  <div className="nrnl-stat-chart small">
                    <Line
                      data={rpeData}
                      options={rpeOptions}
                    />
                  </div>

                  <p className="nrnl-stat-note">
                    컨디션이 기록된 최근 운동 최대 12건의 RPE입니다.
                    {conditionLoading && ' 추가 기록을 불러오는 중...'}
                  </p>
                </>
              ) : (
                <EmptyChart>
                  {conditionLoading
                    ? '컨디션 기록을 확인하고 있어요.'
                    : '운동 후 컨디션을 입력하면 RPE 추이가 표시됩니다.'}
                </EmptyChart>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}
