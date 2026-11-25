import { useEffect, useMemo, useRef, useState } from 'react'
import { categories, companyById, jobById, jobs, type Category, type Company, type Job } from '../data/data'
import { ArrowUpRight, Close, Download, Search } from '../components/Icons'
import chevronDark from '../assets/icons/chevron-back-dark.svg'
import chevronLg from '../assets/icons/chevron-back-lg.svg'
import chevronSm from '../assets/icons/chevron-back-sm.svg'
import './Jobs.css'

type CompanyTab = 'jobs' | 'about' | 'stats'
type View =
  | { name: 'list' }
  | { name: 'company'; companyId: string; tab: CompanyTab; jobId?: string }

interface Props {
  /** Saved resume names (Resume page), newest first */
  resumes: string[]
  onBack: () => void
  onOpenResume: () => void
}

export default function Jobs({ resumes, onBack, onOpenResume }: Props) {
  const [view, setView] = useState<View>({ name: 'list' })
  const [applied, setApplied] = useState<Record<string, string>>({}) // jobId → resume
  const [sheetFor, setSheetFor] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const pageRef = useRef<HTMLElement>(null)

  // Each new screen starts at the top.
  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0 })
  }, [view])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const openJob = (job: Job) => setView({ name: 'company', companyId: job.companyId, tab: 'jobs', jobId: job.id })

  const apply = (jobId: string, resume: string) => {
    setApplied((a) => ({ ...a, [jobId]: resume }))
    setSheetFor(null)
    const job = jobById(jobId)
    setToast(`Applied to ${companyById(job.companyId).name.trim()} with ${resume}`)
  }

  return (
    <>
      <main className="page jobs" ref={pageRef}>
        {view.name === 'list' ? (
          <JobList applied={applied} onBack={onBack} onOpenCompany={(id) => setView({ name: 'company', companyId: id, tab: 'jobs' })} onOpenJob={openJob} />
        ) : (
          <CompanyView
            company={companyById(view.companyId)}
            tab={view.tab}
            jobId={view.jobId}
            applied={applied}
            onBack={() => (view.jobId ? setView({ ...view, jobId: undefined }) : setView({ name: 'list' }))}
            onTab={(tab) => setView({ ...view, tab, jobId: undefined })}
            onOpenJob={openJob}
            onSign={(id) => setSheetFor(id)}
            onToast={setToast}
          />
        )}
      </main>
      <div className="bottom-fade" aria-hidden />

      {sheetFor && <ResumeSheet resumes={resumes} onClose={() => setSheetFor(null)} onApply={(r) => apply(sheetFor, r)} onOpenResume={onOpenResume} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  )
}

/* ---------------------------------------------------------------- */
/* Jobs list — Figma 319:16582, plus a search bar (not in Figma)    */
/* ---------------------------------------------------------------- */

function JobList({
  applied,
  onBack,
  onOpenCompany,
  onOpenJob,
}: {
  applied: Record<string, string>
  onBack: () => void
  onOpenCompany: (id: string) => void
  onOpenJob: (job: Job) => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | null>('Consulting')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter((j) => {
      if (category && j.category !== category) return false
      if (!q) return true
      const c = companyById(j.companyId)
      return [c.name, j.role, j.summary, j.category].some((s) => s.toLowerCase().includes(q))
    })
  }, [query, category])

  return (
    <div className="jlist">
      <header className="jlist__head">
        <button className="jlist__back" onClick={onBack} aria-label="Back to home">
          <img src={chevronDark} alt="" />
        </button>
        <h1 className="jlist__title">Jobs</h1>
      </header>

      <label className="search">
        <Search color="var(--tertiary-dark)" />
        <span className="sr-only">Search jobs</span>
        <input
          type="search"
          placeholder="Search companies or roles"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          enterKeyHint="search"
        />
        {query && (
          <button className="search__clear" onClick={() => setQuery('')} aria-label="Clear search">
            <Close size={16} />
          </button>
        )}
      </label>

      <div className="cat-chips-wrap">
        <div className="cat-chips" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              className={`cat-chip${category === c ? ' is-active' : ''}`}
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="jcards">
        {results.map((j) => {
          const c = companyById(j.companyId)
          return (
            <li key={j.id}>
              <JobCard
                title={c.name}
                job={j}
                tag={category ? undefined : j.category}
                applied={!!applied[j.id]}
                onOpen={() => onOpenCompany(c.id)}
                onSign={() => onOpenJob(j)}
              />
            </li>
          )
        })}
      </ul>
      {results.length === 0 && (
        <p className="jlist__empty">
          No jobs match{query ? ` “${query.trim()}”` : ''}
          {category ? ` in ${category}` : ''}.
          {category && (
            <button className="jlist__clear" onClick={() => setCategory(null)}>
              Search all categories
            </button>
          )}
        </p>
      )}
    </div>
  )
}

