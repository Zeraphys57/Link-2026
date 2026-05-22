// KSP lettermark — sumber yang sama dengan favicon (src/app/icon.svg).
export default function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="ksp-logo-amber" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.45" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
        <radialGradient id="ksp-logo-glow" cx="16" cy="16" r="15" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="#0c0a07" />
      <rect width="32" height="32" rx="7" fill="url(#ksp-logo-glow)" />
      <text
        x="16"
        y="22.2"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
        fontSize="14"
        fontWeight="800"
        letterSpacing="-0.5"
        fill="url(#ksp-logo-amber)"
      >
        KSP
      </text>
    </svg>
  )
}
