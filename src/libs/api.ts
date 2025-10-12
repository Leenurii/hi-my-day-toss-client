// src/libs/api.ts
import { getJWT, clearJWT } from '@/libs/auth'

type ApiInput<TBody = unknown> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: TBody
  skipAuth?: boolean
  signal?: AbortSignal
}

export async function apiFetch<TResp = unknown, TBody = unknown>(
  path: string,
  options: ApiInput<TBody> = {}
): Promise<TResp> {
  const { method = 'GET', headers = {}, body, skipAuth, signal } = options

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (!skipAuth) {
    const jwt = await getJWT()
    if (jwt) baseHeaders.Authorization = `Bearer ${jwt}`
  }

  const res = await fetch(path, {
    method,
    headers: baseHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  const text = await res.text()
  const data = text ? (() => { try { return JSON.parse(text) } catch { return text } })() : null

  if (!res.ok) {
    if (res.status === 401) await clearJWT()
    const detail = (data && (data.detail || data.error)) || res.statusText
    throw new Error(`API ${res.status}: ${detail}`)
  }

  return data as TResp
}