function JobCard({
  title,
  job,
  tag,
  applied,
  onOpen,
  onSign,
}: {
  title: string
  job: Job
  tag?: string
  applied: boolean
  onOpen: () => void
  onSign: () => void
}) {
  return (
    <article className="jcard" onClick={onOpen}>
      <h3 className="jcard__title">{title}</h3>
      {tag && <span className="jcard__tag">{tag}</span>}
      <p className="jcard__date">{job.dates}</p>
      <p className="jcard__desc">{job.summary}</p>
      <p className="jcard__stipend">Stipend: {job.stipend}</p>
      <button
        className={`sign-sm${applied ? ' is-applied' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onSign()
        }}
      >
        {applied ? 'APPLIED' : 'SIGN'}
      </button>
    </article>
  )
}

/* ---------------------------------------------------------------- */
/* Company page — header + Jobs / About / Stats                     */
/* Figma 319:16787 (jobs), 319:16696 (job detail), 319:16841 (stats) */
/* ---------------------------------------------------------------- */

function CompanyView({
  company,
  tab,
  jobId,
  applied,
  onBack,
  onTab,
  onOpenJob,
  onSign,
  onToast,
}: {
  company: Company
  tab: CompanyTab
  jobId?: string
  applied: Record<string, string>
  onBack: () => void
  onTab: (t: CompanyTab) => void
  onOpenJob: (j: Job) => void
  onSign: (jobId: string) => void
  onToast: (msg: string) => void
}) {
  const companyJobs = jobs.filter((j) => j.companyId === company.id && j.id !== `${company.id}-c`)
  // Firms from the main list only have their consulting role — fall back to it.
  const list = companyJobs.length ? companyJobs : jobs.filter((j) => j.companyId === company.id)

  return (
    <div className="company">
      <header className="company__head">
        <button className="company__back" onClick={onBack} aria-label="Back">
          <img src={chevronLg} alt="" />
        </button>
        <CompanyLogo company={company} />
        <h1 className="company__name">{company.name}</h1>
        <div className="company__tabs" role="tablist">
          {(['jobs', 'about', 'stats'] as CompanyTab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={`company__tab${tab === t ? ' is-active' : ''}`} onClick={() => onTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {tab === 'jobs' && !jobId && (
        <ul className="jcards jcards--company">
          {list.map((j) => (
            <li key={j.id}>
              <JobCard title={company.name} job={j} tag={j.category} applied={!!applied[j.id]} onOpen={() => onOpenJob(j)} onSign={() => onOpenJob(j)} />
              {!j.eligible && <p className="jcard__note">*Not eligible</p>}
            </li>
          ))}
        </ul>
      )}

      {tab === 'jobs' && jobId && (
        <JobDetail job={jobById(jobId)} appliedWith={applied[jobId]} onBack={onBack} onSign={() => onSign(jobId)} onToast={onToast} />
      )}

      {tab === 'about' && <About company={company} />}
      {tab === 'stats' && <Stats company={company} />}
    </div>
  )
}

function CompanyLogo({ company }: { company: Company }) {
  if (company.logo) return <img className="company__logo" src={company.logo} alt={`${company.name} logo`} />
  const initials = company.name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <span className="company__logo company__logo--initials" aria-hidden>
      {initials}
    </span>
  )
}

function JobDetail({
  job,
  appliedWith,
  onBack,
  onSign,
  onToast,
}: {
  job: Job
  appliedWith?: string
  onBack: () => void
  onSign: () => void
  onToast: (m: string) => void
}) {
  const [more, setMore] = useState(false)
  const para = 'We invest in your growth, wellbeing, and future—empowering you to thrive as your whole self and define success on your own terms.'
  return (
    <section className="jdetail">
      <div className="jdetail__title-row">
        <button className="jdetail__back" onClick={onBack} aria-label="Back to jobs">
          <img src={chevronSm} alt="" />
        </button>
        <h2 className="jdetail__role">{job.role}</h2>
      </div>
      <p className="jdetail__dates">{job.dates}</p>
      <p className="jdetail__stipend">Stipend: {job.stipend}</p>
      <p className="jdetail__body">{para}</p>
      <p className="jdetail__body">{para}</p>
      {more && (
        <p className="jdetail__body">
          You'll work in small teams alongside senior colleagues, own problems end to end, and get structured feedback every cycle.
        </p>
      )}
      <button className="jdetail__more" onClick={() => setMore(!more)}>
        {more ? 'Show less' : '.....Read more'}
      </button>

      <button className="pdf-field" onClick={() => onToast('The job description PDF isn’t connected yet')}>
        <span>PDF | {job.role.toUpperCase()}</span>
        <span className="pdf-field__btn">
          <Download color="var(--neutral-700)" />
        </span>
      </button>

      {!job.eligible && <p className="jdetail__note">You’re not eligible for this role.</p>}
      <button className={`btn-lg${appliedWith ? ' is-applied' : ''}`} onClick={onSign} disabled={!job.eligible || !!appliedWith}>
        {appliedWith ? 'APPLIED' : 'SIGN'}
      </button>
      {appliedWith && <p className="jdetail__applied">Applied with {appliedWith}</p>}
    </section>
  )
}

function About({ company }: { company: Company }) {
  return (
    <section className="about">
      <h2 className="stat__h">About</h2>
      {company.about.map((p, i) => (
        <p key={i} className="jdetail__body">
          {p}
        </p>
      ))}
    </section>
  )
}

function Stats({ company }: { company: Company }) {
  const max = Math.max(...company.hires.map((h) => h.count))
  return (
    <div className="stats">
      <section className="stat">
        <h2 className="stat__h">
          Annual Hires ({company.hires[0].year}–{company.hires[company.hires.length - 1].year})
        </h2>
        <p className="stat__sub">Estimated new employee additions per Placement cycle</p>
        <div className="bars">
          {company.hires.map((h) => (
            <div key={h.year} className="bars__col">
              <span className="bars__val">{h.count}</span>
              <span className="bars__bar" style={{ height: `${(h.count / max) * 70}px` }} />
              <span className="bars__year">{h.year}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="stat">
        <h2 className="stat__h">Hires by Division ({company.hires[company.hires.length - 1].year})</h2>
        <ul className="divs">
          {company.divisions.map((d) => (
            <li key={d.name}>
              <div className="divs__row">
                <span>{d.name}</span>
                <span className="divs__val">{d.value}</span>
              </div>
              <span className="divs__track">
                <span className="divs__fill" style={{ width: `${d.pct}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="stat">
        <h2 className="stat__h">Alum Experience</h2>
        {company.alumni.map((q, i) => (
          <blockquote key={i} className="quote">
            {q}
          </blockquote>
        ))}
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Select Resume bottom sheet — Figma 319:16728                     */
/* ---------------------------------------------------------------- */

function ResumeSheet({
  resumes,
  onClose,
  onApply,
  onOpenResume,
}: {
  resumes: string[]
  onClose: () => void
  onApply: (r: string) => void
  onOpenResume: () => void
}) {
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet-layer">
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <span className="sheet__grip" aria-hidden />
        <div className="sheet__head">
          <h2 id="sheet-title" className="sheet__title">
            Select Resume
          </h2>
          <button className="sheet__open" onClick={onOpenResume} aria-label="Open resumes">
            <ArrowUpRight color="var(--secondary-dark)" />
          </button>
        </div>
        <div className="resumes">
          {resumes.map((r) => (
            <button key={r} className={`resume-thumb${picked === r ? ' is-picked' : ''}`} aria-pressed={picked === r} onClick={() => setPicked(r)}>
              <span className="resume-thumb__page" aria-hidden>
                <i style={{ width: '45%' }} />
                <i style={{ width: '45%', marginTop: 14 }} />
                <i style={{ width: '82%' }} />
                <i style={{ width: '40%' }} />
                <i style={{ width: '82%', marginTop: 10 }} />
                <i style={{ width: '62%' }} />
              </span>
              <span className="resume-thumb__label">{r}</span>
            </button>
          ))}
        </div>
        <button className="btn-lg sheet__apply" disabled={!picked} onClick={() => picked && onApply(picked)}>
          Apply
        </button>
      </div>
    </div>
  )
}
