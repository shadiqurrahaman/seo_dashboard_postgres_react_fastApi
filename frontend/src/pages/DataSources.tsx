import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listSources, addPostgres, syncSource, deleteSource, getBigQueryOAuthUrl } from '../api/datasources'
import Topbar from '../components/layout/Topbar'
import toast from 'react-hot-toast'

type View = 'list' | 'add-postgres' | 'add-bigquery'

function PostgresForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', host: '', port: 5432, database: '', username: '', password: '', query: '' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const mut = useMutation({
    mutationFn: () => addPostgres(form),
    onSuccess: () => { toast.success('PostgreSQL connected'); qc.invalidateQueries({ queryKey: ['sources'] }); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Connection failed'),
  })

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <div className="card-head"><div className="card-title">Connect PostgreSQL</div></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {(['name', 'host', 'database', 'username'] as const).map((k) => (
          <div className="form-group" key={k}>
            <label>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
            <input className="form-input" value={(form as any)[k]} onChange={set(k)} placeholder={k === 'name' ? 'My Analytics DB' : k} />
          </div>
        ))}
        <div className="form-group">
          <label>Port</label>
          <input className="form-input" type="number" value={form.port} onChange={(e) => setForm((f) => ({ ...f, port: +e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="form-input" type="password" value={form.password} onChange={set('password')} />
        </div>
      </div>
      <div className="form-group">
        <label>SQL Query</label>
        <textarea className="form-input" rows={4} value={form.query} onChange={set('query')} placeholder="SELECT date, channel, spend, clicks, impressions FROM marketing_data" style={{ resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="ctrl-primary" onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending ? 'Testing connection…' : 'Connect'}
        </button>
        <button className="ctrl" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default function DataSources() {
  const [view, setView] = useState<View>('list')
  const qc = useQueryClient()
  const { data: sources } = useQuery({ queryKey: ['sources'], queryFn: listSources })

  const syncMut = useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) => syncSource(id, type),
    onSuccess: (d) => { toast.success(`Synced ${d.synced} records`); qc.invalidateQueries({ queryKey: ['sources'] }) },
    onError: () => toast.error('Sync failed'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteSource,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['sources'] }) },
  })

  const startBigQuery = async () => {
    try {
      const url = await getBigQueryOAuthUrl()
      window.location.href = url
    } catch {
      toast.error('Could not start BigQuery OAuth')
    }
  }

  return (
    <>
      <Topbar title="Data Sources" />
      <div className="page-content">
        <div className="page-head">
          <div>
            <h1>Data sources</h1>
            <div className="sub">Connect your databases and warehouses — all data flows into the same dashboard.</div>
          </div>
          {view === 'list' && (
            <div className="controls">
              <button className="ctrl" onClick={() => setView('add-postgres')}>+ PostgreSQL</button>
              <button className="ctrl-primary" onClick={startBigQuery}>+ BigQuery</button>
            </div>
          )}
        </div>

        {view === 'add-postgres' && <PostgresForm onClose={() => setView('list')} />}

        {view === 'list' && (sources?.length ?? 0) === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>🔌</div>
            <h3>No data sources yet</h3>
            <p>Connect a PostgreSQL database or BigQuery project to pull live marketing data into your dashboard.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="ctrl" onClick={() => setView('add-postgres')}>+ PostgreSQL</button>
              <button className="ctrl-primary" onClick={startBigQuery}>+ BigQuery</button>
            </div>
          </div>
        )}

        {(sources?.length ?? 0) > 0 && view === 'list' && (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Last synced</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sources!.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td><span className="chip">{s.source_type.toUpperCase()}</span></td>
                    <td>
                      <span className={`status-dot ${s.status === 'active' ? 'active' : 'paused'}`} style={{ marginRight: 6 }} />
                      {s.status}
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: 12 }}>
                      {s.last_synced_at ? new Date(s.last_synced_at).toLocaleString() : 'Never'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="ctrl" style={{ fontSize: 12, padding: '5px 10px' }}
                          onClick={() => syncMut.mutate({ id: s.id, type: s.source_type })}
                          disabled={syncMut.isPending}>
                          Sync
                        </button>
                        <button className="ctrl" style={{ fontSize: 12, padding: '5px 10px', color: 'var(--neg)' }}
                          onClick={() => { if (confirm('Delete this data source?')) deleteMut.mutate(s.id) }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
