// Mock data for the Growmos paid media dashboard.
// Multiple ranges so date filter feels real.

const RANGES = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  'qtd': { label: 'Quarter to date', days: 58 },
  'ytd': { label: 'Year to date', days: 148 },
};

// Generates a deterministic-ish series of n points with trend + seasonality
function series(n, base, trend, season, noise, seed = 1) {
  let s = seed; const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const v = base * (1 + trend * t) + Math.sin(i * 0.7) * season + (rand() - 0.5) * noise;
    out.push(Math.max(0, v));
  }
  return out;
}

const KPIS_BY_RANGE = {
  '7d': [
    { id: 'roas', label: 'Return on Ad Spend', value: '4.82×', delta: +12.4, vs: 'vs prev. 7d', featured: true, spark: series(14, 4.2, 0.18, 0.3, 0.4, 7), color: '#0ea5e9' },
    { id: 'cpa', label: 'Cost per Acquisition', value: '$38.41', delta: -8.2, vs: 'vs prev. 7d', spark: series(14, 42, -0.12, 2, 3, 11), color: '#52525b', invertDelta: true },
    { id: 'conv', label: 'Conversion Rate', value: '3.74%', delta: +0.42, vs: 'pp vs prev.', spark: series(14, 3.4, 0.10, 0.2, 0.25, 13), color: '#52525b' },
    { id: 'spend', label: 'Ad Spend', value: '$48,210', delta: +6.1, vs: 'vs prev. 7d', spark: series(14, 6500, 0.05, 400, 600, 17), color: '#52525b' },
  ],
  '30d': [
    { id: 'roas', label: 'Return on Ad Spend', value: '4.21×', delta: +18.6, vs: 'vs prev. 30d', featured: true, spark: series(30, 3.6, 0.22, 0.3, 0.4, 7), color: '#0ea5e9' },
    { id: 'cpa', label: 'Cost per Acquisition', value: '$41.27', delta: -11.3, vs: 'vs prev. 30d', spark: series(30, 48, -0.18, 2, 3, 11), color: '#52525b', invertDelta: true },
    { id: 'conv', label: 'Conversion Rate', value: '3.51%', delta: +0.38, vs: 'pp vs prev.', spark: series(30, 3.2, 0.12, 0.2, 0.25, 13), color: '#52525b' },
    { id: 'spend', label: 'Ad Spend', value: '$184,920', delta: +9.4, vs: 'vs prev. 30d', spark: series(30, 5800, 0.08, 400, 600, 17), color: '#52525b' },
  ],
  '90d': [
    { id: 'roas', label: 'Return on Ad Spend', value: '3.94×', delta: +22.1, vs: 'vs prev. 90d', featured: true, spark: series(45, 3.2, 0.28, 0.3, 0.5, 7), color: '#0ea5e9' },
    { id: 'cpa', label: 'Cost per Acquisition', value: '$43.86', delta: -14.8, vs: 'vs prev. 90d', spark: series(45, 52, -0.22, 2, 3, 11), color: '#52525b', invertDelta: true },
    { id: 'conv', label: 'Conversion Rate', value: '3.31%', delta: +0.61, vs: 'pp vs prev.', spark: series(45, 2.9, 0.16, 0.2, 0.3, 13), color: '#52525b' },
    { id: 'spend', label: 'Ad Spend', value: '$524,180', delta: +14.2, vs: 'vs prev. 90d', spark: series(45, 5500, 0.12, 400, 700, 17), color: '#52525b' },
  ],
  'qtd': [
    { id: 'roas', label: 'Return on Ad Spend', value: '4.05×', delta: +15.8, vs: 'vs prev. quarter', featured: true, spark: series(40, 3.4, 0.25, 0.3, 0.4, 7), color: '#0ea5e9' },
    { id: 'cpa', label: 'Cost per Acquisition', value: '$42.10', delta: -12.6, vs: 'vs prev. quarter', spark: series(40, 50, -0.20, 2, 3, 11), color: '#52525b', invertDelta: true },
    { id: 'conv', label: 'Conversion Rate', value: '3.42%', delta: +0.48, vs: 'pp vs prev.', spark: series(40, 3.0, 0.14, 0.2, 0.25, 13), color: '#52525b' },
    { id: 'spend', label: 'Ad Spend', value: '$348,650', delta: +11.8, vs: 'vs prev. quarter', spark: series(40, 5600, 0.10, 400, 600, 17), color: '#52525b' },
  ],
  'ytd': [
    { id: 'roas', label: 'Return on Ad Spend', value: '3.72×', delta: +28.4, vs: 'vs prev. year', featured: true, spark: series(60, 2.9, 0.32, 0.3, 0.5, 7), color: '#0ea5e9' },
    { id: 'cpa', label: 'Cost per Acquisition', value: '$45.92', delta: -18.2, vs: 'vs prev. year', spark: series(60, 56, -0.26, 2, 3, 11), color: '#52525b', invertDelta: true },
    { id: 'conv', label: 'Conversion Rate', value: '3.18%', delta: +0.84, vs: 'pp vs prev.', spark: series(60, 2.6, 0.20, 0.2, 0.3, 13), color: '#52525b' },
    { id: 'spend', label: 'Ad Spend', value: '$892,400', delta: +21.6, vs: 'vs prev. year', spark: series(60, 5200, 0.16, 400, 700, 17), color: '#52525b' },
  ],
};

