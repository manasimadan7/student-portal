import { useState } from 'react'
import { applications, jobs, type AppStatus } from '../data/data'
import { ArrowUpRight } from '../components/Icons'
import avatar from '../assets/images/avatar.png'
import wave from '../assets/images/header-wave.svg'
import groupIcon from '../assets/icons/group.svg'
import './Home.css'

type Filter = 'all' | AppStatus

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'reject', label: 'Reject' },
  { id: 'pending', label: 'Pending' },
]

/* Figma 319:16543 — Student dashboard.
   Laptop: quick links on the left, applied jobs in two columns, stats along the bottom. */
export default function Home() {
  const [filter, setFilter] = useState<Filter>('all')
  const rows = filter === 'all' ? applications : applications.filter((a) => a.status === filter)

  return (
    <main className="page home">
      <header className="home__header">
        <img className="home__wave" src={wave} alt="" />
        <h1 className="home__hi">Hi Srishti!</h1>
        <img className="home__avatar" src={avatar} alt="Srishti's profile" />
      </header>

      <div className="home__grid">
        <section className="home__applied" aria-labelledby="applied-title">
          <h2 id="applied-title" className="home__title">Companies applied</h2>

          <div className="status-chips" role="group" aria-label="Filter by status">
            {filters.map((f) => (
              <button
                key={f.id}
                className={`status-chip status-chip--${f.id}${filter === f.id ? ' is-active' : ''}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <ul className="applied">
            {rows.map((a) => (
              <li key={a.id} className="applied__card">
                <p className="applied__name">{a.company}</p>
                <p className="applied__cat">{a.category}</p>
                <span className="applied__date">
                  {a.date}
                  <span className={`applied__dot applied__dot--${a.status}`} title={a.status} />
                </span>
                <span className="applied__count" aria-label={`${a.applicants} applicants`}>
                  <img src={groupIcon} alt="" />
                  {a.applicants}
                </span>
              </li>
            ))}
            {rows.length === 0 && <li className="applied__empty">No companies here yet.</li>}
          </ul>
        </section>

        <nav className="home__links" aria-labelledby="links-title">
          <h2 id="links-title" className="home__title home__title--links">
            Quick links
          </h2>
          <div className="home__tiles">
            <a className="tile tile--sm" href="#blog">
              <span className="tile__arrow">
                <ArrowUpRight />
              </span>
              <span className="tile__label">Blog</span>
            </a>
            <a className="tile tile--lg" href="#calendar">
              <span className="tile__arrow">
                <ArrowUpRight />
              </span>
              <span className="tile__label">Calendar</span>
            </a>
          </div>
        </nav>

        <Stats />
      </div>
    </main>
  )
}

/* ---------------- Stats visuals ----------------
   Same visual language as the company Stats tab (319:16841): secondary-light bars on a
   tertiary-light track, primary-dark values. Status colours only ever appear with labels. */

const statusMeta: { id: AppStatus; label: string; color: string }[] = [
  { id: 'shortlisted', label: 'Shortlisted', color: 'var(--status-shortlisted)' },
  { id: 'pending', label: 'Pending', color: 'var(--status-pending)' },
  { id: 'reject', label: 'Rejected', color: 'var(--status-reject)' },
]

function Stats() {
  const total = applications.length
  const byStatus = statusMeta.map((s) => ({ ...s, count: applications.filter((a) => a.status === s.id).length }))
  const shortlisted = byStatus.find((s) => s.id === 'shortlisted')!.count
  const decided = shortlisted + byStatus.find((s) => s.id === 'reject')!.count

  const catCounts = Object.entries(
    applications.reduce<Record<string, number>>((acc, a) => ((acc[a.category] = (acc[a.category] ?? 0) + 1), acc), {}),
  ).sort((a, b) => b[1] - a[1])

  const crowd = [...applications].sort((a, b) => b.applicants - a.applicants)
  const maxCrowd = Math.max(...crowd.map((a) => a.applicants))
  const avgCrowd = Math.round(crowd.reduce((s, a) => s + a.applicants, 0) / crowd.length)

  return (
    <section className="home__stats" aria-labelledby="stats-title">
      <h2 id="stats-title" className="home__title">
        Your stats
      </h2>

      <div className="hstats">
        {/* Headline numbers */}
        <div className="hstat-tiles">
          <div className="hstat-tile">
            <span className="hstat-tile__num">{total}</span>
            <span className="hstat-tile__label">Applied</span>
          </div>
          <div className="hstat-tile">
            <span className="hstat-tile__num">{decided ? Math.round((shortlisted / decided) * 100) : 0}%</span>
            <span className="hstat-tile__label">Shortlist rate</span>
          </div>
          <div className="hstat-tile">
            <span className="hstat-tile__num">{jobs.length}</span>
            <span className="hstat-tile__label">Open roles</span>
          </div>
        </div>

        {/* Status breakdown — one segmented bar + labelled legend */}
        <div className="hstat-card">
          <h3 className="hstat-card__h">Application status</h3>
          <div className="seg-bar" role="img" aria-label={byStatus.map((s) => `${s.label} ${s.count}`).join(', ')}>
            {byStatus
              .filter((s) => s.count)
              .map((s) => (
                <span key={s.id} className="seg-bar__seg" style={{ flexGrow: s.count, background: s.color }} title={`${s.label}: ${s.count} of ${total}`} />
              ))}
          </div>
          <ul className="seg-legend">
            {byStatus.map((s) => (
              <li key={s.id}>
                <span className="seg-legend__key" style={{ background: s.color }} />
                {s.label}
                <b>{s.count}</b>
              </li>
            ))}
          </ul>
        </div>

        {/* By category */}
        <div className="hstat-card">
          <h3 className="hstat-card__h">Applications by category</h3>
          <ul className="hbars">
            {catCounts.map(([cat, n]) => (
              <li key={cat} title={`${cat}: ${n} of ${total}`}>
                <div className="hbars__row">
                  <span>{cat}</span>
                  <b>{n}</b>
                </div>
                <span className="hbars__track">
                  <span className="hbars__fill" style={{ width: `${(n / total) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Competition per company — column chart */}
        <div className="hstat-card hstat-card--wide">
          <h3 className="hstat-card__h">Applicants per role</h3>
          <p className="hstat-card__sub">Average {avgCrowd} students per role you applied to</p>
          <div className="cols" role="img" aria-label={crowd.map((a) => `${a.company} ${a.applicants}`).join(', ')}>
            {crowd.map((a) => (
              <div key={a.id} className="cols__col" title={`${a.company}: ${a.applicants} applicants`}>
                <span className="cols__val">{a.applicants}</span>
                <span className="cols__bar" style={{ height: `${(a.applicants / maxCrowd) * 72}px` }} />
                <span className="cols__name">{a.company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
