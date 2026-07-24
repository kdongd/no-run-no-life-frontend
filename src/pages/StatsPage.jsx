import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { fetchStatsByType, fetchStatsByMonth } from '../api/workoutApi'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const chartOptions = {
    responsive: true,
    plugins: {
        legend: { labels: { color: '#d8dee8' } }
    },
    scales: {
        x: { ticks: { color: '#aeb8c8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#aeb8c8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
}

export default function StatsPage() {
    const [statsByType, setStatsByType] = useState([])
    const [statsByMonth, setStatsByMonth] = useState([])

    useEffect(() => {
        fetchStatsByType().then(setStatsByType).catch(err => console.error('타입별 통계 조회 실패:', err))
        fetchStatsByMonth().then(setStatsByMonth).catch(err => console.error('월별 통계 조회 실패:', err))
    }, [])

    const typeLabels = statsByType.map(s => s.type === 'RUNNING' ? '러닝' : '복싱')
    const typeCounts = statsByType.map(s => s.count)
    const typeDurations = statsByType.map(s => s.totalDurationMinutes)

    const typeChartData = {
        labels: typeLabels,
        datasets: [
            { label: '기록 수', data: typeCounts, backgroundColor: 'rgba(56,163,255,0.6)' },
            { label: '총 운동시간(분)', data: typeDurations, backgroundColor: 'rgba(255,70,70,0.6)' }
        ]
    }

    const monthLabels = statsByMonth.map(s => `${s.year}.${String(s.month).padStart(2, '0')}`)
    const monthCounts = statsByMonth.map(s => s.count)

    const monthChartData = {
        labels: monthLabels,
        datasets: [
            { label: '월별 운동 횟수', data: monthCounts, backgroundColor: 'rgba(56,163,255,0.6)' }
        ]
    }

    return (
        <>
            <header className="header">
                <div className="logo">NO RUN NO LIFE</div>
                <nav className="nav">
                    <Link to="/">홈</Link>
                    <Link to="/workouts/new">운동 기록하기</Link>
                    <Link to="/stats" className="active">통계</Link>
                </nav>
            </header>

            <div className="detail-page" style={{ maxWidth: 900 }}>
                <div className="detail-card" style={{ marginBottom: 24 }}>
                    <div className="record-title" style={{ marginBottom: 20 }}>타입별 통계</div>
                    {statsByType.length > 0
                        ? <Bar data={typeChartData} options={chartOptions} />
                        : <div className="empty">데이터가 없습니다.</div>
                    }
                </div>

                <div className="detail-card">
                    <div className="record-title" style={{ marginBottom: 20 }}>월별 운동 횟수</div>
                    {statsByMonth.length > 0
                        ? <Bar data={monthChartData} options={chartOptions} />
                        : <div className="empty">데이터가 없습니다.</div>
                    }
                </div>
            </div>
        </>
    )
}