// Secondary KPIs strip
const KPIS_SECONDARY_BY_RANGE = {
  '7d':  [{label:'Organic Traffic', value:'128.4K', delta:+4.2}, {label:'Bounce Rate', value:'42.1%', delta:-2.1, invert:true}, {label:'Campaign ROI', value:'+286%', delta:+9.8}, {label:'Customer LTV', value:'$842', delta:+3.4}],
  '30d': [{label:'Organic Traffic', value:'512.8K', delta:+8.6}, {label:'Bounce Rate', value:'43.6%', delta:-3.4, invert:true}, {label:'Campaign ROI', value:'+241%', delta:+14.2}, {label:'Customer LTV', value:'$818', delta:+5.1}],
  '90d': [{label:'Organic Traffic', value:'1.41M', delta:+12.4}, {label:'Bounce Rate', value:'44.8%', delta:-4.8, invert:true}, {label:'Campaign ROI', value:'+218%', delta:+18.6}, {label:'Customer LTV', value:'$794', delta:+7.2}],
  'qtd': [{label:'Organic Traffic', value:'948K',  delta:+10.6}, {label:'Bounce Rate', value:'44.2%', delta:-4.1, invert:true}, {label:'Campaign ROI', value:'+228%', delta:+16.8}, {label:'Customer LTV', value:'$806', delta:+6.4}],
  'ytd': [{label:'Organic Traffic', value:'2.18M', delta:+24.8}, {label:'Bounce Rate', value:'46.4%', delta:-6.2, invert:true}, {label:'Campaign ROI', value:'+194%', delta:+27.4}, {label:'Customer LTV', value:'$762', delta:+11.8}],
};

// Main chart data per range. Each point has date label, primary metric, comparison.
function buildChartData(range, primary) {
  const n = { '7d': 7, '30d': 30, '90d': 12, 'qtd': 13, 'ytd': 12 }[range];
  const labels = {
    '7d':  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    '30d': Array.from({length:30}, (_,i) => (i+1).toString().padStart(2,'0')),
    '90d': ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'],
    'qtd': ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12','W13'],
    'ytd': ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  }[range];

  const cfg = {
    roas: { base: 3.8, trend: 0.25, season: 0.4, noise: 0.25, prevBase: 3.1 },
    cpa: { base: 44, trend: -0.20, season: 3, noise: 2, prevBase: 52 },
    conv: { base: 3.2, trend: 0.18, season: 0.3, noise: 0.2, prevBase: 2.7 },
    spend: { base: 6200, trend: 0.12, season: 500, noise: 400, prevBase: 5400 },
  }[primary];

  const cur = series(n, cfg.base, cfg.trend, cfg.season, cfg.noise, 31);
  const prev = series(n, cfg.prevBase, cfg.trend * 0.6, cfg.season * 0.8, cfg.noise, 41);
  return { labels, cur, prev };
}

// Channel mix data
const CHANNELS = [
  { name: 'Google Ads',     value: 38, spend: '$70,270', color: '#0ea5e9' },
  { name: 'Meta Ads',       value: 24, spend: '$44,381', color: '#06b6d4' },
  { name: 'LinkedIn',       value: 14, spend: '$25,889', color: '#0891b2' },
  { name: 'TikTok',         value: 11, spend: '$20,341', color: '#67e8f9' },
  { name: 'Programmatic',   value: 8,  spend: '$14,793', color: '#a5f3fc' },
  { name: 'Other',          value: 5,  spend: '$9,246',  color: '#cffafe' },
];

// Daily stacked spend by channel
function buildStackedDaily(range) {
  const days = { '7d': 7, '30d': 14, '90d': 14, 'qtd': 14, 'ytd': 14 }[range];
  const labels = range === '7d'
    ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    : Array.from({length: days}, (_, i) => 'May ' + (14 + i));
  const arr = [];
  let s = 5;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < days; i++) {
    const t = i / Math.max(1, days - 1);
    arr.push({
      label: labels[i] || '',
      values: [
        4200 + Math.sin(i*0.6) * 600 + rand() * 800,  // Google
        2400 + Math.sin(i*0.4) * 400 + rand() * 600,  // Meta
        1200 + Math.cos(i*0.5) * 200 + rand() * 300,  // LinkedIn
        900  + Math.sin(i*0.8) * 200 + rand() * 250,  // TikTok
        600  + rand() * 200,                          // Programmatic
        300  + rand() * 100,                          // Other
      ].map((v, j) => v * (1 + t * 0.2 * (j === 0 ? 1 : 0.5))),
    });
  }
  return arr;
}

