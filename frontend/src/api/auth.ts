import client from './client'
import type { User } from '../types'

export interface TokenResponse { access_token: string; user: User }

export const register = (data: { name: string; email: string; password: string; org_name: string }) =>
  client.post<TokenResponse>('/auth/register', data).then((r) => r.data)

export const login = (email: string, password: string) =>
  client.post<TokenResponse>('/auth/login', { email, password }).then((r) => r.data)

export const getMe = () => client.get<User>('/auth/me').then((r) => r.data)

export const googleLoginUrl = () =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/google`
