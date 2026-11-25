import homeLight from '../assets/icons/home-light.svg'
import homeActive from '../assets/icons/home-active.svg'
import jobsLight from '../assets/icons/jobs-light.svg'
import jobsActive from '../assets/icons/jobs-active.svg'
import resumeLight from '../assets/icons/resume-light.svg'
import resumeActive from '../assets/icons/resume-active.svg'
import type { Tab } from './BottomNav'
import './SideNav.css'

const items: { id: Tab; label: string; icon: string; activeIcon: string }[] = [
  { id: 'home', label: 'Home', icon: homeLight, activeIcon: homeActive },
  { id: 'jobs', label: 'Jobs', icon: jobsLight, activeIcon: jobsActive },
  { id: 'resume', label: 'Resume', icon: resumeLight, activeIcon: resumeActive },
]

/* Figma 188:1585 — 123px rail, items 110px tall from y=140 every 114px;
   active item sits in a 109px white circle with a 10px primary-dark ring that overhangs the rail. */
export default function SideNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const index = items.findIndex((i) => i.id === active)
  return (
    <nav className="snav" aria-label="Main">
      <span className="snav__circle" style={{ top: 140 + index * 114 }} aria-hidden />
      {items.map((item, i) => {
        const on = item.id === active
        return (
          <button
            key={item.id}
            className={`snav__item${on ? ' is-active' : ''}`}
            style={{ top: 140 + i * 114 }}
            aria-current={on ? 'page' : undefined}
            onClick={() => onChange(item.id)}
          >
            <img src={on ? item.activeIcon : item.icon} alt="" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