// Funnel
const FUNNEL = [
  { label: 'Impressions', value: 4_280_000, fmt: '4.28M', color: '#cffafe' },
  { label: 'Clicks',      value:   192_840, fmt: '192.8K', color: '#a5f3fc' },
  { label: 'Sessions',    value:   168_420, fmt: '168.4K', color: '#67e8f9' },
  { label: 'Add to cart', value:    24_180, fmt: '24.2K',  color: '#22d3ee' },
  { label: 'Checkout',    value:    11_240, fmt: '11.2K',  color: '#06b6d4' },
  { label: 'Purchase',    value:     6_312, fmt: '6,312',  color: '#0ea5e9' },
];

// Top campaigns table
const CAMPAIGNS = [
  { name: 'Q2 Lead Gen — Enterprise NA',   channel: 'Google Ads', status: 'active',  spend: '$24,180', roas: 5.84, cpa: '$31.20', conv: '4.82%', trend: series(12, 4.2, 0.3, 0.4, 0.3, 21) },
  { name: 'Spring Promo — Retail',         channel: 'Meta Ads',   status: 'active',  spend: '$18,420', roas: 4.41, cpa: '$36.80', conv: '4.10%', trend: series(12, 3.6, 0.25, 0.4, 0.3, 22) },
  { name: 'Brand Awareness — TikTok Q2',   channel: 'TikTok',     status: 'active',  spend: '$12,840', roas: 3.92, cpa: '$42.50', conv: '3.41%', trend: series(12, 3.0, 0.30, 0.3, 0.3, 23) },
  { name: 'Decision Maker — LinkedIn ABM', channel: 'LinkedIn',   status: 'active',  spend: '$15,280', roas: 3.48, cpa: '$48.60', conv: '3.02%', trend: series(12, 2.8, 0.20, 0.3, 0.3, 24) },
  { name: 'Retargeting — Cart Abandon',    channel: 'Meta Ads',   status: 'active',  spend: '$8,940',  roas: 6.18, cpa: '$22.40', conv: '5.84%', trend: series(12, 4.8, 0.20, 0.4, 0.3, 25) },
  { name: 'Mobile App Install — Q2',       channel: 'Google Ads', status: 'review',  spend: '$11,260', roas: 2.41, cpa: '$58.20', conv: '2.18%', trend: series(12, 2.2, 0.10, 0.3, 0.3, 26) },
  { name: 'Holiday Teaser — Display',      channel: 'Programmatic',status:'paused',  spend: '$6,420',  roas: 1.84, cpa: '$72.40', conv: '1.62%', trend: series(12, 2.0, -0.10, 0.3, 0.3, 27) },
];

// Keyword rankings
const KEYWORDS = [
  { term: 'marketing analytics platform', rank: 3,  prev: 5,  vol: '12.4K', delta: +2 },
  { term: 'paid media dashboard',         rank: 1,  prev: 2,  vol: '8.2K',  delta: +1 },
  { term: 'roas calculator',              rank: 4,  prev: 4,  vol: '6.8K',  delta: 0 },
  { term: 'campaign performance tracker', rank: 2,  prev: 6,  vol: '5.4K',  delta: +4 },
  { term: 'attribution software',         rank: 8,  prev: 7,  vol: '14.2K', delta: -1 },
  { term: 'b2b ad reporting',             rank: 5,  prev: 9,  vol: '3.8K',  delta: +4 },
  { term: 'conversion rate benchmarks',   rank: 12, prev: 18, vol: '9.6K',  delta: +6 },
];

// Anomalies
const ANOMALIES = [
  { type: 'warn', title: 'CPA spike on Mobile App Install — Q2', body: 'CPA up 38% to $58.20 over the last 48h. Bid strategy review recommended.', time: '2h ago' },
  { type: 'pos',  title: 'Retargeting beating ROAS target', body: 'Cart Abandon campaign hit 6.18× ROAS — 24% above goal. Consider budget shift.', time: '5h ago' },
  { type: 'info', title: 'Audience saturation detected', body: 'LinkedIn ABM frequency averaging 6.2 — refresh creative for next flight.', time: '1d ago' },
];

window.GROWMOS_DATA = {
  RANGES, KPIS_BY_RANGE, KPIS_SECONDARY_BY_RANGE, buildChartData,
  CHANNELS, buildStackedDaily, FUNNEL, CAMPAIGNS, KEYWORDS, ANOMALIES,
};
