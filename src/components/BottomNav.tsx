import homeLight from '../assets/icons/home-light.svg'
import homeActive from '../assets/icons/home-active.svg'
import jobsLight from '../assets/icons/jobs-light.svg'
import jobsActive from '../assets/icons/jobs-active.svg'
import resumeLight from '../assets/icons/resume-light.svg'
import resumeActive from '../assets/icons/resume-active.svg'
import './BottomNav.css'

export type Tab = 'home' | 'jobs' | 'resume'

const items: { id: Tab; label: string; icon: string; activeIcon: string }[] = [
  { id: 'home', label: 'Home', icon: homeLight, activeIcon: homeActive },
  { id: 'jobs', label: 'Jobs', icon: jobsLight, activeIcon: jobsActive },
  { id: 'resume', label: 'Resume', icon: resumeLight, activeIcon: resumeActive },
]

/* Figma 319:16421 — floating pill nav, active item sits in a raised white circle. */
export default function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const index = items.findIndex((i) => i.id === active)
  return (
    <nav className="bnav" aria-label="Main">
      <span className="bnav__circle" data-pos={index} aria-hidden />
      {items.map((item, i) => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            className={`bnav__item${isActive ? ' is-active' : ''}`}
            data-pos={i}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(item.id)}
          >
            <img src={isActive ? item.activeIcon : item.icon} alt="" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
