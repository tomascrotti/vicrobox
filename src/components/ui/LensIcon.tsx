type LensIconProps = {
  variant?: 'mono' | 'tri'
  className?: string
}

export function LensIcon({ variant = 'mono', className }: LensIconProps) {
  return (
    <svg viewBox="0 0 90 90" className={className} aria-hidden="true">
      <circle cx="45" cy="45" r="44" fill="#111" />
      {variant === 'tri' ? (
        <>
          <circle cx="45" cy="45" r="43" fill="none" stroke="#F8BD19" strokeWidth="2" />
          <circle cx="45" cy="45" r="40" fill="none" stroke="#EA7C03" strokeWidth="5" />
          <circle cx="45" cy="45" r="36" fill="none" stroke="#079684" strokeWidth="2" />
        </>
      ) : (
        <circle cx="45" cy="45" r="36" fill="none" stroke="#EA7C03" strokeWidth="14" />
      )}
      <circle cx="45" cy="45" r="33" fill="#0A0A0A" />
      <circle cx="45" cy="45" r="29" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
      <circle cx="45" cy="45" r="23" fill="none" stroke="#161616" strokeWidth="1" />
      <circle cx="45" cy="45" r="18" fill="#060606" />
      <circle cx="45" cy="45" r="16" fill="none" stroke="#0F0F0F" strokeWidth="1" />
      <circle cx="45" cy="45" r="9" fill="#030303" />
      <ellipse cx="56" cy="29" rx="12" ry="10" fill="white" opacity="0.88" transform="rotate(-18 56 29)" />
      <ellipse cx="56" cy="29" rx="7" ry="5.5" fill="white" transform="rotate(-18 56 29)" />
      <circle cx="32" cy="56" r="2.5" fill="white" opacity="0.18" />
    </svg>
  )
}
