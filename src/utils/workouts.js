import { fetchWorkouts } from '../api/workoutApi'

export const dateKey = value => String(value || '').slice(0, 10)
export const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const monthKey = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`
export const koreanDate = value => value ? dateKey(value).replaceAll('-', '.') : '-'
export const workoutLabel = type => type === 'RUNNING' ? '러닝' : '복싱'

// 백엔드가 페이지네이션을 제공하므로 조회 기간 내 모든 페이지를 순서대로 수집합니다.
// 많은 기록이 있는 경우 별도 집계 API로 교체하는 것이 좋습니다.
export async function fetchWorkoutsInRange(fromDate, toDate) {
  const all = []
  const start = `${fromDate}T00:00`
  const end = `${toDate}T23:59`
  let page = 0
  while (true) {
    const result = await fetchWorkouts({ from: start, to: end, page, size: 100, sort: 'workoutDateTime,desc' })
    if (!Array.isArray(result.content)) throw new Error('운동 목록 응답 형식이 예상과 다릅니다.')
    all.push(...result.content)
    if (result.last || page + 1 >= result.totalPages || result.content.length === 0) break
    page += 1
  }
  return all
}
export function countByDate(workouts) {
  const counts = {}
  workouts.forEach(w => { const key = dateKey(w.workoutDateTime); if (key) counts[key] = (counts[key] || 0) + 1 })
  return counts
}
export function monthBounds(year, month) {
  return { from: `${monthKey(year, month)}-01`, to: `${monthKey(year, month)}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}` }
}
