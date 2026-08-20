type Props = {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'hero'
}

const sizeMap = {
  sm: { word: 'text-2xl', tracking: 'tracking-[0.05em]', mark: 'h-[0.24em] w-[0.24em] translate-y-[0.06em]', gap: '-ml-[0.02em]' },
  md: { word: 'text-4xl', tracking: 'tracking-[0.06em]', mark: 'h-[0.23em] w-[0.23em] translate-y-[0.07em]', gap: '-ml-[0.02em]' },
  lg: { word: 'text-5xl', tracking: 'tracking-[0.07em]', mark: 'h-[0.22em] w-[0.22em] translate-y-[0.08em]', gap: '-ml-[0.02em]' },
  hero: {
    word: 'text-[2.55rem] leading-none sm:text-[3.4rem] md:text-[4.25rem] lg:text-[4.75rem]',
    tracking: 'tracking-[0.07em] sm:tracking-[0.08em]',
    mark: 'h-[0.24em] w-[0.24em] translate-y-[0.1em] sm:translate-y-[0.11em]',
    gap: '-ml-[0.03em]',
  },
}

/** R en círculo nítida (SVG), al estilo de la marca registrada de Casio. */
function CircledR({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10.2" stroke="currentColor" strokeWidth="1.85" />
      <path
        fill="currentColor"
        d="M8.1 17.1V6.9h3.35c2.05 0 3.45 1.05 3.45 2.85 0 1.35-.75 2.25-1.95 2.65l2.75 4.7h-2.55l-2.45-4.25h-.6v4.25H8.1zm2.05-6.05h1.25c.95 0 1.45-.55 1.45-1.35 0-.8-.5-1.35-1.45-1.35H10.15v2.7z"
      />
    </svg>
  )
}

export function CasioMark({ className = '', size = 'lg' }: Props) {
  const s = sizeMap[size]
  return (
    <span
      className={`inline-flex items-baseline font-casio-logo text-white ${s.word} ${s.tracking} ${className}`}
    >
      <span className="casio-logo-word">CASIO</span>
      <CircledR className={`shrink-0 ${s.gap} ${s.mark}`} />
      <span className="sr-only"> marca registrada</span>
    </span>
  )
}
