// Inline SVG icons. Stroke-based, 1.5px stroke, currentColor.
const Icon = ({ d, size = 16, fill, stroke = 'currentColor', strokeWidth = 1.5, children, viewBox = '0 0 24 24' }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill || 'none'} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const I = {
  grid:     (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></Icon>,
  target:   (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></Icon>,
  bars:     (p) => <Icon {...p}><path d="M4 20V10M10 20V4M16 20V14M22 20V8"/></Icon>,
  funnel:   (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></Icon>,
  users:    (p) => <Icon {...p}><circle cx="9" cy="9" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 9a3 3 0 0 0 0-6"/><path d="M21 20a5 5 0 0 0-5-5"/></Icon>,
  bell:     (p) => <Icon {...p}><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></Icon>,
  cog:      (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
  search:   (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>,
  cal:      (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Icon>,
  filter:   (p) => <Icon {...p}><path d="M3 5h18l-7 9v5l-4-2v-3z"/></Icon>,
  download: (p) => <Icon {...p}><path d="M12 4v12M6 12l6 6 6-6M4 20h16"/></Icon>,
  more:     (p) => <Icon {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></Icon>,
  caret:    (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  check:    (p) => <Icon {...p}><path d="M5 12l4 4 10-10"/></Icon>,
  up:       (p) => <Icon {...p}><path d="M6 14l6-6 6 6"/></Icon>,
  down:     (p) => <Icon {...p}><path d="M6 10l6 6 6-6"/></Icon>,
  arrowUp:  (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>,
  arrowDown:(p) => <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>,
  warn:     (p) => <Icon {...p}><path d="M10.3 3.7L2 19a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 19L13.7 3.7a2 2 0 0 0-3.4 0z"/><path d="M12 9v5M12 18h.01"/></Icon>,
  spark:    (p) => <Icon {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></Icon>,
  info:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></Icon>,
  external: (p) => <Icon {...p}><path d="M14 3h7v7M21 3l-9 9M19 14v6H4V5h6"/></Icon>,
  refresh:  (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></Icon>,
  share:    (p) => <Icon {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></Icon>,
};

window.I = I;
