// Smaller composable widgets: KPI card, secondary strip, dropdown.
const { Sparkline } = window.Charts || {};

function fmtDelta(n, opts = {}) {
  const sign = n >= 0 ? '+' : '';
  const unit = opts.pp ? 'pp' : '%';
  return `${sign}${n.toFixed(1)}${unit}`;
}

function Delta({ value, invert = false, suffix = '%' }) {
  const positive = invert ? value < 0 : value > 0;
  const cls = positive ? 'pos' : 'neg';
  const arrow = value >= 0 ? '▲' : '▼';
  return (
    <span className={`delta ${cls}`}>
      <span style={{ fontSize: 9 }}>{arrow}</span>
      <span className="num">{Math.abs(value).toFixed(1)}{suffix}</span>
    </span>
  );
}

function KPICard({ kpi }) {
  const { I } = window;
  return (
    <div className={`card kpi ${kpi.featured ? 'featured' : ''}`}>
      <div className="kpi-label">
        {kpi.featured && <span className="dot-grad"></span>}
        <span>{kpi.label}</span>
      </div>
      <div className="kpi-value">{kpi.value}</div>
      <div className="kpi-meta">
        <div>
          <Delta value={kpi.delta} invert={kpi.invertDelta} suffix={kpi.vs && kpi.vs.includes('pp') ? 'pp' : '%'}/>
          <span className="vs">{kpi.vs.replace(/^pp /,'')}</span>
        </div>
        <Sparkline data={kpi.spark} color={kpi.featured ? '#0ea5e9' : '#94a3b8'} fill={kpi.featured}/>
      </div>
    </div>
  );
}

function SecondaryKPI({ items }) {
  return (
    <div className="card" style={{ padding: '14px 18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 24 }}>
        {items.map((k, i) => (
          <div key={i} style={{ borderRight: i < items.length - 1 ? '1px solid var(--border)' : 'none', paddingRight: i < items.length - 1 ? 24 : 0 }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
              <span className="num" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{k.value}</span>
              <Delta value={k.delta} invert={k.invert}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dropdown (controlled)
function Dropdown({ label, value, options, onChange, align = 'left', icon = 'cal' }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const { I } = window;
  const current = options.find(o => o.value === value);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className={`ctrl ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        {icon && I[icon] && I[icon]({ size: 14 })}
        <span>{current ? current.label : label}</span>
        <span className="caret">{I.caret({ size: 14 })}</span>
      </button>
      {open && (
        <div className="popover" style={{ [align]: 0 }}>
          {options.map(o => (
            <div key={o.value} className={`pop-item ${o.value === value ? 'selected' : ''}`}
                 onClick={() => { onChange(o.value); setOpen(false); }}>
              <span>{o.label}</span>
              <span className="check">{I.check({ size: 14 })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

window.Widgets = { KPICard, SecondaryKPI, Dropdown, Delta };
