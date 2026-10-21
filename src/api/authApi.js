const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const AUTH_URL = `${API_BASE_URL}/auth`

export function signup(email, password) {
    return fetch(`${AUTH_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
}

export function login(email, password) {
    return fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
}

export function loginWithGoogle(idToken) {
    return fetch(`${AUTH_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
    })
}