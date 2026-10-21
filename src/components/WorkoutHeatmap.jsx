
import { useMemo, useState } from 'react'
import { countByDate, todayKey } from '../utils/workouts'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function dateKey(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function formatDate(key) {
    const [year, month, day] = key.split('-').map(Number)
    const weekday = new Date(year, month - 1, day).getDay()
    return `${year}년 ${month}월 ${day}일 (${WEEKDAYS[weekday]})`
}

export default function WorkoutHeatmap({ workouts = [] }) {
    const [hovered, setHovered] = useState(null)

    const counts = useMemo(() => countByDate(workouts), [workouts])

    const { weeks, months, activeDays, totalCount } = useMemo(() => {
        const today = new Date(`${todayKey()}T12:00:00`)
        const start = new Date(today)
        start.setFullYear(start.getFullYear() - 1)
        start.setDate(start.getDate() + 1)
        start.setDate(start.getDate() - start.getDay())

        const end = new Date(today)
        end.setDate(end.getDate() + 6 - end.getDay())

        const columns = []
        const labels = []
        let previousMonth = -1
        let active = 0
        let total = 0

        for (
            let date = new Date(start);
            date <= end;
            date.setDate(date.getDate() + 1)
        ) {
            const key = dateKey(date)
            const weekIndex = Math.floor(
                Math.round((date - start) / 86400000) / 7
            )
            const dayIndex = date.getDay()
            const future = date > today
            const count = future ? 0 : (counts[key] || 0)

            if (dayIndex === 0) {
                columns.push([])
            }

            if (date.getMonth() !== previousMonth) {
                // 첫 번째 부분 월은 표시하지 않아 월 이름이 겹치지 않도록 처리
                if (weekIndex > 0) {
                    labels.push({
                        name: `${date.getMonth() + 1}월`,
                        weekIndex
                    })
                }
                previousMonth = date.getMonth()
            }

            columns[columns.length - 1].push({
                key,
                count,
                future
            })

            if (count > 0) active++
            total += count
        }

        return {
            weeks: columns,
            months: labels,
            activeDays: active,
            totalCount: total
        }
    }, [counts])

    return (
        <div className="github-heatmap">
            <div className="github-heatmap-summary">
                <div>
                    <strong>{activeDays}일</strong>
                    <span>최근 1년간 운동한 날</span>
                </div>
                <span className="github-heatmap-total">
                    총 {totalCount}회 운동
                </span>
            </div>

            <div className="github-heatmap-scroll">
                <div className="github-heatmap-chart">
                    <div className="github-heatmap-months">
                        <span className="github-heatmap-month-spacer" />
                        <div className="github-heatmap-month-track">
                            {months.map((month, index) => (
                                <span
                                    key={`${month.name}-${index}`}
                                    style={{
                                        left: `${month.weekIndex / weeks.length * 100}%`
                                    }}
                                >
                                    {month.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="github-heatmap-body">
                        <div className="github-heatmap-weekdays">
                            {WEEKDAYS.map((day, index) => (
                                <span key={day}>
                                    {[1, 3, 5].includes(index) ? day : ''}
                                </span>
                            ))}
                        </div>

                        <div className="github-heatmap-weeks">
                            {weeks.map((week, weekIndex) => (
                                <div
                                    className="github-heatmap-week"
                                    key={weekIndex}
                                >
                                    {week.map(day => (
                                        <button
                                            key={day.key}
                                            type="button"
                                            className={[
                                                'github-heatmap-cell',
                                                `level-${Math.min(day.count, 4)}`,
                                                day.future ? 'is-future' : ''
                                            ].join(' ')}
                                            disabled={day.future}
                                            aria-label={`${formatDate(day.key)}, 운동 ${day.count}회`}
                                            onMouseEnter={() => setHovered(day.key)}
                                            onMouseLeave={() => setHovered(null)}
                                            onFocus={() => setHovered(day.key)}
                                            onBlur={() => setHovered(null)}
                                        >
                                            {hovered === day.key && (
                                                <span
                                                    className="github-heatmap-tooltip"
                                                    role="tooltip"
                                                >
                                                    <strong>
                                                        {day.count
                                                            ? `운동 ${day.count}회`
                                                            : '운동 기록 없음'}
                                                    </strong>
                                                    <span>{formatDate(day.key)}</span>
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="github-heatmap-legend">
                <span>적게</span>
                {[0, 1, 2, 3, 4].map(level => (
                    <i
                        key={level}
                        className={`github-heatmap-cell level-${level}`}
                    />
                ))}
                <span>많이</span>
            </div>
        </div>
    )
}
