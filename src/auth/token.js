const TOKEN_KEY = 'accessToken'

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
    const token = getToken()
    if (!token) return false
    try {
        const payload = decodeTokenPayload(token)
        return !payload.exp || payload.exp * 1000 > Date.now()
    } catch {
        return false
    }
}

function decodeTokenPayload(token) {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
    )
    return JSON.parse(json)
}

export function hasNickname() {
    const token = getToken()
    if (!token) return false
    try {
        const payload = decodeTokenPayload(token)
        return !!payload.nickname
    } catch (err) {
        console.error('토큰 디코딩 실패:', err)
        return false
    }
}

export function getNickname() {
    const token = getToken()
    if (!token) return null
    try {
        const payload = decodeTokenPayload(token)
        return payload.nickname || null
    } catch (err) {
        console.error('토큰 디코딩 실패:', err)
        return null
    }
}