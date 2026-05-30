import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, register, googleLoginUrl } from '../api/auth'
import toast from 'react-hot-toast'

export default function Login() {
  const { login: setAuth } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', org_name: '' })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form)
      setAuth(res.access_token, res.user)
      nav('/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand" style={{ justifyContent: 'center', paddingBottom: 24 }}>
          <div className="brand-mark" />
          <div className="brand-name">Growmos</div>
        </div>

        <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        <div className="sub">{mode === 'login' ? 'Welcome back — enter your details.' : 'Start your 14-day free trial.'}</div>

        <a href={googleLoginUrl()} className="btn-google">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </a>

        <div className="divider">or</div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label>Full name</label>
                <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Maya Jensen" />
              </div>
              <div className="form-group">
                <label>Organization name</label>
                <input className="form-input" value={form.org_name} onChange={set('org_name')} required placeholder="Acme Marketing" />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} required placeholder="you@company.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} required placeholder="••••••••" />
          </div>
          <button className="btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Loading…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ color: 'var(--accent-1)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
