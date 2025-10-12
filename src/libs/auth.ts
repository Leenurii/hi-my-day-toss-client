// src/libs/auth.ts
import { Storage } from '@apps-in-toss/web-framework'

export const APP_JWT_KEY = 'APP_JWT'
export const TOSS_USER_KEY = 'TOSS_USER_KEY' // (선택) 서버 응답의 tossUserKey 저장 시 사용

export async function setJWT(token: string) {
  await Storage.setItem(APP_JWT_KEY, token)
}

export async function getJWT(): Promise<string | null> {
  return Storage.getItem(APP_JWT_KEY)
}

export async function clearJWT() {
  await Storage.removeItem(APP_JWT_KEY)
}

export async function setTossUserKey(key: string | number) {
  await Storage.setItem(TOSS_USER_KEY, String(key))
}

export async function getTossUserKey(): Promise<string | null> {
  return Storage.getItem(TOSS_USER_KEY)
}

export async function clearTossUserKey() {
  await Storage.removeItem(TOSS_USER_KEY)
}
