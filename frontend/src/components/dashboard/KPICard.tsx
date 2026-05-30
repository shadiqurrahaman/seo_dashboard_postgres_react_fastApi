import type { KPI } from '../../types'
import { SparklineChart } from '../charts/Sparkline'

interface Props { kpi: KPI; spark?: number[] }

export default function KPICard({ kpi, spark }: Props) {
  const positive = kpi.invert_delta ? kpi.delta < 0 : kpi.delta > 0
  const deltaClass = positive ? 'delta-pos' : 'delta-neg'
  const arrow = kpi.delta >= 0 ? '▲' : '▼'

  return (
    <div className={`card kpi-card${kpi.featured ? ' kpi-featured' : ''}`}>
      <div className="kpi-label">{kpi.label}</div>
      <div className="kpi-value">{kpi.value}</div>
      <div className="kpi-meta">
        <div>
          <span className={`delta ${deltaClass}`}>
            <span style={{ fontSize: 9 }}>{arrow}</span>
            <span className="num">{Math.abs(kpi.delta).toFixed(1)}%</span>
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>{kpi.vs}</span>
        </div>
        {spark && <SparklineChart data={spark} color={kpi.featured ? '#0ea5e9' : '#94a3b8'} />}
      </div>
    </div>
  )
}
