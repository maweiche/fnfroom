export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main moon circle */}
      <circle cx="50" cy="50" r="45" fill="currentColor" />

      {/* Crater dimples - black circles for darker spots */}
      <circle cx="32" cy="28" r="7" fill="#000000" opacity="0.2" />
      <circle cx="62" cy="23" r="5" fill="#000000" opacity="0.18" />
      <circle cx="28" cy="58" r="6" fill="#000000" opacity="0.19" />
      <circle cx="68" cy="48" r="8" fill="#000000" opacity="0.22" />
      <circle cx="43" cy="68" r="4.5" fill="#000000" opacity="0.16" />
      <circle cx="72" cy="72" r="5.5" fill="#000000" opacity="0.18" />

      {/* Smaller detail craters */}
      <circle cx="48" cy="35" r="3" fill="#000000" opacity="0.15" />
      <circle cx="55" cy="60" r="3.5" fill="#000000" opacity="0.17" />
    </svg>
  );
}
