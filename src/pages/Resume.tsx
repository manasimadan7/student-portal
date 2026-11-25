import { useEffect, useRef, useState } from 'react'
import {
  checkProof,
  flaggedFiles,
  formatMsgTime,
  formatRange,
  openRequests,
  proofFilesOf,
  proofLabel,
  requiredProof,
  reviewLabel,
  type Entry,
  type EntryKind,
  type SavedResume,
  type Section,
} from '../data/resume'
import { useDevice } from '../device'
import type { ResumeDraft } from '../App'
import VisualResume from '../components/VisualResume'
import { Close } from '../components/Icons'
import viewModule from '../assets/icons/view-module.svg'
import viewSidebar from '../assets/icons/view-sidebar.svg'
import addSm from '../assets/icons/add-sm.svg'
import addLg from '../assets/icons/add-lg.svg'
import agentIcon from '../assets/icons/agent.svg'
import expandMore from '../assets/icons/expand-more.svg'
import uploadIcon from '../assets/icons/upload.svg'
import './Resume.css'

type View = 'list' | 'visual'

interface Props {
  draft: ResumeDraft
  setDraft: (fn: (d: ResumeDraft) => ResumeDraft) => void
  saved: SavedResume[]
  /** returns true when it overwrote a save with the same name */
  onSave: (name: string) => boolean
  onLoad: (id: string) => void
  /** Set by the feedback notification's View: opens the feedback list once */
  feedbackPing?: number
  onFeedbackShown?: () => void
}

/* Figma 366:20296 (pointer view), 469:3915 (visual view), 468:3837 (proof agent).
   Designed for desktop — laid out here for a phone column. */
