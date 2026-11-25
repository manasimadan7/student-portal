/* Simple Design System icons that Figma maps via Code Connect (no SVG export available). */
type P = { size?: number; color?: string }

export const ArrowUpRight = ({ size = 24, color = 'currentColor' }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M7 17 17 7M7 7h10v10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Download = ({ size = 20, color = 'currentColor' }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Search = ({ size = 20, color = 'currentColor' }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <path d="m20 20-3.5-3.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const Close = ({ size = 18, color = 'currentColor' }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)
