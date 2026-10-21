
import { useRef } from 'react'

function normalizeDate(value) {
    const digits = value.replace(/\D/g, '')

    if (digits.length !== 8) return value

    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
}

function normalizeTime(value) {
    const digits = value.replace(/\D/g, '')

    if (digits.length === 3) {
        return `0${digits[0]}:${digits.slice(1)}`
    }

    if (digits.length === 4) {
        return `${digits.slice(0, 2)}:${digits.slice(2)}`
    }

    return value
}

export function isValidWorkoutDateTime(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return false

    const [year, month, day] = date.split('-').map(Number)
    const parsed = new Date(year, month - 1, day)

    return (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day
    )
}

export default function WorkoutDateTimeInput({
    date,
    time,
    onDateChange,
    onTimeChange,
    error
}) {
    const pickerRef = useRef(null)

    function openCalendar() {
        const picker = pickerRef.current

        if (picker?.showPicker) {
            picker.showPicker()
        } else {
            picker?.focus()
            picker?.click()
        }
    }

    return (
        <div className="mb-4 field-group">
            <label className="form-label">
                운동 날짜 및 시작 시간
            </label>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: 12
                }}
            >
                <div>
                    <label
                        htmlFor="workout-date"
                        style={{
                            display: 'block',
                            marginBottom: 8,
                            fontSize: 13
                        }}
                    >
                        운동 날짜
                    </label>

                    <div style={{ position: 'relative' }}>
                        <input
                            id="workout-date"
                            type="text"
                            inputMode="numeric"
                            className="form-control"
                            placeholder="2026-10-09"
                            value={date}
                            onChange={e => onDateChange(e.target.value)}
                            onBlur={() =>
                                onDateChange(normalizeDate(date))
                            }
                            style={{ paddingRight: 46 }}
                        />

                        <button
                            type="button"
                            aria-label="달력 열기"
                            onClick={openCalendar}
                            style={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                border: 0,
                                background: 'transparent',
                                color: '#397cf4',
                                fontSize: 20,
                                cursor: 'pointer',
                                padding: 6
                            }}
                        >
                            ▦
                        </button>

                        <input
                            ref={pickerRef}
                            type="date"
                            value={
                                /^\d{4}-\d{2}-\d{2}$/.test(date)
                                    ? date
                                    : ''
                            }
                            onChange={e => onDateChange(e.target.value)}
                            tabIndex={-1}
                            aria-label="날짜 선택 달력"
                            style={{
                                position: 'absolute',
                                right: 8,
                                bottom: 0,
                                width: 1,
                                height: 1,
                                opacity: 0,
                                pointerEvents: 'none'
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="workout-time"
                        style={{
                            display: 'block',
                            marginBottom: 8,
                            fontSize: 13
                        }}
                    >
                        시작 시간
                    </label>

                    <input
                        id="workout-time"
                        type="text"
                        inputMode="numeric"
                        className="form-control"
                        placeholder="18:00"
                        value={time}
                        onChange={e => onTimeChange(e.target.value)}
                        onBlur={() =>
                            onTimeChange(normalizeTime(time))
                        }
                    />
                </div>
            </div>

            <p
                style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: '#8294af'
                }}
            >
                날짜: 20261009 또는 2026-10-09 · 시간: 1800 또는 18:00
            </p>

            {error && (
                <div className="field-error" role="alert">
                    {error}
                </div>
            )}
        </div>
    )
}
