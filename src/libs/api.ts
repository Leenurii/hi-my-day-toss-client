
// src/libs/api.ts
export class ApiError extends Error {
  status: number
  payload: unknown
  constructor(status: number, payload: unknown, message?: string) {
    super(message || `API ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
console.log(API_BASE)
console.log('API_BASE:', import.meta.env.VITE_API_BASE_URL)

type ApiInput = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  skipAuth?: boolean
  signal?: AbortSignal
}

import { getJWT, clearJWT } from '@/libs/auth'

export async function apiFetch<T = unknown>(path: string, options: ApiInput = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, skipAuth, signal } = options

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (!skipAuth) {
    const jwt = await getJWT()
    if (jwt) baseHeaders.Authorization = `Bearer ${jwt}`
  }
  const url = path.startsWith('http')
    ? path                     
    : `${API_BASE}${path}`     


  const res = await fetch(url, {
    method,
    headers: baseHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
    signal,
  })

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }

  if (!res.ok) {
    if (res.status === 401) await clearJWT()
    // DRF가 내려주는 detail / errors를 살려서 throw
    const msg =
      (typeof data === 'object' && data && ('detail' in (data as any))) ? (data as any).detail :
      res.statusText || 'Request failed'
    throw new ApiError(res.status, data, msg)
  }

  return data as T
}
