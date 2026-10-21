import { getToken } from '../auth/token'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_URL = `${API_BASE_URL}/workouts`

function authHeaders() {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse(res) {
    if (!res.ok) {
        let body = null
        try {
            body = await res.json()
        } catch {
            // 바디가 없거나 JSON이 아닌 경우
        }
        const error = new Error(body?.message || `요청 실패 (${res.status})`)
        error.status = res.status
        error.errorCode = body?.errorCode
        throw error
    }
    return res.json()
}

export function fetchWorkouts(params) {
    const query = new URLSearchParams()
    if (params.type) query.set('type', params.type)
    if (params.from) query.set('from', params.from + ':00')
    if (params.to) query.set('to', params.to + ':00')
    if (params.sort) query.set('sort', params.sort)
    query.set('page', params.page ?? 0)
    query.set('size', params.size ?? 10)

    return fetch(`${API_URL}?${query.toString()}`, {
        headers: { ...authHeaders() }
    })
        .then(handleResponse)
}

export function fetchWorkoutById(id) {
    return fetch(`${API_URL}/${id}`, {
        headers: { ...authHeaders() }
    })
        .then(handleResponse)
}

export function createWorkout(payload) {
    return fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
    })
}

export function updateWorkout(id, payload) {
    return fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
    })
}

export function deleteWorkout(id) {
    return fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
    })
}

export function fetchStatsByType() {
    return fetch(`${API_BASE_URL}/workouts/stats/by-type`, {
        headers: { ...authHeaders() }
    })
        .then(handleResponse)
}

export function fetchStatsByMonth() {
    return fetch(`${API_BASE_URL}/workouts/stats/monthly`, {
        headers: { ...authHeaders() }
    })
        .then(handleResponse)
}