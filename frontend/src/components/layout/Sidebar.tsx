import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/', label: 'Overview', icon: '▦' },
  { to: '/uploads', label: 'Upload Data', icon: '↑' },
  { to: '/datasources', label: 'Data Sources', icon: '⊕' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <div className="brand-name">Growmos</div>
      </div>

      <div className="nav-group-label">Analytics</div>
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>{n.icon}</span>
          <span>{n.label}</span>
        </NavLink>
      ))}

      <div className="sidebar-footer">
        <div className="avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        </div>
        <button className="icon-btn" onClick={logout} title="Sign out" style={{ fontSize: 16 }}>⇥</button>
      </div>
    </aside>
  )
}
