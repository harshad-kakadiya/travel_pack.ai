export function svgPlaceholder(label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop stop-color='#eef2ff' offset='0'/>
        <stop stop-color='#e0e7ff' offset='1'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <text x='50%' y='50%' font-family='Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
          font-size='44' fill='#374151' text-anchor='middle' dominant-baseline='central'>
      ${label}
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}