/* ── Vienna Cuts logo mark + wordmark ─────────────────────────────────── */
export default function Logo({ size = 40, inverted = false }: { size?: number; inverted?: boolean }) {
  const stroke = inverted ? '#171310' : '#F6F1E9';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Vienna Cuts logo" className="shrink-0">
      <rect width="64" height="64" rx="15" fill={inverted ? '#F6F1E9' : '#171310'} stroke="#C77D2C" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="19.5" fill="none" stroke="#C77D2C" strokeWidth="2.6" />
      <g stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none">
        <circle cx="24.5" cy="40" r="4.4" />
        <circle cx="39.5" cy="40" r="4.4" />
        <path d="M27.5 36.3 40.8 21.2" />
        <path d="M36.5 36.3 23.2 21.2" />
      </g>
      <circle cx="32" cy="32" r="1.8" fill="#C77D2C" />
    </svg>
  );
}
