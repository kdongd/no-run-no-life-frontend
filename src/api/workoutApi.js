const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const API_URL = `${API_BASE_URL}/workouts`

export function fetchWorkouts(params) {
    const query = new URLSearchParams()
    if (params.type) query.set('type', params.type)
    if (params.from) query.set('from', params.from + ':00')
    if (params.to) query.set('to', params.to + ':00')
    if (params.sort) query.set('sort', params.sort)
    query.set('page', params.page ?? 0)
    query.set('size', params.size ?? 10)

    return fetch(`${API_URL}?${query.toString()}`)
        .then(res => res.json())
}

export function fetchWorkoutById(id) {
    return fetch(`${API_URL}/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('상세 조회 실패')
            return res.json()
        })
}

export function createWorkout(payload) {
    return fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
}

export function updateWorkout(id, payload) {
    return fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
}

export function deleteWorkout(id) {
    return fetch(`${API_URL}/${id}`, { method: 'DELETE' })
}

export function fetchStatsByType() {
    return fetch(`${API_BASE_URL}/workouts/stats/by-type`)
        .then(res => res.json())
}

export function fetchStatsByMonth() {
    return fetch(`${API_BASE_URL}/workouts/stats/monthly`)
        .then(res => res.json())
}