export default function Resume({ draft, setDraft, saved, onSave, onLoad, feedbackPing = 0, onFeedbackShown }: Props) {
  const device = useDevice()
  const [view, setView] = useState<View>('list')
  const { sections, style } = draft
  const [active, setActive] = useState(sections[0]?.id ?? '')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const section = sections.find((s) => s.id === active) ?? sections[0]

  const setSections = (fn: (s: Section[]) => Section[]) => setDraft((d) => ({ ...d, sections: fn(d.sections) }))

  const updateEntry = (id: string, patch: Partial<Entry>) =>
    setSections((ss) => ss.map((s) => ({ ...s, entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) })))

  const addEntry = (e: Entry) => setSections((ss) => ss.map((s) => (s.id === section.id ? { ...s, entries: [...s.entries, e] } : s)))

  const addSection = (name: string) => {
    const id = `s-${Date.now()}`
    setDraft((d) => ({
      ...d,
      sections: [...d.sections, { id, name, entries: [] }],
      // new sections print before Skills/Education
      style: { ...d.style, order: [...d.style.order.filter((o) => o !== 'education' && o !== 'skills'), id, ...d.style.order.filter((o) => o === 'education' || o === 'skills')] },
    }))
    setActive(id)
  }

  const current = saved.find((s) => s.id === draft.savedId)

  // Jump from the feedback list to a pointer: switch tab, open its feedback, scroll to it.
  const [focusId, setFocusId] = useState<string | null>(null)
  const jumpTo = (sectionId: string, entryId: string) => {
    if (view === 'visual' && device === 'phone') setView('list') // phone preview has no pointer list
    setActive(sectionId)
    setFocusId(entryId)
    setTimeout(() => document.getElementById(`pointer-${entryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  useEffect(() => {
    if (!focusId) return
    const t = setTimeout(() => setFocusId(null), 2200) // highlight fades; the thread stays open
    return () => clearTimeout(t)
  }, [focusId])

  const pointers = (
    <>
      <SectionTabs sections={sections} active={section.id} onSelect={setActive} onAdd={addSection} />
      <EntryList key={section.id} section={section} onUpdate={updateEntry} onAdd={addEntry} focusId={focusId} onToast={setToast} />
    </>
  )

  return (
    <>
      <main className="page resume">
        <header className="rs-head">
          <h1 className="rs-head__title">Resume</h1>
          {/* Save resume + saved versions (newest first, right next to the button) */}
          <div className="rs-saves">
            <SaveButton
              current={current?.name}
              suggested={`Resume ${saved.length + 1}`}
              onSave={(name) => setToast(onSave(name) ? `Updated “${name}”` : `Saved as “${name}”`)}
            />
            {saved.length > 0 && (
              <div className="saved-row" role="group" aria-label="Saved resumes">
                {saved.map((s) => (
                  <button
                    key={s.id}
                    className={`saved-chip${s.id === draft.savedId ? ' is-active' : ''}`}
                    aria-pressed={s.id === draft.savedId}
                    title={s.savedAt ? `Saved ${new Date(s.savedAt).toLocaleString()}` : undefined}
                    onClick={() => {
                      onLoad(s.id)
                      setToast(`Opened “${s.name}”`)
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <FeedbackButton sections={sections} onJump={jumpTo} ping={feedbackPing} onPinged={onFeedbackShown} />
          <div className="view-toggle" role="group" aria-label="Resume view">
            <button className={view === 'list' ? 'is-active' : ''} aria-pressed={view === 'list'} aria-label="Pointer view" onClick={() => setView('list')}>
              <img src={viewModule} alt="" />
            </button>
            <button className={view === 'visual' ? 'is-active' : ''} aria-pressed={view === 'visual'} aria-label="Resume preview" onClick={() => setView('visual')}>
              <img src={viewSidebar} alt="" className="flip" />
            </button>
          </div>
        </header>

        {view === 'list' ? (
          pointers
        ) : device === 'laptop' ? (
          /* 469:3915 — pointers on the left, live preview on the right */
          <div className="rs-split">
            <div className="rs-split__left">{pointers}</div>
            <VisualResume sections={sections} style={style} onStyle={(fn) => setDraft((d) => ({ ...d, style: fn(d.style) }))} />
          </div>
        ) : (
          <VisualResume sections={sections} style={style} onStyle={(fn) => setDraft((d) => ({ ...d, style: fn(d.style) }))} />
        )}
      </main>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  )
}

/* ---------------- Save resume (top bar, 469:3962) — asks for a name ---------------- */

function SaveButton({ current, suggested, onSave }: { current?: string; suggested: string; onSave: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  const openPrompt = () => {
    setName(current ?? suggested)
    setOpen(true)
  }

  // Close when clicking elsewhere
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const updating = !!current && name.trim().toLowerCase() === current.toLowerCase()

  return (
    <div className="save-wrap" ref={wrapRef}>
      <button className="save-pill" aria-expanded={open} onClick={() => (open ? setOpen(false) : openPrompt())}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 3h9.5L20 7.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 3v5h7V3M8 21v-6h8v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <span>Save resume</span>
      </button>
      {open && (
        <form
          className="save-pop"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onSave(name.trim())
            setOpen(false)
          }}
        >
          <label htmlFor="save-name">Name this resume</label>
          <input
            id="save-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
            placeholder="e.g. Consulting"
            maxLength={40}
          />
          <p className="save-pop__hint">{updating ? 'This will update the existing save.' : 'Saved resumes appear at the top and in job applications.'}</p>
          <div className="save-pop__actions">
            <button type="button" className="text-btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="agent__btn agent__btn--primary" disabled={!name.trim()}>
              {updating ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/* ---------------- Section tabs: Work Experience / PORs / Projects / + ---------------- */

function SectionTabs({ sections, active, onSelect, onAdd }: { sections: Section[]; active: string; onSelect: (id: string) => void; onAdd: (name: string) => void }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const rowRef = useRef<HTMLDivElement>(null)

  // Keep the selected tab in view on narrow screens.
  useEffect(() => {
    rowRef.current?.querySelector('.is-active')?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
  }, [active])

  const submit = () => {
    if (name.trim()) onAdd(name.trim())
    setName('')
    setAdding(false)
  }

  return (
    <div className="rs-tabs">
      <div className="rs-tabs__row" ref={rowRef} role="tablist">
        {sections.map((s) => (
          <button key={s.id} role="tab" aria-selected={s.id === active} className={`rs-tab${s.id === active ? ' is-active' : ''}`} onClick={() => onSelect(s.id)}>
            {s.name}
            {s.entries.some((e) => e.review === 'changes') && <span className="rs-tab__dot" aria-label="has feedback to act on" />}
          </button>
        ))}
        {adding && (
          <input
            className="rs-tabs__input"
            autoFocus
            placeholder="Section name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
              if (e.key === 'Escape') setAdding(false)
            }}
            onBlur={submit}
          />
        )}
      </div>
      <button className="rs-tabs__add" aria-label="Add section" onClick={() => setAdding(true)}>
        <img src={addSm} alt="" />
      </button>
    </div>
  )
}

/* ---------------- Feedback: icon in the top bar → list of all feedback ---------------- */

function FeedbackButton({
  sections,
  onJump,
  ping = 0,
  onPinged,
}: {
  sections: Section[]
  onJump: (sectionId: string, entryId: string) => void
  ping?: number
  onPinged?: () => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // "View" on the feedback notification opens this list (once)
  useEffect(() => {
    if (!ping) return
    setOpen(true)
    onPinged?.()
  }, [ping, onPinged])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Pointers with any feedback; ones that need changes first, then newest message first.
  const items = sections
    .flatMap((s) => s.entries.map((e) => ({ e, section: s })))
    .filter(({ e }) => e.review !== 'approved' && (e.review === 'changes' || (e.feedback ?? []).some((m) => m.from === 'coordinator')))
    .map((x) => {
      const asks = x.e.review === 'changes' ? openRequests(x.e.feedback) : []
      const last = [...(x.e.feedback ?? [])].reverse().find((m) => m.from === 'coordinator')
      return { ...x, text: asks.length ? asks.map((m) => m.text).join(' ') : last?.text ?? '', at: last?.at ?? 0 }
    })
    .sort((a, b) => Number(b.e.review === 'changes') - Number(a.e.review === 'changes') || b.at - a.at)
  const pending = items.filter((i) => i.e.review === 'changes').length

  return (
    <div className="fb-wrap" ref={wrapRef}>
      <button
        className={`fb-btn${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-label={pending ? `Feedback, ${pending} pointer${pending > 1 ? 's need' : ' needs'} work` : 'Feedback'}
        onClick={() => setOpen(!open)}
      >
        <ChatIcon size={20} />
        {pending > 0 && <span className="fb-btn__badge">{pending}</span>}
      </button>
      {open && (
        <div className="fb-pop" role="dialog" aria-label="Feedback">
          <p className="fb-pop__title">Feedback</p>
          {items.length ? (
            <ul className="fb-list">
              {items.map(({ e, section, text, at }) => (
                <li key={e.id}>
                  <button
                    onClick={() => {
                      setOpen(false)
                      onJump(section.id, e.id)
                    }}
                  >
                    <span className="fb-item__top">
                      <b>{e.title}</b>
                      {e.review && <span className={`pc-status pc-status--${e.review}`}>{reviewLabel[e.review]}</span>}
                    </span>
                    <span className="fb-item__text">{text}</span>
                    <span className="fb-item__meta">
                      {section.name}
                      {at ? ` · ${formatMsgTime(at)}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="fb-pop__empty">No feedback yet. The coordinator's comments on your pointers will appear here.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------------- Pointer card: review status, feedback thread, edit & resubmit ---------------- */

function PointerCard({
  entry: e,
  focused,
  onUpdate,
  onAddProof,
  onReupload,
  onRemoveProof,
  onToast,
}: {
  entry: Entry
  focused: boolean
  onUpdate: (p: Partial<Entry>) => void
  onAddProof: () => void
  /** Replace the coordinator-flagged file (or add one when nothing is flagged) */
  onReupload: (target?: string) => void
  onRemoveProof: (file: string) => void
  onToast: (m: string) => void
}) {
  const msgs = e.feedback ?? []
  const needsWork = e.review === 'changes'
  const [showFeedback, setShowFeedback] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(e.title)
  const [desc, setDesc] = useState(e.description)
  // Approved pointers carry no coordinator comments on the card
  const hasFeedback = msgs.length > 0 && e.review !== 'approved'

  // Opened from the feedback list: show everything
  useEffect(() => {
    if (focused) setShowFeedback(true)
  }, [focused])

  const startEdit = () => {
    setTitle(e.title)
    setDesc(e.description)
    setEditing(true)
  }

  const resubmit = () => {
    const changed = title.trim() !== e.title || desc.trim() !== e.description
    if (!title.trim() || !desc.trim()) return
    if (changed) {
      onUpdate({
        title: title.trim(),
        description: desc.trim(),
        review: 'in-review',
        appealAt: undefined,
        feedback: [...msgs, { id: `m-${Date.now()}`, from: 'system', text: 'You edited this pointer and sent it back for review.', at: Date.now() }],
      })
      onToast(`“${title.trim()}” sent for review`)
    }
    setEditing(false)
  }

  const reReview = e.review === 'approved' || needsWork
  const flagged = needsWork ? flaggedFiles(e) : []
  // On a needs-work pointer with one flagged file, Proof replaces that file
  const replacing = needsWork && flagged.length === 1 ? flagged[0] : null
  const uploadProof = replacing ? () => onReupload(replacing) : onAddProof
  const proofTitle = replacing ? `Replace ${proofLabel(replacing)}` : 'Upload proof'
  const files = proofFilesOf(e)

  if (editing) {
    return (
      <article className={`rs-card pc${needsWork ? ' rs-card--work' : ''}`}>
        <div className="pc-edit">
          <input className="rs-form__title" aria-label="Organisation" value={title} onChange={(ev) => setTitle(ev.target.value)} autoFocus />
          <textarea className="rs-form__desc" aria-label="Pointer" rows={4} value={desc} onChange={(ev) => setDesc(ev.target.value)} />
          {needsWork && openRequests(msgs).length > 0 && (
            <div className="pc-edit__ref">
              <span>Coordinator asked:</span>
              <ul>
                {openRequests(msgs).map((m) => (
                  <li key={m.id}>{m.text}</li>
                ))}
              </ul>
            </div>
          )}
          {reReview && <p className="pc-edit__note">Saving sends this pointer back to the coordinator for review.</p>}
          <div className="rs-form__actions">
            <button className="text-btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button className="agent__btn agent__btn--primary" disabled={!title.trim() || !desc.trim()} onClick={resubmit}>
              {needsWork ? 'Resubmit for review' : 'Save'}
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={`rs-card pc pc--og${needsWork ? ' rs-card--work' : ''}${focused ? ' is-focused' : ''}`}>
      <div className="rs-card__head">
        <div className="pc-title">
          <h3 className="rs-card__title">{e.title}</h3>
          {(needsWork || e.review === 'approved') && <span className={`review-pill review-pill--${e.review}`}>{reviewLabel[e.review!]}</span>}
        </div>
        <span className="pc-og__right">
          {e.start && <span className="rs-card__date">{formatRange(e.start, e.end)}</span>}
          {hasFeedback && (
            <button
              className={`pc-fb${showFeedback ? ' is-open' : ''}${needsWork ? ' pc-fb--work' : ''}`}
              aria-expanded={showFeedback}
              aria-label="Feedback"
              title="Feedback"
              onClick={() => setShowFeedback(!showFeedback)}
            >
              <ChatIcon size={15} />
              {needsWork && !showFeedback && <span className="pc-icon__dot" aria-hidden />}
            </button>
          )}
          <button className="pc-icon pc-og__edit" aria-label={`Edit ${e.title}`} title="Edit" onClick={startEdit}>
            <EditIcon />
          </button>
        </span>
      </div>
      <p className="rs-card__desc">{e.description}</p>

      {/* Footer (user mock): no proof → link field + outlined Proof button on one row.
          Proof uploaded → link field, then the file chips, a dashed + and ✓ Submitted. */}
      {files.length === 0 ? (
        <div className="rs-card__foot">
          <span className="link-field" title={e.link}>
            <MailIcon />
            <span>{e.link}</span>
          </span>
          <button className={`proof${e.proof === 'checking' ? ' proof--checking' : ''}`} title={proofTitle} disabled={e.proof === 'checking'} onClick={uploadProof}>
            {e.proof === 'checking' ? <span className="proof__spin" aria-hidden /> : <img src={uploadIcon} alt="" />}
            {e.proof === 'checking' ? 'Checking' : 'Proof'}
          </button>
        </div>
      ) : (
        <div className="pc-og__foot">
          <span className="link-field" title={e.link}>
            <MailIcon />
            <span>{e.link}</span>
          </span>
          <ProofRow entry={e} onAdd={uploadProof} addTitle={proofTitle} onRemove={onRemoveProof} />
        </div>
      )}

      {/* Feedback — hidden until asked for; never on approved pointers */}
      {hasFeedback && showFeedback && (
        <div className="pc-more">
          {needsWork ? (
            <WorkThread entry={e} flagged={flagged} onUpdate={onUpdate} onToast={onToast} />
          ) : (
            <ol className="pc-thread__list">
              {msgs.map((m) => (
                <li key={m.id} className={`pc-msg pc-msg--${m.from}`}>
                  {m.from !== 'system' && <span className="pc-msg__who">{m.from === 'coordinator' ? 'Coordinator' : 'You'}</span>}
                  <p className="pc-msg__text">{m.text}</p>
                  <time className="pc-msg__time" dateTime={new Date(m.at).toISOString()}>
                    {formatMsgTime(m.at, true)}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </article>
  )
}

/* Needs-work conversation, shown from the Feedback toggle:
   coordinator notes · your messages · one way to respond (Appeal). Re-upload is the Proof button. */
function WorkThread({
  entry: e,
  flagged,
  onUpdate,
  onToast,
}: {
  entry: Entry
  flagged: string[]
  onUpdate: (p: Partial<Entry>) => void
  onToast: (m: string) => void
}) {
  const msgs = e.feedback ?? []
  const [appealing, setAppealing] = useState(false)
  const [reason, setReason] = useState('')
  const [attached, setAttached] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const firstReply = msgs.findIndex((m) => m.from !== 'coordinator')

  const sendAppeal = () => {
    const body = reason.trim()
    if (!body) return
    const now = Date.now()
    onUpdate({
      feedback: [...msgs, { id: `m-${now}`, from: 'student', kind: 'appeal', text: body, at: now, attachments: attached.length ? attached : undefined }],
      appealAt: now,
    })
    setReason('')
    setAttached([])
    setAppealing(false)
    onToast('Appeal sent to the coordinator')
  }

  const target = flagged.length === 1 ? proofLabel(flagged[0]) : null

  return (
    <div className="wt">
      <ol className="wt__list">
        {msgs.map((m, i) => (
          <li key={m.id} className={`wt-item wt-item--${m.from}`}>
            {i === firstReply && i > 0 && <hr className="wt__divider" />}
            {m.from === 'coordinator' ? (
              <div className="wt-note">
                <p className="wt-note__who">
                  <b>Coordinator</b>
                  {m.file && <span> · on {proofLabel(m.file)}</span>}
                </p>
                <p className="wt-note__text">{m.text}</p>
              </div>
            ) : m.from === 'student' ? (
              <div className="wt-bubble">
                <p className="wt-bubble__who">You{m.kind === 'appeal' ? ' · appeal' : ''}</p>
                <p className="wt-bubble__text">{m.text}</p>
                {m.attachments?.map((a) => (
                  <span key={a} className="proof-chip proof-chip--sm" title={a}>
                    <span className="proof-chip__name">{proofLabel(a)}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="wt-system">{m.text}</p>
            )}
          </li>
        ))}
      </ol>
      {e.appealAt && <p className="wt__status">Appeal sent · the coordinator re-checks within 24 h</p>}

      {/* Respond: Appeal (re-upload is the Proof button on the card) */}
      {!appealing ? (
        <div className="wt-pills">
          <button className="wt-pill wt-pill--appeal" onClick={() => setAppealing(true)} title="Your proof is right? Ask for a re-check">
            <AppealIcon />
            {e.appealAt ? 'Appeal again' : 'Appeal'}
          </button>
        </div>
      ) : (
        <form
          className="wt-appeal"
          onSubmit={(ev) => {
            ev.preventDefault()
            sendAppeal()
          }}
        >
          <label className="wt-appeal__label" htmlFor={`appeal-${e.id}`}>
            Appeal{target ? ` · ${target}` : ''}
          </label>
          <textarea
            id={`appeal-${e.id}`}
            className="wt-appeal__text"
            rows={3}
            autoFocus
            placeholder="Explain why your proof is correct, e.g. where the dates appear."
            value={reason}
            onChange={(ev) => setReason(ev.target.value)}
          />
          <div className="wt-appeal__files">
            {attached.map((a) => (
              <span key={a} className="proof-chip proof-chip--sm" title={a}>
                <span className="proof-chip__name">{proofLabel(a)}</span>
                <button type="button" className="proof-chip__x" aria-label={`Remove ${a}`} onClick={() => setAttached(attached.filter((x) => x !== a))}>
                  <Close size={12} />
                </button>
              </span>
            ))}
            <button type="button" className="wt-appeal__attach" onClick={() => fileRef.current?.click()}>
              <ClipIcon />
              Attach supporting file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.eml,.msg"
              hidden
              onChange={(ev) => {
                const f = ev.target.files?.[0]
                if (f && !attached.includes(f.name)) setAttached([...attached, f.name])
                ev.target.value = ''
              }}
            />
          </div>
          <div className="wt-appeal__actions">
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setAppealing(false)
                setReason('')
                setAttached([])
              }}
            >
              Cancel
            </button>
            <button type="submit" className="wt-btn wt-btn--appeal" disabled={!reason.trim()}>
              Send appeal
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

const AppealIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 3v18M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7Zm14 0-3 7a3.5 3.5 0 0 0 6 0l-3-7ZM8 21h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChatIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
)
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth="1.8" />
  </svg>
)

/* ---------------- Pointer (card) view ---------------- */

function EntryList({
  section,
  onUpdate,
  onAdd,
  focusId,
  onToast,
}: {
  section: Section
  onUpdate: (id: string, p: Partial<Entry>) => void
  onAdd: (e: Entry) => void
  focusId: string | null
  onToast: (m: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  // add → attach another document · replace → swap out `target` (agent-rejected or coordinator-flagged file)
  const [uploadFor, setUploadFor] = useState<{ id: string; mode: 'add' | 'replace'; target?: string; coordinator?: boolean } | null>(null)
  const [adding, setAdding] = useState(false)

  const pick = (id: string, mode: 'add' | 'replace' = 'add', target?: string, coordinator = false) => {
    setUploadFor({ id, mode, target, coordinator })
    fileRef.current?.click()
  }

  const onFile = (file: File | undefined) => {
    const entry = section.entries.find((e) => e.id === uploadFor?.id)
    if (fileRef.current) fileRef.current.value = ''
    if (!file || !entry || !uploadFor) return
    const current = proofFilesOf(entry)
    const target = uploadFor.target ?? entry.proofFile
    const files =
      uploadFor.mode === 'replace' && target && current.includes(target)
        ? current.map((f) => (f === target ? file.name : f))
        : [...current.filter((f) => f !== file.name), file.name]
    onUpdate(entry.id, { proof: 'checking', proofFile: file.name, proofFiles: files })
    // Simulated agent review of the new file → passes go straight to the coordinator
    setTimeout(() => {
      const ok = checkProof(entry.kind, file.name)
      if (ok && uploadFor.coordinator) {
        // Re-upload answers the coordinator's note → back to review
        onUpdate(entry.id, {
          proof: 'submitted',
          review: 'in-review',
          appealAt: undefined,
          feedback: [
            ...(entry.feedback ?? []),
            {
              id: `m-${Date.now()}`,
              from: 'system',
              text: target ? `You replaced ${proofLabel(target)} with ${proofLabel(file.name)} and sent it back for review.` : `You added ${proofLabel(file.name)} and sent it back for review.`,
              at: Date.now(),
            },
          ],
        })
        onToast(`“${entry.title}” sent back for review`)
      } else onUpdate(entry.id, { proof: ok ? 'submitted' : 'rejected' })
    }, 1600)
  }

  const removeFile = (entry: Entry, file: string) => {
    const files = proofFilesOf(entry).filter((f) => f !== file)
    const wasRejected = entry.proof === 'rejected' && entry.proofFile === file
    onUpdate(entry.id, {
      proofFiles: files,
      proof: files.length === 0 ? 'none' : wasRejected || entry.proof === 'verified' ? 'submitted' : entry.proof,
      proofFile: wasRejected ? undefined : entry.proofFile,
    })
  }

  return (
    <div className="rs-list">
      <input ref={fileRef} type="file" accept="image/*,.pdf,.eml,.msg" hidden onChange={(e) => onFile(e.target.files?.[0])} />

      {section.entries.map((e) => (
        <div key={e.id} className="rs-item" id={`pointer-${e.id}`}>
          <PointerCard
            entry={e}
            focused={focusId === e.id}
            onUpdate={(p) => onUpdate(e.id, p)}
            onAddProof={() => pick(e.id)}
            onReupload={(target) => pick(e.id, target ? 'replace' : 'add', target, true)}
            onRemoveProof={(f) => removeFile(e, f)}
            onToast={onToast}
          />
          {(e.proof === 'checking' || e.proof === 'rejected') && (
            <AgentCard
              entry={e}
              onReupload={() => pick(e.id, 'replace')}
              onSubmitAnyway={() => onUpdate(e.id, { proof: 'submitted' })}
            />
          )}
        </div>
      ))}

      {adding ? (
        <NewEntry section={section} onCancel={() => setAdding(false)} onSave={(e) => (onAdd(e), setAdding(false))} />
      ) : (
        <button className="rs-add" onClick={() => setAdding(true)} aria-label={`Add to ${section.name}`}>
          <img src={addLg} alt="" />
        </button>
      )}
    </div>
  )
}

/* Proof row: one chip per document (PDF | OFFER LETTER ×), then the state.
   Before review there are only two states: Uploaded / Not uploaded. Upload is the Proof button on the footer row. */
function ProofRow({
  entry,
  onAdd,
  addTitle = 'Add proof',
  onRemove,
}: {
  entry: Entry
  onAdd: () => void
  addTitle?: string
  onRemove: (file: string) => void
}) {
  const files = proofFilesOf(entry)
  const { proof } = entry
  const checking = proof === 'checking'
  const coordFlagged = entry.review === 'changes' ? flaggedFiles(entry) : []

  return (
    <div className="proof-row">
      {files.map((f) => {
        const flagged = proof === 'rejected' && f === entry.proofFile
        const noted = coordFlagged.includes(f)
        return (
          <span key={f} className={`proof-chip${flagged ? ' is-flagged' : ''}${noted ? ' is-noted' : ''}`} title={f}>
            <span className="proof-chip__name">{proofLabel(f)}</span>
            <button className="proof-chip__x" aria-label={`Remove ${f}`} disabled={checking} onClick={() => onRemove(f)}>
              <Close size={14} />
            </button>
          </span>
        )
      })}
      <button className="proof-add" title={addTitle} aria-label={addTitle} disabled={checking} onClick={onAdd}>
        <span aria-hidden>+</span>
      </button>
      {proof !== 'none' && (
        <span className={`proof-state proof-state--${proof}`} role="status">
          {(proof === 'submitted' || proof === 'verified') && <CheckIcon />}
          {checking && <span className="proof__spin" aria-hidden />}
          {{ checking: 'Checking', rejected: 'Needs other proof', submitted: 'Submitted', verified: 'Verified' }[proof]}
        </span>
      )}
    </div>
  )
}

const ClipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="m20 11.5-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* Agent popover (468:3879) — shown while checking and when the proof is wrong. */
function AgentCard({ entry, onReupload, onSubmitAnyway }: { entry: Entry; onReupload: () => void; onSubmitAnyway: () => void }) {
  const checking = entry.proof === 'checking'
  return (
    <aside className={`agent${checking ? ' agent--checking' : ''}`} aria-live="polite">
      <img className="agent__icon" src={agentIcon} alt="" />
      <div className="agent__body">
        {checking ? (
          <p>
            Checking <b>{entry.proofFile}</b>…
          </p>
        ) : (
          <>
            <p>
              Proof seems to be inadequate, try submitting the following for a <span className="agent__kind">{entry.kind}:</span>
            </p>
            <ul>
              {requiredProof[entry.kind].map((r) => (
                <li key={r.label}>{r.label}</li>
              ))}
            </ul>
            <p className="agent__file">You uploaded: {entry.proofFile}</p>
            <div className="agent__actions">
              <button className="agent__btn agent__btn--primary" onClick={onReupload}>
                Reupload
              </button>
              <button className="agent__btn" onClick={onSubmitAnyway}>
                Submit Anyway
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

const kinds: EntryKind[] = ['corporate internship', 'research internship', 'position of responsibility', 'project']

function NewEntry({ section, onCancel, onSave }: { section: Section; onCancel: () => void; onSave: (e: Entry) => void }) {
  const defaultKind: EntryKind = section.id === 'pors' ? 'position of responsibility' : section.id === 'projects' ? 'project' : 'corporate internship'
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<EntryKind>(defaultKind)
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [ongoing, setOngoing] = useState(false)
  const badRange = !!(start && end && !ongoing && end < start)
  const valid = title.trim() && description.trim() && !badRange

  return (
    /* Same anatomy as a pointer card (469:3922): grey card, white unstroked fields, pill footer. */
    <form
      className="rs-card rs-form"
      onSubmit={(ev) => {
        ev.preventDefault()
        if (!valid) return
        onSave({
          id: `e-${Date.now()}`,
          title: title.trim(),
          kind,
          description: description.trim(),
          link: link.trim() || '—',
          start: start || undefined,
          end: ongoing ? undefined : end || undefined,
          proof: 'none',
          review: 'in-review', // new pointers go to the coordinator
        })
      }}
    >
      <input className="rs-form__title" autoFocus placeholder="Organisation" aria-label="Organisation" value={title} onChange={(e) => setTitle(e.target.value)} />

      <div className="rs-form__row">
        <label className="pill-field pill-field--select">
          <span className="sr-only">Type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as EntryKind)}>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k[0].toUpperCase() + k.slice(1)}
              </option>
            ))}
          </select>
          <img src={expandMore} alt="" />
        </label>
      </div>

      <div className="rs-form__row">
        <label className="pill-field">
          <span>From</span>
          <input type="month" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className={`pill-field${ongoing ? ' is-disabled' : ''}`}>
          <span>To</span>
          <input type="month" value={ongoing ? '' : end} min={start || undefined} disabled={ongoing} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button type="button" className={`pill-chip${ongoing ? ' is-on' : ''}`} aria-pressed={ongoing} onClick={() => setOngoing(!ongoing)}>
          Present
        </button>
      </div>
      {badRange && <p className="rs-form__error">End date is before the start date.</p>}

      <textarea className="rs-form__desc" placeholder="What did you do?" aria-label="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="rs-card__foot">
        <label className="link-field link-field--input">
          <MailIcon />
          <span className="sr-only">Link</span>
          <input placeholder="team.company.com" value={link} onChange={(e) => setLink(e.target.value)} />
        </label>
      </div>

      <div className="rs-form__actions">
        <button type="button" className="text-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="agent__btn agent__btn--primary" disabled={!valid}>
          Save
        </button>
      </div>
    </form>
  )
}

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="link-field__icon">
    <path
      fill="currentColor"
      d="M20 8.5V18H4V8l8 5 4.2-2.6a4.5 4.5 0 0 1-1.1-1.6L12 10.8 4 6h10.1a4.5 4.5 0 0 1 .3-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7.9a4.4 4.4 0 0 1-2 .6Z"
    />
    <circle cx="19" cy="5" r="3" fill="currentColor" />
  </svg>
)

