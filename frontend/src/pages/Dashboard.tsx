import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts'
import { getKPIs, getTrend, getChannels, getCampaigns } from '../api/dashboard'
import KPICard from '../components/dashboard/KPICard'
import CampaignsTable from '../components/dashboard/CampaignsTable'
import Topbar from '../components/layout/Topbar'
import { useNavigate } from 'react-router-dom'

const RANGES = ['7d', '30d', '90d', 'ytd'] as const
type Range = typeof RANGES[number]
const RANGE_LABELS: Record<Range, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', ytd: 'Year to date' }
const METRICS = ['spend', 'clicks', 'impressions', 'conversions'] as const
type Metric = typeof METRICS[number]

export default function Dashboard() {
  const [range, setRange] = useState<Range>('30d')
  const [metric, setMetric] = useState<Metric>('spend')
  const nav = useNavigate()

  const kpis = useQuery({ queryKey: ['kpis', range], queryFn: () => getKPIs(range) })
  const trend = useQuery({ queryKey: ['trend', range, metric], queryFn: () => getTrend(range, metric) })
  const channels = useQuery({ queryKey: ['channels', range], queryFn: () => getChannels(range) })
  const campaigns = useQuery({ queryKey: ['campaigns', range], queryFn: () => getCampaigns(range) })

  const hasData = kpis.data?.has_data ?? false

  return (
    <>
      <Topbar title="Overview">
        <div className="controls">
          <div className="tabs">
            {RANGES.map((r) => (
              <button key={r} className={`tab${range === r ? ' active' : ''}`} onClick={() => setRange(r)}>
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
          <button className="ctrl-primary" onClick={() => nav('/uploads')}>↑ Upload data</button>
        </div>
      </Topbar>

      <div className="page-content">
        {!hasData && !kpis.isLoading && (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>📊</div>
            <h3>No data yet</h3>
            <p>Upload a CSV or Excel file, or connect a PostgreSQL/BigQuery data source to see your dashboard.</p>
            <button className="ctrl-primary" onClick={() => nav('/uploads')}>Upload data</button>
          </div>
        )}

        {/* KPI cards */}
        <div className="kpi-grid">
          {(kpis.data?.kpis || Array(4).fill(null)).map((kpi, i) =>
            kpi ? <KPICard key={kpi.id} kpi={kpi} /> : (
              <div key={i} className="card kpi-card" style={{ background: 'var(--surface-2)' }} />
            )
          )}
        </div>

        {/* Trend chart */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div>
              <div className="card-title">Performance trend</div>
              <div className="card-sub">{RANGE_LABELS[range]}</div>
            </div>
            <div className="tabs">
              {METRICS.map((m) => (
                <button key={m} className={`tab${metric === m ? ' active' : ''}`} onClick={() => setMetric(m)}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend.data || []}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ececef" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10.5, fontFamily: 'JetBrains Mono', fill: '#8a8a93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10.5, fontFamily: 'JetBrains Mono', fill: '#8a8a93' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: '#0a0a0c', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }}
                labelStyle={{ color: '#a1a1aa', fontFamily: 'JetBrains Mono' }}
              />
              <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.2} fill="url(#grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channels + Campaigns */}
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Spend by channel</div>
                <div className="card-sub">{RANGE_LABELS[range]}</div>
              </div>
            </div>
            {channels.data?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={channels.data} dataKey="value" nameKey="name" cx="40%" cy="50%" innerRadius={55} outerRadius={85}>
                    {channels.data.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{v}</span>} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Share']}
                    contentStyle={{ background: '#0a0a0c', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                No channel data
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Spend per channel</div>
                <div className="card-sub">Absolute spend</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={channels.data || []} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececef" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10.5, fontFamily: 'JetBrains Mono', fill: '#8a8a93' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11.5, fill: '#52525b' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Spend']}
                  contentStyle={{ background: '#0a0a0c', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                  {(channels.data || []).map((c, i) => <Cell key={i} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {campaigns.data?.length ? <CampaignsTable campaigns={campaigns.data} /> : null}
      </div>
    </>
  )
}
