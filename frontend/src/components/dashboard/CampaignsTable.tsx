import { useState } from 'react'
import type { Campaign } from '../../types'

const CHANNEL_COLORS: Record<string, string> = {
  'Google Ads': '#0ea5e9', 'Meta Ads': '#06b6d4', 'LinkedIn': '#0891b2',
  'TikTok': '#67e8f9', 'Programmatic': '#a5f3fc',
}

interface Props { campaigns: Campaign[] }

type SortKey = 'spend' | 'roas' | 'cpa' | 'cvr'

export default function CampaignsTable({ campaigns }: Props) {
  const [sort, setSort] = useState<SortKey>('roas')

  const sorted = [...campaigns].sort((a, b) => {
    if (sort === 'cpa') return a.cpa - b.cpa
    return (b[sort] as number) - (a[sort] as number)
  })

  const hdrs: { key: SortKey; label: string }[] = [
    { key: 'spend', label: 'Spend' },
    { key: 'roas', label: 'ROAS' },
    { key: 'cpa', label: 'CPA' },
    { key: 'cvr', label: 'CVR' },
  ]

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-head" style={{ padding: '16px 18px 12px', marginBottom: 0 }}>
        <div>
          <div className="card-title">Top campaigns</div>
          <div className="card-sub">{campaigns.length} total · sorted by {sort.toUpperCase()}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Channel</th>
            {hdrs.map((h) => (
              <th key={h.key} className="r" onClick={() => setSort(h.key)} style={{ cursor: 'pointer', color: sort === h.key ? 'var(--text)' : undefined }}>
                {h.label} {sort === h.key ? '↓' : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => (
            <tr key={i}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="status-dot active" />
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                </div>
              </td>
              <td>
                <span className="chip">
                  <span className="chip-dot" style={{ background: CHANNEL_COLORS[c.channel] || '#94a3b8' }} />
                  {c.channel}
                </span>
              </td>
              <td className="r num">${c.spend.toLocaleString()}</td>
              <td className="r num" style={{ fontWeight: 600 }}>{c.roas.toFixed(2)}×</td>
              <td className="r num">${c.cpa.toFixed(2)}</td>
              <td className="r num">{c.cvr.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
