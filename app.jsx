// Main app — Growmos paid media overview
const { useState, useMemo } = React;
const { KPICard, SecondaryKPI, Dropdown, Delta } = window.Widgets;
const { Sparkline, AreaChart, Donut, StackedBars, Funnel } = window.Charts;
const D = window.GROWMOS_DATA;
const I = window.I;

// ---------- Sidebar ----------
function Sidebar() {
  const items = [
    { id: 'overview', label: 'Overview', icon: 'grid', active: true },
    { id: 'campaigns', label: 'Campaigns', icon: 'target' },
    { id: 'channels', label: 'Channels', icon: 'bars' },
    { id: 'funnel', label: 'Funnel', icon: 'funnel' },
    { id: 'audience', label: 'Audience', icon: 'users' },
  ];
  const secondary = [
    { id: 'alerts', label: 'Alerts', icon: 'bell' },
    { id: 'reports', label: 'Reports', icon: 'download' },
    { id: 'settings', label: 'Settings', icon: 'cog' },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"></div>
        <div className="brand-name">Growmos</div>
      </div>

      <div className="nav-group-label">Analytics</div>
      {items.map(it => (
        <div key={it.id} className={`nav-item ${it.active ? 'active' : ''}`}>
          <span className="nav-icon">{I[it.icon]({ size: 16 })}</span>
          <span>{it.label}</span>
          <span className="nav-dot"></span>
        </div>
      ))}

      <div className="nav-group-label">Workspace</div>
      {secondary.map(it => (
        <div key={it.id} className="nav-item">
          <span className="nav-icon">{I[it.icon]({ size: 16 })}</span>
          <span>{it.label}</span>
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="avatar">MJ</div>
        <div className="avatar-info">
          <div className="name">Maya Jensen</div>
          <div className="role">Acme Inc · Marketing</div>
        </div>
      </div>
    </aside>
  );
}

// ---------- Topbar ----------
function Topbar() {
  return (
    <div className="topbar">
      <div className="breadcrumb">
        Analytics<span style={{opacity:0.5}}>/</span><b>Overview</b>
      </div>
      <div className="search">
        <span className="ico">{I.search({ size: 15 })}</span>
        <input placeholder="Search campaigns, keywords, segments…"/>
      </div>
      <button className="icon-btn" title="Notifications">
        {I.bell({ size: 16 })}
        <span className="badge"></span>
      </button>
      <button className="icon-btn" title="Share">{I.share({ size: 15 })}</button>
      <button className="icon-btn" title="Settings">{I.cog({ size: 16 })}</button>
    </div>
  );
}

// ---------- Main chart card with tab switcher ----------
function PerformanceCard({ range }) {
  const [metric, setMetric] = useState('roas');
  const [compareOn, setCompareOn] = useState(true);
  const tabs = [
    { id: 'roas',  label: 'ROAS' },
    { id: 'cpa',   label: 'CPA' },
    { id: 'conv',  label: 'Conversion' },
    { id: 'spend', label: 'Spend' },
  ];
  const data = useMemo(() => D.buildChartData(range, metric), [range, metric]);
  const fmt = {
    roas:  (v) => `${v.toFixed(2)}×`,
    cpa:   (v) => `$${v.toFixed(0)}`,
    conv:  (v) => `${v.toFixed(2)}%`,
    spend: (v) => `$${(v/1000).toFixed(1)}k`,
  }[metric];

  return (
    <div className="card" style={{ padding: '18px 18px 14px' }}>
      <div className="card-head" style={{ alignItems: 'center' }}>
        <div>
          <div className="card-title">Performance trend</div>
          <div className="card-sub">{D.RANGES[range].label} · compared to previous period</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="tabs">
            {tabs.map(t => (
              <button key={t.id} className={`tab ${metric === t.id ? 'active' : ''}`} onClick={() => setMetric(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={() => setCompareOn(!compareOn)} title="Toggle comparison">
            {I.refresh({ size: 15 })}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, alignItems: 'baseline' }}>
        <div>
          <div className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {metric === 'roas' && '4.21×'}
            {metric === 'cpa' && '$41.27'}
            {metric === 'conv' && '3.51%'}
            {metric === 'spend' && '$184.9K'}
          </div>
        </div>
        <Delta value={metric === 'cpa' ? -11.3 : metric === 'roas' ? 18.6 : metric === 'conv' ? 12.1 : 9.4} invert={metric === 'cpa'}/>
        <div style={{ marginLeft: 'auto' }} className="legend">
          <div className="legend-item">
            <span className="swatch" style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)' }}></span>
            <span>Current</span>
          </div>
          {compareOn && (
            <div className="legend-item">
              <span className="swatch" style={{ background: '#cbd5e1' }}></span>
              <span>Previous</span>
            </div>
          )}
        </div>
      </div>
      <AreaChart labels={data.labels} cur={data.cur} prev={compareOn ? data.prev : data.cur.map(() => null).map((_,i) => data.cur[i])} format={fmt}/>
    </div>
  );
}

// ---------- Channel mix card ----------
function ChannelMixCard() {
  const total = D.CHANNELS.reduce((s, c) => s + parseFloat(c.spend.replace(/[$,]/g, '')), 0);
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Spend by channel</div>
          <div className="card-sub">All paid channels · 30d</div>
        </div>
        <button className="icon-btn">{I.more({ size: 16 })}</button>
      </div>
      <Donut data={D.CHANNELS} total={`$${(total/1000).toFixed(1)}K`} totalLabel="Total spend"/>
      <div className="channel-legend">
        {D.CHANNELS.map((c, i) => (
          <div key={i} className="ch-leg-row">
            <span className="swatch" style={{ background: c.color, width: 10, height: 10, borderRadius: 3 }}></span>
            <span className="ch-name">{c.name}</span>
            <span className="ch-val">{c.spend}</span>
            <span className="ch-pct">{c.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Daily spend stacked card ----------
function DailySpendCard({ range }) {
  const data = useMemo(() => D.buildStackedDaily(range), [range]);
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Daily spend by channel</div>
          <div className="card-sub">Last 14 days</div>
        </div>
        <div className="legend">
          {D.CHANNELS.slice(0, 4).map((c, i) => (
            <div key={i} className="legend-item">
              <span className="swatch" style={{ background: c.color }}></span>
              <span style={{ fontSize: 11.5 }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
      <StackedBars data={data} channels={D.CHANNELS}/>
    </div>
  );
}

// ---------- Funnel card ----------
function FunnelCard() {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Conversion funnel</div>
          <div className="card-sub">Paid-attributed journey · 30d</div>
        </div>
        <button className="icon-btn">{I.external({ size: 14 })}</button>
      </div>
      <Funnel steps={D.FUNNEL}/>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: 'var(--text-3)' }}>Overall conversion rate</span>
        <span className="num" style={{ fontWeight: 700 }}>0.15%</span>
      </div>
    </div>
  );
}

// ---------- Top campaigns table ----------
function CampaignsTable() {
  const [sort, setSort] = useState('roas');
  const sortable = ['roas', 'spend', 'cpa', 'conv'];
  const rows = useMemo(() => {
    const arr = [...D.CAMPAIGNS];
    arr.sort((a, b) => {
      if (sort === 'roas') return b.roas - a.roas;
      if (sort === 'spend') return parseFloat(b.spend.replace(/[$,]/g,'')) - parseFloat(a.spend.replace(/[$,]/g,''));
      if (sort === 'cpa') return parseFloat(a.cpa.replace(/[$,]/g,'')) - parseFloat(b.cpa.replace(/[$,]/g,''));
      if (sort === 'conv') return parseFloat(b.conv) - parseFloat(a.conv);
      return 0;
    });
    return arr;
  }, [sort]);
  const channelColor = (name) => (D.CHANNELS.find(c => c.name === name) || {}).color || '#94a3b8';
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-head" style={{ padding: '16px 18px 12px', marginBottom: 0 }}>
        <div>
          <div className="card-title">Top campaigns</div>
          <div className="card-sub">7 active · sorted by {sort === 'roas' ? 'ROAS' : sort === 'spend' ? 'Spend' : sort === 'cpa' ? 'CPA' : 'CVR'}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="ctrl" style={{ padding: '6px 10px', fontSize: 12 }}>
            {I.filter({ size: 13 })} <span>All channels</span> {I.caret({ size: 12 })}
          </button>
          <button className="icon-btn">{I.download({ size: 15 })}</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Channel</th>
            <th className="r" onClick={() => setSort('spend')} style={{ cursor:'pointer' }}>Spend</th>
            <th className="r" onClick={() => setSort('roas')} style={{ cursor:'pointer' }}>ROAS</th>
            <th className="r" onClick={() => setSort('cpa')} style={{ cursor:'pointer' }}>CPA</th>
            <th className="r" onClick={() => setSort('conv')} style={{ cursor:'pointer' }}>CVR</th>
            <th style={{ width: 100 }}>Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c, i) => (
            <tr key={i}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`status-dot ${c.status}`}></span>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                </div>
              </td>
              <td>
                <span className="chip">
                  <span className="chip-dot" style={{ background: channelColor(c.channel) }}></span>
                  {c.channel}
                </span>
              </td>
              <td className="r num">{c.spend}</td>
              <td className="r num" style={{ fontWeight: 600 }}>{c.roas.toFixed(2)}×</td>
              <td className="r num">{c.cpa}</td>
              <td className="r num">{c.conv}</td>
              <td>
                <Sparkline data={c.trend} color={c.roas > 3.5 ? '#059669' : c.roas > 2.5 ? '#0ea5e9' : '#e11d48'} fill={false} width={80} height={22}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Keyword rankings card ----------
function KeywordsCard() {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Keyword rankings</div>
          <div className="card-sub">7 tracked · paid + organic</div>
        </div>
        <Dropdown
          icon={null}
          value="all"
          options={[
            { value: 'all', label: 'All keywords' },
            { value: 'up', label: 'Moving up' },
            { value: 'down', label: 'Moving down' },
          ]}
          onChange={() => {}}
        />
      </div>
      <div>
        <div className="kw-row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight: 600 }}>Keyword</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'center', fontWeight: 600 }}>Rank</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'right', fontWeight: 600 }}>Volume</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'right', fontWeight: 600 }}>Δ</span>
        </div>
        {D.KEYWORDS.map((k, i) => (
          <div key={i} className="kw-row">
            <div className="kw-term">
              <span className="kw-term-text">{k.term}</span>
            </div>
            <div className="kw-rank">#{k.rank}</div>
            <div className="kw-volume">{k.vol}</div>
            <div className="kw-delta" style={{ color: k.delta > 0 ? 'var(--pos)' : k.delta < 0 ? 'var(--neg)' : 'var(--text-3)' }}>
              {k.delta > 0 ? '▲' : k.delta < 0 ? '▼' : '–'}
              <span className="num">{Math.abs(k.delta)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Anomalies card ----------
function AnomaliesCard() {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-grad)', boxShadow: '0 0 0 3px rgba(14,165,233,0.18)' }}></span>
            Insights & alerts
          </div>
          <div className="card-sub">Auto-detected · last 24h</div>
        </div>
        <button className="icon-btn">{I.more({ size: 16 })}</button>
      </div>
      {D.ANOMALIES.map((a, i) => (
        <div key={i} className={`anomaly ${a.type}`}>
          <div className="anomaly-ico">
            {a.type === 'warn' && I.warn({ size: 14 })}
            {a.type === 'pos' && I.arrowUp({ size: 14 })}
            {a.type === 'info' && I.info({ size: 14 })}
          </div>
          <div className="anomaly-body">
            <div><b>{a.title}</b></div>
            <div style={{ color: 'var(--text-2)', marginTop: 2 }}>{a.body}</div>
            <div className="anomaly-time">{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- App root ----------
function App() {
  const [range, setRange] = useState('30d');
  const [channel, setChannel] = useState('all');

  const kpis = D.KPIS_BY_RANGE[range];
  const secondary = D.KPIS_SECONDARY_BY_RANGE[range];

  return (
    <>
      <Sidebar/>
      <main className="main">
        <Topbar/>
        <div className="content">
          <div className="page-head">
            <div>
              <h1>Paid media overview</h1>
              <div className="sub">Welcome back, Maya — here's how your campaigns are performing.</div>
            </div>
            <div className="controls">
              <Dropdown
                icon="filter"
                value={channel}
                onChange={setChannel}
                options={[
                  { value: 'all', label: 'All channels' },
                  { value: 'google', label: 'Google Ads' },
                  { value: 'meta', label: 'Meta Ads' },
                  { value: 'linkedin', label: 'LinkedIn' },
                  { value: 'tiktok', label: 'TikTok' },
                ]}
              />
              <Dropdown
                icon="cal"
                value={range}
                onChange={setRange}
                options={Object.entries(D.RANGES).map(([v, r]) => ({ value: v, label: r.label }))}
              />
              <button className="ctrl">{I.download({ size: 14 })}<span>Export</span></button>
              <button className="ctrl ctrl-primary">{I.spark({ size: 14 })}<span>Ask Growmos AI</span></button>
            </div>
          </div>

          <div className="grid kpi-row" style={{ marginBottom: 16 }}>
            {kpis.map(k => <KPICard key={k.id} kpi={k}/>)}
          </div>

          <div style={{ marginBottom: 16 }}>
            <SecondaryKPI items={secondary}/>
          </div>

          <div className="grid main-row" style={{ marginBottom: 16 }}>
            <PerformanceCard range={range}/>
            <ChannelMixCard/>
          </div>

          <div className="grid main-row" style={{ marginBottom: 16 }}>
            <DailySpendCard range={range}/>
            <FunnelCard/>
          </div>

          <div className="grid bottom-row">
            <CampaignsTable/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AnomaliesCard/>
              <KeywordsCard/>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
