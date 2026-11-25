import type { Device } from '../device'
import './DeviceToggle.css'

/* Preview switch — styled like the Resume view toggle (secondary light track, secondary dark knob). */
export default function DeviceToggle({ value, onChange }: { value: Device; onChange: (d: Device) => void }) {
  return (
    <div className="device-toggle" role="group" aria-label="Preview device">
      <button className={value === 'phone' ? 'is-active' : ''} aria-pressed={value === 'phone'} onClick={() => onChange('phone')} title="Phone view">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Phone</span>
      </button>
      <button className={value === 'laptop' ? 'is-active' : ''} aria-pressed={value === 'laptop'} onClick={() => onChange('laptop')} title="Laptop view">
        <svg width="20" height="18" viewBox="0 0 26 24" fill="none" aria-hidden>
          <rect x="4.5" y="4" width="17" height="12" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M2 19.5h22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Laptop</span>
      </button>
    </div>
  )
}
