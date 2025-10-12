// src/libs/errors.ts
import { ApiError } from '@/libs/api'

export function formatApiError(e: unknown): string {
  // 네트워크/Abort
  if (e instanceof DOMException && e.name === 'AbortError') return '요청이 취소되었어요.'
  if (!(e instanceof ApiError)) return (e as any)?.message || '알 수 없는 오류가 발생했어요.'

  const { status, payload } = e

  // DRF 표준 형태: { field: ["msg", ...] } | { detail: "..." }
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, any>
    if (typeof p.detail === 'string') return p.detail

    const lines: string[] = []
    for (const [key, val] of Object.entries(p)) {
      if (Array.isArray(val)) lines.push(`${key}: ${val.join(', ')}`)
      else if (typeof val === 'string') lines.push(`${key}: ${val}`)
      else lines.push(`${key}: ${JSON.stringify(val)}`)
    }
    if (lines.length) return lines.join('\n')
  }

  // 상태 코드별 기본 메시지
  if (status === 400) return '요청 형식이 올바르지 않아요.'
  if (status === 401) return '로그인이 필요해요.'
  if (status === 403) return '접근 권한이 없어요.'
  if (status === 404) return '대상을 찾을 수 없어요.'
  return `서버 오류가 발생했어요. (HTTP ${status})`
}
