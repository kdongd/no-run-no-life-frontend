
import { getToken } from '../auth/token'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const USERS_URL = `${API_BASE_URL}/users`

function authHeaders() {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

// 닉네임 중복 확인
export async function checkNicknameAvailability(nickname) {
    const query = new URLSearchParams({ nickname })

    const res = await fetch(
        `${USERS_URL}/nicknames/availability?${query.toString()}`
    )

    if (!res.ok) {
        throw new Error('닉네임 중복 확인에 실패했습니다.')
    }

    return res.json()
}

// 닉네임 변경
export async function updateNickname(nickname) {
    const res = await fetch(`${USERS_URL}/me/nickname`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
        },
        body: JSON.stringify({ nickname })
    })

    if (!res.ok) {
        const error = new Error('닉네임 변경에 실패했습니다.')
        error.status = res.status
        throw error
    }

    return res
}

// 로그인한 회원 정보 조회
export async function getMyInfo() {
    const res = await fetch(`${USERS_URL}/me`, {
        headers: { ...authHeaders() }
    })

    if (!res.ok) {
        const error = new Error('회원 정보를 불러오지 못했습니다.')
        error.status = res.status
        throw error
    }

    return res.json()
}
