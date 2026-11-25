import { useCallback, useEffect, useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import SideNav from './components/SideNav'
import DeviceToggle from './components/DeviceToggle'
import Splash from './components/Splash'
import { DeviceContext, readDevice, saveDevice, type Device } from './device'
import { defaultStyle, initialSections, seedSaved, type ResumeStyle, type SavedResume, type Section } from './data/resume'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import Resume from './pages/Resume'

const SAVED_KEY = 'pp-student-saved-resumes-v1'

function readSaved(): SavedResume[] | null {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (!raw) return null
    const list = JSON.parse(raw)
    // Basic shape check so a stale/corrupt entry can't break the page
    if (!Array.isArray(list) || !list.every((s) => s && typeof s.name === 'string' && s.style && Array.isArray(s.sections))) return null
    // Fill in style fields added after the save was made
    return list.map((s: SavedResume) => ({ ...s, style: { ...defaultStyle, ...s.style, text: { ...defaultStyle.text, ...s.style.text } } }))
  } catch {
    return null
  }
}

export interface ResumeDraft {
  sections: Section[]
  style: ResumeStyle
  /** The saved resume this draft was loaded from / last saved as */
  savedId: string | null
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [splash, setSplash] = useState(true)
  const hideSplash = useCallback(() => setSplash(false), [])
  // Narrow screens are always phone view (the switch is hidden there).
  const [device, setDevice] = useState<Device>(() => (window.innerWidth < 600 ? 'phone' : readDevice()))
  // Bumped when the Jobs tab is re-selected so it resets to its list.
  const [jobsKey, setJobsKey] = useState(0)

  // Resume editor + saved versions live here so they survive tab switches
  // and the Jobs "Select Resume" sheet can list the saved ones.
  const [draft, setDraft] = useState<ResumeDraft>({ sections: initialSections, style: defaultStyle, savedId: null })
  const [saved, setSaved] = useState<SavedResume[]>(() => readSaved() ?? seedSaved)

  // Keep saved resumes across reloads (this browser only — no backend yet).
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
    } catch {
      /* storage full or blocked — saves still work for this session */
    }
  }, [saved])

  const changeTab = (t: Tab) => {
    if (t === 'jobs' && tab === 'jobs') setJobsKey((k) => k + 1)
    setTab(t)
  }

  const changeDevice = (d: Device) => {
    setDevice(d)
    saveDevice(d)
  }

  /** Save the draft under a name. Same name → update that save. Newest saves go first. */
  const saveDraft = (name: string) => {
    const existing = saved.find((s) => s.name.toLowerCase() === name.toLowerCase())
    const entry: SavedResume = {
      id: existing?.id ?? `saved-${Date.now()}`,
      name,
      style: draft.style,
      sections: draft.sections,
      savedAt: Date.now(),
    }
    setSaved((list) => [entry, ...list.filter((s) => s.id !== entry.id)])
    setDraft((d) => ({ ...d, savedId: entry.id }))
    return Boolean(existing)
  }

  const loadSaved = (id: string) => {
    const s = saved.find((x) => x.id === id)
    if (s) setDraft({ sections: s.sections, style: s.style, savedId: s.id })
  }

  return (
    <DeviceContext.Provider value={device}>
      <div className={`shell shell--${device}`}>
        <div className={`app app--${device}`}>
          {tab === 'home' && <Home />}
          {tab === 'jobs' && (
            <Jobs key={jobsKey} resumes={saved.map((s) => s.name)} onBack={() => setTab('home')} onOpenResume={() => setTab('resume')} />
          )}
          {tab === 'resume' && <Resume draft={draft} setDraft={setDraft} saved={saved} onSave={saveDraft} onLoad={loadSaved} />}
          {device === 'phone' ? <BottomNav active={tab} onChange={changeTab} /> : <SideNav active={tab} onChange={changeTab} />}
          {splash && <Splash onDone={hideSplash} />}
        </div>
      </div>
      <DeviceToggle value={device} onChange={changeDevice} />
    </DeviceContext.Provider>
  )
}
