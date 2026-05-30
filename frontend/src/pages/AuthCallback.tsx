import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/auth'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) { nav('/login'); return }
    localStorage.setItem('token', token)
    getMe().then((user) => { login(token, user); nav('/') }).catch(() => nav('/login'))
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ color: 'var(--text-3)', fontSize: 14 }}>Signing you in…</div>
    </div>
  )
}
