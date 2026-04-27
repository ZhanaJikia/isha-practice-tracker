/**
 * Sacred 5 — logo mark
 * Used in the sidebar, landing page nav, and auth pages.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sacred 5 logo"
    >
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#0a3018" />
        </linearGradient>
        <linearGradient id="lm-num" x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#lm-bg)" />
      <circle cx="50" cy="14" r="7" fill="#16a34a" opacity="0.4" />
      <circle cx="56" cy="10" r="4" fill="#16a34a" opacity="0.2" />
      <text
        x="33"
        y="47"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
        fontWeight="900"
        fontSize="40"
        letterSpacing="-2"
        fill="url(#lm-num)"
      >
        5
      </text>
      <circle cx="48" cy="47" r="4" fill="#fde047" opacity="0.7" />
    </svg>
  );
}

/** Full wordmark — logo mark + "Sacred 5" text side by side */
export function LogoWordmark({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <div>
        <div className="text-sm font-bold leading-tight tracking-tight">Sacred 5</div>
        <div className="text-xs text-muted-foreground leading-tight">Daily practices</div>
      </div>
    </div>
  );
}
