// SVG-based chart primitives.
const { useState, useMemo, useEffect, useRef } = React;

// ---------- Sparkline ----------
function Sparkline({ data, color = '#0ea5e9', fill = true, width = 84, height = 28 }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, height - 4 - ((v - min) / range) * (height - 8)]);
  const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const area = path + ` L ${width} ${height} L 0 ${height} Z`;
  const id = `spark-${color.replace('#','')}-${data.length}`;
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${id})`}/>
        </>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ---------- Area / Line chart ----------
function AreaChart({ labels, cur, prev, format = (v) => v.toFixed(2), height = 260 }) {
  const [hover, setHover] = useState(null);
  const W = 800;
  const H = height;
  const padL = 44, padR = 12, padT = 14, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const all = [...cur, ...prev];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const buf = (max - min) * 0.15 || 1;
  const lo = Math.max(0, min - buf);
  const hi = max + buf;
  const range = hi - lo || 1;

  const xOf = (i) => padL + (i / Math.max(1, cur.length - 1)) * innerW;
  const yOf = (v) => padT + innerH - ((v - lo) / range) * innerH;

  const curPoints = cur.map((v, i) => [xOf(i), yOf(v)]);
  const prevPoints = prev.map((v, i) => [xOf(i), yOf(v)]);

  const smooth = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const cx = (p0[0] + p1[0]) / 2;
      d += ` C ${cx} ${p0[1]}, ${cx} ${p1[1]}, ${p1[0]} ${p1[1]}`;
    }
    return d;
  };

  const curPath = smooth(curPoints);
  const prevPath = smooth(prevPoints);
  const areaPath = curPath + ` L ${padL + innerW} ${padT + innerH} L ${padL} ${padT + innerH} Z`;

  // y ticks
  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => lo + (range / ticks) * i);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((x - padL) / innerW) * (cur.length - 1));
    if (idx >= 0 && idx < cur.length) setHover(idx);
    else setHover(null);
  };

  return (
    <div className="chart-wrap" style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none"
           onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.20"/>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0ea5e9"/>
            <stop offset="100%" stopColor="#06b6d4"/>
          </linearGradient>
        </defs>
        {/* gridlines */}
        {tickVals.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yOf(v)} y2={yOf(v)} stroke="#ececef" strokeDasharray={i === 0 ? '0' : '3 4'}/>
            <text x={padL - 8} y={yOf(v) + 4} fontSize="10.5" textAnchor="end" fill="#8a8a93" fontFamily="JetBrains Mono">
              {format(v)}
            </text>
          </g>
        ))}
        {/* prev period (dashed) */}
        <path d={prevPath} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4"/>
        {/* area */}
        <path d={areaPath} fill="url(#area-grad)"/>
        {/* current line */}
        <path d={curPath} fill="none" stroke="url(#line-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* x-axis */}
        {labels.map((l, i) => {
          // only show every Nth label if many
          const step = Math.ceil(labels.length / 12);
          if (i % step !== 0 && i !== labels.length - 1) return null;
          return (
            <text key={i} x={xOf(i)} y={H - 8} fontSize="10.5" textAnchor="middle" fill="#8a8a93" fontFamily="JetBrains Mono">
              {l}
            </text>
          );
        })}
        {/* hover */}
        {hover !== null && (
          <g>
            <line x1={xOf(hover)} x2={xOf(hover)} y1={padT} y2={padT + innerH} stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2 3" opacity="0.5"/>
            <circle cx={xOf(hover)} cy={yOf(cur[hover])} r="5" fill="#fff" stroke="#0ea5e9" strokeWidth="2"/>
          </g>
        )}
      </svg>
      {hover !== null && (
        <div style={{
          position: 'absolute',
          left: `${((xOf(hover) / W) * 100)}%`,
          top: '6px',
          transform: 'translateX(-50%)',
          background: '#0a0a0c',
          color: '#fff',
          padding: '8px 10px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 500,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          zIndex: 5,
        }}>
          <div style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'JetBrains Mono' }}>{labels[hover]}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 3 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#0ea5e9' }}></span>
            <span>Current</span>
            <span className="num" style={{ fontWeight: 700 }}>{format(cur[hover])}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2, color: '#a1a1aa' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#cbd5e1' }}></span>
            <span>Previous</span>
            <span className="num" style={{ fontWeight: 600 }}>{format(prev[hover])}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Donut ----------
function Donut({ data, size = 180, thickness = 22, total, totalLabel = 'Total' }) {
  const cx = size / 2, cy = size / 2;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const sum = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness}/>
        {data.map((d, i) => {
          const len = (d.value / sum) * C;
          const dasharray = `${len - 2} ${C - len + 2}`;
          const rot = -90 + (offset / C) * 360;
          offset += len;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                    stroke={d.color} strokeWidth={thickness}
                    strokeDasharray={dasharray}
                    strokeLinecap="butt"
                    transform={`rotate(${rot} ${cx} ${cy})`}
                    style={{ transition: 'stroke-dasharray 600ms ease' }}
            />
          );
        })}
      </svg>
      <div className="donut-center">
        <div className="donut-total">{total}</div>
        <div className="donut-label">{totalLabel}</div>
      </div>
    </div>
  );
}

// ---------- Stacked bar (channel × day) ----------
function StackedBars({ data, channels, height = 220 }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.map(d => d.values.reduce((s, v) => s + v, 0)));
  return (
    <div>
      <div className="stack-row" style={{ height }}>
        {data.map((d, i) => {
          const total = d.values.reduce((s, v) => s + v, 0);
          return (
            <div key={i} className="stack-col"
                 onMouseEnter={() => setHover(i)}
                 onMouseLeave={() => setHover(null)}
                 title={`${d.label}: $${total.toFixed(0)}`}>
              {d.values.map((v, j) => (
                <div key={j} className="stack-seg"
                     style={{
                       height: `${(v / max) * 100}%`,
                       background: channels[j].color,
                       opacity: hover !== null && hover !== i ? 0.4 : 1,
                     }}/>
              ))}
            </div>
          );
        })}
      </div>
      <div className="stack-x">
        {data.map((d, i) => <span key={i}>{i % 2 === 0 ? d.label : ''}</span>)}
      </div>
    </div>
  );
}

// ---------- Funnel ----------
function Funnel({ steps }) {
  const max = steps[0].value;
  return (
    <div>
      {steps.map((s, i) => {
        const pct = (s.value / max) * 100;
        const conv = i === 0 ? 100 : (s.value / steps[i - 1].value) * 100;
        return (
          <div key={i} className="funnel-row">
            <div className="funnel-label">{s.label}</div>
            <div className="funnel-bar">
              <div className="funnel-fill" style={{ width: `${pct}%`, background: s.color }}/>
            </div>
            <div className="funnel-val">{s.fmt}</div>
            <div className="funnel-pct">{conv.toFixed(1)}%</div>
          </div>
        );
      })}
    </div>
  );
}

window.Charts = { Sparkline, AreaChart, Donut, StackedBars, Funnel };
