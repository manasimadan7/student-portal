import { useEffect, useState } from 'react'
import SplashMark from './SplashMark'
import './Splash.css'

/* Launch screen built from Figma 474:4030.
   Timeline: mark zooms in → flower spins clockwise, star counter-clockwise →
   mark zooms through the screen and the app shows underneath. Tap anywhere to skip. */
const HOLD_MS = 2300 // when the exit zoom starts
const EXIT_MS = 700

export default function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => setLeaving(true), reduced ? 900 : HOLD_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(onDone, EXIT_MS)
    return () => clearTimeout(t)
  }, [leaving, onDone])

  return (
    <div
      className={`splash${leaving ? ' is-leaving' : ''}`}
      role="status"
      aria-label="Placement Portal is loading"
      onClick={() => setLeaving(true)}
    >
      <div className="splash__zoom">
        <SplashMark className="splash__mark" />
      </div>
      <p className="splash__name">Placement Portal</p>
    </div>
  )
}
