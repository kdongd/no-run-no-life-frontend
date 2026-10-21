import { getToken } from '../auth/token'

const BASE = import.meta.env.VITE_API_BASE_URL

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${getToken()}`, ...options.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const error = new Error(body.message || `요청 실패 (${response.status})`)
    error.status = response.status
    throw error
  }
  return response.json()
}

export const fetchAssessment = () => request('/coaching/assessment')
export const generateCoaching = () => request('/coaching', { method: 'POST' })
export const fetchCondition = id => request(`/workouts/${id}/condition`)
export const saveCondition = (id, payload) => request(`/workouts/${id}/condition`, { method: 'PUT', body: JSON.stringify(payload) })
